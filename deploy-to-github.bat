@echo off
title OneNote AI Assistant - GitHub Deployment

echo 🚀 OneNote AI Assistant - GitHub Deployment
echo ===========================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

echo ✅ Git is installed

REM Check if we're in a Git repository
if not exist ".git" (
    echo ❌ This is not a Git repository. Please run this script from the project root.
    pause
    exit /b 1
)

echo ✅ Git repository detected

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Remote origin already configured
    for /f "delims=" %%i in ('git remote get-url origin') do set REMOTE_URL=%%i
    echo    Current remote: !REMOTE_URL!
) else (
    echo ⚠️  No remote origin configured
    echo Please create a new repository on GitHub and enter the URL below:
    echo Example: https://github.com/yourusername/onenote-ai-assistant.git
    echo.
    set /p REPO_URL="Enter your GitHub repository URL: "
    
    if "!REPO_URL!" neq "" (
        git remote add origin "!REPO_URL!"
        echo ✅ Remote origin added: !REPO_URL!
    ) else (
        echo ❌ No repository URL provided. Exiting.
        pause
        exit /b 1
    )
)

REM Check for uncommitted changes
git status --porcelain | find /v "" >nul
if %errorlevel% equ 0 (
    echo 📝 Uncommitted changes detected
    git status --short
    echo.
    set /p COMMIT_CHANGES="Do you want to commit these changes? (y/n): "
    
    if /i "!COMMIT_CHANGES!" equ "y" (
        set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
        if "!COMMIT_MSG!" equ "" set COMMIT_MSG=Update OneNote AI Assistant
        
        git add .
        git commit -m "!COMMIT_MSG!"
        echo ✅ Changes committed
    )
)

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git push -u origin master >nul 2>&1
if %errorlevel% neq 0 (
    git push -u origin main >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Failed to push to GitHub
        echo Please check your GitHub credentials and repository permissions
        echo.
        echo Try running these commands manually:
        echo   git push -u origin master
        echo   or
        echo   git push -u origin main
        pause
        exit /b 1
    )
)

echo ✅ Successfully pushed to GitHub!
echo.
echo 🎉 Your OneNote AI Assistant is now on GitHub!
for /f "delims=" %%i in ('git remote get-url origin') do set REPO_URL=%%i
echo 📖 You can view it at: %REPO_URL:.git=%
echo.
echo 📋 Next steps:
echo 1. Update README.md with your actual GitHub username
echo 2. Configure GitHub Pages if needed
echo 3. Set up CI/CD workflows (optional)
echo 4. Add collaborators if working in a team
echo.
echo 🌟 Don't forget to star your repository!
echo ✨ Happy coding!
echo.
pause
