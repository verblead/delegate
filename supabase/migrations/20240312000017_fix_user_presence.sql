-- Add status trigger function if it doesn't exist
create or replace function handle_user_presence()
returns trigger as $$
begin
  -- Update user status and last_seen
  update profiles
  set 
    status = new.status,
    updated_at = now()
  where id = new.id;
  
  return new;
end;
$$ language plpgsql security definer;

-- Create or replace the trigger
drop trigger if exists on_presence_change on profiles;
create trigger on_presence_change
  after update of status on profiles
  for each row
  execute function handle_user_presence();

-- Enable realtime for profiles table if not already enabled
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table profiles;
  end if;
end $$;