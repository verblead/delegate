"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateChannelDialog } from "./create-channel-dialog";
import { cn } from "@/lib/utils";
import { Hash, Plus } from "lucide-react";
import Link from "next/link";
import { useChannels } from "@/hooks/use-channels";
import { useParams } from "next/navigation";

export function ChannelList() {
  const { channels, createChannel } = useChannels();
  const params = useParams();
  const selectedId = params.channelId as string;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateChannel = async (name: string, description?: string) => {
    await createChannel(name, description);
    setCreateDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-sm font-medium text-zinc-200">Channels</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCreateDialogOpen(true)}
          className="h-6 w-6 text-zinc-400 hover:bg-[#1a1a1a]"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="px-2 space-y-[2px]">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 px-2 py-1 h-7 text-sm font-medium",
                channel.id === selectedId 
                  ? "bg-[#1a1a1a] text-zinc-200" 
                  : "text-zinc-400 hover:bg-[#1a1a1a] hover:text-zinc-200"
              )}
              asChild
            >
              <Link href={`/dashboard/channels/${channel.id}`}>
                <Hash className="h-4 w-4 shrink-0" />
                <span>{channel.name}</span>
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
      <CreateChannelDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateChannel}
      />
    </div>
  );
}