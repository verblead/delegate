"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';
import { Workspace, WorkspaceMember, WorkspaceInvite } from '@/lib/supabase/schema';
import { useAuth } from './use-auth';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchWorkspaces = async () => {
      const { data, error } = await supabase
        .from('workspaces')
        .select(`
          *,
          members:workspace_members(count)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setWorkspaces(data);
      }
      setLoading(false);
    };

    fetchWorkspaces();

    const workspaceSubscription = supabase
      .channel('workspaces')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workspaces' },
        fetchWorkspaces
      )
      .subscribe();

    return () => {
      workspaceSubscription.unsubscribe();
    };
  }, [user]);

  const createWorkspace = async (name: string, description?: string) => {
    if (!user) return null;

    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert([
        {
          name,
          description,
          created_by: user.id
        }
      ])
      .select()
      .single();

    if (workspaceError) throw workspaceError;

    // Add creator as admin
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert([
        {
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'admin'
        }
      ]);

    if (memberError) throw memberError;
    return workspace;
  };

  const inviteMember = async (
    workspaceId: number,
    email: string,
    role: 'admin' | 'moderator' | 'member' = 'member'
  ) => {
    if (!user) return null;

    const token = uuidv4();
    const expiresAt = addDays(new Date(), 7);

    const { data, error } = await supabase
      .from('workspace_invites')
      .insert([
        {
          workspace_id: workspaceId,
          email,
          role,
          token,
          expires_at: expiresAt.toISOString(),
          created_by: user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const acceptInvite = async (token: string) => {
    if (!user) return false;

    const { data: invite, error: inviteError } = await supabase
      .from('workspace_invites')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invite) return false;

    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert([
        {
          workspace_id: invite.workspace_id,
          user_id: user.id,
          role: invite.role
        }
      ]);

    if (memberError) return false;

    // Delete the invite
    await supabase
      .from('workspace_invites')
      .delete()
      .eq('id', invite.id);

    return true;
  };

  return {
    workspaces,
    loading,
    createWorkspace,
    inviteMember,
    acceptInvite
  };
}