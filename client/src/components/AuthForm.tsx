import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles,
  AlertCircle,
  Rocket,
  Shield,
  CheckCircle,
  Loader2,
  Github,
  Chrome
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthFormProps {
  mode?: 'signin' | 'signup';
  onSuccess?: () => void;
  onModeChange?: (mode: 'signin' | 'signup') => void;
  className?: string;
  showDemo?: boolean;
  showSocialLogin?: boolean;
  showRememberMe?: boolean;
  showTerms?: boolean;
  redirectPath?: string;
}

export default function AuthForm({
  mode = 'signin',
  onSuccess,
  onModeChange,
  className = "",
  showDemo = true,
  showSocialLogin = false,
  showRememberMe = true,
  showTerms = true,
  redirectPath
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { login, signup, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && redirectPath) {
      setLocation(redirectPath);
    }
  }, [isAuthenticated, redirectPath, setLocation]);

  // Password strength calculation
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  // Password validation
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/\d/.test(password)) errors.push("One number");
    return errors;
  };

  // Update password strength on change
  useEffect(() => {
    if (currentMode === 'signup' && password) {
      setPasswordStrength(calculatePasswordStrength(password));
      setValidationErrors(validatePassword(password));
    }
  }, [password, currentMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log('AuthForm submission:', { email, mode: currentMode });

      if (currentMode === 'signup') {
        // Validate terms acceptance
        if (showTerms && !acceptTerms) {
          setError("Please accept the terms and conditions");
          setIsLoading(false);
          return;
        }

        // Validate passwords match
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setIsLoading(false);
          return;
        }

        // Validate password strength
        if (validationErrors.length > 0) {
          setError(`Password requirements: ${validationErrors.join(", ")}`);
          setIsLoading(false);
          return;
        }

        // Validate required fields
        if (!firstName.trim() || !lastName.trim()) {
          setError("First name and last name are required");
          setIsLoading(false);
          return;
        }

        await signup(email, password, firstName, lastName);
        console.log('AuthForm signup successful');
      } else {
        await login(email, password);
        console.log('AuthForm login successful');
      }

      // Remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('❌ AuthForm error:', err);
      setError(err.message || `${currentMode === 'signup' ? 'Signup' : 'Login'} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    setCurrentMode(newMode);
    setError("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");

    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleDemoAccess = () => {
    console.log('Demo access requested');
    setLocation('/demo');
  };

  return (
    <Card className={`w-full max-w-md shadow-2xl ${className}`} data-build="authform-2025-09-22-1">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          SmartPromptIQ
        </CardTitle>
        <CardDescription className="text-gray-600">
          {currentMode === 'signup'
            ? "Create your account to get started"
            : "Welcome back! Please sign in to continue"
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* MODE TOGGLE BUTTONS */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleModeChange('signin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                currentMode === 'signin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                currentMode === 'signup'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold">
              {currentMode === 'signup' ? "Create Your Account" : "Welcome Back"}
            </h3>
            <p className="text-sm text-gray-600">
              {currentMode === 'signup' ? "Join thousands of creators" : "Access your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* NAME FIELDS FOR SIGNUP */}
            {currentMode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={currentMode === 'signup'}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={currentMode === 'signup'}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* EMAIL FIELD */}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
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

            {/* PASSWORD STRENGTH INDICATOR */}
            {currentMode === 'signup' && password && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Password Strength</span>
                  <span className={`font-medium ${
                    passwordStrength < 50 ? 'text-red-500' :
                    passwordStrength < 75 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength < 50 ? 'bg-red-500' :
                      passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                {validationErrors.length > 0 && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Password must have:</p>
                    <ul className="ml-4 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-500" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* CONFIRM PASSWORD FOR SIGNUP */}
            {currentMode === 'signup' && (
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={currentMode === 'signup'}
                    disabled={isLoading}
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
                {/* Password match indicator */}
                {confirmPassword && (
                  <div className="flex items-center gap-1 mt-1 text-xs">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        <span className="text-red-600">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* REMEMBER ME CHECKBOX */}
            {showRememberMe && currentMode === 'signin' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer">
                  Remember me for 30 days
                </Label>
              </div>
            )}

            {/* TERMS ACCEPTANCE */}
            {showTerms && currentMode === 'signup' && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  required={currentMode === 'signup'}
                />
                <Label htmlFor="acceptTerms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {currentMode === 'signup' ? "Creating account..." : "Signing in..."}
                </div>
              ) : (
                currentMode === 'signup' ? "Create Account" : "Sign In"
              )}
            </Button>
          </form>

          {/* DEMO SECTION */}
          {showDemo && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                onClick={handleDemoAccess}
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
                disabled={isLoading}
              >
                <Rocket className="w-4 h-4 mr-2" />
                Try Demo Mode
              </Button>
            </>
          )}

          {/* MODE TOGGLE LINK */}
          <div className="text-center text-sm text-gray-600">
            {currentMode === 'signin' ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleModeChange('signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                  disabled={isLoading}
                >
                  Sign up here
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleModeChange('signin')}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                  disabled={isLoading}
                >
                  Sign in here
                </button>
              </>
            )}
          </div>
        </div>
      </CardContent>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t bg-gray-50">
        <p className="text-xs text-center text-gray-500">
          Secure authentication powered by SmartPromptIQ
        </p>
        <p className="text-xs text-center text-gray-400 mt-1">
          build: authform-component-2025-09-22-1
        </p>
      </div>
    </Card>
  );
}

// Export additional interfaces for flexibility
export interface AuthFormState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  isLoading: boolean;
  error: string;
}

export interface AuthFormCallbacks {
  onSubmit?: (formData: AuthFormState) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onModeChange?: (mode: 'signin' | 'signup') => void;
}