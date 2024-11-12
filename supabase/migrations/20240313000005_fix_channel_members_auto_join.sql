-- Drop existing policies
drop policy if exists "Users can view channel members" on channel_members;
drop policy if exists "Users can join channels" on channel_members;
drop policy if exists "Channel admins can manage members" on channel_members;

-- Create improved policies
create policy "Anyone can view channel members"
  on channel_members for select
  using (true);

create policy "Users can join channels"
  on channel_members for insert
  with check (auth.uid() = user_id);

create policy "Channel admins can manage members"
  on channel_members for delete
  using (
    exists (
      select 1 from channel_members cm
      where cm.channel_id = channel_members.channel_id
      and cm.user_id = auth.uid()
      and cm.role = 'admin'
    )
  );

-- Create function to auto-add channel creator as admin
create or replace function handle_new_channel()
returns trigger as $$
begin
  insert into channel_members (channel_id, user_id, role)
  values (new.id, new.created_by, 'admin');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new channels
drop trigger if exists on_channel_created on channels;
create trigger on_channel_created
  after insert on channels
  for each row execute function handle_new_channel();