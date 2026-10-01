#!/usr/bin/env bash
# ==============================================================================
# SENSORIUM APPLIANCE - Zero-Config Physical Edge Terminal Installer
# Designed for: Raspberry Pi 4/5, NVIDIA Jetson Orin, Silicium X1 Edge Modules
# OS Target: Ubuntu 22.04 / 24.04 LTS, Debian 12 (Bookworm)
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================================${NC}"
echo -e "${GREEN}🚀 SENSORIUM APPLIANCE - Configuration du Terminal Physique Edge${NC}"
echo -e "${BLUE}==================================================================${NC}"

# Check for root privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Ce script doit être exécuté avec les privilèges root (sudo).${NC}"
  exit 1
fi

echo -e "${YELLOW}[1/7] Mise à jour du système et installation des dépendances...${NC}"
apt-get update -qq
apt-get install -y -qq avahi-daemon avahi-utils dnsmasq curl git nodejs npm ufw

# Set exact hostname to "sensorium" so mDNS maps to "sensorium.local"
echo -e "${YELLOW}[2/7] Configuration du nom d'hôte mDNS (sensorium.local)...${NC}"
hostnamectl set-hostname sensorium
echo "127.0.1.1 sensorium sensorium.local" >> /etc/hosts

# Configure Avahi Daemon
systemctl enable avahi-daemon
systemctl restart avahi-daemon

# Create Avahi mDNS Service Announcement for HTTP port 3000
echo -e "${YELLOW}[3/7] Publication du service mDNS Avahi (_http._tcp sur port 3000)...${NC}"
mkdir -p /etc/avahi/services
cat << 'EOF' > /etc/avahi/services/sensorium.service
<?xml version="1.0" standalone="no"?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name replace-wildcards="yes">Sensorium Sovereign Edge AI (%h)</name>
  <service>
    <type>_http._tcp</type>
    <port>3000</port>
    <txt-record>model=Silicium-X1-NPU</txt-record>
    <txt-record>firmware=2.4.0</txt-record>
    <txt-record>security=ZeroTrust-HSM</txt-record>
  </service>
</service-group>
EOF

systemctl restart avahi-daemon

# Configure USB Gadget Mode (Ethernet over USB-C)
echo -e "${YELLOW}[4/7] Configuration de l'Ethernet over USB (RNDIS / CDC-ECM)...${NC}"

# Enable Kernel modules for USB Gadget
cat << 'EOF' > /etc/modules-load.d/sensorium_usb_gadget.conf
dwc2
g_ether
EOF

# Static IP for Terminal on USB interface (192.168.7.1)
mkdir -p /etc/network/interfaces.d/
cat << 'EOF' > /etc/network/interfaces.d/usb0
auto usb0
allow-hotplug usb0
iface usb0 inet static
    address 192.168.7.1
    netmask 255.255.255.0
    network 192.168.7.0
    broadcast 192.168.7.255
EOF

# Configure DNSMASQ on usb0 to auto-assign 192.168.7.2 to host PC (Zero-Config DHCP)
cat << 'EOF' > /etc/dnsmasq.d/sensorium_usb.conf
interface=usb0
dhcp-range=192.168.7.2,192.168.7.10,255.255.255.0,24h
dhcp-option=3,192.168.7.1
dhcp-option=6,192.168.7.1
address=/sensorium.local/192.168.7.1
EOF

systemctl restart dnsmasq || true

# Local AI Engine (Ollama / Llama 3.1 Quantized)
echo -e "${YELLOW}[5/7] Installation du Moteur d'IA Local Edge (Ollama)...${NC}"
if ! command -v ollama &> /dev/null; then
  curl -fsSL https://ollama.com/install.sh | sh
fi

# Create dedicated sensorium system user
echo -e "${YELLOW}[6/7] Préparation du répertoire de déploiement et de l'utilisateur...${NC}"
if ! id -u sensorium &>/dev/null; then
  useradd -m -s /bin/bash -G sudo,dialout sensorium
fi

INSTALL_DIR="/opt/sensorium/appliance"
mkdir -p "$INSTALL_DIR"
chown -R sensorium:sensorium /opt/sensorium

# Systemd Auto-Start Service
echo -e "${YELLOW}[7/7] Configuration du service Systemd (sensorium.service)...${NC}"
cat << 'EOF' > /etc/systemd/system/sensorium.service
[Unit]
Description=Sensorium Sovereign Edge AI Appliance
After=network.target avahi-daemon.service dnsmasq.service
Wants=avahi-daemon.service

[Service]
Type=simple
User=sensorium
WorkingDirectory=/opt/sensorium/appliance
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=3
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=APPLIANCE_MODE=SOVEREIGN_EDGE
Environment=AI_ENGINE=local_npu

# Sandboxing & Security hardening
ProtectSystem=full
ProtectHome=read-only
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable sensorium.service

# Physical LED Controller (Hardware UX)
echo -e "${YELLOW}[7/8] Déploiement du contrôleur LED GPIO (Hardware UX)...${NC}"
pip3 install --quiet gpiod 2>/dev/null || pip3 install --quiet RPi.GPIO 2>/dev/null || true

cp "$(dirname "$0")/led_controller.py" "$INSTALL_DIR/led_controller.py"
chown sensorium:sensorium "$INSTALL_DIR/led_controller.py"
chmod +x "$INSTALL_DIR/led_controller.py"

# Add sensorium user to gpio group
usermod -aG gpio sensorium 2>/dev/null || true

cat << 'EOF' > /etc/systemd/system/sensorium-leds.service
[Unit]
Description=Sensorium Physical LED Controller (Hardware UX)
After=network.target sensorium.service
Wants=sensorium.service

[Service]
Type=simple
User=sensorium
WorkingDirectory=/opt/sensorium/appliance
ExecStartPre=/bin/sleep 2
ExecStart=/usr/bin/python3 /opt/sensorium/appliance/led_controller.py
Restart=always
RestartSec=2
SupplementaryGroups=gpio dialout
StandardOutput=journal
StandardError=journal
SyslogIdentifier=sensorium-leds

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable sensorium-leds.service

# Sovereign Compliance Sync Engine (Niveau 3 - Edge Mirror)
echo -e "${YELLOW}[8/9] Configuration du Sovereign Compliance Sync Engine (Niveau 3)...${NC}"
cp "$(dirname "$0")/sync_compliance.py" "$INSTALL_DIR/sync_compliance.py" 2>/dev/null || true
chown sensorium:sensorium "$INSTALL_DIR/sync_compliance.py" 2>/dev/null || true
chmod +x "$INSTALL_DIR/sync_compliance.py" 2>/dev/null || true
mkdir -p /opt/sensorium/data
chown -R sensorium:sensorium /opt/sensorium/data

cp "$(dirname "$0")/sensorium-sync.service" /etc/systemd/system/sensorium-sync.service 2>/dev/null || true
cp "$(dirname "$0")/sensorium-sync.timer" /etc/systemd/system/sensorium-sync.timer 2>/dev/null || true

systemctl daemon-reload
systemctl enable sensorium-sync.timer 2>/dev/null || true
systemctl start sensorium-sync.timer 2>/dev/null || true

echo -e "${YELLOW}[9/9] Vérification finale de la configuration...${NC}"
echo -e "  • sensorium.service      : $(systemctl is-enabled sensorium.service 2>/dev/null)"
echo -e "  • sensorium-leds.service : $(systemctl is-enabled sensorium-leds.service 2>/dev/null)"
echo -e "  • avahi-daemon           : $(systemctl is-enabled avahi-daemon 2>/dev/null)"
echo -e "  • dnsmasq                : $(systemctl is-enabled dnsmasq 2>/dev/null)"

echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}✅ TERMINAL SENSORIUM CONFIGURÉ AVEC SUCCÈS !${NC}"
echo -e "${BLUE}==================================================================${NC}"
echo -e "Dès le redémarrage :"
echo -e " 1. LED ${RED}ROUGE fixe${NC}         → Boot en cours"
echo -e " 2. LED ${BLUE}BLEUE clignotante${NC}  → Recherche du PC (branchez USB-C)"
echo -e " 3. LED ${BLUE}BLEUE fixe${NC}         → PC connecté, prêt"
echo -e " 4. LED ${GREEN}VERTE pulsante${NC}     → Inférence IA active"
echo -e ""
echo -e " PC : ${GREEN}http://sensorium.local:3000${NC} ou ${GREEN}http://192.168.7.1:3000${NC}"
echo -e "Redémarrage recommandé : ${YELLOW}sudo reboot${NC}"
