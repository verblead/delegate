"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Users, MoreHorizontal } from "lucide-react";
import { ChannelPost } from "./channel-post";
import { CreatePostDialog } from "./create-post-dialog";
import { AddUserDialog } from "./add-user-dialog";
import { MemberListDialog } from "./member-list-dialog";
import { ChannelSettingsDialog } from "./channel-settings-dialog";
import { useToast } from "@/components/ui/use-toast";

interface ChatAreaProps {
  channelId: string;
}

interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  commenter?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  channel_id: string;
  user_id: string;
  has_attachments: boolean;
  sender?: {
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

export function ChatArea({ channelId }: ChatAreaProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [memberListOpen, setMemberListOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { supabase } = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (!channelId || !user) {
      console.log('No channelId or user:', { channelId, user });
      return;
    }

    const fetchPosts = async () => {
      setLoading(true);
      console.log('Fetching posts for channel:', channelId);

      // First check if user is a member of the channel
      const { data: memberData, error: memberError } = await supabase
        .from('channel_members')
        .select('*')
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      console.log('Channel membership check:', { memberData, memberError });

      if (memberError) {
        console.error('Error checking channel membership:', memberError);
        setLoading(false);
        return;
      }

      if (!memberData || memberData.length === 0) {
        console.log('User is not a member of this channel');
        setLoading(false);
        setPosts([]);
        return;
      }

      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from("channel_posts")
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (postsError) {
        console.error('Error fetching posts:', postsError);
        setLoading(false);
        return;
      }

      if (!postsData || postsData.length === 0) {
        console.log('No posts found for channel');
        setPosts([]);
        setLoading(false);
        return;
      }

      // Transform posts data
      const transformedPosts = postsData.map(post => ({
        ...post,
        sender: {
          id: post.user_id,
          username: post.username,
          avatar_url: post.avatar_url
        },
        comments: [],
        likes: 0,
        liked_by_user: false
      }));

      // Fetch comments for all posts
      const { data: commentsData, error: commentsError } = await supabase
        .from('post_comments')
        .select('*')
        .in('post_id', postsData.map(post => post.id))
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      }

      // Transform comments and group by post
      const commentsByPost = new Map<string, Comment[]>();
      commentsData?.forEach(comment => {
        const transformedComment = {
          ...comment,
          commenter: {
            id: comment.user_id,
            username: comment.username,
            avatar_url: comment.avatar_url
          }
        };
        const comments = commentsByPost.get(comment.post_id) || [];
        comments.push(transformedComment);
        commentsByPost.set(comment.post_id, comments);
      });

      // Update posts with comments
      const updatedPosts = transformedPosts.map(post => ({
        ...post,
        comments: commentsByPost.get(post.id) || []
      }));

      // Fetch likes
      const { data: likesData, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id, user_id')
        .in('post_id', postsData.map(post => post.id));

      if (likesError) {
        console.error('Error fetching likes:', likesError);
      }

      // Update posts with likes data
      if (likesData) {
        const likesMap = new Map();
        const userLikesMap = new Map();
        
        likesData.forEach(like => {
          const count = (likesMap.get(like.post_id) || 0) + 1;
          likesMap.set(like.post_id, count);
          if (like.user_id === user?.id) {
            userLikesMap.set(like.post_id, true);
          }
        });

        const finalPosts = updatedPosts.map(post => ({
          ...post,
          likes: likesMap.get(post.id) || 0,
          liked_by_user: userLikesMap.get(post.id) || false
        }));

        setPosts(finalPosts);
      } else {
        setPosts(updatedPosts);
      }
      
      setLoading(false);
    };

    fetchPosts();

    // Set up real-time subscription for posts and comments
    const postsChannel = supabase
      .channel(`channel-posts:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "channel_posts",
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel('post-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      postsChannel.unsubscribe();
      commentsChannel.unsubscribe();
    };
  }, [channelId, supabase, user]);

  const handleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.liked_by_user) {
        // Unlike the post
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, likes: p.likes - 1, liked_by_user: false }
            : p
        ));
      } else {
        // Like the post
        const { error } = await supabase
          .from("post_likes")
          .insert({ post_id: postId, user_id: user.id });

        if (error) throw error;

        // Update local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, likes: p.likes + 1, liked_by_user: true }
            : p
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    const { error } = await supabase
      .from("channel_posts")
      .delete()
      .eq("id", postId);

    if (!error) {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    }
  };

  const handleShare = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      await navigator.clipboard.writeText(post.content);
      useToast({
        title: "Post copied to clipboard",
        description: "You can now share the post content with others",
      });
    } catch (error) {
      console.error('Error sharing post:', error);
      useToast({
        title: "Failed to copy post",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-4 h-14 border-b">
        <div className="flex gap-2">
          <Button onClick={() => setCreatePostOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setAddUserOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMemberListOpen(true)}
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center p-4">
              <span className="loading loading-spinner"></span>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              No posts in this channel yet. Create one to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {posts.map((post) => (
                <ChannelPost
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onShare={handleShare}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        channelId={channelId}
      />
      <AddUserDialog
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        channelId={channelId}
      />
      <MemberListDialog
        open={memberListOpen}
        onOpenChange={setMemberListOpen}
        channelId={channelId}
      />
      <ChannelSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        channelId={channelId}
      />
    </div>
  );
}