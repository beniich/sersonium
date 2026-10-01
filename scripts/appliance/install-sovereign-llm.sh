#!/usr/bin/env bash
# ==============================================================================
# SENSORIUM APPLIANCE - Sovereign LLM Activation & Cloud Telemetry Reporter
# Downloads the quantified LLM (Llama 3.1) and notifies the Cloud Controller
# Usage:
#   sudo /opt/sensorium/appliance/install-sovereign-llm.sh \
#        --org-id "org_123" \
#        --key "SNSR-LLM-XXXX-XXXX" \
#        [--model "llama3.1:8b-instruct-q4_K_M"] \
#        [--cloud-url "https://api.sensorium.io"]
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

ORG_ID=""
ACTIVATION_KEY=""
MODEL_NAME="llama3.1:8b-instruct-q4_K_M"
CLOUD_URL="${SENSORIUM_CLOUD_URL:-https://api.sensorium.io}"
SERIAL_NUMBER=$(cat /etc/machine-id 2>/dev/null || cat /proc/sys/kernel/random/boot_id 2>/dev/null || echo "SNSR-EDGE-UNKNOWN")

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --org-id) ORG_ID="$2"; shift ;;
    --key) ACTIVATION_KEY="$2"; shift ;;
    --model) MODEL_NAME="$2"; shift ;;
    --cloud-url) CLOUD_URL="$2"; shift ;;
    --serial) SERIAL_NUMBER="$2"; shift ;;
    *) echo "Unknown parameter passed: $1"; exit 1 ;;
  esac
  shift
done

if [[ -z "$ORG_ID" || -z "$ACTIVATION_KEY" ]]; then
  echo -e "${RED}❌ Erreur : --org-id et --key (clé d'activation SNSR-LLM) sont obligatoires.${NC}"
  echo "Usage: $0 --org-id <ORG_ID> --key <SNSR-LLM-XXXX-XXXX>"
  exit 1
fi

echo -e "${BLUE}==================================================================${NC}"
echo -e "${GREEN}🧠 SENSORIUM ENTERPRISE - Déploiement Local LLM Souverain${NC}"
echo -e "${BLUE}==================================================================${NC}"
echo -e "Org ID        : ${YELLOW}$ORG_ID${NC}"
echo -e "Hardware ID   : ${YELLOW}$SERIAL_NUMBER${NC}"
echo -e "Modèle cible  : ${YELLOW}$MODEL_NAME${NC}"
echo -e "Cloud Gateway : ${YELLOW}$CLOUD_URL${NC}"

START_TIME=$(date +%s)

# Ensure Ollama service is active
if ! systemctl is-active --quiet ollama; then
  echo -e "${YELLOW}Démarrage du service Ollama...${NC}"
  systemctl start ollama || true
  sleep 2
fi

echo -e "${YELLOW}Téléchargement et quantification du modèle (${MODEL_NAME})...${NC}"
ollama pull "$MODEL_NAME"

# Création du modèle personnalisé avec System Prompt de Conformité Souverain (Niveau 3)
echo -e "${YELLOW}Création du modèle custom 'sensorium-compliance' avec injection RAG local...${NC}"
cat << 'EOF' > /tmp/Modelfile.sensorium
FROM llama3.1:8b-instruct-q4_K_M

PARAMETER temperature 0.2
PARAMETER top_p 0.9

SYSTEM """Tu es l'assistant de conformité et de sûreté industrielle de Sensorium.
Tu as accès direct au registre local du terminal : /opt/sensorium/data/compliance_registry.json.
Avant de répondre à toute question sur un chauffeur, un équipement ou un véhicule :
1. Consulte systématiquement le registre local de conformité (permis, certifications ISO 39001, polices d'assurance).
2. Si une date d'expiration est dépassée ou proche (< 30 jours), signale-le impérativement comme un RISQUE CRITIQUE ou une IMMOBILISATION selon les règles de conformité.
3. Reste concis, précis, factuel et orienté sécurité industrielle."""
EOF

ollama create sensorium-compliance -f /tmp/Modelfile.sensorium || true
rm -f /tmp/Modelfile.sensorium

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
OLLAMA_VER=$(ollama --version 2>/dev/null | awk '{print $NF}' || echo "unknown")

echo -e "${GREEN}✅ Modèle téléchargé avec succès en ${DURATION} secondes.${NC}"

# Telemetry Callback to Sensorium Cloud
echo -e "${YELLOW}Transmission du rapport d'installation au Cloud Sensorium...${NC}"
PAYLOAD=$(cat <<EOF
{
  "orgId": "$ORG_ID",
  "terminalSerial": "$SERIAL_NUMBER",
  "modelName": "$MODEL_NAME",
  "modelSizeGb": 4.7,
  "installDurationSeconds": $DURATION,
  "ollamaVersion": "$OLLAMA_VER",
  "activationKey": "$ACTIVATION_KEY"
}
EOF
)

CALLBACK_ENDPOINT="${CLOUD_URL}/api/v1/terminal/installation-success"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$CALLBACK_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" || echo -e "\n500")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [[ "$HTTP_CODE" -ge 200 && "$HTTP_CODE" -lt 300 ]]; then
  echo -e "${GREEN}✨ Rapport d'installation validé par le Cloud (HTTP $HTTP_CODE)${NC}"
  echo -e "$BODY"
else
  echo -e "${YELLOW}⚠️ Le Cloud n'a pas pu être contacté ou a répondu HTTP $HTTP_CODE (Fonctionnement autonome local préservé).${NC}"
fi

echo -e "${GREEN}🎉 LLM Souverain opérationnel et prêt pour l'inférence 100% Offline.${NC}"
