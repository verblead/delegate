"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/config";
import { WorkspaceInvite } from "@/lib/supabase/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function WorkspaceInvitesPage() {
  const { id } = useParams();
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvites = async () => {
      const { data, error } = await supabase
        .from("workspace_invites")
        .select("*")
        .eq("workspace_id", id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setInvites(data);
      }
      setLoading(false);
    };

    fetchInvites();

    const inviteSubscription = supabase
      .channel(`workspace-invites:${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workspace_invites",
          filter: `workspace_id=eq.${id}`,
        },
        fetchInvites
      )
      .subscribe();

    return () => {
      inviteSubscription.unsubscribe();
    };
  }, [id]);

  const handleCancelInvite = async (inviteId: number) => {
    const { error } = await supabase
      .from("workspace_invites")
      .delete()
      .eq("id", inviteId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled successfully",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Pending Invitations</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell>{invite.email}</TableCell>
              <TableCell className="capitalize">{invite.role}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(invite.created_at), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(invite.expires_at), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancelInvite(invite.id)}
                >
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {invites.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No pending invitations
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}