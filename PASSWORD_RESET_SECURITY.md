# Password Reset Security Measures

## Overview
This document explains the security measures implemented for the password reset feature to prevent abuse and protect user accounts.

## Security Features Implemented

### 1. Rate Limiting (Anti-Spam Protection)
- **Max Attempts**: 3 password reset requests per email per hour
- **Timeout**: 1 hour cooldown period
- **Implementation**: Uses Django cache to track attempts
- **Purpose**: Prevents attackers from spamming the forgot password endpoint

### 2. Email Enumeration Prevention
- **Behavior**: Returns the same message whether email exists or not
- **Message**: "If an account with this email exists, a password reset link has been sent."
- **Purpose**: Prevents attackers from discovering which emails are registered

### 3. Single Active Token Policy
- **Behavior**: Only one valid reset token per user at a time
- **Implementation**: Checks for existing valid tokens before creating new ones
- **Purpose**: Prevents token flooding and confusion

### 4. Secure Token Generation
- **Method**: `secrets.token_urlsafe(32)` - cryptographically secure random token
- **Length**: 32 bytes (43 characters in URL-safe base64)
- **Purpose**: Tokens cannot be guessed or brute-forced

### 5. Token Expiration
- **Lifetime**: 1 hour from creation
- **Implementation**: `expires_at` field in database
- **Purpose**: Limits window of opportunity for attackers

### 6. One-Time Use Tokens
- **Behavior**: Token marked as `used` after successful password reset
- **Implementation**: `is_used` boolean field
- **Purpose**: Prevents replay attacks

### 7. Password Strength Validation
- **Minimum Length**: 8 characters
- **Purpose**: Ensures users set strong passwords

### 8. Secure Email Configuration
- **App Password**: Uses Gmail App Password (not account password)
- **Environment Variables**: Credentials stored in `.env` file
- **Git Protection**: `.env` added to `.gitignore`

## How It Works

### Normal Flow
1. User enters email on forgot password page
2. System checks rate limit (max 3/hour)
3. If email exists and no active token:
   - Generate secure token
   - Send email with reset link
   - Increment attempt counter
4. User clicks link in email (valid for 1 hour)
5. User sets new password
6. Token marked as used

### Rate Limit Scenarios
- **Attempt 1-3**: Email sent (if user exists)
- **Attempt 4+**: Error: "Too many attempts. Please try again after 1 hour."
- **After 1 hour**: Counter resets, user can try again

### Security Scenarios
- **Non-existent email**: Returns generic success message (no enumeration)
- **Existing token**: Returns generic message, doesn't create new token
- **Expired token**: Error: "Token has expired"
- **Used token**: Error: "Token has already been used"
- **Invalid token**: Error: "Invalid token"

## API Endpoints

### POST /api/forgot-password/
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "If an account with this email exists, a password reset link has been sent."
}
```

**Rate Limit Response (429):**
```json
{
  "error": "Too many attempts. Please try again after 1 hour."
}
```

### GET /api/verify-reset-token/<token>/
**Success Response (200):**
```json
{
  "valid": true,
  "email": "user@example.com"
}
```

**Invalid Response (400):**
```json
{
  "valid": false,
  "error": "Token has expired or has already been used."
}
```

### POST /api/reset-password/
**Request:**
```json
{
  "token": "abc123...",
  "new_password": "newSecurePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password has been reset successfully. Please login with your new password."
}
```

## Testing Rate Limiting

You can test the rate limiting with this curl command:

```bash
# Try 4 times quickly - 4th should fail with 429
curl -X POST http://localhost:8000/api/forgot-password/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Security Best Practices

1. **Never expose whether an email exists** - Always return generic message
2. **Rate limit all sensitive endpoints** - Prevents brute force and spam
3. **Use cryptographically secure tokens** - Never use predictable tokens
4. **Short token lifetime** - 1 hour is standard for password resets
5. **One-time use tokens** - Prevents replay attacks
6. **Secure credential storage** - Use environment variables, never hardcode
7. **Monitor logs** - Watch for suspicious activity in server logs

## Monitoring

Check server logs for:
- Rate limit exceeded warnings
- Failed email sends
- Invalid token attempts
- Successful password resets

Example log entries:
```
WARNING: Rate limit exceeded for password reset: user@example.com
INFO: Password reset email sent to: user@example.com
ERROR: Failed to send password reset email: [error details]
```

## Future Enhancements

Consider adding:
1. **IP-based rate limiting** - Additional layer of protection
2. **CAPTCHA** - After 2 failed attempts
3. **Email confirmation** - Notify user when password is changed
4. **Audit log** - Track all password reset attempts in database
5. **Suspicious activity alerts** - Email admin if many attempts from same IP
