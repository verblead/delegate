"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ListTodo } from "lucide-react";
import { TaskDialog } from "./task-dialog";
import { Message } from "@/lib/supabase/schema";
import { useAuth } from "@/hooks/use-auth";

interface MessageActionsProps {
  message: Message;
  onEdit: () => void;
  onDelete: () => void;
  onTaskCreate: (task: {
    title: string;
    description: string;
    assigned_to: string;
    due_date?: string;
  }) => void;
}

export function MessageActions({
  message,
  onEdit,
  onDelete,
  onTaskCreate,
}: MessageActionsProps) {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const { user } = useAuth();

  if (!user || user.id !== message.user_id) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Message
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Message
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTaskDialogOpen(true)}>
            <ListTodo className="mr-2 h-4 w-4" />
            Create Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSubmit={onTaskCreate}
      />
    </>
  );
}