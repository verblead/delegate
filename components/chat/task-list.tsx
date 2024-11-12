"use client";

import { useState } from "react";
import { Task } from "@/lib/supabase/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { TaskStatusUpdate } from "./task-status-update";

interface TaskListProps {
  tasks: Task[];
  onUpdate: () => void;
}

export function TaskList({ tasks, onUpdate }: TaskListProps) {
  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-yellow-500/10 text-yellow-500";
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="p-4 space-y-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <Badge className={getStatusColor(task.status)}>
                  {task.status.replace("_", " ")}
                </Badge>
              </div>
              <CardDescription>
                Assigned to @{task.assigned_to}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {task.description}
              </p>
              <div className="flex items-center justify-between">
                <TaskStatusUpdate task={task} onUpdate={onUpdate} />
                {task.due_date && (
                  <span className="text-xs text-muted-foreground">
                    Due {format(new Date(task.due_date), "PPP")}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}