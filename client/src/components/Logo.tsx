import React from 'react';
import BrainLogo from './BrainLogo';

interface LogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 24, className = "", animate = false }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <BrainLogo size={size} animate={animate} />
    </div>
  );
};

export default Logo;
