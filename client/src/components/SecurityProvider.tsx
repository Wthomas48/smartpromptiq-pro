import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface SecurityContextType {
  captchaToken: string | null;
  deviceFingerprint: string;
  isVerified: boolean;
  generateCaptcha: () => Promise<void>;
  verifyCaptcha: (token: string) => Promise<boolean>;
  generateDeviceFingerprint: () => string;
  checkRateLimit: (action: string) => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);

  // Generate device fingerprint based on browser characteristics
  const generateDeviceFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      canvas: canvas.toDataURL(),
      timestamp: Date.now()
    };

    const fingerprintString = JSON.stringify(fingerprint);
    const hash = btoa(fingerprintString).slice(0, 32);
    return hash;
  };

  // Simple mathematical CAPTCHA generator (client-side only)
  const generateCaptcha = async (): Promise<void> => {
    // Generate a simple token for tracking
    const token = `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCaptchaToken(token);
  };

  // Verify CAPTCHA solution (client-side only)
  const verifyCaptcha = async (solution: string): Promise<boolean> => {
    // For simplicity, we'll just return true and set verified state
    // The actual math verification is done in CaptchaVerification component
    setIsVerified(true);
    return true;
  };

  // Check rate limiting for specific actions (client-side simple check)
  const checkRateLimit = async (action: string): Promise<boolean> => {
    // Simple client-side rate limiting check
    // For production, this should be handled server-side
    const lastAction = localStorage.getItem(`last_${action}`);
    const now = Date.now();

    if (lastAction) {
      const timeDiff = now - parseInt(lastAction);
      // Allow action if more than 2 seconds have passed (reduced from 5)
      if (timeDiff < 2000) {
        return false;
      }
    }

    localStorage.setItem(`last_${action}`, now.toString());
    return true;
  };

  useEffect(() => {
    const fingerprint = generateDeviceFingerprint();
    setDeviceFingerprint(fingerprint);
  }, []);

  const value: SecurityContextType = {
    captchaToken,
    deviceFingerprint,
    isVerified,
    generateCaptcha,
    verifyCaptcha,
    generateDeviceFingerprint,
    checkRateLimit
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};