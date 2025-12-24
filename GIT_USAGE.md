# Git Usage Guide

Your GitHub personal access token has been securely stored in this project.

## Files Created:
- `.github-token` - Contains your GitHub personal access token (NOT committed to git)
- `git-push.ps1` - PowerShell script for easy push operations
- This file is added to `.gitignore` to prevent accidental commits

## How to Push Changes:

### Method 1: Using the Helper Script (Easiest)
```powershell
# From the project root
.\git-push.ps1
```
This will:
1. Add all changes
2. Ask for a commit message
3. Commit the changes
4. Push to GitHub automatically

### Method 2: Manual Git Commands
The token is already configured in the remote URL, so you can use normal git commands:

```bash
git add .
git commit -m "Your commit message"
git push origin master
```

### Method 3: Quick Update
```powershell
git add .
git commit -m "Quick update"
git push
```

## Important Security Notes:
- ⚠️ **NEVER** commit the `.github-token` file
- ⚠️ The token is in `.gitignore` to prevent this
- ⚠️ Don't share the token file with anyone
- ⚠️ If the token is exposed, regenerate it immediately at: https://github.com/settings/tokens

## Repository URL:
https://github.com/aideveloperindia/TGroadsafety

## Token Permissions:
Your token has `repo` access, which allows:
- Push commits
- Create/delete branches
- Manage pull requests
- Access repository content

## If You Need to Regenerate Token:
1. Go to: https://github.com/settings/tokens
2. Delete the old token
3. Create a new token with `repo` scope
4. Update the `.github-token` file with the new token
5. Run: `git remote set-url origin https://NEW_TOKEN@github.com/aideveloperindia/TGroadsafety.git`

