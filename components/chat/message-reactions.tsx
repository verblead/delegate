"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";
import { useReactions } from "@/hooks/use-reactions";
import { useAuth } from "@/hooks/use-auth";

const commonEmojis = ["👍", "❤️", "😄", "🎉", "🚀", "👀", "🙌", "💯"];

interface MessageReactionsProps {
  messageId: string;
}

export function MessageReactions({ messageId }: MessageReactionsProps) {
  const { reactions, toggleReaction, loading } = useReactions(messageId);
  const { user } = useAuth();
  const [showPicker, setShowPicker] = useState(false);

  const handleReaction = async (emoji: string) => {
    await toggleReaction(emoji);
    setShowPicker(false);
  };

  return (
    <div className="flex items-center gap-1">
      {Object.entries(reactions).map(([emoji, users]) => (
        <Button
          key={emoji}
          variant={users.includes(user?.id || "") ? "secondary" : "ghost"}
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => handleReaction(emoji)}
          disabled={loading}
        >
          {emoji} {users.length}
        </Button>
      ))}
      
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align="end">
          <div className="grid grid-cols-8 gap-1">
            {commonEmojis.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleReaction(emoji)}
                disabled={loading}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}