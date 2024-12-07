"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, Clock, Target } from "lucide-react";
import { useTraining } from "@/hooks/use-training";
import { StreakTracker } from "./streak-tracker";

interface TrainingOverviewProps {
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
}

export function TrainingOverview({
  totalCourses,
  completedCourses,
  totalLessons,
  completedLessons,
}: TrainingOverviewProps) {
  const { streak } = useTraining();
  const courseProgress = (completedCourses / totalCourses) * 100;
  const lessonProgress = (completedLessons / totalLessons) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedCourses}/{totalCourses}</div>
          <Progress value={courseProgress} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedLessons}/{totalLessons}</div>
          <Progress value={lessonProgress} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12.5h</div>
          <p className="text-xs text-muted-foreground mt-2">This month</p>
        </CardContent>
      </Card>

      <StreakTracker 
        currentStreak={streak?.current_streak || 0}
        longestStreak={streak?.longest_streak || 0}
        lastActivityDate={streak?.last_activity || new Date().toISOString()}
      />
    </div>
  );
} 