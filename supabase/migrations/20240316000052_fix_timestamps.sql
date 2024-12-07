-- Update profiles table
alter table profiles 
alter column created_at set default now(),
alter column created_at set not null;

-- Update channel_members table
alter table channel_members 
alter column created_at set default now(),
alter column created_at set not null;

-- Drop and recreate the view with proper timestamp handling
drop view if exists channel_members_with_profiles;

create view channel_members_with_profiles as
select 
    cm.id,
    cm.channel_id,
    cm.user_id,
    cm.role,
    cm.created_at at time zone 'UTC' as created_at,
    p.username,
    p.avatar_url,
    p.points,
    p.status,
    p.last_seen at time zone 'UTC' as last_seen
from channel_members cm
join profiles p on p.id = cm.user_id;

-- Grant access to authenticated users
grant select on channel_members_with_profiles to authenticated;
