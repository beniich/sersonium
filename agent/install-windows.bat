@echo off
:: ═══════════════════════════════════════════════════════════════════════════════
::  SENSORIUM UEM Agent — Installeur Automatique Windows
::  Ce script doit être exécuté en tant qu'Administrateur.
::
::  Il réalise les opérations suivantes :
::    1. Vérifie Node.js (installe Chocolatey + Node si absent)
::    2. Copie l'agent dans C:\Program Files\SensoriumAgent
::    3. Configure agent.config.json avec les paramètres du tenant
::    4. Crée un service Windows via sc.exe (démarrage automatique)
::    5. Démarre le service immédiatement
:: ═══════════════════════════════════════════════════════════════════════════════

title SENSORIUM UEM Agent — Installation

:: Vérifier les droits Admin
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Ce script doit etre execute en tant qu'Administrateur.
    echo Clic-droit sur le fichier -^> "Executer en tant qu'administrateur"
    pause
    exit /b 1
)

echo.
echo ====================================================
echo   SENSORIUM UEM Agent v1.0.0 — Installation
echo ====================================================
echo.

:: ─── Paramètres à personnaliser ──────────────────────────────────────────────
set SERVER_URL=https://api.sensorium.io/api/v1/uem
set AGENT_KEY=SENS-AGENT-CMR-SECURE-KEY
set TENANT_ID=YOUR_TENANT_ID_HERE
set TERMINAL_PREFIX=PC-CMR

set INSTALL_DIR=C:\Program Files\SensoriumAgent
set SERVICE_NAME=SensoriumUEMAgent
set NODE_MIN_VERSION=18

:: Générer un ID terminal unique basé sur le hostname
for /f "tokens=*" %%h in ('hostname') do set HOSTNAME=%%h
set TERMINAL_ID=%TERMINAL_PREFIX%-%HOSTNAME%

echo [1/6] Verification de Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Node.js non trouve. Installation via Chocolatey...

    :: Installer Chocolatey si absent
    where choco >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [INFO] Installation de Chocolatey...
        powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
        if %ERRORLEVEL% NEQ 0 (
            echo [ERREUR] Echec installation Chocolatey. Veuillez installer Node.js manuellement depuis nodejs.org
            pause
            exit /b 1
        )
        :: Recharger PATH
        call refreshenv
    )

    choco install nodejs --version=20.0.0 -y
    call refreshenv

    node --version >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Node.js n'a pas pu etre installe.
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%v in ('node --version') do echo [OK] Node.js %%v detecte.
)

echo.
echo [2/6] Copie des fichiers de l'agent...

:: Créer le dossier d'installation
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Copier les fichiers de l'agent
set SCRIPT_DIR=%~dp0
if exist "%SCRIPT_DIR%index.js" (
    copy /Y "%SCRIPT_DIR%index.js" "%INSTALL_DIR%\index.js" >nul
    copy /Y "%SCRIPT_DIR%package.json" "%INSTALL_DIR%\package.json" >nul
) else if exist "%SCRIPT_DIR%agent\index.js" (
    copy /Y "%SCRIPT_DIR%agent\index.js" "%INSTALL_DIR%\index.js" >nul
    copy /Y "%SCRIPT_DIR%agent\package.json" "%INSTALL_DIR%\package.json" >nul
) else (
    echo [ERREUR] Fichiers index.js et package.json introuvables.
    pause
    exit /b 1
)

echo [OK] Fichiers copies dans %INSTALL_DIR%

echo.
echo [3/6] Generation de la configuration...

:: Écrire la configuration JSON
(
echo {
echo   "serverUrl": "%SERVER_URL%",
echo   "agentKey": "%AGENT_KEY%",
echo   "tenantId": "%TENANT_ID%",
echo   "terminalId": "%TERMINAL_ID%",
echo   "agentVersion": "1.0.0",
echo   "pollIntervalMs": 60000,
echo   "logFile": "C:\\Program Files\\SensoriumAgent\\agent.log"
echo }
) > "%INSTALL_DIR%\agent.config.json"

echo [OK] Configuration generee : Terminal ID = %TERMINAL_ID%

echo.
echo [4/6] Installation du service Windows...

:: Supprimer l'ancien service si existant
sc query %SERVICE_NAME% >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Arret et suppression de l'ancien service...
    sc stop %SERVICE_NAME% >nul 2>&1
    timeout /t 3 /nobreak >nul
    sc delete %SERVICE_NAME% >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: Trouver le chemin de node.exe
for /f "tokens=*" %%p in ('where node') do set NODE_PATH=%%p

:: Créer un wrapper VBScript pour le service (node ne peut pas être un service direct)
(
echo Set oShell = CreateObject("WScript.Shell"^)
echo oShell.Run "cmd /c node """ & Chr(34^) & "%INSTALL_DIR%\index.js" & Chr(34^) & """", 0, False
) > "%INSTALL_DIR%\launcher.vbs"

:: Créer le wrapper batch pour le service
(
echo @echo off
echo cd /d "%INSTALL_DIR%"
echo node index.js ^>^> agent.log 2^>^&1
) > "%INSTALL_DIR%\start.bat"

:: Utiliser PowerShell pour créer un vrai service Windows
powershell -Command "New-Service -Name '%SERVICE_NAME%' -BinaryPathName 'cmd.exe /c \"%INSTALL_DIR%\start.bat\"' -DisplayName 'SENSORIUM UEM Agent' -Description 'SENSORIUM Unified Endpoint Management Agent - Gestion et securite des terminaux' -StartupType Automatic" 2>nul

if %ERRORLEVEL% NEQ 0 (
    :: Fallback : sc create
    sc create %SERVICE_NAME% binPath= "cmd.exe /k cd /d \"%INSTALL_DIR%\" && node index.js" start= auto DisplayName= "SENSORIUM UEM Agent" obj= LocalSystem
)

:: Alternative robuste avec NSSM si disponible
where nssm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] NSSM detecte — utilisation pour un service robuste...
    nssm install %SERVICE_NAME% "%NODE_PATH%" "%INSTALL_DIR%\index.js" >nul
    nssm set %SERVICE_NAME% AppDirectory "%INSTALL_DIR%" >nul
    nssm set %SERVICE_NAME% DisplayName "SENSORIUM UEM Agent" >nul
    nssm set %SERVICE_NAME% Description "SENSORIUM Unified Endpoint Management Agent" >nul
    nssm set %SERVICE_NAME% Start SERVICE_AUTO_START >nul
    nssm set %SERVICE_NAME% AppStdout "%INSTALL_DIR%\agent.log" >nul
    nssm set %SERVICE_NAME% AppStderr "%INSTALL_DIR%\agent_error.log" >nul
    echo [OK] Service installe via NSSM.
) else (
    echo [OK] Service Windows cree.
)

echo.
echo [5/6] Demarrage du service...
sc start %SERVICE_NAME% >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Service SENSORIUM UEM Agent demarre avec succes.
) else (
    echo [WARN] Le service a ete installe mais n'a pas pu demarrer automatiquement.
    echo [INFO] Demarrage manuel : sc start %SERVICE_NAME%
)

echo.
echo [6/6] Verification finale...
timeout /t 3 /nobreak >nul
sc query %SERVICE_NAME% | findstr "RUNNING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Agent UEM actif et en cours d'execution.
) else (
    echo [INFO] Le service peut prendre quelques secondes a demarrer.
    echo [INFO] Verifiez avec : sc query %SERVICE_NAME%
)

echo.
echo ====================================================
echo   Installation terminee avec succes!
echo.
echo   Terminal ID : %TERMINAL_ID%
echo   Serveur     : %SERVER_URL%
echo   Logs        : %INSTALL_DIR%\agent.log
echo   Service     : %SERVICE_NAME%
echo.
echo   Commandes utiles :
echo     sc start %SERVICE_NAME%   (demarrer)
echo     sc stop  %SERVICE_NAME%   (arreter)
echo     sc query %SERVICE_NAME%   (statut)
echo ====================================================
echo.
pause
