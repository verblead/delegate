-- Update profiles table with separate address fields
alter table profiles
  drop column if exists address,
  add column if not exists street_address text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip_code text,
  add column if not exists country text default 'US';

-- Add constraints for state and zip code
alter table profiles
  add constraint profiles_state_check check (
    country != 'US' or (state ~ '^[A-Z]{2}$')
  ),
  add constraint profiles_zip_code_check check (
    country != 'US' or (zip_code ~ '^\d{5}(-\d{4})?$')
  );

-- Create indexes for address fields
create index if not exists idx_profiles_zip_code on profiles(zip_code);
create index if not exists idx_profiles_state on profiles(state);
create index if not exists idx_profiles_city on profiles(city);