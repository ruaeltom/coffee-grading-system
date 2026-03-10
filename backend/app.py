
import base64
import cv2
import numpy as np

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
import sqlite3
from datetime import datetime

load_dotenv()
GEMINI_AVAILABLE = False
if os.getenv("GEMINI_API_KEY"):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    GEMINI_AVAILABLE = True
    print("DEBUG: GEMINI_API_KEY found. GEMINI_AVAILABLE = True")
else:
    print("DEBUG: GEMINI_API_KEY NOT found. GEMINI_AVAILABLE = False")

def apply_clahe(image):
    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    l_clahe = clahe.apply(l)

    lab = cv2.merge((l_clahe, a, b))
    return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

def get_db_connection():
    conn = sqlite3.connect('coffee_history.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            class_name TEXT NOT NULL,
            price_per_kg REAL,
            drying_days TEXT,
            recommendation TEXT,
            grade TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Path to the React build folder (relative to this file)
REACT_BUILD_DIR = os.path.join(os.path.dirname(__file__), '..', 'mini-project', 'build')

app = Flask(__name__, static_folder=REACT_BUILD_DIR, static_url_path='/')
CORS(app)

# Serve React static files (JS, CSS, images, etc.)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    # If a real file exists in the build folder, serve it
    if path and os.path.exists(os.path.join(REACT_BUILD_DIR, path)):
        return send_from_directory(REACT_BUILD_DIR, path)
    # Otherwise serve index.html (React handles routing)
    return send_from_directory(REACT_BUILD_DIR, 'index.html')

# Load model
model = tf.keras.models.load_model("coffee_classifier_v2.h5")

CLASS_NAMES = ["Fresh", "Fully_dried", "Mixed", "Partially_dried"]

PRICE_MAP = {
    "Fresh": 60,
    "Mixed": 75,
    "Partially_dried": 135,
    "Fully_dried": 195
}

DRYING_INFO = {
    "Fresh": {
        "days": "15–25 days",
        "tips": """**Detailed Drying Recommendation for Fresh Coffee Cherry:**

- **Coffee Species**: Likely Arabica or Robusta, depending on the region (e.g., Wayanad/Coorg). At this stage, the fruit is high in moisture (~65%).
- **Current Stage Uses**: The fruit cannot be hulled or stored yet. It must be dried to produce "Cherry Coffee" or processed into parchment.
- **Target Appearance**: The fruit must turn **dark brown/black** and become hard. This indicates moisture content has dropped to safe levels (10-12%), preventing mold and ensuring long-term stability.
- **Drying Instructions**:
  1. Spread the fresh cherries on raised beds or clean drying patios in a thin layer (3-5 cm).
  2. Stir/turn the cherries every 2-3 hours to ensure even drying and prevent fermentation.
  3. Cover the cherries at night or during rain to avoid re-wetting.
  4. Continue this process daily until the fruit rattles when shaken.
- **Duration**: approximately 15–25 days depending on sunlight intensity."""
    },
    "Mixed": {
        "days": "7–12 days",
        "tips": """**Detailed Drying Recommendation for Mixed Batch:**

- **Coffee Species**: Likely a mix of Arabica/Robusta. This batch contains cherries at various stages of drying (fresh to partially dried).
- **Current Stage Uses**: Not ready for processing. The uneven moisture content poses a risk of spoilage for the drier beans if mixed with wetter ones.
- **Target Appearance**: The entire batch needs to achieve a uniform **dark, shriveled appearance**. Uniformity is key for consistent flavor and price.
- **Drying Instructions**:
  1. **Sort the cherries**: If possible, separate the fresh red/green fruits from the darker, drier ones to dry them separately.
  2. If separation isn't possible, spread the layer thinner than usual to allow maximum airflow.
  3. Turn the cherries frequently (every 1-2 hours) to expose wetter fruits to the sun.
  4. Monitor closely for soft/moldy cherries and remove them immediately.
- **Duration**: approximately 7–12 days to equilibrate moisture."""
    },
    "Partially_dried": {
        "days": "3–6 days",
        "tips": """**Detailed Drying Recommendation for Partially Dried:**

- **Coffee Species**: Arabica/Robusta. The fruit has lost significant moisture but is not yet shelf-stable (moisture ~20-30%).
- **Current Stage Uses**: Approaching the "dry cherry" stage but still too soft for hulling. Hulling now would smash the beans ("wet hulling" risk).
- **Target Appearance**: Needs to darken further and become brittle. The skin should not be soft to the touch.
- **Drying Instructions**:
  1. Continue sun drying on patios or tarps. You can slightly increase the layer thickness as moisture is lower.
  2. Focus on the "bite test" or "rattle test": The bean inside should be hard, not rubbery.
  3. Ensure protection from dew at night, as partially dried beans re-absorb moisture easily.
  4. Give it a few more days of strong sun.
- **Duration**: approximately 3–6 days."""
    },
    "Fully_dried": {
        "days": "0–1 day",
        "tips": """**Detailed Drying Recommendation for Fully Dried:**

- **Coffee Species**: Arabica/Robusta dry cherry.
- **Current Stage Uses**: Ready for sale, storage, or hulling. This is the "Dry Cherry" or "Kuruva" stage.
- **Target Appearance**: **Black/Dark Brown**, hard, and wrinkled. The seed inside should be loose (rattles).
- **Drying Instructions**:
  1. No further drying is required for processing.
  2. If the beans feel slightly cool or damp (from humidity), give them 1 final day of sun to "polish" the drying.
  3. Store immediately in clean, dry jute or GrainPro bags.
  4. Keep bags raised off the floor (on pallets) and away from walls to prevent moisture uptake.
- **Duration**: 0–1 day (Maintenance only)."""
    }
}


def is_likely_coffee(image_np):
    """
    Lightweight sanity check — only rejects images that are OBVIOUSLY not coffee.
    Coffee cherries at ALL drying stages (fresh red, medium brown, dark dried) are ACCEPTED.
    Heavy validation is handled by Gemini AI.
    
    Rejects:
    - Mostly blue images (screenshots, sky, ocean, text documents)
    - Extremely bright/white images (blank pages, white backgrounds)
    - Highly uniform single-color images (solid backgrounds, graphics)
    """
    hsv = cv2.cvtColor(image_np, cv2.COLOR_RGB2HSV).astype(np.float32)
    h, s, v = hsv[:,:,0], hsv[:,:,1], hsv[:,:,2]
    total_pixels = image_np.shape[0] * image_np.shape[1]

    # ── REJECT: Mostly BLUE image (screenshots, sky, documents) ──────
    # Blue hue in OpenCV HSV: h approximately 100-130
    blue_mask = (h >= 95) & (h <= 135) & (s > 60) & (v > 60)
    blue_ratio = np.sum(blue_mask) / total_pixels
    print(f"DEBUG: Blue pixel ratio: {blue_ratio:.2f}")
    if blue_ratio > 0.40:
        print("DEBUG: REJECTED — image is mostly blue (screenshot/document/sky).")
        return False

    # ── REJECT: Mostly BRIGHT WHITE image ────────────────────────────
    white_mask = (v > 220) & (s < 40)
    white_ratio = np.sum(white_mask) / total_pixels
    print(f"DEBUG: White pixel ratio: {white_ratio:.2f}")
    if white_ratio > 0.60:
        print("DEBUG: REJECTED — image is mostly white (blank page/white background).")
        return False

    # ── REJECT: Highly uniform image (solid color graphic / screenshot)
    # Real coffee images have high variance in hue and value
    v_std = float(np.std(v))
    s_std = float(np.std(s))
    print(f"DEBUG: Value std={v_std:.1f}, Sat std={s_std:.1f}")
    if v_std < 15 and s_std < 10:
        print("DEBUG: REJECTED — image is too uniform (solid color graphic).")
        return False

    # Everything else: ACCEPT and let Gemini do proper validation
    print("DEBUG: Local pre-check PASSED — forwarding to Gemini for validation.")
    return True


def preprocess_image(image_bytes):
    original_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    original_img = original_img.resize((224, 224))
    original_np = np.array(original_img)

    # Apply CLAHE
    clahe_np = apply_clahe(original_np.copy())

    # Prepare for model
    input_img = clahe_np / 255.0
    input_img = np.expand_dims(input_img, axis=0)

    return input_img, original_np, clahe_np

def encode_image(img_array):
    _, buffer = cv2.imencode('.jpg', cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR))
    return base64.b64encode(buffer).decode('utf-8')

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    image_bytes = file.read()

    # Preprocess with CLAHE
    img, original_np, clahe_np = preprocess_image(image_bytes)

    # --- LOCAL PRE-CHECK (fast, before CNN & Gemini) ---
    if not is_likely_coffee(original_np):
        print("DEBUG: Local color pre-check REJECTED the image immediately.")
        return jsonify({"error": "Sorry, wrong image! Please upload a photo of coffee fruits or cherries."}), 400
    print("DEBUG: Local color pre-check PASSED.")

    # --- Run Local Classification Model ---
    prediction = model.predict(img)
    class_index = np.argmax(prediction)
    # label is ALWAYS derived from the CNN model. Gemini must NOT override this.
    label = CLASS_NAMES[class_index]
    print(f"DEBUG: CNN classified image as: '{label}'")

    # Grade is ALWAYS derived from the CNN label — this mapping is fixed
    grade_map = {
        "Fully_dried": "A",
        "Partially_dried": "B",
        "Mixed": "C",
        "Fresh": "D"
    }
    grade = grade_map.get(label, "D")

    # Set Default Values (Dataset)
    price_per_kg = PRICE_MAP[label]
    drying_days = DRYING_INFO[label]["days"]
    recommendation = DRYING_INFO[label]["tips"]
    min_price = 60
    max_price = 180

    # --- OPTIMIZED GEMINI CALL (1 Call instead of 2) ---
    if GEMINI_AVAILABLE:
        print("DEBUG: Attempting Gemini Validation & Analysis (Combined)...")
        try:
            gemini_model = genai.GenerativeModel('gemini-1.5-flash')
            pil_image = Image.fromarray(original_np)
            
            combined_prompt = f"""
            Task: Validate and enrich data for a coffee fruit grading application.
            
            CRITICAL RULE: DO NOT reclassify the image. The CNN model has already determined 
            the classification as '{label}'. You must accept this as final.
            
            Step 1: VALIDATION ONLY
            - Check if this image clearly shows coffee fruits, coffee cherries, or coffee beans.
            - Reject EVERYTHING else: people, animals, objects, food, screenshots, documents, landscapes, etc.
            - When in doubt, mark as INVALID.
            - IMPORTANT: Even if the cherries appear fresh/ripe/dried to you, do NOT change the 
              CNN's classification of '{label}'. Only validate it IS a coffee image.
            
            Step 2: ENRICHMENT (Only if Valid Coffee Image)
            - The CNN model has classified this as '{label}'. ACCEPT this as the final classification.
            - Provide price and recommendation SPECIFIC to the '{label}' stage:
              - Fresh = low price (~60/kg), needs 15-25 days drying
              - Mixed = medium-low price (~75/kg), needs 7-12 days more
              - Partially_dried = medium-high price (~135/kg), needs 3-6 more days
              - Fully_dried = premium price (~195/kg), ready for market
            
            Return ONLY a JSON object, no extra text:
            If INVALID (not a coffee image): 
            {{ "is_coffee": false }}
            
            If VALID (is a coffee image):
            {{
                "is_coffee": true,
                "price_per_kg": <number matching '{label}' stage>,
                "drying_days": "<string matching '{label}' stage>",
                "recommendation": "<detailed step-by-step guide for '{label}' stage>",
                "min_price": <number>,
                "max_price": <number>
            }}
            """
            
            gemini_response = gemini_model.generate_content([combined_prompt, pil_image])
            
            # Clean response
            text = gemini_response.text.replace('```json', '').replace('```', '').strip()
            if '{' in text:
                text = text[text.find('{'):text.rfind('}')+1]
            
            data = json.loads(text)
            
            # Gemini explicitly said NOT coffee — reject with friendly message
            if not data.get("is_coffee", True):
                print("Gemini rejected the image.")
                return jsonify({"error": "Sorry, wrong image! Please upload a photo of coffee fruits or cherries."}), 400
            
            # Update values if valid
            price_per_kg = data.get("price_per_kg", price_per_kg)
            drying_days = data.get("drying_days", drying_days)
            recommendation = data.get("recommendation", recommendation)
            min_price = data.get("min_price", min_price)
            max_price = data.get("max_price", max_price)
            
        except Exception as e:
            # Gemini API failed (quota/network) — DO NOT silently fall through.
            # Run local color check as safety net before allowing the result.
            print(f"Gemini API Error: {e}")
            if not is_likely_coffee(original_np):
                print("Local color check REJECTED the image (Gemini was unavailable).")
                return jsonify({"error": "Sorry, wrong image! Please upload a photo of coffee fruits or cherries."}), 400
            print("Local color check passed — proceeding with CNN result as fallback.")

    try:
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO history (timestamp, class_name, price_per_kg, drying_days, recommendation, grade)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), label, price_per_kg, drying_days, recommendation, grade))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Database Error: {e}")

    response = {
        "class": label,       # ALWAYS the CNN model's classification
        "grade": grade,        # ALWAYS derived from CNN label: Fresh=D, Mixed=C, Partially_dried=B, Fully_dried=A
        "price_per_kg": price_per_kg,
        "drying_days": drying_days,
        "recommendation": recommendation,
        "min_price": min_price,
        "max_price": max_price,
        "original_image": encode_image(original_np),
        "clahe_image": encode_image(clahe_np)
    }
    print(f"DEBUG: Final response -> class='{label}', grade='{grade}', price={price_per_kg}")

    return jsonify(response)

@app.route("/history", methods=["GET"])
def get_history():
    try:
        conn = get_db_connection()
        history = conn.execute('SELECT * FROM history ORDER BY id DESC').fetchall()
        conn.close()
        
        history_list = [dict(row) for row in history]
        return jsonify(history_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000)

