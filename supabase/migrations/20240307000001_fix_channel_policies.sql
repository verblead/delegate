-- Drop existing policies
DROP POLICY IF EXISTS "Allow users to view channels" ON channels;
DROP POLICY IF EXISTS "Users can view channels they are members of" ON channels;
DROP POLICY IF EXISTS "Users can view all channels" ON channels;

-- Create new policy to allow all authenticated users to view channels
CREATE POLICY "Allow authenticated users to view channels"
ON channels FOR SELECT
TO authenticated
USING (true);

-- Enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
