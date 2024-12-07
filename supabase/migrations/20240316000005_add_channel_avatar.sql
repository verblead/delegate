-- Add is_admin column to channel_members if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'channel_members' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE channel_members ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Add avatar_url column to channels table
ALTER TABLE channels ADD COLUMN avatar_url TEXT;

-- Update RLS policy to allow admins to update avatar_url
CREATE POLICY "Allow admins to update channel avatar"
ON channels
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM channel_members cm
        WHERE cm.channel_id = id
        AND cm.user_id = auth.uid()
        AND cm.is_admin = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM channel_members cm
        WHERE cm.channel_id = id
        AND cm.user_id = auth.uid()
        AND cm.is_admin = true
    )
);
