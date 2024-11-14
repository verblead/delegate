-- First drop ALL existing message policies
drop policy if exists "Temporary debug messages policy" on messages;
drop policy if exists "Users can view messages in their channels" on messages;
drop policy if exists "Users can insert messages in their channels" on messages;
drop policy if exists "Users can update their own messages" on messages;
drop policy if exists "Users can delete their own messages" on messages;
drop policy if exists "Users can update own messages" on messages;
drop policy if exists "Users can delete own messages" on messages;

-- Create single set of message policies
create policy "messages_select_policy"
  on messages for select
  using (
    exists (
      select 1 from channel_members cm
      where cm.channel_id = messages.channel_id
      and cm.user_id = auth.uid()
    )
  );

create policy "messages_insert_policy"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from channel_members cm
      where cm.channel_id = messages.channel_id
      and cm.user_id = auth.uid()
    )
  );

create policy "messages_update_policy"
  on messages for update
  using (auth.uid() = sender_id);

create policy "messages_delete_policy"
  on messages for delete
  using (auth.uid() = sender_id);

-- Ensure RLS is enabled
alter table messages enable row level security;

-- Refresh realtime subscription
alter publication supabase_realtime add table messages; 