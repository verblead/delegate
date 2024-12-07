"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Shield, Ban, Crown, MessageSquare, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRoles, UserRole } from "@/hooks/use-roles";
import { useAuth } from "@/hooks/use-auth";

interface Member {
  id: string;
  role: UserRole;
}

interface MemberActionsProps {
  member: Member;
}

export function MemberActions({ member }: MemberActionsProps) {
  const [loading, setLoading] = useState(false);
  const { updateUserRole } = useRoles();
  const { user } = useAuth();
  const router = useRouter();

  const handleRoleChange = async (newRole: UserRole) => {
    if (!user) return;
    setLoading(true);

    try {
      const success = await updateUserRole(member.id, newRole);
      if (success) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    router.push(`/dashboard/messages?user=${member.id}`);
  };

  if (!user || user.id === member.id) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={loading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleMessage}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("member")}>
          <User className="h-4 w-4 mr-2" />
          Make User
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("moderator")}>
          <Shield className="h-4 w-4 mr-2" />
          Make Moderator
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleRoleChange("admin")}>
          <Crown className="h-4 w-4 mr-2" />
          Make Admin
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-red-600 dark:text-red-400"
          onClick={() => handleRoleChange("banned")}
        >
          <Ban className="h-4 w-4 mr-2" />
          Ban Member
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}