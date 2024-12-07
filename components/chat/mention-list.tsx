"use client";

import { useMentions } from "@/hooks/use-mentions";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MentionListProps {
  query: string;
  onSelect: (user: { id: string; email: string }) => void;
}

export function MentionList({ query, onSelect }: MentionListProps) {
  const { users, loading } = useMentions();

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Command className="absolute bottom-full mb-1 w-64 rounded-lg border shadow-md">
      <CommandInput placeholder="Search users..." />
      <CommandEmpty>No users found.</CommandEmpty>
      <CommandGroup heading="Suggestions">
        {filteredUsers.map((user) => (
          <CommandItem
            key={user.id}
            onSelect={() => onSelect(user)}
            className="flex items-center gap-2 p-2"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} />
              <AvatarFallback>
                {user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{user.email}</span>
          </CommandItem>
        ))}
      </CommandGroup>
    </Command>
  );
}