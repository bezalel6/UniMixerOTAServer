#!/bin/bash

# UniMixer OTA Server Update Script
# Updates the server from git and restarts services

set -e

echo "🔄 UniMixer OTA Server Update"
echo "============================="

# Change to the application directory
cd /opt/unimixer-ota

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Please ensure the server was set up with git clone."
    exit 1
fi

# Backup current firmware files
echo "💾 Backing up firmware files..."
mkdir -p /tmp/unimixer-backup
cp -r data/firmware/* /tmp/unimixer-backup/ 2>/dev/null || echo "No firmware files to backup"

# Stop the current service
echo "🛑 Stopping current service..."
systemctl stop unimixer-ota 2>/dev/null || docker-compose down 2>/dev/null || true

# Fetch latest changes
echo "📥 Fetching latest changes from git..."
git fetch origin

# Show what will be updated
echo "📋 Changes to be applied:"
git log HEAD..origin/master --oneline --no-merges || echo "No new commits"

# Pull latest changes
echo "🔄 Pulling latest changes..."
git pull origin master

# Make scripts executable
chmod +x *.sh

# Rebuild and restart the service
echo "🔨 Rebuilding Docker containers..."
docker-compose down 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

# Restore firmware files if needed
echo "📂 Restoring firmware files..."
mkdir -p data/firmware
cp -r /tmp/unimixer-backup/* data/firmware/ 2>/dev/null || echo "No firmware files to restore"

# Set proper permissions
chown -R unimixer:unimixer data/

# Wait for service to be ready
echo "⏳ Waiting for service to start..."
sleep 15

# Check if service is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Update completed successfully!"
    echo "📍 Server is running at: http://$(hostname -I | awk '{print $1}'):3000"
    
    # Start systemd service if it exists
    if systemctl is-enabled unimixer-ota >/dev/null 2>&1; then
        systemctl start unimixer-ota
        echo "🔄 Systemd service restarted"
    fi
else
    echo "❌ Service failed to start. Check logs:"
    docker-compose logs --tail=50
    exit 1
fi

# Clean up backup
rm -rf /tmp/unimixer-backup

echo ""
echo "📚 Useful commands:"
echo "  Check status: docker-compose ps"
echo "  View logs:    docker-compose logs -f"
echo "  Service logs: journalctl -u unimixer-ota -f"

echo "🎉 Update complete!" 
