# Namaz Timing App - Test Runner Script
# This script runs the backend API tests

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 Namaz Timing App - Running Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "🔍 Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running!" -ForegroundColor Red
    Write-Host "   Please start the backend first using:" -ForegroundColor Yellow
    Write-Host "   .\start-all.ps1" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🚀 Running backend tests..." -ForegroundColor Cyan
Write-Host ""

# Run the tests
$pythonPath = "d:\Qader\app-main\.venv\Scripts\python.exe"
$testPath = "d:\Qader\app-main\backend_test.py"

& $pythonPath $testPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Test execution complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
