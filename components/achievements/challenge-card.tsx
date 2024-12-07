"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ChallengeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  progress: number;
  reward: number;
}

export function ChallengeCard({
  title,
  description,
  icon: Icon,
  progress,
  reward,
}: ChallengeCardProps) {
  const isComplete = progress >= 100;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium">{reward} pts</span>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Progress value={progress} />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{progress}% complete</span>
          {isComplete && (
            <Button size="sm" variant="outline">
              Claim Reward
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}