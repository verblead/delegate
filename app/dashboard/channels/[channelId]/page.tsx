"use client";

import { useParams } from "next/navigation";
import { ChatArea } from "@/components/chat/chat-area";
import { ChannelList } from "@/components/chat/channel-list";
import { UserPresence } from "@/components/chat/user-presence";

export default function ChannelPage() {
  const { channelId } = useParams();

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background w-full">
      <div className="w-60 flex-shrink-0 border-r">
        <ChannelList />
      </div>
      <div className="flex-1 min-w-0">
        {channelId ? (
          <ChatArea channelId={channelId as string} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a channel to start messaging
          </div>
        )}
      </div>
      <div className="w-60 flex-shrink-0 border-l">
        <UserPresence />
      </div>
    </div>
  );
}