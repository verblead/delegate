"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plus, Video, Users } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  participantCount: number;
}

interface MeetingsSidebarProps {
  meetings: Meeting[];
  selectedMeetingId: string | null;
  onMeetingSelect: (meetingId: string) => void;
}

export function MeetingsSidebar({
  meetings,
  selectedMeetingId,
  onMeetingSelect,
}: MeetingsSidebarProps) {
  const MeetingsList = () => (
    <div className="space-y-4 bg-zinc-900 h-full">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold">Meetings</h2>
        <Button size="sm" variant="ghost" className="bg-zinc-800 hover:bg-zinc-700">
          <Plus className="h-4 w-4 mr-2" />
          New Meeting
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="space-y-1 p-2">
          {meetings.map((meeting) => (
            <Button
              key={meeting.id}
              variant="ghost"
              className={`w-full justify-start ${
                meeting.id === selectedMeetingId ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
              }`}
              onClick={() => onMeetingSelect(meeting.id)}
            >
              <Video className="h-4 w-4 mr-2" />
              <div className="flex-1 text-left">
                <p className="font-medium">{meeting.title}</p>
                <p className="text-xs text-zinc-400 flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {meeting.participantCount} participants
                </p>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Mobile Sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-14">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 bg-zinc-900 border-zinc-800">
            <MeetingsList />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 border-r border-zinc-800">
        <MeetingsList />
      </div>
    </>
  );
}