import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 24, className = "" }) => {
  return (
    <div 
      className={`bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.6 }}>
        S
      </span>
    </div>
  );
};

export default Logo;
