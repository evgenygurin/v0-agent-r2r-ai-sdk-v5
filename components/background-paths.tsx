import React from 'react';

const BackgroundPaths: React.FC = () => {
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
        {Array.from({ length: 10 }).map((_, i) => (
          <path
            key={i}
            d={`M${Math.random() * 100} 0 Q ${Math.random() * 100} ${Math.random() * 100} ${Math.random() * 100} 100`}
            fill="none"
            stroke={`hsl(${200 + i * 5} 50% 80%)`}
            strokeWidth="2"
            opacity={`${0.2 + Math.random() * 0.3}`}
            className="animate-draw-path"
            style={{
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
              transformOrigin: 'center',
              transformBox: 'fill-box',
            }}
          >
            <animate
              attributeName="stroke-dasharray"
              from="0 1000"
              to="1000 0"
              dur={`${5 + Math.random() * 5}s`}
              repeatCount="indefinite"
            />
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to={`${Math.random() * 20 - 10} ${Math.random() * 20 - 10}`}
              dur={`${10 + Math.random() * 10}s`}
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