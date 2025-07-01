# 🚀 UniMixer OTA Server Docker Deployment Guide

This guide explains how to deploy the UniMixer OTA Server using Docker for easy server deployment and automatic startup.

## 📋 Prerequisites

- **Docker** and **Docker Compose**
- **Linux server** (Ubuntu 20.04+ recommended)
- **Root/sudo access**
- **Port 3000** available

## 🎯 Quick Deployment

### Option 1: Automatic Setup (Recommended)
```bash
# Clone your repository to the server
git clone <your-repo-url> /opt/unimixer-ota
cd /opt/unimixer-ota

# Run the setup script (as root)
sudo ./setup-server.sh
```

### Option 2: Manual Deployment
```bash
# 1. Build and run with Docker Compose
docker-compose up -d

# 2. Check status
docker-compose ps
docker-compose logs -f
```

## 📁 File Structure

```
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Docker Compose configuration
├── .dockerignore              # Docker build exclusions
├── healthcheck.js             # Container health monitoring
├── docker-deploy.sh           # Deployment script
├── setup-server.sh            # Complete server setup
├── systemd/
│   └── unimixer-ota.service   # Systemd service for auto-startup
└── data/
    ├── firmware/              # Persistent firmware storage
    └── logs/                  # Application logs
```

## 🐳 Docker Configuration

### Dockerfile Features
- **Multi-stage build** for optimized image size
- **Security**: Non-root user execution
- **Health checks**: Built-in container monitoring
- **Production optimized**: Standalone Next.js output

### Docker Compose Features
- **Persistent storage**: Firmware files preserved across restarts
- **Health monitoring**: Automatic container restart on failure
- **Environment configuration**: Easy customization
- **Network isolation**: Dedicated Docker network

## ⚙️ Configuration

### Environment Variables
Edit `docker-compose.yml` to customize:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  - HOSTNAME=0.0.0.0
  - OTA_SERVER_HOST=0.0.0.0
  - OTA_SERVER_PORT=3000
  - MAX_FILE_SIZE=50MB
```

### Volume Mounting
Firmware files are stored persistently in `./data/firmware/`

### Network Configuration
Default port: **3000**  
To change port, edit `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # External:Internal
```

## 🔄 Auto-Startup Configuration

The server automatically starts on boot using systemd:

### Service Management
```bash
# Start service
sudo systemctl start unimixer-ota

# Stop service
sudo systemctl stop unimixer-ota

# Restart service
sudo systemctl restart unimixer-ota

# Check status
sudo systemctl status unimixer-ota

# View logs
sudo journalctl -u unimixer-ota -f
```

### Service Configuration
Location: `/etc/systemd/system/unimixer-ota.service`

## 📊 Monitoring

### Health Checks
- **Container**: Built-in Docker health checks
- **Application**: HTTP endpoint monitoring at `/api/stats`
- **Automatic restart**: On health check failures

### Logging
```bash
# Application logs
docker-compose logs -f unimixer-ota

# System service logs  
sudo journalctl -u unimixer-ota -f

# Container logs
docker logs unimixer-ota-server
```

## 🔧 Management Commands

### Daily Operations
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Restart application
docker-compose restart

# Update application
git pull
./docker-deploy.sh
```

### Maintenance
```bash
# Shell access to container
docker exec -it unimixer-ota-server sh

# Backup firmware files
tar -czf firmware-backup.tar.gz data/firmware/

# Clean Docker images
docker system prune -f
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using port 3000
sudo netstat -tlnp | grep :3000

# Change port in docker-compose.yml
ports:
  - "8080:3000"
```

#### 2. Permission Issues
```bash
# Fix data directory permissions
sudo chown -R unimixer:unimixer /opt/unimixer-ota/data
sudo chmod -R 755 /opt/unimixer-ota/data
```

#### 3. Container Won't Start
```bash
# Check logs
docker-compose logs unimixer-ota

# Rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### 4. Service Won't Start on Boot
```bash
# Check service status
sudo systemctl status unimixer-ota

# Re-enable service
sudo systemctl daemon-reload
sudo systemctl enable unimixer-ota
```

### Health Check Commands
```bash
# Test application directly
curl http://localhost:3000/api/stats

# Check container health
docker inspect unimixer-ota-server | grep -A5 Health
```

## 🔐 Security Considerations

1. **Firewall**: Only expose port 3000 if needed
2. **User permissions**: Service runs as non-root user
3. **Updates**: Regularly update the base image
4. **Monitoring**: Set up log monitoring for security events

### Firewall Configuration
```bash
# Allow OTA server port
sudo ufw allow 3000/tcp comment "UniMixer OTA Server"

# Check firewall status
sudo ufw status
```

## 📈 Performance Tuning

### Resource Limits
Add to `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      cpus: '0.25'
      memory: 256M
```

### Log Rotation
```bash
# Configure Docker log rotation
echo '{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
```

## 🆕 Updates

### Application Updates
```bash
cd /opt/unimixer-ota
git pull
./docker-deploy.sh
```

### System Updates
```bash
# Update Docker
sudo apt update && sudo apt upgrade docker-ce docker-ce-cli containerd.io

# Update Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 📞 Support

- **Logs Location**: `/opt/unimixer-ota/data/logs/`
- **Configuration**: `/opt/unimixer-ota/docker-compose.yml`
- **Service Status**: `sudo systemctl status unimixer-ota`

---

## 🎉 Success!

Your UniMixer OTA Server is now:
- ✅ **Containerized** for easy deployment
- ✅ **Auto-starting** on server boot
- ✅ **Health monitored** with automatic restart
- ✅ **Persistently storing** firmware files
- ✅ **Production ready** with security best practices

Access your server at: **http://your-server-ip:3000** 
