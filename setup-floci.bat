@echo off
REM Quick setup script for Floci on Windows
REM Usage: setup-floci.bat

setlocal enabledelayedexpansion

echo.
echo 🚀 Starting Floci setup...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop from https://docker.com/products/docker-desktop
    exit /b 1
)

REM Check if Docker daemon is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker daemon is not running. Please start Docker Desktop.
    exit /b 1
)

echo ✅ Docker is installed and running
echo.

REM Pick the Compose command (v2 plugin preferred, legacy binary as fallback)
set "COMPOSE=docker compose"
docker compose version >nul 2>&1
if errorlevel 1 (
    set "COMPOSE=docker-compose"
    docker-compose version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker Compose is not installed. Please update Docker Desktop.
        exit /b 1
    )
)

REM Start Floci with Docker Compose
echo 📦 Starting Floci container...
%COMPOSE% up -d

REM Wait a moment for container to start
timeout /t 2 /nobreak

REM Check if container is running
docker ps | findstr floci >nul
if errorlevel 1 (
    echo ❌ Failed to start Floci container
    exit /b 1
)

echo ✅ Floci container is running on localhost:4566
echo.

REM Copy env file if it doesn't exist
if not exist .env.floci (
    echo 📝 Creating .env.floci from template...
    copy .env.floci.example .env.floci >nul
    echo ✅ Created .env.floci - edit as needed
) else (
    echo ✅ .env.floci already exists
)

echo.
echo ✨ Floci is ready! Try this in PowerShell:
echo.
echo   # Set environment variables:
echo   $env:AWS_ENDPOINT_URL="http://localhost:4566"
echo   $env:AWS_ACCESS_KEY_ID="test"
echo   $env:AWS_SECRET_ACCESS_KEY="test"
echo   $env:AWS_DEFAULT_REGION="us-east-1"
echo.
echo   # Create a test S3 bucket:
echo   aws s3 mb s3://my-test-bucket
echo   aws s3 ls
echo.
echo To stop Floci, run: !COMPOSE! down
echo.
