@echo off
echo ================================
echo OneNote AI数字人助理启动脚本
echo ================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误：未检测到Node.js，请先安装Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

REM 显示Node.js版本
echo 检测到Node.js版本：
node --version
echo.

REM 检查环境变量文件
if not exist .env (
    echo 警告：未找到.env文件，请配置DeepSeek API密钥
    echo 请复制.env.example为.env并填入您的API密钥
    echo.
    echo 是否继续启动？(Y/N)
    set /p choice=
    if /i not "%choice%"=="Y" exit /b 0
)

REM 启动服务器
echo 正在启动OneNote AI助理服务器...
echo 服务器地址：http://localhost:3000
echo 按Ctrl+C停止服务器
echo.
node server.js

pause
