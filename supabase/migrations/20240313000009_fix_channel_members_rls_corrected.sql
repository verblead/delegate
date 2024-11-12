-- First drop ALL existing policies
drop policy if exists "Anyone can view channel members" on channel_members;
drop policy if exists "Users can join channels" on channel_members;
drop policy if exists "Channel admins can manage members" on channel_members;
drop policy if exists "Users can add channel members" on channel_members;
drop policy if exists "Channel admins can update members" on channel_members;
drop policy if exists "Channel admins can remove members" on channel_members;
drop policy if exists "Anyone can create channel memberships" on channel_members;
drop policy if exists "Users can view channel memberships" on channel_members;
drop policy if exists "Channel admins can update memberships" on channel_members;
drop policy if exists "Channel admins can delete memberships" on channel_members;

-- Create new simplified policies
create policy "channel_members_select_policy"
  on channel_members for select
  using (true);

create policy "channel_members_insert_policy"
  on channel_members for insert
  with check (
    -- Allow if user is adding themselves
    auth.uid() = user_id
    OR
    -- Allow if user is already a member of the channel
    exists (
      select 1 from channel_members
      where channel_id = new.channel_id
      and user_id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

create policy "channel_members_update_policy"
  on channel_members for update
  using (
    exists (
      select 1 from channel_members
      where channel_id = channel_members.channel_id
      and user_id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

create policy "channel_members_delete_policy"
  on channel_members for delete
  using (
    exists (
      select 1 from channel_members
      where channel_id = channel_members.channel_id
      and user_id = auth.uid()
      and role in ('admin', 'moderator')
    )
    OR
    -- Allow users to remove themselves
    auth.uid() = user_id
  );

-- Ensure RLS is enabled
alter table channel_members enable row level security;

-- Refresh realtime subscription
alter publication supabase_realtime add table channel_members;