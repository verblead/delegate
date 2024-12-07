"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { VolunteerActions } from "./volunteer-actions";
import { AlertCircle, Calendar, HandHeart, Trophy } from "lucide-react";
import { VolunteerTask } from "@/hooks/use-volunteer-tasks";
import { VolunteerTaskDialog } from "./volunteer-task-dialog";

interface VolunteerListProps {
  tasks: VolunteerTask[];
}

export function VolunteerList({ tasks }: VolunteerListProps) {
  const [selectedTask, setSelectedTask] = useState<VolunteerTask | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No volunteer tasks available</p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="p-6 cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setSelectedTask(task)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <Badge variant={task.status === "completed" ? "default" : "outline"}>
                        {task.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    <Trophy className="h-4 w-4 mr-1" />
                    {task.points} points
                  </Badge>
                </div>

                {task.due_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Due {formatDistanceToNow(new Date(task.due_date), {
                        addSuffix: true,
                      })}
                    </span>
                    {new Date(task.due_date) < new Date() && task.status !== "completed" && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                  </div>
                )}

                <div onClick={(e) => e.stopPropagation()}>
                  <VolunteerActions task={task} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <VolunteerTaskDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </>
  );
}