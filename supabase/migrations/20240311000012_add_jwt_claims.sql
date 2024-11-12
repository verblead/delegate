-- Create function to handle JWT claims
create or replace function auth.handle_jwt_claims(user_id uuid)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  profile_data record;
  result jsonb;
begin
  -- Get user profile data
  select id, username, role
  into profile_data
  from profiles
  where id = user_id;

  -- Build claims object
  result := jsonb_build_object(
    'role', coalesce(profile_data.role, 'user'),
    'username', profile_data.username
  );

  return result;
end;
$$;

-- Grant necessary permissions
grant execute on function auth.handle_jwt_claims to service_role;

-- Enable the JWT claim function in Supabase config
comment on function auth.handle_jwt_claims is '@supabase/auth-hooks: {"event":"jwt","schema":"auth"}';