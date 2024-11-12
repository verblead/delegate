"use client";

import { useState } from "react";
import { useSchedule } from "@/hooks/use-schedule";
import { ScheduleCalendar } from "@/components/schedule/schedule-calendar";
import { ScheduleTimeline } from "@/components/schedule/schedule-timeline";
import { ScheduleStats } from "@/components/schedule/schedule-stats";
import { CreateScheduleDialog } from "@/components/schedule/create-schedule-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SchedulePage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { events, loading } = useSchedule();
  const [view, setView] = useState<"calendar" | "timeline">("calendar");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">
            Manage team meetings, tasks, and volunteer activities
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Event
        </Button>
      </div>

      <ScheduleStats events={filteredEvents} />

      <Card className="p-4">
        <div className="flex items-center justify-between space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              onClick={() => setView("calendar")}
            >
              Calendar View
            </Button>
            <Button
              variant={view === "timeline" ? "default" : "outline"}
              onClick={() => setView("timeline")}
            >
              Timeline View
            </Button>
          </div>
        </div>

        {view === "calendar" ? (
          <ScheduleCalendar events={filteredEvents} />
        ) : (
          <ScheduleTimeline events={filteredEvents} />
        )}
      </Card>

      <CreateScheduleDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
}