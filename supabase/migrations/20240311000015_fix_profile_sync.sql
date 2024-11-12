-- Drop existing trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create improved user creation trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  username_val text;
begin
  -- Generate base username from email
  username_val := split_part(new.email, '@', 1);
  
  -- Ensure username is unique
  while exists (select 1 from public.profiles where username = username_val) loop
    username_val := username_val || floor(random() * 1000)::text;
  end loop;

  -- Create profile
  insert into public.profiles (
    id,
    email,
    username,
    avatar_url,
    created_at,
    updated_at
  ) values (
    new.id,
    new.email,
    username_val,
    'https://avatar.vercel.sh/' || new.id,
    now(),
    now()
  );

  return new;
exception
  when others then
    -- Log error and re-raise
    raise log 'Error in handle_new_user: %', SQLERRM;
    raise;
end;
$$;

-- Recreate trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ensure proper permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;

-- Fix any existing users without profiles
insert into public.profiles (
  id,
  email,
  username,
  avatar_url,
  created_at,
  updated_at
)
select 
  au.id,
  au.email,
  coalesce(
    (split_part(au.email, '@', 1) || floor(random() * 1000)::text),
    'user_' || floor(random() * 1000000)::text
  ),
  'https://avatar.vercel.sh/' || au.id,
  au.created_at,
  now()
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null;