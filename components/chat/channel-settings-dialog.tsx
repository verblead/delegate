"use client";

import { useState } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

interface ChannelSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  initialData?: {
    name: string;
    description?: string;
    is_private: boolean;
  };
}

export function ChannelSettingsDialog({
  open,
  onOpenChange,
  channelId,
  initialData,
}: ChannelSettingsDialogProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isPrivate, setIsPrivate] = useState(initialData?.is_private || false);
  const [loading, setLoading] = useState(false);
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const router = useRouter();

  const handleSave = async () => {
    if (!name.trim()) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('channels')
        .update({
          name: name.trim(),
          description: description || null,
          is_private: isPrivate
        })
        .eq('id', channelId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Channel settings updated successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating channel:', error);
      toast({
        title: "Error",
        description: "Failed to update channel settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this channel? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Channel deleted successfully",
      });
      router.push('/dashboard/channels');
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast({
        title: "Error",
        description: "Failed to delete channel",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Channel Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter channel name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter channel description"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="private">Private Channel</Label>
              <div className="text-sm text-muted-foreground">
                Only invited members can join
              </div>
            </div>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete Channel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !name.trim()}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}