"use client";

import { useAchievements } from "@/hooks/use-achievements";
import { usePoints } from "@/hooks/use-points";
import { useStreaks } from "@/hooks/use-streaks";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy,
  Star,
  Zap,
  Medal,
  Target,
  TrendingUp,
  Crown,
  Award,
  Users,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { LeaderboardCard } from "@/components/achievements/leaderboard-card";
import { ActivityFeed } from "@/components/achievements/activity-feed";
import { ChallengeCard } from "@/components/achievements/challenge-card";
import { RewardsShop } from "@/components/achievements/rewards-shop";

const LEVELS = [
  { name: "Novice", min: 0, max: 100 },
  { name: "Apprentice", min: 100, max: 300 },
  { name: "Expert", min: 300, max: 600 },
  { name: "Master", min: 600, max: 1000 },
  { name: "Legend", min: 1000, max: Infinity }
];

export default function AchievementsPage() {
  const { achievements, userAchievements, loading: achievementsLoading } = useAchievements();
  const { totalPoints, loading: pointsLoading } = usePoints();
  const { streak, loading: streakLoading } = useStreaks();

  const getCurrentLevel = () => {
    return LEVELS.find(level => totalPoints >= level.min && totalPoints < level.max) || LEVELS[0];
  };

  const currentLevel = getCurrentLevel();
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const progressToNextLevel = nextLevel 
    ? ((totalPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  if (achievementsLoading || pointsLoading || streakLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Level</p>
              <h3 className="text-2xl font-bold">{currentLevel.name}</h3>
            </div>
          </div>
          <Progress value={progressToNextLevel} className="mt-4" />
          <p className="text-xs text-muted-foreground mt-2">
            {nextLevel ? `${nextLevel.min - totalPoints} points to ${nextLevel.name}` : "Max level reached!"}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Points</p>
              <h3 className="text-2xl font-bold">{totalPoints}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
              <h3 className="text-2xl font-bold">{streak?.current_streak || 0} days</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Medal className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Achievements</p>
              <h3 className="text-2xl font-bold">{userAchievements.length}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="rewards">Rewards Shop</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <LeaderboardCard />
            <ActivityFeed />
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {achievements.map((achievement) => {
              const unlocked = userAchievements.find(
                (ua) => ua.achievement_id === achievement.id
              );

              return (
                <Card
                  key={achievement.id}
                  className={`p-6 ${unlocked ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-lg ${
                        unlocked ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <Trophy
                        className={`h-6 w-6 ${
                          unlocked ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      {unlocked && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Unlocked{" "}
                          {formatDistanceToNow(new Date(unlocked.unlocked_at), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  {!unlocked && (
                    <Progress value={0} className="mt-4" />
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ChallengeCard
              title="Daily Login"
              description="Log in for 7 consecutive days"
              icon={Calendar}
              progress={Math.min((streak?.current_streak || 0) / 7 * 100, 100)}
              reward={50}
            />
            <ChallengeCard
              title="Team Player"
              description="Collaborate with 5 different team members"
              icon={Users}
              progress={60}
              reward={100}
            />
            <ChallengeCard
              title="Task Master"
              description="Complete 10 tasks this week"
              icon={Target}
              progress={40}
              reward={150}
            />
            <ChallengeCard
              title="Productivity Champion"
              description="Maintain a 5-day streak of completing all daily tasks"
              icon={TrendingUp}
              progress={20}
              reward={200}
            />
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <RewardsShop points={totalPoints} />
        </TabsContent>
      </Tabs>
    </div>
  );
}