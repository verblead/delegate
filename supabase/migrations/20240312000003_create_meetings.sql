-- Create meetings table
create table if not exists public.meetings (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  host_id uuid references auth.users(id) on delete cascade not null,
  room_code text not null unique,
  status text not null check (status in ('waiting', 'in_progress', 'ended')),
  type text not null check (type in ('audio', 'video', 'screen_share')),
  is_private boolean default false,
  max_participants integer not null default 10,
  current_participants integer not null default 0,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create meeting participants table
create table if not exists public.meeting_participants (
  id uuid default uuid_generate_v4() primary key,
  meeting_id uuid references meetings(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  left_at timestamp with time zone,
  unique(meeting_id, user_id)
);

-- Enable RLS
alter table meetings enable row level security;
alter table meeting_participants enable row level security;

-- Create indexes
create index if not exists idx_meetings_host_id on meetings(host_id);
create index if not exists idx_meetings_status on meetings(status);
create index if not exists idx_meeting_participants_meeting_id on meeting_participants(meeting_id);
create index if not exists idx_meeting_participants_user_id on meeting_participants(user_id);