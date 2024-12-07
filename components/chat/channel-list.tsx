"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChannels } from "@/hooks/use-channels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";

export function ChannelList() {
  const { channels, loading, createChannel } = useChannels();
  const router = useRouter();
  const { toast } = useToast();
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    try {
      await createChannel(channelName.trim(), description.trim() || undefined);
      setIsOpen(false);
      setChannelName("");
      setDescription("");
      toast({
        title: "Success",
        description: "Channel created successfully",
      });
    } catch (error) {
      console.error("Error creating channel:", error);
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading channels...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Channel
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateChannel} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Channel Name</Label>
              <Input
                id="name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Enter channel name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter channel description"
              />
            </div>
            <Button type="submit" className="w-full">
              Create Channel
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-2">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted cursor-pointer relative group"
            onClick={() => router.push(`/dashboard/channels/${channel.id}`)}
          >
            <div className="relative">
              {channel.avatar_url ? (
                <img
                  src={channel.avatar_url}
                  alt={channel.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  {channel.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium">{channel.name}</div>
              {channel.description && (
                <div className="text-sm text-muted-foreground">{channel.description}</div>
              )}
            </div>
            <Badge variant="secondary" className="ml-2">
              {channel.members?.[0]?.count || 0} members
            </Badge>
          </div>
        ))}
        {channels.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No channels available</p>
            <p className="text-xs mt-1">Create a channel to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}