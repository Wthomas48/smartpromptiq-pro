import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, Eye, EyeOff, Mail, BookOpen, Award, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function AcademySignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect authenticated users to academy dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to academy dashboard');
      setLocation('/academy/dashboard');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log('🔍 Attempting Academy signin');
      await login(email, password);
      console.log('✅ Academy signin successful');
      // Redirect to academy dashboard
      setLocation('/academy/dashboard');
    } catch (err: any) {
      console.error('❌ Academy signin error:', err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4">
          {/* Academy Logo */}
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
          </div>

          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SmartPromptIQ™ Academy
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Sign in to continue your learning journey
            </CardDescription>
          </div>

          {/* Academy Features */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="flex flex-col items-center p-2 bg-indigo-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-600 mb-1" />
              <span className="text-xs text-indigo-700 font-medium">Courses</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-purple-50 rounded-lg">
              <Award className="w-5 h-5 text-purple-600 mb-1" />
              <span className="text-xs text-purple-700 font-medium">Certificates</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-pink-50 rounded-lg">
              <Users className="w-5 h-5 text-pink-600 mb-1" />
              <span className="text-xs text-pink-700 font-medium">Community</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In to Academy"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">New to Academy?</span>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full h-12 border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-semibold"
          >
            <Link href="/academy/signup">
              Create Academy Account
            </Link>
          </Button>

          {/* Additional Links */}
          <div className="flex justify-between text-sm">
            <Link href="/academy" className="text-indigo-600 hover:text-indigo-700 hover:underline">
              Back to Academy
            </Link>
            <Link href="/forgot-password" className="text-gray-600 hover:text-gray-700 hover:underline">
              Forgot password?
            </Link>
          </div>
        </CardContent>

        <div className="px-6 py-4 border-t bg-gradient-to-r from-indigo-50 to-purple-50">
          <p className="text-xs text-center text-gray-600">
            Secure authentication for SmartPromptIQ™ Academy
          </p>
        </div>
      </Card>
    </div>
  );
}
