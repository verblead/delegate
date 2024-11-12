-- Drop existing policies
drop policy if exists "Anyone can view channel members" on channel_members;
drop policy if exists "Anyone can add members" on channel_members;
drop policy if exists "Channel admins can update members" on channel_members;
drop policy if exists "Channel admins can remove members" on channel_members;

-- Create improved policies
create policy "Users can view channel members"
  on channel_members for select
  using (true);

create policy "Users can add channel members"
  on channel_members for insert
  with check (
    exists (
      select 1 from channels
      where id = channel_members.channel_id
    )
  );

create policy "Users can update channel members"
  on channel_members for update
  using (
    exists (
      select 1 from channel_members
      where channel_id = channel_members.channel_id
      and user_id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

create policy "Users can delete channel members"
  on channel_members for delete
  using (
    exists (
      select 1 from channel_members
      where channel_id = channel_members.channel_id
      and user_id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

-- Add unique constraint to prevent duplicate members
alter table channel_members
  drop constraint if exists channel_members_unique_membership,
  add constraint channel_members_unique_membership 
    unique (channel_id, user_id);

-- Ensure RLS is enabled
alter table channel_members enable row level security;

-- Refresh realtime subscription
alter publication supabase_realtime add table channel_members;