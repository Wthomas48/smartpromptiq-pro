interface BrainLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export default function BrainLogo({ size = 32, className = '', animate = false }: BrainLogoProps) {
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animate ? 'brain-logo-animate' : ''}
      >
        {/* Brain left hemisphere */}
        <path
          d="M20 30c-10 0-18 8-18 18v12c0 10 8 18 18 18h8c4 0 7-3 7-7V37c0-4-3-7-7-7h-8z"
          fill="url(#brainGradient1)"
          className="brain-left"
        />
        
        {/* Brain right hemisphere */}
        <path
          d="M80 30c10 0 18 8 18 18v12c0 10-8 18-18 18h-8c-4 0-7-3-7-7V37c0-4 3-7 7-7h8z"
          fill="url(#brainGradient2)"
          className="brain-right"
        />
        
        {/* Central connection */}
        <path
          d="M35 48h30c3 0 5-2 5-5v-6c0-3-2-5-5-5H35c-3 0-5 2-5 5v6c0 3 2 5 5 5z"
          fill="url(#brainGradientCenter)"
          className="brain-center"
        />
        
        {/* Enhanced brain details */}
        <path
          d="M22 35c-2 0-4 2-4 4v8c0 2 2 4 4 4h4v-16h-4z"
          fill="url(#brainDetailGradient1)"
          className="brain-detail"
          opacity="0.7"
        />
        <path
          d="M78 35c2 0 4 2 4 4v8c0 2-2 4-4 4h-4v-16h4z"
          fill="url(#brainDetailGradient2)"
          className="brain-detail"
          opacity="0.7"
        />
        
        {/* Neural connections - left side */}
        <circle cx="18" cy="42" r="1.8" fill="#0ea5e9" className="neural-dot" opacity="0.9">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0s"/>
        </circle>
        <circle cx="26" cy="38" r="1.2" fill="#06b6d4" className="neural-dot" opacity="0.7">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
        </circle>
        <circle cx="20" cy="55" r="1.5" fill="#7c3aed" className="neural-dot" opacity="0.8">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" begin="1s"/>
        </circle>
        <circle cx="24" cy="50" r="1" fill="#a855f7" className="neural-dot" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.7s" repeatCount="indefinite" begin="1.5s"/>
        </circle>
        
        {/* Neural connections - right side */}
        <circle cx="82" cy="42" r="1.8" fill="#0ea5e9" className="neural-dot" opacity="0.9">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2.2s" repeatCount="indefinite" begin="0.3s"/>
        </circle>
        <circle cx="74" cy="38" r="1.2" fill="#06b6d4" className="neural-dot" opacity="0.7">
          <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.8s" repeatCount="indefinite" begin="0.8s"/>
        </circle>
        <circle cx="80" cy="55" r="1.5" fill="#7c3aed" className="neural-dot" opacity="0.8">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.3s" repeatCount="indefinite" begin="1.2s"/>
        </circle>
        <circle cx="76" cy="50" r="1" fill="#a855f7" className="neural-dot" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.9s" repeatCount="indefinite" begin="1.8s"/>
        </circle>
        
        {/* Central neural activity */}
        <circle cx="50" cy="45" r="2.2" fill="#0ea5e9" className="neural-center" opacity="0.9">
          <animate attributeName="r" values="1.8;2.8;1.8" dur="1.8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;1;0.8" dur="1.8s" repeatCount="indefinite"/>
        </circle>
        
        {/* Neural pathways */}
        <path
          d="M25 48 Q35 45 45 48"
          stroke="url(#neuralGradient1)"
          strokeWidth="0.5"
          fill="none"
          className="neural-path"
          opacity="0.6"
        />
        <path
          d="M75 48 Q65 45 55 48"
          stroke="url(#neuralGradient2)"
          strokeWidth="0.5"
          fill="none"
          className="neural-path"
          opacity="0.6"
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="brainGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="brainGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="brainGradientCenter" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="brainDetailGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="brainDetailGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
          <linearGradient id="neuralGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" opacity="0.8"/>
            <stop offset="100%" stopColor="#0ea5e9" opacity="0.8"/>
          </linearGradient>
          <linearGradient id="neuralGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" opacity="0.8"/>
            <stop offset="100%" stopColor="#06b6d4" opacity="0.8"/>
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <style>
          {`
            .brain-logo-animate .brain-left {
              transform-origin: 25px 50px;
              animation: brainPulseLeft 4s ease-in-out infinite;
            }
            .brain-logo-animate .brain-right {
              transform-origin: 75px 50px;
              animation: brainPulseRight 4s ease-in-out infinite 0.5s;
            }
            .brain-logo-animate .brain-center {
              animation: brainGlow 3s ease-in-out infinite;
            }
            .neural-path {
              stroke-dasharray: 2,2;
              animation: neuralFlow 2s linear infinite;
            }
            
            @keyframes brainPulseLeft {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            
            @keyframes brainPulseRight {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            
            @keyframes brainGlow {
              0%, 100% { filter: brightness(1); }
              50% { filter: brightness(1.3); }
            }
            
            @keyframes neuralFlow {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: 4; }
            }
          `}
        </style>
      </svg>
    </div>
  );
}