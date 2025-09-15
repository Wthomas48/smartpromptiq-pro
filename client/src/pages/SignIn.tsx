import React, { useState } from "react";
import { useLocation } from "wouter";
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

    try {
      const loginData = {
        email: email || "admin@admin.com",
        password: password || "Admin123!"
      };

      console.log("📤 Sending login request to backend...");
      console.log("📤 Login data:", loginData);
      console.log("📤 Request body:", JSON.stringify(loginData));

      // Call the actual backend API with more robust error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const requestConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' as RequestCredentials,
        body: JSON.stringify(loginData),
        signal: controller.signal
      };

      console.log("📤 Request config:", requestConfig);

      const response = await fetch('http://localhost:5000/api/auth/login', requestConfig);

      clearTimeout(timeoutId);

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("📥 Error response text:", errorText);

        // Try to parse as JSON to get more details
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.log("📥 Error data parsed:", errorData);
        } catch (e) {
          console.log("📥 Could not parse error as JSON");
        }

        throw new Error(`Login failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (data.success && data.data) {
        // Store user data and token
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        console.log("✅ Login successful:", data.data.user);
        console.log("🔄 Redirecting to dashboard...");

        // Redirect to dashboard
        setLocation("/dashboard");
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error("❌ Login error:", err);

      if (err.name === 'AbortError') {
        setError("Request timeout. Please check your connection and try again.");
      } else if (err.message.includes('Failed to fetch')) {
        setError("Cannot connect to server. Please ensure the backend is running on http://localhost:5000");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    console.log("🔐 DEMO SIGNIN CLICKED!");
    setEmail("admin@admin.com");
    setPassword("Admin123!");
    // Wait a bit for the state to update
    setTimeout(() => handleSignIn(), 100);
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
            onClick={async () => {
              setError("");
              setIsLoading(true);

              try {
                console.log("🔐 Direct demo login attempt");

                const response = await fetch('http://localhost:5000/api/auth/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  credentials: 'include',
                  body: JSON.stringify({
                    email: "admin@admin.com",
                    password: "Admin123!"
                  }),
                });

                console.log("Response status:", response.status);

                const data = await response.json();
                console.log("Response data:", data);

                if (response.ok && data.success) {
                  localStorage.setItem("token", data.data.token);
                  localStorage.setItem("user", JSON.stringify(data.data.user));
                  console.log("✅ Login successful, redirecting...");
                  setLocation("/dashboard");
                } else {
                  setError(data.message || 'Login failed');
                }
              } catch (err) {
                console.error("❌ Error:", err);
                setError('Network error occurred');
              } finally {
                setIsLoading(false);
              }
            }}
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

