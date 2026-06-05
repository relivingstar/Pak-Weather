export interface WeatherData {
  cityName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature: number;
    humidity: number;
    apparentTemperature: number;
    precipitation: number;
    rain: number;
    snowfall: number;
    weatherCode: number;
    cloudCover: number;
    pressure: number;
    windSpeed: number;
  };
  hourly: Array<{
    time: string;
    temp: number;
    precipProb: number;
    code: number;
    windSpeed: number;
  }>;
  daily: Array<{
    date: string;
    code: number;
    tempMax: number;
    tempMin: number;
    apparentMax: number;
    apparentMin: number;
    precipProbMax: number;
  }>;
}

export type BatteryMode = "ultra" | "balanced" | "saver" | "extreme";

export type WallpaperMode = "dynamic" | "sunny" | "rainy" | "snowy" | "cloudy" | "thunderstorm" | "starry_night";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  level: "info" | "warning" | "critical";
  isRead: boolean;
}

export type WidgetTheme = "glass" | "dark" | "light" | "amoled";

export interface SavedLocation {
  name: string;
  lat: number;
  lon: number;
}
