-- Drop existing policies
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admins can update any profile" on profiles;

-- Create improved policies
create policy "Users can update own profile"
  on profiles for update
  using (
    auth.uid() = id or
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Add role enum type if it doesn't exist
do $$ begin
  create type user_role as enum ('admin', 'moderator', 'member', 'banned');
exception
  when duplicate_object then null;
end $$;

-- Modify profiles table to use role enum and add constraints
alter table profiles 
  alter column role set default 'member',
  add constraint valid_role check (
    role in ('admin', 'moderator', 'member', 'banned')
  );

-- Create function to validate role changes
create or replace function validate_role_change()
returns trigger as $$
begin
  -- Only allow role changes if the user is an admin
  if new.role != old.role and not exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  ) then
    raise exception 'Only admins can modify roles';
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for role validation
drop trigger if exists validate_role_change_trigger on profiles;
create trigger validate_role_change_trigger
  before update of role on profiles
  for each row
  execute function validate_role_change();

-- Create index for role lookups
create index if not exists idx_profiles_role on profiles(role);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on profiles to authenticated;