-- Create channel posts table
CREATE TABLE IF NOT EXISTS public.channel_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    has_attachments BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create post attachments table
CREATE TABLE IF NOT EXISTS public.post_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.channel_posts(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create post comments table
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.channel_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create post likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID REFERENCES public.channel_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.channel_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for channel posts
CREATE POLICY "Users can view posts in their channels"
ON public.channel_posts FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_posts.channel_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create posts in their channels"
ON public.channel_posts FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_id
        AND cm.user_id = auth.uid()
    )
    AND user_id = auth.uid()
);

CREATE POLICY "Users can delete their own posts"
ON public.channel_posts FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create policies for post attachments
CREATE POLICY "Users can view post attachments"
ON public.post_attachments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.channel_posts cp
        JOIN public.channel_members cm ON cm.channel_id = cp.channel_id
        WHERE cp.id = post_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can add attachments to their posts"
ON public.post_attachments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.channel_posts cp
        WHERE cp.id = post_id
        AND cp.user_id = auth.uid()
    )
);

-- Create policies for post comments
CREATE POLICY "Users can view post comments"
ON public.post_comments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.channel_posts cp
        JOIN public.channel_members cm ON cm.channel_id = cp.channel_id
        WHERE cp.id = post_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create comments on posts"
ON public.post_comments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.channel_posts cp
        JOIN public.channel_members cm ON cm.channel_id = cp.channel_id
        WHERE cp.id = post_id
        AND cm.user_id = auth.uid()
    )
    AND user_id = auth.uid()
);

-- Create policies for post likes
CREATE POLICY "Users can view post likes"
ON public.post_likes FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.channel_posts cp
        JOIN public.channel_members cm ON cm.channel_id = cp.channel_id
        WHERE cp.id = post_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can like posts"
ON public.post_likes FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.channel_posts cp
        JOIN public.channel_members cm ON cm.channel_id = cp.channel_id
        WHERE cp.id = post_id
        AND cm.user_id = auth.uid()
    )
    AND user_id = auth.uid()
);

CREATE POLICY "Users can unlike posts"
ON public.post_likes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_channel_posts_channel ON public.channel_posts(channel_id);
CREATE INDEX idx_channel_posts_user ON public.channel_posts(user_id);
CREATE INDEX idx_post_attachments_post ON public.post_attachments(post_id);
CREATE INDEX idx_post_comments_post ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_user ON public.post_comments(user_id);
CREATE INDEX idx_post_likes_post ON public.post_likes(post_id);
CREATE INDEX idx_post_likes_user ON public.post_likes(user_id);

-- Create post-attachments storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-attachments', 'post-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow authenticated users to read post attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'post-attachments');

CREATE POLICY "Allow authenticated users to upload post attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'post-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Enable realtime
ALTER publication supabase_realtime ADD TABLE public.channel_posts;
ALTER publication supabase_realtime ADD TABLE public.post_comments;
ALTER publication supabase_realtime ADD TABLE public.post_likes;