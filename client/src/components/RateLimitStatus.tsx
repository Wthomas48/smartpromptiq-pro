import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface RateLimitStatusProps {
  remaining: number;
  retryAfter: number;
  cooldownUntil: number;
  isDebouncing: boolean;
  canGenerate: boolean;
  loading: boolean;
  error?: string | null;
}

export const RateLimitStatus: React.FC<RateLimitStatusProps> = ({
  remaining,
  retryAfter,
  cooldownUntil,
  isDebouncing,
  canGenerate,
  loading,
  error
}) => {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      if (cooldownUntil > now) {
        setCountdown(Math.ceil((cooldownUntil - now) / 1000));
      } else if (retryAfter > 0) {
        setCountdown(retryAfter);
      } else {
        setCountdown(0);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil, retryAfter]);

  // Don't show anything if everything is normal
  if (canGenerate && !loading && !error && remaining !== 0 && !isDebouncing) {
    return null;
  }

  const getStatusInfo = () => {
    if (loading) {
      return {
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        message: "Generating...",
        color: "text-blue-600 bg-blue-50 border-blue-200"
      };
    }

    if (error && error.includes('Rate limited')) {
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        message: countdown > 0 ? `Rate limited. Retry in ${countdown}s` : "Rate limited",
        color: "text-orange-600 bg-orange-50 border-orange-200"
      };
    }

    if (cooldownUntil > Date.now()) {
      return {
        icon: <Clock className="w-4 h-4" />,
        message: `Cooldown: ${countdown}s`,
        color: "text-yellow-600 bg-yellow-50 border-yellow-200"
      };
    }

    if (isDebouncing) {
      return {
        icon: <Clock className="w-4 h-4" />,
        message: "Debouncing request...",
        color: "text-blue-600 bg-blue-50 border-blue-200"
      };
    }

    if (remaining === 0) {
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        message: "Rate limit reached",
        color: "text-red-600 bg-red-50 border-red-200"
      };
    }

    return {
      icon: <CheckCircle className="w-4 h-4" />,
      message: remaining > 0 ? `${remaining} requests remaining` : "Ready to generate",
      color: "text-green-600 bg-green-50 border-green-200"
    };
  };

  const status = getStatusInfo();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${status.color}`}>
      {status.icon}
      <span>{status.message}</span>
    </div>
  );
};

interface CooldownTimerProps {
  cooldownUntil: number;
  retryAfter: number;
}

export const CooldownTimer: React.FC<CooldownTimerProps> = ({ cooldownUntil, retryAfter }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      if (cooldownUntil > now) {
        setTimeLeft(Math.ceil((cooldownUntil - now) / 1000));
      } else if (retryAfter > 0) {
        setTimeLeft(retryAfter);
      } else {
        setTimeLeft(0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil, retryAfter]);

  if (timeLeft <= 0) return null;

  return (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      <Clock className="w-3 h-3" />
      <span>{timeLeft}s</span>
    </div>
  );
};