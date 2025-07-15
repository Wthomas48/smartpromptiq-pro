import React from 'react';

interface BrainLogoProps {
  className?: string;
  size?: number;
  variant?: 'detailed' | 'simple' | 'minimal';
  color?: string;
}

export default function BrainLogo({ 
  className = '', 
  size = 32, 
  variant = 'detailed',
  color = '#e91e63' // Your exact pink color
}: BrainLogoProps) {
  
  // Detailed brain outline (matching your exact design)
  if (variant === 'detailed') {
    return (
      <div className={className}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main brain outline - your exact shape */}
          <path 
            d="M60 15 
               C 45 15, 35 25, 35 40
               C 30 35, 20 37, 18 45
               C 16 53, 22 57, 25 59
               C 20 63, 18 70, 22 75
               C 25 80, 32 81, 35 80
               C 35 90, 45 100, 60 100
               C 75 100, 85 90, 85 80
               C 88 81, 95 80, 98 75
               C 102 70, 100 63, 95 59
               C 98 57, 104 53, 102 45
               C 100 37, 90 35, 85 40
               C 85 25, 75 15, 60 15 Z" 
            stroke={color} 
            strokeWidth="4" 
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          
          {/* Left hemisphere curves */}
          <path 
            d="M 42 40 C 47 35, 52 37, 55 41 C 53 45, 50 50, 53 55 C 50 60, 47 65, 50 70"
            stroke={color} 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round"
          />
          
          <path 
            d="M 35 55 C 40 52, 45 56, 48 53 C 46 58, 43 63, 46 68"
            stroke={color} 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round"
          />
          
          {/* Right hemisphere curves */}
          <path 
            d="M 78 40 C 73 35, 68 37, 65 41 C 67 45, 70 50, 67 55 C 70 60, 73 65, 70 70"
            stroke={color} 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round"
          />
          
          <path 
            d="M 85 55 C 80 52, 75 56, 72 53 C 74 58, 77 63, 74 68"
            stroke={color} 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round"
          />
          
          {/* Central dividing line */}
          <path 
            d="M 60 20 L 60 95"
            stroke={color} 
            strokeWidth="4" 
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Additional brain fold details */}
          <path 
            d="M 45 35 C 50 32, 55 36, 58 33"
            stroke={color} 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round"
          />
          
          <path 
            d="M 75 35 C 70 32, 65 36, 62 33"
            stroke={color} 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }
  
  // Simple brain outline (cleaner for smaller sizes)
  if (variant === 'simple') {
    return (
      <div className={className}>
        <svg
          width={size}
          height={size * 0.85}
          viewBox="0 0 120 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simplified version of your brain shape */}
          <path 
            d="M60 10 
               C 45 10, 35 20, 35 35
               C 30 30, 20 32, 18 40
               C 16 48, 22 52, 25 54
               C 20 58, 18 65, 22 70
               C 25 75, 32 76, 35 75
               C 35 85, 45 95, 60 95
               C 75 95, 85 85, 85 75
               C 88 76, 95 75, 98 70
               C 102 65, 100 58, 95 54
               C 98 52, 104 48, 102 40
               C 100 32, 90 30, 85 35
               C 85 20, 75 10, 60 10 Z" 
            stroke={color} 
            strokeWidth="3" 
            fill="none"
            strokeLinejoin="round"
          />
          
          {/* Central line */}
          <path 
            d="M60 15 L60 90" 
            stroke={color} 
            strokeWidth="2.5" 
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Basic hemisphere curves */}
          <path 
            d="M 40 35 C 45 30, 50 32, 53 36 C 51 40, 48 45, 51 50"
            stroke={color} 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
          />
          
          <path 
            d="M 80 35 C 75 30, 70 32, 67 36 C 69 40, 72 45, 69 50"
            stroke={color} 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }
  
  // Minimal brain (for very small icons)
  if (variant === 'minimal') {
    return (
      <div className={className}>
        <svg
          width={size}
          height={size * 0.8}
          viewBox="0 0 100 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Very simple brain outline */}
          <path 
            d="M50 10 
               C 35 10, 25 20, 25 35
               C 20 30, 10 32, 8 40
               C 6 48, 12 52, 15 54
               C 10 58, 8 65, 12 70
               C 15 75, 22 76, 25 75
               C 25 80, 35 85, 50 85
               C 65 85, 75 80, 75 75
               C 78 76, 85 75, 88 70
               C 92 65, 90 58, 85 54
               C 88 52, 94 48, 92 40
               C 90 32, 80 30, 75 35
               C 75 20, 65 10, 50 10 Z" 
            stroke={color} 
            strokeWidth="2.5" 
            fill="none"
            strokeLinejoin="round"
          />
          
          {/* Central line only */}
          <path 
            d="M50 15 L50 75" 
            stroke={color} 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }
  
  return null;
}

// Alternative: Icon-style brain for buttons (matching your design)
export function BrainIcon({ 
  size = 20, 
  color = '#e91e63', // Your exact pink color
  className = '' 
}: { 
  size?: number; 
  color?: string; 
  className?: string; 
}) {
  return (
    <svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2
           C 9 2, 7 4, 7 7
           C 6 6, 4 6.5, 3.5 8
           C 3 9.5, 4 10.5, 4.5 11
           C 3.5 11.5, 3 13, 3.5 14.5
           C 4 16, 5.5 16.5, 6.5 16
           C 6.5 17.5, 8.5 19, 12 19
           C 15.5 19, 17.5 17.5, 17.5 16
           C 18.5 16.5, 20 16, 20.5 14.5
           C 21 13, 20.5 11.5, 19.5 11
           C 20 10.5, 21 9.5, 20.5 8
           C 20 6.5, 18 6, 17 7
           C 17 4, 15 2, 12 2 Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M12 3 L12 17"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M 8 7 C 9 6, 10 7, 11 6.5"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 16 7 C 15 6, 14 7, 13 6.5"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}