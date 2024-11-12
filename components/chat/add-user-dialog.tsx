"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSupabase } from "@/hooks/use-supabase";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
}

interface User {
  id: string;
  username: string;
  avatar_url: string;
}

export function AddUserDialog({ open, onOpenChange, channelId }: AddUserDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<Record<string, boolean>>({});
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // First get existing members
      const { data: existingMembers } = await supabase
        .from("channel_members")
        .select("user_id")
        .eq("channel_id", channelId);

      const existingMemberIds = new Set(existingMembers?.map(m => m.user_id) || []);

      // Then search for users not already in the channel
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .ilike("username", `%${query}%`)
        .limit(10);

      if (error) throw error;

      const filteredUsers = (data || []).filter(user => !existingMemberIds.has(user.id));
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    }
  };

  const addUserToChannel = async (userId: string) => {
    try {
      setLoadingUsers(prev => ({ ...prev, [userId]: true }));

      // First check if user is already a member
      const { data: existingMember } = await supabase
        .from("channel_members")
        .select()
        .eq("channel_id", channelId)
        .eq("user_id", userId)
        .single();

      if (existingMember) {
        toast({
          title: "Already a member",
          description: "This user is already a member of the channel",
          variant: "destructive",
        });
        return;
      }

      // Add the user to the channel
      const { error } = await supabase
        .from("channel_members")
        .insert({
          channel_id: channelId,
          user_id: userId,
          role: "member"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User added to channel successfully",
      });

      // Remove the added user from search results
      setSearchResults(prev => prev.filter(user => user.id !== userId));
    } catch (error: any) {
      console.error("Error adding user to channel:", error);
      toast({
        title: "Error",
        description: "Failed to add user to channel",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User to Channel</DialogTitle>
          <DialogDescription>
            Search for users to add to this channel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">@{user.username}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addUserToChannel(user.id)}
                    disabled={loadingUsers[user.id]}
                  >
                    {loadingUsers[user.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
              ))}
              {searchQuery && searchResults.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No users found
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}