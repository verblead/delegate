-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.post_likes;
DROP TABLE IF EXISTS public.post_comments;
DROP TABLE IF EXISTS public.post_attachments;
DROP TABLE IF EXISTS public.channel_posts;
DROP TABLE IF EXISTS public.profiles;

-- Create profiles table first
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create channel posts table
CREATE TABLE public.channel_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    content TEXT NOT NULL,
    has_attachments BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on channel_posts
ALTER TABLE public.channel_posts ENABLE ROW LEVEL SECURITY;

-- Create channel_posts policies
CREATE POLICY "Authenticated users can view channel posts"
ON public.channel_posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create channel posts"
ON public.channel_posts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update own channel posts"
ON public.channel_posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own channel posts"
ON public.channel_posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to sync post user data
CREATE OR REPLACE FUNCTION public.sync_post_user_data()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    _username TEXT;
    _avatar_url TEXT;
BEGIN
    -- First try to get username and avatar_url from profiles
    SELECT username, avatar_url 
    INTO _username, _avatar_url
    FROM public.profiles
    WHERE user_id = NEW.user_id;
    
    -- Set the values
    NEW.username := COALESCE(_username, 'Anonymous');
    NEW.avatar_url := _avatar_url;
    
    RETURN NEW;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.channel_posts TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Create trigger to sync post user data before insert
DROP TRIGGER IF EXISTS sync_post_user_data_trigger ON public.channel_posts;
CREATE TRIGGER sync_post_user_data_trigger
    BEFORE INSERT ON public.channel_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_post_user_data();

-- Create post attachments table
CREATE TABLE public.post_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.channel_posts(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create post comments table
CREATE TABLE public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.channel_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to sync comment user data
CREATE OR REPLACE FUNCTION public.sync_comment_user_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Get username and avatar_url from profiles
    SELECT username, avatar_url 
    INTO NEW.username, NEW.avatar_url
    FROM public.profiles
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync comment user data before insert
CREATE TRIGGER sync_comment_user_data_trigger
    BEFORE INSERT ON public.post_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_comment_user_data();

-- Create post likes table
CREATE TABLE public.post_likes (
    post_id UUID REFERENCES public.channel_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

-- Enable RLS for all tables
ALTER TABLE public.post_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Post Likes Policies
CREATE POLICY "Debug - Users can view all likes"
ON public.post_likes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Debug - Users can manage their likes"
ON public.post_likes FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Post Comments Policies
DROP POLICY IF EXISTS "Users can create comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can view comments" ON public.post_comments;

-- Disable RLS for post_comments temporarily
ALTER TABLE public.post_comments DISABLE ROW LEVEL SECURITY;

-- Create post comments policies
CREATE POLICY "Users can create comments"
ON public.post_comments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can delete their own comments"
ON public.post_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.post_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view comments"
ON public.post_comments FOR SELECT
TO authenticated
USING (true);

-- Re-enable RLS for post_comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Create trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username)
    VALUES (new.id, new.email)
    ON CONFLICT (user_id) DO UPDATE
    SET username = EXCLUDED.username
    WHERE profiles.username IS NULL;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_channel_posts_channel_id ON public.channel_posts(channel_id);
CREATE INDEX idx_channel_posts_user_id ON public.channel_posts(user_id);
CREATE INDEX idx_post_attachments_post_id ON public.post_attachments(post_id);
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON public.post_likes(user_id);

-- Enable realtime
ALTER publication supabase_realtime ADD TABLE public.channel_posts;
ALTER publication supabase_realtime ADD TABLE public.post_comments;
ALTER publication supabase_realtime ADD TABLE public.post_likes;