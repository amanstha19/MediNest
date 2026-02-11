# 🔧 URGENT FIX: Docker Entrypoint Error on Windows

## Error Your Friend Is Seeing
```
backend-1  | exec /app/entrypoint.sh: no such file or directory
backend-1 exited with code 255
```

## Root Cause
The `entrypoint.sh` file has **Windows CRLF line endings** instead of Unix LF line endings. Docker runs Linux containers which can't execute scripts with Windows line endings.

---

## ✅ SOLUTION FOR YOUR FRIEND (Windows Users)

### Step 1: Fix Git Configuration
Run these commands in the project root:

```bash
# Configure git to not convert line endings
git config core.autocrlf false

# Remove all files from git's index
git rm --cached -r .

# Re-add all files with correct line endings
git reset --hard HEAD
```

### Step 2: Force Pull Latest Changes
```bash
# Pull the latest changes (includes .gitattributes fix)
git pull origin development

# Verify entrypoint.sh has LF line endings
file backend_easyhealth/entrypoint.sh
# Should show: "ASCII text" or "UTF-8 text" (NOT "CRLF")
```

### Step 3: Rebuild Docker
```bash
# Clean rebuild
docker compose down
docker compose build --no-cache
docker compose up
```

---

## ✅ ALTERNATIVE: Quick Manual Fix

If the above doesn't work, manually convert the file:

### Using VS Code:
1. Open `backend_easyhealth/entrypoint.sh`
2. Look at bottom-right status bar
3. Click where it says "CRLF"
4. Select "LF"
5. Save file
6. Rebuild: `docker compose build --no-cache`

### Using dos2unix (if installed):
```bash
dos2unix backend_easyhealth/entrypoint.sh
docker compose build --no-cache
```

### Using PowerShell:
```powershell
# Convert CRLF to LF
(Get-Content backend_easyhealth\entrypoint.sh -Raw) -replace "`r`n", "`n" | Set-Content backend_easyhealth\entrypoint.sh -NoNewline
```

---

## ✅ VERIFICATION

After the fix, run:
```bash
docker compose up
```

You should see:
```
✅ Migrations complete!
🚀 Starting Django development server...
```

**NOT** the error:
```
❌ exec /app/entrypoint.sh: no such file or directory
```

---

## 🛡️ Prevention (Already Fixed in Repo)

I've added `.gitattributes` to the repo which will prevent this issue for future clones:

```
*.sh text eol=lf
```

This ensures shell scripts **always** use Unix line endings, even on Windows.

---

## 📝 Summary

**The problem:** Git on Windows converted LF → CRLF when your friend cloned the repo  
**The fix:** Force git to use LF line endings for shell scripts  
**Prevention:** `.gitattributes` file now enforces this automatically
