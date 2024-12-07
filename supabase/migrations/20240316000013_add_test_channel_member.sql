-- Create the test user profile first
insert into auth.users (id, email)
values (
    '4853a266-4821-4baf-901a-22a03773f0f4',
    'test@example.com'
)
on conflict (id) do nothing;

insert into public.profiles (id, username, avatar_url)
values (
    '4853a266-4821-4baf-901a-22a03773f0f4',
    'Test User',
    null
)
on conflict (id) do nothing;

-- Create the Church Family channel
insert into public.channels (id, name, description, is_private, created_by)
values (
    'c73a1408-a929-405b-bc58-5ada323accad',
    'Church Family',
    'The best family ever',
    false,
    '4853a266-4821-4baf-901a-22a03773f0f4'
)
on conflict (id) do nothing;

-- Add test user to the Church Family channel
insert into public.channel_members (channel_id, user_id, role)
values (
    'c73a1408-a929-405b-bc58-5ada323accad',  -- Church Family channel
    '4853a266-4821-4baf-901a-22a03773f0f4',  -- Your user ID
    'member'
)
on conflict (channel_id, user_id) do nothing;
