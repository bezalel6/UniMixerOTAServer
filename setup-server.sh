#!/bin/bash

# UniMixer OTA Server Setup Script
# This script sets up the server environment and configures auto-startup

set -e

echo "🚀 UniMixer OTA Server Setup"
echo "============================"

# Configuration
INSTALL_DIR="/opt/unimixer-ota"
SERVICE_USER="unimixer"
SERVICE_FILE="unimixer-ota.service"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run this script as root (use sudo)"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt-get update

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create service user
echo "👤 Creating service user..."
if ! id "${SERVICE_USER}" &>/dev/null; then
    useradd -r -s /bin/false -d ${INSTALL_DIR} ${SERVICE_USER}
    usermod -aG docker ${SERVICE_USER}
fi

# Create installation directory
echo "📁 Setting up installation directory..."
mkdir -p ${INSTALL_DIR}
mkdir -p ${INSTALL_DIR}/data/firmware
mkdir -p ${INSTALL_DIR}/data/logs
mkdir -p ${INSTALL_DIR}/config

# Copy application files
echo "📋 Copying application files..."
if [ "$(pwd)" != "${INSTALL_DIR}" ]; then
    cp -r . ${INSTALL_DIR}/
else
    echo "Already in target directory, skipping copy..."
fi
chown -R ${SERVICE_USER}:${SERVICE_USER} ${INSTALL_DIR}
chmod +x ${INSTALL_DIR}/docker-deploy.sh

# Install systemd service
echo "⚙️ Installing systemd service..."
cp systemd/${SERVICE_FILE} /etc/systemd/system/
systemctl daemon-reload
systemctl enable ${SERVICE_FILE}

# Configure firewall (if ufw is available)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    ufw allow 3000/tcp comment "UniMixer OTA Server"
fi

# Build and start the service
echo "🏗️ Building and starting service..."
cd ${INSTALL_DIR}
sudo -u ${SERVICE_USER} docker-compose build
systemctl start ${SERVICE_FILE}

# Wait for service to be ready
echo "⏳ Waiting for service to start..."
sleep 10

# Check service status
if systemctl is-active --quiet ${SERVICE_FILE}; then
    echo "✅ UniMixer OTA Server is running and enabled!"
    echo "📍 Server URL: http://$(hostname -I | awk '{print $1}'):3000"
    echo "📊 Service status: systemctl status ${SERVICE_FILE}"
    echo "📋 View logs: journalctl -u ${SERVICE_FILE} -f"
else
    echo "❌ Service failed to start. Check logs:"
    journalctl -u ${SERVICE_FILE} --no-pager
    exit 1
fi

echo ""
echo "📚 Management Commands:"
echo "  Start:   systemctl start ${SERVICE_FILE}"
echo "  Stop:    systemctl stop ${SERVICE_FILE}"
echo "  Restart: systemctl restart ${SERVICE_FILE}"
echo "  Status:  systemctl status ${SERVICE_FILE}"
echo "  Logs:    journalctl -u ${SERVICE_FILE} -f"
echo ""
echo "🎉 Setup complete! The server will automatically start on boot." 
