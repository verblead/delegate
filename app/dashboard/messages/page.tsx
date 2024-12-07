"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserSearch } from "@/components/messages/user-search";
import { DirectMessageView } from "@/components/messages/direct-message-view";
import { useConversations } from "@/hooks/use-conversations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Menu, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { conversations, addConversation } = useConversations();

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    addConversation(userId);
    setSearchDialogOpen(false);
    // On mobile, close sidebar when selecting a conversation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Mobile Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "w-full md:w-80 border-r bg-background absolute md:relative z-40 transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                  <DialogDescription>
                    Search for a user to start a conversation with.
                  </DialogDescription>
                </DialogHeader>
                <UserSearch onSelectUser={handleSelectUser} />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-2 overflow-y-auto flex-1">
            {conversations.map((conversation) => (
              <Button
                key={conversation.user_id}
                variant={selectedUserId === conversation.user_id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setSelectedUserId(conversation.user_id);
                  // On mobile, close sidebar when selecting a conversation
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage 
                    src={conversation.avatar_url || `https://avatar.vercel.sh/${conversation.user_id}`} 
                    alt={conversation.username} 
                  />
                  <AvatarFallback>
                    {conversation.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">@{conversation.username}</span>
                  {conversation.last_message && (
                    <span className="text-muted-foreground text-xs truncate max-w-[180px]">
                      {conversation.last_message}
                    </span>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {selectedUserId ? (
          <>
            {/* Mobile Back Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 left-4 z-30 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DirectMessageView recipientId={selectedUserId} />
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  );
}