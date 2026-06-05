import { motion } from "motion/react";

interface WeatherIcon3DProps {
  code: number;
  className?: string;
  size?: number;
  isNight?: boolean;
}

export function WeatherIcon3D({ code, className = "", size = 64, isNight = false }: WeatherIcon3DProps) {
  // Normalize code into main categories: Sunny, PartlyCloudy, Overcast, Foggy, Rainy, Snowy, Stormy
  const getCategory = (c: number): "sunny" | "partly_cloudy" | "overcast" | "foggy" | "rainy" | "snowy" | "stormy" => {
    if (c === 0) return "sunny";
    if (c >= 1 && c <= 2) return "partly_cloudy";
    if (c === 3) return "overcast";
    if (c === 45 || c === 48) return "foggy";
    if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return "rainy";
    if ((c >= 71 && c <= 77) || (c >= 85 && c <= 86)) return "snowy";
    if (c >= 95 && c <= 99) return "stormy";
    return "sunny"; // default fallback
  };

  const category = getCategory(code);

  // Soft float animation
  const floatTransition = {
    duration: 3,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut",
  };

  const pulseTransition = {
    duration: 2.5,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut",
  };

  const rainDropTransition = (delay: number) => ({
    duration: 1.2,
    repeat: Infinity,
    ease: "linear",
    delay,
  });

  const lightningTransition = {
    duration: 3,
    repeat: Infinity,
    repeatDelay: 2,
    ease: "easeInOut",
  };

  switch (category) {
    case "sunny": {
      if (isNight) {
        // Moon with 3D star glowing
        return (
          <motion.svg
            id={`icon-night-clear-${code}`}
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className={className}
            animate={{ y: [0, -3, 0] }}
            transition={floatTransition}
          >
            <defs>
              <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF9E6" />
                <stop offset="60%" stopColor="#DFD0A0" />
                <stop offset="100%" stopColor="#4A4E69" />
              </linearGradient>
              <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E2D194" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#E2D194" stopOpacity="0" />
              </radialGradient>
              <filter id="shadow3d" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="2" dy="5" stdDeviation="3" floodColor="#0A0F1E" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Glowing moon core */}
            <circle cx="45" cy="45" r="30" fill="url(#moonGlow)" />

            {/* Main polished crescent */}
            <motion.path
              d="M30 20 A 25 25 0 1 0 75 65 A 21 21 0 1 1 30 20 Z"
              fill="url(#moonGrad)"
              filter="url(#shadow3d)"
              animate={{ rotate: [0, 4, 0] }}
              transition={pulseTransition}
            />

            {/* Glowing silver star */}
            <motion.path
              d="M72 25 L75 32 L82 33 L77 38 L78 45 L72 41 L66 45 L67 38 L62 33 L69 32 Z"
              fill="#FFFFFF"
              filter="drop-shadow(0px 0px 4px #E2D194)"
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.svg>
        );
      }

      // 3D Sun
      return (
        <motion.svg
          id={`icon-sunny-${code}`}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className={className}
          animate={{ y: [0, -4, 0] }}
          transition={floatTransition}
        >
          <defs>
            <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF066" />
              <stop offset="50%" stopColor="#FF9F1C" />
              <stop offset="100%" stopColor="#FF4000" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF9F1C" stopOpacity="0.5" />
              <stop offset="80%" stopColor="#FFBF00" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FFBF00" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="sunRay" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFDF00" />
              <stop offset="100%" stopColor="#FF9F1C" stopOpacity="0.2" />
            </linearGradient>
            <filter id="sunShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#E65100" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Golden Sun Flare Back-glow */}
          <circle cx="50" cy="50" r="40" fill="url(#sunGlow)" />

          {/* Rotating rays behind */}
          <motion.g
            cx="50"
            cy="50"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "50px 50px" }}
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <line
                key={i}
                x1="50"
                y1="10"
                x2="50"
                y2="22"
                stroke="url(#sunRay)"
                strokeWidth="4"
                strokeLinecap="round"
                transform={`rotate(${angle} 50 50)`}
              />
            ))}
          </motion.g>

          {/* Main 3D Sphere Sun */}
          <motion.circle
            cx="50"
            cy="50"
            r="24"
            fill="url(#sunGrad)"
            filter="url(#sunShadow)"
            animate={{ scale: [1, 1.05, 1] }}
            transition={pulseTransition}
          />
        </motion.svg>
      );
    }

    case "partly_cloudy": {
      // Sun peeking behind beautiful overlapping cloud
      return (
        <motion.svg
          id={`icon-partly-cloudy-${code}`}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className={className}
          animate={{ y: [0, -3, 0] }}
          transition={floatTransition}
        >
          <defs>
            <linearGradient id="cloudSun" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF176" />
              <stop offset="100%" stopColor="#FF8F00" />
            </linearGradient>
            <linearGradient id="cloudFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#E3F2FD" />
              <stop offset="100%" stopColor="#90CAF9" />
            </linearGradient>
            <filter id="cloudShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="2" dy="5" stdDeviation="3.5" floodColor="#263238" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Peeking Sun/Moon */}
          {isNight ? (
            <motion.path
              d="M25 10 A 18 18 0 1 0 55 45 A 15 15 0 1 1 25 10 Z"
              fill="#FFFBE6"
              filter="drop-shadow(0px 0px 5px #FFF176)"
              animate={{ rotate: [-5, 5, -5], y: [0, 1, 0] }}
              transition={pulseTransition}
            />
          ) : (
            <motion.circle
              cx="38"
              cy="34"
              r="16"
              fill="url(#cloudSun)"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "38px 34px" }}
            />
          )}

          {/* Dynamic Foreground Cloud with layered gradient */}
          <path
            d="M 24,65 
               A 14,14 0 0,1 25,40 
               A 17,17 0 0,1 55,36 
               A 21,21 0 0,1 88,52 
               A 14,14 0 0,1 82,72 
               L 30,72 
               A 11,11 0 0,1 24,65 Z"
            fill="url(#cloudFrontGrad)"
            filter="url(#cloudShadow)"
          />
        </motion.svg>
      );
    }

    case "overcast": {
      // Overlapping dark atmospheric clouds representing dense cover
      return (
        <motion.svg
          id={`icon-overcast-${code}`}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className={className}
          animate={{ y: [0, -2, 0] }}
          transition={floatTransition}
        >
          <defs>
            <linearGradient id="backCloud" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B0BEC5" />
              <stop offset="100%" stopColor="#546E7A" />
            </linearGradient>
            <linearGradient id="frontCloud" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ECEFF1" />
              <stop offset="50%" stopColor="#B0BEC5" />
              <stop offset="100%" stopColor="#78909C" />
            </linearGradient>
            <filter id="overcastShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="3" dy="5" stdDeviation="3" floodColor="#1C2833" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Secondary Back Cloud */}
          <motion.path
            d="M 18,50 A 11,11 0 0,1 20,29 A 14,14 0 0,1 46,27 A 17,17 0 0,1 74,40 A 11,11 0 0,1 68,57 L 23,57 A 9,9 0 0,1 18,50 Z"
            fill="url(#backCloud)"
            style={{ transformOrigin: "46px 42px" }}
            animate={{ x: [-1, 1, -1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Primary Foreground Cloud */}
          <motion.path
            d="M 28,68 A 12,12 0 0,1 30,45 A 15,15 0 0,1 55,41 A 19,19 0 0,1 86,55 A 12,12 0 0,1 80,72 L 34,72 A 10,10 0 0,1 28,68 Z"
            fill="url(#frontCloud)"
            filter="url(#overcastShadow)"
            animate={{ scale: [1, 1.02, 1] }}
            transition={pulseTransition}
          />
        </motion.svg>
      );
    }

    case "foggy": {
      // Misty horizontal floating cylinders overlaying cloud
      return (
        <motion.svg
          id={`icon-foggy-${code}`}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className={className}
          animate={{ y: [0, -2, 0] }}
          transition={floatTransition}
        >
          <defs>
            <linearGradient id="fogCloud" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ECEFF1" />
              <stop offset="100%" stopColor="#AFBFC6" />
            </linearGradient>
            <linearGradient id="fogBar" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Cloud structure faded */}
          <path
            d="M 28,58 A 12,12 0 0,1 30,35 A 15,15 0 0,1 55,31 A 19,19 0 0,1 86,45 A 12,12 0 0,1 80,62 L 34,62 A 10,10 0 0,1 28,58 Z"
            fill="url(#fogCloud)"
            opacity="0.6"
          />

          {/* Animated Horizontal Fog Lines */}
          <motion.rect
            x="15"
            y="42"
            width="70"
            height="5"
            rx="2.5"
            fill="url(#fogBar)"
            animate={{ x: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.rect
            x="5"
            y="54"
            width="85"
            height="6"
            rx="3"
            fill="url(#fogBar)"
            animate={{ x: [6, -6, 6] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.rect
            x="20"
            y="66"
            width="60"
            height="5"
            rx="2.5"
            fill="url(#fogBar)"
            animate={{ x: [-4, 4, -4] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.svg>
      );
    }

    case "rainy": {
      // 3D cloud dropping animated rain cylinders
      return (
        <motion.svg
          id={`icon-rainy-${code}`}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className={className}
          animate={{ y: [0, -3, 0] }}
          transition={floatTransition}
        >
          <defs>
            <linearGradient id="rainCloud" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ECEFF1" />
              <stop offset="40%" stopColor="#90A4AE" />
              <stop offset="100%" stopColor="#455A64" />
            </linearGradient>
            <linearGradient id="rainDrop" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64B5F6" />
              <stop offset="100%" stopColor="#1565C0" />
            </linearGradient>
            <filter id="rainShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="2" dy="5" stdDeviation="3" floodColor="#1A252C" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Falling raindrops */}
          <g>
            {/* Drop 1 */}
            <motion.path
              d="M34,65 L32,77 A2,2 0 0,0 36,77 Z"
              fill="url(#rainDrop)"
              animate={{ y: [-15, 10], opacity: [0, 1, 0] }}
              transition={rainDropTransition(0)}
            />
            {/* Drop 2 */}
            <motion.path
              d="M48,65 L46,77 A2,2 0 0,0 50,77 Z"
              fill="url(#rainDrop)"
              animate={{ y: [-15, 10], opacity: [0, 1, 0] }}
              transition={rainDropTransition(0.4)}
            />
            {/* Drop 3 */}
            <motion.path
              d="M62,65 L60,77 A2,2 0 0,0 64,77 Z"
              fill="url(#rainDrop)"
              animate={{ y: [-15, 10], opacity: [0, 1, 0] }}
              transition={rainDropTransition(0.2)}
            />
            {/* Drop 4 */}
            <motion.path
              d="M74,65 L72,77 A2,2 0 0,0 76,77 Z"
              fill="url(#rainDrop)"
              animate={{ y: [-15, 10], opacity: [0, 1, 0] }}
              transition={rainDropTransition(0.6)}
            />
          </g>

          {/* Cloud cover on top */}
          <path
            d="M 28,58 A 12,12 0 0,1 30,35 A 15,15 0 0,1 55,31 A 19,19 0 0,1 86,45 A 12,12 0 0,1 80,62 L 34,62 A 10,10 0 0,1 28,58 Z"
            fill="url(#rainCloud)"
            filter="url(#rainShadow)"
          />
        </motion.svg>
      );
    }

    case "snowy": {
      // 3D cloud with falling spinning snowflakes
      return (
        <motion.svg
          id={`icon-snowy-${code}`}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className={className}
          animate={{ y: [0, -3, 0] }}
          transition={floatTransition}
        >
          <defs>
            <linearGradient id="snowCloud" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#CFD8DC" />
              <stop offset="100%" stopColor="#90A4AE" />
            </linearGradient>
            <filter id="snowShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="2" dy="5" stdDeviation="3.5" floodColor="#37474F" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Falling rotating snowflakes */}
          <g>
            {/* Snow 1 */}
            <motion.g
              animate={{ y: [-10, 15], opacity: [0, 1, 0], rotate: 360 }}
              transition={rainDropTransition(0)}
              style={{ transformOrigin: "35px 70px" }}
            >
              <path
                d="M 35,66 L 35,74 M 31,70 L 39,70 M 32,67 L 38,73 M 32,73 L 38,67"
                stroke="#E0F7FA"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </motion.g>

            {/* Snow 2 */}
            <motion.g
              animate={{ y: [-10, 15], opacity: [0, 1, 0], rotate: -360 }}
              transition={rainDropTransition(0.5)}
              style={{ transformOrigin: "53px 70px" }}
            >
              <path
                d="M 53,66 L 53,74 M 49,70 L 57,70 M 50,67 L 56,73 M 50,73 L 56,67"
                stroke="#E0F7FA"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </motion.g>

            {/* Snow 3 */}
            <motion.g
              animate={{ y: [-10, 15], opacity: [0, 1, 0], rotate: 180 }}
              transition={rainDropTransition(0.25)}
              style={{ transformOrigin: "70px 70px" }}
            >
              <path
                d="M 70,66 L 70,74 M 66,70 L 74,70 M 67,67 L 73,73 M 67,73 L 73,67"
                stroke="#E0F7FA"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </motion.g>
          </g>

          {/* Cloud body */}
          <path
            d="M 28,58 A 12,12 0 0,1 30,35 A 15,15 0 0,1 55,31 A 19,19 0 0,1 86,45 A 12,12 0 0,1 80,62 L 34,62 A 10,10 0 0,1 28,58 Z"
            fill="url(#snowCloud)"
            filter="url(#snowShadow)"
          />
        </motion.svg>
      );
    }

    case "stormy": {
      // Stormy dark clouds with a bright flashing neon yellow lightning bolt
      return (
        <motion.svg
          id={`icon-stormy-${code}`}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className={className}
          animate={{ y: [0, -3, 0] }}
          transition={floatTransition}
        >
          <defs>
            <linearGradient id="stormCloud" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#455A64" />
              <stop offset="50%" stopColor="#263238" />
              <stop offset="100%" stopColor="#1A237E" />
            </linearGradient>
            <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF59D" />
              <stop offset="30%" stopColor="#FFEE58" />
              <stop offset="100%" stopColor="#F57F17" />
            </linearGradient>
            <filter id="lightningGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#FFEB3B" floodOpacity="0.8" />
            </filter>
            <filter id="stormShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="3" dy="6" stdDeviation="3.5" floodColor="#0d131a" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Heavy rain cascading background */}
          <g opacity="0.4">
            <motion.line
              x1="35"
              y1="55"
              x2="31"
              y2="71"
              stroke="#90CAF9"
              strokeWidth="2"
              animate={{ y: [-10, 12], opacity: [0, 1, 0] }}
              transition={rainDropTransition(0.1)}
            />
            <motion.line
              x1="65"
              y1="55"
              x2="61"
              y2="71"
              stroke="#90CAF9"
              strokeWidth="2"
              animate={{ y: [-10, 12], opacity: [0, 1, 0] }}
              transition={rainDropTransition(0.5)}
            />
          </g>

          {/* Jagged Neon Lightning Bolt */}
          <motion.polygon
            points="55,42 43,62 50,62 40,84 62,58 52,58"
            fill="url(#lightningGrad)"
            filter="url(#lightningGlow)"
            animate={{
              opacity: [1, 0.4, 1, 0.3, 1, 0.8, 1],
              scale: [1, 0.95, 1.05, 1, 1.02, 0.98, 1],
            }}
            transition={lightningTransition}
          />

          {/* Storm Cloud Cover */}
          <path
            d="M 28,58 A 12,12 0 0,1 30,35 A 15,15 0 0,1 55,31 A 19,19 0 0,1 86,45 A 12,12 0 0,1 80,62 L 34,62 A 10,10 0 0,1 28,58 Z"
            fill="url(#stormCloud)"
            filter="url(#stormShadow)"
          />
        </motion.svg>
      );
    }
  }
}
