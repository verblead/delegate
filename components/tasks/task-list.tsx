"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { TaskActions } from "./task-actions";
import { AlertCircle, Calendar, Clock, MessageSquare } from "lucide-react";
import { TaskDetailDialog } from "./task-detail-dialog";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
  created_by: { username: string };
  assigned_to: { username: string };
  messages?: { count: number };
}

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-500 bg-red-500/10";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10";
      case "low":
        return "text-green-500 bg-green-500/10";
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "in_progress":
        return "text-blue-500 bg-blue-500/10";
      case "pending":
        return "text-yellow-500 bg-yellow-500/10";
    }
  };

  return (
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
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(task.created_at), {
                    addSuffix: true,
                  })}
                </div>
                {task.messages && task.messages.count > 0 && (
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {task.messages.count}
                  </div>
                )}
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

              <TaskActions task={task} />
            </div>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
            <p className="text-sm text-muted-foreground">
              Tasks you accept from the volunteer board will appear here
            </p>
          </div>
        )}
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </ScrollArea>
  );
}