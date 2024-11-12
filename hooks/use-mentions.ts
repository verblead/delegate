"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';

export function useMentions() {
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .order('email');

      if (!error && data) {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const searchUsers = (query: string) => {
    if (!query) return [];
    const lowercaseQuery = query.toLowerCase();
    return users.filter(user => 
      user.email.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    users,
    loading,
    searchUsers
  };
}