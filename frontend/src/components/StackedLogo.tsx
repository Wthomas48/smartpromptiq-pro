import React from 'react';

interface StackedLogoProps {
  size?: number;
  className?: string;
}

const StackedLogo: React.FC<StackedLogoProps> = ({ 
  size = 120,
  className = "" 
}) => {
  const logoSize = size;
  const textSize = size > 100 ? "text-4xl" : size > 60 ? "text-2xl" : "text-xl";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={logoSize}
        height={logoSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-4"
      >
        {/* Left brain hemisphere */}
        <path
          d="M15 25C10 20 10 30 15 35C10 40 10 50 15 55C10 60 10 70 15 75C20 80 30 80 35 75C40 80 45 75 45 70L45 30C45 25 40 20 35 25C30 20 20 20 15 25Z"
          fill="none"
          stroke="#E879B9"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Right brain hemisphere */}
        <path
          d="M85 25C90 20 90 30 85 35C90 40 90 50 85 55C90 60 90 70 85 75C80 80 70 80 65 75C60 80 55 75 55 70L55 30C55 25 60 20 65 25C70 20 80 20 85 25Z"
          fill="none"
          stroke="#E879B9"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Center section */}
        <rect
          x="45"
          y="25"
          width="10"
          height="50"
          fill="none"
          stroke="#E879B9"
          strokeWidth="6"
          strokeLinecap="round"
          rx="5"
        />
        
        {/* Brain fold details */}
        <path
          d="M20 35C25 30 30 35 35 30"
          fill="none"
          stroke="#E879B9"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M20 50C25 45 30 50 35 45"
          fill="none"
          stroke="#E879B9"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M20 65C25 60 30 65 35 60"
          fill="none"
          stroke="#E879B9"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M80 35C75 30 70 35 65 30"
          fill="none"
          stroke="#E879B9"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M80 50C75 45 70 50 65 45"
          fill="none"
          stroke="#E879B9"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M80 65C75 60 70 65 65 60"
          fill="none"
          stroke="#E879B9"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      <div className="text-center">
        <div className={`font-bold text-gray-800 ${textSize} leading-tight`}>
          Smart
        </div>
        <div className={`font-bold text-gray-800 ${textSize} leading-tight`}>
          PromptIQ
        </div>
      </div>
    </div>
  );
};

export default StackedLogo;
