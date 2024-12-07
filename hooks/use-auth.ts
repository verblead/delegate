"use client";

import { useContext } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const enhancedSignUp = async (email: string, password: string) => {
    try {
      await context.signUp(email, password);
      toast({
        title: "Check your email",
        description: "We've sent you a verification link to complete your registration.",
      });
    } catch (error: any) {
      let errorMessage = "Failed to create account";
      
      if (error.code === "email_address_not_authorized") {
        errorMessage = "This email domain is not authorized. Please use your organization email.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return {
    ...context,
    signUp: enhancedSignUp,
  };
}