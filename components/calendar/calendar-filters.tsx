"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarFiltersProps {
  value: string;
  onChange: (value: "all" | "tasks" | "volunteer") => void;
}

export function CalendarFilters({ value, onChange }: CalendarFiltersProps) {
  return (
    <Select value={value} onValueChange={(v: any) => onChange(v)}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Filter events" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Events</SelectItem>
        <SelectItem value="tasks">Tasks</SelectItem>
        <SelectItem value="volunteer">Volunteer</SelectItem>
      </SelectContent>
    </Select>
  );
}