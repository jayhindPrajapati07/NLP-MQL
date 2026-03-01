@echo off
setlocal

echo =============================================
echo  Starting Natural Language to MongoDB Stack
echo =============================================

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found.
    if exist ".env.example" (
        echo Creating .env from .env.example...
        copy .env.example .env > nul
        echo Please edit the .env file to add your GEMINI_API_KEY before continuing.
        pause
    ) else (
        echo Error: .env.example not found either. Please create a .env file with your GEMINI_API_KEY.
        exit /b 1
    )
)

echo Building and starting Docker containers...
docker-compose up -d --build

echo =============================================
echo  All services started successfully!
echo =============================================
echo Frontend Dashboard: http://localhost:3000
echo Backend API Docs:   http://localhost:8000/docs
echo System Database:    localhost:27017 (Mongo)
echo.
echo To view logs, run: docker-compose logs -f
echo To stop services, run: docker-compose down
