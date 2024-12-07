-- Ensure the first user exists
INSERT INTO auth.users (id, email)
VALUES (
    '4853a266-4821-4baf-901a-22a03773f0f4',
    'admin@example.com'
) ON CONFLICT (id) DO NOTHING;

-- Ensure profile exists and is admin
INSERT INTO public.profiles (id, email, username, role, avatar_url)
VALUES (
    '4853a266-4821-4baf-901a-22a03773f0f4',
    'admin@example.com',
    'admin',
    'admin',
    'https://avatar.vercel.sh/admin'
) ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Create initial channel
INSERT INTO public.channels (id, name, description, created_by)
VALUES (
    'c73a1408-a929-405b-bc58-5ada323accad',
    'general',
    'General discussion channel',
    '4853a266-4821-4baf-901a-22a03773f0f4'
) ON CONFLICT (id) DO NOTHING;

-- Add admin as channel member
INSERT INTO public.channel_members (channel_id, user_id, role)
VALUES (
    'c73a1408-a929-405b-bc58-5ada323accad',
    '4853a266-4821-4baf-901a-22a03773f0f4',
    'admin'
) ON CONFLICT (channel_id, user_id) DO UPDATE SET role = 'admin';