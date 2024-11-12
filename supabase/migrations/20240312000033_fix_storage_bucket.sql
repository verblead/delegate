-- Create storage bucket for message attachments if it doesn't exist
insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', true)
on conflict (id) do nothing;

-- Create storage bucket for avatars if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload files to message-attachments
create policy "Authenticated users can upload message attachments"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'message-attachments' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to read message attachments
create policy "Authenticated users can read message attachments"
on storage.objects for select
to authenticated
using (bucket_id = 'message-attachments');

-- Allow authenticated users to delete their own message attachments
create policy "Users can delete their own message attachments"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'message-attachments' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to upload avatars
create policy "Authenticated users can upload avatars"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars' and
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to read avatars
create policy "Public can read avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- Allow users to delete their own avatars
create policy "Users can delete their own avatars"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars' and
  auth.uid()::text = (storage.foldername(name))[1]
);