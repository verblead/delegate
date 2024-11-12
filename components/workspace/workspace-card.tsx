"use client";

import { Workspace } from "@/lib/supabase/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, MoreVertical, Settings, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface WorkspaceCardProps {
  workspace: Workspace & {
    members: { count: number }[];
  };
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const memberCount = workspace.members[0]?.count || 0;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{workspace.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {workspace.description}
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
              <Link href={`/dashboard/workspaces/${workspace.id}/settings`}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/workspaces/${workspace.id}/members`}>
                <Users className="h-4 w-4 mr-2" />
                Members
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="h-4 w-4 mr-1" />
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </div>
        <Button asChild>
          <Link href={`/dashboard/workspaces/${workspace.id}`}>
            Open Workspace
          </Link>
        </Button>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Created{" "}
          {formatDistanceToNow(new Date(workspace.created_at), {
            addSuffix: true,
          })}
        </p>
      </div>
    </Card>
  );
}