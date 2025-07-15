// src/components/Logo.tsx
import React from 'react';
import { Brain } from 'lucide-react';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 32, 
  variant = 'full',
  className = ''
}) => {
  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <Brain 
            className="text-white" 
            style={{ width: size * 0.6, height: size * 0.6 }} 
          />
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center ${className}`}>
        <span 
          className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          style={{ fontSize: size * 0.8 }}
        >
          SmartPromptIQ
        </span>
      </div>
    );
  }

  // Full variant (default)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Brain 
          className="text-white" 
          style={{ width: size * 0.6, height: size * 0.6 }} 
        />
      </div>
      <span 
        className="font-bold text-gray-900"
        style={{ fontSize: size * 0.6 }}
      >
        SmartPromptIQ
      </span>
    </div>
  );
};

export default Logo;