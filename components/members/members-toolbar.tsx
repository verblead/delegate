"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Download, Search, RefreshCw } from "lucide-react";

interface MembersToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onInvite: () => void;
}

export function MembersToolbar({
  searchQuery,
  onSearchChange,
  onInvite
}: MembersToolbarProps) {
  const exportMembers = () => {
    // Implement CSV export functionality
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Team Members</h1>
        <p className="text-muted-foreground">
          Manage your team members and their roles
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={exportMembers}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button onClick={onInvite}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>
    </div>
  );
}