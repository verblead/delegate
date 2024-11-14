-- First, drop all existing policies
drop policy if exists "Users can view messages in their channels" on messages;
drop policy if exists "Users can insert messages in their channels" on messages;
drop policy if exists "Users can update their own messages" on messages;
drop policy if exists "Users can delete their own messages" on messages;
drop policy if exists "Temporary debug messages policy" on messages;

drop policy if exists "Anyone can view channel members" on channel_members;
drop policy if exists "Anyone can add members" on channel_members;
drop policy if exists "Channel admins can update members" on channel_members;
drop policy if exists "Channel admins can remove members" on channel_members;
drop policy if exists "channel_members_insert_policy" on channel_members;
drop policy if exists "channel_members_update_policy" on channel_members;
drop policy if exists "channel_members_delete_policy" on channel_members;

-- Create simplified channel member policies
create policy "channel_members_select_policy"
  on channel_members for select
  using (true);

create policy "channel_members_insert_policy"
  on channel_members for insert
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from channel_members
      where channel_id = new.channel_id
      and user_id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

create policy "channel_members_delete_policy"
  on channel_members for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from channel_members
      where channel_id = channel_members.channel_id
      and user_id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

-- Create simplified message policies
create policy "messages_select_policy"
  on messages for select
  using (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = messages.channel_id
      and channel_members.user_id = auth.uid()
    )
  );

create policy "messages_insert_policy"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from channel_members
      where channel_id = messages.channel_id
      and user_id = auth.uid()
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
alter table channel_members enable row level security;

-- Refresh realtime subscriptions
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table channel_members; 