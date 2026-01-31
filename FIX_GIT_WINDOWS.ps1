# PowerShell script to fix git line ending issues on Windows
# Run this in PowerShell (as Administrator) in the MediNest folder

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing Git Line Ending Issues for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Configure git for proper line endings on Windows
Write-Host "`n[1/5] Configuring git for Windows line endings..." -ForegroundColor Cyan
git config --global core.autocrlf true
Write-Host "Done." -ForegroundColor Green

# Step 2: Fetch latest changes from origin
Write-Host "`n[2/5] Fetching latest changes from origin..." -ForegroundColor Cyan
git fetch origin
Write-Host "Done." -ForegroundColor Green

# Step 3: Try to reset to origin/development
Write-Host "`n[3/5] Resetting to origin/development..." -ForegroundColor Cyan
$resetResult = git reset --hard origin/development 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Git reset completed!" -ForegroundColor Green
} else {
    Write-Host "WARNING: Git reset had issues: $resetResult" -ForegroundColor Yellow
    
    Write-Host "`n[3b/5] Trying alternative approach - clean checkout..." -ForegroundColor Cyan
    # Backup local changes if any
    Write-Host "Backing up any uncommitted changes..." -ForegroundColor Yellow
    git stash
    
    # Remove all untracked files and directories
    Write-Host "Cleaning untracked files..." -ForegroundColor Yellow
    git clean -fd
    
    # Try reset again
    git reset --hard origin/development
}

# Step 4: Verify the fix
Write-Host "`n[4/5] Verifying fix..." -ForegroundColor Cyan
$status = git status --short
if ($status.Length -eq 0) {
    Write-Host "SUCCESS: Repository is clean and up to date!" -ForegroundColor Green
} else {
    Write-Host "There are still some changes:" -ForegroundColor Yellow
    Write-Host $status -ForegroundColor White
}

# Step 5: Display next steps
Write-Host "`n[5/5] Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "The repository should now be fixed!" -ForegroundColor Green
Write-Host "`nTo start working:" -ForegroundColor White
Write-Host "  1. Apply any stashed changes: git stash pop" -ForegroundColor White
Write-Host "   (if you had local changes)" -ForegroundColor Gray
Write-Host "  2. Run the project: ./start-dev.ps1" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "If you still have issues, try:" -ForegroundColor Yellow
Write-Host "  git status" -ForegroundColor White
Write-Host "  git pull origin development" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

