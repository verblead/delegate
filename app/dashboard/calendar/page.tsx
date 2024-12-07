"use client";

import { useState } from "react";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Plus, CalendarDays, Calendar as CalendarIcon } from "lucide-react";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { CalendarStats } from "@/components/calendar/calendar-stats";
import { CalendarFilters } from "@/components/calendar/calendar-filters";
import { CreateEventDialog } from "@/components/calendar/create-event-dialog";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"week" | "month">("week");
  const [filter, setFilter] = useState<"all" | "tasks" | "volunteer">("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { events, loading } = useCalendarEvents(selectedDate, filter);

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
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your schedule, events, and activities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 rounded-md bg-muted p-1">
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("week")}
              className="gap-1"
            >
              <CalendarDays className="h-4 w-4" />
              Week
            </Button>
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
              className="gap-1"
            >
              <CalendarIcon className="h-4 w-4" />
              Month
            </Button>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </Card>
          <CalendarStats events={events} />
          <Card className="p-4">
            <CalendarFilters value={filter} onChange={setFilter} />
          </Card>
        </div>
        <CalendarGrid
          events={events}
          view={view}
          currentDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        defaultDate={selectedDate}
      />
    </div>
  );
}