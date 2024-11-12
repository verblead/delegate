"use client";

import { useState } from "react";
import { useRoles } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserRole } from "@/lib/supabase/schema";
import { Shield } from "lucide-react";

interface RoleManagerProps {
  type: "workspace" | "channel";
  id: number;
  userId: string;
  currentRole: UserRole;
  userEmail: string;
}

export function RoleManager({
  type,
  id,
  userId,
  currentRole,
  userEmail,
}: RoleManagerProps) {
  const [role, setRole] = useState<UserRole>(currentRole);
  const [open, setOpen] = useState(false);
  const { updateMemberRole } = useRoles();

  const handleUpdateRole = async () => {
    const success = await updateMemberRole(type, id, userId, role);
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Shield className="h-4 w-4 mr-2" />
          {currentRole}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Role</DialogTitle>
          <DialogDescription>
            Update role for {userEmail} in this {type}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>Update Role</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}