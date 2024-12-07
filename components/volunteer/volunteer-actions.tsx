"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, CheckCircle2, HandHeart, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { VolunteerTask } from "@/hooks/use-volunteer-tasks";
import { useVolunteerTasks } from "@/hooks/use-volunteer-tasks";

interface VolunteerActionsProps {
  task: VolunteerTask;
}

export function VolunteerActions({ task }: VolunteerActionsProps) {
  const [loading, setLoading] = useState(false);
  const { volunteerForTask, completeTask } = useVolunteerTasks();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleVolunteer = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to volunteer for tasks",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const success = await volunteerForTask(task.id);
      if (success) {
        toast({
          title: "Success",
          description: "You've volunteered for this task",
        });
      } else {
        throw new Error("Failed to volunteer for task");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to volunteer for task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const success = await completeTask(task.id);
      if (success) {
        toast({
          title: "Success",
          description: "Task marked as completed",
        });
      } else {
        throw new Error("Failed to complete task");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show different actions based on task status and user role
  if (task.status === "open") {
    return (
      <Button
        variant="default"
        size="sm"
        disabled={loading}
        onClick={handleVolunteer}
        className="w-full"
      >
        <HandHeart className="h-4 w-4 mr-2" />
        Volunteer
      </Button>
    );
  }

  if (task.status === "in_progress" && task.volunteer_id === user?.id) {
    return (
      <Button
        variant="default"
        size="sm"
        disabled={loading}
        onClick={handleComplete}
        className="w-full"
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Mark as Complete
      </Button>
    );
  }

  return null;
}