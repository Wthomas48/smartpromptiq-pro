import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/config/api";
import BrainLogo from "@/components/BrainLogo";
import { Sparkles, Rocket, Crown, Eye, EyeOff, Lock, Mail, User, CheckCircle, AlertCircle } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    honeypot: "" // Bot protection field
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userName, setUserName] = useState("");
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // ✅ FIXED: Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Fixed password validation - match backend requirement
  const isPasswordValid = formData.password.length >= 6;

  // Client-side validation before API call
  const validateSignupData = (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const errors = [];

    if (!data.email || !data.email.includes('@')) {
      errors.push('Valid email is required');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (!data.firstName || data.firstName.trim().length === 0) {
      errors.push('First name is required');
    }

    // lastName is optional in our app, so no validation needed

    return errors;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Bot protection - check honeypot field
    if (formData.honeypot) {
      setError("Please try again");
      setIsLoading(false);
      return;
    }

    // Rate limiting - simple client-side protection (reduced from 3s to 1s)
    const now = Date.now();
    if (now - lastSubmitTime < 1000) { // 1 second cooldown
      setError("Please wait a moment before trying again");
      setIsLoading(false);
      return;
    }

    // Track attempts (increased from 3 to 5 attempts)
    if (submitAttempts >= 5) {
      setError("Too many attempts. Please refresh the page and try again");
      setIsLoading(false);
      return;
    }

    setLastSubmitTime(now);
    setSubmitAttempts(prev => prev + 1);

    // Simple validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    // Basic email validation
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      // Extract name from email for simplicity
      const emailName = formData.email.split('@')[0];
      const firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

      // Prepare signup data
      const signupData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password, // Don't trim password!
        firstName: firstName.trim(),
        lastName: "", // Optional
      };

      // Validate data before sending
      const validationErrors = validateSignupData(signupData);
      if (validationErrors.length > 0) {
        console.error('❌ Validation failed:', validationErrors);
        setError(validationErrors.join(', '));
        setIsLoading(false);
        return;
      }

      console.log('✅ Validation passed, sending signup request');

      const data = await authAPI.signup(signupData);

      console.log('🔍 Register: Signup response:', data);

      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }

      // Reset rate limiting on success
      setSubmitAttempts(0);
      setLastSubmitTime(0);

      // Show success animation
      setUserName(firstName);
      setShowSuccess(true);

      // ✅ FIXED: Handle both response formats - nested {data: {token}} and direct {token}
      const authToken = data.data?.token || data.token;

      if (authToken) {
        // If registration successful, log them in automatically
        setTimeout(async () => {
          await login(formData.email, formData.password);
          toast({
            title: "Welcome!",
            description: "Your account has been created successfully.",
          });
          setLocation("/dashboard");
        }, 2000);
      } else {
        // Otherwise redirect to signin
        setTimeout(() => {
          toast({
            title: "Success!",
            description: "Your account has been created. Please sign in.",
          });
          setLocation("/signin");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success overlay component
  const SuccessOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-in slide-in-from-bottom-4 duration-700">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
            <CheckCircle className="w-10 h-10 text-white animate-bounce" />
          </div>
          <div className="absolute -top-2 -right-2 animate-ping">
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="absolute -bottom-2 -left-2 animate-ping" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
          Account Created! 🎉
        </h2>
        <p className="text-gray-600 mb-4">
          Welcome to SmartPromptIQ, {userName}!
        </p>
        <div className="flex items-center justify-center space-x-2 text-emerald-600">
          <Rocket className="w-5 h-5 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <span className="font-medium">Setting up your dashboard...</span>
          <Rocket className="w-5 h-5 animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating animation elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-pink-200/30 to-rose-200/30 rounded-full blur-lg animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-md animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="w-full max-w-lg mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse p-2">
              <BrainLogo size={60} animate={true} />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Join SmartPromptIQ
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Create your account and start generating amazing AI prompts ✨
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Status Messages */}
            {submitAttempts >= 3 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Too many attempts. Please refresh the page to try again.
                </AlertDescription>
              </Alert>
            ) : submitAttempts > 0 ? (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Attempt {submitAttempts}/3 - Please wait between attempts for security.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-blue-200 bg-blue-50">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>🚀 Quick Registration!</strong><br />
                  Just your email and password to get started with SmartPromptIQ.
                </AlertDescription>
              </Alert>
            )}

            {/* Hidden honeypot field for bot protection */}
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={handleInputChange}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="pl-10 pr-4 py-3 h-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Choose a password (6+ characters)"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="pl-10 pr-12 py-3 h-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">Minimum 6 characters</p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 h-12 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              disabled={isLoading || !isPasswordValid || !formData.email || submitAttempts >= 3}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating your account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Rocket className="w-4 h-4" />
                  <span>Create Account</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
            </Button>

            <div className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors duration-200">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Success overlay */}
      {showSuccess && <SuccessOverlay />}
    </div>
  );
}