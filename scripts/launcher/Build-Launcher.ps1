<#
.SYNOPSIS
    Build script: Compile SensoriumLauncher.ps1 -> SensoriumLauncher.exe
    Uses PS2EXE (no admin rights required)
    Output: ~2-4 MB standalone Windows executable
#>

param(
    [string]$OutputDir = "$PSScriptRoot\dist",
    [switch]$NoConsole = $true
)

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  SENSORIUM LAUNCHER — Build Script" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install PS2EXE if not present
Write-Host "[1/3] Verification de PS2EXE..." -ForegroundColor Yellow
if (-not (Get-Module -ListAvailable -Name ps2exe)) {
    Write-Host "      Installation de PS2EXE depuis PSGallery..." -ForegroundColor Gray
    Install-Module -Name ps2exe -Scope CurrentUser -Force -AllowClobber
    Write-Host "      PS2EXE installe." -ForegroundColor Green
} else {
    Write-Host "      PS2EXE deja present." -ForegroundColor Green
}

Import-Module ps2exe -Force

# Step 2: Prepare output directory
Write-Host "[2/3] Preparation du dossier de sortie : $OutputDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# Step 3: Compile
$InputScript = "$PSScriptRoot\SensoriumLauncher.ps1"
$OutputExe   = "$OutputDir\SensoriumLauncher.exe"
$IconPath    = "$PSScriptRoot\icon.ico"

Write-Host "[3/3] Compilation en cours..." -ForegroundColor Yellow

$compileArgs = @{
    inputFile        = $InputScript
    outputFile       = $OutputExe
    noConsole        = $true
    requireAdmin     = $false
    title            = "Sensorium Launcher"
    description      = "Sensorium Zero-Config Hardware Bootstrapper"
    company          = "Sensorium AI"
    product          = "Sensorium Edge Suite"
    copyright        = "Copyright 2026 Sensorium AI"
    version          = "2.4.0.0"
    x64              = $true
}

# Add icon if it exists
if (Test-Path $IconPath) {
    $compileArgs["iconFile"] = $IconPath
    Write-Host "      Icone personnalisee utilisee." -ForegroundColor Gray
}

Invoke-ps2exe @compileArgs

if (Test-Path $OutputExe) {
    $sizeMB = [math]::Round((Get-Item $OutputExe).Length / 1MB, 2)
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "  BUILD REUSSI !" -ForegroundColor Green
    Write-Host "  Fichier : $OutputExe" -ForegroundColor White
    Write-Host "  Taille  : $sizeMB MB" -ForegroundColor White
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Pour tester maintenant :" -ForegroundColor Cyan
    Write-Host "  & '$OutputExe'" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "  ERREUR : La compilation a echoue." -ForegroundColor Red
    exit 1
}
