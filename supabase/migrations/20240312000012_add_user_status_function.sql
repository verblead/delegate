-- Create function to handle user status updates
create or replace function handle_user_status()
returns trigger as $$
begin
  -- Update user status
  update profiles
  set status = new.status,
      updated_at = now()
  where id = new.id;
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for status updates
create trigger on_status_change
  after update of status on profiles
  for each row
  execute function handle_user_status();

-- Create index for status lookups
create index if not exists idx_profiles_status on profiles(status);