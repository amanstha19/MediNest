# Email Not Working? Debug Guide

## Quick Checklist

### 1. Did you restart Docker after the fix?
```bash
docker-compose down
docker-compose up -d
```
**This is REQUIRED** - Docker only loads env files on startup!

### 2. Check if .env file exists and has correct content
```bash
cat backend_easyhealth/epharm/.env
```

Should show:
```
EMAIL_HOST_USER=shresthaaman27@gmail.com
EMAIL_HOST_PASSWORD=njzi cmqd dqbb ipng
DEFAULT_FROM_EMAIL=noreply@medinest.com
```

### 3. Check Docker logs for errors
```bash
docker-compose logs backend | tail -50
```

Look for:
- "EMAIL_HOST_USER" - should show your email
- Any SMTP errors
- Connection errors

### 4. Test from inside Docker container
```bash
# Enter the backend container
docker-compose exec backend bash

# Inside container, run Python
python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'epharm.settings')
import django
django.setup()
from django.conf import settings
print('EMAIL_HOST_USER:', settings.EMAIL_HOST_USER)
print('EMAIL_HOST_PASSWORD:', 'SET' if settings.EMAIL_HOST_PASSWORD else 'NOT SET')
"
```

If this shows empty values, the .env file isn't being loaded.

### 5. Common Issues & Fixes

#### Issue: "SMTP Authentication Error"
**Cause**: Gmail security blocking the login
**Fix**: 
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification (if not already enabled)
3. Go to https://myaccount.google.com/apppasswords
4. Generate NEW app password
5. Update `.env` file with new password
6. Restart Docker

#### Issue: "Connection refused" or "Timeout"
**Cause**: Network/firewall blocking SMTP
**Fix**:
- Check if port 587 is blocked
- Try using mobile hotspot to test
- Check Docker network settings

#### Issue: "Less secure app access"
**Cause**: Gmail deprecated this feature
**Fix**: Must use App Password with 2FA enabled

#### Issue: Emails not in inbox
**Check**:
1. Spam/Junk folder
2. Promotions tab (Gmail)
3. All Mail folder
4. Wait 2-3 minutes (sometimes delayed)

### 6. Alternative: Use Console Backend (Testing Only)

If Gmail keeps failing, switch to console backend to see emails in terminal:

Edit `backend_easyhealth/epharm/epharm/settings.py`:
```python
# Comment out SMTP settings
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# Use console instead
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

Then restart Docker and test - you'll see the email content in the terminal logs.

### 7. Test with curl

```bash
# Test the forgot password API directly
curl -X POST http://localhost:8000/api/forgot-password/ \
  -H "Content-Type: application/json" \
  -d '{"email": "shresthaaman27@gmail.com"}'
```

Expected response:
```json
{"message": "If an account with this email exists, a password reset link has been sent."}
```

### 8. Check if user exists in database

```bash
# Enter backend container
docker-compose exec backend bash

# Run Django shell
python manage.py shell

# In shell:
from myapp.models import CustomUser
user = CustomUser.objects.filter(email='shresthaaman27@gmail.com').first()
print(user)  # Should show user object if exists
exit()
```

If user doesn't exist, create one first:
```bash
python manage.py shell
from myapp.models import CustomUser
user = CustomUser.objects.create_user(
    username='testuser',
    email='shresthaaman27@gmail.com',
    password='testpass123'
)
print("User created:", user)
exit()
```

### 9. Manual Email Test Script

Run this test script:
```bash
cd /Users/amanshrestha/Desktop/MediNest/backend_easyhealth/epharm
python test_email_config.py
```

### 10. Nuclear Option: Reset Everything

If nothing works, try this:

```bash
# 1. Stop everything
docker-compose down

# 2. Remove all containers and volumes
docker-compose down -v

# 3. Rebuild
docker-compose build --no-cache

# 4. Start fresh
docker-compose up -d

# 5. Run migrations
docker-compose exec backend python manage.py migrate

# 6. Create test user
docker-compose exec backend python manage.py shell -c "
from myapp.models import CustomUser
if not CustomUser.objects.filter(email='shresthaaman27@gmail.com').exists():
    CustomUser.objects.create_user(username='test', email='shresthaaman27@gmail.com', password='test123')
    print('User created')
else:
    print('User exists')
"

# 7. Test forgot password
curl -X POST http://localhost:8000/api/forgot-password/ \
  -H "Content-Type: application/json" \
  -d '{"email": "shresthaaman27@gmail.com"}'
```

## Still Not Working?

Try these alternatives:

### Option A: Use Mailtrap (For Testing)
Sign up at https://mailtrap.io (free tier available)
Update `.env`:
```
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_HOST_USER=your-mailtrap-username
EMAIL_HOST_PASSWORD=your-mailtrap-password
```

### Option B: Check Gmail Security Alerts
1. Go to https://myaccount.google.com/notifications
2. Look for "Security alert" or "Sign-in attempt blocked"
3. Click "Yes, it was me" to allow

### Option C: Use Different Email Provider
Try Outlook/Hotmail SMTP instead:
```
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-outlook@outlook.com
EMAIL_HOST_PASSWORD=your-password
```

## Need Help?

Check these logs:
```bash
# Backend logs
docker-compose logs -f backend

# All logs
docker-compose logs
```

Share the error messages if you need assistance!
