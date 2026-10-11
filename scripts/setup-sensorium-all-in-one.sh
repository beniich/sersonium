#!/bin/bash
# ==============================================================================
#  SENSORIUM PLATFORM + AGENT UEM — DEPLOIEMENT TOUT-EN-UN LINUX (1 SEUL CLIC)
# ==============================================================================
set -e

if [ "$EUID" -ne 0 ]; then
  echo "❌ Ce script doit être exécuté avec les privilèges root : sudo bash setup-sensorium-all-in-one.sh"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "=============================================================================="
echo "    SENSORIUM ENTERPRISE — SUITE COMPLETE & AGENT UEM (DEPLOIEMENT LINUX)     "
echo "=============================================================================="

# 1. Node.js Check
echo ""
echo "[1/6] Vérification de l'environnement Node.js..."
if ! command -v node &> /dev/null; then
    echo "Installation de Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs build-essential
fi
echo "Node.js $(node --version) détecté."

# 2. Dépendances
echo ""
echo "[2/6] Installation des dépendances npm..."
npm install --no-audit

# 3. Base de données
echo ""
echo "[3/6] Synchronisation de la base de données Prisma..."
npx prisma db push --skip-generate
npx prisma generate

# 4. Build
echo ""
echo "[4/6] Compilation de la plateforme en production..."
npm run build

# 5. Déploiement de l'Agent UEM
echo ""
echo "[5/6] Configuration et démarrage de l'Agent UEM..."
AGENT_DIR="/opt/sensorium-agent"
mkdir -p "$AGENT_DIR"
cp agent/index.js "$AGENT_DIR/index.js"
cp agent/package.json "$AGENT_DIR/package.json"
chmod 750 "$AGENT_DIR/index.js"

HOSTNAME=$(hostname)
TERMINAL_ID="SRV-CMR-$HOSTNAME"

cat > "$AGENT_DIR/agent.config.json" << EOF
{
  "serverUrl": "http://localhost:3000/api/v1/uem",
  "agentKey": "SENS-AGENT-CMR-SECURE-KEY",
  "tenantId": "CMR-LOCAL-FLEET",
  "terminalId": "$TERMINAL_ID",
  "agentVersion": "1.0.0",
  "pollIntervalMs": 30000,
  "logFile": "$AGENT_DIR/agent.log"
}
EOF
chmod 600 "$AGENT_DIR/agent.config.json"

NODE_BIN=$(which node || echo "/usr/bin/node")
cat > /etc/systemd/system/sensorium-agent.service << EOF
[Unit]
Description=SENSORIUM UEM Endpoint Security Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$AGENT_DIR
ExecStart=$NODE_BIN $AGENT_DIR/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 6. Service Platform Sensorium
echo ""
echo "[6/6] Configuration du service systemd Sensorium..."
cat > /etc/systemd/system/sensorium-server.service << EOF
[Unit]
Description=SENSORIUM Enterprise Platform & Cockpit
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$SCRIPT_DIR
ExecStart=$NODE_BIN dist/server.mjs
Restart=always
RestartSec=5
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable sensorium-agent.service sensorium-server.service
systemctl restart sensorium-agent.service sensorium-server.service

echo ""
echo "=============================================================================="
echo "  ✅ DEPLOIEMENT TOUT-EN-UN TERMINE AVEC SUCCES !"
echo "=============================================================================="
echo "  * Serveur SENSORIUM actif sur : http://localhost:3000"
echo "  * Cockpit UEM accessible sur : http://localhost:3000/uem"
echo "  * Agent UEM démarré et enregistré : $TERMINAL_ID"
echo "=============================================================================="
