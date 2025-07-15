import React from 'react';
import { Brain } from 'lucide-react';

interface AppLogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ 
  variant = 'full', 
  size = 'md', 
  className = '' 
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  if (variant === 'icon') {
    return (
      <div className={className}>
        <Brain className={`${sizeMap[size]} text-indigo-600`} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Brain className={`${sizeMap[size]} text-indigo-600`} />
      <span className="font-bold text-gray-900 text-xl">SmartPromptIQ</span>
    </div>
  );
};

export default AppLogo;
