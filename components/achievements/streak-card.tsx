"use client";

import { useStreaks } from "@/hooks/use-streaks";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function StreakCard() {
  const { streak, loading } = useStreaks();

  if (loading || !streak) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Activity Streak</h3>
          <p className="text-2xl font-bold">
            {streak.current_streak}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              days
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Longest streak: {streak.longest_streak} days
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last activity:{" "}
            {formatDistanceToNow(new Date(streak.last_activity), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </Card>
  );
}