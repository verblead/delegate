-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Channel members can view other members" ON public.channel_members;
DROP POLICY IF EXISTS "Channel admins can add members" ON public.channel_members;

-- Create simplified policies without recursion
CREATE POLICY "Allow members to view channel members"
ON public.channel_members FOR SELECT
TO authenticated
USING (
    channel_id IN (
        SELECT channel_id 
        FROM public.channel_members 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Allow channel creation membership"
ON public.channel_members FOR INSERT
TO authenticated
WITH CHECK (
    -- Allow if user is the first member (channel creator)
    NOT EXISTS (
        SELECT 1 FROM public.channel_members
        WHERE channel_id = channel_members.channel_id
    )
    OR
    -- Or if user is an admin of the channel
    EXISTS (
        SELECT 1 FROM public.channel_members
        WHERE channel_id = channel_members.channel_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Ensure email column exists in profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;