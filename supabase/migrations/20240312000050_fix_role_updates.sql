-- Ensure role column exists with proper type
do $$ begin
  alter table profiles 
    alter column role type text,
    alter column role set default 'member';
exception
  when others then null;
end $$;

-- Add role check constraint if it doesn't exist
do $$ begin
  alter table profiles
    add constraint check_valid_role
    check (role in ('admin', 'moderator', 'member', 'banned'));
exception
  when duplicate_object then null;
end $$;

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

-- Create function to handle role updates
create or replace function handle_role_update()
returns trigger as $$
begin
  -- Only allow role changes by admins
  if new.role != old.role and not exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  ) then
    raise exception 'Only admins can modify roles';
  end if;

  -- Update timestamp
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Create or replace the trigger
drop trigger if exists role_update_trigger on profiles;
create trigger role_update_trigger
  before update of role on profiles
  for each row
  execute function handle_role_update();

-- Create index for role lookups if it doesn't exist
create index if not exists idx_profiles_role on profiles(role);

-- Enable RLS
alter table profiles enable row level security;