-- First, drop existing triggers and functions
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Modify profiles table to allow null username initially
alter table public.profiles
  alter column username drop not null,
  alter column email drop not null;

-- Create improved user creation trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  username_val text;
begin
  -- Generate username from email (everything before @)
  username_val := split_part(new.email, '@', 1);
  
  -- Ensure username is unique by appending random numbers if needed
  while exists (select 1 from public.profiles where username = username_val) loop
    username_val := username_val || floor(random() * 1000)::text;
  end loop;

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
end;
$$;

-- Recreate trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Update RLS policies
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can update own profile" on profiles;

create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Enable realtime
alter publication supabase_realtime add table profiles;