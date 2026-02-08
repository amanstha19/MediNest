# Password Reset Feature - MEDINEST

## Overview
Complete password reset functionality has been implemented for the MEDINEST pharmacy application. Users can now reset their passwords via email.

## Features
- **Forgot Password**: Users can request a password reset link via email
- **Secure Tokens**: 32-byte secure random tokens with 1-hour expiry
- **Token Verification**: Tokens are validated before allowing password reset
- **Password Validation**: New passwords must be at least 8 characters
- **Security**: No email enumeration (same message whether email exists or not)

## API Endpoints

### 1. Forgot Password
**POST** `/api/forgot-password/`

Request:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "If an account with this email exists, a password reset link has been sent."
}
```

### 2. Verify Reset Token
**GET** `/api/verify-reset-token/{token}/`

Response (valid):
```json
{
  "valid": true,
  "email": "user@example.com"
}
```

Response (invalid):
```json
{
  "valid": false,
  "error": "Token has expired or has already been used."
}
```

### 3. Reset Password
**POST** `/api/reset-password/`

Request:
```json
{
  "token": "abc123...",
  "new_password": "newpassword123"
}
```

Response:
```json
{
  "message": "Password has been reset successfully. Please login with your new password."
}
```

## Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/forgot-password` | `ForgotPassword.jsx` | Email input form |
| `/reset-password/:token` | `ResetPassword.jsx` | New password form |

## User Flow

1. User clicks "Forgot Password?" on login page
2. User enters their email address
3. System sends email with reset link (valid for 1 hour)
4. User clicks link in email → `/reset-password/{token}`
5. System verifies token validity
6. User enters new password (min 8 characters)
7. Password is updated, token is marked as used
8. User redirected to login page

## Files Modified/Created

### Backend
- `backend_easyhealth/epharm/myapp/models.py` - Added `PasswordResetToken` model
- `backend_easyhealth/epharm/myapp/views/auth.py` - Added 3 new API endpoints
- `backend_easyhealth/epharm/myapp/views/__init__.py` - Exported new functions
- `backend_easyhealth/epharm/myapp/urls.py` - Added URL routes
- `backend_easyhealth/epharm/myapp/migrations/0042_*.py` - Database migration

### Frontend
- `frontend_easyhealth/src/components/screens/ForgotPassword.jsx` - New component
- `frontend_easyhealth/src/components/screens/ResetPassword.jsx` - New component
- `frontend_easyhealth/src/App.jsx` - Added routes
- `frontend_easyhealth/src/components/screens/Login.jsx` - Added "Forgot Password?" link

### Testing
- `test_password_reset.py` - Comprehensive test suite (8 tests)

## Security Features

1. **Token Security**: 32-byte URL-safe tokens generated with `secrets.token_urlsafe()`
2. **Token Expiry**: Tokens expire after 1 hour
3. **One-time Use**: Tokens are marked as used after password reset
4. **No Enumeration**: Same response whether email exists or not
5. **Password Validation**: Minimum 8 characters required
6. **HTTPS Ready**: Reset URLs use HTTPS in production

## Email Configuration

To enable email sending, configure in `settings.py`:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # or your SMTP server
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'noreply@medinest.com'
```

For development, emails are printed to console by default.

## Testing

Run the test suite:
```bash
python3 test_password_reset.py
```

All 8 tests should pass:
- ✓ Forgot Password - Valid Email
- ✓ Forgot Password - Invalid Email
- ✓ Forgot Password - Missing Email
- ✓ Verify Token - Invalid Token
- ✓ Reset Password - Invalid Token
- ✓ Reset Password - Short Password
- ✓ Reset Password - Missing Fields
- ✓ Method Not Allowed

## Database Schema

```sql
CREATE TABLE myapp_passwordresettoken (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token VARCHAR(100) UNIQUE NOT NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES myapp_customuser(id)
);
```

## Future Enhancements

1. **Rate Limiting**: Limit password reset requests per IP
2. **SMS Reset**: Add SMS-based password reset option
3. **Security Questions**: Add security question verification
4. **Audit Log**: Log all password reset attempts
5. **Token Refresh**: Allow extending token expiry

## Support

For issues or questions about the password reset feature, please check:
1. Django server is running on port 8000
2. Database migrations are applied
3. Email configuration is correct (for production)
4. Frontend is running on port 5173
