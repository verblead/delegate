"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/config';
import { Points } from '@/lib/supabase/schema';
import { useAuth } from './use-auth';

export function usePoints() {
  const [points, setPoints] = useState<Points[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchPoints = async () => {
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPoints(data);
        setTotalPoints(data.reduce((sum, p) => sum + p.amount, 0));
      }
      setLoading(false);
    };

    fetchPoints();

    const pointsSubscription = supabase
      .channel(`points:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'points',
          filter: `user_id=eq.${user.id}`
        },
        fetchPoints
      )
      .subscribe();

    return () => {
      pointsSubscription.unsubscribe();
    };
  }, [user]);

  return {
    points,
    totalPoints,
    loading
  };
}