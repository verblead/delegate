"use client";

import { useGamification } from "@/hooks/use-gamification";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

const POINTS_PER_LEVEL = 1000;

export function LevelProgress() {
  const { totalPoints } = useGamification();

  const currentLevel = Math.floor(totalPoints / POINTS_PER_LEVEL) + 1;
  const pointsInCurrentLevel = totalPoints % POINTS_PER_LEVEL;
  const progress = (pointsInCurrentLevel / POINTS_PER_LEVEL) * 100;

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Level {currentLevel}</span>
          <span className="text-muted-foreground">
            {pointsInCurrentLevel} / {POINTS_PER_LEVEL}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </Card>
  );
}