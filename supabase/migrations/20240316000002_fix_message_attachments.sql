-- Create channels table if it doesn't exist
create table if not exists public.channels (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) on delete set null
);

-- Add RLS to channels table
alter table public.channels enable row level security;

-- Create channel_members table if it doesn't exist
create table if not exists public.channel_members (
    id uuid default uuid_generate_v4() primary key,
    channel_id uuid references public.channels(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    role text default 'member' check (role in ('owner', 'admin', 'member')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique (channel_id, user_id)
);

-- Add RLS to channel_members table
alter table public.channel_members enable row level security;

-- Allow channel members to view channel members
create policy "Channel members can view channel members"
on public.channel_members for select
to authenticated
using (
    exists (
        select 1 from public.channel_members cm
        where cm.channel_id = channel_id
        and cm.user_id = auth.uid()
    )
);

-- Create messages table if it doesn't exist
create table if not exists public.messages (
    id uuid default uuid_generate_v4() primary key,
    content text,
    channel_id uuid not null,
    sender_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    has_attachments boolean default false
);

-- Add RLS to messages table
alter table public.messages enable row level security;

-- Allow authenticated users to insert messages in their channels
create policy "Users can insert messages in their channels"
on public.messages for insert
to authenticated
with check (
    exists (
        select 1 from public.channel_members cm
        where cm.channel_id = channel_id
        and cm.user_id = auth.uid()
    )
);

-- Allow users to view messages in their channels
create policy "Users can view messages in their channels"
on public.messages for select
to authenticated
using (
    exists (
        select 1 from public.channel_members cm
        where cm.channel_id = channel_id
        and cm.user_id = auth.uid()
    )
);

-- Create message_attachments table if it doesn't exist
create table if not exists public.message_attachments (
    id uuid default uuid_generate_v4() primary key,
    message_id uuid references public.messages(id) on delete cascade,
    file_name text not null,
    file_type text,
    file_size bigint,
    url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS to message_attachments table
alter table public.message_attachments enable row level security;

-- Allow authenticated users to insert attachments
create policy "Users can insert message attachments"
on public.message_attachments for insert
to authenticated
with check (
    exists (
        select 1 from public.messages m
        where m.id = message_id
        and (
            m.sender_id = auth.uid() 
            or exists (
                select 1 from public.channel_members cm
                where cm.channel_id = m.channel_id
                and cm.user_id = auth.uid()
            )
        )
    )
);

-- Allow users to view attachments in their channels
create policy "Users can view message attachments in their channels"
on public.message_attachments for select
to authenticated
using (
    exists (
        select 1 from public.messages m
        join public.channel_members cm on cm.channel_id = m.channel_id
        where m.id = message_id
        and cm.user_id = auth.uid()
    )
);

-- Enable realtime for message_attachments
alter publication supabase_realtime add table message_attachments;

-- Ensure message_attachments bucket exists and is public
insert into storage.buckets (id, name, public)
values ('message_attachments', 'message_attachments', true)
on conflict (id) do update
set public = true;

-- Update storage policies for message_attachments bucket
create policy "Allow authenticated users to upload message attachments"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'message_attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Allow authenticated users to read message attachments"
on storage.objects for select
to authenticated
using (
    bucket_id = 'message_attachments'
);
