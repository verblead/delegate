-- Drop existing policies
drop policy if exists "Users can view message attachments" on message_attachments;
drop policy if exists "Users can insert message attachments" on message_attachments;
drop policy if exists "Users can delete message attachments" on message_attachments;

-- Create improved policies for message_attachments
create policy "Users can view message attachments"
  on message_attachments for select
  using (
    exists (
      select 1 from messages m
      join channel_members cm on cm.channel_id = m.channel_id
      where m.id = message_id
      and cm.user_id = auth.uid()
    )
  );

create policy "Users can insert message attachments"
  on message_attachments for insert
  with check (
    exists (
      select 1 from messages m
      where m.id = message_id
      and m.sender_id = auth.uid()
    )
  );

create policy "Users can delete message attachments"
  on message_attachments for delete
  using (
    exists (
      select 1 from messages m
      where m.id = message_id
      and m.sender_id = auth.uid()
    )
  );

-- Drop existing storage policies
drop policy if exists "Authenticated users can upload message attachments" on storage.objects;
drop policy if exists "Authenticated users can read message attachments" on storage.objects;
drop policy if exists "Users can delete their own message attachments" on storage.objects;

-- Create improved storage policies
create policy "Authenticated users can upload message attachments"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'message-attachments'
  );

create policy "Authenticated users can read message attachments"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'message-attachments'
  );

create policy "Users can delete their own message attachments"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'message-attachments' and
    auth.uid()::text = (storage.foldername(name))[2]
  );