-- Add missing columns to profiles table
alter table profiles 
add column if not exists points integer default 0,
add column if not exists status text default 'offline',
add column if not exists last_seen timestamp with time zone default now();

-- Create index for performance
create index if not exists profiles_points_idx on profiles(points desc);
create index if not exists profiles_status_idx on profiles(status);

-- Update the profiles RLS policies
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
on profiles for select
to authenticated
using (true);

create policy "Users can update own profile"
on profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Grant access to authenticated users
grant usage on sequence profiles_id_seq to authenticated;
grant all on profiles to authenticated;
