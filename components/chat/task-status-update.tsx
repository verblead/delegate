"use client";

import { useState } from "react";
import { Task } from "@/lib/supabase/schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Clock, PlayCircle } from "lucide-react";
import { useTasks } from "@/hooks/use-tasks";

interface TaskStatusUpdateProps {
  task: Task;
  onUpdate: () => void;
}

export function TaskStatusUpdate({ task, onUpdate }: TaskStatusUpdateProps) {
  const { updateTaskStatus, loading } = useTasks();
  const [open, setOpen] = useState(false);

  const handleStatusUpdate = async (status: Task["status"]) => {
    const success = await updateTaskStatus(task.id, status);
    if (success) {
      onUpdate();
      setOpen(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          Update Status
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusUpdate("pending")}>
          <Clock className="mr-2 h-4 w-4 text-yellow-500" />
          Pending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate("in_progress")}>
          <PlayCircle className="mr-2 h-4 w-4 text-blue-500" />
          In Progress
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusUpdate("completed")}>
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          Completed
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}