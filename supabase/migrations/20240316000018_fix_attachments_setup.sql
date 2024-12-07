-- Drop existing message_attachments table and recreate it
drop table if exists public.message_attachments cascade;

create table if not exists public.message_attachments (
    id uuid default uuid_generate_v4() primary key,
    message_id uuid references public.messages(id) on delete cascade,
    file_name text not null,
    file_type text,
    file_size bigint,
    url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on message_attachments
alter table public.message_attachments enable row level security;

-- Drop existing policies
drop policy if exists "Users can upload attachments to their messages" on public.message_attachments;
drop policy if exists "Users can view attachments in their channels" on public.message_attachments;

-- Create clear policies for message_attachments
create policy "Users can upload attachments to their messages"
on public.message_attachments for insert
to authenticated
with check (
    exists (
        select 1 from public.messages m
        where m.id = message_id
        and m.sender_id = auth.uid()
    )
);

create policy "Users can view attachments in their channels"
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

-- Ensure message-attachments bucket exists and is public
insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', true)
on conflict (id) do update
set public = true;

-- Drop existing storage policies
drop policy if exists "Allow authenticated users to upload message attachments" on storage.objects;
drop policy if exists "Allow authenticated users to read message attachments" on storage.objects;

-- Create clear storage policies
create policy "Allow authenticated users to upload message attachments"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'message-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Allow authenticated users to read message attachments"
on storage.objects for select
to authenticated
using (
    bucket_id = 'message-attachments'
);

-- Enable realtime for message_attachments
alter publication supabase_realtime add table message_attachments;
