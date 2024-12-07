-- Drop existing view if it exists
DROP VIEW IF EXISTS public.channel_members_with_profiles;

-- Create channel members view with proper joins
CREATE OR REPLACE VIEW public.channel_members_with_profiles AS
SELECT 
    cm.id,
    cm.channel_id,
    cm.user_id,
    cm.role,
    cm.created_at,
    p.username,
    p.avatar_url,
    p.points,
    p.role as user_role,
    p.last_seen,
    (
        SELECT COUNT(*)
        FROM user_achievements ua
        WHERE ua.user_id = p.id
    ) as achievements_count
FROM channel_members cm
JOIN profiles p ON p.id = cm.user_id;

-- Grant access to the view
GRANT SELECT ON public.channel_members_with_profiles TO authenticated;

-- Enable RLS on the view
ALTER VIEW public.channel_members_with_profiles SET (security_invoker = on);

-- Create policy for the view
CREATE POLICY "Users can view channel members they have access to"
ON public.channel_members_with_profiles
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.channel_members
        WHERE channel_id = channel_members_with_profiles.channel_id
        AND user_id = auth.uid()
    )
);

-- Add last_seen column to profiles if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE;

-- Create function to update last_seen
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles
    SET last_seen = NOW()
    WHERE id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_seen on channel activity
DROP TRIGGER IF EXISTS update_last_seen_trigger ON channel_posts;
CREATE TRIGGER update_last_seen_trigger
    AFTER INSERT OR UPDATE ON channel_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_last_seen();