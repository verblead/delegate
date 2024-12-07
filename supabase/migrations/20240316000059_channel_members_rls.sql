-- Enable RLS on channel_members table
alter table public.channel_members enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view channel members" on channel_members;
drop policy if exists "Channel admins can add members" on channel_members;
drop policy if exists "Channel admins can remove members" on channel_members;
drop policy if exists "Members can leave channels" on channel_members;

-- Policy for viewing channel members (users can view members of channels they are in)
create policy "Users can view channel members"
on public.channel_members
for select
using (
    exists (
        select 1
        from channel_members cm
        where cm.channel_id = channel_members.channel_id
        and cm.user_id = auth.uid()
    )
);

-- Policy for adding members (only channel admins and owners can add members)
create policy "Channel admins can add members"
on public.channel_members
for insert
with check (
    exists (
        select 1
        from channel_members cm
        where cm.channel_id = channel_members.channel_id
        and cm.user_id = auth.uid()
        and cm.role in ('admin', 'owner')
    )
);

-- Policy for removing members (only channel admins and owners can remove members)
create policy "Channel admins can remove members"
on public.channel_members
for delete
using (
    exists (
        select 1
        from channel_members cm
        where cm.channel_id = channel_members.channel_id
        and cm.user_id = auth.uid()
        and cm.role in ('admin', 'owner')
    )
);

-- Policy for leaving channels (members can remove themselves)
create policy "Members can leave channels"
on public.channel_members
for delete
using (
    user_id = auth.uid()
);

-- Grant necessary permissions to authenticated users
grant select, insert, delete on public.channel_members to authenticated;

-- Ensure channel_members_with_profiles view has correct permissions
grant select on public.channel_members_with_profiles to authenticated;

-- Add indexes for better performance
create index if not exists channel_members_channel_id_idx on channel_members(channel_id);
create index if not exists channel_members_user_id_idx on channel_members(user_id);
create index if not exists channel_members_role_idx on channel_members(role);

-- Update the channel_members_with_profiles view to include channel name
drop view if exists channel_members_with_profiles;
create view channel_members_with_profiles as
select 
    cm.*,
    p.username,
    p.avatar_url,
    p.points,
    p.status,
    p.last_seen,
    c.name as channel_name
from channel_members cm
join profiles p on p.id = cm.user_id
join channels c on c.id = cm.channel_id;
