-- Enable RLS on channels table
alter table channels enable row level security;

-- Allow users to view all channels (existing policy)
create policy "Allow users to view channels"
  on channels
  for select
  to public
  using (true);

-- Allow authenticated users to create channels
create policy "Allow authenticated users to create channels"
  on channels
  for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Allow channel creators and admins to update their channels
create policy "Allow channel admins to update channels"
  on channels
  for update
  to authenticated
  using (
    auth.uid() in (
      select user_id 
      from channel_members 
      where channel_id = id 
      and role = 'admin'
    )
  );

-- Enable RLS on channel_members table
alter table channel_members enable row level security;

-- Allow users to view channel members
create policy "Allow users to view channel members"
  on channel_members
  for select
  to public
  using (true);

-- Allow users to join channels (insert into channel_members)
create policy "Allow users to join channels"
  on channel_members
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Allow channel admins to manage members
create policy "Allow channel admins to manage members"
  on channel_members
  for all
  to authenticated
  using (
    auth.uid() in (
      select user_id 
      from channel_members 
      where channel_id = channel_id 
      and role = 'admin'
    )
  );
