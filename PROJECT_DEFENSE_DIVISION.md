# 🏥 MEDINEST - Final Project Defense Division
## E-Pharmacy Platform with AI Integration

---

## 📋 Project Overview

**MediNest** is a full-stack E-Pharmacy platform built with:
- **Backend**: Django REST Framework + PostgreSQL/SQLite
- **Frontend**: React + Vite + Bootstrap + Framer Motion
- **AI Features**: Google Gemini Chatbot + Tesseract OCR
- **Payments**: eSewa + Khalti Integration
- **DevOps**: Docker Containerization

---

## 👥 TEAM DIVISION (4 People)

---

# 👤 PERSON 1: Backend Core & Database Architecture
## Role: System Architecture & Authentication Lead

### 📁 Files Responsible

#### Core Backend Files:
| File | Purpose |
|------|---------|
| `backend_easyhealth/epharm/myapp/models.py` | All database models |
| `backend_easyhealth/epharm/myapp/serializers.py` | API data validation |
| `backend_easyhealth/epharm/myapp/urls.py` | URL routing |
| `backend_easyhealth/epharm/epharm/settings.py` | Django configuration |
| `backend_easyhealth/epharm/epharm/urls.py` | Main URL config |
| `backend_easyhealth/epharm/myapp/views/auth.py` | Authentication system |
| `backend_easyhealth/epharm/myapp/admin.py` | Admin configuration |
| `backend_easyhealth/epharm/myapp/admin_enhanced.py` | Enhanced admin features |

#### Migration Files:
- `migrations/0001_initial.py` - Initial schema
- `migrations/0003_category_initial.py` - Category system
- `migrations/0037_add_prescription_verification.py` - OCR feature
- `migrations/0041_order_payment_method.py` - Payment methods

### 🎯 Key Concepts to Master

#### 1. Database Schema Design
```python
# Key Models to Explain:
- CustomUser (extends AbstractUser)
- Product (with ForeignKey to Category)
- Order (with status tracking)
- Cart & CartItem (1:1 User-Cart relationship)
- userPayment (payment tracking)
- PrescriptionVerification (OCR results)
- PasswordResetToken (security)
```

**Talking Points:**
- "We used Django's ORM with ForeignKey relationships for data integrity"
- "CustomUser extends AbstractUser for flexible user management"
- "One-to-One relationship between User and Cart ensures each user has exactly one cart"
- "Category system uses ForeignKey with SET_NULL for product categorization"

#### 2. JWT Authentication System
**Technologies**: `rest_framework_simplejwt`

**Key Features:**
- Token-based authentication (Access + Refresh tokens)
- Custom token serializer with user data
- Secure password handling with Django's built-in hashing

**Code to Know:**
```python
# From auth.py - CustomLoginAPIView
class CustomLoginAPIView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
```

**Defense Questions:**
- Q: "How does your authentication work?"
- A: "We use JWT tokens. When user logs in, we generate access and refresh tokens. Access token is short-lived (15 mins), refresh token lasts longer (7 days)."

#### 3. Password Reset Security (Advanced Feature)
**Security Measures:**
- Rate limiting: Max 3 attempts per hour per email
- Secure token generation using `secrets.token_urlsafe(32)`
- Token expiration: 1 hour
- Generic error messages to prevent email enumeration

**Key Code:**
```python
MAX_RESET_ATTEMPTS = 3
RESET_TIMEOUT = 3600  # 1 hour

# Rate limiting implementation
cache_key = f"password_reset_attempts_{email}"
attempts = cache.get(cache_key, 0)
if attempts >= MAX_RESET_ATTEMPTS:
    return Response({'error': 'Too many attempts'}, status=429)
```

**Talking Points:**
- "We implemented rate limiting to prevent brute force attacks"
- "Tokens expire in 1 hour for security"
- "We use Django's cache framework for rate limiting"
- "Generic messages prevent attackers from knowing if email exists"

#### 4. Django Admin Customization
**Features:**
- Jazzmin theme integration
- Custom dashboard with statistics
- Prescription verification workflow
- Order management interface

### 🎤 Defense Script

**Opening (1 minute):**
> "I handled the backend architecture and authentication system. Our database uses Django ORM with 7 main models. The authentication uses JWT tokens with a custom implementation for password reset that includes rate limiting and secure token generation."

**Demo Flow:**
1. Show `models.py` - Explain relationships
2. Show `auth.py` - Explain JWT and password reset
3. Show Django Admin - Demonstrate management capabilities

**Expected Questions & Answers:**

Q: "Why did you use JWT instead of session-based auth?"
A: "JWT is stateless and works better for React frontend. It allows us to scale easily without session storage issues."

Q: "How do you handle database migrations?"
A: "We use Django's migration system. Each model change creates a migration file that can be applied consistently across environments."

Q: "Explain your user model."
A: "We extended AbstractUser to add custom fields like city, country, phone. This keeps Django's built-in security while adding our needed fields."

---

# 👤 PERSON 2: E-Commerce & Payment Systems
## Role: Payment Integration & Order Management Lead

### 📁 Files Responsible

#### Backend Payment Files:
| File | Purpose |
|------|---------|
| `backend_easyhealth/epharm/myapp/views/payments.py` | eSewa payment processing |
| `backend_easyhealth/epharm/myapp/views/orders.py` | Order management |
| `backend_easyhealth/epharm/myapp/views/cart.py` | Cart operations |
| `backend_easyhealth/epharm/myapp/khalti_service.py` | Khalti integration |
| `backend_easyhealth/epharm/myapp/views/user.py` | User profile |

#### Frontend Files:
| File | Purpose |
|------|---------|
| `frontend_easyhealth/src/components/screens/Payment.jsx` | Payment UI |
| `frontend_easyhealth/src/components/screens/KhaltiPayment.jsx` | Khalti UI |
| `frontend_easyhealth/src/components/screens/CheckoutScreen.jsx` | Checkout flow |
| `frontend_easyhealth/src/components/screens/CartScreen.jsx` | Cart UI |
| `frontend_easyhealth/src/components/screens/OrderSuccessScreen.jsx` | Success page |
| `frontend_easyhealth/src/context/CartContext.jsx` | Cart state |

### 🎯 Key Concepts to Master

#### 1. eSewa Payment Integration
**Technology**: HMAC SHA256 Signature Verification

**Payment Flow:**
1. User clicks "Pay with eSewa"
2. Backend generates transaction UUID
3. Backend creates HMAC signature
4. Redirects to eSewa with payment details
5. eSewa processes payment
6. Callback updates order status

**Key Code:**
```python
# From payments.py - HMAC Signature Generation
message = f"total_amount={total_amount},transaction_uuid={transaction_uuid},product_code=EPAYTEST"
secret_key = "8gBm/:&EnhH.1/q"
signature = base64.b64encode(
    hmac.new(
        secret_key.encode(),
        message.encode(),
        hashlib.sha256
    ).digest()
).decode()
```

**Talking Points:**
- "We use HMAC SHA256 for secure signature verification"
- "Transaction UUID ensures each payment is unique"
- "Callback URL handles payment success/failure"
- "Order status updates automatically after payment confirmation"

#### 2. Khalti Payment Gateway
**Features:**
- Direct API integration
- Payment initialization
- Transaction verification
- Webhook handling

#### 3. Order Management System
**Order Status Flow:**
```
pending → processing → shipped → delivered
     ↓
   paid (after payment)
```

**Key Features:**
- Order creation with cart items
- Prescription upload for RX medicines
- Order tracking by status
- Email notifications on status change

**Code to Know:**
```python
# Order model status choices
STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('processing', 'Processing'),
    ('shipped', 'Shipped'),
    ('delivered', 'Delivered'),
]
```

#### 4. Cart System
**Features:**
- Add/remove/update items
- Prescription file upload for RX medicines
- Persistent cart (localStorage + database)
- Cart total calculations

**Frontend State Management:**
```javascript
// From CartContext.jsx
const [cartItems, setCartItems] = useState([]);
const addToCart = (product, quantity, prescription) => { ... };
const removeFromCart = (itemId) => { ... };
```

#### 5. Cash on Delivery (COD)
**Implementation:**
- Separate order flow
- No immediate payment required
- Manual payment confirmation by admin
- Delivery charge handling

### 🎤 Defense Script

**Opening (1 minute):**
> "I implemented the payment and order management systems. We integrated two Nepali payment gateways - eSewa and Khalti. The system supports both online payments and Cash on Delivery. Orders track through multiple statuses from pending to delivered."

**Demo Flow:**
1. Add item to cart → Show cart functionality
2. Checkout process → Show prescription upload for RX medicines
3. Payment selection → Show eSewa/Khalti options
4. Order success → Show order tracking

**Expected Questions & Answers:**

Q: "How do you handle payment security?"
A: "We use HMAC SHA256 signatures for eSewa. Each transaction has a unique UUID and signature that eSewa verifies. For Khalti, we use their API with secret key authentication."

Q: "What happens if payment fails?"
A: "User is redirected to failure page. Order remains in 'pending' status. User can retry payment from their order history."

Q: "How do you handle prescription medicines?"
A: "During checkout, if cart contains RX medicines, user must upload prescription. Our OCR system verifies the prescription before order processing."

Q: "Explain your cart persistence."
A: "We use React Context for state management with localStorage backup. For logged-in users, cart syncs with database."

---

# 👤 PERSON 3: AI/ML Features & Healthcare Services
## Role: AI Integration & Healthcare Services Lead

### 📁 Files Responsible

#### AI/ML Backend Files:
| File | Purpose |
|------|---------|
| `backend_easyhealth/epharm/myapp/views/chatbot.py` | Google Gemini AI chatbot |
| `backend_easyhealth/epharm/myapp/ocr_utils.py` | Tesseract OCR |
| `backend_easyhealth/epharm/myapp/ocr_utils_enhanced.py` | Enhanced OCR |
| `backend_easyhealth/epharm/myapp/advanced_ocr_handwriting.py` | Handwriting recognition |
| `backend_easyhealth/epharm/myapp/views/admin.py` | Prescription verification |

#### Healthcare Service Files:
| File | Purpose |
|------|---------|
| `frontend_easyhealth/src/components/ui/ChatbotModal.jsx` | Chatbot UI |
| `frontend_easyhealth/src/components/ui/SimpleSearchModal.jsx` | AI search |
| `frontend_easyhealth/src/components/screens/Ambulance.jsx` | Emergency service |
| `frontend_easyhealth/src/components/screens/LabTestsPage.jsx` | Lab tests |
| `frontend_easyhealth/src/components/screens/LabTestBookingPage.jsx` | Booking system |

### 🎯 Key Concepts to Master

#### 1. Google Gemini AI Chatbot
**Technology**: `google-genai` SDK (v1)

**Key Features:**
- General health information (NOT diagnosis)
- Emergency keyword detection
