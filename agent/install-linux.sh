#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  SENSORIUM UEM Agent — Installeur Automatique Linux/macOS
#  Exécuter avec : sudo bash install-linux.sh
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# ─── Paramètres ──────────────────────────────────────────────────────────────
SERVER_URL="https://api.sensorium.io/api/v1/uem"
AGENT_KEY="SENS-AGENT-CMR-SECURE-KEY"
TENANT_ID="YOUR_TENANT_ID_HERE"
TERMINAL_PREFIX="PC-CMR"
INSTALL_DIR="/opt/sensorium-agent"
SERVICE_NAME="sensorium-uem-agent"
TERMINAL_ID="${TERMINAL_PREFIX}-$(hostname)"

echo "════════════════════════════════════════════════════"
echo "   🚀 SENSORIUM UEM Agent v1.0.0 — Installation"
echo "════════════════════════════════════════════════════"
echo ""

# Vérifier les droits root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Ce script doit être exécuté avec sudo"
  exit 1
fi

# ─── 1. Node.js ──────────────────────────────────────────────────────────────
echo "[1/5] Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo "[INFO] Installation de Node.js 20..."
    if command -v apt-get &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    elif command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    elif command -v brew &> /dev/null; then
        brew install node
    else
        echo "❌ Gestionnaire de paquets non reconnu. Installez Node.js manuellement."
        exit 1
    fi
fi
echo "[OK] Node.js $(node --version) détecté."

# ─── 2. Copie des fichiers ───────────────────────────────────────────────────
echo ""
echo "[2/5] Copie des fichiers..."
mkdir -p "$INSTALL_DIR"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/index.js" ]; then
    cp "$SCRIPT_DIR/index.js" "$INSTALL_DIR/index.js"
    cp "$SCRIPT_DIR/package.json" "$INSTALL_DIR/package.json"
elif [ -f "$SCRIPT_DIR/agent/index.js" ]; then
    cp "$SCRIPT_DIR/agent/index.js" "$INSTALL_DIR/index.js"
    cp "$SCRIPT_DIR/agent/package.json" "$INSTALL_DIR/package.json"
else
    echo "❌ Fichiers de l'agent introuvables."
    exit 1
fi
chmod 750 "$INSTALL_DIR/index.js"
echo "[OK] Agent copié dans $INSTALL_DIR"

# ─── 3. Configuration ────────────────────────────────────────────────────────
echo ""
echo "[3/5] Génération de la configuration..."
cat > "$INSTALL_DIR/agent.config.json" << EOF
{
  "serverUrl": "${SERVER_URL}",
  "agentKey": "${AGENT_KEY}",
  "tenantId": "${TENANT_ID}",
  "terminalId": "${TERMINAL_ID}",
  "agentVersion": "1.0.0",
  "pollIntervalMs": 60000,
  "logFile": "${INSTALL_DIR}/agent.log"
}
EOF
chmod 600 "$INSTALL_DIR/agent.config.json"
echo "[OK] Configuration générée (Terminal ID: $TERMINAL_ID)"

# ─── 4. Service systemd ──────────────────────────────────────────────────────
echo ""
echo "[4/5] Création du service systemd..."
NODE_BIN=$(which node)

cat > "/etc/systemd/system/${SERVICE_NAME}.service" << EOF
[Unit]
Description=SENSORIUM UEM Agent — Unified Endpoint Management
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
ExecStart=${NODE_BIN} ${INSTALL_DIR}/index.js
Restart=always
RestartSec=30
StandardOutput=append:${INSTALL_DIR}/agent.log
StandardError=append:${INSTALL_DIR}/agent_error.log
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

echo "[OK] Service systemd créé et activé au démarrage."

# ─── 5. Démarrage ────────────────────────────────────────────────────────────
echo ""
echo "[5/5] Démarrage du service..."
systemctl start "$SERVICE_NAME"
sleep 2

if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "[OK] ✅ Agent UEM actif et en cours d'exécution!"
else
    echo "[WARN] Le service n'a pas démarré. Vérifiez les logs:"
    echo "  journalctl -u $SERVICE_NAME -n 20"
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "   ✅ Installation terminée avec succès!"
echo ""
echo "   Terminal ID : $TERMINAL_ID"
echo "   Serveur     : $SERVER_URL"
echo "   Logs        : $INSTALL_DIR/agent.log"
echo "   Service     : $SERVICE_NAME"
echo ""
echo "   Commandes utiles :"
echo "     systemctl status $SERVICE_NAME"
echo "     systemctl restart $SERVICE_NAME"
echo "     journalctl -u $SERVICE_NAME -f"
echo "════════════════════════════════════════════════════"
