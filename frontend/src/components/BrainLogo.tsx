import React from 'react';
import { Brain } from 'lucide-react';

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
  return <Brain size={size} className={className} />;
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