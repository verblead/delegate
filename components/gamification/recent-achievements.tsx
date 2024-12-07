"use client";

import { useGamification } from "@/hooks/use-gamification";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function RecentAchievements() {
  const { userAchievements } = useGamification();

  const recentAchievements = userAchievements
    .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
    .slice(0, 3);

  if (recentAchievements.length === 0) {
    return null;
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Recent Achievements</h3>
      <div className="space-y-3">
        {recentAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-center space-x-3"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {achievement.achievement?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(achievement.unlocked_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}