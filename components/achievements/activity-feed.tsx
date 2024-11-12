"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Star, Target, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  user_id: string;
  type: "achievement" | "points" | "challenge" | "reward";
  description: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchActivities = async () => {
      const { data } = await supabase
        .from("user_activities")
        .select(`
          *,
          profiles (username)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setActivities(data);
      }
    };

    fetchActivities();

    const channel = supabase
      .channel("activities")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_activities" },
        fetchActivities
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "achievement":
        return <Trophy className="h-4 w-4 text-primary" />;
      case "points":
        return <Star className="h-4 w-4 text-yellow-500" />;
      case "challenge":
        return <Target className="h-4 w-4 text-blue-500" />;
      case "reward":
        return <Award className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Recent Activity</h3>
      <ScrollArea className="h-[300px]">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="mt-1">{getActivityIcon(activity.type)}</div>
              <div>
                <p className="text-sm">
                  <span className="font-medium">@{activity.profiles.username}</span>{" "}
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}