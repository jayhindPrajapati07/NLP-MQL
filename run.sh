#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================="
echo " Starting Natural Language to MongoDB Stack"
echo "============================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found."
    if [ -f .env.example ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo "Please edit the .env file to add your GEMINI_API_KEY before continuing."
        echo "Press any key to continue once you have updated the .env file (or press Ctrl+C to abort)..."
        read -n 1 -s
    else
        echo "Error: .env.example not found either. Please create a .env file with your GEMINI_API_KEY."
        exit 1
    fi
fi

echo "Building and starting Docker containers..."
docker compose up -d --build

echo "============================================="
echo " All services started successfully!"
echo "============================================="
echo "Frontend Dashboard: http://localhost:3000"
echo "Backend API Docs:   http://localhost:8000/docs"
echo "System Database:    localhost:27017 (Mongo)"
echo ""
echo "To view logs, run: docker compose logs -f"
echo "To stop services, run: docker compose down"
