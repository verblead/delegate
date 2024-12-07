"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useMeetings } from "@/hooks/use-meetings";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export function CreateMeetingDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video" as "audio" | "video" | "screen_share",
    is_private: false,
    max_participants: 10
  });

  const { createMeeting } = useMeetings();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOpen(false);

    try {
      const meeting = await createMeeting(formData);
      if (meeting) {
        toast({
          title: "Success",
          description: "Meeting created successfully",
        });
        setOpen(false);
        setFormData({
          title: "",
          description: "",
          type: "video",
          is_private: false,
          max_participants: 10
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create meeting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ New Meeting</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Meeting Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value: "audio" | "video" | "screen_share") => 
                setFormData(prev => ({ ...prev, type: value }))}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="audio" id="audio" />
                <Label htmlFor="audio">Audio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video">Video</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="screen_share" id="screen_share" />
                <Label htmlFor="screen_share">Screen Share</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_private">Private Meeting</Label>
            <Switch
              id="is_private"
              checked={formData.is_private}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_private: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_participants">Max Participants</Label>
            <Input
              id="max_participants"
              type="number"
              min="2"
              max="50"
              value={formData.max_participants}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                max_participants: parseInt(e.target.value) 
              }))}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Meeting"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}