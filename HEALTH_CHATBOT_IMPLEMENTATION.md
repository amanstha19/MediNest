# Health Chatbot Implementation

## Overview
Replaced the AI-powered medicine search with a **safe health chatbot** using Google Gemini API (free tier). The chatbot provides general health information with strict safety guidelines, while the search functionality has been simplified to basic text matching without AI enhancements.

## Why This Change?

### Problem with Previous AI Search
The previous AI search implementation allowed users to:
- Search by symptoms (e.g., "medicine for headache")
- Get AI-enhanced product recommendations
- Potentially self-diagnose and self-medicate

This is **medically unsafe** as it could lead to:
- Incorrect self-diagnosis
- Wrong medication choices
- Delayed professional care
- Serious health risks

### New Safe Approach

#### 1. **Health Chatbot (AI-Powered)**
- Uses Google Gemini 1.5 Flash API (free tier)
- Provides **general health information only**
- **Never diagnoses or prescribes**
- Always includes medical disclaimers
- Detects emergencies and urges immediate professional care
- Recommends consulting healthcare professionals

#### 2. **Simplified Search (Non-AI)**
- Basic text matching for medicine names
- No symptom-to-medicine mapping
- No AI-enhanced recommendations
- Users must know the medicine name they're looking for
- Prevents accidental health advice through search

## Files Created/Modified

### New Files:
1. `backend_easyhealth/epharm/myapp/views/chatbot.py` - Health chatbot API with Gemini integration
2. `frontend_easyhealth/src/components/ui/ChatbotModal.jsx` - Chatbot UI component
3. `frontend_easyhealth/src/components/ui/ChatbotModal.css` - Chatbot styles
4. `frontend_easyhealth/src/components/ui/SimpleSearchModal.jsx` - Simplified search (no AI)

### Modified Files:
1. `backend_easyhealth/requirements.txt` - Added `google-generativeai==0.8.3`
2. `backend_easyhealth/epharm/myapp/urls.py` - Added chatbot endpoint
3. `frontend_easyhealth/src/components/screens/HomeScreen.jsx` - Integrated chatbot and simple search

## Technical Details

### Backend (Django)
```python
# HealthChatbotAPIView features:
- Emergency keyword detection (chest pain, can't breathe, etc.)
- Google Gemini 1.5 Flash integration
- Safety-first SYSTEM_PROMPT
- Fallback responses when AI unavailable
- Rate limiting ready
```

### Frontend (React)
```javascript
// ChatbotModal features:
- Message history with user/bot distinction
- Typing indicators
- Emergency banner for urgent symptoms
- Persistent disclaimer about not being medical advice
- Keyboard shortcut (Cmd/Ctrl + Shift + H)
- PropTypes validation
```

### Safety Features

#### Emergency Detection
The chatbot detects emergency keywords and immediately urges users to seek professional care:
- "chest pain", "heart attack", "can't breathe"
- "severe bleeding", "unconscious", "seizure"
- "suicide", "overdose", "poisoning"

#### System Prompt Safety
```
You are a helpful health information assistant for MediNest, a pharmacy platform.
IMPORTANT SAFETY GUIDELINES:
1. NEVER provide medical diagnoses or prescribe medications
2. ALWAYS recommend consulting healthcare professionals
3. For emergencies, urge immediate professional care
4. Provide general health information only
5. Include disclaimer that you're not a substitute for professional medical advice
```

## Usage

### For Users:
1. **Search Medicines**: Use the search bar to find medicines by name (no symptom search)
2. **Health Questions**: Click "Ask Health Assistant" for general health info
3. **Emergency**: Chatbot will immediately advise seeking professional care

### For Developers:
```bash
# Install dependencies
pip install -r backend_easyhealth/requirements.txt

# Set up Gemini API key (free tier)
# Get API key from: https://makersuite.google.com/app/apikey
# Add to environment variables or settings
```

## API Endpoints

### POST /api/chatbot/
Request:
```json
{
  "message": "What are the side effects of paracetamol?"
}
```

Response:
```json
{
  "response": "Paracetamol (acetaminophen) is generally well-tolerated...",
  "is_emergency": false,
  "disclaimer": "This information is for educational purposes only..."
}
```

## Future Enhancements
1. Add chat history persistence
2. Implement rate limiting
3. Add more emergency keywords
4. Integrate with telemedicine services
5. Add multilingual support

## Compliance & Safety
- ✅ No medical diagnosis
- ✅ No medication prescriptions
- ✅ Always recommends professional consultation
- ✅ Emergency detection and warnings
- ✅ Clear disclaimers on every response
- ✅ HIPAA-aware (no PHI storage)

## Migration from Old AI Search
The old `AISearchModal.jsx` is deprecated but kept for reference. The new system:
- Removes symptom-to-medicine AI mapping
- Removes medical synonym expansion
- Removes AI-enhanced product recommendations
- Adds safe health chatbot for general questions
- Keeps simple text search for known medicines
