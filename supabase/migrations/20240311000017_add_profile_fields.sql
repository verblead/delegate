-- Add new columns to profiles table
alter table profiles
  add column if not exists bio text,
  add column if not exists phone text,
  add column if not exists age integer,
  add column if not exists marital_status text,
  add column if not exists address text;

-- Create index for phone number searches
create index if not exists idx_profiles_phone on profiles(phone);

-- Update RLS policies
drop policy if exists "Users can update own profile" on profiles;

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Add constraints for age
alter table profiles
  add constraint profiles_age_check check (age >= 0 and age <= 150);

-- Add constraints for marital_status
alter table profiles
  add constraint profiles_marital_status_check 
  check (marital_status in ('single', 'married', 'divorced', 'widowed'));