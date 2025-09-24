import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to admin login if not authenticated
        setLocation("/admin/login");
        return;
      }

      if (!user || user.role !== 'ADMIN') {
        // Redirect to regular login if not admin
        setLocation("/signin");
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, setLocation]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Only render admin content if user is authenticated admin
  if (isAuthenticated && user && user.role === 'ADMIN') {
    return <>{children}</>;
  }

  // Return nothing while redirecting
  return null;
}