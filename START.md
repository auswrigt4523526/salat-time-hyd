# 🚀 Namaz Timing App - Quick Start Guide

## Prerequisites

Before running the application, ensure you have:
- ✅ MongoDB installed and running
- ✅ Python 3.14 (or compatible version)
- ✅ Node.js and Yarn installed
- ✅ Virtual environment set up (`.venv`)

---

## 🎯 Quick Start (Recommended)

### Option 1: Using PowerShell Scripts (Easiest)

1. **Start All Services:**
   ```powershell
   .\start-all.ps1
   ```

2. **Stop All Services:**
   - Press `Ctrl+C` in each terminal window

### Option 2: Manual Setup

Follow the steps below if you prefer to start services individually.

---

## 📝 Manual Setup Instructions

### Step 1: Start MongoDB

Open **Terminal 1** and run:
```powershell
mongod --dbpath C:\data\db
```

> **Note:** Keep this terminal open. MongoDB must run continuously.

---

### Step 2: Start Backend Server

Open **Terminal 2** and run:
```powershell
cd d:\Qader\app-main\backend
d:\Qader\app-main\.venv\Scripts\python.exe -m uvicorn server:app --reload
```

**Backend will be available at:** http://localhost:8000

**API Endpoints:**
- Root: http://localhost:8000/api
- Prayer Times: http://localhost:8000/api/prayer-times/{date}
  - Example: http://localhost:8000/api/prayer-times/22-Oct-2025

---

### Step 3: Start Frontend (Optional)

Open **Terminal 3** and run:
```powershell
cd d:\Qader\app-main\frontend
yarn start
```

**Frontend will be available at:** http://localhost:3000

---

## 🧪 Running Tests

Open **Terminal 4** and run:
```powershell
cd d:\Qader\app-main
d:\Qader\app-main\.venv\Scripts\python.exe backend_test.py
```

**Expected Output:** All 10 tests should pass ✅

---

## 🛠️ Troubleshooting

### MongoDB Issues
**Problem:** `Data directory C:\data\db not found`
**Solution:** Create the directory:
```powershell
New-Item -ItemType Directory -Force -Path C:\data\db
```

### Backend Issues
**Problem:** `ModuleNotFoundError: No module named 'requests'`
**Solution:** Install dependencies:
```powershell
d:\Qader\app-main\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

### Frontend Issues
**Problem:** Dependencies not installed
**Solution:**
```powershell
cd frontend
yarn install
```

---

## 📊 Service Status Check

| Service | URL | Status Check |
|---------|-----|--------------|
| MongoDB | localhost:27017 | Running if no errors in Terminal 1 |
| Backend API | http://localhost:8000/api | Should return `{"message": "Namaz Timing App API"}` |
| Frontend | http://localhost:3000 | Opens in browser automatically |

---

## 🔧 Environment Variables

Backend configuration is stored in `backend/.env`:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=namaz_timing_app
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

---

## 💡 Useful Commands

### Backend
```powershell
# Start with auto-reload
uvicorn server:app --reload

# Start on different port
uvicorn server:app --port 8080
```

### Frontend
```powershell
# Install dependencies
yarn install

# Start development server
yarn start

# Build for production
yarn build
```

### Tests
```powershell
# Run all backend tests
d:\Qader\app-main\.venv\Scripts\python.exe backend_test.py
```

---

## 📁 Project Structure

```
app-main/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/              # React source code
│   ├── public/           # Static files
│   └── package.json      # Node dependencies
├── backend_test.py       # API integration tests
└── START.md             # This file
```

---

## 🎉 Success!

If everything is running correctly, you should see:
- ✅ MongoDB running on port 27017
- ✅ Backend API responding at http://localhost:8000/api
- ✅ Frontend (if started) at http://localhost:3000
- ✅ All tests passing (10/10)

Happy coding! 🚀
# 🚀 Namaz Timing App - Quick Start Guide

## Prerequisites

Before running the application, ensure you have:
- ✅ MongoDB installed and running
- ✅ Python 3.14 (or compatible version)
- ✅ Node.js and Yarn installed
- ✅ Virtual environment set up (`.venv`)

---

## 🎯 Quick Start (Recommended)

### Option 1: Using PowerShell Scripts (Easiest)

1. **Start All Services:**
   ```powershell
   .\start-all.ps1
   ```

2. **Stop All Services:**
   - Press `Ctrl+C` in each terminal window

### Option 2: Manual Setup

Follow the steps below if you prefer to start services individually.

---

## 📝 Manual Setup Instructions

### Step 1: Start MongoDB

Open **Terminal 1** and run:
```powershell
mongod --dbpath C:\data\db
```

> **Note:** Keep this terminal open. MongoDB must run continuously.

---

### Step 2: Start Backend Server

Open **Terminal 2** and run:
```powershell
cd d:\Qader\app-main\backend
d:\Qader\app-main\.venv\Scripts\python.exe -m uvicorn server:app --reload
```

**Backend will be available at:** http://localhost:8000

**API Endpoints:**
- Root: http://localhost:8000/api
- Prayer Times: http://localhost:8000/api/prayer-times/{date}
  - Example: http://localhost:8000/api/prayer-times/22-Oct-2025

---

### Step 3: Start Frontend (Optional)

Open **Terminal 3** and run:
```powershell
cd d:\Qader\app-main\frontend
yarn start
```

**Frontend will be available at:** http://localhost:3000

---

## 🧪 Running Tests

Open **Terminal 4** and run:
```powershell
cd d:\Qader\app-main
d:\Qader\app-main\.venv\Scripts\python.exe backend_test.py
```

**Expected Output:** All 10 tests should pass ✅

---

## 🛠️ Troubleshooting

### MongoDB Issues
**Problem:** `Data directory C:\data\db not found`
**Solution:** Create the directory:
```powershell
New-Item -ItemType Directory -Force -Path C:\data\db
```

### Backend Issues
**Problem:** `ModuleNotFoundError: No module named 'requests'`
**Solution:** Install dependencies:
```powershell
d:\Qader\app-main\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

### Frontend Issues
**Problem:** Dependencies not installed
**Solution:**
```powershell
cd frontend
yarn install
```

---

## 📊 Service Status Check

| Service | URL | Status Check |
|---------|-----|--------------|
| MongoDB | localhost:27017 | Running if no errors in Terminal 1 |
| Backend API | http://localhost:8000/api | Should return `{"message": "Namaz Timing App API"}` |
| Frontend | http://localhost:3000 | Opens in browser automatically |

---

## 🔧 Environment Variables

Backend configuration is stored in `backend/.env`:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=namaz_timing_app
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

---

## 💡 Useful Commands

### Backend
```powershell
# Start with auto-reload
uvicorn server:app --reload

# Start on different port
uvicorn server:app --port 8080
```

### Frontend
```powershell
# Install dependencies
yarn install

# Start development server
yarn start

# Build for production
yarn build
```

### Tests
```powershell
# Run all backend tests
d:\Qader\app-main\.venv\Scripts\python.exe backend_test.py
```

---

## 📁 Project Structure

```
app-main/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/              # React source code
│   ├── public/           # Static files
│   └── package.json      # Node dependencies
├── backend_test.py       # API integration tests
└── START.md             # This file
```

---

## 🎉 Success!

If everything is running correctly, you should see:
- ✅ MongoDB running on port 27017
- ✅ Backend API responding at http://localhost:8000/api
- ✅ Frontend (if started) at http://localhost:3000
- ✅ All tests passing (10/10)

Happy coding! 🚀
