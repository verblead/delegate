"use client";

import { useState } from "react";
import { ActiveMeeting } from "@/components/meetings/active-meeting";
import { MeetingsList } from "@/components/meetings/meetings-list";
import { CreateMeetingDialog } from "@/components/meetings/create-meeting-dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MeetingsPage() {
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [isListVisible, setIsListVisible] = useState(true);

  return (
    <div className="flex h-[calc(100vh-4rem)] relative">
      <div
        className={cn(
          "absolute md:relative w-full md:w-80 border-r bg-background transition-all duration-300 z-10",
          isListVisible ? "left-0" : "-left-full md:-left-80"
        )}
      >
        <MeetingsList
          onMeetingSelect={setActiveMeetingId}
          activeMeetingId={activeMeetingId}
        />
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 md:left-80 top-4 z-20"
        onClick={() => setIsListVisible(!isListVisible)}
      >
        {isListVisible ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      <div className="flex-1">
        {activeMeetingId ? (
          <ActiveMeeting meetingId={activeMeetingId} />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a meeting to join or create a new one
          </div>
        )}
      </div>
    </div>
  );
}