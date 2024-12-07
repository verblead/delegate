-- Enable RLS
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to view public channels" ON public.channels;
DROP POLICY IF EXISTS "Allow users to view channel members" ON public.channel_members;
DROP POLICY IF EXISTS "Allow channel creation" ON public.channels;
DROP POLICY IF EXISTS "Allow member management" ON public.channel_members;

-- Add channel policies
CREATE POLICY "Allow users to view public channels"
ON public.channels
FOR SELECT
USING (
    NOT is_private OR EXISTS (
        SELECT 1 FROM channel_members
        WHERE channel_id = id
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Allow channel creation"
ON public.channels
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to view channel members"
ON public.channel_members
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM channels
        WHERE id = channel_id
        AND (
            NOT is_private OR EXISTS (
                SELECT 1 FROM channel_members cm2
                WHERE cm2.channel_id = id
                AND cm2.user_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Allow member management"
ON public.channel_members
FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM channels
        WHERE id = channel_id
        AND created_by = auth.uid()
    )
);
