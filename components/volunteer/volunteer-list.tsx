"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { VolunteerActions } from "./volunteer-actions";
import { AlertCircle, Calendar, HandHeart, Trophy } from "lucide-react";
import { VolunteerTask } from "@/hooks/use-volunteer-tasks";

interface VolunteerListProps {
  tasks: VolunteerTask[];
}

export function VolunteerList({ tasks }: VolunteerListProps) {
  const getStatusColor = (status: VolunteerTask["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "in_progress":
        return "text-blue-500 bg-blue-500/10";
      case "open":
        return "text-yellow-500 bg-yellow-500/10";
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <Card key={task.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                </div>
                <Badge variant="secondary">
                  <Trophy className="h-4 w-4 mr-1" />
                  {task.points} points
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <HandHeart className="h-4 w-4 mr-1" />
                  Posted by @{task.creator?.username}
                </div>
                <span>•</span>
                <div>
                  {formatDistanceToNow(new Date(task.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              {task.volunteer && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Badge variant="outline">
                    Volunteer: @{task.volunteer.username}
                  </Badge>
                </div>
              )}

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

              <VolunteerActions task={task} />
            </div>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full text-center py-12">
            <HandHeart className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No tasks available</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for new volunteer opportunities
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}