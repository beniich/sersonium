<#
.SYNOPSIS
    Sensorium Launcher — Zero-Config Hardware Bootstrapper for Windows
.DESCRIPTION
    Detecte automatiquement le Terminal Physique Silicium X1 via mDNS (sensorium.local)
    ou USB-RNDIS (192.168.7.1), et ouvre l application dans le navigateur.
    En cas d absence, bascule en mode Cloud Hybride.
.VERSION
    2.4.0-sentry
#>

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Net.Http

[System.Windows.Forms.Application]::EnableVisualStyles()
[System.Windows.Forms.Application]::SetCompatibleTextRenderingDefault($false)

# Config
$Config = @{
    AppName       = "Sensorium"
    Version       = "2.4.0-sentry"
    LocalMDNS     = "http://sensorium.local:3000"
    LocalUSBIP    = "http://192.168.7.1:3000"
    CloudURL      = "https://app.sensorium.io"
    HealthPath    = "/healthcheck"
    TimeoutMs     = 2000
    RetryInterval = 8000
    WindowWidth   = 480
    WindowHeight  = 580
}

# Colors
$Colors = @{
    BG            = [System.Drawing.ColorTranslator]::FromHtml("#0b0b0f")
    Surface       = [System.Drawing.ColorTranslator]::FromHtml("#111118")
    Border        = [System.Drawing.ColorTranslator]::FromHtml("#1e1e2e")
    Accent        = [System.Drawing.ColorTranslator]::FromHtml("#00e5ff")
    AccentGreen   = [System.Drawing.ColorTranslator]::FromHtml("#00ff87")
    AccentBlue    = [System.Drawing.ColorTranslator]::FromHtml("#4f87ff")
    Warning       = [System.Drawing.ColorTranslator]::FromHtml("#ffb347")
    TextPrimary   = [System.Drawing.ColorTranslator]::FromHtml("#f0f0f5")
    TextSecondary = [System.Drawing.ColorTranslator]::FromHtml("#6b6b8a")
    ButtonBG      = [System.Drawing.ColorTranslator]::FromHtml("#1a1a2e")
    ButtonHover   = [System.Drawing.ColorTranslator]::FromHtml("#252540")
}

# State
$script:State = @{
    Mode     = "CHECKING"
    TerminalIP = ""
    Firmware = ""
    Tops     = 0
    Latency  = 0
}

# Main Form
$Form = New-Object System.Windows.Forms.Form
$Form.Text             = "Sensorium Launcher"
$Form.Size             = New-Object System.Drawing.Size($Config.WindowWidth, $Config.WindowHeight)
$Form.StartPosition    = [System.Windows.Forms.FormStartPosition]::CenterScreen
$Form.BackColor        = $Colors.BG
$Form.FormBorderStyle  = [System.Windows.Forms.FormBorderStyle]::None
$Form.DoubleBuffered   = $true

# Title Bar
$TitleBar = New-Object System.Windows.Forms.Panel
$TitleBar.Size      = New-Object System.Drawing.Size($Config.WindowWidth, 48)
$TitleBar.Location  = New-Object System.Drawing.Point(0, 0)
$TitleBar.BackColor = [System.Drawing.ColorTranslator]::FromHtml("#0d0d14")

$script:_dragging = $false
$script:_dragOffset = New-Object System.Drawing.Point(0, 0)
$TitleBar.Add_MouseDown({ param($s,$e)
    if ($e.Button -eq [System.Windows.Forms.MouseButtons]::Left) {
        $script:_dragging = $true; $script:_dragOffset = $e.Location
    }
})
$TitleBar.Add_MouseMove({ param($s,$e)
    if ($script:_dragging) {
        $newLoc = [System.Drawing.Point]::Add($Form.Location, [System.Drawing.Size]$e.Location)
        $Form.Location = [System.Drawing.Point]::Subtract($newLoc, [System.Drawing.Size]$script:_dragOffset)
    }
})
$TitleBar.Add_MouseUp({ $script:_dragging = $false })

$LogoDot = New-Object System.Windows.Forms.Label
$LogoDot.Text = "S"; $LogoDot.Font = New-Object System.Drawing.Font("Consolas",16,[System.Drawing.FontStyle]::Bold)
$LogoDot.ForeColor = $Colors.Accent; $LogoDot.Location = New-Object System.Drawing.Point(16, 10)
$LogoDot.Size = New-Object System.Drawing.Size(28, 30); $LogoDot.BackColor = [System.Drawing.Color]::Transparent

$TitleLabel = New-Object System.Windows.Forms.Label
$TitleLabel.Text = "SENSORIUM  Launcher"; $TitleLabel.Font = New-Object System.Drawing.Font("Consolas",10,[System.Drawing.FontStyle]::Bold)
$TitleLabel.ForeColor = $Colors.TextPrimary; $TitleLabel.Location = New-Object System.Drawing.Point(48, 10)
$TitleLabel.Size = New-Object System.Drawing.Size(300, 22); $TitleLabel.BackColor = [System.Drawing.Color]::Transparent

$VerLabel = New-Object System.Windows.Forms.Label
$VerLabel.Text = "v$($Config.Version)"; $VerLabel.Font = New-Object System.Drawing.Font("Consolas",7)
$VerLabel.ForeColor = $Colors.TextSecondary; $VerLabel.Location = New-Object System.Drawing.Point(50, 30)
$VerLabel.Size = New-Object System.Drawing.Size(150,14); $VerLabel.BackColor = [System.Drawing.Color]::Transparent

$CloseBtn = New-Object System.Windows.Forms.Button
$CloseBtn.Text = "x"; $CloseBtn.Font = New-Object System.Drawing.Font("Segoe UI",10)
$CloseBtn.Size = New-Object System.Drawing.Size(40,40); $CloseBtn.Location = New-Object System.Drawing.Point($($Config.WindowWidth-44), 4)
$CloseBtn.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat; $CloseBtn.FlatAppearance.BorderSize = 0
$CloseBtn.BackColor = [System.Drawing.Color]::Transparent; $CloseBtn.ForeColor = $Colors.TextSecondary
$CloseBtn.Cursor = [System.Windows.Forms.Cursors]::Hand
$CloseBtn.Add_Click({ $Form.Close() })
$CloseBtn.Add_MouseEnter({ $CloseBtn.ForeColor = [System.Drawing.ColorTranslator]::FromHtml("#ff5f57") })
$CloseBtn.Add_MouseLeave({ $CloseBtn.ForeColor = $Colors.TextSecondary })
$TitleBar.Controls.AddRange(@($LogoDot, $TitleLabel, $VerLabel, $CloseBtn))

# Status Card
$StatusCard = New-Object System.Windows.Forms.Panel
$StatusCard.Size = New-Object System.Drawing.Size(440, 180); $StatusCard.Location = New-Object System.Drawing.Point(20, 62)
$StatusCard.BackColor = $Colors.Surface; $StatusCard.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle

$StatusDot = New-Object System.Windows.Forms.Label
$StatusDot.Text = "O"; $StatusDot.Font = New-Object System.Drawing.Font("Segoe UI",22)
$StatusDot.ForeColor = $Colors.Warning; $StatusDot.Location = New-Object System.Drawing.Point(16, 18)
$StatusDot.Size = New-Object System.Drawing.Size(40,40); $StatusDot.BackColor = [System.Drawing.Color]::Transparent

$StatusTitle = New-Object System.Windows.Forms.Label
$StatusTitle.Text = "Recherche en cours..."; $StatusTitle.Font = New-Object System.Drawing.Font("Segoe UI",13,[System.Drawing.FontStyle]::Bold)
$StatusTitle.ForeColor = $Colors.TextPrimary; $StatusTitle.Location = New-Object System.Drawing.Point(62, 20)
$StatusTitle.Size = New-Object System.Drawing.Size(365,28); $StatusTitle.BackColor = [System.Drawing.Color]::Transparent

$StatusSub = New-Object System.Windows.Forms.Label
$StatusSub.Text = "Scanning mDNS > sensorium.local > USB-RNDIS..."
$StatusSub.Font = New-Object System.Drawing.Font("Consolas",8); $StatusSub.ForeColor = $Colors.TextSecondary
$StatusSub.Location = New-Object System.Drawing.Point(62,50); $StatusSub.Size = New-Object System.Drawing.Size(365,18)
$StatusSub.BackColor = [System.Drawing.Color]::Transparent

$Sep = New-Object System.Windows.Forms.Panel
$Sep.Size = New-Object System.Drawing.Size(400,1); $Sep.Location = New-Object System.Drawing.Point(20,80)
$Sep.BackColor = $Colors.Border

# KPI Labels
$KpiLatLbl = New-Object System.Windows.Forms.Label
$KpiLatLbl.Text = "LATENCE"; $KpiLatLbl.Font = New-Object System.Drawing.Font("Consolas",7)
$KpiLatLbl.ForeColor = $Colors.TextSecondary; $KpiLatLbl.Location = New-Object System.Drawing.Point(20,96)
$KpiLatLbl.Size = New-Object System.Drawing.Size(120,16); $KpiLatLbl.BackColor = [System.Drawing.Color]::Transparent

$script:KpiLatVal = New-Object System.Windows.Forms.Label
$script:KpiLatVal.Text = "--  ms"; $script:KpiLatVal.Font = New-Object System.Drawing.Font("Consolas",11,[System.Drawing.FontStyle]::Bold)
$script:KpiLatVal.ForeColor = $Colors.Accent; $script:KpiLatVal.Location = New-Object System.Drawing.Point(20,112)
$script:KpiLatVal.Size = New-Object System.Drawing.Size(120,26); $script:KpiLatVal.BackColor = [System.Drawing.Color]::Transparent

$KpiNpuLbl = New-Object System.Windows.Forms.Label
$KpiNpuLbl.Text = "NPU TOPS"; $KpiNpuLbl.Font = New-Object System.Drawing.Font("Consolas",7)
$KpiNpuLbl.ForeColor = $Colors.TextSecondary; $KpiNpuLbl.Location = New-Object System.Drawing.Point(160,96)
$KpiNpuLbl.Size = New-Object System.Drawing.Size(120,16); $KpiNpuLbl.BackColor = [System.Drawing.Color]::Transparent

$script:KpiNpuVal = New-Object System.Windows.Forms.Label
$script:KpiNpuVal.Text = "--"; $script:KpiNpuVal.Font = New-Object System.Drawing.Font("Consolas",11,[System.Drawing.FontStyle]::Bold)
$script:KpiNpuVal.ForeColor = $Colors.Accent; $script:KpiNpuVal.Location = New-Object System.Drawing.Point(160,112)
$script:KpiNpuVal.Size = New-Object System.Drawing.Size(120,26); $script:KpiNpuVal.BackColor = [System.Drawing.Color]::Transparent

$KpiFwLbl = New-Object System.Windows.Forms.Label
$KpiFwLbl.Text = "FIRMWARE"; $KpiFwLbl.Font = New-Object System.Drawing.Font("Consolas",7)
$KpiFwLbl.ForeColor = $Colors.TextSecondary; $KpiFwLbl.Location = New-Object System.Drawing.Point(300,96)
$KpiFwLbl.Size = New-Object System.Drawing.Size(130,16); $KpiFwLbl.BackColor = [System.Drawing.Color]::Transparent

$script:KpiFwVal = New-Object System.Windows.Forms.Label
$script:KpiFwVal.Text = "--"; $script:KpiFwVal.Font = New-Object System.Drawing.Font("Consolas",8,[System.Drawing.FontStyle]::Bold)
$script:KpiFwVal.ForeColor = $Colors.Accent; $script:KpiFwVal.Location = New-Object System.Drawing.Point(300,112)
$script:KpiFwVal.Size = New-Object System.Drawing.Size(130,26); $script:KpiFwVal.BackColor = [System.Drawing.Color]::Transparent

$StatusCard.Controls.AddRange(@($StatusDot, $StatusTitle, $StatusSub, $Sep, $KpiLatLbl, $script:KpiLatVal, $KpiNpuLbl, $script:KpiNpuVal, $KpiFwLbl, $script:KpiFwVal))

# Log Box
$LogBox = New-Object System.Windows.Forms.RichTextBox
$LogBox.Size = New-Object System.Drawing.Size(440, 165); $LogBox.Location = New-Object System.Drawing.Point(20, 256)
$LogBox.BackColor = [System.Drawing.ColorTranslator]::FromHtml("#080810"); $LogBox.ForeColor = $Colors.TextSecondary
$LogBox.Font = New-Object System.Drawing.Font("Consolas",8); $LogBox.ReadOnly = $true
$LogBox.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle; $LogBox.ScrollBars = [System.Windows.Forms.RichTextBoxScrollBars]::Vertical

function Write-Log($msg) {
    if ($Form.IsHandleCreated) {
        $Form.BeginInvoke([System.Action]{
            $ts = (Get-Date).ToString("HH:mm:ss")
            $LogBox.AppendText("[$ts] $msg`n")
            $LogBox.ScrollToCaret()
        }) | Out-Null
    }
}

# Buttons
function Make-Btn($text, $x, $y, $w, $clr) {
    $b = New-Object System.Windows.Forms.Button
    $b.Text = $text; $b.Size = New-Object System.Drawing.Size($w, 44)
    $b.Location = New-Object System.Drawing.Point($x, $y); $b.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
    $b.FlatAppearance.BorderColor = $clr; $b.FlatAppearance.BorderSize = 1
    $b.BackColor = $Colors.ButtonBG; $b.ForeColor = $clr
    $b.Font = New-Object System.Drawing.Font("Consolas",9,[System.Drawing.FontStyle]::Bold)
    $b.Cursor = [System.Windows.Forms.Cursors]::Hand
    $b.Add_MouseEnter({ $b.BackColor = $Colors.ButtonHover })
    $b.Add_MouseLeave({ $b.BackColor = $Colors.ButtonBG })
    return $b
}

$BtnLaunch = Make-Btn ">> OUVRIR L APPLICATION" 20 434 275 $Colors.AccentGreen
$BtnRescan = Make-Btn "RE-SCANNER" 304 434 136 $Colors.AccentBlue
$BtnCloud  = Make-Btn ">> MODE CLOUD HYBRIDE (sans terminal)" 20 486 420 $Colors.AccentBlue

$Footer = New-Object System.Windows.Forms.Label
$Footer.Text = "Sensorium Sovereign Edge AI  c 2026 Sensorium AI"; $Footer.Font = New-Object System.Drawing.Font("Consolas",7)
$Footer.ForeColor = $Colors.TextSecondary; $Footer.Location = New-Object System.Drawing.Point(20,540)
$Footer.Size = New-Object System.Drawing.Size(440,16); $Footer.TextAlign = [System.Drawing.ContentAlignment]::MiddleCenter
$Footer.BackColor = [System.Drawing.Color]::Transparent

# Update UI state
function Update-UI($mode, $ip="", $lat=0, $fw="--", $tops=0) {
    $Form.BeginInvoke([System.Action]{
        $script:State.Mode = $mode
        if ($mode -eq "LOCAL_HARDWARE") {
            $StatusDot.ForeColor = $Colors.AccentGreen
            $StatusTitle.Text = "Terminal Silicium X1 Detecte !"
            $StatusSub.Text = "Adresse : $ip  |  Mode SOUVERAIN LOCAL (Air-Gap)"
            $StatusSub.ForeColor = $Colors.AccentGreen
            $script:KpiLatVal.Text = "${lat} ms"; $script:KpiLatVal.ForeColor = $Colors.AccentGreen
            $script:KpiNpuVal.Text = "${tops} TOPS"; $script:KpiNpuVal.ForeColor = $Colors.AccentGreen
            $script:KpiFwVal.Text = $fw; $script:KpiFwVal.ForeColor = $Colors.AccentGreen
            $BtnLaunch.ForeColor = $Colors.AccentGreen; $BtnLaunch.FlatAppearance.BorderColor = $Colors.AccentGreen
        } elseif ($mode -eq "CLOUD_HYBRID") {
            $StatusDot.ForeColor = $Colors.AccentBlue
            $StatusTitle.Text = "Aucun Terminal Physique Detecte"
            $StatusSub.Text = "Mode Cloud Hybride disponible  |  Branchez le terminal USB-C"
            $StatusSub.ForeColor = $Colors.AccentBlue
            $script:KpiLatVal.Text = "~38 ms"; $script:KpiLatVal.ForeColor = $Colors.AccentBlue
            $script:KpiNpuVal.Text = "GPU Cloud"; $script:KpiNpuVal.ForeColor = $Colors.AccentBlue
            $script:KpiFwVal.Text = "Cloud-GW"; $script:KpiFwVal.ForeColor = $Colors.AccentBlue
            $BtnLaunch.ForeColor = $Colors.AccentBlue; $BtnLaunch.FlatAppearance.BorderColor = $Colors.AccentBlue
        } else {
            $StatusDot.ForeColor = $Colors.Warning
            $StatusTitle.Text = "Recherche en cours..."
            $StatusSub.ForeColor = $Colors.TextSecondary
        }
    }) | Out-Null
}

# Probe
function Test-Endpoint($url) {
    $client = New-Object System.Net.Http.HttpClient
    $client.Timeout = [System.TimeSpan]::FromMilliseconds($Config.TimeoutMs)
    try {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $task = $client.GetAsync("$url$($Config.HealthPath)")
        $resp = $task.GetAwaiter().GetResult()
        $sw.Stop()
        if ($resp.IsSuccessStatusCode) {
            $body = $resp.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            try { $d = $body | ConvertFrom-Json } catch { $d = $null }
            return @{
                OK = $true; Latency = $sw.ElapsedMilliseconds
                Firmware = if ($d -and $d.firmwareVersion) { $d.firmwareVersion } else { "2.4.0" }
                Tops = if ($d -and $d.tops) { $d.tops } else { 240 }
            }
        }
    } catch {}
    finally { $client.Dispose() }
    return @{ OK = $false }
}

function Start-Probe {
    $thread = [System.Threading.Thread]::new({
        Write-Log "Sonde mDNS -> $($Config.LocalMDNS) ..."
        $r = Test-Endpoint $Config.LocalMDNS
        if ($r.OK) {
            Write-Log "Terminal detecte via sensorium.local ($($r.Latency)ms | $($r.Tops) TOPS)"
            Update-UI "LOCAL_HARDWARE" "sensorium.local" $r.Latency $r.Firmware $r.Tops; return
        }
        Write-Log "mDNS sans reponse. Sonde USB-RNDIS -> $($Config.LocalUSBIP) ..."
        $r2 = Test-Endpoint $Config.LocalUSBIP
        if ($r2.OK) {
            Write-Log "Terminal detecte via USB-RNDIS 192.168.7.1 ($($r2.Latency)ms)"
            Update-UI "LOCAL_HARDWARE" "192.168.7.1 (USB-C)" $r2.Latency $r2.Firmware $r2.Tops; return
        }
        Write-Log "Aucun terminal physique. Mode Cloud Hybride active."
        Update-UI "CLOUD_HYBRID"
    })
    $thread.IsBackground = $true; $thread.Start()
}

$BtnLaunch.Add_Click({
    $url = if ($script:State.Mode -eq "LOCAL_HARDWARE") { $Config.LocalMDNS } else { $Config.CloudURL }
    Write-Log "Ouverture : $url"; Start-Process $url
})
$BtnRescan.Add_Click({
    Write-Log "Re-scan manuel..."; Update-UI "CHECKING"; Start-Probe
})
$BtnCloud.Add_Click({
    Write-Log "Ouverture Cloud : $($Config.CloudURL)"; Start-Process $Config.CloudURL
})

$Timer = New-Object System.Windows.Forms.Timer
$Timer.Interval = $Config.RetryInterval
$Timer.Add_Tick({ if ($script:State.Mode -eq "CLOUD_HYBRID") { Write-Log "Re-scan auto..."; Start-Probe } })
$Timer.Start()

$Form.Add_Load({
    Write-Log "Sensorium Launcher $($Config.Version) demarre"
    Write-Log "Scan Zero-Config initialise..."
    Start-Probe
})
$Form.Add_FormClosed({ $Timer.Stop(); $Timer.Dispose() })

$Form.Controls.AddRange(@($TitleBar, $StatusCard, $LogBox, $BtnLaunch, $BtnRescan, $BtnCloud, $Footer))
[System.Windows.Forms.Application]::Run($Form)
