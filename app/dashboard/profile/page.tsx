"use client";

import { useAuth } from "@/hooks/use-auth";
import { PointsDisplay } from "@/components/gamification/points-display";
import { LevelProgress } from "@/components/gamification/level-progress";
import { RecentAchievements } from "@/components/gamification/recent-achievements";
import { StreakCard } from "@/components/achievements/streak-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="container py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} />
            <AvatarFallback>
              {user.email?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.email}</h1>
            <p className="text-muted-foreground">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <PointsDisplay />
          <LevelProgress />
        </div>

        <StreakCard />
        <RecentAchievements />
      </div>
    </div>
  );
}