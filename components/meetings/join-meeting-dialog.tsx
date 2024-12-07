"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JoinMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinMeetingDialog({
  open,
  onOpenChange,
}: JoinMeetingDialogProps) {
  const [meetingCode, setMeetingCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle joining meeting
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Meeting</DialogTitle>
          <DialogDescription>
            Enter a meeting code to join an existing meeting.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="meetingCode">Meeting Code</Label>
              <Input
                id="meetingCode"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="Enter meeting code"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Join Meeting</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}