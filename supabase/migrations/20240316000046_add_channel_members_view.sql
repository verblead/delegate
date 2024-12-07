-- Create channel_members_with_profiles view
create or replace view channel_members_with_profiles as
select 
  cm.id,
  cm.channel_id,
  cm.user_id,
  cm.role,
  cm.created_at,
  p.username,
  p.avatar_url,
  p.points
from channel_members cm
join profiles p on p.id = cm.user_id;

-- Grant access to authenticated users
grant select on channel_members_with_profiles to authenticated;
