-- Drop any existing message policies
drop policy if exists "Temporary debug messages policy" on messages;
drop policy if exists "Users can view messages in their channels" on messages;
drop policy if exists "messages_select_policy" on messages;

-- Create a clear select policy for messages
create policy "messages_select_policy"
  on messages for select
  using (
    exists (
      select 1 
      from channel_members cm
      join channels c on c.id = cm.channel_id
      where cm.channel_id = messages.channel_id
      and cm.user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
alter table messages enable row level security;

-- Refresh realtime subscription
alter publication supabase_realtime add table messages; 