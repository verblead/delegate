"use client";

import { Card } from "@/components/ui/card";
import { Users, Shield, Trophy, Activity } from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { useEffect, useState } from "react";

interface Stats {
  totalMembers: number;
  activeMembers: number;
  totalPoints: number;
  averageStreak: number;
}

export function MembersStats() {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeMembers: 0,
    totalPoints: 0,
    averageStreak: 0
  });
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: totalMembers },
        { count: activeMembers },
        { data: pointsData },
        { data: streakData }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase.from("profiles").select("*", { count: "exact" }).eq("status", "online"),
        supabase.from("profiles").select("points"),
        supabase.from("activity_streaks").select("current_streak")
      ]);

      const totalPoints = pointsData?.reduce((sum, p) => sum + (p.points || 0), 0) || 0;
      const averageStreak = streakData?.reduce((sum, s) => sum + (s.current_streak || 0), 0) / (streakData?.length || 1) || 0;

      setStats({
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        totalPoints,
        averageStreak: Math.round(averageStreak)
      });
    };

    fetchStats();
  }, [supabase]);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Members
            </p>
            <h3 className="text-2xl font-bold">{stats.totalMembers}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/10">
            <Shield className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Active Now
            </p>
            <h3 className="text-2xl font-bold">{stats.activeMembers}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-yellow-500/10">
            <Trophy className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Points
            </p>
            <h3 className="text-2xl font-bold">{stats.totalPoints}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <Activity className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Avg. Streak
            </p>
            <h3 className="text-2xl font-bold">{stats.averageStreak} days</h3>
          </div>
        </div>
      </Card>
    </div>
  );
}