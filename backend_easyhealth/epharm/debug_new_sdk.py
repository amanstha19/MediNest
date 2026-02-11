import os
import sys

print(f"Python version: {sys.version}")

try:
    import google.genai as genai
    print("Successfully imported google.genai")
    try:
        print(f"Version: {genai.__version__}")
    except AttributeError:
        print("Version attribute not found")
        
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        print("ERROR: GEMINI_API_KEY not found in environment")
    else:
        print(f"API Key present (starts with {api_key[:4]}...)")
        
        try:
            client = genai.Client(api_key=api_key)
            print("Client initialized")
            
            print("\nAttempting to generate content with gemini-1.5-flash...")
            try:
                # v1 SDK syntax
                response = client.models.generate_content(
                    model='gemini-1.5-flash',
                    contents='Hello'
                )
                print("SUCCESS!")
                if hasattr(response, 'text'):
                    print(response.text)
                else:
                    print(response)
            except Exception as e:
                print(f"FAILED: {e}")

        except Exception as e:
            print(f"Client initialization failed: {e}")

except ImportError:
    print("Failed to import google.genai")
