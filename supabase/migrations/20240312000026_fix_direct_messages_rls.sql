-- Drop existing tables and policies
drop policy if exists "Users can view their direct messages" on direct_messages;
drop policy if exists "Users can send direct messages" on direct_messages;
drop policy if exists "Users can update their own messages" on direct_messages;
drop policy if exists "Users can delete their own messages" on direct_messages;

-- Create improved RLS policies for direct messages
create policy "Users can view their direct messages"
  on direct_messages for select
  using (
    auth.uid() = sender_id::text::uuid or 
    auth.uid() = recipient_id::text::uuid
  );

create policy "Users can send direct messages"
  on direct_messages for insert
  with check (
    auth.uid() = sender_id::text::uuid
  );

create policy "Users can update their own messages"
  on direct_messages for update
  using (
    auth.uid() = sender_id::text::uuid
  );

create policy "Users can delete their own messages"
  on direct_messages for delete
  using (
    auth.uid() = sender_id::text::uuid
  );

-- Ensure RLS is enabled
alter table direct_messages enable row level security;

-- Refresh realtime subscription
alter publication supabase_realtime add table direct_messages;