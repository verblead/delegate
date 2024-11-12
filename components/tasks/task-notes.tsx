"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Plus } from "lucide-react";

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: {
    username: string;
  };
}

interface TaskNotesProps {
  taskId: string;
}

export function TaskNotes({ taskId }: TaskNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchNotes = async () => {
      const { data } = await supabase
        .from("task_notes")
        .select(`
          id,
          content,
          created_at,
          created_by:profiles!task_notes_created_by_fkey(username)
        `)
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (data) {
        setNotes(data);
      }
    };

    fetchNotes();

    const channel = supabase
      .channel(`task-notes-${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_notes",
          filter: `task_id=eq.${taskId}`,
        },
        fetchNotes
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [taskId, supabase]);

  const addNote = async () => {
    if (!newNote.trim()) return;

    const { error } = await supabase.from("task_notes").insert({
      task_id: taskId,
      content: newNote.trim(),
    });

    if (!error) {
      setNewNote("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          className="flex-1"
        />
        <Button onClick={addNote} disabled={!newNote.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-24rem)]">
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="p-4 rounded-lg bg-muted">
              <p className="text-sm">{note.content}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>@{note.created_by.username}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(note.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}