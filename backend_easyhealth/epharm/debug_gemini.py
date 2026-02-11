import os
import sys

print(f"Python version: {sys.version}")

try:
    import google.genai as genai
    print("Successfully imported google.genai")
    print(f"google.genai location: {os.path.dirname(genai.__file__)}")
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
            
            # Try to list models if possible, or just generate
            # The new SDK might not have a simple list_models on the client root, let's check correct usage
            # But let's try to generate with the model
            
            print("\nAttempting to generate content with gemini-1.5-flash...")
            try:
                response = client.models.generate_content(
                    model='gemini-1.5-flash',
                    contents='Hello, are you working?'
                )
                print("SUCCESS! Response:")
                print(response.text if hasattr(response, 'text') else response)
            except Exception as e:
                print(f"GeneratContent FAILED: {e}")
                
            print("\nAttempting to generate content with gemini-2.0-flash-exp (just to check)...")
            try:
                response = client.models.generate_content(
                    model='gemini-2.0-flash-exp',
                    contents='Hello'
                )
                print("gemini-2.0-flash-exp SUCCESS")
            except Exception as e:
                print(f"gemini-2.0-flash-exp FAILED: {e}")

        except Exception as e:
            print(f"Client initialization failed: {e}")

except ImportError:
    print("Failed to import google.genai")

print("\nChecking google.generativeai (old SDK)...")
try:
    import google.generativeai as old_genai
    print(f"google.generativeai version: {old_genai.__version__}")
except ImportError:
    print("google.generativeai not installed")
