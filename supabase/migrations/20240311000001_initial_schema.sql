-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Organizations table
create table organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  logo_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Channels table
create table channels (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  is_private boolean default false,
  organization_id uuid references organizations(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(name, organization_id)
);

-- Messages table
create table messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  channel_id uuid references channels(id) on delete cascade not null,
  parent_id uuid references messages(id) on delete cascade,
  is_edited boolean default false,
  mentions uuid[] default array[]::uuid[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Channel members table
create table channel_members (
  channel_id uuid references channels(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('owner', 'admin', 'member')) default 'member',
  created_at timestamp with time zone default now(),
  primary key (channel_id, user_id)
);

-- Organization members table
create table organization_members (
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('owner', 'admin', 'member')) default 'member',
  created_at timestamp with time zone default now(),
  primary key (organization_id, user_id)
);

-- User profiles table
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  status text default 'offline',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Message reactions table
create table message_reactions (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid references messages(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamp with time zone default now(),
  unique(message_id, user_id, emoji)
);

-- Enable row level security
alter table organizations enable row level security;
alter table channels enable row level security;
alter table messages enable row level security;
alter table channel_members enable row level security;
alter table organization_members enable row level security;
alter table profiles enable row level security;
alter table message_reactions enable row level security;

-- Enable realtime
alter publication supabase_realtime add table channels;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table channel_members;
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table message_reactions;

-- Set replica identity
alter table channels replica identity full;
alter table messages replica identity full;
alter table channel_members replica identity full;
alter table profiles replica identity full;
alter table message_reactions replica identity full;

-- Create updated_at function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create updated_at triggers
create trigger update_organizations_updated_at
  before update on organizations
  for each row execute function update_updated_at_column();

create trigger update_channels_updated_at
  before update on channels
  for each row execute function update_updated_at_column();

create trigger update_messages_updated_at
  before update on messages
  for each row execute function update_updated_at_column();

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

-- Create RLS policies
-- Organizations
create policy "Users can view organizations they are members of" on organizations
  for select using (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
    )
  );

-- Channels
create policy "Users can view channels they are members of" on channels
  for select using (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = channels.id
      and channel_members.user_id = auth.uid()
    )
  );

create policy "Organization admins can create channels" on channels
  for insert with check (
    exists (
      select 1 from organization_members
      where organization_members.organization_id = channels.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role in ('owner', 'admin')
    )
  );

-- Messages
create policy "Users can view messages in their channels" on messages
  for select using (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = messages.channel_id
      and channel_members.user_id = auth.uid()
    )
  );

create policy "Users can send messages in their channels" on messages
  for insert with check (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = messages.channel_id
      and channel_members.user_id = auth.uid()
    )
    and auth.uid() = sender_id
  );

create policy "Users can edit their own messages" on messages
  for update using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

-- Channel members
create policy "Users can view channel members" on channel_members
  for select using (
    exists (
      select 1 from channel_members cm
      where cm.channel_id = channel_members.channel_id
      and cm.user_id = auth.uid()
    )
  );

-- Profiles
create policy "Profiles are viewable by users in same organization" on profiles
  for select using (
    exists (
      select 1 from organization_members om1
      inner join organization_members om2 on om1.organization_id = om2.organization_id
      where om1.user_id = auth.uid()
      and om2.user_id = profiles.id
    )
  );

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);