# PowerShell script to fix git line ending issues on Windows
# Run this in PowerShell as Administrator in the MediNest folder

Write-Host "Configuring git for Windows line endings..." -ForegroundColor Cyan
git config --global core.autocrlf true

Write-Host "Stashing local changes..." -ForegroundColor Cyan
git stash

Write-Host "Removing problematic files with invalid paths..." -ForegroundColor Cyan
Remove-Item -ErrorAction SilentlyContinue -Force "backend_easyhealth/epharm/myapp/models.py"
Remove-Item -ErrorAction SilentlyContinue -Force "backend_easyhealth/epharm/myapp/serializers.py"

Write-Host "Cleaning git index..." -ForegroundColor Cyan
git reset --hard HEAD

Write-Host "Pulling latest changes from origin/development..." -ForegroundColor Cyan
git pull origin development

Write-Host "Done! The line ending issues should be resolved." -ForegroundColor Green
Write-Host "Now ask the Mac user to push their category changes." -ForegroundColor Yellow

