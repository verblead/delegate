-- Drop existing storage policies for message_attachments bucket
drop policy if exists "Allow authenticated users to upload message attachments" on storage.objects;
drop policy if exists "Allow authenticated users to read message attachments" on storage.objects;
drop policy if exists "Allow authenticated users to delete their message attachments" on storage.objects;

-- Create storage policies that match the database policies
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

create policy "Allow authenticated users to delete their message attachments"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'message_attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
);
