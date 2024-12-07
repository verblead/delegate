"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  Search,
  RefreshCw,
  UserPlus,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import { exportToPDF, exportToCSV, exportToXLS } from "@/lib/export-utils";
import type { Member } from "@/lib/export-utils";

interface MembersToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onInvite: () => void;
  members: Member[];
}

export function MembersToolbar({
  searchQuery,
  onSearchChange,
  onInvite,
  members
}: MembersToolbarProps) {
  const handleExportPDF = () => {
    try {
      exportToPDF(members);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(members);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  };

  const handleExportXLS = () => {
    try {
      exportToXLS(members);
    } catch (error) {
      console.error('Error exporting to XLS:', error);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Team Members</h1>
        <p className="text-muted-foreground">
          {members.length === 0 
            ? "Manage your team members and their roles"
            : `${members.length} member${members.length === 1 ? '' : 's'} selected`}
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={members.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              {members.length > 0 ? `Export (${members.length})` : 'Export'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV}>
              <FileText className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportXLS}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as XLS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={onInvite}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>
    </div>
  );
}