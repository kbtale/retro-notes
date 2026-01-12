#!/bin/bash
set -e

echo "Starting Infrastructure..."
docker-compose up -d --build

echo "Waiting for Database to be ready..."
sleep 5

echo "Installing Frontend Dependencies..."
cd frontend
npm install

echo "System ready! Starting Frontend..."
npm run dev