-- Drop existing policies for channel_members
DROP POLICY IF EXISTS "Allow managing channel members" ON "public"."channel_members";
DROP POLICY IF EXISTS "Allow member management" ON "public"."channel_members";
DROP POLICY IF EXISTS "Allow users to view channel members" ON "public"."channel_members";
DROP POLICY IF EXISTS "Allow viewing channel members" ON "public"."channel_members";
DROP POLICY IF EXISTS "Authenticated users can delete their own channel membership" ON "public"."channel_members";
DROP POLICY IF EXISTS "Authenticated users can insert channel members" ON "public"."channel_members";
DROP POLICY IF EXISTS "Authenticated users can update their own channel membership" ON "public"."channel_members";
DROP POLICY IF EXISTS "Authenticated users can view channel members" ON "public"."channel_members";
DROP POLICY IF EXISTS "Channel admins can update member roles" ON "public"."channel_members";

-- Enable RLS on channel_members
ALTER TABLE "public"."channel_members" ENABLE ROW LEVEL SECURITY;

-- Create new, clean policies for channel_members

-- View Policy: Users can view members of channels they belong to
CREATE POLICY "Users can view channel members" ON "public"."channel_members"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM channel_members cm 
        WHERE cm.channel_id = channel_members.channel_id 
        AND cm.user_id = auth.uid()
    )
);

-- Insert Policy: Channel admins can add members
CREATE POLICY "Channel admins can add members" ON "public"."channel_members"
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM channel_members cm 
        WHERE cm.channel_id = channel_members.channel_id 
        AND cm.user_id = auth.uid() 
        AND cm.role = 'admin'
    )
);

-- Delete Policy: Users can remove themselves, admins can remove anyone
CREATE POLICY "Channel member deletion" ON "public"."channel_members"
FOR DELETE
TO authenticated
USING (
    auth.uid() = user_id OR -- User can remove themselves
    EXISTS (
        SELECT 1 FROM channel_members cm 
        WHERE cm.channel_id = channel_members.channel_id 
        AND cm.user_id = auth.uid() 
        AND cm.role = 'admin'
    ) -- Admins can remove anyone
);

-- Update Policy: Only admins can update roles
CREATE POLICY "Channel admins can update roles" ON "public"."channel_members"
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM channel_members cm 
        WHERE cm.channel_id = channel_members.channel_id 
        AND cm.user_id = auth.uid() 
        AND cm.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM channel_members cm 
        WHERE cm.channel_id = channel_members.channel_id 
        AND cm.user_id = auth.uid() 
        AND cm.role = 'admin'
    )
);

-- Verify channels policy is still in place
DROP POLICY IF EXISTS "Allow authenticated users to view channels" ON "public"."channels";
CREATE POLICY "Allow authenticated users to view channels" ON "public"."channels"
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS on channels if not already enabled
ALTER TABLE "public"."channels" ENABLE ROW LEVEL SECURITY;
