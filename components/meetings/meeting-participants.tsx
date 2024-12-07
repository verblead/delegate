"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface Participant {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
}

interface MeetingParticipantsProps {
  meetingId: string;
}

export function MeetingParticipants({ meetingId }: MeetingParticipantsProps) {
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !meetingId) return;

    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('meeting_participants')
        .select(`
          user_id,
          profiles:users (
            email,
            username,
            avatar_url
          )
        `)
        .eq('meeting_id', meetingId);

      if (!error && data) {
        const formattedParticipants = data.map(p => ({
          id: p.user_id,
          email: p.profiles.email,
          username: p.profiles.username || p.profiles.email.split('@')[0],
          avatar_url: p.profiles.avatar_url || `https://avatar.vercel.sh/${p.user_id}`,
          isSpeaking: false,
          isMuted: false,
          isVideoEnabled: true
        }));
        setParticipants(formattedParticipants);
      }
      setLoading(false);
    };

    fetchParticipants();

    const channel = supabase
      .channel(`meeting:${meetingId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        // Update participant states based on presence
        setParticipants(current => 
          current.map(p => ({
            ...p,
            ...presenceState[p.id]?.[0]
          }))
        );
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, meetingId, supabase]);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Participants ({participants.length})</h3>
        <Badge variant="secondary">
          {participants.length} online
        </Badge>
      </div>
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className={`flex items-center space-x-4 p-2 rounded-lg hover:bg-muted ${
                participant.isSpeaking ? 'bg-primary/5' : ''
              }`}
            >
              <div className="relative">
                <Avatar className={participant.isSpeaking ? "ring-2 ring-primary" : ""}>
                  <AvatarImage src={participant.avatar_url} />
                  <AvatarFallback>
                    {participant.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {participant.username}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {participant.isMuted ? (
                    <MicOff className="h-3 w-3" />
                  ) : (
                    <Mic className="h-3 w-3" />
                  )}
                  {participant.isVideoEnabled ? (
                    <Video className="h-3 w-3" />
                  ) : (
                    <VideoOff className="h-3 w-3" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}