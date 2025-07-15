import React from 'react';

interface BrainLogoProps {
  size?: number;
  variant?: 'full' | 'minimal';
  className?: string;
}

interface BrainIconProps {
  size?: number;
  className?: string;
}

export const BrainIcon: React.FC<BrainIconProps> = ({ size = 24, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id={`brainGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      
      {/* Left brain hemisphere */}
      <path
        d="M15 25C10 20 12 35 15 40C10 45 12 60 15 65C10 70 15 80 25 75C30 80 35 75 40 70C42 65 45 60 45 50L45 30C45 25 40 20 35 25C30 20 20 20 15 25Z"
        fill="none"
        stroke={`url(#brainGradient-${size})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Right brain hemisphere */}
      <path
        d="M85 25C90 20 88 35 85 40C90 45 88 60 85 65C90 70 85 80 75 75C70 80 65 75 60 70C58 65 55 60 55 50L55 30C55 25 60 20 65 25C70 20 80 20 85 25Z"
        fill="none"
        stroke={`url(#brainGradient-${size})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Center connections */}
      <line x1="45" y1="35" x2="55" y2="35" stroke={`url(#brainGradient-${size})`} strokeWidth="2" />
      <line x1="45" y1="50" x2="55" y2="50" stroke={`url(#brainGradient-${size})`} strokeWidth="2" />
      <line x1="45" y1="65" x2="55" y2="65" stroke={`url(#brainGradient-${size})`} strokeWidth="2" />
      
      {/* Circuit nodes */}
      <circle cx="25" cy="35" r="2" fill="#06B6D4" />
      <circle cx="35" cy="45" r="2" fill="#06B6D4" />
      <circle cx="25" cy="60" r="2" fill="#06B6D4" />
      <circle cx="75" cy="35" r="2" fill="#3B82F6" />
      <circle cx="65" cy="45" r="2" fill="#3B82F6" />
      <circle cx="75" cy="60" r="2" fill="#3B82F6" />
      
      {/* Circuit connections */}
      <line x1="25" y1="35" x2="35" y2="45" stroke="#06B6D4" strokeWidth="2" />
      <line x1="35" y1="45" x2="25" y2="60" stroke="#06B6D4" strokeWidth="2" />
      <line x1="75" y1="35" x2="65" y2="45" stroke="#3B82F6" strokeWidth="2" />
      <line x1="65" y1="45" x2="75" y2="60" stroke="#3B82F6" strokeWidth="2" />
    </svg>
  );
};

const BrainLogo: React.FC<BrainLogoProps> = ({ 
  size = 48, 
  variant = 'full', 
  className = "" 
}) => {
  if (variant === 'minimal') {
    return <BrainIcon size={size} className={className} />;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <BrainIcon size={size} className="text-indigo-600" />
      <span className="text-xl font-bold text-gray-900">SmartPromptIQ</span>
    </div>
  );
};

export default BrainLogo;