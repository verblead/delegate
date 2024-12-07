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
  Clock, 
  FileText,
  MessageSquare,
  PlayCircle,
  User,
  StickyNote,
  Paperclip,
  X 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskNotes } from "./task-notes";
import { TaskFiles } from "./task-files";
import { TaskMessages } from "./task-messages";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  created_at: string;
  created_by: { 
    username: string;
    avatar_url?: string;
  };
  assigned_to: { 
    username: string;
    avatar_url?: string;
  };
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

  if (!task) return null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <div className="flex h-full">
          {/* Left Sidebar */}
          <div className="w-64 border-r flex flex-col">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="text-lg">Task Details</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                  <Badge className={cn("w-full justify-center", getStatusColor(task.status))}>
                    {getStatusIcon(task.status)}
                    <span className="ml-2 capitalize">{task.status.replace("_", " ")}</span>
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Priority</h3>
                  <Badge className={cn("w-full justify-center", getPriorityColor(task.priority))}>
                    <span className="capitalize">{task.priority}</span>
                  </Badge>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Created by</h3>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.created_by.avatar_url} />
                      <AvatarFallback>
                        {task.created_by.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">@{task.created_by.username}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Assigned to</h3>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assigned_to.avatar_url} />
                      <AvatarFallback>
                        {task.assigned_to.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">@{task.assigned_to.username}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Created</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {format(new Date(task.created_at), "PPP")}
                  </div>
                </div>

                {task.due_date && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Due Date</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(task.due_date), "PPP")}
                      </div>
                      {new Date(task.due_date) < new Date() && task.status !== "completed" && (
                        <Badge variant="destructive" className="w-full justify-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold truncate">{task.title}</h2>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="border-b">
                <TabsList className="h-12 w-full justify-start gap-2 px-4">
                  <TabsTrigger value="details" className="data-[state=active]:bg-muted">
                    <FileText className="h-4 w-4 mr-2" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="data-[state=active]:bg-muted">
                    <StickyNote className="h-4 w-4 mr-2" />
                    Notes
                  </TabsTrigger>
                  <TabsTrigger value="files" className="data-[state=active]:bg-muted">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Files
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="data-[state=active]:bg-muted">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="details" className="flex-1 p-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {task.description || "No description provided"}
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="flex-1 p-4">
                <TaskNotes taskId={task.id} />
              </TabsContent>

              <TabsContent value="files" className="flex-1 p-4">
                <TaskFiles taskId={task.id} />
              </TabsContent>

              <TabsContent value="messages" className="flex-1 p-4">
                <TaskMessages taskId={task.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}