-- Create the direct_messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    recipient_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT sender_recipient_different CHECK (sender_id != recipient_id)
);

-- Add RLS policies
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
    ON public.direct_messages
    FOR SELECT
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );

CREATE POLICY "Users can send messages"
    ON public.direct_messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.direct_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create view for direct messages with sender profiles
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

-- Grant access to authenticated users
GRANT SELECT ON public.direct_messages_with_profiles TO authenticated;
GRANT ALL ON public.direct_messages TO authenticated;
