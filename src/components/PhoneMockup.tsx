import React, { useState, useEffect, useRef, Dispatch, SetStateAction, ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cloud, 
  Sun, 
  Battery, 
  Wifi, 
  Signal, 
  Search, 
  Navigation, 
  Map, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Compass, 
  Droplets, 
  Wind, 
  ChevronRight, 
  Smartphone, 
  Moon, 
  Bell, 
  ChevronLeft, 
  Settings, 
  Zap, 
  Power,
  RefreshCw,
  Sliders,
  Sparkles,
  Volume2,
  Trash2
} from "lucide-react";
import { WeatherData, BatteryMode, WallpaperMode, SystemNotification, WidgetTheme } from "../types";
import { WeatherIcon3D } from "./WeatherIcon3D";
import { LiveWallpaper } from "./LiveWallpaper";

// Helper to resolve Weather Codes
export function getWeatherDesc(code: number): string {
  switch (code) {
    case 0: return "Clear Sky";
    case 1: return "Mainly Clear";
    case 2: return "Partly Cloudy";
    case 3: return "Overcast";
    case 45: return "Fog";
    case 48: return "Depositing Rime Fog";
    case 51: return "Light Drizzle";
    case 53: return "Moderate Drizzle";
    case 55: return "Dense Drizzle";
    case 61: return "Slight Rain";
    case 63: return "Moderate Rain";
    case 65: return "Heavy Rain";
    case 71: return "Slight Snowfall";
    case 73: return "Moderate Snowfall";
    case 75: return "Heavy Snowfall";
    case 80: return "Slight Rain Showers";
    case 81: return "Moderate Rain Showers";
    case 82: return "Violent Rain Showers";
    case 95: return "Thunderstorm";
    case 96: return "Thunderstorm with Hail";
    case 99: return "Severe Thunderstorm";
    default: return "Partly Cloudy";
  }
}

interface PhoneMockupProps {
  weather: WeatherData | null;
  loading: boolean;
  batteryMode: BatteryMode;
  setBatteryMode: (mode: BatteryMode) => void;
  wallpaperMode: WallpaperMode;
  setWallpaperMode: (mode: WallpaperMode) => void;
  widgetTheme: WidgetTheme;
  setWidgetTheme: (theme: WidgetTheme) => void;
  notifications: SystemNotification[];
  setNotifications: Dispatch<SetStateAction<SystemNotification[]>>;
  addNotification: (title: string, message: string, level: "info" | "warning" | "critical") => void;
  requestGPSUpdate: () => void;
  onSearchCity: (query: string) => Promise<void>;
  suggestions: Array<{name: string, country?: string, latitude: number, longitude: number}>;
  onSelectSuggestion: (s: any) => void;
}

export function PhoneMockup({
  weather,
  loading,
  batteryMode,
  setBatteryMode,
  wallpaperMode,
  setWallpaperMode,
  widgetTheme,
  setWidgetTheme,
  notifications,
  setNotifications,
  addNotification,
  requestGPSUpdate,
  onSearchCity,
  suggestions,
  onSelectSuggestion,
}: PhoneMockupProps) {
  // Mobile UI navigational states: "lock", "home", "app"
  const [screen, setScreen] = useState<"lock" | "home" | "app">("app");
  
  // App internal navigation states: "forecast" | "radar" | "battery" | "alerts"
  const [appTab, setAppTab] = useState<"forecast" | "radar" | "battery" | "alerts">("forecast");
  
  // Custom states
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(78);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [incomingNotification, setIncomingNotification] = useState<SystemNotification | null>(null);

  // Simulated power telemetry values
  const [telemetry, setTelemetry] = useState({
    gpsFrequency: "Every 15s",
    networkBytes: "45 KB/hr",
    cpuUsage: 12,
    batteryTemp: "31°C",
    drainRate: "1.2%/hr"
  });

  // Calculate dynamic hour of selected timezone or local
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync battery health simulation to BatteryMode settings
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    switch (batteryMode) {
      case "ultra":
        setTelemetry({
          gpsFrequency: "Real-time (5s)",
          networkBytes: "280 KB/hr",
          cpuUsage: 24,
          batteryTemp: "38°C",
          drainRate: "4.8%/hr"
        });
        // Slowly discharges simulated battery faster
        interval = setInterval(() => {
          setBatteryLevel((prev) => Math.max(prev - 1, 15));
        }, 12000);
        break;
      case "balanced":
        setTelemetry({
          gpsFrequency: "Cell Tower (15m)",
          networkBytes: "92 KB/hr",
          cpuUsage: 11,
          batteryTemp: "33°C",
          drainRate: "2.1%/hr"
        });
        interval = setInterval(() => {
          setBatteryLevel((prev) => Math.max(prev - 1, 15));
        }, 32000);
        break;
      case "saver":
        setTelemetry({
          gpsFrequency: "Standard Coarse",
          networkBytes: "28 KB/hr",
          cpuUsage: 5,
          batteryTemp: "29°C",
          drainRate: "0.9%/hr"
        });
        interval = setInterval(() => {
          setBatteryLevel((prev) => Math.max(prev - 1, 15));
        }, 75000);
        break;
      case "extreme":
        setTelemetry({
          gpsFrequency: "Cached Location Only",
          networkBytes: "4 KB/hr",
          cpuUsage: 1.8,
          batteryTemp: "26°C",
          drainRate: "0.2%/hr"
        });
        interval = setInterval(() => {
          setBatteryLevel((prev) => Math.max(prev - 1, 15));
        }, 200000);
        break;
    }
    return () => clearInterval(interval);
  }, [batteryMode]);

  // Hook alerts list updates to throw sliding system popups inside the phone layout
  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length > 0) {
      const newest = unread[unread.length - 1];
      setIncomingNotification(newest);
      const timer = setTimeout(() => {
        setIncomingNotification(null);
        // Mark as read after popping up
        setNotifications(prev => prev.map(n => n.id === newest.id ? { ...n, isRead: true } : n));
      }, 55000); // lingers 5s
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  // Dismiss native overlay on tap
  const handleBannerTap = () => {
    if (incomingNotification) {
      setScreen("app");
      setAppTab("alerts");
      setIncomingNotification(null);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  // Handle autocomplete query
  const handleSearchChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    if (val.trim().length > 1) {
      setIsSearching(true);
      await onSearchCity(val);
      setIsSearching(false);
    }
  };

  // Weather variables
  const isNightTime = weather ? (new Date(weather.current.time).getHours() >= 19 || new Date(weather.current.time).getHours() < 6) : false;
  const currentTemp = weather ? Math.round(weather.current.temperature) : 72;
  const weatherCode = weather ? weather.current.weatherCode : 0;
  const conditionsText = weather ? getWeatherDesc(weatherCode) : "Partly Cloudy";

  // Widget aesthetic values dictionary
  const getWidgetThemeClasses = () => {
    switch (widgetTheme) {
      case "glass":
        return "bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-lg";
      case "dark":
        return "bg-slate-900 border border-slate-800 text-slate-100 shadow-xl";
      case "light":
        return "bg-white/95 text-slate-900 border border-slate-100 shadow-md";
      case "amoled":
        return "bg-black border border-neutral-900 text-white shadow-none";
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* 1. PHYSICAL SMARTPHONE CHASSIS */}
      <div 
        id="smartphone-body"
        className="relative w-[370px] h-[760px] bg-slate-950 rounded-[48px] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border-4 border-slate-800 flex flex-col overflow-hidden ring-12 ring-slate-900 ring-offset-4 ring-offset-slate-950 transition-all duration-300"
      >
        {/* Dynamic Live Wallpapers rendering under all content */}
        <LiveWallpaper 
          mode={batteryMode === "extreme" ? "sunny" : wallpaperMode} 
          weatherCode={weatherCode}
          batteryMode={batteryMode}
          isNight={isNightTime}
        />

        {/* GLARE REFLECTION OVERLAY */}
        <div className="absolute top-0 -left-1/2 w-full h-[150%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-30 pointer-events-none z-40" />

        {/* SPEAKER & CAMERA NOTCH */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[140px] h-[28px] bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center gap-1.5 shadow-md">
          <div className="w-12 h-1 bg-neutral-800 rounded-full" />
          <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full border border-neutral-800 flex items-center justify-center">
            <div className="w-1 h-1 bg-[#1a4b8c] rounded-full" />
          </div>
        </div>

        {/* 2. ADAPTIVE STATUS BAR */}
        <div className="h-6 w-full flex items-center justify-between px-5 text-white text-[12px] font-medium z-40 pt-1">
          <span>{formattedTime}</span>
          <div className="flex items-center gap-1.5">
            <Signal size={12} className="text-white" />
            <Wifi size={12} className="text-white" />
            <div className="flex items-center gap-1 bg-white/10 rounded px-1 py-0.5">
              <span className="text-[10px] leading-none">{batteryLevel}%</span>
              <Battery 
                size={13} 
                className={`${batteryLevel < 20 ? 'text-red-500 fill-red-500' : 'text-emerald-400 fill-emerald-400'} transition-colors duration-300`} 
              />
            </div>
          </div>
        </div>

        {/* 3. HARDWARE NOTIFICATION BANNER OVERLAY */}
        <AnimatePresence>
          {incomingNotification && (
            <motion.div
              id="active-push-notification"
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-8 left-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-3 shadow-2xl z-50 cursor-pointer flex items-start gap-2.5"
              onClick={handleBannerTap}
            >
              <div className={`p-1.5 rounded-lg ${
                incomingNotification.level === "critical" ? "bg-red-500/20 text-red-400" :
                incomingNotification.level === "warning" ? "bg-amber-500/20 text-amber-400" :
                "bg-blue-500/20 text-blue-400"
              }`}>
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-bold tracking-tight uppercase">WEATHER ALERT</span>
                  <span className="text-[10px] text-neutral-500">Just now</span>
                </div>
                <h4 className="text-xs font-semibold text-white truncate mt-0.5">{incomingNotification.title}</h4>
                <p className="text-[11px] text-neutral-300 line-clamp-2 mt-0.5">{incomingNotification.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. MAIN SCREEN ROUTER */}
        <div className="flex-1 relative flex flex-col z-30 pt-1 select-none overflow-hidden text-white leading-tight">
          
          {/* A. LOCK SCREEN STATE */}
          {screen === "lock" && (
            <motion.div 
              id="phone-lockscreen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-between px-4 pb-12 pt-10"
            >
              <div className="text-center">
                <p className="text-sm font-semibold text-white/80">{formattedDate}</p>
                <h1 className="text-5xl font-light tracking-tight mt-1 text-white">{formattedTime}</h1>
                
                {/* Simulated lock screen quick widget widget */}
                <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs">
                  <WeatherIcon3D code={weatherCode} size={20} isNight={isNightTime} />
                  <span>{weather ? `${currentTemp}°` : "--"} in {weather?.cityName || "San Francisco"}</span>
                </div>
              </div>

              {/* Simulated lock-screen helper tip */}
              <div className="flex flex-col items-center gap-3">
                <motion.div 
                  className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-lg active:scale-95"
                  onClick={() => setScreen("home")}
                >
                  <Smartphone size={24} className="text-white animate-pulse" />
                </motion.div>
                <p className="text-[11px] text-white/50 tracking-wider font-medium">TAP TO UNLOCK PHONE</p>
              </div>
            </motion.div>
          )}

          {/* B. HOME APPS GRID & WEATHER WIDGETS */}
          {screen === "home" && (
            <motion.div 
              id="phone-homescreen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col justify-between px-4 pb-6 pt-4"
            >
              {/* Home widgets grid container */}
              <div className="space-y-4">
                {/* 1. Medium Widget Preview (4x2 grid slot) */}
                <motion.div 
                  id="widget-medium-forecast"
                  whileHover={{ scale: 1.02 }}
                  className={`p-3.5 rounded-[24px] transition-all duration-300 flex flex-col justify-between h-[100px] cursor-pointer ${getWidgetThemeClasses()}`}
                  onClick={() => setScreen("app")}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold leading-none">{weather?.cityName || "San Francisco"}</h4>
                      <p className="text-[10px] opacity-70 mt-1 leading-none">{conditionsText}</p>
                    </div>
                    <WeatherIcon3D code={weatherCode} size={36} isNight={isNightTime} />
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-light">{weather ? `${currentTemp}°` : "--"}</span>
                    <span className="text-[10px] font-mono opacity-80">
                      H: {weather ? Math.round(weather.daily[0].tempMax) : 74}° 
                      L: {weather ? Math.round(weather.daily[0].tempMin) : 58}°
                    </span>
                  </div>
                </motion.div>

                {/* 2. Small 2x2 widgets side-by-side */}
                <div className="grid grid-cols-2 gap-4">
                  {/* A. Small Conditions Widget */}
                  <div 
                    id="widget-small-conditions"
                    className={`p-3 rounded-[20px] h-[100px] flex flex-col justify-between cursor-pointer ${getWidgetThemeClasses()}`}
                    onClick={() => setScreen("app")}
                  >
                    <div className="flex justify-between items-start">
                      <WeatherIcon3D code={weatherCode} size={28} isNight={isNightTime} />
                      <span className="text-lg font-bold">{currentTemp}°</span>
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold truncate">{weather?.cityName || "San Francisco"}</h5>
                      <span className="text-[9px] opacity-80 font-mono">Ppt: {weather ? weather.current.precipitation : 0}mm</span>
                    </div>
                  </div>

                  {/* B. Battery / Performance health Widget */}
                  <div className="p-3 bg-slate-900/40 backdrop-blur-md rounded-[20px] h-[100px] flex flex-col justify-between text-white border border-white/10">
                    <div className="flex justify-between items-center text-emerald-400">
                      <Zap size={14} className="animate-bounce" />
                      <span className="text-xs font-mono">{telemetry.drainRate}</span>
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold">Power: {batteryMode.toUpperCase()}</h5>
                      <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${batteryLevel < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${batteryLevel}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-neutral-400 font-mono">Temp: {telemetry.batteryTemp}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* bottom utility tray containing launchers */}
              <div className="flex items-center justify-around bg-white/10 backdrop-blur-xl py-3 px-2 rounded-[28px] border border-white/10">
                {/* Weather app application launch circle icon */}
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-tr from-sky-400 to-indigo-600 rounded-2xl flex items-center justify-center cursor-pointer shadow-lg relative group"
                  onClick={() => setScreen("app")}
                  whileTap={{ scale: 0.9 }}
                >
                  <Cloud size={24} className="text-white" />
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-[9px] text-white font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">!</span>
                </motion.div>

                {/* Mock systems */}
                <div onClick={() => setScreen("lock")} className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center cursor-pointer active:scale-90">
                  <Smartphone size={20} className="text-zinc-400" />
                </div>
                <div onClick={() => alert("Simulated Native Settings opened!")} className="w-12 h-12 bg-zinc-700/80 rounded-2xl flex items-center justify-center cursor-pointer active:scale-90">
                  <Settings size={20} className="text-zinc-300" />
                </div>
              </div>
            </motion.div>
          )}

          {/* C. COMPREHENSIVE IN-APP WEATHER SYSTEM */}
          {screen === "app" && (
            <motion.div 
              id="weather-applet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-1 flex flex-col justify-between"
            >
              {/* i. Weather app Header Area */}
              <div className="px-3 pt-2">
                <div className="flex items-center justify-between">
                  {/* Outer navigation controls to navigate launcher or Lockscreen */}
                  <button 
                    id="back-to-homescreen"
                    onClick={() => setScreen("home")}
                    className="p-1 px-2 rounded-lg bg-white/10 backdrop-blur-md flex items-center gap-1 hover:bg-white/20 text-xs transition h-7 text-neutral-300"
                  >
                    <ChevronLeft size={14} /> Home
                  </button>

                  {/* Status Indicator showing GPS lookup vs Manual */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-400 tracking-wider font-mono bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> GP: ACTIVE
                    </span>
                    <button 
                      onClick={requestGPSUpdate}
                      className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 transition"
                      title="Update via GPS Location"
                    >
                      <Navigation size={13} />
                    </button>
                  </div>
                </div>

                {/* ii. City search text box */}
                <div className="relative mt-2">
                  <div className="relative flex items-center bg-black/30 backdrop-blur-md rounded-xl border border-white/10 h-8 px-2.5">
                    <Search size={14} className="text-neutral-400 flex-shrink-0 mr-1.5" />
                    <input 
                      type="text" 
                      placeholder="Search general cities..." 
                      className="bg-transparent border-none text-xs text-white focus:outline-none focus:ring-0 w-full placeholder-neutral-500 placeholder:text-xs"
                      value={searchVal}
                      onChange={handleSearchChange}
                      onFocus={() => setSearchOpen(true)}
                    />
                    {searchVal && (
                      <button onClick={() => { setSearchVal(""); setSearchOpen(false); }} className="text-slate-400 hover:text-white px-1 font-bold">×</button>
                    )}
                  </div>

                  {/* Search Autocomplete Suggestions Overlay */}
                  {searchOpen && (suggestions.length > 0 || isSearching) && (
                    <div className="absolute top-10 left-0 right-0 bg-slate-900/95 border border-slate-700 rounded-xl max-h-[160px] overflow-y-auto shadow-2xl z-50 text-xs">
                      {isSearching ? (
                        <div className="p-3 text-center text-neutral-400 flex items-center justify-center gap-2">
                          <RefreshCw className="animate-spin" size={12} /> Finding locations...
                        </div>
                      ) : (
                        suggestions.map((s, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              onSelectSuggestion(s);
                              setSearchVal("");
                              setSearchOpen(false);
                            }}
                            className="p-2.5 hover:bg-white/10 cursor-pointer flex items-center justify-between border-b border-slate-800 last:border-0"
                          >
                            <span className="font-bold text-white">{s.name} <span className="text-[10px] text-neutral-400 font-normal">{s.country || "Region"}</span></span>
                            <span className="text-[10px] text-slate-500 font-mono font-light">
                              {s.latitude.toFixed(2)}N, {s.longitude.toFixed(2)}E
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* iii. TAB CONTENTS SCROLLER */}
              <div className="flex-1 overflow-y-auto px-3.5 mt-2 space-y-3 pb-2 select-none scrollbar-none">
                
                {/* FORECAST TAB PANELS */}
                {appTab === "forecast" && (
                  <>
                    {/* A. Hero Weather Stats Card */}
                    <div className="text-center py-2 relative">
                      <h2 className="text-xl font-bold tracking-tight text-white mb-0.5">{weather?.cityName || "San Francisco"}</h2>
                      <p className="text-[11px] text-neutral-300 font-semibold tracking-wider font-mono">{formattedDate}</p>
                      
                      {/* Floating large 3D graphic */}
                      <div className="flex justify-center my-1 select-none pointer-events-none">
                        <WeatherIcon3D code={weatherCode} size={110} isNight={isNightTime} className="filter drop-shadow-lg" />
                      </div>

                      <div className="inline-flex flex-col items-center">
                        <span className="text-5xl font-light text-white tracking-tighter leading-none pr-1 inline-block">{weather ? `${currentTemp}°` : "--"}</span>
                        <span className="text-[11px] text-emerald-300 font-bold bg-emerald-950/45 px-3 py-1 rounded-full mt-2 border border-emerald-500/20">{conditionsText}</span>
                      </div>

                      {/* Hi / Lo Range */}
                      <p className="text-xs text-neutral-200 mt-2 font-mono">
                        High max: {weather ? Math.round(weather.daily[0].tempMax) : 74}°  •  Low min: {weather ? Math.round(weather.daily[0].tempMin) : 58}°
                      </p>
                    </div>

                    {/* B. Hourly Climate Slider */}
                    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                      <h4 className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mb-2.5 flex items-center gap-1">
                        <Clock size={11} /> 24-Hour Forecast
                      </h4>
                      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                        {weather ? (
                          weather.hourly.slice(0, 8).map((h, i) => {
                            const dateStr = new Date(h.time);
                            const hourFormatted = dateStr.toLocaleTimeString([], { hour: 'numeric' });
                            return (
                              <div key={i} className="flex-shrink-0 flex flex-col items-center justify-between w-11 h-20 py-1.5 rounded-xl bg-white/5 border border-white/5 active:bg-white/15">
                                <span className="text-[9px] text-neutral-400 font-medium">{hourFormatted}</span>
                                <WeatherIcon3D code={h.code} size={22} isNight={dateStr.getHours() >= 19 || dateStr.getHours() < 6} />
                                <span className="text-xs font-bold font-mono">{Math.round(h.temp)}°</span>
                                <div className="flex items-center gap-0.5 text-[8px] text-sky-300">
                                  <span className="leading-none text-[8px] opacity-80">{h.precipProb}%</span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          [...Array(6)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-11 h-20 rounded-xl bg-white/5 animate-pulse" />
                          ))
                        )}
                      </div>
                    </div>

                    {/* C. 7-Day Forecasting Grid */}
                    <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 space-y-2.5">
                      <h4 className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <TrendingUp size={11} /> 7-Day Forecast
                      </h4>
                      {weather ? (
                        weather.daily.map((d, i) => {
                          const dateObj = new Date(d.date);
                          const dayName = i === 0 ? "Today" : dateObj.toLocaleDateString([], { weekday: 'short' });
                          return (
                            <div key={i} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                              <span className="text-[11px] font-bold w-12 text-neutral-100">{dayName}</span>
                              <div className="flex items-center gap-1.5 w-16">
                                <WeatherIcon3D code={d.code} size={22} />
                                <span className="text-[9px] text-sky-300 font-mono leading-none">{d.precipProbMax}%</span>
                              </div>
                              <div className="flex items-center gap-2 font-mono text-[10px] text-right">
                                <span className="text-neutral-400 w-5">{Math.round(d.tempMin)}°</span>
                                {/* Small visual gauge representation */}
                                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden relative">
                                  <div className="absolute h-full bg-gradient-to-r from-teal-400 to-amber-400 rounded-full" style={{ left: '20%', right: '20%' }} />
                                </div>
                                <span className="text-white font-bold w-5">{Math.round(d.tempMax)}°</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        [...Array(5)].map((_, i) => (
                          <div key={i} className="h-6 bg-white/5 rounded animate-pulse" />
                        ))
                      )}
                    </div>

                    {/* D. Additional Secondary Climate metrics Bento */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Apparent Temp */}
                      <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/10 flex flex-col justify-between h-20">
                        <div className="flex items-center gap-1 text-sky-300 text-[10px] font-medium uppercase tracking-wider">
                          <Compass size={12} /> Feels Like
                        </div>
                        <div>
                          <span className="text-lg font-bold font-mono text-white">{weather ? `${Math.round(weather.current.apparentTemperature)}°` : "--"}</span>
                          <p className="text-[9px] text-neutral-400 mt-1">Wind chill index calculations</p>
                        </div>
                      </div>

                      {/* Humidity */}
                      <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/10 flex flex-col justify-between h-20">
                        <div className="flex items-center gap-1 text-sky-300 text-[10px] font-medium uppercase tracking-wider">
                          <Droplets size={12} /> Humidity
                        </div>
                        <div>
                          <span className="text-lg font-bold font-mono text-white">{weather ? `${weather.current.humidity}%` : "--"}</span>
                          <p className="text-[9px] text-neutral-400 mt-1">Atmospheric water volume</p>
                        </div>
                      </div>

                      {/* Wind Speed */}
                      <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/10 flex flex-col justify-between h-20">
                        <div className="flex items-center gap-1 text-sky-300 text-[10px] font-medium uppercase tracking-wider">
                          <Wind size={12} /> Wind Speed
                        </div>
                        <div>
                          <span className="text-lg font-bold font-mono text-white">{weather ? `${weather.current.windSpeed} km/h` : "--"}</span>
                          <p className="text-[9px] text-neutral-400 mt-1">Breeze vector strength</p>
                        </div>
                      </div>

                      {/* Atmospheric Pressure */}
                      <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/10 flex flex-col justify-between h-20">
                        <div className="flex items-center gap-1 text-sky-300 text-[10px] font-medium uppercase tracking-wider">
                          <Zap size={12} /> Pressure
                        </div>
                        <div>
                          <span className="text-sm font-bold font-mono text-white truncate block">{weather ? `${Math.round(weather.current.pressure)} hPa` : "--"}</span>
                          <p className="text-[9px] text-neutral-400 mt-1.5">Standard force density</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* WINDY RADAR MAP TAB PANEL */}
                {appTab === "radar" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
                      <h3 className="text-xs font-bold flex items-center gap-1.5">
                        <Map size={14} className="text-emerald-400" /> Animated Radar Map
                      </h3>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Displaying Windy.com dynamic meteorological map centered at coordinate fields.
                      </p>
                    </div>

                    {/* Highly responsive Windy Radar Embed */}
                    <div className="relative w-full aspect-[4/5] bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
                      {weather ? (
                        <iframe 
                          id="windy-radar-iframe"
                          title="Windy.com Real-time Animated Radar Map"
                          src={`https://node.windy.com/embed/iframe.html?lat=${weather.latitude}&lon=${weather.longitude}&zoom=6&level=surface&overlay=radar&menu=&message=&marker=&forecast=12&type=map&location=coordinates&detail=&detailLat=${weather.latitude}&detailLon=${weather.longitude}&metricWind=default&metricTemp=default&radarRange=true`}
                          className="w-full h-full border-0 rounded-2xl"
                          allowFullScreen
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-neutral-400">
                          <RefreshCw size={24} className="animate-spin text-sky-400 mb-2" />
                          <p className="text-xs">Connecting map data coordinates...</p>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md py-0.5 px-2 rounded text-[8px] text-slate-400 pointer-events-none border border-white/10">
                        Windy.com Radar Engine
                      </div>
                    </div>
                  </div>
                )}

                {/* BATTERY POWER LAB TAB PANEL */}
                {appTab === "battery" && (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10">
                      <h3 className="text-xs font-bold leading-none flex items-center gap-1 text-emerald-400">
                        <Zap size={14} /> Battery Power Lab
                      </h3>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Select performance tiers to throttle background network activity, render-intervals & GPS accuracy.
                      </p>
                      
                      {/* Active level metrics grid */}
                      <div className="grid grid-cols-2 gap-2 mt-3.5 text-xs font-mono">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-center">
                          <span className="text-[9px] text-neutral-500 block leading-tight">GPS FREQUENCY</span>
                          <span className="font-bold text-white text-[11px] mt-0.5 block">{telemetry.gpsFrequency}</span>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-center">
                          <span className="text-[9px] text-neutral-500 block leading-tight">BACKGROUND DATA</span>
                          <span className="font-bold text-white text-[11px] mt-0.5 block">{telemetry.networkBytes}</span>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-center">
                          <span className="text-[9px] text-neutral-500 block leading-tight">DRIP DISCHARGE</span>
                          <span className="font-bold text-red-400 text-[11px] mt-0.5 block">{telemetry.drainRate}</span>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-center">
                          <span className="text-[9px] text-neutral-500 block leading-tight">CPU TELEMETRY</span>
                          <span className="font-bold text-[#FFD54F] text-[11px] mt-0.5 block">{telemetry.cpuUsage}%</span>
                        </div>
                      </div>
                    </div>

                    {/* SELECTABLE INTERACTIVE OPTIMIZERS */}
                    <div className="space-y-2.5">
                      {/* Ultra Performance */}
                      <div 
                        onClick={() => setBatteryMode("ultra")}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          batteryMode === "ultra" 
                            ? "bg-red-500/10 border-red-500/40 text-white" 
                            : "bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <Sliders size={15} className="mt-0.5 text-red-400" />
                          <div>
                            <span className="text-xs font-bold block leading-none text-white">High Precision Mode</span>
                            <span className="text-[9px] opacity-70 mt-0.5 block">120FPS rain particle canopy • Active GPS (5s)</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-red-400 bg-red-950/30 px-2 py-0.5 rounded font-bold border border-red-500/20 uppercase leading-none">Max</span>
                      </div>

                      {/* Balanced Mode */}
                      <div 
                        onClick={() => setBatteryMode("balanced")}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          batteryMode === "balanced" 
                            ? "bg-teal-500/10 border-teal-500/40 text-white" 
                            : "bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <Zap size={14} className="mt-0.5 text-teal-400" />
                          <div>
                            <span className="text-xs font-bold block leading-none text-white">Balanced Optimizer</span>
                            <span className="text-[9px] opacity-70 mt-0.5 block">60FPS Canvas density • Standard network refreshes</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-teal-400 bg-teal-950/30 px-2 py-0.5 rounded font-bold border border-teal-500/20 uppercase leading-none">Std</span>
                      </div>

                      {/* Power Save Mode */}
                      <div 
                        onClick={() => setBatteryMode("saver")}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          batteryMode === "saver" 
                            ? "bg-amber-500/10 border-amber-500/40 text-white" 
                            : "bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <Battery size={15} className="mt-0.5 text-amber-400" />
                          <div>
                            <span className="text-xs font-bold block leading-none text-white">Battery Saver Mode</span>
                            <span className="text-[9px] opacity-70 mt-0.5 block">30FPS frame limits • Coarse Network positions</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-amber-300 bg-amber-950/30 px-2 py-0.5 rounded font-bold border border-amber-500/20 uppercase leading-none">ECO</span>
                      </div>

                      {/* Extreme Battery Saver */}
                      <div 
                        onClick={() => setBatteryMode("extreme")}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          batteryMode === "extreme" 
                            ? "bg-emerald-500/10 border-emerald-500/40 text-white animate-pulse" 
                            : "bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <Power size={14} className="mt-0.5 text-emerald-400" />
                          <div>
                            <span className="text-xs font-bold block leading-none text-white">Extreme Blackout Saver</span>
                            <span className="text-[9px] opacity-70 mt-0.5 block">Disables active wallpaper canvases • Static cache only</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded font-bold border border-emerald-500/20 uppercase leading-none">OLED</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ALERTS & NOTIFICATIONS LOG TAB PANEL */}
                {appTab === "alerts" && (
                  <div className="space-y-3">
                    <div className="p-3 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-bold flex items-center gap-1.5 text-amber-400">
                          <Bell size={13} /> Custom Warning Center
                        </h3>
                        <p className="text-[10px] text-neutral-400 mt-1">Simulated push warnings from meteorological sensors.</p>
                      </div>
                      {notifications.length > 0 && (
                        <button 
                          onClick={() => setNotifications([])}
                          className="p-1 px-2 hover:bg-white/10 rounded-lg text-[10px] font-bold text-red-400 flex items-center gap-1"
                          title="Purge Alerts"
                        >
                          <Trash2 size={12} /> Clear
                        </button>
                      )}
                    </div>

                    {/* ALERTS NOTIFICATION LOG */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center bg-white/5 rounded-xl border border-white/5 text-neutral-400">
                          <Bell size={24} className="mx-auto text-neutral-500 mb-2 opacity-50" />
                          <p className="text-xs font-bold">Safe Sky Advisory</p>
                          <p className="text-[10px] text-neutral-500 mt-1">No severe weather threats currently issued.</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id}
                            className={`p-3 rounded-xl border flex items-start gap-2.5 pl-3 border-l-4 ${
                              n.level === "critical" ? "bg-red-500/5 border-l-red-500 border-white/5" :
                              n.level === "warning" ? "bg-amber-500/5 border-l-amber-500 border-white/5" :
                              "bg-indigo-500/5 border-l-indigo-400 border-white/5"
                            }`}
                          >
                            <AlertTriangle size={15} className={`mt-0.5 flex-shrink-0 ${
                              n.level === "critical" ? "text-red-400" :
                              n.level === "warning" ? "text-amber-400" :
                              "text-sky-300"
                            }`} />
                            <div className="flex-grow min-w-0">
                              <span className="text-[9px] text-neutral-500 font-mono block mb-0.5">{n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="text-xs font-bold block text-white">{n.title}</span>
                              <span className="text-[10px] text-neutral-300 mt-0.5 block leading-normal">{n.message}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* DUMMY EMERGENCY PREPARATION CHECKLIST */}
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">EMERGENCY FIRST-AID KIT</span>
                      <div className="text-[10px] text-slate-300 space-y-1 font-medium">
                        <div className="flex items-center gap-1.5"><Sliders size={10} /> Water reserves: 1 Gallon water per day.</div>
                        <div className="flex items-center gap-1.5"><Sliders size={10} /> Battery Backup sources verified.</div>
                        <div className="flex items-center gap-1.5"><Sliders size={10} /> Evacuation channels saved locally offline.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* iv. BOTTOM APP SYSTEM BAR */}
              <div className="h-12 bg-black/45 backdrop-blur-md border-t border-white/10 flex items-center justify-around px-2 z-40">
                
                {/* Forecast */}
                <button 
                  onClick={() => setAppTab("forecast")}
                  className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-xl transition ${
                    appTab === "forecast" ? "text-sky-400 font-bold bg-white/5" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Cloud size={16} />
                  <span className="text-[9px] tracking-tight">Weather</span>
                </button>

                {/* Radar Map */}
                <button 
                  onClick={() => setAppTab("radar")}
                  className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-xl transition ${
                    appTab === "radar" ? "text-sky-400 font-bold bg-white/5" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Map size={16} />
                  <span className="text-[9px] tracking-tight font-medium">Radar</span>
                </button>

                {/* Power Optimizers */}
                <button 
                  onClick={() => setAppTab("battery")}
                  className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-xl transition ${
                    appTab === "battery" ? "text-sky-400 font-bold bg-white/5" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Zap size={16} />
                  <span className="text-[9px] tracking-tight font-medium">Power Lab</span>
                </button>

                {/* Danger Warnings center tab */}
                <button 
                  onClick={() => setAppTab("alerts")}
                  className={`flex flex-col items-center gap-0.5 py-1 px-3.5 rounded-xl transition relative ${
                    appTab === "alerts" ? "text-sky-400 font-bold bg-white/5" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Bell size={16} />
                  {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-0.5 right-6 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                  )}
                  <span className="text-[9px] tracking-tight font-medium">Alerts</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* VIRTUAL MOBILE HOME INDICATOR SWIPER */}
          <div className="h-4 w-full flex items-center justify-center pt-1 pb-1.5 bg-transparent shrink-0">
            <button 
              onClick={() => {
                if (screen === "app") setScreen("home");
                else if (screen === "home") setScreen("lock");
                else setScreen("home");
              }}
              className="w-28 h-1 bg-white/40 hover:bg-white/70 active:scale-95 rounded-full transition-transform"
              title="Unlock / Go Home"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
