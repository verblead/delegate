-- Create storage bucket for message attachments
insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload files
create policy "Authenticated users can upload files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'message-attachments' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read files
create policy "Authenticated users can read files"
on storage.objects for select
to authenticated
using (bucket_id = 'message-attachments');