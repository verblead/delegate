"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { 
  Mail, 
  Calendar, 
  MessageSquare, 
  Shield,
  Crown,
  User,
  Clock,
  Trophy,
  Star,
  MapPin
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfileDialogProps {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  full_name: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  points: number;
  role: string;
  achievements_count: number;
  last_seen: string | null;
}

export function UserProfileDialog({ userId, onOpenChange }: UserProfileDialogProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { supabase } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          achievements:user_achievements(count)
        `)
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    };

    fetchProfile();
  }, [userId, supabase]);

  const handleStartChat = () => {
    if (profile) {
      router.push(`/dashboard/messages?user=${profile.id}`);
      onOpenChange(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!profile) return null;

  return (
    <Dialog open={!!userId} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || `https://avatar.vercel.sh/${profile.id}`} />
              <AvatarFallback>
                {profile.username?.[0].toUpperCase() || profile.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
          </div>

          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">
              {profile.full_name || profile.username || profile.email.split("@")[0]}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">{profile.role}</Badge>
              <Badge variant="outline">
                <Trophy className="h-3 w-3 mr-1" />
                {profile.points} points
              </Badge>
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-muted-foreground text-center">
              {profile.bio}
            </p>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{profile.email}</span>
          </div>

          {(profile.city || profile.state) && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {[profile.city, profile.state].filter(Boolean).join(", ")}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
            </span>
          </div>

          {profile.last_seen && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                Last seen {formatDistanceToNow(new Date(profile.last_seen), { addSuffix: true })}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 text-muted-foreground" />
            <span>{profile.achievements_count || 0} achievements earned</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleStartChat}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}