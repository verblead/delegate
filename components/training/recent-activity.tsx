"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, CheckCircle, Play } from "lucide-react";

interface Activity {
  id: string;
  activity_type: "started" | "completed" | "resumed";
  course: { title: string };
  lesson: { title: string };
  created_at: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: Activity["activity_type"]) => {
    switch (type) {
      case "started":
        return <Play className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "resumed":
        return <BookOpen className="h-4 w-4 text-orange-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="mt-1">{getActivityIcon(activity.activity_type)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {activity.activity_type === "completed" ? "Completed" : 
                     activity.activity_type === "started" ? "Started" : "Resumed"}{" "}
                    <span className="font-semibold">{activity.lesson?.title || "Unknown Lesson"}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.course?.title || "Unknown Course"}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 