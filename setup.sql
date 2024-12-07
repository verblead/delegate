-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create base tables
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text unique,
  full_name text,
  avatar_url text,
  status text default 'offline',
  points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.channels (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  is_private boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users on delete cascade not null
);

create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  sender_id uuid references auth.users on delete cascade not null,
  channel_id uuid references public.channels on delete cascade not null,
  parent_id uuid references public.messages on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  mentions uuid[] default array[]::uuid[]
);

create table if not exists public.message_reactions (
  id uuid default uuid_generate_v4() primary key,
  message_id uuid references public.messages on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  emoji text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(message_id, user_id, emoji)
);

create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status text not null default 'pending',
  priority text not null default 'medium',
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users on delete cascade not null,
  assigned_to uuid references auth.users on delete set null,
  message_id uuid references public.messages on delete cascade
);

-- Create calendar tables
create table if not exists public.calendar_events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  location text,
  event_type text not null default 'other',
  attendees uuid[] default array[]::uuid[],
  created_by uuid references auth.users on delete cascade not null,
  color text,
  is_recurring boolean default false,
  recurrence_pattern text,
  reminder_time timestamp with time zone,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view all channels"
  on public.channels for select
  using (true);

create policy "Users can create channels"
  on public.channels for insert
  with check (auth.uid() = created_by);

create policy "Users can view all messages"
  on public.messages for select
  using (true);

create policy "Users can insert messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Users can update own messages"
  on public.messages for update
  using (auth.uid() = sender_id);

create policy "Users can view all calendar events"
  on public.calendar_events for select
  using (true);

create policy "Users can create calendar events"
  on public.calendar_events for insert
  with check (auth.uid() = created_by);

create policy "Users can update own calendar events"
  on public.calendar_events for update
  using (auth.uid() = created_by);

create policy "Users can delete own calendar events"
  on public.calendar_events for delete
  using (auth.uid() = created_by);

-- Create auth trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  username_val text;
begin
  -- Generate username from email
  username_val := split_part(new.email, '@', 1);
  
  -- Ensure username is unique
  while exists (select 1 from public.profiles where username = username_val) loop
    username_val := username_val || floor(random() * 1000)::text;
  end loop;

  -- Create profile
  insert into public.profiles (
    id,
    email,
    username,
    avatar_url,
    created_at,
    updated_at
  ) values (
    new.id,
    new.email,
    username_val,
    'https://avatar.vercel.sh/' || new.id,
    now(),
    now()
  );

  return new;
end;
$$;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable realtime
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.channels;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.message_reactions;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.calendar_events;

-- Create indexes
create index if not exists idx_messages_channel_id on public.messages(channel_id);
create index if not exists idx_messages_sender_id on public.messages(sender_id);
create index if not exists idx_messages_parent_id on public.messages(parent_id);
create index if not exists idx_message_reactions_message_id on public.message_reactions(message_id);
create index if not exists idx_tasks_message_id on public.tasks(message_id);
create index if not exists idx_tasks_assigned_to on public.tasks(assigned_to);
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_calendar_events_created_by on public.calendar_events(created_by);
create index if not exists idx_calendar_events_start_time on public.calendar_events(start_time);
create index if not exists idx_calendar_events_end_time on public.calendar_events(end_time);

-- Training tables
create table if not exists public.training_categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.course_categories (
  course_id uuid references public.training_courses on delete cascade,
  category_id uuid references public.training_categories on delete cascade,
  primary key (course_id, category_id)
);

create table if not exists public.user_course_activity (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  course_id uuid references public.training_courses on delete cascade,
  lesson_id uuid references public.training_lessons on delete cascade,
  activity_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);