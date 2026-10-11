@echo off
title SENSORIUM Platform & UEM Fleet Agent
cd /d "%~dp0"

echo ===================================================
echo   Lancement de SENSORIUM Platform & Agent UEM
echo ===================================================

:: 1. Demarrage de l'Agent UEM en arriere-plan
echo [*] Initialisation de l'Agent UEM local...
sc start SensoriumUEMAgent >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "%ProgramFiles%\SensoriumAgent\start-agent.bat" (
        start /B "" cmd /c "%ProgramFiles%\SensoriumAgent\start-agent.bat"
    ) else if exist "%LOCALAPPDATA%\SensoriumAgent\start-agent.bat" (
        start /B "" cmd /c "%LOCALAPPDATA%\SensoriumAgent\start-agent.bat"
    )
)

:: 2. Ouverture automatique de l'interface navigateur
echo [*] Ouverture de la console Cockpit UEM sur http://localhost:3000/uem...
timeout /t 2 /nobreak >nul
start http://localhost:3000/uem

:: 3. Lancement du Serveur Sensorium
echo [*] Demarrage du serveur SENSORIUM...
node dist/server.mjs
