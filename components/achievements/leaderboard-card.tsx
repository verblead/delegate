"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal } from "lucide-react";

interface LeaderboardUser {
  id: string;
  username: string;
  avatar_url: string;
  points: number;
}

export function LeaderboardCard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, points")
        .order("points", { ascending: false })
        .limit(5);

      if (data) {
        setUsers(data);
      }
    };

    fetchLeaderboard();
  }, [supabase]);

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return "text-yellow-500";
      case 1:
        return "text-gray-400";
      case 2:
        return "text-amber-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Top Contributors</h3>
      <div className="space-y-4">
        {users.map((user, index) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 text-center">
                {index < 3 ? (
                  <Medal className={`h-5 w-5 ${getMedalColor(index)}`} />
                ) : (
                  <span className="text-muted-foreground">{index + 1}</span>
                )}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">@{user.username}</span>
            </div>
            <span className="font-semibold">{user.points} pts</span>
          </div>
        ))}
      </div>
    </Card>
  );
}