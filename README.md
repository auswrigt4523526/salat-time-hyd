# Salat Time Hyd

Islamic prayer times application for Hyderabad, India with Hijri calendar support.

## Features

- 🕌 Accurate prayer times using Aladhan API (Hanafi method)
- 🌙 Hijri date display with manual adjustment
- 🌙 Dark mode for night prayers (Fajr & Isha)
- ⏰ Prayer time manual adjustments
- 🔔 Prayer notifications
- 📱 Share prayer times as beautiful images
- 📅 Date navigation (Previous/Next day)

## Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account
- MongoDB Atlas account (free tier)

### Deployment Steps

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Salat Time Hyd"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/salat-time-hyd.git
   git push -u origin main
   ```

2. **Set up MongoDB Atlas:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/namaz`)

3. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Add environment variable:
     - Name: `MONGODB_URL`
     - Value: Your MongoDB Atlas connection string
   - Click "Deploy"

4. **Access on Mobile:**
   - Vercel will give you a URL like: `https://salat-time-hyd.vercel.app`
   - Open this URL on your mobile browser
   - Add to home screen for app-like experience

## Local Development

### Start All Services
```bash
.\start-all.ps1
```

### Individual Services

**MongoDB:**
```bash
mongod --dbpath C:\data\db
```

**Backend:**
```bash
cd backend
..\venv\Scripts\python.exe -m uvicorn server:app --reload
```

**Frontend:**
```bash
cd frontend
npm start
```

## Tech Stack

- **Frontend:** React, Tailwind CSS, html2canvas
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **API:** Aladhan Islamic Prayer Times API

## License

Personal use for Islamic prayer times.

---
May Allah accept our prayers 🤲
الله أكبر • Allahu Akbar!
