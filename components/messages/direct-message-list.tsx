"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Conversation } from "@/hooks/use-direct-messages";
import { X } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface DirectMessageListProps {
  conversations: Conversation[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onConversationRemoved?: () => void;
}

export function DirectMessageList({
  conversations,
  selectedUserId,
  onSelectUser,
  onConversationRemoved,
}: DirectMessageListProps) {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleRemoveConversation = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('direct_messages')
        .delete()
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);

      if (error) throw error;

      toast({
        title: "Conversation removed",
        description: "The conversation has been removed successfully",
      });

      // Notify parent component to refresh conversations
      if (onConversationRemoved) {
        onConversationRemoved();
      }

      // If the removed conversation was selected, clear selection
      if (selectedUserId === userId) {
        onSelectUser("");
      }
    } catch (error) {
      console.error('Error removing conversation:', error);
      toast({
        title: "Error",
        description: "Failed to remove conversation",
        variant: "destructive",
      });
    }
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-[2px]">
        {conversations.map((conversation) => (
          <div
            key={conversation.user_id}
            className={cn(
              "group flex items-center w-full gap-3 p-2 rounded-md hover:bg-accent cursor-pointer relative",
              selectedUserId === conversation.user_id && "bg-accent"
            )}
            onClick={() => onSelectUser(conversation.user_id)}
          >
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={conversation.avatar_url} />
              <AvatarFallback>
                {conversation.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">
                  @{conversation.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {conversation.last_message_at &&
                    formatDistanceToNow(new Date(conversation.last_message_at), {
                      addSuffix: true,
                    })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.last_message}
                </p>
                {conversation.unread_count > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2"
              onClick={(e) => handleRemoveConversation(conversation.user_id, e)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {conversations.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start a new conversation by clicking the + button above
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}