-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their direct messages" ON direct_messages;
DROP POLICY IF EXISTS "Users can send direct messages" ON direct_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON direct_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON direct_messages;

-- Enable RLS on direct_messages table
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Add read column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'direct_messages' 
        AND column_name = 'read'
    ) THEN
        ALTER TABLE public.direct_messages ADD COLUMN read BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Policy for viewing messages (users can view messages where they are either sender or recipient)
CREATE POLICY "Users can view their direct messages"
ON public.direct_messages
FOR SELECT
USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id
);

-- Policy for sending messages (users can only send messages as themselves)
CREATE POLICY "Users can send direct messages"
ON public.direct_messages
FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
);

-- Policy for updating messages (users can only update their own messages)
CREATE POLICY "Users can update own messages"
ON public.direct_messages
FOR UPDATE
USING (
    auth.uid() = sender_id
)
WITH CHECK (
    auth.uid() = sender_id
);

-- Policy for deleting messages (users can only delete their own messages)
CREATE POLICY "Users can delete own messages"
ON public.direct_messages
FOR DELETE
USING (
    auth.uid() = sender_id
);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.direct_messages TO authenticated;

-- Update the direct_messages_with_profiles view to include the read status
CREATE OR REPLACE VIEW direct_messages_with_profiles AS
SELECT 
    dm.*,
    sender.username AS sender_username,
    sender.avatar_url AS sender_avatar_url,
    recipient.username AS recipient_username,
    recipient.avatar_url AS recipient_avatar_url
FROM 
    public.direct_messages dm
    LEFT JOIN public.profiles sender ON dm.sender_id = sender.id
    LEFT JOIN public.profiles recipient ON dm.recipient_id = recipient.id;

-- Grant access to the view
GRANT SELECT ON public.direct_messages_with_profiles TO authenticated;
