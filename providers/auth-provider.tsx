"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient, type User } from "@supabase/auth-helpers-nextjs";
import { AuthContext } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

// Create Supabase client with persistent session handling
const supabase = createClientComponentClient({
  options: {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let refreshInterval: NodeJS.Timeout;

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session) {
            setUser(session.user);
            // Start session refresh
            refreshInterval = setInterval(async () => {
              try {
                const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
                if (refreshError) throw refreshError;
                if (refreshedSession) {
                  setUser(refreshedSession.user);
                } else {
                  // If no session returned, sign out
                  await signOut();
                }
              } catch (error) {
                console.error('Error refreshing session:', error);
              }
            }, 240000); // Refresh every 4 minutes
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);

        if (session?.user) {
          setUser(session.user);
          if (event === 'SIGNED_IN') {
            router.push('/dashboard');
          }
        } else {
          setUser(null);
          if (event === 'SIGNED_OUT') {
            router.push('/');
            // Clear refresh interval on sign out
            if (refreshInterval) {
              clearInterval(refreshInterval);
            }
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      // Clear refresh interval on unmount
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [router]);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirmed: false,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Success",
          description: "Please check your email to verify your account.",
        });
        router.push("/login?registered=true");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          persistSession: true
        }
      });

      if (error) throw error;

      if (data.session) {
        setUser(data.session.user);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut({
        scope: 'local'
      });
      if (error) throw error;

      setUser(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}