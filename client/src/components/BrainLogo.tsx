interface BrainLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
  variant?: 'filled' | 'outline' | 'minimal';
  showText?: boolean;
}

export default function BrainLogo({
  size = 32,
  className = '',
  animate = false,
  variant = 'filled',
  showText = false
}: BrainLogoProps) {
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: showText ? 'auto' : size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animate ? 'brain-logo-animate' : ''}
      >
        {/* Background glow circle */}
        {variant === 'filled' && (
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="url(#bgGlow)"
            opacity="0.15"
          />
        )}

        {/* Main brain shape - cleaner, more iconic */}
        <g className="brain-main-group">
          {/* Left hemisphere */}
          <path
            d="M50 20
               C35 20, 22 28, 20 42
               C18 52, 22 62, 28 70
               C32 76, 40 80, 50 80"
            fill={variant === 'filled' ? "url(#leftHemisphere)" : "none"}
            stroke={variant !== 'filled' ? "url(#strokeGradient)" : "none"}
            strokeWidth={variant !== 'filled' ? "2.5" : "0"}
            className="hemisphere-left"
          />

          {/* Right hemisphere */}
          <path
            d="M50 20
               C65 20, 78 28, 80 42
               C82 52, 78 62, 72 70
               C68 76, 60 80, 50 80"
            fill={variant === 'filled' ? "url(#rightHemisphere)" : "none"}
            stroke={variant !== 'filled' ? "url(#strokeGradient)" : "none"}
            strokeWidth={variant !== 'filled' ? "2.5" : "0"}
            className="hemisphere-right"
          />

          {/* Brain folds - left */}
          <path
            d="M28 38 Q38 32, 48 38"
            stroke="url(#foldStroke1)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
            className="brain-fold"
          />
          <path
            d="M24 50 Q36 44, 48 50"
            stroke="url(#foldStroke1)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
            className="brain-fold"
          />
          <path
            d="M28 62 Q38 56, 48 62"
            stroke="url(#foldStroke1)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
            className="brain-fold"
          />

          {/* Brain folds - right */}
          <path
            d="M52 38 Q62 32, 72 38"
            stroke="url(#foldStroke2)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
            className="brain-fold"
          />
          <path
            d="M52 50 Q64 44, 76 50"
            stroke="url(#foldStroke2)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
            className="brain-fold"
          />
          <path
            d="M52 62 Q62 56, 72 62"
            stroke="url(#foldStroke2)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
            className="brain-fold"
          />

          {/* Center line */}
          <path
            d="M50 22 L50 78"
            stroke="url(#centerLine)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
            className="center-line"
          />
        </g>

        {/* Neural network nodes - the "IQ" intelligence element */}
        <g className="neural-nodes">
          {/* Left side nodes */}
          <circle cx="30" cy="35" r="3" fill="url(#nodeGradient1)" className="node node-1">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="0s"/>
          </circle>
          <circle cx="25" cy="50" r="2.5" fill="url(#nodeGradient2)" className="node node-2">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite" begin="0.3s"/>
          </circle>
          <circle cx="32" cy="65" r="2" fill="url(#nodeGradient1)" className="node node-3">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.2s" repeatCount="indefinite" begin="0.6s"/>
          </circle>

          {/* Right side nodes */}
          <circle cx="70" cy="35" r="3" fill="url(#nodeGradient2)" className="node node-4">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.3s" repeatCount="indefinite" begin="0.2s"/>
          </circle>
          <circle cx="75" cy="50" r="2.5" fill="url(#nodeGradient1)" className="node node-5">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.1s" repeatCount="indefinite" begin="0.5s"/>
          </circle>
          <circle cx="68" cy="65" r="2" fill="url(#nodeGradient2)" className="node node-6">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.4s" repeatCount="indefinite" begin="0.8s"/>
          </circle>

          {/* Center "spark" - represents intelligence/IQ */}
          <circle cx="50" cy="50" r="4" fill="url(#centerSpark)" className="center-spark">
            <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
          </circle>
        </g>

        {/* Connection lines between nodes */}
        <g className="connections" opacity="0.4">
          <line x1="30" y1="35" x2="50" y2="50" stroke="url(#connectionGradient)" strokeWidth="0.8" className="connection">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite"/>
          </line>
          <line x1="25" y1="50" x2="50" y2="50" stroke="url(#connectionGradient)" strokeWidth="0.8" className="connection">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.2s" repeatCount="indefinite" begin="0.3s"/>
          </line>
          <line x1="32" y1="65" x2="50" y2="50" stroke="url(#connectionGradient)" strokeWidth="0.8" className="connection">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.4s" repeatCount="indefinite" begin="0.6s"/>
          </line>
          <line x1="70" y1="35" x2="50" y2="50" stroke="url(#connectionGradient)" strokeWidth="0.8" className="connection">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.1s" repeatCount="indefinite" begin="0.2s"/>
          </line>
          <line x1="75" y1="50" x2="50" y2="50" stroke="url(#connectionGradient)" strokeWidth="0.8" className="connection">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.3s" repeatCount="indefinite" begin="0.5s"/>
          </line>
          <line x1="68" y1="65" x2="50" y2="50" stroke="url(#connectionGradient)" strokeWidth="0.8" className="connection">
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite" begin="0.8s"/>
          </line>
        </g>

        {/* Outer glow ring for premium feel */}
        {variant === 'filled' && (
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="url(#outerRing)"
            strokeWidth="1"
            opacity="0.3"
            className="outer-ring"
          />
        )}

        {/* Gradient Definitions */}
        <defs>
          {/* Background glow */}
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0"/>
          </radialGradient>

          {/* Left hemisphere - purple dominant */}
          <linearGradient id="leftHemisphere" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7"/>
            <stop offset="50%" stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#7c3aed"/>
          </linearGradient>

          {/* Right hemisphere - cyan accent */}
          <linearGradient id="rightHemisphere" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4"/>
            <stop offset="50%" stopColor="#0ea5e9"/>
            <stop offset="100%" stopColor="#8b5cf6"/>
          </linearGradient>

          {/* Stroke gradient for outline variant */}
          <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7"/>
            <stop offset="50%" stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#0ea5e9"/>
          </linearGradient>

          {/* Brain fold strokes */}
          <linearGradient id="foldStroke1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.3"/>
            <stop offset="50%" stopColor="#e9d5ff" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.3"/>
          </linearGradient>
          <linearGradient id="foldStroke2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.3"/>
            <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0.3"/>
          </linearGradient>

          {/* Center line */}
          <linearGradient id="centerLine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.2"/>
            <stop offset="50%" stopColor="#e9d5ff" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.2"/>
          </linearGradient>

          {/* Neural node gradients */}
          <radialGradient id="nodeGradient1" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e9d5ff"/>
            <stop offset="100%" stopColor="#a855f7"/>
          </radialGradient>
          <radialGradient id="nodeGradient2" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#a5f3fc"/>
            <stop offset="100%" stopColor="#0ea5e9"/>
          </radialGradient>

          {/* Center spark - the "IQ" intelligence indicator */}
          <radialGradient id="centerSpark" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff"/>
            <stop offset="30%" stopColor="#fef08a"/>
            <stop offset="100%" stopColor="#f59e0b"/>
          </radialGradient>

          {/* Connection lines */}
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6"/>
            <stop offset="100%" stopColor="#0ea5e9"/>
          </linearGradient>

          {/* Outer ring */}
          <linearGradient id="outerRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7"/>
            <stop offset="50%" stopColor="#0ea5e9"/>
            <stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>

        <style>
          {`
            .brain-logo-animate .brain-main-group {
              transform-origin: 50px 50px;
              animation: brainBreath 4s ease-in-out infinite;
            }

            .brain-logo-animate .hemisphere-left {
              animation: leftPulse 3s ease-in-out infinite;
            }

            .brain-logo-animate .hemisphere-right {
              animation: rightPulse 3s ease-in-out infinite 0.5s;
            }

            .brain-logo-animate .center-spark {
              filter: drop-shadow(0 0 3px #f59e0b);
            }

            .brain-logo-animate .outer-ring {
              animation: ringPulse 2s ease-in-out infinite;
            }

            @keyframes brainBreath {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.03);
              }
            }

            @keyframes leftPulse {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.9;
                filter: brightness(1.1);
              }
            }

            @keyframes rightPulse {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.9;
                filter: brightness(1.1);
              }
            }

            @keyframes ringPulse {
              0%, 100% {
                opacity: 0.3;
                stroke-width: 1;
              }
              50% {
                opacity: 0.5;
                stroke-width: 1.5;
              }
            }

            /* Hover effects */
            svg:hover .brain-main-group {
              animation-duration: 2s;
            }

            svg:hover .center-spark {
              filter: drop-shadow(0 0 6px #f59e0b);
            }
          `}
        </style>
      </svg>

      {showText && (
        <span className="ml-2 font-bold text-xl bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
          SmartPromptIQ
        </span>
      )}
    </div>
  );
}
