"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { ScheduleEvent } from "@/hooks/use-schedule";
import { CalendarClock, MapPin, Users, Clock } from "lucide-react";

interface ScheduleCalendarProps {
  events: ScheduleEvent[];
}

export function ScheduleCalendar({ events }: ScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getDayEvents = (date: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.start_time), date)
    ).sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  };

  const selectedEvents = getDayEvents(selectedDate);

  const getEventStatusColor = (event: ScheduleEvent) => {
    const now = new Date();
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);

    if (end < now) return "text-green-500 bg-green-500/10";
    if (start <= now && end >= now) return "text-blue-500 bg-blue-500/10";
    return "text-yellow-500 bg-yellow-500/10";
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
          components={{
            DayContent: (props) => {
              const dayEvents = getDayEvents(props.date);
              return (
                <div className="relative">
                  <div>{props.date.getDate()}</div>
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              );
            },
          }}
        />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            Events for {format(selectedDate, "MMMM d, yyyy")}
          </h2>
          <Badge variant="secondary">
            <CalendarClock className="h-4 w-4 mr-1" />
            {selectedEvents.length} events
          </Badge>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {selectedEvents.map((event) => (
              <Card key={event.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge className={getEventStatusColor(event)}>
                        {event.type}
                      </Badge>
                    </div>
                    <Badge variant="outline">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(parseISO(event.start_time), "h:mm a")}
                    </Badge>
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
            {selectedEvents.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No events scheduled for this day
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}