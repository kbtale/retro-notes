#!/bin/bash
set -e

echo "========================================"
echo "RetroNotes Docker Setup"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and update JWT_SECRET before running in production!"
    echo ""
else
    echo ".env file already exists, skipping creation."
    echo ""
fi

echo "Starting Docker containers..."
echo ""
docker-compose up --build