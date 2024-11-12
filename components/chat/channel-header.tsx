"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Users, 
  Hash, 
  Lock,
  MoreVertical 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
}

interface ChannelHeaderProps {
  channelId: string;
}

export function ChannelHeader({ channelId }: ChannelHeaderProps) {
  const [channel, setChannel] = useState<Channel | null>(null);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchChannel = async () => {
      const { data } = await supabase
        .from("channels")
        .select("*")
        .eq("id", channelId)
        .single();

      if (data) {
        setChannel(data);
      }
    };

    fetchChannel();
  }, [channelId, supabase]);

  if (!channel) return null;

  return (
    <div className="h-14 border-b px-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {channel.is_private ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Hash className="h-4 w-4 text-muted-foreground" />
        )}
        <div>
          <h2 className="font-semibold">{channel.name}</h2>
          {channel.description && (
            <p className="text-xs text-muted-foreground">{channel.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Users className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Channel Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}