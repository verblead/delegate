"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Download, File, Upload, X } from "lucide-react";

interface TaskFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  created_at: string;
  uploaded_by: {
    username: string;
  };
}

interface TaskFilesProps {
  taskId: string;
}

export function TaskFiles({ taskId }: TaskFilesProps) {
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchFiles = async () => {
      const { data } = await supabase
        .from("task_files")
        .select(`
          id,
          name,
          size,
          type,
          url,
          created_at,
          uploaded_by:profiles!task_files_uploaded_by_fkey(username)
        `)
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (data) {
        setFiles(data);
      }
    };

    fetchFiles();

    const channel = supabase
      .channel(`task-files-${taskId}`)
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
  }, [taskId, supabase]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${taskId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("task-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("task-files")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("task_files").insert({
        task_id: taskId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: publicUrl,
      });

      if (dbError) throw dbError;
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId: string, url: string) => {
    try {
      const filePath = url.split("/").pop();
      if (!filePath) return;

      await supabase.storage.from("task-files").remove([filePath]);
      await supabase.from("task_files").delete().eq("id", fileId);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
          }}
          disabled={uploading}
          className="flex-1"
        />
        <Button disabled={uploading}>
          {uploading ? (
            "Uploading..."
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-24rem)]">
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted"
            >
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>@{file.uploaded_by.username}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(file.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(file.url)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteFile(file.id, file.url)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}