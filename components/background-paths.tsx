import React, { useState, useEffect } from 'react';

interface PathData {
  d: string;
  stroke: string;
  opacity: string;
  animationDelay: string;
  animationDuration: string;
  animateDur: string;
  animateTransformTo: string;
  animateTransformDur: string;
}

const BackgroundPaths: React.FC = () => {
  const [paths, setPaths] = useState<PathData[]>([]);

  useEffect(() => {
    const generatedPaths: PathData[] = Array.from({ length: 10 }).map((_, i) => {
      const random1 = Math.random();
      const random2 = Math.random();
      const random3 = Math.random();
      const random4 = Math.random();
      const random5 = Math.random();
      const random6 = Math.random();
      const random7 = Math.random();
      const random8 = Math.random();
      const random9 = Math.random();
      const random10 = Math.random();

      return {
        d: `M${random1 * 100} 0 Q ${random2 * 100} ${random3 * 100} ${random4 * 100} 100`,
        stroke: `hsl(${200 + i * 5} 50% 80%)`,
        opacity: `${0.2 + random5 * 0.3}`,
        animationDelay: `${i * 0.5}s`,
        animationDuration: `${5 + random6 * 5}s`,
        animateDur: `${5 + random7 * 5}s`,
        animateTransformTo: `${random8 * 20 - 10} ${random9 * 20 - 10}`,
        animateTransformDur: `${10 + random10 * 10}s`,
      };
    });
    setPaths(generatedPaths);
  }, []);

  if (paths.length === 0) {
    return null; // Render nothing until paths are generated on the client
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(210 40% 96.1%)" />
            <stop offset="100%" stopColor="hsl(220 14.3% 95.9%)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#gradient)" />
        {/* Animated paths */}
        {paths.map((path, i) => (
          <path
            key={i}
            d={path.d}
            fill="none"
            stroke={path.stroke}
            strokeWidth="2"
            opacity={path.opacity}
            className="animate-draw-path"
            style={{
              animationDelay: path.animationDelay,
              animationDuration: path.animationDuration,
              transformOrigin: 'center',
              transformBox: 'fill-box',
            }}
          >
            <animate
              attributeName="stroke-dasharray"
              from="0 1000"
              to="1000 0"
              dur={path.animateDur}
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to={path.animateTransformTo}
              dur={path.animateTransformDur}
              repeatCount="indefinite"
              additive="sum"
            />
          </path>
        ))}
      </svg>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white opacity-50"></div>
    </div>
  );
};

export default BackgroundPaths;