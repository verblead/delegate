"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { GoogleSignIn } from "@/components/auth/google-signin";
import Link from "next/link";
import { MessagesSquare, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Form submission started");
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Attempting to sign in with:", { email });
      const session = await signIn(email, password);
      console.log("Sign in completed", { session });
      
      if (session?.access_token) {
        console.log("Valid session obtained, redirecting to dashboard");
        // Try multiple redirection methods
        try {
          // Force a page reload to ensure fresh state
          window.location.replace('/dashboard');
        } catch (error) {
          console.error("Failed to redirect:", error);
          // Fallback to direct navigation
          window.location.href = '/dashboard';
        }
      } else {
        console.error("No valid session after sign in");
        setError("Failed to authenticate. Please try again.");
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      let errorMessage = "Failed to sign in";
      
      if (error.message === "Invalid login credentials") {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message === "Email not confirmed") {
        errorMessage = "Please verify your email before signing in.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="flex flex-col items-center space-y-2">
          <Link href="/" className="flex items-center space-x-2">
            <MessagesSquare className="h-6 w-6" />
            <span className="font-bold text-2xl">Delegate</span>
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        {registered && (
          <Alert>
            <AlertDescription>
              Registration successful! Please check your email for verification.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <GoogleSignIn />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              onClick={(e) => {
                console.log("Button clicked");
                handleSubmit(e);
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}