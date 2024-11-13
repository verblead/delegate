"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smile, Send, Paperclip, Image } from 'lucide-react';
import { EmojiPicker } from './emoji-picker';
import { useSupabase } from '@/hooks/use-supabase';

interface DirectMessageInputProps {
  recipientId: string;
  onSend: (content: string, attachments?: File[]) => Promise<void>;
}

export function DirectMessageInput({ recipientId, onSend }: DirectMessageInputProps) {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { supabase } = useSupabase();

  const handleTyping = () => {
    supabase.channel(`typing:${recipientId}`)
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: {}
      });
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && attachments.length === 0) return;

    try {
      await onSend(content, attachments);
      setContent('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      {attachments.length > 0 && (
        <div className="flex gap-2 mb-2">
          {attachments.map((file, index) => (
            <div key={index} className="relative group">
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-20 w-20 object-cover rounded-md"
                />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center bg-muted rounded-md">
                  <Paperclip className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setAttachments(prev => [...prev, ...files]);
          }}
          multiple
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image className="h-5 w-5" />
        </Button>

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
          onKeyDown={handleTyping}
          placeholder="Type a message..."
          className="flex-1"
        />

        <Button type="submit" size="icon" disabled={!content.trim() && attachments.length === 0}>
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
} 