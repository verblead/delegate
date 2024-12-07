-- Drop existing view if it exists
drop view if exists channel_members_with_profiles;

-- Recreate the view with all necessary columns
create view channel_members_with_profiles as
select 
    cm.*,
    p.username,
    p.avatar_url,
    p.points,
    p.status,
    p.last_seen
from channel_members cm
join profiles p on p.id = cm.user_id;

-- Grant access to authenticated users
grant select on channel_members_with_profiles to authenticated;
