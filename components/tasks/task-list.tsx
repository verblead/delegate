"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { TaskDetailDialog } from "./task-detail-dialog";
import { Calendar } from "lucide-react";

interface Task {
  id: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  channel_id: string;
  created_at: string;
  created_by: string;
  assigned_to: string;
  message_id: string;
}

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No tasks found</p>
      </div>
    );
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="p-4 hover:bg-accent cursor-pointer" onClick={() => setSelectedTask(task)}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={task.status === "completed" ? "default" : "outline"}>
                    {task.status}
                  </Badge>
                  <Badge variant={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                {task.due_date && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={() => setSelectedTask(null)}
        />
      )}
    </ScrollArea>
  );
}