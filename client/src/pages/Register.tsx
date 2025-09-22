import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { authAPI } from "@/config/api";
import { Sparkles, Rocket, Crown, Eye, EyeOff, Lock, Mail, User, CheckCircle, AlertCircle } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userName, setUserName] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // ✅ FIXED: Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to dashboard');
      setLocation('/dashboard');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Too short', color: 'text-red-500' };

    // Check for basic requirements: at least one letter and one number
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length >= 6 && hasLetter && hasNumber) {
      if (password.length >= 12) return { strength: 4, label: 'Very Strong', color: 'text-green-500' };
      if (password.length >= 8) return { strength: 3, label: 'Strong', color: 'text-green-500' };
      return { strength: 2, label: 'Good', color: 'text-blue-500' };
    }

    return { strength: 1, label: 'Needs letter & number', color: 'text-orange-500' };
  };

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordStrength = getPasswordStrength(formData.password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Register: Attempting signup with authAPI...');

      const data = await authAPI.signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      console.log('🔍 Register: Signup response:', data);

      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }

      // Show success animation
      setUserName(formData.firstName || formData.email.split('@')[0]);
      setShowSuccess(true);

      // If registration successful, log them in automatically
      if (data.data && data.data.token) {
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
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
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

            {/* New System Announcement */}
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>✨ Enhanced User Experience!</strong><br />
                Our new system provides real user data, improved features, and better personalization.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="pl-10 pr-4 py-3 h-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="pl-10 pr-4 py-3 h-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg transition-all duration-200"
                  />
                </div>
              </div>
            </div>

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
                  placeholder="Create a strong password"
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
              {formData.password && (
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                            level <= passwordStrength.strength
                              ? level === 1
                                ? 'bg-red-400'
                                : level === 2
                                ? 'bg-orange-400'
                                : level === 3
                                ? 'bg-blue-400'
                                : 'bg-green-400'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500">At least 6 characters with a letter and number</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="pl-10 pr-12 py-3 h-12 border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="flex items-center space-x-2">
                  {passwordsMatch ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs">Passwords match</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-red-500">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-xs">Passwords don't match</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 h-12 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              disabled={isLoading || !passwordsMatch || formData.password.length < 6}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating your account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4" />
                  <span>Create Account & Start Creating</span>
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