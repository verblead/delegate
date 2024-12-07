-- Drop existing channel policies
DROP POLICY IF EXISTS "Allow authenticated users to view channels" ON "public"."channels";

-- Enable RLS on channels
ALTER TABLE "public"."channels" ENABLE ROW LEVEL SECURITY;

-- Create comprehensive channel viewing policy
CREATE POLICY "channel_select_policy" ON "public"."channels"
FOR SELECT
TO authenticated
USING (
  (
    -- Allow access to public channels
    NOT is_private
  ) OR (
    -- Allow access to private channels where user is a member
    is_private AND EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = channels.id
      AND channel_members.user_id = auth.uid()
    )
  ) OR (
    -- Allow access if user created the channel
    created_by = auth.uid()
  )
);

-- Policy for inserting new channels
CREATE POLICY "channel_insert_policy" ON "public"."channels"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
);

-- Policy for updating channels
CREATE POLICY "channel_update_policy" ON "public"."channels"
FOR UPDATE
TO authenticated
USING (
  -- User must be an admin of the channel to update it
  EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_members.channel_id = channels.id
    AND channel_members.user_id = auth.uid()
    AND channel_members.role = 'admin'
  )
)
WITH CHECK (
  -- User must be an admin of the channel to update it
  EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_members.channel_id = channels.id
    AND channel_members.user_id = auth.uid()
    AND channel_members.role = 'admin'
  )
);

-- Policy for deleting channels
CREATE POLICY "channel_delete_policy" ON "public"."channels"
FOR DELETE
TO authenticated
USING (
  -- Only channel creator or admin can delete
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_members.channel_id = channels.id
    AND channel_members.user_id = auth.uid()
    AND channel_members.role = 'admin'
  )
);
