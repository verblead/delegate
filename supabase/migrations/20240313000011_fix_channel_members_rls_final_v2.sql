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
drop policy if exists "channel_members_select_policy" on channel_members;
drop policy if exists "channel_members_insert_policy" on channel_members;
drop policy if exists "channel_members_update_policy" on channel_members;
drop policy if exists "channel_members_delete_policy" on channel_members;

-- Create new simplified policies
create policy "channel_members_select_policy"
  on channel_members for select
  using (true);

create policy "channel_members_insert_policy"
  on channel_members for insert
  with check (
    auth.uid() in (
      -- Allow if user is adding themselves
      user_id,
      -- Or if user is an admin/moderator of the channel
      (
        select cm.user_id 
        from channel_members cm
        where cm.channel_id = channel_members.channel_id
        and cm.user_id = auth.uid()
        and cm.role in ('admin', 'moderator')
        limit 1
      )
    )
  );

create policy "channel_members_update_policy"
  on channel_members for update
  using (
    exists (
      select 1 
      from channel_members cm
      where cm.channel_id = channel_members.channel_id
      and cm.user_id = auth.uid()
      and cm.role in ('admin', 'moderator')
    )
  );

create policy "channel_members_delete_policy"
  on channel_members for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 
      from channel_members cm
      where cm.channel_id = channel_members.channel_id
      and cm.user_id = auth.uid()
      and cm.role in ('admin', 'moderator')
    )
  );

-- Ensure RLS is enabled
alter table channel_members enable row level security;