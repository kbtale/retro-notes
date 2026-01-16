@echo off
echo ========================================
echo RetroNotes Docker Setup
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Edit .env and update JWT_SECRET before running in production!
    echo.
) else (
    echo .env file already exists, skipping creation.
    echo.
)

echo Starting Docker containers...
echo.
docker-compose up --build

pause
