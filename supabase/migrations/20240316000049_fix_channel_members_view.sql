-- Drop existing view if it exists
drop view if exists channel_members_with_profiles;

-- Drop existing policies
drop policy if exists "Users can view channel members" on channel_members;
drop policy if exists "Users can join channels" on channel_members;
drop policy if exists "Users can leave channels" on channel_members;
drop policy if exists "Users can update their own role" on channel_members;
drop policy if exists "allow_select_members" on channel_members;
drop policy if exists "allow_insert_members" on channel_members;
drop policy if exists "allow_update_members" on channel_members;
drop policy if exists "allow_delete_members" on channel_members;

-- Create the view
create view channel_members_with_profiles as
select 
    cm.*,
    p.username,
    p.avatar_url,
    p.points
from channel_members cm
join profiles p on p.id = cm.user_id;

-- Grant access to authenticated users
grant select on channel_members_with_profiles to authenticated;

-- Create unified policies for channel_members
create policy "Users can view channel members"
on channel_members for select
to authenticated
using (true);

create policy "Users can join channels"
on channel_members for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can leave channels"
on channel_members for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can update their own role"
on channel_members for update
to authenticated
using (auth.uid() = user_id);
