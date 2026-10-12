#!/bin/bash
# Quick setup script for Floci on macOS and Linux
# Usage: ./setup-floci.sh

set -e

echo "🚀 Starting Floci setup..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop from https://docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is installed and running"

# Pick the Compose command (v2 plugin preferred, legacy binary as fallback)
if docker compose version &> /dev/null; then
    COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE="docker-compose"
else
    echo "❌ Docker Compose is not installed. Please update Docker Desktop."
    exit 1
fi

# Start Floci with Docker Compose
echo "📦 Starting Floci container..."
$COMPOSE up -d

# Wait a moment for container to start
sleep 2

# Check if container is running
if docker ps | grep -q floci; then
    echo "✅ Floci container is running on localhost:4566"
else
    echo "❌ Failed to start Floci container"
    exit 1
fi

# Copy env file if it doesn't exist
if [ ! -f .env.floci ]; then
    echo "📝 Creating .env.floci from template..."
    cp .env.floci.example .env.floci
    echo "✅ Created .env.floci (edit as needed)"
fi

echo ""
echo "✨ Floci is ready! Try this:"
echo ""
echo "  # Set environment variables in your terminal:"
echo "  set -a; source .env.floci; set +a"
echo ""
echo "  # Create a test S3 bucket:"
echo "  aws s3 mb s3://my-test-bucket"
echo "  aws s3 ls"
echo ""
echo "To stop Floci, run: $COMPOSE down"
echo ""
