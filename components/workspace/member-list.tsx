"use client";

import { useState, useEffect } from "react";
import { useRoles } from "@/hooks/use-roles";
import { RoleManager } from "./role-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkspaceMember } from "@/lib/supabase/schema";
import { supabase } from "@/lib/supabase/config";

interface MemberListProps {
  workspaceId: number;
}

export function MemberList({ workspaceId }: MemberListProps) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { checkPermission } = useRoles();

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          user:auth.users (
            email
          )
        `)
        .eq('workspace_id', workspaceId);

      if (!error && data) {
        setMembers(data);
      }
      setLoading(false);
    };

    fetchMembers();

    const memberSubscription = supabase
      .channel(`workspace-members:${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workspace_members',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        fetchMembers
      )
      .subscribe();

    return () => {
      memberSubscription.unsubscribe();
    };
  }, [workspaceId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 p-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={`https://avatar.vercel.sh/${member.user_id}`} />
                <AvatarFallback>
                  {member.user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{member.user?.email}</p>
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(member.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <RoleManager
              type="workspace"
              id={workspaceId}
              userId={member.user_id}
              currentRole={member.role}
              userEmail={member.user?.email || ''}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}