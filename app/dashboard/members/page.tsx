"use client";

import { useState } from "react";
import { MembersToolbar } from "@/components/members/members-toolbar";
import { MembersList } from "@/components/members/members-list";
import { MembersStats } from "@/components/members/members-stats";
import { MembersFilters } from "@/components/members/members-filters";
import { InviteMemberDialog } from "@/components/members/invite-member-dialog";
import type { Member } from "@/lib/export-utils";

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    sortBy: "points",
    sortOrder: "desc" as "asc" | "desc"
  });

  const onInvite = () => setInviteDialogOpen(true);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-6">
        <MembersToolbar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onInvite={onInvite}
          members={selectedMembers}
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
            onInvite={onInvite}
            setSearchQuery={setSearchQuery}
            onMembersChange={setAllMembers}
            onSelectedMembersChange={setSelectedMembers}
          />
        </div>

        <InviteMemberDialog 
          open={inviteDialogOpen} 
          onOpenChange={setInviteDialogOpen} 
        />
      </div>
    </div>
  );
}