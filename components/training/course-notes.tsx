"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface CourseNotesProps {
  courseId: string;
}

export function CourseNotes({ courseId }: CourseNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchNotes = async () => {
      try {
        const { data, error } = await supabase
          .from("course_notes")
          .select("*")
          .eq("course_id", courseId)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotes(data || []);
      } catch (error) {
        console.error("Error fetching notes:", error);
        toast({
          title: "Error",
          description: "Failed to load notes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();

    const channel = supabase
      .channel(`course-notes:${courseId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "course_notes",
          filter: `course_id=eq.${courseId}`,
        },
        fetchNotes
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [courseId, user, supabase, toast]);

  const handleAddNote = async () => {
    if (!user || !newNote.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("course_notes").insert({
        course_id: courseId,
        user_id: user.id,
        content: newNote.trim(),
      });

      if (error) throw error;
      setNewNote("");
    } catch (error) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "Failed to save note",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
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
          <Button
            onClick={handleAddNote}
            disabled={!newNote.trim() || saving}
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </>
            )}
          </Button>
        </div>
      </Card>

      <ScrollArea className="h-[500px]">
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id} className="p-4">
              <p className="whitespace-pre-wrap">{note.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(note.created_at), {
                  addSuffix: true,
                })}
              </p>
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