import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BrainLogo from "@/components/BrainLogo";
import { Sparkles, Rocket, Crown, Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/config/api";
import { useSecurityContext } from "@/components/SecurityProvider";
import { CaptchaVerification } from "@/components/CaptchaVerification";

export default function SignIn() {
  // Enable production debugging
  if (typeof window !== 'undefined') {
    window.DEBUG_AUTH = true;
  }

  const debugLog = (label, data) => {
    if (typeof window !== 'undefined' && window.DEBUG_AUTH) {
      console.log(`🔍 AUTH DEBUG - ${label}:`, data);
      console.log(`🔍 AUTH DEBUG - ${label} type:`, typeof data);
      console.log(`🔍 AUTH DEBUG - ${label} isArray:`, Array.isArray(data));
    }
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userName, setUserName] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [, setLocation] = useLocation();
  const { login, signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const { deviceFingerprint, checkRateLimit } = useSecurityContext();

  // ✅ FIXED: Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to dashboard');
      setLocation('/dashboard');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Check URL parameters to determine initial mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'signup') {
      setIsSignUp(true);
    }
  }, []);

  const handleSignIn = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      debugLog("Signin Request", { email });
      console.log('🔍 Attempting signin with auth hook');

      const result = await login(email, password);
      debugLog("Signin Result", result);

      console.log('✅ Signin successful via auth hook');
      // The auth hook will handle the redirect to dashboard
    } catch (err: any) {
      debugLog("Signin Error", err);
      console.error('❌ Signin error via auth hook:', err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setIsLoading(true);

    // Validation checks
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!firstName || !lastName || !email) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    // Check rate limiting before proceeding
    try {
      const rateLimitOk = await checkRateLimit('registration');
      if (!rateLimitOk) {
        setError("Too many registration attempts. Please wait before trying again.");
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.warn('Rate limit check failed, proceeding with caution');
    }

    // Show CAPTCHA if not already verified
    if (!captchaVerified) {
      setShowCaptcha(true);
      setIsLoading(false);
      return;
    }

    try {
      debugLog("Signup Request", { email, firstName, lastName, deviceFingerprint });
      console.log('🔍 Attempting signup with security verification');

      await signup(email, password, firstName, lastName);
      console.log('✅ Signup successful with security verification');
      // The auth hook will handle the redirect to dashboard
    } catch (err: any) {
      debugLog("Signup Error", err);
      console.error('❌ Signup error:', err);
      setError(err.message || "Failed to create account");

      // Reset CAPTCHA on error
      setCaptchaVerified(false);
      setShowCaptcha(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaVerified = (verified: boolean) => {
    setCaptchaVerified(verified);
    if (verified) {
      setShowCaptcha(false);
      // Automatically proceed with signup after CAPTCHA verification
      setTimeout(() => handleSignUp(), 100);
    } else {
      setError("CAPTCHA verification failed. Please try again.");
    }
  };

  // Show welcome screen after successful signup
  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-4">
        <div className="text-center max-w-lg mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-green-100">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🎉 Welcome to SmartPromptIQ!
              </h1>
              <h2 className="text-2xl font-semibold text-green-600 mb-2">
                Hello {userName}! 👋
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Your account has been created successfully!<br/>
                Get excited - you're about to experience the power of AI-driven prompts!
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2 text-blue-600">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Preparing your dashboard...</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Redirecting you to your personalized dashboard in a few seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-2xl" data-build="signup-fix-2025-09-22-1">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse p-2">
              <BrainLogo size={48} animate={true} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            SmartPromptIQ
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isSignUp ? "Create your account to get started" : "Welcome back! Please sign in to continue"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* SIGNUP/SIGNIN TOGGLE BUTTONS */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  !isSignUp
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  isSignUp
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold">
                {isSignUp ? "Create Your Account" : "Welcome Back"}
              </h3>
              <p className="text-sm text-gray-600">
                {isSignUp ? "Join thousands of creators" : "Access your account"}
              </p>
            </div>

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}


              {/* NAME FIELDS FOR SIGNUP */}
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD FOR SIGNUP */}
              {isSignUp && (
                <div>
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Security CAPTCHA for signup */}
              {isSignUp && showCaptcha && (
                <div className="space-y-4">
                  <CaptchaVerification
                    onVerified={handleCaptchaVerified}
                    required={true}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-200"
                disabled={isLoading || (isSignUp && showCaptcha)}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </div>
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full border-gray-300 hover:bg-gray-50">
              <Link href="/demo">
                <span className="flex items-center justify-center">
                  🚀 Try Demo Mode
                </span>
              </Link>
            </Button>

            {!isSignUp && (
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Sign up here
                </button>
              </div>
            )}

            {isSignUp && (
              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Sign in here
                </button>
              </div>
            )}
          </div>
        </CardContent>
        <div className="px-6 py-4 border-t bg-gray-50">
          <p className="text-xs text-center text-gray-500">
            Secure authentication powered by SmartPromptIQ
          </p>
          <p className="text-xs text-center text-gray-400 mt-1">
            build: signup-fix-2025-09-22-1
          </p>
        </div>
      </Card>
    </div>
  );
}