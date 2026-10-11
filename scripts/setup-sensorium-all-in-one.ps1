<#
.SYNOPSIS
    SENSORIUM Platform & UEM Agent — Déployeur et Enveloppeur Tout-En-Un PowerShell
.DESCRIPTION
    Installe et configure automatiquement la suite logicielle SENSORIUM ainsi que son agent
    de gestion de terminaux (UEM) en un seul passage, avec création des services et règles pare-feu.
#>

param(
    [string]$ServerPort = "3000",
    [string]$AgentKey = "SENS-AGENT-CMR-SECURE-KEY",
    [string]$TenantId = "CMR-LOCAL-FLEET",
    [switch]$SkipBuild = $false
)

# 1. Vérification Élévation Administrateur
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Elévation requise. Relance du script en Administrateur..."
    Start-Process powershell -Verb RunAs -ArgumentList ("-NoProfile -ExecutionPolicy Bypass -File `"{0}`"" -f $MyInvocation.MyCommand.Path)
    exit
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\.."

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "      SENSORIUM ENTERPRISE — DEPLOIEMENT TOUT-EN-UN (LOGICIEL + AGENT UEM)    " -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# 2. Vérification Node.js
Write-Host "[1/6] Vérification de l'environnement Node.js..." -ForegroundColor Yellow
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js manquant. Installation automatique..." -ForegroundColor DarkYellow
    winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}
$nodeVer = node --version
Write-Host "  -> Node.js actif: $nodeVer" -ForegroundColor Green

# 3. Installation Dépendances
Set-Location $ProjectRoot
Write-Host "`n[2/6] Installation des dépendances npm..." -ForegroundColor Yellow
npm install --no-audit
Write-Host "  -> Dépendances prêtes." -ForegroundColor Green

# 4. Synchronisation Base de Données
Write-Host "`n[3/6] Synchronisation de la base de données Prisma..." -ForegroundColor Yellow
npx prisma db push --skip-generate
npx prisma generate
Write-Host "  -> Schéma base de données et modèles UEM synchronisés." -ForegroundColor Green

# 5. Compilation du bundle
if (-not $SkipBuild) {
    Write-Host "`n[4/6] Compilation de l'application (bundle de production)..." -ForegroundColor Yellow
    npm run build
    Write-Host "  -> Compilation réussie dans dist/." -ForegroundColor Green
}

# 6. Déploiement et enregistrement de l'Agent UEM
Write-Host "`n[5/6] Configuration et enregistrement de l'Agent UEM..." -ForegroundColor Yellow
$AgentDir = "C:\Program Files\SensoriumAgent"
if (-not (Test-Path $AgentDir)) { New-Item -ItemType Directory -Path $AgentDir -Force | Out-Null }

Copy-Item "$ProjectRoot\agent\index.js" "$AgentDir\index.js" -Force
Copy-Item "$ProjectRoot\agent\package.json" "$AgentDir\package.json" -Force

$HostName = [System.Net.Dns]::GetHostName()
$TerminalId = "PC-CMR-$HostName"

$AgentConfig = @{
    serverUrl = "http://localhost:$ServerPort/api/v1/uem"
    agentKey = $AgentKey
    tenantId = $TenantId
    terminalId = $TerminalId
    agentVersion = "1.0.0"
    pollIntervalMs = 30000
    logFile = "$AgentDir\agent.log"
} | ConvertTo-Json -Depth 4

Set-Content -Path "$AgentDir\agent.config.json" -Value $AgentConfig -Encoding UTF8

# Wrapper démarrage agent
$AgentBat = @"
@echo off
cd /d "$AgentDir"
node index.js >> "$AgentDir\agent.log" 2>&1
"@
Set-Content -Path "$AgentDir\start-agent.bat" -Value $AgentBat -Encoding ASCII

# Service Windows
if (Get-Service -Name "SensoriumUEMAgent" -ErrorAction SilentlyContinue) {
    Stop-Service "SensoriumUEMAgent" -Force -ErrorAction SilentlyContinue
    & sc.exe delete "SensoriumUEMAgent" | Out-Null
    Start-Sleep -Seconds 2
}

& sc.exe create "SensoriumUEMAgent" binPath= "cmd /c `"$AgentDir\start-agent.bat`"" start= auto DisplayName= "SENSORIUM UEM Endpoint Agent" | Out-Null
& sc.exe description "SensoriumUEMAgent" "Agent de securite et gestion de flotte SENSORIUM UEM integre" | Out-Null
Start-Service "SensoriumUEMAgent" -ErrorAction SilentlyContinue

Write-Host "  -> Agent UEM opérationnel et démarré (ID: $TerminalId)" -ForegroundColor Green

# 7. Règle Pare-feu & Raccourcis
Write-Host "`n[6/6] Configuration du réseau local et raccourcis..." -ForegroundColor Yellow
if (-not (Get-NetFirewallRule -DisplayName "SENSORIUM Server" -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName "SENSORIUM Server" -Direction Inbound -LocalPort $ServerPort -Protocol TCP -Action Allow | Out-Null
    Write-Host "  -> Règle pare-feu ouverte sur le port $ServerPort." -ForegroundColor Green
}

# Raccourci Bureau
$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\SENSORIUM UEM Cockpit.lnk")
$Shortcut.TargetPath = "$ProjectRoot\LANCER-SENSORIUM.bat"
$Shortcut.WorkingDirectory = "$ProjectRoot"
$Shortcut.Description = "Lancer la plateforme SENSORIUM et le cockpit UEM"
$Shortcut.Save()

Write-Host "`n==============================================================================" -ForegroundColor Green
Write-Host "        DEPLOIEMENT UNIFIE TERMINE AVEC SUCCES !                              " -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "  * Plateforme SENSORIUM prête sur le port $ServerPort" -ForegroundColor Cyan
Write-Host "  * Agent UEM démarré en service d'arrière-plan (SensoriumUEMAgent)" -ForegroundColor Cyan
Write-Host "  * Tableau de bord UEM accessible sur http://localhost:$ServerPort/uem" -ForegroundColor Cyan
Write-Host ""
