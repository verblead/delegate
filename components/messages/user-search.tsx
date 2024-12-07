"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UserSearchProps {
  onSelectUser: (userId: string) => void;
  excludeIds?: string[];
}

export function UserSearch({ onSelectUser, excludeIds = [] }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, email, avatar_url')
          .neq('id', currentUser.id)
          .order('username');

        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, supabase]);

  const filteredUsers = users.filter(user => {
    const matchesQuery = query.trim() === "" || 
      user.username?.toLowerCase().includes(query.toLowerCase()) ||
      user.email?.toLowerCase().includes(query.toLowerCase());
    
    const notExcluded = !excludeIds.includes(user.id);
    
    return matchesQuery && notExcluded;
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <ScrollArea className="h-[300px]">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => onSelectUser(user.id)}
                >
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage 
                      src={user.avatar_url || `https://avatar.vercel.sh/${user.id}`} 
                      alt={user.username} 
                    />
                    <AvatarFallback>
                      {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">@{user.username}</span>
                    <span className="text-muted-foreground text-xs">{user.email}</span>
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {query ? 'No users found matching your search' : 'No users available'}
                </p>
                <p className="text-xs mt-1">
                  {query ? 'Try a different search term' : 'Invite team members to get started'}
                </p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}