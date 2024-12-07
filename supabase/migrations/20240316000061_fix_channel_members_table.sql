-- Drop existing channel_members table if it exists
drop table if exists channel_members cascade;

-- Create channel_members table with correct constraints
create table channel_members (
    id uuid default gen_random_uuid() primary key,
    channel_id uuid not null references channels(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('owner', 'admin', 'member')),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    
    -- Ensure unique combination of channel_id and user_id
    unique (channel_id, user_id)
);

-- Add indexes for better performance
create index channel_members_channel_id_idx on channel_members(channel_id);
create index channel_members_user_id_idx on channel_members(user_id);
create index channel_members_role_idx on channel_members(role);

-- Enable RLS
alter table channel_members enable row level security;

-- Recreate the view with all necessary fields
create or replace view channel_members_with_profiles as
select 
    cm.*,
    p.username,
    p.avatar_url,
    p.status,
    p.points,
    p.last_seen,
    c.name as channel_name
from channel_members cm
join profiles p on p.id = cm.user_id
join channels c on c.id = cm.channel_id;

-- Grant necessary permissions
grant select on channel_members_with_profiles to authenticated;
grant select, insert, update, delete on channel_members to authenticated;

-- Add RLS policies
drop policy if exists "Users can view channel members" on channel_members;
create policy "Users can view channel members"
on channel_members for select
using (
    exists (
        select 1 from channel_members cm
        where cm.channel_id = channel_members.channel_id
        and cm.user_id = auth.uid()
    )
);

drop policy if exists "Channel admins can manage members" on channel_members;
create policy "Channel admins can manage members"
on channel_members for all
using (
    exists (
        select 1 from channel_members cm
        where cm.channel_id = channel_members.channel_id
        and cm.user_id = auth.uid()
        and cm.role in ('admin', 'owner')
    )
)
with check (
    exists (
        select 1 from channel_members cm
        where cm.channel_id = channel_members.channel_id
        and cm.user_id = auth.uid()
        and cm.role in ('admin', 'owner')
    )
);

drop policy if exists "Members can leave channels" on channel_members;
create policy "Members can leave channels"
on channel_members for delete
using (
    user_id = auth.uid()
);
