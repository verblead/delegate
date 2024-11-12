-- Add role column to profiles table
alter table profiles 
  add column if not exists role text not null default 'member' 
  check (role in ('admin', 'moderator', 'member'));

-- Create index for role lookups
create index if not exists idx_profiles_role on profiles(role);

-- Update RLS policies to include role-based checks
create policy "Admins can update any profile"
  on profiles for update
  using (
    auth.uid() = id or 
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Function to check if user is admin
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = user_id
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Function to check if user is moderator or above
create or replace function public.is_moderator_or_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = user_id
    and role in ('admin', 'moderator')
  );
end;
$$ language plpgsql security definer;

-- Grant execute permissions
grant execute on function public.is_admin to authenticated;
grant execute on function public.is_moderator_or_admin to authenticated;

-- Create policies for role-based access
create policy "Admins can create channels"
  on channels for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Moderators and admins can delete messages"
  on messages for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

create policy "Admins can manage roles"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );