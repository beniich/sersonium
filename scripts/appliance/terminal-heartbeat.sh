#!/usr/bin/env bash
# ==============================================================================
# SENSORIUM APPLIANCE - Heartbeat Client & License Revocation Sentry
# Pings the Sensorium Cloud weekly or on trigger.
# If subscription cancelled or revoked, disables Ollama model access locally.
# ==============================================================================

set -euo pipefail

CONFIG_FILE="/etc/sensorium/appliance.conf"

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "⚠️ Configuration file $CONFIG_FILE not found. Skipping heartbeat."
  exit 0
fi

# shellcheck source=/dev/null
source "$CONFIG_FILE"

if [[ -z "${ORG_ID:-}" || -z "${ACTIVATION_KEY:-}" ]]; then
  echo "Missing ORG_ID or ACTIVATION_KEY in $CONFIG_FILE"
  exit 0
fi

CLOUD_URL="${SENSORIUM_CLOUD_URL:-https://api.sensorium.io}"
SERIAL_NUMBER=$(cat /etc/machine-id 2>/dev/null || cat /proc/sys/kernel/random/boot_id 2>/dev/null || echo "SNSR-EDGE-UNKNOWN")
UPTIME_SECONDS=$(cut -d. -f1 /proc/uptime 2>/dev/null || echo "0")
INFERENCE_COUNT=$(cat /var/log/sensorium/inference_count.log 2>/dev/null || echo "0")
MODEL_LOADED=$(ollama list 2>/dev/null | grep -v 'NAME' | head -n1 | awk '{print $1}' || echo "none")

PAYLOAD=$(cat <<EOF
{
  "orgId": "$ORG_ID",
  "terminalSerial": "$SERIAL_NUMBER",
  "activationKey": "$ACTIVATION_KEY",
  "uptimeSeconds": $UPTIME_SECONDS,
  "inferenceCount": $INFERENCE_COUNT,
  "modelLoaded": "$MODEL_LOADED"
}
EOF
)

RESPONSE=$(curl -s --max-time 15 -X POST "${CLOUD_URL}/api/v1/terminal/heartbeat" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" || echo '{"authorized":true,"offline":true}')

REVOKE=$(echo "$RESPONSE" | grep -o '"revoke":true' || true)

if [[ -n "$REVOKE" ]]; then
  echo "🔴 ALERTE : Licence révoquée par le Cloud. Désactivation de l'accès LLM..."
  systemctl stop ollama || true
  systemctl disable ollama || true
  logger -t sensorium-heartbeat "License revoked: Ollama stopped."
else
  echo "💚 Heartbeat OK - Licence vérifiée."

  # Niveau 3: Sovereign Sync Trigger
  NEEDS_SYNC=$(echo "$RESPONSE" | grep -o '"needsSync":true' || true)
  if [[ -n "$NEEDS_SYNC" ]]; then
    echo "🔄 Registre mis à jour côté Cloud (needsSync=true). Lancement de la synchronisation locale..."
    if [[ -f "/opt/sensorium/appliance/sync_compliance.py" ]]; then
      /usr/bin/python3 /opt/sensorium/appliance/sync_compliance.py || true
    fi
  fi
fi
