from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import uuid
from datetime import datetime, timezone
import requests
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Hyderabad coordinates
HYDERABAD_LAT = 17.3850
HYDERABAD_LNG = 78.4867

# Define Models
class PrayerTime(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    start_time: str
    end_time: str
    start_adjustment: int = 0  # Manual adjustment for start time in minutes
    end_adjustment: int = 0    # Manual adjustment for end time in minutes
    adjustment: int = 0  # Deprecated: kept for backward compatibility

class PrayerTimings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # DD-MMM-YYYY format
    hijri_date: str
    hijri_month: str
    hijri_year: str
    prayers: List[PrayerTime]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PrayerAdjustment(BaseModel):
    prayer_name: str
    start_adjustment: int = 0  # in minutes
    end_adjustment: int = 0    # in minutes
    adjustment: int = 0  # Deprecated: kept for backward compatibility

class ManualAdjustments(BaseModel):
    adjustments: List[PrayerAdjustment]

class HijriAdjustment(BaseModel):
    day_adjustment: int = 0  # +/- days to adjust Hijri date

def get_hijri_date(gregorian_date):
    """Convert Gregorian date to Hijri date using simple calculation"""
    # This is a simplified conversion - in production, use proper Hijri conversion library
    from datetime import datetime
    
    # Simple approximation - Islamic calendar started on July 16, 622 CE
    islamic_epoch = datetime(622, 7, 16)
    
    if isinstance(gregorian_date, str):
        gregorian_date = datetime.strptime(gregorian_date, '%d-%b-%Y')
    
    days_diff = (gregorian_date - islamic_epoch).days
    # Islamic year is approximately 354.367 days
    hijri_year = int(days_diff / 354.367) + 1
    
    remaining_days = days_diff % 354.367
    hijri_month = int(remaining_days / 29.53) + 1
    hijri_day = int(remaining_days % 29.53) + 1
    
    # Hijri month names
    hijri_months = [
        'Muharram', 'Safar', 'Rabi al-awwal', 'Rabi al-thani',
        'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
        'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ]
    
    if hijri_month > 12:
        hijri_month = 12
    
    return {
        'day': hijri_day,
        'month': hijri_months[hijri_month - 1] if hijri_month <= 12 else hijri_months[11],
        'year': hijri_year
    }

def calculate_end_times(prayer_times):
    """Calculate end times for each prayer"""
    prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    end_times = {}
    
    for i, prayer in enumerate(prayers):
        if i < len(prayers) - 1:
            # End time is the start of next prayer
            end_times[prayer] = prayer_times[prayers[i + 1]]
        else:
            # Isha ends at Fajr next day (we'll show until midnight for simplicity)
            end_times[prayer] = "23:59"
    
    return end_times

def format_time_12h_no_ampm(time_24h):
    """Convert 24h to 12h format without AM/PM"""
    try:
        hour, minute = map(int, time_24h.split(':'))
        if hour == 0:
            return f"12:{minute:02d}"
        elif hour <= 12:
            return f"{hour}:{minute:02d}"
        else:
            return f"{hour-12}:{minute:02d}"
    except:
        return time_24h

async def get_prayer_times_from_api(date_str):
    """Fetch prayer times from Aladhan API"""
    try:
        # Convert DD-MMM-YYYY to DD-MM-YYYY for API
        date_obj = datetime.strptime(date_str, '%d-%b-%Y')
        api_date = date_obj.strftime('%d-%m-%Y')
        
        url = "http://api.aladhan.com/v1/timings"
        params = {
            "latitude": HYDERABAD_LAT,
            "longitude": HYDERABAD_LNG,
            "method": 2,  # Islamic Society of North America
            "school": 1   # Hanafi madhab (0=Shafi, 1=Hanafi)
        }
        
        response = requests.get(f"{url}/{api_date}", params=params)
        
        if response.status_code == 200:
            data = response.json()
            timings = data['data']['timings']
            hijri_data = data['data']['date']['hijri']
            
            # Extract 5 main prayers
            prayer_times = {
                'Fajr': timings['Fajr'],
                'Dhuhr': timings['Dhuhr'], 
                'Asr': timings['Asr'],
                'Maghrib': timings['Maghrib'],
                'Isha': timings['Isha']
            }
            
            end_times = calculate_end_times(prayer_times)
            
            # Return prayer times and Hijri date from API
            hijri_date_info = {
                'day': hijri_data['day'],
                'month': hijri_data['month']['en'],
                'year': hijri_data['year']
            }
            
            return prayer_times, end_times, hijri_date_info
        else:
            raise Exception(f"API error: {response.status_code}")
            
    except Exception as e:
        # Fallback times if API fails
        prayer_times = {
            'Fajr': '05:30',
            'Dhuhr': '12:30',
            'Asr': '16:00',
            'Maghrib': '18:30',
            'Isha': '20:00'
        }
        end_times = calculate_end_times(prayer_times)
        # Use manual calculation as fallback
        hijri_date_info = get_hijri_date(date_str)
        return prayer_times, end_times, hijri_date_info

# Add your routes to the router
@api_router.get("/")
async def root():
    return {"message": "Namaz Timing App API"}

@api_router.get("/prayer-times/{date}", response_model=PrayerTimings)
async def get_prayer_times(date: str):
    """Get prayer times for a specific date (DD-MMM-YYYY format)"""
    try:
        # Get prayer times and Hijri date from API
        prayer_times, end_times, hijri = await get_prayer_times_from_api(date)
        
        # Get stored prayer time adjustments
        stored_adjustments = await db.adjustments.find_one({"date": date})
        adjustments = stored_adjustments.get("adjustments", []) if stored_adjustments else []
        
        # Get Hijri date adjustment
        hijri_adjustment_doc = await db.hijri_adjustments.find_one({"date": date})
        hijri_day_adjustment = hijri_adjustment_doc.get("day_adjustment", 0) if hijri_adjustment_doc else 0
        
        # Apply Hijri date adjustment
        hijri_months = [
            'Muharram', 'Safar', 'Rabi al-awwal', 'Rabi al-thani',
            'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
            'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
        ]
        
        # Map API month names to our month list
        month_name_map = {
            'Muḥarram': 'Muharram',
            'Ṣafar': 'Safar',
            'Rabīʿ al-awwal': 'Rabi al-awwal',
            'Rabīʿ al-thānī': 'Rabi al-thani',
            'Jumādá al-ūlá': 'Jumada al-awwal',
            'Jumādá al-ākhirah': 'Jumada al-thani',
            'Rajab': 'Rajab',
            'Shaʿbān': 'Sha\'ban',
            'Ramaḍān': 'Ramadan',
            'Shawwāl': 'Shawwal',
            'Dhū al-Qaʿdah': 'Dhu al-Qi\'dah',
            'Dhū al-Ḥijjah': 'Dhu al-Hijjah'
        }
        
        # Normalize the month name
        normalized_month = month_name_map.get(hijri['month'], hijri['month'])
        if normalized_month is None:
            normalized_month = 'Muharram'  # Fallback
        
        # Find current month index
        try:
            current_month_index = hijri_months.index(normalized_month)
        except ValueError:
            # Fallback: try to find partial match
            current_month_index = 0
            for idx, month in enumerate(hijri_months):
                if month.lower() in normalized_month.lower() or normalized_month.lower() in month.lower():
                    current_month_index = idx
                    break
        
        adjusted_hijri_day = int(hijri['day']) + hijri_day_adjustment
        adjusted_hijri_month_index = current_month_index
        adjusted_hijri_year = int(hijri['year'])
        
        # Handle day overflow/underflow with proper month transitions
        while adjusted_hijri_day < 1:
            # Go to previous month
            adjusted_hijri_month_index -= 1
            if adjusted_hijri_month_index < 0:
                adjusted_hijri_month_index = 11
                adjusted_hijri_year -= 1
            adjusted_hijri_day += 30  # Approximate month length
        
        while adjusted_hijri_day > 30:
            # Go to next month
            adjusted_hijri_day -= 30
            adjusted_hijri_month_index += 1
            if adjusted_hijri_month_index > 11:
                adjusted_hijri_month_index = 0
                adjusted_hijri_year += 1
        
        adjusted_hijri_month = hijri_months[adjusted_hijri_month_index]
        
        # Create prayer objects with adjustments
        prayers = []
        for prayer_name, start_time in prayer_times.items():
            # Find adjustments for this prayer
            start_adjustment = 0
            end_adjustment = 0
            for adj in adjustments:
                if adj["prayer_name"] == prayer_name:
                    # Support both old and new format
                    start_adjustment = adj.get("start_adjustment", adj.get("adjustment", 0))
                    end_adjustment = adj.get("end_adjustment", 0)
                    break
            
            # Apply start time adjustment
            start_time_obj = datetime.strptime(start_time, '%H:%M')
            start_total_minutes = start_time_obj.hour * 60 + start_time_obj.minute + start_adjustment
            
            # Handle overflow/underflow
            start_total_minutes = max(0, min(start_total_minutes, 24 * 60 - 1))
            
            adjusted_start_hour = start_total_minutes // 60
            adjusted_start_minute = start_total_minutes % 60
            adjusted_start_str = f"{adjusted_start_hour:02d}:{adjusted_start_minute:02d}"
            
            # Apply end time adjustment
            end_time_obj = datetime.strptime(end_times[prayer_name], '%H:%M')
            end_total_minutes = end_time_obj.hour * 60 + end_time_obj.minute + end_adjustment
            
            # Handle overflow/underflow
            end_total_minutes = max(0, min(end_total_minutes, 24 * 60 - 1))
            
            adjusted_end_hour = end_total_minutes // 60
            adjusted_end_minute = end_total_minutes % 60
            adjusted_end_str = f"{adjusted_end_hour:02d}:{adjusted_end_minute:02d}"
            
            # Format to 12h no AM/PM
            formatted_start = format_time_12h_no_ampm(adjusted_start_str)
            formatted_end = format_time_12h_no_ampm(adjusted_end_str)
            
            prayers.append(PrayerTime(
                name=prayer_name,
                start_time=formatted_start,
                end_time=formatted_end,
                start_adjustment=start_adjustment,
                end_adjustment=end_adjustment,
                adjustment=start_adjustment  # For backward compatibility
            ))
        
        return PrayerTimings(
            date=date,
            hijri_date=f"{adjusted_hijri_day}",
            hijri_month=adjusted_hijri_month,
            hijri_year=str(adjusted_hijri_year),
            prayers=prayers
        )
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/adjust-prayers/{date}")
async def adjust_prayer_times(date: str, adjustments: ManualAdjustments):
    """Save manual adjustments for prayer times"""
    try:
        adjustment_data = {
            "date": date,
            "adjustments": [adj.dict() for adj in adjustments.adjustments],
            "updated_at": datetime.now(timezone.utc)
        }
        
        # Update or insert adjustments
        await db.adjustments.update_one(
            {"date": date},
            {"$set": adjustment_data},
            upsert=True
        )
        
        return {"message": "Adjustments saved successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/adjustments/{date}")
async def get_adjustments(date: str):
    """Get saved adjustments for a date"""
    try:
        adjustments = await db.adjustments.find_one({"date": date})
        return adjustments.get("adjustments", []) if adjustments else []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/adjust-hijri/{date}")
async def adjust_hijri_date(date: str, hijri_adjustment: HijriAdjustment):
    """Save Hijri date adjustment for a specific date"""
    try:
        adjustment_data = {
            "date": date,
            "day_adjustment": hijri_adjustment.day_adjustment,
            "updated_at": datetime.now(timezone.utc)
        }
        
        await db.hijri_adjustments.update_one(
            {"date": date},
            {"$set": adjustment_data},
            upsert=True
        )
        
        return {"message": "Hijri adjustment saved successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/hijri-adjustment/{date}")
async def get_hijri_adjustment(date: str):
    """Get saved Hijri date adjustment"""
    try:
        adjustment = await db.hijri_adjustments.find_one({"date": date})
        if adjustment:
            return {"day_adjustment": adjustment.get("day_adjustment", 0)}
        return {"day_adjustment": 0}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()