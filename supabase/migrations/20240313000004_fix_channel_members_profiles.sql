-- Drop existing channel_members table and related objects
drop view if exists channel_members_with_profiles;
drop table if exists channel_members cascade;

-- Recreate channel_members table with proper relationships
create table channel_members (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references channels(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(channel_id, user_id)
);

-- Enable RLS
alter table channel_members enable row level security;

-- Create policies
create policy "Users can view channel members"
  on channel_members for select
  using (
    exists (
      select 1 from channel_members cm
      where cm.channel_id = channel_members.channel_id
      and cm.user_id = auth.uid()
    )
  );

create policy "Users can join channels"
  on channel_members for insert
  with check (auth.uid() = user_id);

create policy "Channel admins can manage members"
  on channel_members for delete
  using (
    exists (
      select 1 from channel_members cm
      where cm.channel_id = channel_members.channel_id
      and cm.user_id = auth.uid()
      and cm.role = 'admin'
    )
  );

-- Create indexes
create index idx_channel_members_channel_id on channel_members(channel_id);
create index idx_channel_members_user_id on channel_members(user_id);
create index idx_channel_members_role on channel_members(role);

-- Create view for member information
create view channel_members_with_profiles as
select 
  cm.*,
  p.username,
  p.avatar_url,
  c.name as channel_name
from channel_members cm
join profiles p on p.id = cm.user_id
join channels c on c.id = cm.channel_id;

-- Grant access to the view
grant select on channel_members_with_profiles to authenticated;

-- Enable realtime
alter publication supabase_realtime add table channel_members;