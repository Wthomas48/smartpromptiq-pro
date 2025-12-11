import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, Eye, EyeOff, Mail, User, BookOpen, Award, Users, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSecurityContext } from "@/components/SecurityProvider";
import { CaptchaVerification } from "@/components/CaptchaVerification";

export default function AcademySignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [, setLocation] = useLocation();
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth();
  const { deviceFingerprint, checkRateLimit } = useSecurityContext();

  // Redirect authenticated users to academy dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to academy dashboard');
      setLocation('/academy/dashboard');
    }
  }, [isAuthenticated, authLoading, setLocation]);

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

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
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
      console.log('🔍 Attempting Academy signup');
      await signup(email, password, firstName, lastName);
      console.log('✅ Academy signup successful');

      // Redirect to academy dashboard
      setLocation('/academy/dashboard');
    } catch (err: any) {
      console.error('❌ Academy signup error:', err);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-8">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          {/* Academy Logo */}
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>

          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Join SmartPromptIQ™ Academy
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Create your account and start learning today
            </CardDescription>
          </div>

          {/* Academy Features */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="flex flex-col items-center p-2 bg-indigo-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-600 mb-1" />
              <span className="text-xs text-indigo-700 font-medium">50+ Courses</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-purple-50 rounded-lg">
              <Award className="w-5 h-5 text-purple-600 mb-1" />
              <span className="text-xs text-purple-700 font-medium">Certificates</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-pink-50 rounded-lg">
              <Users className="w-5 h-5 text-pink-600 mb-1" />
              <span className="text-xs text-pink-700 font-medium">Expert Support</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSignUp} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 font-medium">
                  First Name *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="pl-10 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 font-medium">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address *
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pr-10 h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Security CAPTCHA */}
            {showCaptcha && (
              <div className="space-y-4">
                <CaptchaVerification
                  onVerified={handleCaptchaVerified}
                  required={true}
                />
              </div>
            )}

            {/* Terms Notice */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start space-x-3">
              <CheckCircle className="text-indigo-600 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="text-sm text-indigo-800">
                  By creating an Academy account, you agree to our{' '}
                  <button type="button" className="underline hover:text-indigo-900 font-medium">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="underline hover:text-indigo-900 font-medium">
                    Privacy Policy
                  </button>.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200"
              disabled={isLoading || showCaptcha}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating your account...
                </div>
              ) : (
                "Create Academy Account"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Already have an account?</span>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full h-12 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold"
          >
            <Link href="/academy/signin">
              Sign In to Academy
            </Link>
          </Button>

          {/* Additional Links */}
          <div className="text-center">
            <Link href="/academy" className="text-indigo-600 hover:text-indigo-700 hover:underline text-sm">
              Back to Academy
            </Link>
          </div>
        </CardContent>

        <div className="px-6 py-4 border-t bg-gradient-to-r from-indigo-50 to-purple-50">
          <p className="text-xs text-center text-gray-600">
            Secure registration for SmartPromptIQ™ Academy
          </p>
        </div>
      </Card>
    </div>
  );
}
