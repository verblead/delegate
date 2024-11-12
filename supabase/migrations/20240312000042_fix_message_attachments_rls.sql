-- Drop existing policies
drop policy if exists "Users can view messages in their channels" on messages;
drop policy if exists "Users can insert messages in their channels" on messages;
drop policy if exists "Users can update their own messages" on messages;
drop policy if exists "Users can delete their own messages" on messages;

-- Create improved message policies
create policy "Users can view messages in their channels"
  on messages for select
  using (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = messages.channel_id
      and channel_members.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their channels"
  on messages for insert
  with check (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = channel_id
      and channel_members.user_id = auth.uid()
    )
    and sender_id = auth.uid()
  );

create policy "Users can update their own messages"
  on messages for update
  using (sender_id = auth.uid());

create policy "Users can delete their own messages"
  on messages for delete
  using (sender_id = auth.uid());

-- Drop existing message attachment policies
drop policy if exists "Users can view message attachments" on message_attachments;
drop policy if exists "Users can insert message attachments" on message_attachments;
drop policy if exists "Users can delete message attachments" on message_attachments;

-- Create improved message attachment policies
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

-- Ensure RLS is enabled
alter table messages enable row level security;
alter table message_attachments enable row level security;