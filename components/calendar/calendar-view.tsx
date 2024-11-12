"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { CalendarEvent } from "@/hooks/use-calendar-events";
import { CalendarClock, CheckCircle2, Clock, HandHeart } from "lucide-react";

interface CalendarViewProps {
  date?: Date;
  events: CalendarEvent[];
}

export function CalendarView({ date, events }: CalendarViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "in_progress":
        return "text-blue-500 bg-blue-500/10";
      case "pending":
      case "open":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  if (!date) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Select a date to view events
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">
          Events for {format(date, "MMMM d, yyyy")}
        </h2>
        <Badge variant="secondary">
          <CalendarClock className="h-4 w-4 mr-1" />
          {events.length} events
        </Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {event.type === "volunteer" ? (
                      <HandHeart className="h-4 w-4 text-primary" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                    <h3 className="font-semibold">{event.title}</h3>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                    {event.points && (
                      <Badge variant="secondary">
                        {event.points} points
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {format(new Date(event.due_date), "p")}
                </div>
              </div>
            </Card>
          ))}
          {events.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No events scheduled for this day
            </p>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}