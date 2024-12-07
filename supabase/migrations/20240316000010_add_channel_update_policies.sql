-- Add update policies for channels
CREATE POLICY "Allow admins to update channels"
ON public.channels
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM channel_members
        WHERE channel_id = id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM channel_members
        WHERE channel_id = id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Add delete policies for channels
CREATE POLICY "Allow admins to delete channels"
ON public.channels
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM channel_members
        WHERE channel_id = id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Add update policies for channel members
CREATE POLICY "Allow admins to update channel members"
ON public.channel_members
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM channel_members cm
        WHERE cm.channel_id = channel_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM channel_members cm
        WHERE cm.channel_id = channel_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
);

-- Add delete policies for channel members
CREATE POLICY "Allow admins to remove channel members"
ON public.channel_members
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM channel_members cm
        WHERE cm.channel_id = channel_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
);
