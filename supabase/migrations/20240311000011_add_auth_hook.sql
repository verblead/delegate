-- Drop existing trigger and function if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_auth_user_created;

-- Create the auth hook function
create or replace function handle_auth_user_created()
returns trigger as $$
declare
  username_val text;
begin
  -- Get username from metadata or generate from email
  username_val := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  
  -- Ensure username is unique
  while exists (select 1 from public.profiles where username = username_val) loop
    username_val := username_val || floor(random() * 1000)::text;
  end loop;

  -- Create initial profile
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

  -- Create default channel membership
  insert into public.channel_members (
    channel_id,
    user_id,
    role
  ) 
  select 
    id as channel_id,
    new.id as user_id,
    'member' as role
  from public.channels 
  where name = 'general'
  limit 1;

  -- Initialize points and achievements
  insert into public.user_points (
    user_id,
    points,
    created_at
  ) values (
    new.id,
    0,
    now()
  );

  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_auth_user_created();

-- Ensure the function has proper permissions
grant execute on function handle_auth_user_created to service_role;