"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, Shield, User, Trophy } from "lucide-react";
import { UserProfileDialog } from "./user-profile-dialog";

interface Member {
  id: string;
  username: string;
  avatar_url: string | null;
  role: string;
  points: number;
}

interface MemberListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
}

export function MemberListDialog({ open, onOpenChange, channelId }: MemberListDialogProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { supabase } = useSupabase();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;

    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('channel_members_with_profiles')
          .select('*')
          .eq('channel_id', channelId);

        if (error) throw error;

        setMembers(data || []);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast({
          title: "Error",
          description: "Failed to load channel members",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();

    const channel = supabase
      .channel(`channel-members:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channel_members',
          filter: `channel_id=eq.${channelId}`
        },
        fetchMembers
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [channelId, open, supabase, toast]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Channel Members</DialogTitle>
          </DialogHeader>
          <div className="h-[400px] flex items-center justify-center">
            Loading members...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Channel Members</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => setSelectedUserId(member.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url || `https://avatar.vercel.sh/${member.id}`} />
                      <AvatarFallback>
                        {member.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">@{member.username}</span>
                        <Badge variant="outline" className="text-xs">
                          <Trophy className="h-3 w-3 mr-1" />
                          {member.points} pts
                        </Badge>
                      </div>
                      <Badge variant={getRoleBadgeVariant(member.role)} className="w-fit mt-1">
                        <span className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {members.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No members found
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <UserProfileDialog 
        userId={selectedUserId} 
        onOpenChange={(open) => !open && setSelectedUserId(null)} 
      />
    </>
  );
}