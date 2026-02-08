# Free Email Setup Guide - MEDINEST

## Option 1: Gmail SMTP (Recommended - Free)

Gmail provides **500 emails/day** for free. Perfect for testing and small applications.

### Step 1: Enable 2-Factor Authentication

1. Go to https://myaccount.google.com/
2. Click "Security" in the left menu
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the steps to enable 2FA (you'll need your phone)

### Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Sign in with your Google account
3. At the bottom, click "Select app" → Choose "Mail"
4. Click "Select device" → Choose "Other (Custom name)"
5. Type: `MEDINEST Django`
6. Click "Generate"
7. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

⚠️ **Important**: This is NOT your Gmail password. It's a special app password.

### Step 3: Configure Environment Variables

Add to your `.env` file in `backend_easyhealth/epharm/`:

```bash
# Email Configuration
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop  # Your 16-char app password
DEFAULT_FROM_EMAIL=noreply@medinest.com
```

### Step 4: Restart Your Server

**If running locally:**
```bash
# Stop Django (Ctrl+C)
# Start again
python manage.py runserver
```

**If using Docker:**
```bash
docker-compose down
docker-compose up -d
```

### Step 5: Test Password Reset

1. Go to http://localhost:5173/login
2. Click "Forgot Password?"
3. Enter your email address
4. Check your Gmail inbox (and spam folder)
5. You should receive an email with the reset link!

---

## Option 2: Mailtrap (Best for Development)

Mailtrap captures all emails in a fake inbox - perfect for testing without sending real emails.

### Step 1: Create Mailtrap Account

1. Go to https://mailtrap.io/
2. Sign up for free account
3. Go to your inbox

### Step 2: Get SMTP Credentials

1. In Mailtrap dashboard, click "My Inbox"
2. Click "Show Credentials"
3. Copy:
   - Username (looks like: `1234567890abcdef`)
   - Password (looks like: `1234567890abcdef`)

### Step 3: Update Settings

In `backend_easyhealth/epharm/epharm/settings.py`, comment out Gmail and uncomment Mailtrap:

```python
# Option 2: Gmail SMTP (Free - 500 emails/day)
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'smtp.gmail.com'
# EMAIL_PORT = 587
# EMAIL_USE_TLS = True
# EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
# EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')

# Option 3: Mailtrap (For testing - emails go to Mailtrap inbox)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'sandbox.smtp.mailtrap.io'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-mailtrap-username'  # Paste here
EMAIL_HOST_PASSWORD = 'your-mailtrap-password'  # Paste here
```

### Step 4: Test

1. Request password reset
2. Go to Mailtrap inbox
3. See the captured email!

---

## Option 3: SendGrid (Production - 100 emails/day free)

Best for production with good deliverability.

### Step 1: Create SendGrid Account

1. Go to https://sendgrid.com/
2. Sign up for free account
3. Verify your email

### Step 2: Create API Key

1. In SendGrid dashboard, go to Settings → API Keys
2. Click "Create API Key"
3. Name: `MEDINEST`
4. Permissions: "Restricted Access" → "Mail Send" → "Full Access"
5. Click "Create & View"
6. **Copy the API key** (starts with `SG.`)

### Step 3: Update Settings

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'  # This is literally the word "apikey"
EMAIL_HOST_PASSWORD = 'SG.xxxxx...'  # Your API key
DEFAULT_FROM_EMAIL = 'your-verified-sender@example.com'
```

### Step 4: Verify Sender

1. In SendGrid, go to Settings → Sender Authentication
2. Verify your sender email address
3. Use that email as `DEFAULT_FROM_EMAIL`

---

## Troubleshooting

### Issue: "Authentication failed"
**Solution**: 
- For Gmail: Make sure you're using App Password, not regular password
- Check 2FA is enabled on Gmail account

### Issue: "Connection refused"
**Solution**:
- Check firewall/antivirus isn't blocking port 587
- Try port 465 with `EMAIL_USE_SSL = True` instead of `EMAIL_USE_TLS`

### Issue: Emails not sending
**Solution**:
- Check Django logs for errors
- Verify environment variables are loaded: `print(os.getenv('EMAIL_HOST_USER'))`
- Check spam folder

### Issue: "Less secure app access"
**Solution**:
- This is deprecated by Google
- Must use App Passwords with 2FA enabled

---

## Quick Test Script

Create `test_email.py`:

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'epharm.settings')
django.setup()

from django.core.mail import send_mail

send_mail(
    'Test Email from MEDINEST',
    'This is a test email. If you see this, email is working!',
    'noreply@medinest.com',
    ['your-email@example.com'],
    fail_silently=False,
)
print("Email sent successfully!")
```

Run: `python test_email.py`

---

## Security Tips

✅ Never commit email passwords to Git  
✅ Use environment variables (`.env` file)  
✅ Enable 2FA on email accounts  
✅ Use App Passwords, not main passwords  
✅ Rotate passwords periodically  

## Next Steps

1. Choose your email provider (Gmail recommended for testing)
2. Follow the setup steps above
3. Test password reset feature
4. Check your inbox! 📧
