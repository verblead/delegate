"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Send, Paperclip, X } from "lucide-react";
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
    if ((!content.trim() && attachments.length === 0) || !user) return;

    try {
      setUploading(true);

      await onSend(content, attachments);
      setContent("");
      if (onAttachmentsChange) {
        onAttachmentsChange([]);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-2 p-4 bg-background border-t">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
          multiple
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={disabled || uploading}
        >
          <Smile className="h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="pr-10"
            disabled={disabled || uploading}
          />
          {attachments.length > 0 && (
            <div className="absolute -top-16 left-0 right-0 bg-background border rounded-md p-2">
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                    <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        if (onAttachmentsChange) {
                          onAttachmentsChange(attachments.filter((_, i) => i !== index));
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Button 
          type="submit" 
          size="icon"
          className="h-9 w-9"
          disabled={disabled || uploading || (!content.trim() && attachments.length === 0)}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      {showEmojiPicker && (
        <div className="absolute bottom-full right-0 mb-2">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </form>
  );
}