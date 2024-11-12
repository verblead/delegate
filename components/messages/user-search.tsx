"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface UserSearchProps {
  onSelectUser: (userId: string) => void;
  excludeIds?: string[];
}

export function UserSearch({ onSelectUser, excludeIds = [] }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const { supabase } = useSupabase();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim() || !currentUser) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .neq("id", currentUser.id)
        .not("id", "in", `(${excludeIds.join(",")})`)
        .ilike("username", `%${query}%`)
        .limit(10);

      if (!error && data) {
        setUsers(data);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [query, supabase, currentUser, excludeIds]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {users.map((user) => (
            <Button
              key={user.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => onSelectUser(user.id)}
            >
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  {user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>@{user.username}</span>
            </Button>
          ))}
          {query && users.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No users found
            </p>
          )}
          {!query && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Type to search for users
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}