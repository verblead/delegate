-- Drop existing policies
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admins can update any profile" on profiles;

-- Create improved role-based policies
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Add role check trigger
create or replace function check_role_update()
returns trigger as $$
begin
  if exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  ) then
    return new;
  elsif new.id = auth.uid() then
    -- Allow users to update their own non-role fields
    new.role = old.role;
    return new;
  else
    raise exception 'Only admins can modify roles';
  end if;
end;
$$ language plpgsql security definer;

-- Create trigger for role updates
drop trigger if exists check_role_update_trigger on profiles;
create trigger check_role_update_trigger
  before update on profiles
  for each row
  when (old.role is distinct from new.role)
  execute function check_role_update();

-- Enable RLS
alter table profiles enable row level security;

-- Ensure proper indexes
create index if not exists idx_profiles_role on profiles(role);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on profiles to authenticated;