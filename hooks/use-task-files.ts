"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface TaskFile {
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

export function useTaskFiles(taskId: string) {
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!taskId || !user) return;

    const fetchFiles = async () => {
      try {
        const { data, error } = await supabase
          .from("task_files")
          .select(`
            *,
            uploaded_by:profiles!task_files_uploaded_by_fkey(
              username,
              avatar_url
            )
          `)
          .eq("task_id", taskId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setFiles(data || []);
      } catch (error) {
        console.error("Error fetching task files:", error);
        toast({
          title: "Error",
          description: "Failed to load task files",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();

    const channel = supabase
      .channel(`task-files:${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_files",
          filter: `task_id=eq.${taskId}`,
        },
        fetchFiles
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [taskId, user, supabase, toast]);

  const uploadFile = async (file: File) => {
    if (!user) return;

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${taskId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("task-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("task-files")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("task_files").insert({
        task_id: taskId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl,
        uploaded_by: user.id,
      });

      if (dbError) throw dbError;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const deleteFile = async (fileId: string, url: string) => {
    if (!user) return;

    try {
      const filePath = url.split("/").pop();
      if (!filePath) return;

      await supabase.storage.from("task-files").remove([filePath]);
      await supabase.from("task_files").delete().eq("id", fileId);
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  return { files, loading, uploadFile, deleteFile };
}