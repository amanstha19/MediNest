# Docker Build ENOENT Error Fix

## Problem
Your friend is getting **"No such file or directory" (ENOENT)** error during Docker build.

## Root Causes

### 1. Missing `.env` File ⚠️
The `docker-compose.yml` references a `.env` file that doesn't exist:
```yaml
env_file:
  - ./backend_easyhealth/epharm/.env
```

### 2. Windows Line Endings Issue (Windows Only)
If your friend is on Windows, the `entrypoint.sh` script might have CRLF line endings instead of LF, causing the error:
```
/bin/bash^M: bad interpreter: No such file or directory
```

---

## Solutions

### ✅ Solution 1: Create the Missing `.env` File

Your friend needs to create the file: `backend_easyhealth/epharm/.env`

**Option A: Make `.env` optional in docker-compose.yml** (Recommended)

Edit `docker-compose.yml` line 31-32 to make the env_file optional:

```diff
    depends_on:
      - redis
      - db
-   env_file:
-     - ./backend_easyhealth/epharm/.env
    environment:
      - DJANGO_SETTINGS_MODULE=epharm.settings
```

All required environment variables are already defined in the `environment:` section, so the `.env` file is not strictly necessary.

**Option B: Create the `.env` file**

Create `backend_easyhealth/epharm/.env` with this content:

```bash
# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True

# Database (already in docker-compose, but can override here)
POSTGRES_DB=drf_pharmacy
POSTGRES_USER=drf_user
POSTGRES_PASSWORD=drf123
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Gemini API (if using chatbot)
GEMINI_API_KEY=your-gemini-api-key-here
```

---

### ✅ Solution 2: Fix Line Endings (Windows Only)

If your friend is on **Windows**, they need to convert `entrypoint.sh` to Unix line endings:

**Method 1: Using Git**
```bash
# In the project root
git config core.autocrlf input
git rm --cached -r .
git reset --hard
```

**Method 2: Using dos2unix**
```bash
# Install dos2unix (if not installed)
# Then run:
dos2unix backend_easyhealth/entrypoint.sh
```

**Method 3: Manual in VS Code**
1. Open `entrypoint.sh` in VS Code
2. Click "CRLF" in the bottom-right status bar
3. Select "LF"
4. Save the file

---

### ✅ Solution 3: Speed Up Future Builds

The first build takes 5-10 minutes because of 105 Python packages. To speed up:

**Option A: Let it finish once** (Recommended)
- The current build will finish in a few more minutes
- Future builds will use Docker cache and be much faster
- Just run `docker compose up` (without `--build`)

**Option B: Use BuildKit cache**

Add this to the top of `backend_easyhealth/Dockerfile`:

```dockerfile
# syntax=docker/dockerfile:1
```

Then build with:
```bash
DOCKER_BUILDKIT=1 docker compose build
```

---

## Quick Fix Commands

**For your friend to run:**

```bash
# 1. Remove the env_file requirement (recommended)
# Edit docker-compose.yml and remove lines 31-32

# 2. Fix line endings (Windows only)
git config core.autocrlf input
git rm --cached entrypoint.sh
git checkout entrypoint.sh

# 3. Rebuild
docker compose build

# 4. Start services
docker compose up
```

---

## Verification

After applying the fix, the build should complete successfully. You'll see:

```
✅ Successfully built
✅ Successfully tagged medinest-backend:latest
```

Then starting containers should take only 10-20 seconds:

```bash
docker compose up
# Should see:
# ✅ Migrations complete!
# 🚀 Starting Django development server...
```

---

## Prevention

To prevent this issue for other developers:

1. **Add `.env.example`** to the repository with placeholder values
2. **Update README** with setup instructions
3. **Add `.gitattributes`** to enforce LF line endings:

```
# .gitattributes
*.sh text eol=lf
```
