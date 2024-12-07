"use client";

import { useState } from "react";
import { useTaskNotes } from "@/hooks/use-task-notes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Plus, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TaskNotesProps {
  taskId: string;
}

export function TaskNotes({ taskId }: TaskNotesProps) {
  const { notes, loading, addNote } = useTaskNotes(taskId);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newNote.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addNote(newNote);
      setNewNote("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="resize-none"
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!newNote.trim() || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding note...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <ScrollArea className="h-[calc(100vh-24rem)]">
        <div className="space-y-4">
          {notes.map((note) => (
            <Card
              key={note.id}
              className={cn(
                "p-4 transition-colors hover:bg-muted/50"
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={note.created_by.avatar_url} />
                  <AvatarFallback>
                    {note.created_by.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">@{note.created_by.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(note.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>
            </Card>
          ))}
          {notes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No notes yet</p>
              <p className="text-xs mt-1">Add a note to get started</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}