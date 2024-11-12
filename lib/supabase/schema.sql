-- Enable RLS
alter database postgres set "app.jwt_secret" to 'your-super-secret-jwt-token';

-- Create tables
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  status text default 'offline',
  points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.channels (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  is_private boolean default false,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references public.channels(id) on delete cascade not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  mentions jsonb default '[]',
  task_id uuid references public.tasks(id) on delete set null,
  parent_id uuid references public.messages(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'pending',
  assigned_to uuid references public.profiles(id),
  created_by uuid references public.profiles(id) not null,
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists idx_messages_channel_id on public.messages(channel_id);
create index if not exists idx_messages_user_id on public.messages(user_id);
create index if not exists idx_messages_task_id on public.messages(task_id);
create index if not exists idx_channel_members_channel_id on public.channel_members(channel_id);
create index if not exists idx_channel_members_user_id on public.channel_members(user_id);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;
alter table public.tasks enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can view channels they are members of"
  on channels for select
  using (
    exists (
      select 1
      from channel_members
      where channel_id = id
      and user_id = auth.uid()
    )
  );

create policy "Users can view messages in their channels"
  on messages for select
  using (
    exists (
      select 1
      from channel_members
      where channel_id = messages.channel_id
      and user_id = auth.uid()
    )
  );