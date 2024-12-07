-- Drop all existing policies for channel_members
DROP POLICY IF EXISTS allow_delete_members ON channel_members;
DROP POLICY IF EXISTS allow_insert_members ON channel_members;
DROP POLICY IF EXISTS allow_select_members ON channel_members;
DROP POLICY IF EXISTS allow_update_members ON channel_members;
DROP POLICY IF EXISTS "Users can join channels" ON channel_members;
DROP POLICY IF EXISTS "Users can leave channels" ON channel_members;
DROP POLICY IF EXISTS "Users can update their own role" ON channel_members;
DROP POLICY IF EXISTS "Users can view channel members" ON channel_members;

-- Enable RLS on channel_members
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

-- Create new consolidated policies
CREATE POLICY "channel_members_select_policy" ON channel_members
    FOR SELECT
    TO authenticated
    USING (
        -- Users can view members of channels they are a member of
        EXISTS (
            SELECT 1 FROM channel_members cm 
            WHERE cm.channel_id = channel_members.channel_id 
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "channel_members_insert_policy" ON channel_members
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Only channel admins/owners can add members
        EXISTS (
            SELECT 1 FROM channel_members cm 
            WHERE cm.channel_id = channel_members.channel_id 
            AND cm.user_id = auth.uid()
            AND cm.role IN ('admin', 'owner')
        )
        -- Prevent duplicate memberships
        AND NOT EXISTS (
            SELECT 1 FROM channel_members cm 
            WHERE cm.channel_id = channel_members.channel_id 
            AND cm.user_id = channel_members.user_id
        )
    );

CREATE POLICY "channel_members_delete_policy" ON channel_members
    FOR DELETE
    TO authenticated
    USING (
        -- Users can delete their own membership
        user_id = auth.uid()
        -- Or admins/owners can remove other members
        OR EXISTS (
            SELECT 1 FROM channel_members cm 
            WHERE cm.channel_id = channel_members.channel_id 
            AND cm.user_id = auth.uid()
            AND cm.role IN ('admin', 'owner')
        )
    );

CREATE POLICY "channel_members_update_policy" ON channel_members
    FOR UPDATE
    TO authenticated
    USING (
        -- Only admins/owners can update roles
        EXISTS (
            SELECT 1 FROM channel_members cm 
            WHERE cm.channel_id = channel_members.channel_id 
            AND cm.user_id = auth.uid()
            AND cm.role IN ('admin', 'owner')
        )
        -- Cannot modify owner role
        AND NOT EXISTS (
            SELECT 1 FROM channel_members cm 
            WHERE cm.id = channel_members.id 
            AND cm.role = 'owner'
        )
    );

-- Ensure the view has proper permissions
GRANT SELECT ON channel_members_with_profiles TO authenticated;

-- Add an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_user 
ON channel_members(channel_id, user_id);
