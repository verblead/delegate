"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { CalendarEvent } from "@/hooks/use-calendar-events";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  events: CalendarEvent[];
  view: "week" | "month";
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function CalendarGrid({ events, view, currentDate, onDateChange }: CalendarGridProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = direction === "prev" 
      ? subWeeks(currentDate, 1)
      : addWeeks(currentDate, 1);
    onDateChange(newDate);
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getEventsByDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.start_time), date)
    );
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "volunteer":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "meeting":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {format(weekStart, "MMMM d")} - {format(weekEnd, "MMMM d, yyyy")}
          </h3>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateDate("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {days.map((day, index) => (
          <div key={day.toISOString()} className="space-y-2">
            <div className="text-center">
              <div className="text-sm font-medium">
                {format(day, "EEE")}
              </div>
              <div className={cn(
                "text-2xl font-bold mt-1",
                isSameDay(day, new Date()) && "text-primary"
              )}>
                {format(day, "d")}
              </div>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {getEventsByDay(day).map((event) => (
                  <Popover key={event.id}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          getEventColor(event.type)
                        )}
                      >
                        <div className="w-full truncate">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(event.start_time), "HH:mm")}
                          </div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                        <div className="text-sm flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {format(new Date(event.start_time), "HH:mm")} - 
                          {format(new Date(event.end_time), "HH:mm")}
                        </div>
                        {event.location && (
                          <div className="text-sm flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                        <Badge variant="secondary">
                          {event.type}
                        </Badge>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </Card>
  );
}
