"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { TaskList } from "@/components/tasks/task-list";
import { TaskStats } from "@/components/tasks/task-stats";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function TasksPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "completed">("all");
  const { tasks, loading } = useTasks(filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground">
          View and manage your assigned tasks
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-[200px]">
          <Label htmlFor="filter">Filter by status</Label>
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger id="filter">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <TaskStats tasks={tasks.map(task => ({
        ...task,
        created_by: { username: task.created_by },
        assigned_to: { username: task.assigned_to }
      }))} />
      <TaskList tasks={tasks.map(task => ({
        ...task,
        created_by: { username: task.created_by },
        assigned_to: { username: task.assigned_to }
      }))} />
    </div>
  );
}