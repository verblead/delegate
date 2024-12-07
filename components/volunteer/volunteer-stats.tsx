"use client";

import { Card } from "@/components/ui/card";
import { HandHeart, Clock, CheckCircle2 } from "lucide-react";

interface VolunteerTask {
  status: "open" | "in_progress" | "completed";
}

interface VolunteerStatsProps {
  tasks: VolunteerTask[];
}

export function VolunteerStats({ tasks }: VolunteerStatsProps) {
  const stats = {
    open: tasks.filter((t) => t.status === "open").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <HandHeart className="h-8 w-8 text-yellow-500" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Available Tasks
            </p>
            <h3 className="text-2xl font-bold">{stats.open}</h3>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Clock className="h-8 w-8 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              In Progress
            </p>
            <h3 className="text-2xl font-bold">{stats.in_progress}</h3>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
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