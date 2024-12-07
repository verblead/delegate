-- Drop existing storage policies if they exist
drop policy if exists "Allow authenticated users to upload files" on storage.objects;
drop policy if exists "Allow authenticated users to read files" on storage.objects;

-- Create message attachments bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('message-attachments', 'message-attachments', true)
on conflict (id) do update
set public = true;

-- Set up storage policies for message attachments bucket
create policy "Allow authenticated users to upload files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'message-attachments'
);

create policy "Allow authenticated users to read files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'message-attachments'
);
