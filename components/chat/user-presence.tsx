"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { usePresence } from "@/hooks/use-presence";

export function UserPresence() {
  const { onlineUsers, loading } = usePresence();
  const router = useRouter();

  const handleMessageUser = (userId: string) => {
    router.push(`/dashboard/messages?user=${userId}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">
          Online Now ({onlineUsers.length})
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-2 py-3 space-y-[2px]">
          {onlineUsers.map((profile) => (
            <Button
              key={profile.id}
              variant="ghost"
              className="w-full justify-start px-2 py-2 h-auto"
              onClick={() => handleMessageUser(profile.id)}
            >
              <div className="flex items-center w-full gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback>
                      {profile.username?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-background" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {profile.username}
                  </span>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Send message
                    </span>
                  </div>
                </div>
              </div>
            </Button>
          ))}
          {onlineUsers.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No one else is online
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}