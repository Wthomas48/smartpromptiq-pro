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

  // Simple mathematical CAPTCHA generator
  const generateCaptcha = async (): Promise<void> => {
    try {
      const response = await apiRequest('POST', '/api/security/captcha/generate', {
        deviceFingerprint
      });

      if (response.ok) {
        const data = await response.json();
        setCaptchaToken(data.token);
      }
    } catch (error) {
      console.error('Failed to generate CAPTCHA:', error);
    }
  };

  // Verify CAPTCHA solution
  const verifyCaptcha = async (solution: string): Promise<boolean> => {
    try {
      const response = await apiRequest('POST', '/api/security/captcha/verify', {
        token: captchaToken,
        solution,
        deviceFingerprint
      });

      if (response.ok) {
        const data = await response.json();
        setIsVerified(data.verified);
        return data.verified;
      }
      return false;
    } catch (error) {
      console.error('Failed to verify CAPTCHA:', error);
      return false;
    }
  };

  // Check rate limiting for specific actions
  const checkRateLimit = async (action: string): Promise<boolean> => {
    try {
      const response = await apiRequest('POST', '/api/security/rate-limit/check', {
        action,
        deviceFingerprint,
        ip: 'client' // Server will use actual IP
      });

      if (response.ok) {
        const data = await response.json();
        return data.allowed;
      }
      return false;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }
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