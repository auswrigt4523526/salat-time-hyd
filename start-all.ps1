# Namaz Timing App - Startup Script
# This script starts all required services for the application

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Namaz Timing App - Starting Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB directory exists
if (-not (Test-Path "C:\data\db")) {
    Write-Host "Creating MongoDB data directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "C:\data\db" | Out-Null
    Write-Host "MongoDB directory created" -ForegroundColor Green
}

# Function to start a service in a new window
function Start-ServiceInNewWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDirectory = ""
    )
    
    if ($WorkingDirectory) {
        $psCommand = "Set-Location '$WorkingDirectory'; $Command"
    } else {
        $psCommand = $Command
    }
    
    Start-Process powershell -ArgumentList "-NoExit","-Command",$psCommand -WindowStyle Normal
    Write-Host "Started: $Title" -ForegroundColor Green
}

Write-Host "Starting services..." -ForegroundColor Cyan
Write-Host ""

# Start MongoDB
Write-Host "1. Starting MongoDB..." -ForegroundColor Yellow
Start-ServiceInNewWindow -Title "MongoDB" -Command "mongod --dbpath C:\data\db"
Start-Sleep -Seconds 3

# Start Backend
Write-Host "2. Starting Backend API..." -ForegroundColor Yellow
$backendPath = "d:\Qader\app-main\backend"
$pythonPath = "d:\Qader\app-main\.venv\Scripts\python.exe"
Start-ServiceInNewWindow -Title "Backend API" -Command "$pythonPath -m uvicorn server:app --reload" -WorkingDirectory $backendPath
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "3. Starting Frontend..." -ForegroundColor Yellow
$frontendPath = "d:\Qader\app-main\frontend"
Start-ServiceInNewWindow -Title "Frontend" -Command "npm start" -WorkingDirectory $frontendPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All services started successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "   MongoDB:     localhost:27017" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8000/api" -ForegroundColor White
Write-Host "   Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "To run tests, execute:" -ForegroundColor Yellow
Write-Host "   .\run-tests.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop services: Close each PowerShell window or press Ctrl+C" -ForegroundColor Yellow
Write-Host ""
