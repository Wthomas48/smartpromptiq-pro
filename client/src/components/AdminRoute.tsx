import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/config/api";

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute - Server-side verified admin access guard
 *
 * SECURITY: This component verifies admin access with the backend API,
 * NOT by trusting localStorage or client-side state alone.
 *
 * Flow:
 * 1. Check if user is authenticated (basic client check)
 * 2. Call /api/auth/verify-admin to verify role from DATABASE
 * 3. Only render admin content if server confirms admin status
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user, isLoading, token } = useAuth();
  const [, setLocation] = useLocation();
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(true);
  const [isServerVerifiedAdmin, setIsServerVerifiedAdmin] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      // Wait for auth loading to complete
      if (isLoading) {
        return;
      }

      // Check basic authentication first
      if (!isAuthenticated || !token) {
        console.log('AdminRoute: Not authenticated, redirecting to admin login');
        setIsVerifyingAdmin(false);
        setLocation("/admin/login");
        return;
      }

      // CRITICAL: Verify admin status with the server
      // Do NOT trust localStorage or client-side role
      try {
        console.log('AdminRoute: Verifying admin status with server...');

        const baseUrl = getApiBaseUrl();
        const response = await fetch(`${baseUrl}/api/auth/verify-admin`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('AdminRoute: Server verification response:', data);

        if (data.success && data.isAdmin === true) {
          console.log('AdminRoute: Server confirmed admin status');
          setIsServerVerifiedAdmin(true);
          setVerificationError(null);
        } else {
          console.warn('AdminRoute: Server denied admin access:', data.message);
          setIsServerVerifiedAdmin(false);
          setVerificationError(data.message || 'Access denied');
          // Redirect non-admins to regular signin
          setLocation("/signin");
        }
      } catch (error: any) {
        console.error('AdminRoute: Server verification failed:', error);
        setIsServerVerifiedAdmin(false);
        setVerificationError(error.message || 'Verification failed');

        // On 401 errors, redirect to admin login
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          setLocation("/admin/login");
        } else {
          // On other errors, redirect to signin
          setLocation("/signin");
        }
      } finally {
        setIsVerifyingAdmin(false);
      }
    };

    verifyAdminAccess();
  }, [isAuthenticated, token, isLoading, setLocation]);

  // Show loading while checking auth or verifying admin
  if (isLoading || isVerifyingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isLoading ? 'Checking authentication...' : 'Verifying admin access...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error if verification failed but we're still on the page
  if (verificationError && !isServerVerifiedAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-5xl mb-4">&#x26A0;</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{verificationError}</p>
          <p className="text-sm text-gray-500">
            You do not have permission to access this area.
          </p>
        </div>
      </div>
    );
  }

  // Only render admin content if SERVER has verified admin status
  if (isAuthenticated && isServerVerifiedAdmin) {
    return <>{children}</>;
  }

  // Return nothing while redirecting
  return null;
}
