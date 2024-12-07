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
import { MembersToolbar } from "./members-toolbar";
import { Checkbox } from "@/components/ui/checkbox";
import type { Member } from "@/lib/export-utils";

interface MembersListProps {
  searchQuery: string;
  filters: {
    role: string;
    status: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  onInvite: () => void;
  setSearchQuery: (query: string) => void;
  onMembersChange: (members: Member[]) => void;
  onSelectedMembersChange: (members: Member[]) => void;
}

export function MembersList({ 
  searchQuery, 
  filters, 
  onInvite, 
  setSearchQuery, 
  onMembersChange,
  onSelectedMembersChange 
}: MembersListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

        if (error) {
          console.error('Error fetching members:', error);
          setError('Failed to load members. Please try again.');
          return;
        }

        const updatedMembers = data || [];
        setMembers(updatedMembers);
        onMembersChange(updatedMembers);
        
        // Clear selection when members change
        setSelectedMemberIds(new Set());
        onSelectedMembersChange([]);
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchMembers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, filters, supabase, onMembersChange, onSelectedMembersChange]);

  const filteredMembers = members.filter((member) => {
    if (filters.role !== "all" && member.role !== filters.role) return false;
    if (filters.status !== "all" && member.status !== filters.status) return false;
    if (searchQuery && !member.username.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !member.email?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !member.phone?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !member.city?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !member.state?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSelectMember = (memberId: string) => {
    const newSelectedIds = new Set(selectedMemberIds);
    if (newSelectedIds.has(memberId)) {
      newSelectedIds.delete(memberId);
    } else {
      newSelectedIds.add(memberId);
    }
    setSelectedMemberIds(newSelectedIds);
    const selectedMembers = filteredMembers.filter(member => newSelectedIds.has(member.id));
    onSelectedMembersChange(selectedMembers);
  };

  const handleSelectAll = () => {
    if (selectedMemberIds.size === filteredMembers.length) {
      setSelectedMemberIds(new Set());
      onSelectedMembersChange([]);
    } else {
      const newSelectedIds = new Set(filteredMembers.map(member => member.id));
      setSelectedMemberIds(newSelectedIds);
      onSelectedMembersChange(filteredMembers);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]">
              <Checkbox
                checked={selectedMemberIds.size === filteredMembers.length && filteredMembers.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Member</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                <Checkbox
                  checked={selectedMemberIds.has(member.id)}
                  onCheckedChange={() => handleSelectMember(member.id)}
                  aria-label={`Select ${member.username}`}
                />
              </TableCell>
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
                  </div>
                </div>
              </TableCell>
              <TableCell>{member.email || 'Not provided'}</TableCell>
              <TableCell>{member.phone || 'Not provided'}</TableCell>
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
                {member.created_at ? (
                  formatDistanceToNow(new Date(member.created_at), {
                    addSuffix: true,
                  })
                ) : (
                  'Unknown'
                )}
              </TableCell>
              <TableCell className="text-right">
                <MemberActions member={member} />
              </TableCell>
            </TableRow>
          ))}
          {filteredMembers.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <div className="text-muted-foreground">No members found</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}