@echo off
title Aether App Suite - Dev UI
echo Starting Aether App Suite...
echo.
set AETHER_PLUGIN_DIR=%~dp0plugins
cmd /c "npm run tauri dev"
pause
