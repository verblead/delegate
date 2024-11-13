"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Send, Paperclip } from "lucide-react";
import { EmojiPicker } from "./emoji-picker";
import { useSupabase } from "@/hooks/use-supabase";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/hooks/use-auth";

interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => Promise<void>;
  attachments?: File[];
  onAttachmentsChange?: (files: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
  channelId: string;
}

export function MessageInput({
  onSend,
  attachments = [],
  onAttachmentsChange,
  placeholder = "Type a message...",
  disabled = false,
  channelId
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onAttachmentsChange) {
      onAttachmentsChange([...attachments, ...Array.from(files)]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !fileInputRef.current?.files) return;
    if (!user) return;

    try {
      setUploading(true);

      // First create the message
      const { data: message, error: messageError } = await supabase
        .from("messages")
        .insert({
          content: content.trim() || "(attachment)",
          channel_id: channelId,
          sender_id: user.id
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Then handle file upload if exists
      if (fileInputRef.current?.files && message) {
        const files = fileInputRef.current.files;
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split(".").pop();
          const filePath = `${channelId}/${user.id}/${uuidv4()}.${fileExt}`;

          // Upload file to storage
          const { error: uploadError } = await supabase.storage
            .from("message-attachments")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from("message-attachments")
            .getPublicUrl(filePath);

          // Create attachment record
          const { error: attachmentError } = await supabase
            .from("message_attachments")
            .insert({
              message_id: message.id,
              file_name: file.name,
              file_type: file.type,
              file_size: file.size,
              url: publicUrl
            });

          if (attachmentError) throw attachmentError;
        }
      }

      // Call onSend after successful message and attachment creation
      onSend(content, fileInputRef.current?.files ? Array.from(fileInputRef.current.files) : undefined);
      
      // Reset form
      setContent("");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border-t relative">
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          multiple
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-muted rounded-md"
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </button>

        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 hover:bg-muted rounded-md"
          disabled={disabled}
        >
          <Smile className="h-5 w-5 text-muted-foreground" />
        </button>

        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || uploading}
          className="flex-1"
        />

        <Button 
          type="submit" 
          size="icon"
          disabled={disabled || uploading || (!content.trim() && attachments.length === 0)}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}