import os
import google.generativeai as genai

api_key = os.environ.get('GEMINI_API_KEY')
if not api_key:
    print("No API Key")
else:
    genai.configure(api_key=api_key)
    print("Configured genai")
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Hello")
        print("SUCCESS")
        print(response.text)
    except Exception as e:
        print(f"FAILED: {e}")
