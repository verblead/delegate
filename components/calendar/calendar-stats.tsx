"use client";

import { Card } from "@/components/ui/card";
import { CalendarEvent } from "@/hooks/use-calendar-events";
import { CheckCircle2, Clock, HandHeart } from "lucide-react";

interface CalendarStatsProps {
  events: CalendarEvent[];
}

export function CalendarStats({ events }: CalendarStatsProps) {
  const stats = {
    total: events.length,
    tasks: events.filter((e) => e.type === "task").length,
    volunteer: events.filter((e) => e.type === "volunteer").length,
    completed: events.filter((e) => e.status === "completed").length,
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total Events</span>
        <span className="font-medium">{stats.total}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle2 className="h-4 w-4" />
          Tasks
        </span>
        <span className="font-medium">{stats.tasks}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <HandHeart className="h-4 w-4" />
          Volunteer
        </span>
        <span className="font-medium">{stats.volunteer}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          Completed
        </span>
        <span className="font-medium">{stats.completed}</span>
      </div>
    </Card>
  );
}