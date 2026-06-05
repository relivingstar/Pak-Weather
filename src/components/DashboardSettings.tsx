import { useState } from "react";
import { 
  Sliders, 
  Map, 
  Bell, 
  MapPin, 
  Smartphone, 
  AlertTriangle, 
  Sparkles,
  Zap,
  Battery,
  CloudLightning,
  Sun,
  Palette,
  Compass
} from "lucide-react";
import { BatteryMode, WallpaperMode, WidgetTheme, WeatherData } from "../types";

interface DashboardSettingsProps {
  weather: WeatherData | null;
  batteryMode: BatteryMode;
  setBatteryMode: (mode: BatteryMode) => void;
  wallpaperMode: WallpaperMode;
  setWallpaperMode: (mode: WallpaperMode) => void;
  widgetTheme: WidgetTheme;
  setWidgetTheme: (theme: WidgetTheme) => void;
  addNotification: (title: string, message: string, level: "info" | "warning" | "critical") => void;
  onSelectSuggestion: (s: any) => void;
  requestGPSUpdate: () => void;
}

export function DashboardSettings({
  weather,
  batteryMode,
  setBatteryMode,
  wallpaperMode,
  setWallpaperMode,
  widgetTheme,
  setWidgetTheme,
  addNotification,
  onSelectSuggestion,
  requestGPSUpdate,
}: DashboardSettingsProps) {
  const [gpsPrecision, setGpsPrecision] = useState<"high" | "coarse" | "mock">("high");

  // Preset cities for quick global checking
  const presets = [
    { name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
    { name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278 },
    { name: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093 },
    { name: "Reykjavik", country: "Iceland", latitude: 64.1466, longitude: -21.9426 },
    { name: "Cape Town", country: "South Africa", latitude: -33.9249, longitude: 18.4241 },
    { name: "Dubai", country: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708 },
  ];

  // Simulated notification presets
  const alertPresets = [
    {
      title: "Severe Thunderstorm Alarm",
      message: "Gusts up to 65 mph and size hail detected. Move indoors instantly and secure outdoor accessories.",
      level: "critical" as const
    },
    {
      title: "Extremely Cruend UV Warning",
      message: "Extreme Ultraviolet level 11+ is active. Sunburn hazard in under 8 minutes. Wear SPF 50+ and sun shades.",
      level: "warning" as const
    },
    {
      title: "Sudden Flash Flood Alert",
      message: "Heavy localized precipitation exceeds storm run-offs. Drive slow and avoid flooded underpasses.",
      level: "critical" as const
    },
    {
      title: "High Heat Wave Advisory",
      message: "Maximum apparent index will escalate up to 105°F. Rest in shade, stay dehydrated, limits work outdoors.",
      level: "warning" as const
    }
  ];

  const triggerMockAlert = (index: number) => {
    const alert = alertPresets[index];
    addNotification(alert.title, alert.message, alert.level);
  };

  return (
    <div id="settings-dashboard-panel" className="w-full xl:w-[420px] bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-6 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6 flex flex-col justify-between max-h-[760px] overflow-y-auto scrollbar-none group relative">
      
      {/* Background yellow subtle glowing spot on hover/focus */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>

      {/* HEADER SUMMARY SECTION */}
      <div className="space-y-1 relative z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 via-emerald-300 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2 leading-none">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.9)] animate-pulse"></span>
          METEO AURA DESK
        </h1>
        <p className="text-[11px] text-slate-400 font-medium tracking-wide">
          Atmospheric control console for commanding dynamic weather, alerts, widgets, and optimizing battery efficiency.
        </p>
      </div>

      {/* SECTION 1: PRESET LOCATIONS */}
      <div className="space-y-2.5 relative z-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1.5 leading-none">
          <MapPin size={13} /> Preset Global Coordinates
        </h3>
        <p className="text-[10px] text-slate-400">Select any preset region to fly coordinates and experience matching atmospheric renderers.</p>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => onSelectSuggestion(p)}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left text-xs transition flex flex-col justify-between h-14 group hover:border-white/20 hover:scale-[1.02] duration-200"
            >
              <span className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors duration-200">{p.name}</span>
              <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">{p.country}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 2: TRIGGER HARDWARE ALERTS */}
      <div className="space-y-2.5 relative z-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1.5 leading-none">
          <Bell size={13} className="text-amber-500 animate-pulse" /> Simulate Critical Warnings
        </h3>
        <p className="text-[10px] text-slate-400">Dispatch tailored alerts to verify high-fidelity push indicators and warning logging registers inside the phone.</p>
        
        <div className="grid grid-cols-2 gap-2">
          {alertPresets.map((a, i) => (
            <button
              key={i}
              onClick={() => triggerMockAlert(i)}
              className={`p-3 rounded-2xl border text-left text-[11px] font-bold transition flex flex-col justify-between h-16 cursor-pointer duration-200 hover:scale-[1.02] ${
                a.level === "critical" 
                  ? "bg-red-500/5 hover:bg-red-500/10 border-red-500/15 text-red-100 hover:border-red-500/30" 
                  : "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/15 text-amber-100 hover:border-amber-500/30"
              }`}
            >
              <span className="line-clamp-1">{a.title}</span>
              <span className={`text-[8px] font-serif uppercase px-1.5 py-0.5 rounded leading-none text-center self-start mt-1 ${
                a.level === "critical" ? "bg-red-950/50 text-red-400" : "bg-amber-950/50 text-amber-400"
              }`}>
                {a.level} Alert
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3: HOME SCREEN WIDGET PRESETS */}
      <div className="space-y-2.5 relative z-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5 leading-none">
          <Palette size={13} /> Custom Widget Style
        </h3>
        <p className="text-[10px] text-slate-400">Switch the design theme of widgets running on the simulated active phone homescreen.</p>
        
        <div className="grid grid-cols-4 gap-2">
          {(["glass", "dark", "light", "amoled"] as WidgetTheme[]).map((t) => (
            <button
              key={t}
              onClick={() => setWidgetTheme(t)}
              className={`p-1.5 py-2.5 text-center text-[10px] font-bold rounded-xl border uppercase transition cursor-pointer duration-155 ${
                widgetTheme === t 
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.25)]" 
                  : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 4: WALLPAPER OVERRIDES */}
      <div className="space-y-2.5 relative z-10">
        <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 leading-none">
          <Sparkles size={13} /> Live Wallpapers Sandbox
        </h3>
        <p className="text-[10px] text-slate-400">Manually force any atmospheric render mode or lock it to match coordinates index.</p>
        
        <div className="grid grid-cols-3 gap-2 text-[10px]">
          {[
            { mode: "dynamic", name: "Dynamic Sync" },
            { mode: "sunny", name: "Solar Beams" },
            { mode: "rainy", name: "Precipitation" },
            { mode: "snowy", name: "Glacial Sways" },
            { mode: "cloudy", name: "Drifting Fog" },
            { mode: "thunderstorm", name: "Severe Bolt" },
            { mode: "starry_night", name: "Cosmic Stars" }
          ].map((item) => (
            <button
              key={item.mode}
              onClick={() => setWallpaperMode(item.mode as WallpaperMode)}
              className={`p-2 rounded-xl border transition duration-155 text-center ${
                wallpaperMode === item.mode 
                  ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-bold shadow-[0_0_15px_rgba(99,102,241,0.25)]" 
                  : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 5: PERFORMANCE REPORT */}
      <div className="p-3 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/5 space-y-2 mt-1 relative z-10">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 leading-none">
          <span>EFFICIENCY REPORT:</span>
          <span className="text-emerald-400 font-bold uppercase">{batteryMode} MODE</span>
        </div>
        <div className="space-y-1 text-[10px] text-slate-300 font-mono">
          <div className="flex items-center justify-between">
            <span>Battery health forecast:</span>
            <span className={
              batteryMode === "ultra" ? "text-red-400" :
              batteryMode === "balanced" ? "text-teal-400" :
              batteryMode === "saver" ? "text-amber-400" :
              "text-emerald-400 font-bold"
            }>
              {batteryMode === "ultra" && "11.5 Hrs (Aggressive)"}
              {batteryMode === "balanced" && "24.2 Hrs (Optimized)"}
              {batteryMode === "saver" && "42.0 Hrs (Eco Savings)"}
              {batteryMode === "extreme" && "78.4 Hrs (Max Endurance)"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Wake-Lock background frequency:</span>
            <span>
              {batteryMode === "ultra" && "Every 1 min"}
              {batteryMode === "balanced" && "Every 15 min"}
              {batteryMode === "saver" && "Every 60 min"}
              {batteryMode === "extreme" && "Manual Update Only"}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
