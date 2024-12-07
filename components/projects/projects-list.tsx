"use client";

import { useProjects, Project } from "@/hooks/use-projects";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { 
  Calendar,
  Clock,
  FileText,
  MoreVertical,
  Users,
  CheckSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectsListProps {
  searchQuery: string;
}

export function ProjectsList({ searchQuery }: ProjectsListProps) {
  const { projects, loading } = useProjects();

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500";
      case "planning":
        return "bg-yellow-500/10 text-yellow-500";
      case "on_hold":
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getPriorityColor = (priority: Project["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      case "low":
        return "bg-green-500/10 text-green-500";
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit Project</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Archive Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(project.status)}>
                  {project.status.replace("_", " ")}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  {project.team_members} members
                </div>
                <div className="flex items-center text-muted-foreground">
                  <CheckSquare className="h-4 w-4 mr-1" />
                  {project.tasks_count} tasks
                </div>
                <div className="flex items-center text-muted-foreground">
                  <FileText className="h-4 w-4 mr-1" />
                  {project.files_count} files
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(project.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>

              {project.deadline && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  Due {formatDistanceToNow(new Date(project.deadline), {
                    addSuffix: true,
                  })}
                </div>
              )}

              <Button asChild className="w-full">
                <Link href={`/dashboard/projects/${project.id}`}>
                  View Project
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}