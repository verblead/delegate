"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Send, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  username: string;
  avatar_url: string | null;
}

interface PostCommentsProps {
  postId: string;
}

export function PostComments({ postId }: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (!postId) return;

    const fetchComments = async () => {
      console.log('Fetching comments for post:', postId);
      const { data, error } = await supabase
        .from("post_comments")
        .select(`
          id,
          content,
          created_at,
          user_id,
          post_id,
          username,
          avatar_url
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      console.log('Comments fetched:', data);
      setComments(data || []);
    };

    fetchComments();

    const channel = supabase
      .channel(`post-comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_comments",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [postId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        content: newComment.trim(),
        user_id: user.id,
        username: user.email?.split('@')[0].toUpperCase() || 'Unknown User',
        avatar_url: `https://boring-avatars-api.vercel.app/api/avatar?name=${user.id}`
      });

      if (error) throw error;
      setNewComment("");
    } catch (error) {
      console.error("Error sending comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="max-h-[300px]">
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3">
              <Avatar>
                <AvatarImage src={comment.avatar_url || ''} />
                <AvatarFallback>{comment.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {comment.username || 'Unknown User'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={isSubmitting || !newComment.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            'Post'
          )}
        </Button>
      </form>
    </div>
  );
}