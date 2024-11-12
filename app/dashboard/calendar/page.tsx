"use client";

import { useState } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { CalendarView } from "@/components/calendar/calendar-view";
import { CalendarFilters } from "@/components/calendar/calendar-filters";
import { CalendarStats } from "@/components/calendar/calendar-stats";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCalendarEvents } from "@/hooks/use-calendar-events";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filter, setFilter] = useState<"all" | "tasks" | "volunteer">("all");
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
            View and manage your tasks and volunteer activities
          </p>
        </div>
        <CalendarFilters value={filter} onChange={setFilter} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </Card>
          <CalendarStats events={events} />
        </div>
        <CalendarView date={selectedDate} events={events} />
      </div>
    </div>
  );
}