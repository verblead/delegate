"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  created_at: string;
  uploaded_by: {
    username: string;
    avatar_url: string;
  };
}

export function useVolunteerTaskAttachments(taskId: string) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!taskId) return;

    const fetchAttachments = async () => {
      try {
        const { data, error } = await supabase
          .from("volunteer_task_attachments")
          .select(`
            *,
            uploaded_by:profiles!volunteer_task_attachments_uploaded_by_fkey(
              username,
              avatar_url
            )
          `)
          .eq("task_id", taskId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setAttachments(data || []);
      } catch (error) {
        console.error("Error fetching attachments:", error);
        toast({
          title: "Error",
          description: "Failed to load attachments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttachments();

    const channel = supabase
      .channel(`volunteer-task-attachments:${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "volunteer_task_attachments",
          filter: `task_id=eq.${taskId}`,
        },
        fetchAttachments
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [taskId, supabase, toast]);

  const uploadAttachment = async (file: File) => {
    if (!user) return;

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${taskId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("volunteer-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("volunteer-files")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("volunteer_task_attachments")
        .insert({
          task_id: taskId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
          uploaded_by: user.id,
        });

      if (dbError) throw dbError;
    } catch (error) {
      console.error("Error uploading attachment:", error);
      toast({
        title: "Error",
        description: "Failed to upload attachment",
        variant: "destructive",
      });
    }
  };

  const deleteAttachment = async (attachmentId: string, url: string) => {
    if (!user) return;

    try {
      const filePath = url.split("/").pop();
      if (!filePath) return;

      await supabase.storage.from("volunteer-files").remove([filePath]);
      await supabase
        .from("volunteer_task_attachments")
        .delete()
        .eq("id", attachmentId);
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        variant: "destructive",
      });
    }
  };

  return { attachments, loading, uploadAttachment, deleteAttachment };
}