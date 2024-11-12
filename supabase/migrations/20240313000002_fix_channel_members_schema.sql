-- Drop existing channel_members table
drop table if exists channel_members cascade;

-- Recreate channel_members table with proper relationships
create table channel_members (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references channels(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
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

-- Create function to update timestamps
create or replace function update_channel_members_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger update_channel_members_timestamp
  before update on channel_members
  for each row
  execute function update_channel_members_updated_at();

-- Enable realtime
alter publication supabase_realtime add table channel_members;