-- Update profiles table structure
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'member',
ADD COLUMN IF NOT EXISTS last_seen timestamp with time zone;

-- Update messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS mentions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient_id ON public.direct_messages(recipient_id);

-- Update RLS policies for profiles
CREATE POLICY IF NOT EXISTS "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Update RLS policies for messages
CREATE POLICY IF NOT EXISTS "Users can delete their own messages"
ON public.messages
FOR DELETE
USING (sender_id = auth.uid());

-- Update RLS policies for direct messages
CREATE POLICY IF NOT EXISTS "Users can delete their own direct messages"
ON public.direct_messages
FOR DELETE
USING (sender_id = auth.uid());

-- Create function to update last_seen
CREATE OR REPLACE FUNCTION public.handle_user_presence()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET last_seen = NOW(),
      status = CASE 
        WHEN TG_OP = 'DELETE' THEN 'offline'
        ELSE 'online'
      END
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user presence
DROP TRIGGER IF EXISTS on_auth_user_presence ON auth.users;
CREATE TRIGGER on_auth_user_presence
  AFTER INSERT OR UPDATE OR DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_presence();