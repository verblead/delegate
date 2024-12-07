"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface Certificate {
  id: string;
  course_id: string;
  certificate_url: string;
  issued_at: string;
  course: {
    title: string;
  };
}

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchCertificates = async () => {
      try {
        const { data, error } = await supabase
          .from("certificates")
          .select(`
            *,
            course:training_courses(title)
          `)
          .eq("user_id", user.id)
          .order("issued_at", { ascending: false });

        if (error) throw error;
        setCertificates(data || []);
      } catch (error) {
        console.error("Error fetching certificates:", error);
        toast({
          title: "Error",
          description: "Failed to load certificates",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();

    const channel = supabase
      .channel("certificates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "certificates",
          filter: `user_id=eq.${user.id}`,
        },
        fetchCertificates
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase, toast]);

  const generateCertificate = async (courseId: string) => {
    if (!user) return;

    try {
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) throw new Error("Failed to generate certificate");

      const { certificateUrl } = await response.json();
      return certificateUrl;
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast({
        title: "Error",
        description: "Failed to generate certificate",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    certificates,
    loading,
    generateCertificate,
  };
}