"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/config";
import { Workspace } from "@/lib/supabase/schema";
import { MemberList } from "@/components/workspace/member-list";
import { InviteMemberDialog } from "@/components/workspace/invite-member-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus } from "lucide-react";

export default function WorkspacePage() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setWorkspace(data);
      }
      setLoading(false);
    };

    fetchWorkspace();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (!workspace) {
    return <div>Workspace not found</div>;
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-muted-foreground mt-1">
              {workspace.description}
            </p>
          )}
        </div>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <MemberList workspaceId={parseInt(id as string)} />

      <InviteMemberDialog
        workspaceId={parseInt(id as string)}
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  );
}