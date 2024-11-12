"use client";

import { Card } from "@/components/ui/card";
import { Project } from "@/hooks/use-projects";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  PauseCircle 
} from "lucide-react";

interface ProjectStatsProps {
  projects: Project[];
}

export function ProjectStats({ projects }: ProjectStatsProps) {
  const stats = {
    planning: projects.filter((p) => p.status === "planning").length,
    in_progress: projects.filter((p) => p.status === "in_progress").length,
    completed: projects.filter((p) => p.status === "completed").length,
    on_hold: projects.filter((p) => p.status === "on_hold").length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-yellow-500/10">
            <Clock className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Planning</p>
            <h3 className="text-2xl font-bold">{stats.planning}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <AlertCircle className="h-6 w-6 text-blue-500" />
          </div>
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
          <div className="p-3 rounded-lg bg-green-500/10">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <h3 className="text-2xl font-bold">{stats.completed}</h3>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-gray-500/10">
            <PauseCircle className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">On Hold</p>
            <h3 className="text-2xl font-bold">{stats.on_hold}</h3>
          </div>
        </div>
      </Card>
    </div>
  );
}