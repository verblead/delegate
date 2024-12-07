-- Drop existing channel_members table if it exists
DROP TABLE IF EXISTS public.channel_members CASCADE;

-- Recreate channel_members table with proper relationships
CREATE TABLE IF NOT EXISTS public.channel_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(channel_id, user_id)
);

-- Enable RLS
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Channel members can view other members"
ON public.channel_members FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_members.channel_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Channel admins can add members"
ON public.channel_members FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
    OR NOT EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_id
    )
);

CREATE POLICY "Channel admins can update member roles"
ON public.channel_members FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.channel_members cm
        WHERE cm.channel_id = channel_id
        AND cm.user_id = auth.uid()
        AND cm.role = 'admin'
    )
);

-- Create indexes
CREATE INDEX idx_channel_members_channel_id ON public.channel_members(channel_id);
CREATE INDEX idx_channel_members_user_id ON public.channel_members(user_id);
CREATE INDEX idx_channel_members_role ON public.channel_members(role);

-- Enable realtime
ALTER publication supabase_realtime ADD TABLE public.channel_members;

-- Add first user as admin to existing channels
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Add them as admin to all existing channels
        INSERT INTO public.channel_members (channel_id, user_id, role)
        SELECT id, first_user_id, 'admin'
        FROM public.channels
        WHERE NOT EXISTS (
            SELECT 1 FROM public.channel_members
            WHERE channel_id = channels.id
            AND user_id = first_user_id
        );
    END IF;
END $$;