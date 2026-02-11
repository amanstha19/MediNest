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

## ✅ Solution 4: Full Database Synchronization (Option B)

If you want your friend to have the **exact same database** (same Products, Categories, and even User Accounts), I have implemented a **Full Sync** feature.

**I have fixed this by updating `entrypoint.sh` and creating `full_db.json`.**

Now, when your friend starts the project, the system will:
1. Check if their database is empty.
2. If empty, it will look for `full_db.json`.
3. If found, it will import **EVERYTHING** (Users, Products, Orders, etc.).

### 🚀 **Crucial Step for Owner (You):**
You MUST push the latest changes (run the commands below).

### 🚀 **Crucial Step for Friend:**
Since the sync logic is in `entrypoint.sh`, your friend **MUST rebuild their Docker image** for it to work. Tell them to run:
```bash
git pull origin development
docker compose up --build
```

---

## ✅ Summary Checklist for Friend
1. `git pull origin development`
2. `docker compose down`
3. `docker compose up --build`  <-- **MUST use --build**
4. Wait for message: `📥 Full database fixture found! Syncing EVERYTHING...`

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

---

## ✅ Solution 5: MIRROR MODE (Total Reset)

If your friend says "it's still not syncing!" or if they want an absolute **fresh start** that matches your environment 100%, tell them to run this **Nuclear Option**:

```bash
# 1. Wipe everything (including the database volume)
docker compose down -v

# 2. Rebuild with new sync logic
docker compose up --build
```

### Why this is the "Best" Fix:
- **`docker compose down -v`**: The `-v` flag is the key. It deletes the local database volume.
- **Next Start**: When they run `up`, the `entrypoint.sh` will see an empty database and trigger the `full_db.json` import automatically.
- **Result**: They get your exact users, categories, products, and images.

---

## 🛡️ Prevention (Already Fixed in Repo)
...
