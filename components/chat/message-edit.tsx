"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Check } from "lucide-react";

interface MessageEditProps {
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export function MessageEdit({ content, onSave, onCancel }: MessageEditProps) {
  const [value, setValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.setSelectionRange(value.length, value.length);
  }, [value.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSave(value);
      }
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        className="resize-none"
      />
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          onClick={() => value.trim() && onSave(value)}
          className="h-7"
        >
          <Check className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="h-7"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <span className="text-xs text-muted-foreground">
          Press Enter to save, Escape to cancel
        </span>
      </div>
    </div>
  );
}