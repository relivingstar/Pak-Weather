import { useEffect, useRef, useState } from "react";
import { BatteryMode, WallpaperMode } from "../types";

interface LiveWallpaperProps {
  mode: WallpaperMode;
  weatherCode?: number;
  batteryMode: BatteryMode;
  isNight?: boolean;
}

export function LiveWallpaper({ mode, weatherCode = 0, batteryMode, isNight = false }: LiveWallpaperProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gradientStyle, setGradientStyle] = useState<string>("");

  // Determine actual rendered wallpaper based on selection or current weather
  const getActiveMode = (): "sunny" | "rainy" | "snowy" | "cloudy" | "thunderstorm" | "starry_night" => {
    if (mode !== "dynamic") return mode as any;

    // Map weather codes to wallpaper categories
    if (weatherCode === 0) return isNight ? "starry_night" : "sunny";
    if (weatherCode >= 1 && weatherCode <= 2) return isNight ? "starry_night" : "sunny";
    if (weatherCode === 3 || weatherCode === 45 || weatherCode === 48) return "cloudy";
    if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) return "rainy";
    if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) return "snowy";
    if (weatherCode >= 95 && weatherCode <= 99) return "thunderstorm";
    return isNight ? "starry_night" : "sunny";
  };

  const activeMode = getActiveMode();

  // Handle ambient gradient backgrounds
  useEffect(() => {
    let colors = "";
    switch (activeMode) {
      case "sunny":
        colors = isNight 
          ? "from-slate-900 via-indigo-950 to-slate-950" 
          : "from-sky-400 via-amber-200 to-amber-300";
        break;
      case "rainy":
        colors = "from-slate-800 via-blue-900 to-slate-950";
        break;
      case "snowy":
        colors = "from-sky-100 via-blue-200 to-slate-200 text-slate-950";
        break;
      case "cloudy":
        colors = "from-slate-600 via-zinc-400 to-slate-800";
        break;
      case "thunderstorm":
        colors = "from-slate-950 via-zinc-900 to-violet-950";
        break;
      case "starry_night":
        colors = "from-slate-950 via-indigo-1000 to-black";
        break;
      default:
        colors = "from-sky-400 via-blue-500 to-indigo-600";
    }
    setGradientStyle(colors);
  }, [activeMode, isNight]);

  // Particle engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Disabled fully for Extreme Battery Saver to conserve screen energy and rendering threads
    if (batteryMode === "extreme") {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      aux?: number; // wind sway or angle
    }> = [];

    // Set canvas dimensions
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || 360;
      canvas.height = rect?.height || 640;
    };
    resizeCanvas();

    // Adjust density of particles based on Battery mode
    let particleCount = 40;
    if (activeMode === "rainy") particleCount = 100;
    if (activeMode === "snowy") particleCount = 45;
    if (activeMode === "starry_night") particleCount = 80;

    if (batteryMode === "saver") {
      particleCount = Math.floor(particleCount * 0.35); // 65% reduction
    } else if (batteryMode === "balanced") {
      particleCount = Math.floor(particleCount * 0.7); // 30% reduction
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      if (activeMode === "rainy") {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: -1 - Math.random() * 2, // slightly slanted
          vy: 8 + Math.random() * 6, // fast rain drop
          size: 1 + Math.random() * 1.5,
          color: "rgba(100, 181, 246, ",
          alpha: 0.15 + Math.random() * 0.35,
        });
      } else if (activeMode === "snowy") {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: -0.5 + Math.random() * 1,
          vy: 0.8 + Math.random() * 1.2,
          size: 1.5 + Math.random() * 4,
          color: "rgba(255, 255, 255, ",
          alpha: 0.4 + Math.random() * 0.5,
          aux: Math.random() * Math.PI * 2, // sway frequency
        });
      } else if (activeMode === "sunny") {
        // Floating sunbeam sparks
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: -0.2 + Math.random() * 0.4,
          vy: -0.3 - Math.random() * 0.6,
          size: 2 + Math.random() * 5,
          color: isNight ? "rgba(197, 202, 233, " : "rgba(255, 241, 118, ",
          alpha: 0.1 + Math.random() * 0.3,
        });
      } else if (activeMode === "starry_night") {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          size: 0.8 + Math.random() * 1.5,
          color: "rgba(255, 255, 255, ",
          alpha: 0.1 + Math.random() * 0.9,
          aux: 0.01 + Math.random() * 0.03, // star pulsing offset speed
        });
      } else if (activeMode === "thunderstorm") {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: -2 - Math.random() * 3,
          vy: 11 + Math.random() * 6,
          size: 1.2 + Math.random() * 2,
          color: "rgba(174, 213, 129, ", // greenish/blueish heavy raindrops
          alpha: 0.2 + Math.random() * 0.4,
        });
      }
    }

    // Animation cycle
    let lastFrameTime = performance.now();
    let frameInterval = 1000 / 60; // 60 FPS target
    if (batteryMode === "saver") {
      frameInterval = 1000 / 30; // 30 FPS target
    } else if (batteryMode === "balanced") {
      frameInterval = 1000 / 45; // 45 FPS target
    }

    let lightningFlash = 0;

    const animate = (time: number) => {
      const elapsed = time - lastFrameTime;

      if (elapsed >= frameInterval) {
        lastFrameTime = time - (elapsed % frameInterval);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render backgrounds for dynamic elements
        if (activeMode === "thunderstorm") {
          // Occasional sky flashes
          if (Math.random() < 0.01) {
            lightningFlash = 15; // flashes for 15 frames
          }
          if (lightningFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 210, ${Math.random() * 0.15 * (lightningFlash / 15)})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            lightningFlash--;
          }
        }

        particles.forEach((p) => {
          // Draw particle
          ctx.beginPath();
          ctx.fillStyle = `${p.color}${p.alpha})`;

          if (activeMode === "rainy" || activeMode === "thunderstorm") {
            // Lines for fast rain streak
            ctx.strokeStyle = `${p.color}${p.alpha})`;
            ctx.lineWidth = p.size;
            ctx.lineCap = "round";
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.vx * 1.5, p.y + p.vy * 1.5);
            ctx.stroke();
          } else if (activeMode === "snowy") {
            // Fluffy circles
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Glowing round shapes
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }

          // Move item
          if (activeMode === "snowy" && p.aux !== undefined) {
            p.aux += 0.015;
            p.x += p.vx + Math.sin(p.aux) * 0.4;
            p.y += p.vy;
          } else if (activeMode === "starry_night" && p.aux !== undefined) {
            // Pulsing stars (alpha wave)
            p.alpha += p.aux;
            if (p.alpha > 0.95 || p.alpha < 0.1) {
              p.aux = -p.aux;
            }
          } else {
            p.x += p.vx;
            p.y += p.vy;
          }

          // Boundary checks
          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x < -10) {
            p.x = canvas.width + 10;
          }
          if (p.x > canvas.width + 10) {
            p.x = -10;
          }
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeMode, batteryMode]);

  return (
    <div
      id="live-wallpaper-container"
      className={`absolute inset-0 bg-gradient-to-b ${gradientStyle} overflow-hidden pointer-events-none transition-all duration-[1500ms]`}
    >
      {/* Heavy foggy overlay */}
      {activeMode === "cloudy" && (
        <div className="absolute inset-0 bg-neutral-100/10 backdrop-blur-[2px] pointer-events-none mix-blend-overlay" />
      )}

      {/* Dynamic particles layer */}
      {batteryMode !== "extreme" && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{
            opacity: batteryMode === "saver" ? 0.6 : 1,
          }}
        />
      )}
    </div>
  );
}
