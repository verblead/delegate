-- Drop existing profiles table if it exists
drop table if exists profiles cascade;

-- Create profiles table with all required columns
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  email text,
  full_name text,
  avatar_url text,
  bio text,
  status text default 'offline',
  phone text,
  age integer,
  marital_status text,
  street_address text,
  city text,
  state text,
  zip_code text,
  country text default 'US',
  points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint profiles_age_check 
    check (age is null or (age >= 0 and age <= 150)),
  constraint profiles_marital_status_check 
    check (marital_status is null or marital_status in ('single', 'married', 'divorced', 'widowed')),
  constraint profiles_state_check 
    check (state is null or state ~ '^[A-Z]{2}$'),
  constraint profiles_zip_code_check 
    check (zip_code is null or zip_code ~ '^\d{5}(-\d{4})?$')
);

-- Create indexes for better performance
create index if not exists idx_profiles_username on profiles(username);
create index if not exists idx_profiles_email on profiles(email);
create index if not exists idx_profiles_phone on profiles(phone);
create index if not exists idx_profiles_city on profiles(city);
create index if not exists idx_profiles_state on profiles(state);
create index if not exists idx_profiles_zip_code on profiles(zip_code);

-- Enable RLS
alter table profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create trigger function for updating timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- Enable realtime
alter publication supabase_realtime add table profiles;