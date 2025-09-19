import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function LogoutPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Clear any stored auth tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Redirect to home page after logout
    setTimeout(() => {
      setLocation('/');
    }, 1000);
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Logging out...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You have been successfully logged out. Redirecting to home page...
          </p>
        </div>
      </div>
    </div>
  );
}