-- Create a view to easily get channel member information
create or replace view channel_members_with_profiles as
select 
  cm.*,
  p.username,
  p.avatar_url,
  c.name as channel_name
from channel_members cm
join auth.users u on u.id = cm.user_id
join profiles p on p.id = cm.user_id
join channels c on c.id = cm.channel_id;

-- Grant access to the view
grant select on channel_members_with_profiles to authenticated;