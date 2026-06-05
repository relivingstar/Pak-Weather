import { useState, useEffect } from "react";
import { 
  WeatherData, 
  BatteryMode, 
  WallpaperMode, 
  SystemNotification, 
  WidgetTheme 
} from "./types";
import { PhoneMockup, getWeatherDesc } from "./components/PhoneMockup";
import { DashboardSettings } from "./components/DashboardSettings";
import { 
  CloudRain, 
  RefreshCw, 
  Compass, 
  AlertCircle,
  Smartphone,
  Info
} from "lucide-react";

export default function App() {
  // Core location states (Defaults to San Francisco coordinates)
  const [lat, setLat] = useState<number>(37.7749);
  const [lon, setLon] = useState<number>(-122.4194);
  const [currentCityName, setCurrentCityName] = useState<string>("San Francisco");

  // Weather data, loading & error trackers
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);

  // Preference Customizations states
  const [batteryMode, setBatteryMode] = useState<BatteryMode>("balanced");
  const [wallpaperMode, setWallpaperMode] = useState<WallpaperMode>("dynamic");
  const [widgetTheme, setWidgetTheme] = useState<WidgetTheme>("glass");

  // Notifications repository containing initial simulated danger advisories
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: "init-uv-alert",
      title: "Excessive Heat Alert",
      message: "Strong heat conditions with indices climbing up to 102°F. Stay cool and hydrated.",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      level: "warning",
      isRead: false
    }
  ]);

  // Autocomplete Suggestions array
  const [suggestions, setSuggestions] = useState<Array<{ name: string, country?: string, latitude: number, longitude: number }>>([]);

  // Load weather and boot GPS on first creation
  useEffect(() => {
    // Attempt standard GPS Automatic Geolocations
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const uLat = position.coords.latitude;
          const uLon = position.coords.longitude;
          setLat(uLat);
          setLon(uLon);
          setCurrentCityName("My Location");
          fetchWeatherData(uLat, uLon, "My Location");
          addNotification("GPS Sync Completed", "Position coordinates resolved accurately. Live Local weather is now active.", "info");
        },
        (error) => {
          console.warn("Geolocation denied or timed out. Falling back to default region.", error);
          // Standard fallback
          fetchWeatherData(37.7749, -122.4194, "San Francisco");
          addNotification("System Warning", "GPS denied. Default fallback location (San Francisco) is selected.", "warning");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      fetchWeatherData(37.7749, -122.4194, "San Francisco");
    }
  }, []);

  // Set up periodic sync intervals depending on the Selected Power optimization mode!
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    // Config intervals: Balanced: 15min, Ultra Precision: 30s, Saver: 1hr, Extreme: null.
    let ms = 900000; // 15 mins
    if (batteryMode === "ultra") ms = 30000; // 30s
    if (batteryMode === "saver") ms = 3600000; // 1 hour

    if (batteryMode !== "extreme") {
      interval = setInterval(() => {
        fetchWeatherData(lat, lon, currentCityName);
      }, ms);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lat, lon, currentCityName, batteryMode]);

  // Command Custom Push Notifications
  const addNotification = (title: string, message: string, level: "info" | "warning" | "critical") => {
    const freshAlert: SystemNotification = {
      id: `alert-${Date.now()}`,
      title,
      message,
      timestamp: new Date(),
      level,
      isRead: false
    };
    setNotifications(prev => [...prev, freshAlert]);
  };

  // Main HTTP fetching logic using open Open-Meteo
  const fetchWeatherData = async (latitude: number, longitude: number, cityName: string) => {
    setLoading(true);
    setErrorHeader(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_probability_max&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error("Unable to contact Open-Meteo servers. Please confirm connection.");
      }

      const res = await response.json();

      // Transform response fields to match internal schemas
      const transformed: WeatherData = {
        cityName,
        latitude,
        longitude,
        timezone: res.timezone || "UTC",
        current: {
          time: res.current.time,
          temperature: res.current.temperature_2m,
          humidity: res.current.relative_humidity_2m,
          apparentTemperature: res.current.apparent_temperature,
          precipitation: res.current.precipitation ?? 0,
          rain: res.current.rain ?? 0,
          snowfall: res.current.snowfall ?? 0,
          weatherCode: res.current.weather_code,
          cloudCover: res.current.cloud_cover ?? 0,
          pressure: res.current.pressure_msl ?? 1013,
          windSpeed: res.current.wind_speed_10m ?? 0,
        },
        hourly: res.hourly.time.map((timeStr: string, idx: number) => ({
          time: timeStr,
          temp: res.hourly.temperature_2m[idx],
          precipProb: res.hourly.precipitation_probability[idx] ?? 0,
          code: res.hourly.weather_code[idx] ?? 0,
          windSpeed: res.hourly.wind_speed_10m[idx] ?? 0,
        })),
        daily: res.daily.time.map((dateStr: string, idx: number) => ({
          date: dateStr,
          code: res.daily.weather_code[idx] ?? 0,
          tempMax: res.daily.temperature_2m_max[idx],
          tempMin: res.daily.temperature_2m_min[idx],
          apparentMax: res.daily.apparent_temperature_max[idx],
          apparentMin: res.daily.apparent_temperature_min[idx],
          precipProbMax: res.daily.precipitation_probability_max[idx] ?? 0,
        })),
      };

      setWeather(transformed);
      
      // Auto-trigger alerts depending on live weather parameters
      const currentCode = transformed.current.weatherCode;
      if (currentCode >= 95) {
        addNotification(
          "Thunderstorm Warning Active",
          `Live atmospheric codes indicate severe thunderstorm indices near ${cityName}. Remain inside.`,
          "critical"
        );
      } else if (transformed.current.temperature > 37) {
        addNotification(
          "High Temp Hazard Warning",
          `Intense thermometer spikes observed at ${transformed.current.temperature}°C in ${cityName}. Wear lightweight linen clothes.`,
          "warning"
        );
      } else if (transformed.current.windSpeed > 35) {
        addNotification(
          "Severe Gale Advisory",
          `Adverse wind currents detected near ${cityName} going up to ${transformed.current.windSpeed} km/h. Keep clear from power towers.`,
          "warning"
        );
      }

    } catch (err: any) {
      console.error("HTTP Fetch failed:", err);
      setErrorHeader(err.message || "Failed to render climate parameters.");
    } finally {
      setLoading(false);
    }
  };

  // Triggers real live geolocation GPS lookup on request
  const requestGPSUpdate = () => {
    if (navigator.geolocation) {
      addNotification("Resolving GPS Position", "Requesting location coordinates from hardware signals...", "info");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const uLat = position.coords.latitude;
          const uLon = position.coords.longitude;
          setLat(uLat);
          setLon(uLon);
          setCurrentCityName("My Location");
          fetchWeatherData(uLat, uLon, "My Location");
          addNotification("GPS Re-Sync Succeeded", "Live location pinpointed successfully.", "info");
        },
        (error) => {
          addNotification("GPS Refused", "Unable to establish GPS signal. Ensure high fidelity permissions are allowed.", "critical");
        }
      );
    } else {
      addNotification("Incompatible Browser", "Geolocation services are not supported by this container framework.", "critical");
    }
  };

  // Live Geocoding lookups via Open-Meteo as user types search queries
  const handleSearchGeocode = async (query: string) => {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setSuggestions(data.results.map((r: any) => ({
            name: r.name,
            country: r.country || r.admin1,
            latitude: r.latitude,
            longitude: r.longitude
          })));
        } else {
          setSuggestions([]);
        }
      }
    } catch (e) {
      console.error("Geocoding lookup failed", e);
    }
  };

  // Handle selected city autocomplete
  const handleSelectSuggestion = (suggestion: any) => {
    const name = suggestion.name;
    const lats = suggestion.latitude;
    const lons = suggestion.longitude;
    setLat(lats);
    setLon(lons);
    setCurrentCityName(name);
    fetchWeatherData(lats, lons, name);
    setSuggestions([]);
    addNotification("Location Updated", `Flew coordinates successfully to ${name}.`, "info");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden select-none">
      
      {/* Immersive UI ambient decoration elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e293b_0%,transparent_70%)] opacity-40 pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none z-0"></div>
      
      {/* 2-Column Desktop Grid for Simulator + Settings Console */}
      <main className="w-full max-w-5xl grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-7 items-center justify-center z-10 relative">
        
        {/* COL 1: SMARTPHONE INTERACTIVE COMPONENT WITH INNER WEB APP */}
        <div className="flex flex-col items-center justify-center space-y-3">
          {/* Subtle loading indicator on top of phone layout */}
          <div className="h-6 flex items-center justify-center">
            {loading ? (
              <span className="text-xs text-sky-400 font-mono tracking-widest flex items-center gap-1.5 uppercase leading-none bg-sky-950/45 px-3 py-1 rounded-full border border-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                <RefreshCw size={11} className="animate-spin text-sky-400" /> SYNCING CHANNELS...
              </span>
            ) : errorHeader ? (
              <span className="text-[11px] text-red-400 bg-red-950/45 px-3 py-1 rounded-full border border-red-500/20 font-bold uppercase flex items-center gap-1 leading-none">
                <AlertCircle size={11} /> {errorHeader}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 leading-none">
                <Info size={11} className="text-slate-500" /> Tap phone elements to test widgets & alerts
              </span>
            )}
          </div>

          <PhoneMockup
            weather={weather}
            loading={loading}
            batteryMode={batteryMode}
            setBatteryMode={setBatteryMode}
            wallpaperMode={wallpaperMode}
            setWallpaperMode={setWallpaperMode}
            widgetTheme={widgetTheme}
            setWidgetTheme={setWidgetTheme}
            notifications={notifications}
            setNotifications={setNotifications}
            addNotification={addNotification}
            requestGPSUpdate={requestGPSUpdate}
            onSearchCity={handleSearchGeocode}
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
          />
        </div>

        {/* COL 2: MAIN SETTINGS DESKTOP COCKPIT / DASHBOARD PANEL */}
        <DashboardSettings
          weather={weather}
          batteryMode={batteryMode}
          setBatteryMode={setBatteryMode}
          wallpaperMode={wallpaperMode}
          setWallpaperMode={setWallpaperMode}
          widgetTheme={widgetTheme}
          setWidgetTheme={setWidgetTheme}
          addNotification={addNotification}
          onSelectSuggestion={handleSelectSuggestion}
          requestGPSUpdate={requestGPSUpdate}
        />

      </main>

      {/* FOOTER DESK GREETINGS */}
      <footer className="mt-8 text-center text-slate-500 text-[10px] uppercase tracking-wider font-semibold z-10 select-none">
        Meteo Aura Studio Desk Workspace • Immersive UI Ambient Mode Active
      </footer>
    </div>
  );
}
