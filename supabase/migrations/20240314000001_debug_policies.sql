-- Temporarily make messages visible for debugging
drop policy if exists "Users can view messages in their channels" on messages;

create policy "Temporary debug messages policy"
  on messages for select
  using (true);

-- Add logging function
create or replace function debug_channel_access(channel_uuid uuid)
returns table (
  has_access boolean,
  user_id uuid,
  is_member boolean,
  channel_exists boolean
) language plpgsql security definer as $$
begin
  return query
  select 
    exists (
      select 1 from channel_members 
      where channel_id = channel_uuid 
      and user_id = auth.uid()
    ) as has_access,
    auth.uid() as user_id,
    exists (
      select 1 from channel_members 
      where user_id = auth.uid()
    ) as is_member,
    exists (
      select 1 from channels 
      where id = channel_uuid
    ) as channel_exists;
end;
$$; 