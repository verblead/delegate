"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  HandHeart,
  Trophy,
  Users,
  Edit,
  X,
  FileText,
  Paperclip,
  User,
  UserCheck
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EditVolunteerTaskDialog } from "./edit-volunteer-task-dialog";
import { VolunteerActions } from "./volunteer-actions";
import { VolunteerTaskAttachments } from "./volunteer-task-attachments";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";

interface User {
  id: string;
  username: string;
  avatar_url?: string;
  user_metadata?: {
    full_name: string;
  };
  email: string;
}

interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  points: number;
  status: "open" | "in_progress" | "completed";
  created_at: string;
  created_by: string;
  volunteer_id: string | null;
  due_date: string | null;
  creator_id: string;
}

interface VolunteerTaskDialogProps {
  task: VolunteerTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VolunteerTaskDialog({ 
  task, 
  open, 
  onOpenChange 
}: VolunteerTaskDialogProps) {
  const { data: creator } = useUser(task?.creator_id);
  const { data: volunteer } = useUser(task?.volunteer_id);

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{task.title}</DialogTitle>
            <Badge variant={task.status === "completed" ? "default" : "outline"}>
              {task.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {task.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {task.points} points
            </span>
          </div>

          {task.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Due {formatDistanceToNow(new Date(task.due_date), {
                  addSuffix: true,
                })}
              </span>
              {new Date(task.due_date) < new Date() &&
                task.status !== "completed" && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Created by:</span>
              <span className="text-sm font-medium">
                {creator?.user_metadata?.full_name || creator?.email}
              </span>
            </div>

            {volunteer && (
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Volunteered by:
                </span>
                <span className="text-sm font-medium">
                  {volunteer?.user_metadata?.full_name || volunteer?.email}
                </span>
              </div>
            )}
          </div>

          <VolunteerActions task={task} />
        </div>
      </DialogContent>
    </Dialog>
  );
}