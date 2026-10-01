# Sensorium Launcher — Windows Bootstrapper

> Zero-Config hardware detection — branchez, ouvrez, travaillez.

## Description

`SensoriumLauncher.exe` est un micro-lanceur Windows (~2-4 Mo) qui :

1. **Detecte automatiquement** le Terminal Sensorium Silicium X1 branche en USB-C
2. **Affiche les KPIs** du terminal (latence, NPU TOPS, version firmware)
3. **Ouvre l application** dans le navigateur par defaut en mode Local ou Cloud

## Flux de Detection

```
Lancement
    |
    v
[1] Probe mDNS : http://sensorium.local:3000/healthcheck  (timeout: 2s)
    |-- OK --> Mode LOCAL HARDWARE (souverain, air-gap)
    |
    v
[2] Probe USB-RNDIS : http://192.168.7.1:3000/healthcheck (timeout: 2s)
    |-- OK --> Mode LOCAL HARDWARE
    |
    v
[3] Fallback Cloud : https://app.sensorium.io
         --> Mode CLOUD HYBRIDE
```

## Utilisation

### Mode simple (test direct, sans compiler)
```powershell
# Autoriser l execution de scripts (une seule fois)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Lancer directement
powershell -File .\SensoriumLauncher.ps1
```

### Mode production (compiler en .exe)
```powershell
# Compiler le .exe (installe PS2EXE automatiquement si besoin)
powershell -File .\Build-Launcher.ps1

# Lancer l executable
.\dist\SensoriumLauncher.exe
```

## Prerequis

- Windows 10 / 11 (x64)
- PowerShell 5.1+ (inclus dans Windows)
- PS2EXE (installe automatiquement par Build-Launcher.ps1)

## Architecture des Fichiers

```
scripts/launcher/
├── SensoriumLauncher.ps1   # Script principal (GUI WinForms)
├── Build-Launcher.ps1      # Script de compilation -> .exe
├── icon.ico                # (optionnel) Icone personnalisee
├── dist/
│   └── SensoriumLauncher.exe  # Executable final (cree par build)
└── README.md               # Ce fichier
```

## Configuration

Les parametres (URLs, timeouts) sont dans le bloc `$Config` en debut de script :

| Parametre       | Valeur defaut                  | Description                        |
|-----------------|--------------------------------|------------------------------------|
| `LocalMDNS`     | `http://sensorium.local:3000`  | Adresse mDNS du terminal           |
| `LocalUSBIP`    | `http://192.168.7.1:3000`      | IP fixe USB-RNDIS du terminal      |
| `CloudURL`      | `https://app.sensorium.io`     | URL de l application cloud         |
| `TimeoutMs`     | `2000`                         | Timeout de detection (ms)          |
| `RetryInterval` | `8000`                         | Re-scan auto si mode Cloud (ms)    |

## Firewall Windows

Pour que la detection mDNS fonctionne, le port UDP 5353 doit etre ouvert.
Executer en tant qu administrateur :

```powershell
New-NetFirewallRule -DisplayName "mDNS Sensorium" `
    -Direction Inbound -Protocol UDP -LocalPort 5353 `
    -Action Allow -Profile Private,Domain
```
