"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const commonEmojis = [
  "😊", "😂", "🥰", "😍", "😎", 
  "👍", "👎", "❤️", "🎉", "🔥",
  "⭐", "✨", "💡", "💪", "🙌",
  "👀", "💯", "🚀", "👏", "🙏"
];

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  return (
    <Card className="w-[240px]">
      <CardContent className="p-2">
        <div className="grid grid-cols-5 gap-1">
          {commonEmojis.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              className="h-9 w-9 p-0 hover:bg-muted"
              onClick={() => onEmojiSelect(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}