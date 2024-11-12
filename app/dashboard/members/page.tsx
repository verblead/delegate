"use client";

import { useState } from "react";
import { MembersList } from "@/components/members/members-list";
import { MembersStats } from "@/components/members/members-stats";
import { MembersToolbar } from "@/components/members/members-toolbar";
import { MembersFilters } from "@/components/members/members-filters";
import { InviteMemberDialog } from "@/components/members/invite-member-dialog";

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    sortBy: "points",
    sortOrder: "desc" as "asc" | "desc"
  });

  return (
    <div className="container py-6 space-y-6">
      <MembersToolbar 
        onInvite={() => setInviteDialogOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <MembersStats />

      <div className="flex flex-col gap-4">
        <MembersFilters 
          filters={filters}
          onFilterChange={setFilters}
        />
        
        <MembersList 
          searchQuery={searchQuery}
          filters={filters}
        />
      </div>

      <InviteMemberDialog 
        open={inviteDialogOpen} 
        onOpenChange={setInviteDialogOpen} 
      />
    </div>
  );
}