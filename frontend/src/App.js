import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import html2canvas from "html2canvas";
import { Calendar, Clock, Settings, MapPin, Bell, BellOff, Moon, Sun, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [adjustments, setAdjustments] = useState({});
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [hijriAdjustment, setHijriAdjustment] = useState(0);
  const [isHijriAdjustmentOpen, setIsHijriAdjustmentOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const shareCardRef = useRef(null);
  const [notificationSettings, setNotificationSettings] = useState({
    beforeMinutes: 5,
    atPrayerTime: true,
    beforePrayerTime: true,
    sound: true
  });

  // Format current date as DD-MMM-YYYY
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Initialize current date
  useEffect(() => {
    const today = new Date();
    setCurrentDate(formatDate(today));
  }, []);

  // Update current time every second and check for notifications
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      checkForNotifications(now);
    }, 1000);
    return () => clearInterval(timer);
  }, [prayerTimes, notificationsEnabled, notificationSettings]);

  // Check notification permission on load
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // Load notification settings from localStorage
      const savedSettings = localStorage.getItem('namazNotificationSettings');
      if (savedSettings) {
        setNotificationSettings(JSON.parse(savedSettings));
      }
      
      const savedEnabled = localStorage.getItem('namazNotificationsEnabled');
      if (savedEnabled === 'true') {
        setNotificationsEnabled(true); // Allow UI state regardless of permission
      }
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('namazDarkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('namazDarkMode', newDarkMode.toString());
  };

  // Share as Image
  const shareAsImage = async () => {
    if (!shareCardRef.current || !prayerTimes) return;

    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: darkMode ? '#0f172a' : '#047857',
        scale: 2,
        logging: false,
        useCORS: true
      });

      canvas.toBlob(async (blob) => {
        const file = new File([blob], `namaz-times-${currentDate}.png`, { type: 'image/png' });

        // Check if Web Share API is available
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Namaz Timings - Hyderabad',
              text: `Prayer times for ${currentDate}`,
              files: [file]
            });
          } catch (err) {
            if (err.name !== 'AbortError') {
              // Fallback: download the image
              downloadImage(canvas);
            }
          }
        } else {
          // Fallback: download the image
          downloadImage(canvas);
        }
      });
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating share image. Please try again.');
    }
  };

  const downloadImage = (canvas) => {
    const link = document.createElement('a');
    link.download = `namaz-times-${currentDate}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Fetch prayer times when date changes
  useEffect(() => {
    if (currentDate) {
      fetchPrayerTimes(currentDate);
    }
  }, [currentDate]);

  const fetchPrayerTimes = async (date) => {
    setLoading(true);
    try {
      // Set a longer timeout for Render free tier cold starts (60 seconds)
      const response = await axios.get(`${API}/prayer-times/${date}`, {
        timeout: 60000 // 60 seconds
      });
      setPrayerTimes(response.data);
      
      // Initialize prayer adjustments
      const initialAdjustments = {};
      response.data.prayers.forEach(prayer => {
        initialAdjustments[prayer.name] = prayer.adjustment;
      });
      setAdjustments(initialAdjustments);
      
      // Fetch Hijri adjustment
      const hijriResponse = await axios.get(`${API}/hijri-adjustment/${date}`, {
        timeout: 60000
      });
      setHijriAdjustment(hijriResponse.data.day_adjustment || 0);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
      alert('Unable to load prayer times. The server may be waking up. Please wait 30 seconds and refresh the page.');
    }
    setLoading(false);
  };

  const saveAdjustments = async () => {
    try {
      const adjustmentList = Object.keys(adjustments).map(prayerName => ({
        prayer_name: prayerName,
        adjustment: adjustments[prayerName]
      }));

      await axios.post(`${API}/adjust-prayers/${currentDate}`, {
        adjustments: adjustmentList
      });

      // Refresh prayer times
      await fetchPrayerTimes(currentDate);
      setIsAdjustmentOpen(false);
    } catch (error) {
      console.error('Error saving adjustments:', error);
    }
  };

  const saveHijriAdjustment = async () => {
    try {
      await axios.post(`${API}/adjust-hijri/${currentDate}`, {
        day_adjustment: hijriAdjustment
      });

      // Refresh prayer times to show updated Hijri date
      await fetchPrayerTimes(currentDate);
      setIsHijriAdjustmentOpen(false);
    } catch (error) {
      console.error('Error saving Hijri adjustment:', error);
    }
  };

  const getCurrentPrayer = () => {
    if (!prayerTimes) return null;
    
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    
    // Convert prayer times to minutes for comparison
    const prayerTimesInMinutes = prayerTimes.prayers.map(prayer => {
      const [hours, minutes] = prayer.start_time.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes;
      
      // Handle time wrapping (assuming times are in 24h format from backend)
      // If hour is less than 12 and it's after noon, it might be PM time
      // But since backend gives us proper 24h times, we don't need conversion
      
      return {
        ...prayer,
        totalMinutes: totalMinutes
      };
    });
    
    // Find which prayer time window we're in
    for (let i = 0; i < prayerTimesInMinutes.length; i++) {
      const currentPrayerTime = prayerTimesInMinutes[i];
      const nextPrayerTime = prayerTimesInMinutes[i + 1];
      
      // If current time is after this prayer's start
      if (currentTotalMinutes >= currentPrayerTime.totalMinutes) {
        // And before the next prayer (or it's the last prayer)
        if (!nextPrayerTime || currentTotalMinutes < nextPrayerTime.totalMinutes) {
          return currentPrayerTime;
        }
      }
    }
    
    // If we're before Fajr, show Isha as current (night time)
    return prayerTimesInMinutes[prayerTimesInMinutes.length - 1];
  };

  const convertTo24h = (time12h) => {
    // Times are already in 24h format from backend, just return as is
    return time12h;
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    }
    return false;
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(true); // Enable UI state regardless of permission
      localStorage.setItem('namazNotificationsEnabled', 'true');
      
      if (!granted) {
        // Update permission state for UI feedback
        setNotificationPermission('denied');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('namazNotificationsEnabled', 'false');
    }
  };

  const saveNotificationSettings = () => {
    localStorage.setItem('namazNotificationSettings', JSON.stringify(notificationSettings));
    setIsNotificationSettingsOpen(false);
  };

  const sendNotification = (title, body, icon = '🕌') => {
    if (notificationsEnabled && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'namaz-prayer',
        requireInteraction: true
      });

      // Play sound if enabled (simple beep)
      if (notificationSettings.sound) {
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+P2v1oZA');
          audio.volume = 0.3;
          audio.play().catch(() => {}); // Ignore errors
        } catch (e) {
          // Ignore audio errors
        }
      }

      // Auto close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    }
  };

  const checkForNotifications = (currentTime) => {
    if (!prayerTimes || !notificationsEnabled) return;

    const now = currentTime;
    const currentTimeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentSeconds = now.getSeconds();

    // Only check at the start of each minute to avoid spam
    if (currentSeconds !== 0) return;

    prayerTimes.prayers.forEach(prayer => {
      const prayerTimeStr = convertTo24h(prayer.start_time);
      const [prayerHour, prayerMinute] = prayerTimeStr.split(':').map(Number);

      // Check for exact prayer time notification
      if (notificationSettings.atPrayerTime && 
          now.getHours() === prayerHour && 
          now.getMinutes() === prayerMinute) {
        sendNotification(
          `🕌 ${prayer.name} Prayer Time`,
          `It's time for ${prayer.name} prayer. May Allah accept your prayers.`
        );
      }

      // Check for before prayer time notification
      if (notificationSettings.beforePrayerTime) {
        const beforeTime = new Date();
        beforeTime.setHours(prayerHour, prayerMinute - notificationSettings.beforeMinutes, 0, 0);
        
        if (now.getHours() === beforeTime.getHours() && 
            now.getMinutes() === beforeTime.getMinutes()) {
          sendNotification(
            `⏰ ${prayer.name} Prayer Reminder`,
            `${prayer.name} prayer starts in ${notificationSettings.beforeMinutes} minutes (${prayer.start_time})`
          );
        }
      }
    });
  };

  const navigateDate = (direction) => {
    const currentDateObj = new Date();
    const [day, month, year] = currentDate.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = months.indexOf(month);
    
    const targetDate = new Date(parseInt(year), monthIndex, parseInt(day));
    targetDate.setDate(targetDate.getDate() + direction);
    
    setCurrentDate(formatDate(targetDate));
  };

  const currentPrayer = getCurrentPrayer();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 relative">
          {/* Dark Mode Toggle - Top Right */}
          <div className="absolute top-0 right-0">
            <Button
              onClick={toggleDarkMode}
              variant="outline"
              size="icon"
              className={`rounded-full ${
                darkMode 
                  ? 'border-emerald-400 text-emerald-400 hover:bg-emerald-950' 
                  : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>

          <h1 className={`text-4xl font-bold mb-2 font-serif ${
            darkMode ? 'text-emerald-300' : 'text-emerald-900'
          }`}>
            نماز کا وقت
          </h1>
          <h2 className={`text-3xl font-bold mb-4 ${
            darkMode ? 'text-emerald-200' : 'text-emerald-800'
          }`}>
            Namaz Timings
          </h2>
          <div className={`flex items-center justify-center gap-2 ${
            darkMode ? 'text-emerald-300' : 'text-emerald-700'
          }`}>
            <MapPin className="w-5 h-5" />
            <span className="text-lg font-medium">Hyderabad, India • Hanafi Maslak</span>
          </div>
        </div>

        {/* Current Time & Date */}
        <Card className={`mb-6 border transition-colors ${
          darkMode 
            ? 'bg-slate-800/70 backdrop-blur-sm border-emerald-700' 
            : 'bg-white/70 backdrop-blur-sm border-emerald-200'
        }`}>
          <CardContent className="p-6">
            <div className="text-center">
              <div className={`text-3xl font-mono font-bold mb-2 ${
                darkMode ? 'text-emerald-300' : 'text-emerald-800'
              }`}>
                {currentTime.toLocaleTimeString('en-US', { 
                  hour12: false, 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              
              {/* Date Navigation */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateDate(-1)}
                  className={darkMode 
                    ? 'border-emerald-500 text-emerald-300 hover:bg-emerald-900' 
                    : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                  }
                >
                  ← Previous
                </Button>
                <div className="text-center">
                  <div className={`text-xl font-semibold ${
                    darkMode ? 'text-emerald-200' : 'text-emerald-900'
                  }`}>
                    {currentDate}
                  </div>
                  {prayerTimes && (
                    <div className={darkMode ? 'text-emerald-400' : 'text-emerald-700'}>
                      {prayerTimes.hijri_date} {prayerTimes.hijri_month} {prayerTimes.hijri_year} AH
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateDate(1)}
                  className={darkMode 
                    ? 'border-emerald-500 text-emerald-300 hover:bg-emerald-900' 
                    : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                  }
                >
                  Next →
                </Button>
              </div>

              {/* Current Prayer Indicator */}
              {currentPrayer && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  darkMode ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    Current: {currentPrayer.name}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Prayer Times */}
        {loading ? (
          <Card className={`transition-colors ${
            darkMode ? 'bg-slate-800/70 backdrop-blur-sm border-emerald-700' : 'bg-white/70 backdrop-blur-sm'
          }`}>
            <CardContent className="p-8 text-center">
              <div className={darkMode ? 'text-emerald-300' : 'text-emerald-700'}>
                <div className="mb-3">Loading prayer times...</div>
                <div className="text-sm opacity-75">
                  ⏱️ First load may take up to 60 seconds (server waking up)
                </div>
              </div>
            </CardContent>
          </Card>
        ) : prayerTimes ? (
          <div className="space-y-4">
            {prayerTimes.prayers.map((prayer, index) => (
              <Card 
                key={prayer.id}
                className={`transition-all hover:shadow-lg border ${
                  currentPrayer?.name === prayer.name 
                    ? darkMode 
                      ? 'ring-2 ring-emerald-500 bg-emerald-900/50 border-emerald-600' 
                      : 'ring-2 ring-emerald-300 bg-emerald-50/80 border-emerald-200'
                    : darkMode
                      ? 'bg-slate-800/80 backdrop-blur-sm border-emerald-800/50 hover:border-emerald-700'
                      : 'bg-white/80 backdrop-blur-sm border-emerald-200'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        darkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'
                      }`}>
                        <span className={`font-bold text-lg ${
                          darkMode ? 'text-emerald-300' : 'text-emerald-700'
                        }`}>{index + 1}</span>
                      </div>
                      <div>
                        <h3 className={`text-xl font-semibold ${
                          darkMode ? 'text-emerald-200' : 'text-emerald-900'
                        }`}>
                          {prayer.name}
                        </h3>
                        <div className="text-sm">
                          {prayer.adjustment !== 0 && (
                            <span className={darkMode ? 'text-amber-400' : 'text-amber-600'}>
                              Adjusted {prayer.adjustment > 0 ? '+' : ''}{prayer.adjustment} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-mono font-bold ${
                        darkMode ? 'text-emerald-300' : 'text-emerald-800'
                      }`}>
                        {prayer.start_time}
                      </div>
                      <div className={`text-2xl font-mono font-bold mt-1 ${
                        darkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        {prayer.end_time}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className={`transition-colors ${
            darkMode ? 'bg-slate-800/70 backdrop-blur-sm border-emerald-700' : 'bg-white/70 backdrop-blur-sm'
          }`}>
            <CardContent className="p-8 text-center">
              <div className={darkMode ? 'text-emerald-300' : 'text-emerald-700'}>
                No prayer times available
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hidden Share Card - for generating image */}
        <div ref={shareCardRef} className="fixed -left-[9999px] w-[720px] h-auto">
          {prayerTimes && (
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 p-8 rounded-lg">
              {/* Header */}
              <div className="text-center mb-6">
                <h1 className="text-4xl font-bold text-white mb-3">
                  🕌 Namaz Timings Hyderabad, India
                </h1>
                <div className="text-2xl text-emerald-300 font-semibold mb-2">
                  {prayerTimes.hijri_date} {prayerTimes.hijri_month} {prayerTimes.hijri_year} AH
                </div>
                <div className="text-xl text-white">
                  {new Date(currentDate.split('-').reverse().join('-')).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              {/* Prayer Times Table */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border-2 border-white/20">
                <div className="grid grid-cols-4 gap-0">
                  {/* Table Header */}
                  <div className="bg-blue-800 p-6 min-h-[80px] flex items-center justify-center border-r border-white/20">
                    <div className="text-2xl font-bold text-white">Name</div>
                  </div>
                  <div className="bg-blue-800 p-6 min-h-[80px] flex items-center justify-center border-r border-white/20">
                    <div className="text-2xl font-bold text-white">Start</div>
                  </div>
                  <div className="bg-blue-800 p-6 min-h-[80px] flex items-center justify-center border-r border-white/20">
                    <div className="text-2xl font-bold text-white">End</div>
                  </div>
                  <div className="bg-blue-800 p-6 min-h-[80px] flex items-center justify-center">
                    <div className="text-2xl font-bold text-white">نماز</div>
                  </div>

                  {/* Prayer Rows */}
                  {prayerTimes.prayers.map((prayer, index) => {
                    const arabicNames = {
                      'Fajr': 'فجر',
                      'Dhuhr': 'ظهر',
                      'Asr': 'عصر',
                      'Maghrib': 'مغرب',
                      'Isha': 'عشاء'
                    };

                    return (
                      <React.Fragment key={prayer.id}>
                        <div className={`p-6 min-h-[90px] flex items-center justify-center border-r border-white/20 ${
                          index < prayerTimes.prayers.length - 1 ? 'border-b border-white/20' : ''
                        }`}>
                          <div className="text-2xl font-bold text-white">{prayer.name}</div>
                        </div>
                        <div className={`p-6 min-h-[90px] flex items-center justify-center border-r border-white/20 ${
                          index < prayerTimes.prayers.length - 1 ? 'border-b border-white/20' : ''
                        }`}>
                          <div className="text-3xl font-mono font-bold text-emerald-300">
                            {prayer.start_time}
                          </div>
                        </div>
                        <div className={`p-6 min-h-[90px] flex items-center justify-center border-r border-white/20 ${
                          index < prayerTimes.prayers.length - 1 ? 'border-b border-white/20' : ''
                        }`}>
                          <div className="text-3xl font-mono font-bold text-emerald-300">
                            {prayer.end_time}
                          </div>
                        </div>
                        <div className={`p-6 min-h-[90px] flex items-center justify-center ${
                          index < prayerTimes.prayers.length - 1 ? 'border-b border-white/20' : ''
                        }`}>
                          <div className="text-3xl font-bold text-white">
                            {arabicNames[prayer.name]}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-2xl text-white font-semibold">
                  May Allah Accept Our Prayers
                </p>
                <p className="text-3xl text-emerald-300 font-bold mt-2">
                  الله أكبر • Allahu Akbar!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
          {/* Share Button */}
          <Button
            onClick={shareAsImage}
            className={`px-6 py-3 rounded-full transition-colors ${
              darkMode 
                ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share as Image
          </Button>

          {/* Notifications Toggle */}
          <div className={`flex items-center gap-3 rounded-full px-6 py-3 border transition-colors ${
            darkMode 
              ? 'bg-slate-800/70 backdrop-blur-sm border-emerald-700' 
              : 'bg-white/70 backdrop-blur-sm border-emerald-200'
          }`}>
            {notificationsEnabled ? (
              <Bell className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            ) : (
              <BellOff className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`} />
            )}
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={toggleNotifications}
            />
            <span className={`font-medium ${darkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
              {notificationsEnabled ? 'Notifications ON' : 'Notifications OFF'}
            </span>
          </div>

          {/* Notification Settings */}
          {notificationsEnabled && (
            <Dialog open={isNotificationSettingsOpen} onOpenChange={setIsNotificationSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                  <Settings className="w-4 h-4 mr-2" />
                  Notification Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-emerald-900">Notification Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-emerald-800">At Prayer Time</Label>
                    <Switch
                      checked={notificationSettings.atPrayerTime}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, atPrayerTime: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-emerald-800">Before Prayer Time</Label>
                    <Switch
                      checked={notificationSettings.beforePrayerTime}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, beforePrayerTime: checked})
                      }
                    />
                  </div>

                  {notificationSettings.beforePrayerTime && (
                    <div className="space-y-2">
                      <Label className="text-emerald-800">Remind me before (minutes)</Label>
                      <Select
                        value={String(notificationSettings.beforeMinutes)}
                        onValueChange={(value) => 
                          setNotificationSettings({...notificationSettings, beforeMinutes: parseInt(value)})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 minute</SelectItem>
                          <SelectItem value="3">3 minutes</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label className="text-emerald-800">Sound</Label>
                    <Switch
                      checked={notificationSettings.sound}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, sound: checked})
                      }
                    />
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button 
                      onClick={saveNotificationSettings}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      Save Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsNotificationSettingsOpen(false)}
                      className="flex-1 border-emerald-300 text-emerald-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Manual Adjustments */}
          <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
            <DialogTrigger asChild>
              <Button className={`px-6 py-3 rounded-full transition-colors ${
                darkMode 
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}>
                <Settings className="w-5 h-5 mr-2" />
                Adjust Prayer Times
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-emerald-900">Adjust Prayer Times</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {prayerTimes?.prayers.map(prayer => (
                  <div key={prayer.name} className="flex items-center justify-between">
                    <label className="text-emerald-800 font-medium">{prayer.name}</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={adjustments[prayer.name] || 0}
                        onChange={(e) => setAdjustments({
                          ...adjustments,
                          [prayer.name]: parseInt(e.target.value) || 0
                        })}
                        className="w-20 text-center"
                        placeholder="0"
                      />
                      <span className="text-sm text-emerald-600">min</span>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-6">
                  <Button 
                    onClick={saveAdjustments}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsAdjustmentOpen(false)}
                    className="flex-1 border-emerald-300 text-emerald-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Hijri Date Adjustment */}
          <Dialog open={isHijriAdjustmentOpen} onOpenChange={setIsHijriAdjustmentOpen}>
            <DialogTrigger asChild>
              <Button className={`px-6 py-3 rounded-full transition-colors ${
                darkMode 
                  ? 'bg-teal-700 hover:bg-teal-600 text-white' 
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}>
                <Calendar className="w-5 h-5 mr-2" />
                Adjust Hijri Date
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-emerald-900">Adjust Hijri Date</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm text-emerald-700 mb-2">
                    Current Hijri Date:
                  </p>
                  <p className="text-lg font-semibold text-emerald-900">
                    {prayerTimes?.hijri_date} {prayerTimes?.hijri_month} {prayerTimes?.hijri_year} AH
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-emerald-800">Adjust by days (+ or -)</Label>
                  <p className="text-xs text-emerald-600 mb-2">
                    Increase or decrease the Hijri date to match your local mosque calendar
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setHijriAdjustment(prev => prev - 1)}
                      className="border-emerald-300 text-emerald-700"
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={hijriAdjustment}
                      onChange={(e) => setHijriAdjustment(parseInt(e.target.value) || 0)}
                      className="w-24 text-center text-lg font-semibold"
                      placeholder="0"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setHijriAdjustment(prev => prev + 1)}
                      className="border-emerald-300 text-emerald-700"
                    >
                      +
                    </Button>
                    <span className="text-sm text-emerald-600 whitespace-nowrap">days</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button 
                    onClick={saveHijriAdjustment}
                    className="flex-1 bg-teal-600 hover:bg-teal-700"
                  >
                    Save Hijri Adjustment
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsHijriAdjustmentOpen(false)}
                    className="flex-1 border-emerald-300 text-emerald-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Footer */}
        <div className={`text-center mt-12 text-sm space-y-2 transition-colors ${
          darkMode ? 'text-emerald-400' : 'text-emerald-600'
        }`}>
          <p>May Allah accept your prayers • جَزَاكَ ٱللَّٰهُ خَيْرًا</p>
          {notificationsEnabled && notificationPermission === 'denied' && (
            <p className={`text-xs ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              🔔 Enable notifications in your browser settings to receive prayer reminders
            </p>
          )}
          {notificationsEnabled && notificationPermission === 'granted' && (
            <p className={`text-xs ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              ✅ Prayer notifications are active • الله أكبر
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;