import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  
  console.log("🔐 SIGNIN COMPONENT LOADED! isLoading:", isLoading);

  const handleSignIn = async (e?: React.FormEvent) => {
    e?.preventDefault();
    console.log("🔐 SIGNIN BUTTON CLICKED!");
    setError("");
    setIsLoading(true);

    // For now, let's bypass the server and login directly
    try {
      // Simulate successful login
      const userData = {
        id: "demo-user-1",
        email: email || "demo@smartpromptiq.com",
        firstName: "Demo",
        lastName: "User",
        subscriptionTier: "free",
        tokenBalance: 10
      };
      
      const token = "demo-jwt-token-" + Date.now();
      
      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Force a page reload to trigger auth check
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    console.log("🔐 DEMO SIGNIN CLICKED!");
    setEmail("demo@smartpromptiq.com");
    setPassword("demo123");
    handleSignIn();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to SmartPromptIQ</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDemoSignIn}
            disabled={isLoading}
          >
            Continue with Demo Account
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Server-free demo mode - Click either button to login
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

