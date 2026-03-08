import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image

# -------- SETTINGS --------
MODEL_PATH = "coffee_classifier_v2.h5"
IMG_PATH = "000026.jpg"   # <-- change this image if needed
IMG_SIZE = (224, 224)

CLASS_NAMES = ['Fresh', 'Fully_dried', 'Mixed', 'Partially_dried']
# --------------------------

# Load model
model = tf.keras.models.load_model(MODEL_PATH)

# Load and preprocess image
img = image.load_img(IMG_PATH, target_size=IMG_SIZE)
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0)
img_array = img_array / 255.0   # normalize

# Predict
predictions = model.predict(img_array)
predicted_class = CLASS_NAMES[np.argmax(predictions)]
confidence = np.max(predictions) * 100

print("Predicted class:", predicted_class)
print(f"Confidence: {confidence:.2f}%")
drying_and_price_info = {
    "Fresh": {
        "days": "15–25 days",
        "price": "₹60 per kg",
        "analysis": (
            "The coffee cherries contain very high moisture content and "
            "require long, steady drying. Rapid drying can lead to cracking "
            "and uneven fermentation."
        ),
        "recommendation": (
            "Dry under indirect sunlight for the first few days. "
            "Spread cherries in thin layers, turn them frequently, "
            "and avoid stacking. Gradually increase sun exposure."
        ),
        "vendor_note": "Not preferred by vendors due to high moisture."
    },

    "Mixed": {
        "days": "7–12 days",
        "price": "₹75 per kg",
        "analysis": (
            "The batch shows uneven drying where some cherries are dry "
            "while others still retain moisture. This inconsistency "
            "reduces overall quality."
        ),
        "recommendation": (
            "Manually sort cherries if possible. Continue steady drying "
            "with good airflow. Avoid intense sunlight and ensure uniform exposure."
        ),
        "vendor_note": "Low preference due to inconsistent drying."
    },

    "Partially_dried": {
        "days": "3–6 days",
        "price": "₹135 per kg",
        "analysis": (
            "The cherries are nearly dried but still contain residual moisture. "
            "Improper final drying may cause mold or storage issues."
        ),
        "recommendation": (
            "Continue drying under moderate sunlight. Reduce drying layer thickness "
            "and monitor daily to prevent over-drying."
        ),
        "vendor_note": "Moderately preferred; requires short additional drying."
    },

    "Fully_dried": {
        "days": "0–1 day",
        "price": "₹195 per kg",
        "analysis": (
            "The cherries have reached optimal moisture content suitable "
            "for storage and sale."
        ),
        "recommendation": (
            "Store in dry, ventilated conditions. Avoid moisture exposure "
            "and pack only after resting for 24 hours."
        ),
        "vendor_note": "Highly preferred by coffee vendors."
    }
}

info = drying_and_price_info[predicted_class]

print("\n--- Detailed Drying Assessment ---")
print("Drying stage:", predicted_class)
print("Remaining drying time:", info["days"])
print("\nDrying analysis:")
print(info["analysis"])
print("\nRecommended actions:")
print(info["recommendation"])
print("\nExpected market price:", info["price"])
print("Vendor preference:", info["vendor_note"])
