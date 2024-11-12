-- Drop existing policies
drop policy if exists "Users can view tasks in their channels" on tasks;
drop policy if exists "Users can create tasks in their channels" on tasks;
drop policy if exists "Task creators and assignees can update tasks" on tasks;

-- Create improved policies
create policy "Users can view tasks"
  on tasks for select
  using (
    auth.uid() = created_by or 
    auth.uid() = assigned_to or
    exists (
      select 1 from channel_members
      where channel_members.channel_id = tasks.channel_id
      and channel_members.user_id = auth.uid()
    )
  );

create policy "Users can create tasks"
  on tasks for insert
  with check (
    auth.uid() = created_by and
    (
      exists (
        select 1 from channel_members
        where channel_members.channel_id = channel_id
        and channel_members.user_id = auth.uid()
      )
    )
  );

create policy "Users can update tasks"
  on tasks for update
  using (
    auth.uid() = created_by or 
    auth.uid() = assigned_to or
    exists (
      select 1 from channel_members
      where channel_members.channel_id = tasks.channel_id
      and channel_members.user_id = auth.uid()
      and channel_members.role in ('admin', 'moderator')
    )
  );

create policy "Users can delete their own tasks"
  on tasks for delete
  using (
    auth.uid() = created_by or
    exists (
      select 1 from channel_members
      where channel_members.channel_id = tasks.channel_id
      and channel_members.user_id = auth.uid()
      and channel_members.role in ('admin', 'moderator')
    )
  );