-- Drop existing policies
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admins can update any profile" on profiles;

-- Create improved role-based policies
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id and
    (
      case 
        when auth.uid() = id then true
        else coalesce(role, 'member') = coalesce((select role from profiles where id = auth.uid()), 'member')
      end
    )
  );

create policy "Admins can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Create function to check if user is admin
create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Create function to check if user can modify roles
create or replace function can_modify_roles()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid()
    and role in ('admin')
  );
end;
$$ language plpgsql security definer;