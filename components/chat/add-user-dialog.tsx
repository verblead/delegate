"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "@/hooks/use-auth";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
}

interface User {
  id: string;
  username: string;
  avatar_url: string;
  status?: string;
  last_seen?: string;
}

export function AddUserDialog({ open, onOpenChange, channelId }: AddUserDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState<Record<string, boolean>>({});
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Load all users initially
  useEffect(() => {
    if (!open || !currentUser) return;

    const loadUsers = async () => {
      try {
        setLoading(true);
        
        // Get existing members
        const { data: existingMembers } = await supabase
          .from("channel_members")
          .select("user_id")
          .eq("channel_id", channelId);

        const existingMemberIds = new Set(existingMembers?.map(m => m.user_id) || []);

        // Get current user's role in the channel
        const { data: currentMember } = await supabase
          .from("channel_members")
          .select("role")
          .eq("channel_id", channelId)
          .eq("user_id", currentUser.id)
          .single();

        if (!currentMember || !['admin', 'owner'].includes(currentMember.role)) {
          throw new Error("You don't have permission to add users to this channel");
        }

        // Get all users except existing members
        const { data: allUsers, error } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, status, last_seen")
          .order("username");

        if (error) throw error;

        // Filter out existing members and current user
        const availableUsers = (allUsers || []).filter(
          user => !existingMemberIds.has(user.id) && user.id !== currentUser.id
        );
        
        setUsers(availableUsers);
        setFilteredUsers(availableUsers);
      } catch (error: any) {
        console.error("Error loading users:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load users",
          variant: "destructive",
        });
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [open, channelId, supabase, toast, currentUser, onOpenChange]);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const addUserToChannel = async (userId: string) => {
    if (!currentUser) return;
    
    try {
      setLoadingUsers(prev => ({ ...prev, [userId]: true }));

      // First verify the user exists in profiles
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (profileError || !userProfile) {
        throw new Error("User not found");
      }

      // Then check if they're already a member
      const { data: existingMember, error: memberError } = await supabase
        .from("channel_members")
        .select("id")
        .eq("channel_id", channelId)
        .eq("user_id", userId)
        .single();

      if (existingMember) {
        throw new Error("User is already a member of this channel");
      }

      // Finally, add them to the channel
      const { error: insertError } = await supabase
        .from("channel_members")
        .insert({
          channel_id: channelId,
          user_id: userId,
          role: "member"
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("Failed to add user to channel");
      }

      toast({
        title: "Success",
        description: "User added to channel successfully",
      });

      // Remove the added user from both lists
      const removeUser = (list: User[]) => list.filter(user => user.id !== userId);
      setUsers(prev => removeUser(prev));
      setFilteredUsers(prev => removeUser(prev));
    } catch (error: any) {
      console.error("Error adding user to channel:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add user to channel",
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
            Search or select users to add to this channel
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No users found
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user.avatar_url || `https://avatar.vercel.sh/${user.id}`} 
                          alt={user.username}
                        />
                        <AvatarFallback>
                          {user.username?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">@{user.username}</span>
                        {user.status && (
                          <span className="text-xs text-muted-foreground">
                            {user.status}
                          </span>
                        )}
                      </div>
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
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}