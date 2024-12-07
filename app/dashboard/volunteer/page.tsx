"use client";

import { useState } from "react";
import { useVolunteerTasks } from "@/hooks/use-volunteer-tasks";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VolunteerList } from "@/components/volunteer/volunteer-list";
import { VolunteerStats } from "@/components/volunteer/volunteer-stats";
import { CreateVolunteerTaskDialog } from "@/components/volunteer/create-volunteer-task-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/use-auth";

export default function VolunteerBoardPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { tasks, loading, isAdmin } = useVolunteerTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Volunteer Board</h1>
          <p className="text-muted-foreground">
            Volunteer for tasks and earn points for helping out
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      <VolunteerStats tasks={tasks} />
      <VolunteerList tasks={tasks} />

      <CreateVolunteerTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}