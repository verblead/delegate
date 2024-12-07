-- First, disable RLS temporarily
ALTER TABLE "public"."channels" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."channel_members" DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "channel_select_policy" ON "public"."channels";
DROP POLICY IF EXISTS "channel_insert_policy" ON "public"."channels";
DROP POLICY IF EXISTS "channel_update_policy" ON "public"."channels";
DROP POLICY IF EXISTS "channel_delete_policy" ON "public"."channels";

DROP POLICY IF EXISTS "Users can view channel members" ON "public"."channel_members";
DROP POLICY IF EXISTS "Channel admins can add members" ON "public"."channel_members";
DROP POLICY IF EXISTS "Channel member deletion" ON "public"."channel_members";
DROP POLICY IF EXISTS "Channel admins can update roles" ON "public"."channel_members";

-- Re-enable RLS
ALTER TABLE "public"."channels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."channel_members" ENABLE ROW LEVEL SECURITY;

-- Create simplified policies for channels
CREATE POLICY "allow_select_channels" ON "public"."channels"
FOR SELECT TO authenticated
USING (true);  -- Allow all authenticated users to view all channels

CREATE POLICY "allow_insert_channels" ON "public"."channels"
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "allow_update_channels" ON "public"."channels"
FOR UPDATE TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "allow_delete_channels" ON "public"."channels"
FOR DELETE TO authenticated
USING (auth.uid() = created_by);

-- Create simplified policies for channel_members
CREATE POLICY "allow_select_members" ON "public"."channel_members"
FOR SELECT TO authenticated
USING (true);  -- Allow all authenticated users to view all channel members

CREATE POLICY "allow_insert_members" ON "public"."channel_members"
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM channels
        WHERE channels.id = channel_id
        AND channels.created_by = auth.uid()
    )
);

CREATE POLICY "allow_update_members" ON "public"."channel_members"
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM channels
        WHERE channels.id = channel_id
        AND channels.created_by = auth.uid()
    )
);

CREATE POLICY "allow_delete_members" ON "public"."channel_members"
FOR DELETE TO authenticated
USING (
    auth.uid() = user_id OR  -- Users can remove themselves
    EXISTS (
        SELECT 1 FROM channels
        WHERE channels.id = channel_id
        AND channels.created_by = auth.uid()
    )
);
