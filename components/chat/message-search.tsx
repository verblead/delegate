"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useChat } from "@/hooks/use-chat";
import { useParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

export function MessageSearch() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const params = useParams();
  const channelId = params.channelId as string;
  const { searchMessages } = useChat(channelId);

  useEffect(() => {
    if (debouncedQuery) {
      searchMessages(debouncedQuery);
    }
  }, [debouncedQuery, searchMessages]);

  return (
    <div className="p-4 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages..."
          className="pl-9"
        />
      </div>
    </div>
  );
}