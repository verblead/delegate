-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for channel members" ON public.channel_members;
DROP POLICY IF EXISTS "Enable insert for channel admins" ON public.channel_members;

-- Create simplified channel member policies
CREATE POLICY "Allow viewing channel members"
ON public.channel_members FOR SELECT
TO authenticated
USING (
    channel_id IN (
        SELECT id FROM public.channels
        WHERE created_by = auth.uid()
        UNION
        SELECT channel_id FROM public.channel_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Allow managing channel members"
ON public.channel_members FOR INSERT
TO authenticated
WITH CHECK (
    channel_id IN (
        SELECT id FROM public.channels
        WHERE created_by = auth.uid()
        UNION
        SELECT channel_id FROM public.channel_members
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channels_created_by ON public.channels(created_by);
CREATE INDEX IF NOT EXISTS idx_channel_members_composite 
ON public.channel_members(channel_id, user_id, role);