-- Drop existing policies
DROP POLICY IF EXISTS "Users can view channel members" ON channel_members;

-- Create updated policies
CREATE POLICY "Anyone can create channel memberships"
ON channel_members FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view channel memberships"
ON channel_members FOR SELECT
USING (true);

CREATE POLICY "Channel admins can update memberships"
ON channel_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM channel_members cm
    WHERE cm.channel_id = channel_members.channel_id
    AND cm.user_id = auth.uid()
    AND cm.role = 'admin'
  )
);

CREATE POLICY "Channel admins can delete memberships"
ON channel_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM channel_members cm
    WHERE cm.channel_id = channel_members.channel_id
    AND cm.user_id = auth.uid()
    AND cm.role = 'admin'
  )
);

-- Ensure RLS is enabled
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;