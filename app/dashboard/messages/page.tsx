"use client";

import { useState } from "react";
import { useDirectMessages } from "@/hooks/use-direct-messages";
import { DirectMessageList } from "@/components/messages/direct-message-list";
import { DirectMessageView } from "@/components/messages/direct-message-view";
import { UserSearch } from "@/components/messages/user-search";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MessagesPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const { conversations, loading, addConversation, refreshConversations } = useDirectMessages();

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    addConversation(userId);
    setSearchDialogOpen(false);
  };

  const handleMessageSent = () => {
    refreshConversations();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Direct Messages</h2>
          <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
              </DialogHeader>
              <UserSearch 
                onSelectUser={handleSelectUser} 
                excludeIds={conversations.map(c => c.user_id)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <DirectMessageList
          conversations={conversations}
          selectedUserId={selectedUserId}
          onSelectUser={setSelectedUserId}
          onConversationRemoved={refreshConversations}
        />
      </div>
      {selectedUserId ? (
        <DirectMessageView 
          userId={selectedUserId} 
          onMessageSent={handleMessageSent}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Select a conversation or start a new one
        </div>
      )}
    </div>
  );
}