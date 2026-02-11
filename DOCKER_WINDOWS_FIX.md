# Docker Build Optimization for Windows Users

## Issue
Windows users experiencing slow Docker builds when installing `requirements.txt` due to lack of pip caching.

## Solution Applied

### Updated Dockerfile Caching Strategy

**Before:**
```dockerfile
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt
```

**After:**
```dockerfile
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip install -r requirements.txt && \
    pip install --upgrade google-genai
```

### Benefits

1. **Faster Builds**: Uses Docker BuildKit cache mounts to persist pip cache between builds
2. **Cross-Platform**: Works on Windows, macOS, and Linux
3. **Bandwidth Savings**: Doesn't re-download packages on every build
4. **Development Friendly**: Speeds up iterative development

### Usage Instructions

For Windows users, ensure Docker BuildKit is enabled:

**PowerShell:**
```powershell
$env:DOCKER_BUILDKIT=1
docker compose build
```

**CMD:**
```cmd
set DOCKER_BUILDKIT=1
docker compose build
```

**Or permanently enable in Docker Desktop:**
1. Open Docker Desktop Settings
2. Go to "Docker Engine"
3. Add `"features": { "buildkit": true }` to the configuration
4. Restart Docker Desktop

### Alternative: `.dockerignore` Optimization

Also ensure you have a `.dockerignore` file to prevent unnecessary file copying:

```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
*.so
*.egg
*.egg-info
dist
build
.env
.venv
venv/
*.log
.git
.gitignore
```

This prevents copying unnecessary files that could invalidate Docker cache layers.
