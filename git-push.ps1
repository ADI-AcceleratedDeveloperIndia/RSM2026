# Git Push Helper Script
# This script uses the stored token for authentication

$token = Get-Content -Path ".github-token" -Raw
$token = $token.Trim()

# Configure git to use the token
$remoteUrl = "https://$token@github.com/aideveloperindia/TGroadsafety.git"

Write-Host "Configuring git remote with token..." -ForegroundColor Green
git remote set-url origin $remoteUrl

Write-Host "Adding all changes..." -ForegroundColor Green
git add .

Write-Host "Enter commit message:" -ForegroundColor Yellow
$commitMessage = Read-Host

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host "Committing changes..." -ForegroundColor Green
git commit -m $commitMessage

Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push origin master

Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "View at: https://github.com/aideveloperindia/TGroadsafety" -ForegroundColor Cyan

