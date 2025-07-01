#!/bin/bash

# UniMixer OTA Server Docker Deployment Script
# This script sets up and deploys the UniMixer OTA server using Docker

set -e

echo "🚀 UniMixer OTA Server Deployment"
echo "================================="

# Configuration
CONTAINER_NAME="unimixer-ota-server"
IMAGE_NAME="unimixer-ota"
PORT=${PORT:-3000}
DATA_DIR="./data"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p ${DATA_DIR}/firmware
mkdir -p ${DATA_DIR}/logs
mkdir -p ./config

# Set proper permissions
echo "🔐 Setting permissions..."
chmod 755 ${DATA_DIR}
chmod 755 ${DATA_DIR}/firmware

# Stop existing container if running
echo "🛑 Stopping existing container..."
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

# Build the image
echo "🔨 Building Docker image..."
docker build -t ${IMAGE_NAME} .

# Run the container
echo "🐳 Starting container..."
docker-compose up -d

# Wait for container to be healthy
echo "⏳ Waiting for container to be ready..."
timeout 60 bash -c 'until docker exec ${CONTAINER_NAME} wget --spider -q http://localhost:3000/api/stats; do sleep 2; done' || {
    echo "❌ Container failed to start properly"
    docker logs ${CONTAINER_NAME}
    exit 1
}

echo "✅ UniMixer OTA Server is running!"
echo "📍 Access the server at: http://localhost:${PORT}"
echo "📊 Check status: docker-compose ps"
echo "📋 View logs: docker-compose logs -f"

# Display useful commands
echo ""
echo "📚 Useful Commands:"
echo "  Stop server:    docker-compose down"
echo "  View logs:      docker-compose logs -f unimixer-ota"
echo "  Shell access:   docker exec -it ${CONTAINER_NAME} sh"
echo "  Update server:  ./docker-deploy.sh" 
