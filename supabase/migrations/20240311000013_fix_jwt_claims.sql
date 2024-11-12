-- Drop existing function if it exists
drop function if exists public.handle_jwt_claims;

-- Create function to handle JWT claims in public schema
create or replace function public.handle_jwt_claims(jwt jsonb)
returns jsonb
language plpgsql security definer
as $$
declare
  profile_data record;
  result jsonb;
begin
  -- Get user profile data
  select id, username, role
  into profile_data
  from profiles
  where id = (jwt ->> 'sub')::uuid;

  -- Build claims object
  result := jsonb_build_object(
    'role', coalesce(profile_data.role, 'user'),
    'username', profile_data.username,
    'https://hasura.io/jwt/claims', jsonb_build_object(
      'x-hasura-allowed-roles', array['user', 'admin', 'moderator'],
      'x-hasura-default-role', coalesce(profile_data.role, 'user'),
      'x-hasura-user-id', profile_data.id::text
    )
  );

  return result;
end;
$$;

-- Grant necessary permissions
grant execute on function public.handle_jwt_claims to authenticated;
grant execute on function public.handle_jwt_claims to service_role;

-- Enable the JWT claim function in Supabase config
comment on function public.handle_jwt_claims is '@supabase/auth-hooks: {"event":"jwt","schema":"public"}';