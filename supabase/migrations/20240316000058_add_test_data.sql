-- Add more test users
INSERT INTO auth.users (id, email) VALUES
    ('f1b74c47-6242-4ac3-9612-086b595674dd', 'test3@example.com'),
    ('g2b74c47-6242-4ac3-9612-086b595674ee', 'test4@example.com'),
    ('h3b74c47-6242-4ac3-9612-086b595674ff', 'test5@example.com')
ON CONFLICT (id) DO NOTHING;

-- Add profiles for test users
INSERT INTO public.profiles (id, email, username, role, avatar_url, points, status) VALUES
    ('f1b74c47-6242-4ac3-9612-086b595674dd', 'test3@example.com', 'test3', 'member', 'https://avatar.vercel.sh/test3', 150, 'online'),
    ('g2b74c47-6242-4ac3-9612-086b595674ee', 'test4@example.com', 'test4', 'member', 'https://avatar.vercel.sh/test4', 200, 'offline'),
    ('h3b74c47-6242-4ac3-9612-086b595674ff', 'test5@example.com', 'test5', 'moderator', 'https://avatar.vercel.sh/test5', 300, 'online')
ON CONFLICT (id) DO UPDATE SET 
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    points = EXCLUDED.points,
    status = EXCLUDED.status;

-- Add more test channels
INSERT INTO public.channels (id, name, description, created_by) VALUES
    ('d83a1408-a929-405b-bc58-5ada323accae', 'random', 'Random discussions', '4853a266-4821-4baf-901a-22a03773f0f4'),
    ('e93a1408-a929-405b-bc58-5ada323accaf', 'announcements', 'Important announcements', '4853a266-4821-4baf-901a-22a03773f0f4')
ON CONFLICT (id) DO NOTHING;

-- Add members to channels
INSERT INTO public.channel_members (channel_id, user_id, role) VALUES
    ('d83a1408-a929-405b-bc58-5ada323accae', '4853a266-4821-4baf-901a-22a03773f0f4', 'admin'),
    ('d83a1408-a929-405b-bc58-5ada323accae', 'd7c54c47-6242-4ac3-9612-086b595674bb', 'member'),
    ('e93a1408-a929-405b-bc58-5ada323accaf', '4853a266-4821-4baf-901a-22a03773f0f4', 'admin'),
    ('e93a1408-a929-405b-bc58-5ada323accaf', 'e9b74c47-6242-4ac3-9612-086b595674cc', 'member')
ON CONFLICT (channel_id, user_id) DO UPDATE SET role = EXCLUDED.role;