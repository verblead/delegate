"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Trash2, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";
import { MessageAttachments } from "./message-attachments";
import { PostComments } from "./post-comments";

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    id: string;
    user_id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface ChannelPost {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  attachments?: {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    url: string;
  }[];
  likes: number;
  comments: Comment[];
  liked_by_user: boolean;
}

interface ChannelPostProps {
  post: ChannelPost;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onShare?: (postId: string) => void;
  className?: string;
}

export function ChannelPost({ post, onLike, onDelete, onShare, className }: ChannelPostProps) {
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();
  const isOwner = user?.id === post.user_id;

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start gap-4">
        <Avatar>
          <AvatarImage src={post.sender?.avatar_url || undefined} />
          <AvatarFallback>
            {post.sender?.username?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {post.sender?.username || "Unknown User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(post.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm">{post.content}</p>
          {post.attachments && post.attachments.length > 0 && (
            <div className="mt-4">
              <MessageAttachments attachments={post.attachments} />
            </div>
          )}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => onLike(post.id)}
            >
              <Heart
                className={cn("h-4 w-4", {
                  "fill-current text-red-500": post.liked_by_user,
                })}
              />
              {post.likes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              {post.comments.length}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => onShare?.(post.id)}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
          {showComments && (
            <>
              <div className="border-b border-gray-100 mt-4" />
              <div className="mt-4">
                <PostComments postId={post.id} />
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}