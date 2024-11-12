"use client";

import { useAchievements } from "@/hooks/use-achievements";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function AchievementsDisplay() {
  const { achievements, userAchievements, loading } = useAchievements();

  if (loading) {
    return <div>Loading achievements...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => {
        const userAchievement = userAchievements.find(
          (ua) => ua.achievement_id === achievement.id
        );
        const isUnlocked = !!userAchievement;

        return (
          <Card key={achievement.id} className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${
                isUnlocked ? "bg-primary/10" : "bg-muted"
              }`}>
                <Trophy className={`h-6 w-6 ${
                  isUnlocked ? "text-primary" : "text-muted-foreground"
                }`} />
              </div>
              <div>
                <h3 className="font-semibold">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                {isUnlocked && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Unlocked {formatDistanceToNow(
                      new Date(userAchievement.earned_at),
                      { addSuffix: true }
                    )}
                  </p>
                )}
              </div>
            </div>
            {!isUnlocked && (
              <Progress 
                value={0} 
                className="mt-4" 
                title="Progress towards achievement"
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}