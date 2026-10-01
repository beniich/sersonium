; ============================================================================
; Sensorium Suite — Windows Installer Script (Inno Setup 6)
; Output: SensoriumSetup.exe (~5 MB standalone installer)
; Download Inno Setup: https://jrsoftware.org/isinfo.php
; Build: ISCC.exe SensoriumSetup.iss
; ============================================================================

#define AppName      "Sensorium"
#define AppVersion   "2.4.0"
#define AppPublisher "Sensorium AI"
#define AppURL       "https://sensorium.io"
#define AppExeName   "SensoriumLauncher.exe"
#define AppDesc      "Sovereign Edge AI Appliance Suite"

[Setup]
AppId={{A7F3C2E1-4B9D-4F2A-B8C3-E1D5F6A7B8C9}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}/support
AppUpdatesURL={#AppURL}/updates
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
AllowNoIcons=yes
LicenseFile=
OutputDir=dist\installer
OutputBaseFilename=SensoriumSetup-{#AppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
DisableWelcomePage=no
DisableDirPage=no
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
UninstallDisplayIcon={app}\{#AppExeName}
SetupIconFile=
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
MinVersion=10.0

; Custom Installer UI Colors (Dark Theme approximation via WizardImageFile)
WizardImageStretch=yes
WizardResizable=yes

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon";    Description: "Creer une icone sur le Bureau";       GroupDescription: "Raccourcis additionnels :"; Flags: unchecked
Name: "startupicon";    Description: "Lancer Sensorium au demarrage de Windows"; GroupDescription: "Demarrage automatique :"; Flags: unchecked
Name: "firewall_rule";  Description: "Autoriser la decouverte mDNS (UDP 5353)"; GroupDescription: "Reseau :"; Flags: unchecked

[Files]
; Main launcher executable
Source: "dist\{#AppExeName}"; DestDir: "{app}"; Flags: ignoreversion

; README and documentation
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion isreadme

[Icons]
Name: "{autoprograms}\{#AppName}";         Filename: "{app}\{#AppExeName}"; Comment: "{#AppDesc}"
Name: "{autodesktop}\{#AppName}";          Filename: "{app}\{#AppExeName}"; Comment: "{#AppDesc}"; Tasks: desktopicon
Name: "{userstartup}\{#AppName} Launcher"; Filename: "{app}\{#AppExeName}"; Tasks: startupicon

[Registry]
; File association and protocol handler for sensorium://
Root: HKCU; Subkey: "Software\{#AppPublisher}\{#AppName}"; ValueType: string; ValueName: "InstallPath"; ValueData: "{app}"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\{#AppPublisher}\{#AppName}"; ValueType: string; ValueName: "Version";     ValueData: "{#AppVersion}"

; Protocol handler: sensorium://
Root: HKCU; Subkey: "Software\Classes\sensorium";                  ValueType: string; ValueName: ""; ValueData: "URL:Sensorium Protocol"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\sensorium";                  ValueType: string; ValueName: "URL Protocol"; ValueData: ""
Root: HKCU; Subkey: "Software\Classes\sensorium\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#AppExeName}"" ""%1"""

[Run]
; Post-install: open the launcher immediately
Filename: "{app}\{#AppExeName}"; Description: "Lancer Sensorium maintenant"; Flags: nowait postinstall skipifsilent

; Optional: Add Windows Firewall rule for mDNS
Filename: "netsh"; Parameters: "advfirewall firewall add rule name=""mDNS Sensorium"" dir=in action=allow protocol=udp localport=5353 profile=private,domain"; StatusMsg: "Configuration du pare-feu mDNS..."; Flags: runhidden; Tasks: firewall_rule

[UninstallRun]
; Remove firewall rule on uninstall
Filename: "netsh"; Parameters: "advfirewall firewall delete rule name=""mDNS Sensorium"""; Flags: runhidden

[Code]
// Custom installer code for prerequisite checks
procedure InitializeWizard();
begin
  // Custom welcome message
  WizardForm.WelcomeLabel2.Caption :=
    'Ce programme va installer ' + ExpandConstant('{#AppName}') + ' ' +
    ExpandConstant('{#AppVersion}') + ' sur votre ordinateur.' + #13#10 + #13#10 +
    'Sensorium Launcher detecte automatiquement votre Terminal ' +
    'Physique Silicium X1 via USB-C et vous connecte en mode ' +
    'Souverain Local ou Cloud Hybride.' + #13#10 + #13#10 +
    'Il est recommande de fermer toutes les applications avant de continuer.';
end;

function InitializeSetup(): Boolean;
var
  WinVer: TWindowsVersion;
begin
  GetWindowsVersionEx(WinVer);
  // Require Windows 10+
  if (WinVer.Major < 10) then
  begin
    MsgBox(
      'Sensorium necessite Windows 10 ou superieur.' + #13#10 +
      'Votre version de Windows n est pas compatible.',
      mbError, MB_OK
    );
    Result := False;
  end else
    Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // Create a flag file to indicate fresh install
    SaveStringToFile(
      ExpandConstant('{app}\first_run.flag'),
      'first_run=true' + #13#10 + 'installed_version={#AppVersion}',
      False
    );
  end;
end;
