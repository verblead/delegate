-- First, drop all existing policies on message_attachments
drop policy if exists "Enable delete for message owners" on public.message_attachments;
drop policy if exists "Enable insert for authenticated users" on public.message_attachments;
drop policy if exists "Enable read access for all users" on public.message_attachments;
drop policy if exists "Enable read access for authenticated users" on public.message_attachments;
drop policy if exists "Users can delete message attachments" on public.message_attachments;
drop policy if exists "Users can delete their own message attachments" on public.message_attachments;
drop policy if exists "Users can insert message attachments" on public.message_attachments;
drop policy if exists "Users can upload attachments to their messages" on public.message_attachments;

-- Make sure RLS is enabled
alter table public.message_attachments enable row level security;

-- Create a single, clear insert policy
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

-- Create a single, clear select policy
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

-- Create a single, clear delete policy
create policy "Users can delete their own attachments"
on public.message_attachments for delete
to authenticated
using (
    exists (
        select 1 from public.messages m
        where m.id = message_id
        and m.sender_id = auth.uid()
    )
);

-- Drop any existing storage policies for message-attachments bucket
drop policy if exists "Allow authenticated users to upload message attachments" on storage.objects;
drop policy if exists "Allow authenticated users to read message attachments" on storage.objects;

-- Create clear storage policies
create policy "Allow authenticated users to upload message attachments"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'message-attachments'
);

create policy "Allow authenticated users to read message attachments"
on storage.objects for select
to authenticated
using (
    bucket_id = 'message-attachments'
);

-- Make sure the bucket exists and is public
insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', true)
on conflict (id) do update
set public = true;
