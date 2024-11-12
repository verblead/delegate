"use client";

import { useState, useEffect } from 'react';
import { useSupabase } from './use-supabase';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

export type UserRole = 'admin' | 'moderator' | 'member' | 'banned';

export function useRoles() {
  const [userRole, setUserRole] = useState<UserRole>('member');
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchUserRole = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setUserRole(data.role as UserRole);
      }
      setLoading(false);
    };

    fetchUserRole();

    const channel = supabase
      .channel(`profile-role-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        fetchUserRole
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, supabase]);

  const isAdmin = () => userRole === 'admin';
  const isModerator = () => userRole === 'moderator' || userRole === 'admin';

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!user) return false;

    try {
      // Verify current user is admin
      const { data: adminCheck } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (adminCheck?.role !== 'admin') {
        throw new Error('Only admins can update roles');
      }

      // Update the user's role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Verify the update
      const { data: verifyUpdate, error: verifyError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (verifyError) throw verifyError;
      if (verifyUpdate.role !== newRole) {
        throw new Error('Role update failed verification');
      }

      toast({
        title: 'Success',
        description: `User role updated to ${newRole}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    userRole,
    loading,
    isAdmin,
    isModerator,
    updateUserRole
  };
}