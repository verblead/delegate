"use client";

import { Achievement, UserAchievement } from "@/lib/supabase/schema";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  progress?: number;
}

export function AchievementCard({
  achievement,
  userAchievement,
  progress = 0,
}: AchievementCardProps) {
  const isUnlocked = !!userAchievement;

  return (
    <Card className={`p-6 ${isUnlocked ? "bg-primary/5" : ""}`}>
      <div className="flex items-center space-x-4">
        <div
          className={`p-3 rounded-lg ${
            isUnlocked ? "bg-primary/10" : "bg-muted"
          }`}
        >
          <Trophy
            className={`h-6 w-6 ${
              isUnlocked ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{achievement.name}</h3>
          <p className="text-sm text-muted-foreground">
            {achievement.description}
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium">
            {achievement.points} points
          </span>
        </div>
      </div>

      {!isUnlocked && progress > 0 && (
        <div className="mt-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(progress)}% complete
          </p>
        </div>
      )}

      {isUnlocked && (
        <p className="text-xs text-muted-foreground mt-4">
          Unlocked{" "}
          {formatDistanceToNow(new Date(userAchievement.unlocked_at), {
            addSuffix: true,
          })}
        </p>
      )}
    </Card>
  );
}