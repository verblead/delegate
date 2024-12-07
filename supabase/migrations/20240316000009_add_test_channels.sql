-- Add test channels
INSERT INTO public.channels (name, description, is_private, created_by)
SELECT 
    'general',
    'General discussion channel',
    false,
    auth.uid()
WHERE EXISTS (
    SELECT 1 FROM auth.users LIMIT 1
);

INSERT INTO public.channels (name, description, is_private, created_by)
SELECT 
    'announcements',
    'Important announcements',
    false,
    auth.uid()
WHERE EXISTS (
    SELECT 1 FROM auth.users LIMIT 1
);

INSERT INTO public.channels (name, description, is_private, created_by)
SELECT 
    'random',
    'Random discussions',
    false,
    auth.uid()
WHERE EXISTS (
    SELECT 1 FROM auth.users LIMIT 1
);

-- Add members for each channel
DO $$
DECLARE
    channel_record RECORD;
    user_record RECORD;
BEGIN
    -- Get the first user
    SELECT id INTO user_record FROM auth.users LIMIT 1;
    
    IF user_record IS NOT NULL THEN
        -- For each channel
        FOR channel_record IN SELECT id FROM public.channels LOOP
            -- Add the user as an admin
            INSERT INTO public.channel_members (channel_id, user_id, role)
            VALUES (channel_record.id, user_record.id, 'admin')
            ON CONFLICT (channel_id, user_id) 
            DO UPDATE SET role = 'admin';
        END LOOP;
    END IF;
END $$;
