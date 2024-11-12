-- Drop existing policies
drop policy if exists "Users can view messages in their channels" on messages;
drop policy if exists "Users can insert messages" on messages;
drop policy if exists "Users can update own messages" on messages;
drop policy if exists "Users can delete own messages" on messages;

-- Create improved policies for messages table
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
    and auth.uid() = sender_id
  );

create policy "Users can update their own messages"
  on messages for update
  using (auth.uid() = sender_id);

create policy "Users can delete their own messages"
  on messages for delete
  using (auth.uid() = sender_id);

-- Ensure RLS is enabled
alter table messages enable row level security;

-- Drop existing storage policies
drop policy if exists "Authenticated users can upload files" on storage.objects;
drop policy if exists "Authenticated users can read files" on storage.objects;
drop policy if exists "Users can delete their own files" on storage.objects;

-- Create improved storage policies
create policy "Authenticated users can upload message attachments"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'message-attachments' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Authenticated users can read message attachments"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'message-attachments');

create policy "Users can delete their own message attachments"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'message-attachments' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to check channel membership
create or replace function public.is_channel_member(channel_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from channel_members
    where channel_members.channel_id = $1
    and channel_members.user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;