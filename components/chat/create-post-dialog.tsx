"use client";

import { useState, useRef } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileUpload } from "./file-upload";
import { Loader2, Image, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatePostDialogProps {
  channelId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({
  channelId,
  open,
  onOpenChange,
}: CreatePostDialogProps) {
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!content.trim() && attachments.length === 0)) return;

    setLoading(true);
    try {
      // Create the post
      const { data: post, error: postError } = await supabase
        .from("channel_posts")
        .insert({
          channel_id: channelId,
          content: content.trim(),
          user_id: user.id,
          has_attachments: attachments.length > 0,
        })
        .select()
        .single();

      if (postError) throw postError;

      // Upload attachments if any
      if (attachments.length > 0 && post) {
        for (const file of attachments) {
          const fileExt = file.name.split(".").pop();
          const filePath = `${channelId}/${post.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("post-attachments")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("post-attachments")
            .getPublicUrl(filePath);

          await supabase.from("post_attachments").insert({
            post_id: post.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            url: urlData.publicUrl,
          });
        }
      }

      toast({
        title: "Success",
        description: "Post created successfully",
      });

      onOpenChange(false);
      setContent("");
      setAttachments([]);
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            Share your thoughts or upload files to this channel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[150px]"
          />

          <div className="space-y-4">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-muted"
              >
                <div className="flex items-center space-x-2">
                  {file.type.startsWith("image/") ? (
                    <Image className="h-4 w-4" />
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                  <span className="text-sm truncate max-w-[200px]">
                    {file.name}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setAttachments(attachments.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setAttachments((prev) => [...prev, ...files]);
            }}
            multiple
          />

          <DialogFooter className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Add Attachments
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Post"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}