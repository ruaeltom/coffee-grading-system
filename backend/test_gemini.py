import google.generativeai as genai
import os
from dotenv import load_dotenv
import PIL.Image
import numpy as np

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("No API Key found")
    exit()

genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel('gemini-1.5-pro')
    # Create a dummy image
    img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    img = PIL.Image.fromarray(img_array)
    
    prompt = """
    Analyze this coffee fruit image. The initial classification is Fresh.
    Return ONLY a valid JSON object with keys: price_per_kg, drying_days, recommendation, min_price, max_price.
    """
    
    print("Sending request to Gemini...")
    response = model.generate_content([prompt, img])
    print("Response received.")
    print(f"Text: {response.text}")
    print("Success!")
except Exception as e:
    print(f"Error: {e}")
