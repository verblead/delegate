"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Video, Users, Plus } from "lucide-react";
import { CreateMeetingDialog } from "./create-meeting-dialog";
import { useMeetings } from "@/hooks/use-meetings";

interface MeetingsListProps {
  onMeetingSelect: (meetingId: string) => void;
  activeMeetingId: string | null;
}

export function MeetingsList({
  onMeetingSelect,
  activeMeetingId,
}: MeetingsListProps) {
  const { meetings, loading } = useMeetings();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Meetings</h2>
        <CreateMeetingDialog />
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          {meetings.map((meeting) => (
            <Button
              key={meeting.id}
              variant={meeting.id === activeMeetingId ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onMeetingSelect(meeting.id)}
            >
              <Video className="h-4 w-4 mr-2" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{meeting.title}</p>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {meeting.current_participants} participants
                </p>
              </div>
            </Button>
          ))}
          {!loading && meetings.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active meetings
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}