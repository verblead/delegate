"use client";

import { useEffect } from "react";
import { ChatArea } from "@/components/chat/chat-area";
import { ChannelList } from "@/components/chat/channel-list";
import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";

export function DashboardContent() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      redirect("/login");
    }
  }, [user, loading]);

  if (loading) {
    return null;
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