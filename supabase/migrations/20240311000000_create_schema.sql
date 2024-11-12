-- Enable RLS
alter table auth.users enable row level security;

-- Create tables
create table public.channels (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  is_private boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete cascade not null
);

create table public.channel_members (
  channel_id uuid references public.channels(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (channel_id, user_id)
);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid references public.channels(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  parent_id uuid references public.messages(id) on delete cascade,
  mentions uuid[] default array[]::uuid[],
  is_edited boolean default false
);

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text not null default 'pending',
  priority text not null default 'medium',
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  assigned_to uuid references auth.users(id) on delete set null,
  message_id uuid references public.messages(id) on delete cascade
);

create table public.reactions (
  message_id uuid references public.messages(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (message_id, user_id, emoji)
);

create table public.achievements (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  points integer not null default 0,
  icon text not null
);

create table public.user_achievements (
  user_id uuid references auth.users(id) on delete cascade,
  achievement_id uuid references public.achievements(id) on delete cascade,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, achievement_id)
);

-- Create indexes
create index idx_messages_channel_id on public.messages(channel_id);
create index idx_messages_user_id on public.messages(user_id);
create index idx_messages_parent_id on public.messages(parent_id);
create index idx_tasks_message_id on public.tasks(message_id);
create index idx_tasks_assigned_to on public.tasks(assigned_to);
create index idx_channel_members_user_id on public.channel_members(user_id);

-- Enable RLS policies
alter table public.channels enable row level security;
alter table public.channel_members enable row level security;
alter table public.messages enable row level security;
alter table public.tasks enable row level security;
alter table public.reactions enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

-- RLS policies
create policy "Users can view channels they are members of"
  on public.channels for select
  using (
    auth.uid() in (
      select user_id from public.channel_members
      where channel_id = id
    )
  );

create policy "Users can view messages in their channels"
  on public.messages for select
  using (
    channel_id in (
      select channel_id from public.channel_members
      where user_id = auth.uid()
    )
  );

create policy "Users can create messages in their channels"
  on public.messages for insert
  with check (
    channel_id in (
      select channel_id from public.channel_members
      where user_id = auth.uid()
    )
  );

create policy "Users can update their own messages"
  on public.messages for update
  using (user_id = auth.uid());

create policy "Users can delete their own messages"
  on public.messages for delete
  using (user_id = auth.uid());