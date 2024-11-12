-- Drop existing policies
DROP POLICY IF EXISTS "Users can view channels they are members of" ON channels;
DROP POLICY IF EXISTS "Users can create channels" ON channels;

-- Create updated policies
CREATE POLICY "Anyone can create channels"
ON channels FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view all channels"
ON channels FOR SELECT
USING (true);

CREATE POLICY "Channel creators can update their channels"
ON channels FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Channel creators can delete their channels"
ON channels FOR DELETE
USING (auth.uid() = created_by);

-- Ensure RLS is enabled
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;