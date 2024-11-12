-- Add not null constraints after ensuring all profiles exist
alter table public.profiles
  alter column email set not null,
  alter column username set not null;

-- Add unique constraint on username
alter table public.profiles
  add constraint profiles_username_key unique (username);

-- Create index for faster lookups
create index if not exists profiles_username_idx on public.profiles (username);

-- Update RLS policies
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can update own profile" on profiles;

create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Enable realtime for profiles
alter publication supabase_realtime add table profiles;