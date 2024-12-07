"use client";

import { useState } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, CheckCircle2, PlayCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  status: "pending" | "in_progress" | "completed";
}

interface TaskActionsProps {
  task: Task;
}

export function TaskActions({ task }: TaskActionsProps) {
  const [loading, setLoading] = useState(false);
  const { supabase } = useSupabase();
  const { toast } = useToast();

  const updateStatus = async (status: Task["status"]) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", task.id);

      if (error) throw error;

      toast({
        title: "Task updated",
        description: `Task status changed to ${status.replace("_", " ")}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={loading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => updateStatus("pending")}>
          <Clock className="h-4 w-4 mr-2" />
          Mark as Pending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus("in_progress")}>
          <PlayCircle className="h-4 w-4 mr-2" />
          Mark as In Progress
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateStatus("completed")}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Mark as Completed
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}