-- Drop existing policies
drop policy if exists "Users can view channel members" on channel_members;
drop policy if exists "Users can join channels" on channel_members;
drop policy if exists "Channel admins can manage members" on channel_members;

-- Create improved policies
create policy "Anyone can view channel members"
  on channel_members for select
  using (true);

create policy "Users can add channel members"
  on channel_members for insert
  with check (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = new.channel_id
      and channel_members.user_id = auth.uid()
    ) or new.user_id = auth.uid()
  );

create policy "Channel admins can update members"
  on channel_members for update
  using (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = channel_members.channel_id
      and channel_members.user_id = auth.uid()
      and channel_members.role in ('admin', 'moderator')
    )
  );

create policy "Channel admins can remove members"
  on channel_members for delete
  using (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = channel_members.channel_id
      and channel_members.user_id = auth.uid()
      and channel_members.role in ('admin', 'moderator')
    )
  );

-- Ensure RLS is enabled
alter table channel_members enable row level security;

-- Refresh realtime subscription
alter publication supabase_realtime add table channel_members;