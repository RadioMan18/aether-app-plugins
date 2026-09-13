@echo off
title Aether App Suite - Dev UI
echo Starting Aether App Suite...
echo.
cd /d "%~dp0"
set "AETHER_PLUGIN_DIR=%~dp0plugins"
npm run tauri dev
pause
