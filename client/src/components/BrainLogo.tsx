interface BrainLogoProps {
  size?: number;
  className?: string;
  animate?: boolean;
  variant?: 'filled' | 'outline';
}

export default function BrainLogo({ size = 32, className = '', animate = false, variant = 'filled' }: BrainLogoProps) {
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
        {/* Main brain outline with sophisticated shape */}
        <path
          d="M25 25 C15 20, 12 30, 18 40 C20 45, 25 50, 30 52 C35 55, 40 52, 45 50 C50 48, 55 52, 60 50 C65 48, 70 52, 75 50 C80 48, 85 45, 82 40 C88 30, 85 20, 75 25 C70 22, 65 18, 60 20 C55 15, 45 15, 40 20 C35 18, 30 22, 25 25 Z"
          fill={variant === 'filled' ? "url(#brainGradient1)" : "none"}
          stroke={variant === 'outline' ? "url(#outlineGradient)" : "none"}
          strokeWidth={variant === 'outline' ? "2.5" : "0"}
          className="brain-main"
          filter={variant === 'filled' ? "url(#softGlow)" : "none"}
        />

        {/* Detailed outline version with intricate brain folds */}
        {variant === 'outline' && (
          <>
            {/* Inner brain structure outline */}
            <path
              d="M30 35 C25 32, 20 38, 25 42 C28 45, 32 43, 35 40 C38 37, 35 35, 30 35"
              fill="none"
              stroke="url(#detailOutlineGradient1)"
              strokeWidth="1.5"
              className="brain-detail-outline"
              opacity="0.8"
            />
            <path
              d="M70 35 C75 32, 80 38, 75 42 C72 45, 68 43, 65 40 C62 37, 65 35, 70 35"
              fill="none"
              stroke="url(#detailOutlineGradient2)"
              strokeWidth="1.5"
              className="brain-detail-outline"
              opacity="0.8"
            />

            {/* Cortex folds detail */}
            <path
              d="M28 45 Q33 42, 38 45 Q43 48, 48 45"
              fill="none"
              stroke="url(#cortexGradient1)"
              strokeWidth="1.2"
              className="cortex-fold"
              opacity="0.7"
            />
            <path
              d="M52 45 Q57 42, 62 45 Q67 48, 72 45"
              fill="none"
              stroke="url(#cortexGradient2)"
              strokeWidth="1.2"
              className="cortex-fold"
              opacity="0.7"
            />

            {/* Cerebellum outline */}
            <path
              d="M32 60 C35 58, 38 60, 40 62 C42 60, 45 58, 48 60"
              fill="none"
              stroke="url(#cerebrumGradient1)"
              strokeWidth="1"
              className="cerebellum-outline"
              opacity="0.6"
            />
            <path
              d="M52 60 C55 58, 58 60, 60 62 C62 60, 65 58, 68 60"
              fill="none"
              stroke="url(#cerebrumGradient2)"
              strokeWidth="1"
              className="cerebellum-outline"
              opacity="0.6"
            />

            {/* Neural pathway outlines */}
            <path
              d="M35 48 L42 52 L38 55 L45 58"
              fill="none"
              stroke="url(#neuralPathGradient1)"
              strokeWidth="0.8"
              strokeDasharray="2,1"
              className="neural-pathway-outline"
              opacity="0.5"
            />
            <path
              d="M65 48 L58 52 L62 55 L55 58"
              fill="none"
              stroke="url(#neuralPathGradient2)"
              strokeWidth="0.8"
              strokeDasharray="2,1"
              className="neural-pathway-outline"
              opacity="0.5"
            />
          </>
        )}

        {/* Brain hemispheres separation */}
        <path
          d="M50 25 Q52 35, 50 45 Q48 55, 50 65 Q52 70, 50 75"
          stroke="url(#separationGradient)"
          strokeWidth="1.5"
          fill="none"
          className="brain-separation"
          opacity="0.6"
        />

        {/* Left hemisphere details */}
        <path
          d="M25 35 Q35 30, 45 35 Q40 40, 35 45 Q30 40, 25 35"
          fill="url(#brainDetailGradient1)"
          className="brain-left-detail"
          opacity="0.3"
        />

        {/* Right hemisphere details */}
        <path
          d="M55 35 Q65 30, 75 35 Q70 40, 65 45 Q60 40, 55 35"
          fill="url(#brainDetailGradient2)"
          className="brain-right-detail"
          opacity="0.3"
        />

        {/* Brain folds for realism */}
        <path
          d="M30 42 Q40 38, 48 42"
          stroke="url(#foldGradient1)"
          strokeWidth="1.2"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M52 42 Q60 38, 70 42"
          stroke="url(#foldGradient2)"
          strokeWidth="1.2"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M28 52 Q38 48, 48 52"
          stroke="url(#foldGradient1)"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M52 52 Q62 48, 72 52"
          stroke="url(#foldGradient2)"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
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
        
        {/* Enhanced gradient definitions */}
        <defs>
          {/* Main brain gradient with depth */}
          <radialGradient id="brainGradient1" cx="50%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="30%" stopColor="#8b5cf6" />
            <stop offset="60%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#6d28d9" />
          </radialGradient>

          {/* Hemisphere separation gradient */}
          <linearGradient id="separationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e879f9" opacity="0.8"/>
            <stop offset="50%" stopColor="#c084fc" opacity="0.6"/>
            <stop offset="100%" stopColor="#a855f7" opacity="0.8"/>
          </linearGradient>

          {/* Detail gradients */}
          <linearGradient id="brainDetailGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
          <linearGradient id="brainDetailGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>

          {/* Fold gradients for brain texture */}
          <linearGradient id="foldGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" opacity="0.7"/>
            <stop offset="50%" stopColor="#a855f7" opacity="0.9"/>
            <stop offset="100%" stopColor="#c084fc" opacity="0.7"/>
          </linearGradient>
          <linearGradient id="foldGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" opacity="0.7"/>
            <stop offset="50%" stopColor="#38bdf8" opacity="0.9"/>
            <stop offset="100%" stopColor="#0ea5e9" opacity="0.7"/>
          </linearGradient>

          {/* Neural connection gradients */}
          <radialGradient id="neuralGradient1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#60a5fa" opacity="0.9"/>
            <stop offset="100%" stopColor="#3b82f6" opacity="0.6"/>
          </radialGradient>
          <radialGradient id="neuralGradient2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" opacity="0.9"/>
            <stop offset="100%" stopColor="#8b5cf6" opacity="0.6"/>
          </radialGradient>

          {/* Outline-specific gradients */}
          <linearGradient id="outlineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="30%" stopColor="#8b5cf6" />
            <stop offset="70%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>

          <linearGradient id="detailOutlineGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="detailOutlineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="cortexGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="cortexGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>

          <linearGradient id="cerebrumGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
          <linearGradient id="cerebrumGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>

          <linearGradient id="neuralPathGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" opacity="0.8"/>
            <stop offset="100%" stopColor="#c084fc" opacity="0.6"/>
          </linearGradient>
          <linearGradient id="neuralPathGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" opacity="0.8"/>
            <stop offset="100%" stopColor="#0ea5e9" opacity="0.6"/>
          </linearGradient>

          {/* Enhanced glow filter */}
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Drop shadow for depth */}
          <filter id="dropShadow">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        <style>
          {`
            .brain-logo-animate .brain-main {
              transform-origin: 50px 50px;
              animation: brainPulse 4s ease-in-out infinite;
            }
            .brain-logo-animate .brain-separation {
              animation: brainSeparationGlow 3s ease-in-out infinite;
            }
            .brain-logo-animate .brain-left-detail {
              animation: brainDetailPulse 3.5s ease-in-out infinite 0.2s;
            }
            .brain-logo-animate .brain-right-detail {
              animation: brainDetailPulse 3.5s ease-in-out infinite 0.8s;
            }
            .neural-path {
              stroke-dasharray: 3,2;
              animation: neuralFlow 2.5s linear infinite;
            }

            @keyframes brainPulse {
              0%, 100% {
                transform: scale(1);
                filter: brightness(1) saturate(1);
              }
              25% {
                transform: scale(1.02);
                filter: brightness(1.1) saturate(1.1);
              }
              50% {
                transform: scale(1.05);
                filter: brightness(1.2) saturate(1.2);
              }
              75% {
                transform: scale(1.02);
                filter: brightness(1.1) saturate(1.1);
              }
            }

            @keyframes brainSeparationGlow {
              0%, 100% {
                opacity: 0.6;
                stroke-width: 1.5;
              }
              50% {
                opacity: 0.9;
                stroke-width: 2;
              }
            }

            @keyframes brainDetailPulse {
              0%, 100% {
                opacity: 0.3;
                transform: scale(1);
              }
              50% {
                opacity: 0.5;
                transform: scale(1.03);
              }
            }

            @keyframes neuralFlow {
              0% {
                stroke-dashoffset: 0;
                opacity: 0.6;
              }
              50% {
                opacity: 0.9;
              }
              100% {
                stroke-dashoffset: 5;
                opacity: 0.6;
              }
            }

            /* Hover effects */
            .brain-logo-animate:hover .brain-main {
              animation-duration: 2s;
              filter: brightness(1.3) saturate(1.3);
            }

            .brain-logo-animate:hover .neural-path {
              animation-duration: 1.5s;
              opacity: 1;
            }
          `}
        </style>
      </svg>
    </div>
  );
}