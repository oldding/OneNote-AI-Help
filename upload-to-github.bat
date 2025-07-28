@echo off
echo 🚀 OneNote AI Assistant - GitHub Upload
echo =====================================
echo.
echo 请确保您已经在GitHub上创建了仓库：
echo https://github.com/oldding/onenote-ai-assistant
echo.
echo 如果还没有创建，请：
echo 1. 访问 https://github.com/new
echo 2. 仓库名称：onenote-ai-assistant
echo 3. 设置为Public
echo 4. 不要勾选README、.gitignore、License（我们已经有了）
echo 5. 点击Create repository
echo.
pause

echo 正在推送到GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ 成功上传到GitHub！
    echo 📖 您可以访问：https://github.com/oldding/onenote-ai-assistant
    echo.
    echo 🎉 OneNote AI助理已成功部署到GitHub！
) else (
    echo.
    echo ❌ 上传失败，请检查：
    echo 1. GitHub仓库是否已创建
    echo 2. 仓库名称是否正确：onenote-ai-assistant
    echo 3. 您是否有推送权限
)

echo.
pause
