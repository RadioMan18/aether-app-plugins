@echo off
title Aether App Suite - Dev UI
echo Starting Aether App Suite...
echo.
set OPENSSL_DIR=C:\Program Files\OpenSSL-Win64
set LIB=%LIB%;C:\Program Files\OpenSSL-Win64\lib\VC\x64\MD
cmd /c "npm run tauri dev"
pause
