"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { MemberActions } from "./member-actions";
import { Loader2 } from "lucide-react";

interface Member {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
  role: string;
  points: number;
  status: string;
  created_at: string;
  city?: string;
  state?: string;
}

interface MembersListProps {
  searchQuery: string;
  filters: {
    role: string;
    status: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
}

export function MembersList({ searchQuery, filters }: MembersListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchMembers = async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .order(filters.sortBy, { ascending: filters.sortOrder === "asc" });

      // Apply role filter
      if (filters.role !== "all") {
        query = query.eq("role", filters.role);
      }

      // Apply status filter
      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,state.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (!error && data) {
        setMembers(data);
      }
      setLoading(false);
    };

    fetchMembers();
  }, [user, supabase, searchQuery, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback>
                      {member.username?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">@{member.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    member.role === "admin"
                      ? "bg-red-500/10 text-red-500"
                      : member.role === "moderator"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-green-500/10 text-green-500"
                  }
                >
                  {member.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    member.status === "online"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-muted"
                  }
                >
                  {member.status}
                </Badge>
              </TableCell>
              <TableCell>{member.points}</TableCell>
              <TableCell>
                {member.city && member.state
                  ? `${member.city}, ${member.state}`
                  : "Not specified"}
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(member.created_at), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                <MemberActions member={member} />
              </TableCell>
            </TableRow>
          ))}
          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="text-muted-foreground">No members found</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}