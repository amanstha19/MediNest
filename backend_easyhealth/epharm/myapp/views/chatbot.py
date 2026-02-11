"""
Health Chatbot API using Google Gemini AI
Provides safe health advice with medical disclaimers

Configuration:
- SDK: google-genai
- API Version: v1
- Model: gemini-2.5-flash
- Cost: FREE tier
"""

import os
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

logger = logging.getLogger(__name__)

# Try to import google.genai, handle if not available
try:
    import google.genai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google.genai not installed. Chatbot will use fallback responses.")


class HealthChatbotAPIView(APIView):
    """
    AI-powered health chatbot using Google Gemini.
    Provides general health information with safety disclaimers.
    
    Uses:
    - SDK: google-genai (v1)
    - Model: gemini-2.5-flash (free tier)
    - Method: generate_content()
    """


    # Safety-focused system prompt
    SYSTEM_PROMPT = """You are a helpful health assistant for MediNest pharmacy. Your role is to:

1. Provide general health information and educational content
2. Suggest when users should consult healthcare professionals
3. NEVER diagnose conditions or prescribe specific medications
4. ALWAYS include a disclaimer that you are not a substitute for professional medical advice
5. Be empathetic, clear, and concise in your responses
6. If asked about specific medications for symptoms, advise consulting a pharmacist or doctor
7. Encourage users to seek immediate medical attention for emergencies

Remember: Your goal is to guide users toward professional care, not replace it."""

    def __init__(self):
        super().__init__()
        self.client = None
        self.model_name = None
        if GEMINI_AVAILABLE:
            self._initialize_model()

    def _initialize_model(self):
        """Initialize Gemini model with API key using google-genai SDK (v1)"""
        api_key = getattr(settings, 'GEMINI_API_KEY', os.getenv('GEMINI_API_KEY', ''))

        if not api_key:
            logger.warning("Gemini API key not configured")
            return

        try:
            # Configure Gemini Client
            self.client = genai.Client(api_key=api_key)
            
            # Use gemini-2.5-flash - Current recommended free tier model (Feb 2026)
            self.model_name = 'gemini-2.5-flash'
            
            logger.info(f"Successfully initialized Gemini client: {self.model_name}")

        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            self.client = None

    def post(self, request, *args, **kwargs):
        """
        Handle chatbot conversation
        Expected JSON: {"message": "user message", "history": [{"role": "user/assistant", "content": "message"}]}
        """
        try:
            data = request.data
            user_message = data.get('message', '').strip()
            conversation_history = data.get('history', [])

            if not user_message:
                return Response({
                    'error': 'No message provided',
                    'response': 'Please provide a message to continue the conversation.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check for emergency keywords
            emergency_keywords = [
                'emergency', 'heart attack', 'stroke', 'unconscious',
                'not breathing', 'severe bleeding', 'suicide', 'overdose',
                'chest pain', "can't breathe", 'difficulty breathing'
            ]

            is_emergency = any(keyword in user_message.lower() for keyword in emergency_keywords)

            if is_emergency:
                return Response({
                    'response': 'EMERGENCY DETECTED\n\nIf you or someone else is experiencing a medical emergency, please:\n\n1. Call emergency services immediately (102 for ambulance in Nepal)\n2. Do not wait for online advice\n3. Go to the nearest hospital emergency room\n\nThis chatbot cannot help with emergencies. Please seek immediate professional medical attention.',
                    'is_emergency': True,
                    'disclaimer': 'Emergency detected - professional medical help required immediately.'
                }, status=status.HTTP_200_OK)

            # Try to generate response using Gemini, fallback to predefined responses
            if GEMINI_AVAILABLE and self.client is not None:
                response_text = self._generate_gemini_response(user_message)
            else:
                response_text = self._generate_fallback_response(user_message)

            # Add standard disclaimer if not present
            if "not a substitute" not in response_text.lower() and "consult" not in response_text.lower():
                response_text += "\n\nDisclaimer: This information is for educational purposes only and is not a substitute for professional medical advice. Please consult a qualified healthcare provider for personalized guidance."

            return Response({
                'response': response_text,
                'is_emergency': False,
                'disclaimer': 'This chatbot provides general health information only. Always consult healthcare professionals for medical advice.'
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Chatbot error: {e}")
            return Response({
                'error': 'Failed to process request',
                'response': 'I apologize, but I encountered an error. Please try again or contact our support team for assistance.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _generate_gemini_response(self, user_message):
        """Generate response using Google Gemini API"""
        try:
            # Create content with the system prompt and user message
            full_prompt = self.SYSTEM_PROMPT + "\n\nUser: " + user_message
            
            # Generate content using client.models.generate_content (v1 SDK)
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=full_prompt
            )
            
            # Handle response - v1 SDK response object has .text attribute directly on success
            if hasattr(response, 'text') and response.text:
                return response.text
                
            return self._generate_fallback_response(user_message)

        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return self._generate_fallback_response(user_message)

    def _generate_fallback_response(self, user_message):
        """Generate fallback response for health-related queries without Gemini"""
        message_lower = user_message.lower()

        # Common health topics with safe, general advice
        if any(word in message_lower for word in ['headache', 'head pain', 'migraine']):
            return """Headaches can have many causes including stress, dehydration, lack of sleep, or eye strain.

General suggestions:
- Drink plenty of water
- Rest in a quiet, dark room
- Apply a cold or warm compress
- Consider over-the-counter pain relievers if appropriate

When to see a doctor:
- Severe or sudden onset headache
- Headache with fever, stiff neck, or confusion
- Headache after head injury
- Persistent headaches that do not improve

Please consult a healthcare professional for proper diagnosis and treatment, especially if headaches are frequent or severe."""

        elif any(word in message_lower for word in ['fever', 'temperature', 'hot']):
            return """Fever is usually a sign that your body is fighting an infection.

General care:
- Rest and stay hydrated
- Wear light clothing
- Use a light blanket if you have chills
- Monitor your temperature

When to seek medical care:
- Temperature above 103F (39.4C)
- Fever lasting more than 3 days
- Fever with severe headache, rash, or difficulty breathing
- Fever in infants under 3 months

Please consult a healthcare professional to determine the underlying cause and appropriate treatment."""

        elif any(word in message_lower for word in ['cough', 'cold', 'flu', 'congestion']):
            return """Colds and flu are common respiratory infections.

Self-care tips:
- Get plenty of rest
- Drink fluids to stay hydrated
- Use a humidifier or steam inhalation
- Gargle with warm salt water for sore throat
- Over-the-counter medications may help symptoms

When to see a doctor:
- Difficulty breathing or shortness of breath
- Chest pain
- High fever lasting more than 3 days
- Symptoms lasting more than 10 days
- Severe symptoms in elderly or those with chronic conditions

Please consult a healthcare professional if symptoms are severe or persistent."""

        elif any(word in message_lower for word in ['stomach', 'nausea', 'vomiting', 'diarrhea', 'abdominal']):
            return """Stomach issues can be caused by various factors including infections, food intolerance, or stress.

General recommendations:
- Stay hydrated with small sips of water or oral rehydration solutions
- Eat bland foods (BRAT diet: bananas, rice, applesauce, toast)
- Avoid dairy, fatty, or spicy foods
- Rest your stomach

When to seek medical help:
- Severe or worsening abdominal pain
- Blood in vomit or stool
- Signs of dehydration (dry mouth, dizziness, decreased urination)
- Symptoms lasting more than 2 days
- High fever with stomach symptoms

Please consult a healthcare professional for proper evaluation and treatment."""

        elif any(word in message_lower for word in ['medicine', 'medication', 'drug', 'pill', 'tablet']):
            return """Regarding medications:

I cannot recommend specific medications for your condition as I do not have access to your medical history, current medications, or complete health information.

What you should do:
1. Consult a pharmacist - They can provide guidance on over-the-counter options
2. See a doctor - For prescription medications or if symptoms are serious
3. Read medication labels carefully - Follow dosage instructions
4. Check for interactions - If you are taking other medications

Important: Never self-diagnose or self-medicate without professional guidance. What works for one person may not be safe for another.

Please consult a healthcare professional or licensed pharmacist for medication recommendations."""

        elif any(word in message_lower for word in ['prescription', 'rx']):
            return """Prescription medications require evaluation by a licensed healthcare provider.

To obtain prescription medications:
1. Schedule a doctors appointment - In-person or telemedicine
2. Get a proper diagnosis - The doctor will determine if medication is needed
3. Visit a licensed pharmacy - With your valid prescription

Important notes:
- Never use someone elses prescription
- Do not purchase prescription medications from unverified sources
- Follow the prescribed dosage exactly
- Complete the full course of antibiotics if prescribed

This chatbot cannot provide prescriptions. Please consult a licensed healthcare provider for prescription needs."""

        elif any(word in message_lower for word in ['nose', 'bleeding', 'nosebleed', 'epistaxis']):
            return """Nosebleeds (Epistaxis) are common and usually not serious.

Immediate steps:
- Sit upright and lean forward slightly
- Pinch the soft part of your nose just below the bridge
- Breathe through your mouth
- Apply pressure for 10-15 minutes without checking

Prevention tips:
- Keep nasal passages moist with saline spray
- Use a humidifier in dry environments
- Avoid picking your nose
- Apply petroleum jelly to the inside of nostrils

When to seek medical attention:
- Bleeding lasts more than 20 minutes
- Frequent nosebleeds
- Nosebleeds after head injury
- Signs of excessive blood loss (dizziness, weakness)
- If you are taking blood thinners

Please consult a healthcare professional if nosebleeds are frequent or severe."""

        elif any(word in message_lower for word in ['throat', 'sore throat', 'swallowing']):
            return """Sore throat can be caused by infections, allergies, or irritants.

Home care:
- Drink warm fluids (tea with honey, broth)
- Gargle with warm salt water (1/2 tsp salt in 8 oz water)
- Use throat lozenges or sprays
- Rest your voice
- Use a humidifier

When to see a doctor:
- Sore throat lasting more than a week
- Difficulty swallowing or breathing
- High fever (>101F)
- Rash or joint pain
- Pus on tonsils
- Recurrent sore throats

Please consult a healthcare professional for proper diagnosis and treatment."""

        elif any(word in message_lower for word in ['back', 'back pain', 'lower back']):
            return """Back pain is very common and usually improves with time.

Self-care measures:
- Stay active and avoid bed rest
- Apply ice for first 48 hours, then heat
- Take over-the-counter pain relievers if needed
- Maintain good posture
- Sleep on a supportive mattress

When to seek medical care:
- Pain that does not improve after 1-2 weeks
- Severe pain that prevents normal activities
- Pain accompanied by numbness, weakness, or tingling
- Pain after injury or trauma
- Pain with fever, unexplained weight loss, or bladder/bowel problems

Please consult a healthcare professional for persistent or severe back pain."""

        elif any(word in message_lower for word in ['allergy', 'allergies', 'allergic', 'sneezing', 'itchy']):
            return """Allergies occur when your immune system reacts to substances like pollen, dust, or pet dander.

Common allergy symptoms:
- Sneezing, runny nose
- Itchy eyes, nose, or throat
- Coughing, wheezing
- Skin rashes or hives

Management tips:
- Avoid known triggers when possible
- Keep windows closed during high pollen seasons
- Use air purifiers and wash bedding regularly
- Shower and change clothes after being outdoors

When to see a doctor:
- Symptoms are severe or persistent
- Over-the-counter medications do not help
- You suspect a serious allergic reaction (anaphylaxis)
- Allergies interfere with daily activities

Please consult a healthcare professional for allergy testing and treatment options."""

        elif any(word in message_lower for word in ['constipation', 'bowel', 'movement']):
            return """Constipation is when you have infrequent or difficult bowel movements.

Lifestyle changes:
- Increase fiber intake (fruits, vegetables, whole grains)
- Drink plenty of water (8-10 glasses daily)
- Exercise regularly
- Do not ignore the urge to go
- Establish a regular bathroom routine

When to seek medical help:
- Constipation lasting more than 3 weeks
- Blood in stool
- Severe abdominal pain
- Unexplained weight loss
- Alternating constipation and diarrhea

Please consult a healthcare professional if constipation is chronic or concerning."""

        elif any(word in message_lower for word in ['sleep', 'insomnia', 'insomniac', "can't sleep"]):
            return """Sleep difficulties can affect your health and daily functioning.

Sleep hygiene tips:
- Maintain a consistent sleep schedule
- Create a relaxing bedtime routine
- Keep your bedroom cool, dark, and quiet
- Avoid screens 1 hour before bed
- Limit caffeine and heavy meals in the evening
- Exercise regularly, but not too close to bedtime

When to see a doctor:
- Insomnia lasting more than a month
- Daytime sleepiness affecting your life
- Sleep problems accompanied by other symptoms
- Suspected sleep disorders (sleep apnea, etc.)

Please consult a healthcare professional for persistent sleep problems."""

        elif any(word in message_lower for word in ['stress', 'anxiety', 'anxious', 'worried', 'stressed']):
            return """Stress and anxiety are common but manageable conditions.

Coping strategies:
- Practice deep breathing exercises
- Regular physical activity
- Maintain a healthy diet
- Get adequate sleep
- Connect with friends and family
- Try relaxation techniques (meditation, yoga)

When to seek help:
- Anxiety interferes with daily activities
- Physical symptoms (rapid heartbeat, sweating, trembling)
- Panic attacks
- Thoughts of self-harm
- Symptoms lasting more than 2 weeks

Please consult a healthcare professional for proper evaluation and treatment."""

        elif any(word in message_lower for word in ['ear', 'earache', 'ear pain', 'hearing']):
            return """Ear problems can range from minor infections to more serious conditions.

Common ear issues:
- Ear infections: Often cause pain, fever, and hearing changes
- Wax buildup: Can cause temporary hearing loss
- Eustachian tube dysfunction: Pressure and popping sensations

General care:
- Keep ears dry
- Avoid inserting objects into ears
- Use earplugs for swimming
- Manage allergies that may affect ears

When to see a doctor:
- Severe pain or high fever
- Hearing loss or ringing in ears
- Discharge from ear
- Dizziness or balance problems
- Pain after head injury

Please consult a healthcare professional for ear problems requiring medical attention."""

        elif any(word in message_lower for word in ['eye', 'eyes', 'vision', 'sight', 'red eyes']):
            return """Eye problems require prompt attention to protect your vision.

Common eye concerns:
- Red eyes: Could be allergies, infection, or dryness
- Eye strain: From screens or reading
- Dry eyes: Common with age or certain medications
- Styes: Painful bumps on eyelids

Eye care tips:
- Take regular breaks when using screens (20-20-20 rule)
- Wear sunglasses outdoors
- Use artificial tears for dry eyes
- Clean eyelids gently with warm water

When to see an eye doctor:
- Sudden vision changes
- Eye pain or severe headache
- Flashing lights or floaters
- Double vision
- Red eyes with discharge or pain

Please consult an eye care professional for vision problems and eye health."""

        else:
            return f"""Thank you for your question about "{user_message}".

I am here to provide general health information, but I am not able to give specific medical advice or diagnoses.

For your concern, I recommend:

1. Consult a healthcare professional - A doctor can properly evaluate your symptoms and provide personalized treatment
2. Visit our pharmacy - Our licensed pharmacists can answer medication questions
3. Use our search feature - Browse available products on our website

General health tips:
- Maintain a balanced diet and regular exercise
- Get adequate sleep (7-9 hours for adults)
- Stay hydrated
- Manage stress through relaxation techniques

Disclaimer: This information is for educational purposes only and is not a substitute for professional medical advice. Please consult a qualified healthcare provider for personalized guidance regarding your specific health concerns."""

    def get(self, request, *args, **kwargs):
        """Get chatbot status and information"""
        return Response({
            'status': 'active',
            'name': 'MediNest Health Assistant',
            'description': 'AI-powered health information chatbot with safety disclaimers',
            'capabilities': [
                'General health information',
                'When to seek medical care guidance',
                'Medication safety information',
                'Health education'
            ],
            'limitations': [
                'Cannot diagnose medical conditions',
                'Cannot prescribe medications',
                'Not a substitute for professional medical advice',
                'Cannot handle medical emergencies'
            ],
            'emergency_contact': {
                'ambulance': '102',
                'police': '100',
                'fire': '101'
            },
            'gemini_available': GEMINI_AVAILABLE and self.client is not None
        }, status=status.HTTP_200_OK)

