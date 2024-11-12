"use client";

import { useGamification } from "@/hooks/use-gamification";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

export function PointsDisplay() {
  const { totalPoints } = useGamification();

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-2">
        <Star className="h-5 w-5 text-yellow-500" />
        <span className="font-bold">{totalPoints}</span>
        <span className="text-muted-foreground">points</span>
      </div>
    </Card>
  );
}