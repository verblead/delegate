-- Create admin user if not exists
INSERT INTO auth.users (id, email)
VALUES (
    '4853a266-4821-4baf-901a-22a03773f0f4',
    'admin@example.com'
) ON CONFLICT (id) DO NOTHING;

-- Ensure admin profile exists
INSERT INTO public.profiles (
    id,
    email,
    username,
    role,
    avatar_url,
    points,
    created_at,
    updated_at
) VALUES (
    '4853a266-4821-4baf-901a-22a03773f0f4',
    'admin@example.com',
    'admin',
    'admin',
    'https://avatar.vercel.sh/admin',
    1000,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    points = 1000;

-- Create initial test channel
INSERT INTO public.channels (
    id,
    name,
    description,
    created_by,
    created_at
) VALUES (
    'c73a1408-a929-405b-bc58-5ada323accad',
    'general',
    'General discussion channel',
    '4853a266-4821-4baf-901a-22a03773f0f4',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Add admin as channel member
INSERT INTO public.channel_members (
    channel_id,
    user_id,
    role,
    created_at
) VALUES (
    'c73a1408-a929-405b-bc58-5ada323accad',
    '4853a266-4821-4baf-901a-22a03773f0f4',
    'admin',
    NOW()
) ON CONFLICT (channel_id, user_id) DO UPDATE SET role = 'admin';

-- Create some test users
INSERT INTO auth.users (id, email) VALUES
    ('d7c54c47-6242-4ac3-9612-086b595674bb', 'user1@example.com'),
    ('e9b74c47-6242-4ac3-9612-086b595674cc', 'user2@example.com')
ON CONFLICT (id) DO NOTHING;

-- Create profiles for test users
INSERT INTO public.profiles (id, email, username, role, avatar_url, points) VALUES
    ('d7c54c47-6242-4ac3-9612-086b595674bb', 'user1@example.com', 'user1', 'member', 'https://avatar.vercel.sh/user1', 100),
    ('e9b74c47-6242-4ac3-9612-086b595674cc', 'user2@example.com', 'user2', 'member', 'https://avatar.vercel.sh/user2', 50)
ON CONFLICT (id) DO UPDATE SET 
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    points = EXCLUDED.points;