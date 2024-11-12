"use client";

import { useState } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText,
  MessageSquare,
  PlayCircle,
  User
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
  created_by: { username: string; avatar_url?: string } | null;
  assigned_to: { username: string; avatar_url?: string } | null;
  messages?: { count: number };
}

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ 
  task, 
  open, 
  onOpenChange 
}: TaskDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { user } = useAuth();

  if (!task) {
    return null;
  }

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

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getInitials = (username: string) => {
    return username ? username[0].toUpperCase() : "?";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{task.title}</span>
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace("_", " ")}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList>
            <TabsTrigger value="details">
              <FileText className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {task.description || "No description provided"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {task.created_by && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Created by</h3>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.created_by.avatar_url} />
                        <AvatarFallback>
                          {getInitials(task.created_by.username)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">@{task.created_by.username}</span>
                    </div>
                  </div>
                )}

                {task.assigned_to && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Assigned to</h3>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assigned_to.avatar_url} />
                        <AvatarFallback>
                          {getInitials(task.assigned_to.username)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">@{task.assigned_to.username}</span>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium mb-2">Created</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {format(new Date(task.created_at), "PPP")}
                  </div>
                </div>

                {task.due_date && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Due Date</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(task.due_date), "PPP")}
                      {new Date(task.due_date) < new Date() && task.status !== "completed" && (
                        <Badge variant="destructive" className="ml-2">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="flex-1 mt-4">
            <div className="flex flex-col h-[calc(100vh-20rem)]">
              <ScrollArea className="flex-1">
                <div className="space-y-4 p-4">
                  <div className="text-center text-sm text-muted-foreground">
                    No messages yet
                  </div>
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}