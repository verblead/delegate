"use client";

import { ChannelList } from "@/components/chat/channel-list";
import { ChatArea } from "@/components/chat/chat-area";
import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";

export default function ChannelsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-full">
      <div className="w-60 border-r">
        <ChannelList />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Select a channel to start messaging
        </div>
      </div>
    </div>
  );
}