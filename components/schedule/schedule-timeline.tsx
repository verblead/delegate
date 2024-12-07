"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isSameDay, parseISO } from "date-fns";
import { ScheduleEvent } from "@/hooks/use-schedule";
import { CalendarClock, MapPin, Users } from "lucide-react";

interface ScheduleTimelineProps {
  events: ScheduleEvent[];
}

export function ScheduleTimeline({ events }: ScheduleTimelineProps) {
  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const date = format(parseISO(event.start_time), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, ScheduleEvent[]>);

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-8">
        {Object.entries(groupedEvents).map(([date, dayEvents]) => (
          <div key={date}>
            <div className="sticky top-0 bg-background z-10 py-2">
              <h3 className="font-semibold">
                {format(parseISO(date), "EEEE, MMMM d")}
                {isSameDay(parseISO(date), new Date()) && (
                  <Badge variant="secondary" className="ml-2">
                    Today
                  </Badge>
                )}
              </h3>
            </div>
            <div className="space-y-4 mt-4">
              {dayEvents.map((event) => (
                <Card key={event.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge>{event.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <CalendarClock className="h-4 w-4 mr-1" />
                        {format(parseISO(event.start_time), "h:mm a")} -{" "}
                        {format(parseISO(event.end_time), "h:mm a")}
                      </div>
                      {event.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {event.attendees.length} attendees
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}