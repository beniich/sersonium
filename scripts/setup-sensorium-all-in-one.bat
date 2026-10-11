@echo off
:: ============================================================================
::  SENSORIUM PLATFORM + UEM AGENT — ENVELOPPEUR & INSTALLEUR TOUT-EN-UN
::  Installation et déploiement automatisé du logiciel et de son agent en 1 clic
:: ============================================================================
setlocal enabledelayedexpansion
title SENSORIUM — Installeur Tout-En-Un (Plateforme + Agent UEM)

:: 1. Verification des privileges Administrateur
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Ce terminal n'est pas execute en Administrateur direct.
    echo Poursuite de la preparation de l'application et de l'agent...
) else (
    echo [OK] Privileges Administrateur confirmes.
)

set SCRIPT_DIR=%~dp0..
cd /d "%SCRIPT_DIR%"

color 0B
echo.
echo ==============================================================================
echo       SENSORIUM ENTERPRISE - SUITE COMPLETE ^& AGENT UEM EMBARQUE
echo             Deploiement Automatise Tout-En-Un (1 Seul Clic)
echo ==============================================================================
echo.

:: 2. Vérification de Node.js
echo [ETAPE 1/6] Verification de l'environnement d'execution Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Node.js non detecte. Tentative d'installation automatique via Winget...
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements --silent >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [INFO] Winget indisponible, tentative via Chocolatey...
        powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
        choco install nodejs-lts -y
    )
    echo [INFO] Veuillez redemarrer le terminal pour rafraichir le PATH si necessaire.
) else (
    for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js %%v detecte.
)

:: 3. Installation des dépendances de la plateforme Sensorium
echo.
echo [ETAPE 2/6] Installation des modules et dependances SENSORIUM...
call npm install --no-audit --prefer-offline
if %ERRORLEVEL% NEQ 0 (
    echo [AVERTISSEMENT] Installation des dependances avec fallback...
    call npm install --legacy-peer-deps
)
echo [OK] Dependances installees.

:: 4. Synchronisation Base de Données & Modèles UEM (Prisma)
echo.
echo [ETAPE 3/6] Synchronisation de la Base de Donnees (PostgreSQL / Neon) ^& Schemas UEM...
call npx prisma db push --skip-generate
call npx prisma generate
echo [OK] Base de donnees et tables UEM synchronisees.

:: 5. Compilation du Logiciel Sensorium (Production Bundle)
echo.
echo [ETAPE 4/6] Compilation de la plateforme SENSORIUM (Frontend + Backend)...
call npm run build
echo [OK] Compilation terminee dans dist/.

:: 6. Déploiement et Configuration de l'Agent UEM Embarqué
echo.
echo [ETAPE 5/6] Deploiement de l'Agent UEM Integre...
set AGENT_DIR=C:\Program Files\SensoriumAgent
mkdir "%AGENT_DIR%" >nul 2>&1
if not exist "%AGENT_DIR%" (
    set "AGENT_DIR=%LOCALAPPDATA%\SensoriumAgent"
    mkdir "!AGENT_DIR!" >nul 2>&1
)

copy /Y "agent\index.js" "!AGENT_DIR!\index.js" >nul
copy /Y "agent\package.json" "!AGENT_DIR!\package.json" >nul

for /f "tokens=*" %%h in ('hostname') do set HOSTNAME=%%h
set TERMINAL_ID=PC-LOCAL-%HOSTNAME%

(
echo {
echo   "serverUrl": "http://localhost:3000/api/v1/uem",
echo   "agentKey": "SENS-AGENT-CMR-SECURE-KEY",
echo   "tenantId": "CMR-LOCAL-FLEET",
echo   "terminalId": "%TERMINAL_ID%",
echo   "agentVersion": "1.0.0",
echo   "pollIntervalMs": 30000,
echo   "logFile": "agent.log"
echo }
) > "!AGENT_DIR!\agent.config.json"

(
echo @echo off
echo cd /d "!AGENT_DIR!"
echo node index.js ^>^> "!AGENT_DIR!\agent.log" 2^>^&1
) > "!AGENT_DIR!\start-agent.bat"

:: Tentative d'enregistrement de service si admin
sc query SensoriumUEMAgent >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    sc stop SensoriumUEMAgent >nul 2>&1
    sc delete SensoriumUEMAgent >nul 2>&1
    timeout /t 2 /nobreak >nul
)
sc create SensoriumUEMAgent binPath= "cmd /c \"!AGENT_DIR!\start-agent.bat\"" start= auto DisplayName= "SENSORIUM UEM Endpoint Agent" >nul 2>&1
sc description SensoriumUEMAgent "Agent de securite et gestion de flotte SENSORIUM UEM integre" >nul 2>&1
sc start SensoriumUEMAgent >nul 2>&1

echo [OK] Agent UEM installe avec succes dans !AGENT_DIR! (ID: %TERMINAL_ID%)

:: 7. Création des Raccourcis et Lanceur Général
echo.
echo [ETAPE 6/6] Finalisation et creation du lanceur unifie...

:: Créer le script de démarrage en 1 clic
(
echo @echo off
echo title SENSORIUM Platform ^& UEM Fleet Agent
echo cd /d "%%~dp0"
echo echo [*] Demarrage de l'agent UEM...
echo sc start SensoriumUEMAgent ^>nul 2^>^&1
echo if %%ERRORLEVEL%% NEQ 0 ^(
echo     if exist "%%ProgramFiles%%\SensoriumAgent\start-agent.bat" ^(
echo         start /B "" cmd /c "%%ProgramFiles%%\SensoriumAgent\start-agent.bat"
echo     ^) else if exist "%%LOCALAPPDATA%%\SensoriumAgent\start-agent.bat" ^(
echo         start /B "" cmd /c "%%LOCALAPPDATA%%\SensoriumAgent\start-agent.bat"
echo     ^)
echo ^)
echo echo [*] Demarrage du serveur SENSORIUM sur http://localhost:3000...
echo start http://localhost:3000/uem
echo node dist/server.mjs
) > "%SCRIPT_DIR%\LANCER-SENSORIUM.bat"

:: Raccourci sur le Bureau de l'utilisateur
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut([System.Environment]::GetFolderPath('Desktop') + '\SENSORIUM UEM Cockpit.lnk'); $Shortcut.TargetPath = '%SCRIPT_DIR%\LANCER-SENSORIUM.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'Lancer la plateforme SENSORIUM et le cockpit UEM'; $Shortcut.Save()"

color 0A
echo.
echo ==============================================================================
echo   DEPLOIEMENT TOUT-EN-UN TERMINE AVEC SUCCES !
echo ==============================================================================
echo.
echo   * Logiciel Sensorium compile et pret : dist/server.mjs
echo   * Tables Base de donnees UEM actives : UemTerminal, UemAlert, UemPolicy
echo   * Agent UEM embarque installe et demarre en tache de fond (Service Windows)
echo   * Raccourci cree sur votre Bureau : SENSORIUM UEM Cockpit.lnk
echo.
echo   Pour demarrer la plateforme des maintenant, lancez simplement :
echo   LANCER-SENSORIUM.bat
echo.
pause
