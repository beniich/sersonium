/**
 * ═══════════════════════════════════════════════════════════════════
 *  SENSORIUM UEM AGENT v1.0.0
 *  Agent Endpoint Léger — Windows / Linux / macOS
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Ce programme s'exécute en arrière-plan sur chaque terminal géré.
 *  Il remonte l'inventaire toutes les 60 secondes et exécute les
 *  commandes envoyées depuis le cockpit SENSORIUM (bloquer USB,
 *  installer un patch, redémarrer, etc.)
 *
 *  Démarrage : node index.js
 *  Service Windows : nssm install SensoriumAgent node index.js
 * ═══════════════════════════════════════════════════════════════════
 */

const { exec, execSync } = require("child_process");
const https = require("https");
const http = require("http");
const os = require("os");
const fs = require("fs");
const path = require("path");

// ─── Configuration ───────────────────────────────────────────────────────────

const CONFIG_FILE = path.join(__dirname, "agent.config.json");

function loadConfig() {
  const defaults = {
    serverUrl: "https://api.sensorium.io/api/v1/uem",
    agentKey: "SENS-AGENT-CMR-SECURE-KEY",
    tenantId: "TENANT_ID_HERE",
    terminalId: `${os.hostname()}-${os.platform()}`,
    agentVersion: "1.0.0",
    pollIntervalMs: 60000,
    logFile: path.join(__dirname, "agent.log"),
  };

  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      return { ...defaults, ...saved };
    } catch (_) {}
  }

  // Écrire la config par défaut si elle n'existe pas
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaults, null, 2));
  return defaults;
}

const CONFIG = loadConfig();

// ─── Logging ─────────────────────────────────────────────────────────────────

function log(level, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}`;
  console.log(line);
  try {
    fs.appendFileSync(CONFIG.logFile, line + "\n");
  } catch (_) {}
}

// ─── Collecte d'inventaire système ───────────────────────────────────────────

function getInstalledApps() {
  try {
    if (os.platform() === "win32") {
      // Liste des programmes via PowerShell (rapide, sans WMI)
      const output = execSync(
        `powershell -Command "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName | Where-Object {$_.DisplayName} | ConvertTo-Json"`,
        { timeout: 10000, encoding: "utf8" }
      );
      const apps = JSON.parse(output);
      return (Array.isArray(apps) ? apps : [apps]).map(a => a.DisplayName).filter(Boolean);
    } else if (os.platform() === "linux") {
      const output = execSync("dpkg --get-selections 2>/dev/null | grep install | awk '{print $1}'", {
        timeout: 10000,
        encoding: "utf8",
      });
      return output.split("\n").filter(Boolean).slice(0, 50);
    } else if (os.platform() === "darwin") {
      const output = execSync("ls /Applications", { timeout: 5000, encoding: "utf8" });
      return output.split("\n").filter(n => n.endsWith(".app")).map(n => n.replace(".app", ""));
    }
  } catch (err) {
    log("WARN", `Impossible de récupérer les apps installées: ${err.message}`);
  }
  return [];
}

function collectInventory() {
  const cpuInfo = os.cpus();
  const totalMem = os.totalmem() / (1024 * 1024 * 1024); // GB

  let diskGb = 0;
  try {
    if (os.platform() === "win32") {
      const out = execSync("wmic logicaldisk get size /value", { timeout: 5000, encoding: "utf8" });
      const matches = out.match(/Size=(\d+)/g) || [];
      const total = matches.reduce((sum, m) => sum + parseInt(m.split("=")[1] || "0"), 0);
      diskGb = total / (1024 * 1024 * 1024);
    } else {
      const out = execSync("df -BG / | tail -1 | awk '{print $2}'", { timeout: 5000, encoding: "utf8" });
      diskGb = parseInt(out.replace("G", "").trim()) || 0;
    }
  } catch (_) {}

  return {
    terminalId: CONFIG.terminalId,
    hostname: os.hostname(),
    os: os.platform() === "win32" ? "Windows" : os.platform() === "darwin" ? "macOS" : "Linux",
    osVersion: os.release(),
    cpuCores: cpuInfo.length,
    ramGb: Math.round(totalMem * 10) / 10,
    diskGb: Math.round(diskGb),
    installedApps: getInstalledApps(),
    lastIp: getLocalIp(),
    agentVersion: CONFIG.agentVersion,
    timestamp: new Date().toISOString(),
  };
}

function getLocalIp() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (_) {}
  return "127.0.0.1";
}

// ─── HTTP Client ──────────────────────────────────────────────────────────────

function apiRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(CONFIG.serverUrl + endpoint);
    const isHttps = url.protocol === "https:";
    const transport = isHttps ? https : http;

    const bodyStr = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Agent-Key": CONFIG.agentKey,
        "X-Tenant-ID": CONFIG.tenantId,
        ...(bodyStr ? { "Content-Length": Buffer.byteLength(bodyStr) } : {}),
      },
      // Accepter les certs auto-signés en dev (retirer en prod)
      rejectUnauthorized: false,
      timeout: 15000,
    };

    const req = transport.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (_) {
          resolve(data);
        }
      });
    });

    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout de la requête"));
    });

    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// ─── Exécuteur de commandes UEM ──────────────────────────────────────────────

function executeUemCommand(command) {
  return new Promise((resolve) => {
    const { id, commandType, payload } = command;
    log("INFO", `▶ Exécution commande ${commandType} [${id}]`);

    let cmd = "";
    let success = true;
    let result = "";

    try {
      switch (commandType) {
        case "BLOCK_USB":
          if (os.platform() === "win32") {
            cmd = `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR" /v Start /t REG_DWORD /d 4 /f`;
          } else {
            cmd = `echo 'blacklist usb-storage' > /etc/modprobe.d/usb-block.conf && modprobe -r usb-storage 2>/dev/null`;
          }
          break;

        case "UNBLOCK_USB":
          if (os.platform() === "win32") {
            cmd = `reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR" /v Start /t REG_DWORD /d 3 /f`;
          } else {
            cmd = `rm -f /etc/modprobe.d/usb-block.conf`;
          }
          break;

        case "BLOCK_BLUETOOTH":
          if (os.platform() === "win32") {
            cmd = `pnputil /disable-device *BTH*`;
          } else {
            cmd = `rfkill block bluetooth`;
          }
          break;

        case "UNBLOCK_BLUETOOTH":
          if (os.platform() === "win32") {
            cmd = `pnputil /enable-device *BTH*`;
          } else {
            cmd = `rfkill unblock bluetooth`;
          }
          break;

        case "LOCK_SCREEN":
          if (os.platform() === "win32") {
            cmd = `rundll32.exe user32.dll,LockWorkStation`;
          } else if (os.platform() === "linux") {
            cmd = `loginctl lock-sessions`;
          } else {
            cmd = `pmset displaysleepnow`;
          }
          break;

        case "REBOOT":
          const delay = payload?.delaySeconds || 60;
          if (os.platform() === "win32") {
            cmd = `shutdown /r /t ${delay} /c "Redémarrage planifié par SENSORIUM UEM"`;
          } else {
            cmd = `shutdown -r +${Math.ceil(delay / 60)}`;
          }
          break;

        case "SHUTDOWN":
          if (os.platform() === "win32") {
            cmd = `shutdown /s /t 60 /c "Arrêt planifié par SENSORIUM UEM"`;
          } else {
            cmd = `shutdown -h +1`;
          }
          break;

        case "INSTALL_APP":
          const appUrl = payload?.url;
          if (!appUrl) {
            result = "URL d'installation manquante";
            success = false;
            break;
          }
          if (os.platform() === "win32") {
            cmd = `powershell -Command "Invoke-WebRequest -Uri '${appUrl}' -OutFile '$env:TEMP\\install_pkg.msi' -UseBasicParsing; Start-Process msiexec.exe -ArgumentList '/i $env:TEMP\\install_pkg.msi /quiet /norestart' -Wait -Verb RunAs"`;
          } else {
            cmd = `wget -q '${appUrl}' -O /tmp/install_pkg.sh && chmod +x /tmp/install_pkg.sh && /tmp/install_pkg.sh`;
          }
          break;

        case "DEPLOY_PATCH":
          const patchUrl = payload?.url;
          if (!patchUrl) {
            result = "URL du patch manquante";
            success = false;
            break;
          }
          if (os.platform() === "win32") {
            cmd = `powershell -Command "Invoke-WebRequest -Uri '${patchUrl}' -OutFile '$env:TEMP\\patch.msu' -UseBasicParsing; Start-Process wusa.exe -ArgumentList '$env:TEMP\\patch.msu /quiet /norestart' -Wait -Verb RunAs"`;
          } else {
            cmd = `apt-get update -qq && apt-get upgrade -y -qq`;
          }
          break;

        case "COLLECT_LOGS":
          const logPath = payload?.path || (os.platform() === "win32" ? "C:\\Windows\\Logs" : "/var/log");
          if (os.platform() === "win32") {
            cmd = `powershell -Command "Get-Content -Path '${logPath}\\System.evtx' -ErrorAction SilentlyContinue | Select-Object -Last 100"`;
          } else {
            cmd = `tail -100 ${logPath}/syslog 2>/dev/null || journalctl -n 100 --no-pager`;
          }
          break;

        case "WIPE_DEVICE":
          // Commande critique — nécessite un token de confirmation
          if (payload?.confirmationToken !== "SENSORIUM-WIPE-CONFIRM") {
            result = "Token de confirmation invalide. Wipe annulé.";
            success = false;
            break;
          }
          log("CRITICAL", "⚠️  WIPE DEVICE déclenché !");
          if (os.platform() === "win32") {
            cmd = `cipher /w:C`;
          } else {
            cmd = `echo "WIPE SIMULATION ONLY - Production requires explicit confirmation"`;
          }
          break;

        case "POLICY_UPDATE":
          // L'agent met à jour sa configuration locale selon la nouvelle politique
          if (payload?.policy) {
            try {
              const policyPath = path.join(__dirname, "active_policy.json");
              fs.writeFileSync(policyPath, JSON.stringify(payload.policy, null, 2));
              result = "Politique appliquée localement.";
              success = true;
            } catch (e) {
              result = `Erreur écriture politique: ${e.message}`;
              success = false;
            }
          }
          break;

        default:
          log("WARN", `Commande inconnue: ${commandType}`);
          result = `Commande non supportée: ${commandType}`;
          success = false;
      }

      if (cmd) {
        exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
          if (error) {
            log("ERROR", `Commande ${commandType} échouée: ${error.message}`);
            reportResult(id, false, error.message);
          } else {
            log("INFO", `✅ Commande ${commandType} exécutée avec succès`);
            reportResult(id, true, stdout.trim() || "Succès");
          }
          resolve();
        });
        return;
      }
    } catch (err) {
      result = err.message;
      success = false;
    }

    reportResult(id, success, result);
    resolve();
  });
}

// ─── Communication avec le serveur ───────────────────────────────────────────

async function sendInventory() {
  try {
    const inventory = collectInventory();
    await apiRequest("POST", "/agent/inventory", inventory);
    log("INFO", `📡 Inventaire envoyé (${inventory.installedApps.length} apps)`);
  } catch (err) {
    log("ERROR", `Envoi inventaire: ${err.message}`);
  }
}

async function checkAndExecuteCommands() {
  try {
    const response = await apiRequest("GET", `/agent/commands/${CONFIG.terminalId}`);
    const commands = response?.commands || [];

    if (commands.length === 0) return;

    log("INFO", `📬 ${commands.length} commande(s) reçue(s)`);
    for (const cmd of commands) {
      await executeUemCommand(cmd);
    }
  } catch (err) {
    log("ERROR", `Poll commandes: ${err.message}`);
  }
}

async function reportResult(commandId, success, result) {
  try {
    await apiRequest("POST", `/agent/commands/${commandId}/result`, { success, result });
    log("INFO", `📊 Résultat rapporté pour commande ${commandId}: ${success ? "✅ OK" : "❌ FAIL"}`);
  } catch (err) {
    log("ERROR", `Rapport résultat: ${err.message}`);
  }
}

// ─── Boucle principale ────────────────────────────────────────────────────────

async function runCycle() {
  log("INFO", "🔄 Début cycle agent UEM...");

  // 1. Envoyer l'inventaire
  await sendInventory();

  // 2. Vérifier et exécuter les commandes
  await checkAndExecuteCommands();

  log("INFO", `⏱  Prochain cycle dans ${CONFIG.pollIntervalMs / 1000}s`);
}

// ─── Démarrage ────────────────────────────────────────────────────────────────

log("INFO", "════════════════════════════════════════════════════");
log("INFO", "   🚀 SENSORIUM UEM Agent v1.0.0 démarré");
log("INFO", `   Terminal : ${CONFIG.terminalId}`);
log("INFO", `   Serveur  : ${CONFIG.serverUrl}`);
log("INFO", `   OS       : ${os.platform()} ${os.release()}`);
log("INFO", "════════════════════════════════════════════════════");

// Premier cycle immédiat
runCycle();

// Cycles périodiques
setInterval(runCycle, CONFIG.pollIntervalMs);

// Gestion propre de l'arrêt
process.on("SIGTERM", () => {
  log("INFO", "🛑 Agent UEM arrêté proprement (SIGTERM)");
  process.exit(0);
});
process.on("SIGINT", () => {
  log("INFO", "🛑 Agent UEM arrêté proprement (SIGINT)");
  process.exit(0);
});
