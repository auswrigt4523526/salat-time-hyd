# How to Update Your Salat Time App - Complete Guide

**App Name:** Salat Time Hyd  
**Live URL:** https://salat-time-hyd.vercel.app  
**GitHub Repository:** https://github.com/auswrigt4523526/salat-time-hyd

---

## 📋 Quick Reference - Your App Setup

### Deployment Architecture
- **Frontend (React):** Hosted on Vercel
  - URL: https://salat-time-hyd.vercel.app
  - Auto-deploys from GitHub main branch
  
- **Backend (FastAPI/Python):** Hosted on Render.com
  - URL: https://salat-time-hyd.onrender.com
  - Auto-deploys from GitHub main branch
  
- **Database:** MongoDB Atlas
  - Cluster: namaz.58tbxud.mongodb.net
  - Database Name: namaz_db
  - Username: auswrigt_db_user

### Your Accounts
- **GitHub Username:** auswrigt4523526
- **Vercel:** Connected to GitHub
- **Render.com:** Connected to GitHub
- **MongoDB Atlas:** Cloud database

---

## 🔄 How to Make Changes and Updates

### Step 1: Make Changes Locally

1. **Open your project folder** in VS Code or any text editor
   - Location: `d:\Qader\app-main`

2. **Edit the files** you want to change (see common changes below)

3. **Test your changes locally** before deploying:

   **Test Backend:**
   ```bash
   cd d:\Qader\app-main\backend
   uvicorn main:app --reload
   ```
   Open: http://localhost:8000

   **Test Frontend (in a new terminal):**
   ```bash
   cd d:\Qader\app-main\frontend
   npm start
   ```
   Open: http://localhost:3000

### Step 2: Push Changes to GitHub

Once you're satisfied with your changes:

```bash
# Navigate to your project folder
cd d:\Qader\app-main

# Check what files you changed
git status

# Add all changed files
git add .

# Commit with a description of what you changed
git commit -m "Description of your changes"

# Push to GitHub
git push origin main
```

### Step 3: Automatic Deployment

After pushing to GitHub, your changes will automatically deploy:

- **Vercel (Frontend):** Takes 1-2 minutes
  - Check status: https://vercel.com/dashboard
  
- **Render (Backend):** Takes 2-3 minutes
  - Check status: https://dashboard.render.com
  - Note: First request after inactivity may take 50+ seconds (free tier)

### Step 4: Verify Your Changes

Visit https://salat-time-hyd.vercel.app to see your updates live!

---

## 📝 Common Changes You Might Want to Make

### 1. **Change Colors or Design**

**File to edit:** `frontend/src/App.js`

Examples:
- Change background gradient colors
- Modify table styling
- Update button colors
- Change text sizes

### 2. **Change Prayer Calculation Method**

**File to edit:** `backend/main.py`

Find the line with `method=2` (currently using ISNA method):
```python
params = {
    "latitude": 17.385044,
    "longitude": 78.486671,
    "method": 2,  # Change this number
}
```

**Available Methods:**
- 1 = University of Islamic Sciences, Karachi
- 2 = Islamic Society of North America (ISNA) - **Currently Used**
- 3 = Muslim World League
- 4 = Umm Al-Qura University, Makkah
- 5 = Egyptian General Authority of Survey
- 7 = Institute of Geophysics, University of Tehran
- 8 = Gulf Region
- 9 = Kuwait
- 10 = Qatar
- 11 = Majlis Ugama Islam Singapura, Singapore
- 12 = Union Organization islamic de France
- 13 = Diyanet İşleri Başkanlığı, Turkey

### 3. **Change City/Location**

**File to edit:** `backend/main.py`

Update the coordinates:
```python
params = {
    "latitude": 17.385044,   # Hyderabad latitude
    "longitude": 78.486671,  # Hyderabad longitude
    "method": 2,
}
```

**To find coordinates for a new city:**
1. Go to: https://www.latlong.net/
2. Search for your city
3. Copy the latitude and longitude

### 4. **Change App Title or Description**

**File to edit:** `frontend/public/index.html`

```html
<title>Namaz Timings - Hyderabad</title>
<meta name="description" content="Islamic prayer times for Hyderabad, India" />
```

### 5. **Add New Features to Frontend**

**File to edit:** `frontend/src/App.js`

This is where all the UI components are located.

### 6. **Add New API Endpoints**

**File to edit:** `backend/main.py`

Add new endpoints after the existing ones.

---

## 🔧 Installing New Packages

### For Frontend (React/JavaScript):

```bash
cd d:\Qader\app-main\frontend
npm install package-name
```

Then push to GitHub - Vercel will automatically install it.

### For Backend (Python):

```bash
cd d:\Qader\app-main\backend
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt
```

Then push to GitHub - Render will automatically install it.

---

## ⚙️ Updating Environment Variables

### Frontend Environment Variables (Vercel)

1. Go to: https://vercel.com/dashboard
2. Select your project: **salat-time-hyd**
3. Go to **Settings** → **Environment Variables**
4. Update the variable
5. **Redeploy** from the Deployments tab

**Current Variables:**
- `REACT_APP_BACKEND_URL` = https://salat-time-hyd.onrender.com

### Backend Environment Variables (Render)

1. Go to: https://dashboard.render.com
2. Select your service: **salat-time-hyd**
3. Go to **Environment** tab
4. Update the variable
5. Render will automatically redeploy

**Current Variables:**
- `MONGO_URL` = mongodb+srv://auswrigt_db_user:azhar4523526@namaz.58tbxud.mongodb.net/?retryWrites=true&w=majority&appName=Namaz
- `DB_NAME` = namaz_db
- `CORS_ORIGINS` = https://salat-time-hyd.vercel.app

⚠️ **Important:** Never commit passwords or API keys to GitHub!

---

## 🗄️ MongoDB Database Access

### Accessing Your Database

1. Go to: https://cloud.mongodb.com/
2. Login with your account
3. Select **Namaz** cluster
4. Click **Browse Collections** to view data

### Database Structure

**Collection:** `prayer_adjustments`
- Stores user adjustments for prayer times
- Stores Hijri date adjustments

**Collection:** `notifications`
- Stores notification preferences

---

## 🐛 Troubleshooting Common Issues

### Changes Not Showing Up?

1. **Clear browser cache:** Ctrl + Shift + R (hard refresh)
2. **Check deployment status:**
   - Vercel: https://vercel.com/dashboard
   - Render: https://dashboard.render.com
3. **Check browser console** for errors: Press F12

### Backend Not Responding (502 Error)?

- **Free tier cold start:** First request after inactivity takes 50+ seconds
- **Solution:** Wait and refresh, or upgrade Render plan

### MongoDB Connection Issues?

1. Check IP whitelist in MongoDB Atlas (should be 0.0.0.0/0 for all access)
2. Verify credentials in Render environment variables
3. Test connection with: `python test_mongodb_connection.py`

### Git Push Errors?

```bash
# If remote URL changed
git remote set-url origin https://github.com/auswrigt4523526/salat-time-hyd.git

# If you need to force push (use carefully!)
git push origin main --force
```

---

## 📱 Sharing Your App

Your app is accessible from any device with internet:

**Main URL:** https://salat-time-hyd.vercel.app

You can:
- Share this link on social media
- Add to phone home screen (works like an app!)
- Bookmark in browser
- Share prayer times as images using the built-in share button

### Adding to Phone Home Screen

**iPhone:**
1. Open Safari → Visit your app URL
2. Tap Share button → "Add to Home Screen"

**Android:**
1. Open Chrome → Visit your app URL
2. Tap Menu (3 dots) → "Add to Home Screen"

---

## 🚀 Future Enhancement Ideas

### Easy Additions:
- Change colors and themes
- Add more languages
- Update prayer calculation methods
- Add custom notifications sounds

### Medium Complexity:
- Add user accounts and login
- Save multiple cities
- Add Qibla direction compass
- Add Islamic calendar

### Advanced Features:
- Mobile app (React Native)
- Offline mode
- Widget support
- Custom Azan audio

---

## 📞 Important Links - Bookmarks

### Your App
- Live App: https://salat-time-hyd.vercel.app
- GitHub Repo: https://github.com/auswrigt4523526/salat-time-hyd

### Deployment Dashboards
- Vercel Dashboard: https://vercel.com/dashboard
- Render Dashboard: https://dashboard.render.com
- MongoDB Atlas: https://cloud.mongodb.com/

### API Documentation
- Aladhan API (Prayer Times): https://aladhan.com/prayer-times-api
- FastAPI Docs (Your Backend): https://salat-time-hyd.onrender.com/docs

### Learning Resources
- React Documentation: https://react.dev/
- FastAPI Documentation: https://fastapi.tiangolo.com/
- MongoDB Documentation: https://www.mongodb.com/docs/

---

## 📋 Quick Command Reference

### Git Commands
```bash
git status                      # Check what changed
git add .                       # Stage all changes
git commit -m "message"         # Commit changes
git push origin main            # Push to GitHub
git pull origin main            # Get latest changes
```

### Local Development
```bash
# Backend
cd backend
uvicorn main:app --reload

# Frontend
cd frontend
npm start

# Install dependencies
npm install                     # Frontend
pip install -r requirements.txt # Backend
```

### Testing
```bash
# Test MongoDB connection
python test_mongodb_connection.py

# Test backend API
curl https://salat-time-hyd.onrender.com/prayer-times
```

---

## ✅ Maintenance Checklist

### Monthly:
- [ ] Check if all prayer times are accurate
- [ ] Test all features (share, notifications, adjustments)
- [ ] Check Render service is running (free tier may sleep)
- [ ] Update dependencies if needed

### When Needed:
- [ ] Update calculation method if required by local scholars
- [ ] Adjust Hijri calendar if drift occurs
- [ ] Update UI based on user feedback
- [ ] Add new features as requested

---

## 🎯 Project File Structure

```
app-main/
├── frontend/                   # React frontend
│   ├── src/
│   │   └── App.js             # Main app component
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── package.json           # Dependencies
│   └── .env.production        # Production config
│
├── backend/                    # FastAPI backend
│   ├── main.py                # API endpoints
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Local config
│
├── vercel.json                # Vercel deployment config
├── README.md                  # Project documentation
└── test_mongodb_connection.py # MongoDB test script
```

---

## 💡 Tips and Best Practices

1. **Always test locally** before pushing to GitHub
2. **Write meaningful commit messages** describing your changes
3. **Don't commit sensitive data** (passwords, API keys) to GitHub
4. **Keep backups** of your environment variables
5. **Monitor your deployment** dashboards after pushing changes
6. **Test on mobile devices** after deploying
7. **Update this guide** as you make changes to remember what you did

---

## 🆘 Getting Help

If you encounter issues:

1. **Check deployment logs:**
   - Vercel: Deployments tab → Click on deployment → View logs
   - Render: Events tab → View build/deploy logs

2. **Check browser console:**
   - Press F12 → Console tab → Look for errors

3. **Search for error messages:**
   - Google the exact error message
   - Check Stack Overflow
   - Check GitHub issues

4. **Common resources:**
   - Vercel Docs: https://vercel.com/docs
   - Render Docs: https://render.com/docs
   - MongoDB Docs: https://www.mongodb.com/docs/

---

**Document Created:** 2025-01-23  
**App Version:** 1.0  
**Last Updated:** 2025-01-23

---

**Remember:** Your app is live and working perfectly! Take your time when making changes, test thoroughly, and don't hesitate to experiment. You can always revert to a previous version using Git if something goes wrong.

May Allah make this project beneficial for you and others! 🤲

---
# How to Update Your Salat Time App - Complete Guide

**App Name:** Salat Time Hyd  
**Live URL:** https://salat-time-hyd.vercel.app  
**GitHub Repository:** https://github.com/auswrigt4523526/salat-time-hyd

---

## 📋 Quick Reference - Your App Setup

### Deployment Architecture
- **Frontend (React):** Hosted on Vercel
  - URL: https://salat-time-hyd.vercel.app
  - Auto-deploys from GitHub main branch
  
- **Backend (FastAPI/Python):** Hosted on Render.com
  - URL: https://salat-time-hyd.onrender.com
  - Auto-deploys from GitHub main branch
  
- **Database:** MongoDB Atlas
  - Cluster: namaz.58tbxud.mongodb.net
  - Database Name: namaz_db
  - Username: auswrigt_db_user

### Your Accounts
- **GitHub Username:** auswrigt4523526
- **Vercel:** Connected to GitHub
- **Render.com:** Connected to GitHub
- **MongoDB Atlas:** Cloud database

---

## 🔄 How to Make Changes and Updates

### Step 1: Make Changes Locally

1. **Open your project folder** in VS Code or any text editor
   - Location: `d:\Qader\app-main`

2. **Edit the files** you want to change (see common changes below)

3. **Test your changes locally** before deploying:

   **Test Backend:**
   ```bash
   cd d:\Qader\app-main\backend
   uvicorn main:app --reload
   ```
   Open: http://localhost:8000

   **Test Frontend (in a new terminal):**
   ```bash
   cd d:\Qader\app-main\frontend
   npm start
   ```
   Open: http://localhost:3000

### Step 2: Push Changes to GitHub

Once you're satisfied with your changes:

```bash
# Navigate to your project folder
cd d:\Qader\app-main

# Check what files you changed
git status

# Add all changed files
git add .

# Commit with a description of what you changed
git commit -m "Description of your changes"

# Push to GitHub
git push origin main
```

### Step 3: Automatic Deployment

After pushing to GitHub, your changes will automatically deploy:

- **Vercel (Frontend):** Takes 1-2 minutes
  - Check status: https://vercel.com/dashboard
  
- **Render (Backend):** Takes 2-3 minutes
  - Check status: https://dashboard.render.com
  - Note: First request after inactivity may take 50+ seconds (free tier)

### Step 4: Verify Your Changes

Visit https://salat-time-hyd.vercel.app to see your updates live!

---

## 📝 Common Changes You Might Want to Make

### 1. **Change Colors or Design**

**File to edit:** `frontend/src/App.js`

Examples:
- Change background gradient colors
- Modify table styling
- Update button colors
- Change text sizes

### 2. **Change Prayer Calculation Method**

**File to edit:** `backend/main.py`

Find the line with `method=2` (currently using ISNA method):
```python
params = {
    "latitude": 17.385044,
    "longitude": 78.486671,
    "method": 2,  # Change this number
}
```

**Available Methods:**
- 1 = University of Islamic Sciences, Karachi
- 2 = Islamic Society of North America (ISNA) - **Currently Used**
- 3 = Muslim World League
- 4 = Umm Al-Qura University, Makkah
- 5 = Egyptian General Authority of Survey
- 7 = Institute of Geophysics, University of Tehran
- 8 = Gulf Region
- 9 = Kuwait
- 10 = Qatar
- 11 = Majlis Ugama Islam Singapura, Singapore
- 12 = Union Organization islamic de France
- 13 = Diyanet İşleri Başkanlığı, Turkey

### 3. **Change City/Location**

**File to edit:** `backend/main.py`

Update the coordinates:
```python
params = {
    "latitude": 17.385044,   # Hyderabad latitude
    "longitude": 78.486671,  # Hyderabad longitude
    "method": 2,
}
```

**To find coordinates for a new city:**
1. Go to: https://www.latlong.net/
2. Search for your city
3. Copy the latitude and longitude

### 4. **Change App Title or Description**

**File to edit:** `frontend/public/index.html`

```html
<title>Namaz Timings - Hyderabad</title>
<meta name="description" content="Islamic prayer times for Hyderabad, India" />
```

### 5. **Add New Features to Frontend**

**File to edit:** `frontend/src/App.js`

This is where all the UI components are located.

### 6. **Add New API Endpoints**

**File to edit:** `backend/main.py`

Add new endpoints after the existing ones.

---

## 🔧 Installing New Packages

### For Frontend (React/JavaScript):

```bash
cd d:\Qader\app-main\frontend
npm install package-name
```

Then push to GitHub - Vercel will automatically install it.

### For Backend (Python):

```bash
cd d:\Qader\app-main\backend
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt
```

Then push to GitHub - Render will automatically install it.

---

## ⚙️ Updating Environment Variables

### Frontend Environment Variables (Vercel)

1. Go to: https://vercel.com/dashboard
2. Select your project: **salat-time-hyd**
3. Go to **Settings** → **Environment Variables**
4. Update the variable
5. **Redeploy** from the Deployments tab

**Current Variables:**
- `REACT_APP_BACKEND_URL` = https://salat-time-hyd.onrender.com

### Backend Environment Variables (Render)

1. Go to: https://dashboard.render.com
2. Select your service: **salat-time-hyd**
3. Go to **Environment** tab
4. Update the variable
5. Render will automatically redeploy

**Current Variables:**
- `MONGO_URL` = mongodb+srv://auswrigt_db_user:azhar4523526@namaz.58tbxud.mongodb.net/?retryWrites=true&w=majority&appName=Namaz
- `DB_NAME` = namaz_db
- `CORS_ORIGINS` = https://salat-time-hyd.vercel.app

⚠️ **Important:** Never commit passwords or API keys to GitHub!

---

## 🗄️ MongoDB Database Access

### Accessing Your Database

1. Go to: https://cloud.mongodb.com/
2. Login with your account
3. Select **Namaz** cluster
4. Click **Browse Collections** to view data

### Database Structure

**Collection:** `prayer_adjustments`
- Stores user adjustments for prayer times
- Stores Hijri date adjustments

**Collection:** `notifications`
- Stores notification preferences

---

## 🐛 Troubleshooting Common Issues

### Changes Not Showing Up?

1. **Clear browser cache:** Ctrl + Shift + R (hard refresh)
2. **Check deployment status:**
   - Vercel: https://vercel.com/dashboard
   - Render: https://dashboard.render.com
3. **Check browser console** for errors: Press F12

### Backend Not Responding (502 Error)?

- **Free tier cold start:** First request after inactivity takes 50+ seconds
- **Solution:** Wait and refresh, or upgrade Render plan

### MongoDB Connection Issues?

1. Check IP whitelist in MongoDB Atlas (should be 0.0.0.0/0 for all access)
2. Verify credentials in Render environment variables
3. Test connection with: `python test_mongodb_connection.py`

### Git Push Errors?

```bash
# If remote URL changed
git remote set-url origin https://github.com/auswrigt4523526/salat-time-hyd.git

# If you need to force push (use carefully!)
git push origin main --force
```

---

## 📱 Sharing Your App

Your app is accessible from any device with internet:

**Main URL:** https://salat-time-hyd.vercel.app

You can:
- Share this link on social media
- Add to phone home screen (works like an app!)
- Bookmark in browser
- Share prayer times as images using the built-in share button

### Adding to Phone Home Screen

**iPhone:**
1. Open Safari → Visit your app URL
2. Tap Share button → "Add to Home Screen"

**Android:**
1. Open Chrome → Visit your app URL
2. Tap Menu (3 dots) → "Add to Home Screen"

---

## 🚀 Future Enhancement Ideas

### Easy Additions:
- Change colors and themes
- Add more languages
- Update prayer calculation methods
- Add custom notifications sounds

### Medium Complexity:
- Add user accounts and login
- Save multiple cities
- Add Qibla direction compass
- Add Islamic calendar

### Advanced Features:
- Mobile app (React Native)
- Offline mode
- Widget support
- Custom Azan audio

---

## 📞 Important Links - Bookmarks

### Your App
- Live App: https://salat-time-hyd.vercel.app
- GitHub Repo: https://github.com/auswrigt4523526/salat-time-hyd

### Deployment Dashboards
- Vercel Dashboard: https://vercel.com/dashboard
- Render Dashboard: https://dashboard.render.com
- MongoDB Atlas: https://cloud.mongodb.com/

### API Documentation
- Aladhan API (Prayer Times): https://aladhan.com/prayer-times-api
- FastAPI Docs (Your Backend): https://salat-time-hyd.onrender.com/docs

### Learning Resources
- React Documentation: https://react.dev/
- FastAPI Documentation: https://fastapi.tiangolo.com/
- MongoDB Documentation: https://www.mongodb.com/docs/

---

## 📋 Quick Command Reference

### Git Commands
```bash
git status                      # Check what changed
git add .                       # Stage all changes
git commit -m "message"         # Commit changes
git push origin main            # Push to GitHub
git pull origin main            # Get latest changes
```

### Local Development
```bash
# Backend
cd backend
uvicorn main:app --reload

# Frontend
cd frontend
npm start

# Install dependencies
npm install                     # Frontend
pip install -r requirements.txt # Backend
```

### Testing
```bash
# Test MongoDB connection
python test_mongodb_connection.py

# Test backend API
curl https://salat-time-hyd.onrender.com/prayer-times
```

---

## ✅ Maintenance Checklist

### Monthly:
- [ ] Check if all prayer times are accurate
- [ ] Test all features (share, notifications, adjustments)
- [ ] Check Render service is running (free tier may sleep)
- [ ] Update dependencies if needed

### When Needed:
- [ ] Update calculation method if required by local scholars
- [ ] Adjust Hijri calendar if drift occurs
- [ ] Update UI based on user feedback
- [ ] Add new features as requested

---

## 🎯 Project File Structure

```
app-main/
├── frontend/                   # React frontend
│   ├── src/
│   │   └── App.js             # Main app component
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── package.json           # Dependencies
│   └── .env.production        # Production config
│
├── backend/                    # FastAPI backend
│   ├── main.py                # API endpoints
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Local config
│
├── vercel.json                # Vercel deployment config
├── README.md                  # Project documentation
└── test_mongodb_connection.py # MongoDB test script
```

---

## 💡 Tips and Best Practices

1. **Always test locally** before pushing to GitHub
2. **Write meaningful commit messages** describing your changes
3. **Don't commit sensitive data** (passwords, API keys) to GitHub
4. **Keep backups** of your environment variables
5. **Monitor your deployment** dashboards after pushing changes
6. **Test on mobile devices** after deploying
7. **Update this guide** as you make changes to remember what you did

---

## 🆘 Getting Help

If you encounter issues:

1. **Check deployment logs:**
   - Vercel: Deployments tab → Click on deployment → View logs
   - Render: Events tab → View build/deploy logs

2. **Check browser console:**
   - Press F12 → Console tab → Look for errors

3. **Search for error messages:**
   - Google the exact error message
   - Check Stack Overflow
   - Check GitHub issues

4. **Common resources:**
   - Vercel Docs: https://vercel.com/docs
   - Render Docs: https://render.com/docs
   - MongoDB Docs: https://www.mongodb.com/docs/

---

**Document Created:** 2025-01-23  
**App Version:** 1.0  
**Last Updated:** 2025-01-23

---

**Remember:** Your app is live and working perfectly! Take your time when making changes, test thoroughly, and don't hesitate to experiment. You can always revert to a previous version using Git if something goes wrong.

May Allah make this project beneficial for you and others! 🤲

---
