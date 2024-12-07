-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Allow members to view channel members" ON public.channel_members;
DROP POLICY IF EXISTS "Allow channel creation membership" ON public.channel_members;
DROP POLICY IF EXISTS "Channel members can view other members" ON public.channel_members;
DROP POLICY IF EXISTS "Channel admins can add members" ON public.channel_members;

-- Create simplified policies without recursion
CREATE POLICY "Enable read access for channel members"
ON public.channel_members FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM public.channels c
        WHERE c.id = channel_id
        AND (
            c.created_by = auth.uid()
            OR EXISTS (
                SELECT 1 
                FROM public.channel_members cm 
                WHERE cm.channel_id = c.id 
                AND cm.user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Enable insert for channel admins"
ON public.channel_members FOR INSERT
TO authenticated
WITH CHECK (
    -- Allow if user is channel creator
    EXISTS (
        SELECT 1 
        FROM public.channels c
        WHERE c.id = channel_id
        AND c.created_by = auth.uid()
    )
    OR
    -- Or if user is channel admin
    EXISTS (
        SELECT 1 
        FROM public.channel_members cm
        WHERE cm.channel_id = channel_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_user ON public.channel_members(channel_id, user_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_role ON public.channel_members(role);

-- Enable RLS
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;