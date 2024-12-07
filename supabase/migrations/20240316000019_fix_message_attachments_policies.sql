-- Drop existing policies
drop policy if exists "Allow insert for authenticated users" on public.message_attachments;
drop policy if exists "Users can insert message attachments" on public.message_attachments;
drop policy if exists "Users can upload attachments to their messages" on public.message_attachments;
drop policy if exists "Enable insert for authenticated users" on public.message_attachments;

-- Create a simple insert policy
create policy "Allow authenticated users to insert attachments"
on public.message_attachments for insert
to authenticated
with check (
    exists (
        select 1 from public.messages m
        where m.id = message_id
        and m.sender_id = auth.uid()
    )
);

-- Drop existing storage policies
drop policy if exists "Allow authenticated users to upload message attachments" on storage.objects;
drop policy if exists "Allow authenticated users to read message attachments" on storage.objects;

-- Create storage policies
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

-- Ensure message_attachments bucket exists and is public
insert into storage.buckets (id, name, public)
values ('message_attachments', 'message_attachments', true)
on conflict (id) do update
set public = true;
