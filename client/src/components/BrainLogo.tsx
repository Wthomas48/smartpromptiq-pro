interface BrainLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
  variant?: 'filled' | 'outline' | 'gradient';
  showText?: boolean;
}

export default function BrainLogo({
  size = 32,
  className = '',
  animate = false,
  variant = 'gradient',
  showText = false
}: BrainLogoProps) {
  const uniqueId = `brain-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className={`inline-flex items-center ${className}`}
      style={{ width: showText ? 'auto' : size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animate ? 'brain-animate' : ''}
        style={{ display: 'block' }}
      >
        {/* Transparent background - no fill */}

        {/* Brain silhouette - clean recognizable shape */}
        <g className="brain-shape">
          {/* Left hemisphere */}
          <path
            d="M32 8
               C24 8, 18 10, 14 16
               C10 22, 8 28, 10 34
               C8 36, 6 40, 8 44
               C10 48, 12 50, 16 52
               C18 56, 24 58, 32 58"
            fill={variant === 'outline' ? 'none' : `url(#${uniqueId}-leftGrad)`}
            stroke={variant === 'outline' ? `url(#${uniqueId}-strokeGrad)` : 'none'}
            strokeWidth="2"
            className="hemisphere-left"
          />

          {/* Right hemisphere */}
          <path
            d="M32 8
               C40 8, 46 10, 50 16
               C54 22, 56 28, 54 34
               C56 36, 58 40, 56 44
               C54 48, 52 50, 48 52
               C46 56, 40 58, 32 58"
            fill={variant === 'outline' ? 'none' : `url(#${uniqueId}-rightGrad)`}
            stroke={variant === 'outline' ? `url(#${uniqueId}-strokeGrad)` : 'none'}
            strokeWidth="2"
            className="hemisphere-right"
          />

          {/* Brain stem */}
          <path
            d="M28 54 Q32 60, 36 54"
            fill={variant === 'outline' ? 'none' : `url(#${uniqueId}-stemGrad)`}
            stroke={variant === 'outline' ? `url(#${uniqueId}-strokeGrad)` : 'none'}
            strokeWidth="2"
          />
        </g>

        {/* Brain folds/gyri - left side */}
        <g className="brain-folds" opacity="0.9">
          <path
            d="M14 24 Q22 20, 30 24"
            stroke={variant === 'outline' ? `url(#${uniqueId}-foldGrad1)` : 'rgba(255,255,255,0.5)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M12 34 Q20 30, 30 34"
            stroke={variant === 'outline' ? `url(#${uniqueId}-foldGrad1)` : 'rgba(255,255,255,0.4)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M14 44 Q22 40, 30 44"
            stroke={variant === 'outline' ? `url(#${uniqueId}-foldGrad1)` : 'rgba(255,255,255,0.35)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Brain folds - right side */}
          <path
            d="M34 24 Q42 20, 50 24"
            stroke={variant === 'outline' ? `url(#${uniqueId}-foldGrad2)` : 'rgba(255,255,255,0.5)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M34 34 Q44 30, 52 34"
            stroke={variant === 'outline' ? `url(#${uniqueId}-foldGrad2)` : 'rgba(255,255,255,0.4)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M34 44 Q42 40, 50 44"
            stroke={variant === 'outline' ? `url(#${uniqueId}-foldGrad2)` : 'rgba(255,255,255,0.35)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Center divider line */}
        <path
          d="M32 10 L32 56"
          stroke={variant === 'outline' ? `url(#${uniqueId}-centerGrad)` : 'rgba(255,255,255,0.25)'}
          strokeWidth="1"
          strokeDasharray="2,2"
          className="center-line"
        />

        {/* IQ Spark - the intelligence indicator */}
        <g className="iq-spark">
          <circle
            cx="32"
            cy="32"
            r="5"
            fill={`url(#${uniqueId}-sparkGrad)`}
            className="spark-core"
          >
            {animate && (
              <>
                <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
              </>
            )}
          </circle>

          {/* Spark glow */}
          <circle
            cx="32"
            cy="32"
            r="8"
            fill={`url(#${uniqueId}-glowGrad)`}
            opacity="0.4"
            className="spark-glow"
          >
            {animate && (
              <animate attributeName="r" values="7;10;7" dur="2s" repeatCount="indefinite"/>
            )}
          </circle>
        </g>

        {/* Neural dots for "smart" effect */}
        <g className="neural-dots">
          <circle cx="20" cy="20" r="2" fill="#a855f7" opacity="0.8">
            {animate && <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0s"/>}
          </circle>
          <circle cx="44" cy="20" r="2" fill="#0ea5e9" opacity="0.8">
            {animate && <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0.3s"/>}
          </circle>
          <circle cx="18" cy="38" r="1.5" fill="#c084fc" opacity="0.7">
            {animate && <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.8s" repeatCount="indefinite" begin="0.5s"/>}
          </circle>
          <circle cx="46" cy="38" r="1.5" fill="#22d3ee" opacity="0.7">
            {animate && <animate attributeName="opacity" values="0.4;0.9;0.4" dur="1.8s" repeatCount="indefinite" begin="0.8s"/>}
          </circle>
        </g>

        {/* Gradient definitions */}
        <defs>
          {/* Left hemisphere gradient - purple */}
          <linearGradient id={`${uniqueId}-leftGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7"/>
            <stop offset="50%" stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#7c3aed"/>
          </linearGradient>

          {/* Right hemisphere gradient - cyan to purple */}
          <linearGradient id={`${uniqueId}-rightGrad`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4"/>
            <stop offset="50%" stopColor="#0ea5e9"/>
            <stop offset="100%" stopColor="#8b5cf6"/>
          </linearGradient>

          {/* Brain stem gradient */}
          <linearGradient id={`${uniqueId}-stemGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed"/>
            <stop offset="100%" stopColor="#0ea5e9"/>
          </linearGradient>

          {/* Outline stroke gradient */}
          <linearGradient id={`${uniqueId}-strokeGrad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7"/>
            <stop offset="50%" stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#0ea5e9"/>
          </linearGradient>

          {/* Fold gradients */}
          <linearGradient id={`${uniqueId}-foldGrad1`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c084fc"/>
            <stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
          <linearGradient id={`${uniqueId}-foldGrad2`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9"/>
            <stop offset="100%" stopColor="#22d3ee"/>
          </linearGradient>

          {/* Center line gradient */}
          <linearGradient id={`${uniqueId}-centerGrad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.3"/>
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3"/>
          </linearGradient>

          {/* Spark gradient - golden/yellow for "intelligence" */}
          <radialGradient id={`${uniqueId}-sparkGrad`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fef08a"/>
            <stop offset="50%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#f59e0b"/>
          </radialGradient>

          {/* Spark glow */}
          <radialGradient id={`${uniqueId}-glowGrad`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
          </radialGradient>
        </defs>

        <style>
          {`
            .brain-animate .brain-shape {
              animation: brainPulse 3s ease-in-out infinite;
              transform-origin: 32px 32px;
            }

            .brain-animate .spark-core {
              filter: drop-shadow(0 0 4px #fbbf24);
            }

            @keyframes brainPulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
          `}
        </style>
      </svg>

      {showText && (
        <span
          className="ml-3 font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent"
          style={{ fontSize: size * 0.4 }}
        >
          SmartPromptIQ
        </span>
      )}
    </div>
  );
}
