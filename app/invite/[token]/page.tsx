"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessagesSquare } from "lucide-react";

export default function InvitePage() {
  const { token } = useParams();
  const router = useRouter();
  const { acceptInvite } = useWorkspaces();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAcceptInvite = async () => {
    setLoading(true);
    try {
      const success = await acceptInvite(token as string);
      if (success) {
        toast({
          title: "Invitation accepted",
          description: "You have successfully joined the workspace",
        });
        router.push("/dashboard/workspaces");
      } else {
        toast({
          title: "Error",
          description: "This invitation is invalid or has expired",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <MessagesSquare className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Workspace Invitation</h1>
        <p className="text-muted-foreground mb-6">
          You have been invited to join a workspace on Delegate
        </p>
        <Button
          className="w-full"
          onClick={handleAcceptInvite}
          disabled={loading}
        >
          {loading ? "Accepting..." : "Accept Invitation"}
        </Button>
      </Card>
    </div>
  );
}