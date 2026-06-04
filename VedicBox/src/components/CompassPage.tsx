import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Navigation, AlertCircle, Info } from 'lucide-react';

const directions = [
  { angle: 0, label: 'N', full: 'North (उत्तर)', color: 'text-red-500', tip: 'Place Kuber Yantra here for wealth. Keep this area open and clutter-free.' },
  { angle: 45, label: 'NE', full: 'Northeast (ईशान)', color: 'text-blue-500', tip: 'Most sacred direction. Best for puja room and water elements. Keep it clean and light.' },
  { angle: 90, label: 'E', full: 'East (पूर्व)', color: 'text-amber-500', tip: 'Direction of Sun. Main entrance here is auspicious. Good for study room.' },
  { angle: 135, label: 'SE', full: 'Southeast (आग्नेय)', color: 'text-orange-500', tip: 'Fire element. Ideal for kitchen. Place electrical appliances here.' },
  { angle: 180, label: 'S', full: 'South (दक्षिण)', color: 'text-green-600', tip: 'Direction of Yama. Avoid main entrance. Good for master bedroom.' },
  { angle: 225, label: 'SW', full: 'Southwest (नैऋत्य)', color: 'text-purple-500', tip: 'Earth element. Best for master bedroom. Keep this area heavy and stable.' },
  { angle: 270, label: 'W', full: 'West (पश्चिम)', color: 'text-indigo-500', tip: 'Good for dining area and children\'s room. Avoid toilets here.' },
  { angle: 315, label: 'NW', full: 'Northwest (वायव्य)', color: 'text-teal-500', tip: 'Air element. Guest room and garage are ideal here. Good for storage.' },
];

function getDirection(heading: number) {
  const normalized = ((heading % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return directions[index];
}

export default function CompassPage() {
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionNeeded, setPermissionNeeded] = useState(false);
  const [selectedDir, setSelectedDir] = useState<typeof directions[0] | null>(null);
  const [manualAngle, setManualAngle] = useState(0);
  const [useManual, setUseManual] = useState(false);
  const animFrame = useRef<number>(undefined);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let alpha: number | null = null;

    // iOS
    if ((event as any).webkitCompassHeading !== undefined) {
      alpha = (event as any).webkitCompassHeading;
    }
    // Android
    else if (event.alpha !== null) {
      alpha = (360 - event.alpha) % 360;
    }

    if (alpha !== null) {
      setHeading(Math.round(alpha));
      setUseManual(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      // iOS 13+ requires permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          setPermissionNeeded(false);
        } else {
          setError('Permission denied. Using manual compass.');
          setUseManual(true);
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    } catch (e) {
      setError('Compass not available. Using manual mode.');
      setUseManual(true);
    }
  }, [handleOrientation]);

  useEffect(() => {
    // Check if DeviceOrientation is available
    if (!('DeviceOrientationEvent' in window)) {
      setError('Compass not supported on this device. Use manual mode below.');
      setUseManual(true);
      return;
    }

    // Check if permission is needed (iOS)
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setPermissionNeeded(true);
    } else {
      window.addEventListener('deviceorientation', handleOrientation, true);

      // If no heading after 2 seconds, fall back to manual
      const timeout = setTimeout(() => {
        if (heading === null) {
          setUseManual(true);
          setError('No compass data received. Use manual mode or try on a mobile device.');
        }
      }, 2000);

      return () => {
        clearTimeout(timeout);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      };
    }
  }, [handleOrientation, heading]);

  useEffect(() => {
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  const currentHeading = useManual ? manualAngle : (heading ?? 0);
  const currentDir = getDirection(currentHeading);

  return (
    <div className="pb-20">
      <div className="px-4 py-4">
        <h2 className="font-display font-bold text-lg text-gray-800">🧭 Vastu Compass</h2>
        <p className="text-xs text-gray-400">Find directions for Vastu placement & remedies</p>
      </div>

      {/* Permission Banner */}
      {permissionNeeded && (
        <div className="px-4 mb-4">
          <button
            onClick={requestPermission}
            className="w-full bg-gradient-to-r from-saffron-500 to-gold-500 text-white rounded-2xl p-4 text-center"
          >
            <Navigation size={24} className="mx-auto mb-2" />
            <p className="font-semibold text-sm">Tap to Enable Compass</p>
            <p className="text-white/70 text-[10px] mt-1">Allow access to device orientation sensor</p>
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="px-4 mb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-amber-700">{error}</p>
          </div>
        </div>
      )}

      {/* Compass */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }} />

          {/* Heading Display */}
          <div className="text-center mb-4 relative">
            <p className="text-5xl font-bold text-white font-mono">{currentHeading}°</p>
            <p className={`text-lg font-bold mt-1 ${currentDir.color}`}>{currentDir.full}</p>
          </div>

          {/* Compass Rose */}
          <div className="relative w-64 h-64 mx-auto">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-2 rounded-full border border-white/5" />

            {/* Rotating compass face */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: -currentHeading }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            >
              {/* Direction markers */}
              {directions.map((dir) => {
                const isCardinal = ['N', 'S', 'E', 'W'].includes(dir.label);
                return (
                  <div
                    key={dir.label}
                    className="absolute left-1/2 top-0 h-1/2 -ml-px origin-bottom"
                    style={{ transform: `rotate(${dir.angle}deg)` }}
                  >
                    <div
                      className={`absolute -top-1 left-1/2 -translate-x-1/2 text-center`}
                      style={{ transform: `rotate(${-dir.angle + currentHeading}deg)` }}
                    >
                      <span className={`font-bold ${isCardinal ? 'text-sm' : 'text-[10px]'} ${
                        dir.label === 'N' ? 'text-red-400' : 'text-white/70'
                      }`}>
                        {dir.label}
                      </span>
                    </div>
                    {/* Tick mark */}
                    <div className={`absolute top-6 left-1/2 -translate-x-1/2 ${
                      isCardinal ? 'w-0.5 h-4 bg-white/40' : 'w-px h-3 bg-white/20'
                    }`} />
                  </div>
                );
              })}

              {/* Small degree ticks */}
              {Array.from({ length: 72 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-0 h-1/2 -ml-px origin-bottom"
                  style={{ transform: `rotate(${i * 5}deg)` }}
                >
                  <div className={`absolute top-4 left-1/2 -translate-x-1/2 ${
                    i % 9 === 0 ? 'w-px h-2 bg-white/30' : 'w-px h-1 bg-white/10'
                  }`} />
                </div>
              ))}
            </motion.div>

            {/* Center needle (fixed) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* North arrow */}
              <div className="absolute top-6">
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[20px] border-l-transparent border-r-transparent border-b-red-500" />
              </div>
              {/* South arrow */}
              <div className="absolute bottom-6">
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[16px] border-l-transparent border-r-transparent border-t-white/30" />
              </div>
              {/* Center dot */}
              <div className="w-4 h-4 rounded-full bg-white shadow-lg shadow-white/50" />
            </div>
          </div>

          {/* Manual Slider */}
          {useManual && (
            <div className="mt-4 relative">
              <p className="text-white/50 text-[10px] text-center mb-2">↔ Drag to set direction manually</p>
              <input
                type="range"
                min={0}
                max={359}
                value={manualAngle}
                onChange={(e) => setManualAngle(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Direction Info Cards */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
          <Info size={14} className="text-saffron-500" />
          Current Direction Vastu Tip
        </h3>
        <div className="bg-white rounded-2xl p-4 border border-saffron-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
              currentDir.label === 'N' ? 'from-red-400 to-red-600' :
              currentDir.label === 'NE' ? 'from-blue-400 to-blue-600' :
              currentDir.label === 'E' ? 'from-amber-400 to-amber-600' :
              currentDir.label === 'SE' ? 'from-orange-400 to-orange-600' :
              currentDir.label === 'S' ? 'from-green-400 to-green-600' :
              currentDir.label === 'SW' ? 'from-purple-400 to-purple-600' :
              currentDir.label === 'W' ? 'from-indigo-400 to-indigo-600' :
              'from-teal-400 to-teal-600'
            } flex items-center justify-center text-white font-bold text-sm`}>
              {currentDir.label}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">{currentDir.full}</p>
              <p className="text-[10px] text-gray-400">{currentHeading}°</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{currentDir.tip}</p>
        </div>
      </div>

      {/* All Directions Guide */}
      <div className="px-4 mb-4">
        <h3 className="font-display font-bold text-gray-800 text-sm mb-3">📐 All Directions & Vastu Tips</h3>
        <div className="grid grid-cols-2 gap-2">
          {directions.map((dir) => (
            <button
              key={dir.label}
              onClick={() => {
                setSelectedDir(selectedDir?.label === dir.label ? null : dir);
                if (useManual) setManualAngle(dir.angle);
              }}
              className={`rounded-xl p-3 text-left transition-all border ${
                selectedDir?.label === dir.label
                  ? 'border-saffron-300 bg-saffron-50 shadow-md'
                  : currentDir.label === dir.label
                  ? 'border-saffron-200 bg-saffron-50/50'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-bold text-sm ${dir.color}`}>{dir.label}</span>
                <span className="text-[10px] text-gray-400">{dir.angle}°</span>
              </div>
              <p className="text-[10px] text-gray-500 line-clamp-2">{dir.full}</p>
              {selectedDir?.label === dir.label && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-[10px] text-saffron-700 mt-2 leading-relaxed"
                >
                  💡 {dir.tip}
                </motion.p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Vastu Quick Guide */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-saffron-500 to-gold-500 rounded-2xl p-4">
          <h3 className="text-white font-display font-bold text-sm mb-2">🕉️ Quick Vastu Placement Guide</h3>
          <div className="space-y-1.5">
            {[
              { room: 'Puja Room', dir: 'Northeast (NE)', emoji: '🪔' },
              { room: 'Kitchen', dir: 'Southeast (SE)', emoji: '🍳' },
              { room: 'Master Bedroom', dir: 'Southwest (SW)', emoji: '🛏️' },
              { room: 'Main Entrance', dir: 'North or East', emoji: '🚪' },
              { room: 'Study Room', dir: 'East or North', emoji: '📚' },
              { room: 'Toilet', dir: 'West or NW', emoji: '🚿' },
            ].map((item) => (
              <div key={item.room} className="flex items-center justify-between bg-white/15 rounded-lg px-3 py-2">
                <span className="text-white text-[11px]">{item.emoji} {item.room}</span>
                <span className="text-white/80 text-[10px] font-semibold">{item.dir}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
