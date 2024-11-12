"use client";

import { Task } from "@/lib/supabase/schema";
import { CheckCircle, Clock, PlayCircle } from "lucide-react";
import { format } from "date-fns";
import { TaskStatusUpdate } from "./task-status-update";

interface MessageTaskProps {
  task: Task;
  onUpdate: () => void;
}

export function MessageTask({ task, onUpdate }: MessageTaskProps) {
  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="mt-2 rounded-lg border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <h4 className="font-semibold">{task.title}</h4>
        </div>
        <span className="text-xs text-muted-foreground">
          Assigned to @{task.assigned_to}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{task.description}</p>
      {task.due_date && (
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Due {format(new Date(task.due_date), "PPP")}</span>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <TaskStatusUpdate task={task} onUpdate={onUpdate} />
      </div>
    </div>
  );
}