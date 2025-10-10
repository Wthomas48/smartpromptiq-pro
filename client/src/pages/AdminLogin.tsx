import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/Logo";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated, user, checkAuth } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated as admin
  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      setLocation('/admin');
    }
  }, [isAuthenticated, user, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔐 Admin login attempt:', { email: credentials.email });

      // Use the API configuration to get the correct backend URL
      const { getApiBaseUrl } = await import('@/config/api');
      const apiBaseUrl = getApiBaseUrl();
      const fullUrl = `${apiBaseUrl}/api/auth/login`;

      console.log('🔍 Admin login URL:', fullUrl);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          isAdminLogin: true
        })
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

      // Handle empty response
      const responseText = await response.text();
      console.log('🔍 Raw response:', responseText);

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('🔍 JSON parse error:', parseError);
        console.error('🔍 Response text:', responseText);
        throw new Error('Invalid response from server');
      }

      console.log('🔍 Parsed response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Check if user has admin role
      if (data.data.user.role !== 'ADMIN') {
        throw new Error('Admin role required');
      }

      // Store authentication data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Update auth context
      await checkAuth();

      toast({
        title: "Admin Access Granted",
        description: "Welcome back, Administrator!",
      });

      // Redirect to admin dashboard
      console.log('🚀 Admin login successful, redirecting to /admin');
      setLocation('/admin');
    } catch (error: any) {
      console.error('Admin login error:', error);

      toast({
        title: "Access Denied",
        description: error.message || "Invalid admin credentials.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Logo size={48} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SmartPromptIQ</h1>
          <p className="text-slate-600">Administrator Portal</p>
        </div>

        {/* Admin Login Card */}
        <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white" size={28} />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center justify-center space-x-2">
              <Lock className="text-red-600" size={20} />
              <span>Admin Access</span>
            </CardTitle>
            <CardDescription className="text-slate-600">
              Enter your administrator credentials to access the admin panel
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Admin Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="admin@admin.com or admin@smartpromptiq.net"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="h-12 bg-white border-slate-200 focus:border-red-500 focus:ring-red-500/20 text-slate-900 placeholder-slate-400"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Admin Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter admin password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="h-12 pr-12 bg-white border-slate-200 focus:border-red-500 focus:ring-red-500/20 text-slate-900 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Security Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                <div>
                  <p className="text-sm text-red-700 font-medium">Security Notice</p>
                  <p className="text-xs text-red-600 mt-1">
                    Admin access is logged and monitored. Unauthorized access attempts are tracked and reported.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield size={18} />
                    <span>Access Admin Panel</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Back to Main Site */}
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => setLocation('/landing')}
                className="text-slate-500 hover:text-slate-700"
              >
                ← Back to SmartPromptIQ
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>© 2024 SmartPromptIQ. All rights reserved.</p>
          <p className="mt-1">Administrator Portal v1.0</p>
        </div>
      </div>
    </div>
  );
}