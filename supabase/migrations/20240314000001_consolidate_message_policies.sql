-- Drop all existing message policies
drop policy if exists "Users can view messages in channels they are members of" on messages;
drop policy if exists "Users can insert messages in channels they are members of" on messages;
drop policy if exists "Users can update their own messages" on messages;
drop policy if exists "Users can delete their own messages" on messages;
drop policy if exists "Users can view messages in their channels" on messages;
drop policy if exists "Users can insert messages in their channels" on messages;
drop policy if exists "Users can update own messages" on messages;
drop policy if exists "Users can delete own messages" on messages;

-- Create final consolidated policies for messages
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

-- Ensure RLS and realtime are properly configured
alter table messages enable row level security;
alter publication supabase_realtime add table messages; 