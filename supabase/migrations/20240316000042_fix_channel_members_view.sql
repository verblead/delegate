-- Create a view for channel members with profile information
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
    p.role as user_role
FROM public.channel_members cm
JOIN public.profiles p ON p.id = cm.user_id;

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