-- Enable RLS on auth.users
alter table auth.users enable row level security;

-- Drop existing policies if any
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;

-- Create new policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Ensure profiles table has RLS enabled
alter table profiles enable row level security;

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant usage on schema public to anon;

grant all on profiles to authenticated;
grant select on profiles to anon;