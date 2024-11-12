"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Send } from "lucide-react";
import { EmojiPicker } from "./emoji-picker";
import { FileUpload } from "./file-upload";
import { useSupabase } from "@/hooks/use-supabase";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/hooks/use-auth";

interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => void;
  channelId: string;
}

export function MessageInput({ onSend, channelId }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;
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
      if (selectedFile && message) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `${channelId}/${user.id}/${uuidv4()}.${fileExt}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from("message-attachments")
          .upload(filePath, selectedFile);

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
            file_name: selectedFile.name,
            file_type: selectedFile.type,
            file_size: selectedFile.size,
            url: publicUrl
          });

        if (attachmentError) throw attachmentError;
      }

      // Call onSend after successful message and attachment creation
      onSend(content, selectedFile ? [selectedFile] : undefined);
      
      // Reset form
      setContent("");
      setSelectedFile(null);
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

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {selectedFile && (
        <FileUpload
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
          onRemove={() => setSelectedFile(null)}
          className="mb-2"
        />
      )}
      
      <div className="flex items-center gap-2">
        <FileUpload
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
          onRemove={() => setSelectedFile(null)}
        />

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </Button>
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 z-50">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
        </div>

        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={uploading}
        />

        <Button 
          type="submit" 
          size="icon"
          variant="ghost"
          disabled={(!content.trim() && !selectedFile) || uploading}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}