"use client";

import { useChat } from "@/hooks/use-chat";
import { MessageInput } from "./message-input";
import { MessageList } from "./message-list";
import { Button } from "@/components/ui/button";
import { Users, MoreHorizontal, UserPlus } from "lucide-react";
import { useChannels } from "@/hooks/use-channels";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddUserDialog } from "./add-user-dialog";
import { MemberListDialog } from "./member-list-dialog";
import { ChannelSettingsDialog } from "./channel-settings-dialog";

interface ChatAreaProps {
  channelId: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string | null;
  is_private: boolean;
}

interface ChannelSettingsData {
  name: string;
  description: string | undefined;
  is_private: boolean;
}

export function ChatArea({ channelId }: ChatAreaProps) {
  const { messages, loading, sendMessage } = useChat(channelId);
  const { channels } = useChannels();
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [memberListOpen, setMemberListOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const channel = channels.find(c => c.id === channelId);
    if (channel) {
      setCurrentChannel({
        id: channel.id,
        name: channel.name,
        description: channel.description || null,
        is_private: channel.is_private
      });
    }
  }, [channelId, channels]);

  useEffect(() => {
    console.log('Current channelId:', channelId);
    console.log('Current messages:', messages);
  }, [channelId, messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-4 h-14 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {currentChannel?.name || ""}
          </span>
          {currentChannel?.description && (
            <span className="text-xs text-muted-foreground">
              {currentChannel.description}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setAddUserDialogOpen(true)}>
            <UserPlus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMemberListOpen(true)}>
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {Array.isArray(messages) && messages.length > 0 ? (
            <MessageList messages={messages} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-muted-foreground">
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs">Start the conversation!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <MessageInput onSend={sendMessage} channelId={channelId} />
      </div>

      <AddUserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        channelId={channelId}
      />

      <MemberListDialog
        open={memberListOpen}
        onOpenChange={setMemberListOpen}
        channelId={channelId}
      />

      {currentChannel && (
        <ChannelSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          channelId={channelId}
          initialData={{
            name: currentChannel.name,
            description: currentChannel.description || undefined,
            is_private: currentChannel.is_private
          }}
        />
      )}
    </div>
  );
}