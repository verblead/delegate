-- Drop existing messages table
drop table if exists public.messages cascade;

-- Recreate messages table with proper structure and relationships
create table public.messages (
    id uuid default gen_random_uuid() primary key,
    content text not null,
    channel_id uuid references public.channels(id) on delete cascade not null,
    sender_id uuid references auth.users(id) on delete cascade not null,
    parent_id uuid references public.messages(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    has_attachments boolean default false
);

-- Create direct messages table
create table if not exists public.direct_messages (
    id uuid default gen_random_uuid() primary key,
    content text not null,
    sender_id uuid references auth.users(id) on delete cascade not null,
    recipient_id uuid references auth.users(id) on delete cascade not null,
    read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    has_attachments boolean default false
);

-- Enable RLS
alter table public.messages enable row level security;
alter table public.direct_messages enable row level security;

-- Messages policies
create policy "Users can view messages in their channels"
on public.messages for select
to authenticated
using (
    exists (
        select 1 from public.channel_members cm
        where cm.channel_id = messages.channel_id
        and cm.user_id = auth.uid()
    )
);

create policy "Users can send messages in their channels"
on public.messages for insert
to authenticated
with check (
    exists (
        select 1 from public.channel_members cm
        where cm.channel_id = channel_id
        and cm.user_id = auth.uid()
    )
    and sender_id = auth.uid()
);

create policy "Users can update their own messages"
on public.messages for update
to authenticated
using (sender_id = auth.uid())
with check (sender_id = auth.uid());

-- Direct messages policies
create policy "Users can view their direct messages"
on public.direct_messages for select
to authenticated
using (
    auth.uid() = sender_id or auth.uid() = recipient_id
);

create policy "Users can send direct messages"
on public.direct_messages for insert
to authenticated
with check (
    sender_id = auth.uid()
);

create policy "Users can update their own direct messages"
on public.direct_messages for update
to authenticated
using (sender_id = auth.uid())
with check (sender_id = auth.uid());

-- Create view for messages with sender info
create or replace view public.messages_with_sender as
select 
    m.*,
    p.username as sender_username,
    p.avatar_url as sender_avatar_url
from public.messages m
join public.profiles p on p.id = m.sender_id;

-- Create view for direct messages with sender info
create or replace view public.direct_messages_with_sender as
select 
    dm.*,
    p.username as sender_username,
    p.avatar_url as sender_avatar_url
from public.direct_messages dm
join public.profiles p on p.id = dm.sender_id;

-- Grant access to views
grant select on public.messages_with_sender to authenticated;
grant select on public.direct_messages_with_sender to authenticated;

-- Enable realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.direct_messages;