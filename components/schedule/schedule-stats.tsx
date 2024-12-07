"use client";

import { Card } from "@/components/ui/card";
import { ScheduleEvent } from "@/hooks/use-schedule";
import { CalendarClock, Clock, CheckCircle2, Users } from "lucide-react";
import { parseISO } from "date-fns";

interface ScheduleStatsProps {
  events: ScheduleEvent[];
}

export function ScheduleStats({ events }: ScheduleStatsProps) {
  const now = new Date();
  const stats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.start_time) > now).length,
    inProgress: events.filter(e => {
      const start = new Date(e.start_time);
      const end = new Date(e.end_time);
      return start <= now && end >= now;
    }).length,
    completed: events.filter(e => new Date(e.end_time) < now).length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <CalendarClock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Events
            </p>
            <h3 className="text-2xl font-bold">{stats.total}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-yellow-500/10">
            <Clock className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Upcoming
            </p>
            <h3 className="text-2xl font-bold">{stats.upcoming}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              In Progress
            </p>
            <h3 className="text-2xl font-bold">{stats.inProgress}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/10">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Completed
            </p>
            <h3 className="text-2xl font-bold">{stats.completed}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
}