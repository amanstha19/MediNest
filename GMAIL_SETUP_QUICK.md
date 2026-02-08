# Gmail SMTP Setup - Quick Guide (5 Minutes)

## Step 1: Enable 2-Factor Authentication (2FA)

1. Go to https://myaccount.google.com/security
2. Sign in with your Gmail account
3. Click **"2-Step Verification"** (under "Signing in to Google")
4. Click **"Get started"**
5. Follow the steps:
   - Enter your password
   - Add your phone number
   - Enter the verification code sent to your phone
   - Click **"Turn on"**

✅ **2FA is now enabled!**

---

## Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Sign in again (if asked)
3. At the bottom, click **"Select app"** → Choose **"Mail"**
4. Click **"Select device"** → Choose **"Other (Custom name)"**
5. Type: `MEDINEST Django`
6. Click **"Generate"**
7. **COPY THE 16-CHARACTER PASSWORD** (looks like: `abcd efgh ijkl mnop`)

⚠️ **IMPORTANT**: 
- This is NOT your Gmail password
- It's a special app password (16 characters with spaces)
- Save it somewhere safe - you can't see it again!

---

## Step 3: Add to Environment File

Create or edit `.env` file in `backend_easyhealth/epharm/`:

```bash
# Email Configuration
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop  # Paste your 16-char app password here
DEFAULT_FROM_EMAIL=noreply@medinest.com
```

Replace:
- `your-email@gmail.com` with your actual Gmail address
- `abcd efgh ijkl mnop` with your 16-character app password

---

## Step 4: Restart Your Server

### If running locally:
```bash
# Stop Django (Ctrl+C in terminal)
# Then start again
cd backend_easyhealth/epharm
python manage.py runserver
```

### If using Docker:
```bash
docker-compose down
docker-compose up -d
```

---

## Step 5: Test Password Reset

1. Open browser: http://localhost:5173/login
2. Click **"Forgot Password?"**
3. Enter your email address
4. Click **"Send Reset Link"**
5. Check your Gmail inbox (and spam folder)
6. You should receive an email with the reset link!

---

## 🎉 Success!

If you see the email in your inbox, the setup is complete!

---

## Troubleshooting

### ❌ "Authentication failed"
**Solution**: 
- Make sure you're using the 16-character App Password, not your regular Gmail password
- Check that 2FA is enabled

### ❌ "Less secure app access"
**Solution**: 
- Google disabled this feature
- You MUST use App Passwords with 2FA (follow steps above)

### ❌ Email not received
**Solution**:
- Check spam/junk folder
- Check Docker logs: `docker-compose logs backend`
- Verify `.env` file is in correct location
- Make sure you restarted the server after adding credentials

### ❌ "Invalid credentials"
**Solution**:
- Regenerate app password at https://myaccount.google.com/apppasswords
- Make sure there are no extra spaces in the password

---

## 📧 What the Email Looks Like

```
Subject: Password Reset Request - MEDINEST
From: noreply@medinest.com
To: your-email@gmail.com

Hello,

You requested a password reset for your MEDINEST account.

Click the link below to reset your password:
http://localhost:5173/reset-password/abc123xyz...

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
MEDINEST Team
```

---

## 🔐 Security Tips

✅ Never share your App Password  
✅ Never commit `.env` file to Git  
✅ Use a separate Gmail account for testing if possible  
✅ Revoke app password if you stop using the app  

---

## 🆘 Need Help?

If you're stuck on any step:
1. Check the full guide: `EMAIL_SETUP_GUIDE.md`
2. Google the error message
3. Make sure you're using the correct Gmail account

**You've got this! 💪**
