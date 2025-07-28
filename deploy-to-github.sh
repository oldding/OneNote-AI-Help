#!/bin/bash

# OneNote AI Assistant - GitHub Deployment Script
# This script helps you deploy your OneNote AI Assistant to GitHub

echo "🚀 OneNote AI Assistant - GitHub Deployment"
echo "==========================================="

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git is installed"

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    echo "❌ This is not a Git repository. Please run this script from the project root."
    exit 1
fi

echo "✅ Git repository detected"

# Check if remote origin exists
if git remote get-url origin &> /dev/null; then
    echo "✅ Remote origin already configured"
    REMOTE_URL=$(git remote get-url origin)
    echo "   Current remote: $REMOTE_URL"
else
    echo "⚠️  No remote origin configured"
    echo "Please create a new repository on GitHub and run:"
    echo "git remote add origin https://github.com/yourusername/onenote-ai-assistant.git"
    echo ""
    read -p "Enter your GitHub repository URL: " REPO_URL
    
    if [ -n "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        echo "✅ Remote origin added: $REPO_URL"
    else
        echo "❌ No repository URL provided. Exiting."
        exit 1
    fi
fi

# Check for staged changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Uncommitted changes detected"
    git status --short
    echo ""
    read -p "Do you want to commit these changes? (y/n): " COMMIT_CHANGES
    
    if [ "$COMMIT_CHANGES" = "y" ] || [ "$COMMIT_CHANGES" = "Y" ]; then
        read -p "Enter commit message: " COMMIT_MSG
        if [ -n "$COMMIT_MSG" ]; then
            git add .
            git commit -m "$COMMIT_MSG"
            echo "✅ Changes committed"
        else
            git add .
            git commit -m "Update OneNote AI Assistant"
            echo "✅ Changes committed with default message"
        fi
    fi
fi

# Push to GitHub
echo "🚀 Pushing to GitHub..."
if git push -u origin master 2>/dev/null || git push -u origin main 2>/dev/null; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Your OneNote AI Assistant is now on GitHub!"
    echo "📖 You can view it at: $(git remote get-url origin | sed 's/\.git$//')"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update README.md with your actual GitHub username"
    echo "2. Configure GitHub Pages if needed"
    echo "3. Set up CI/CD workflows (optional)"
    echo "4. Add collaborators if working in a team"
else
    echo "❌ Failed to push to GitHub"
    echo "Please check your GitHub credentials and repository permissions"
    exit 1
fi

echo ""
echo "🌟 Don't forget to star your repository!"
echo "✨ Happy coding!"
