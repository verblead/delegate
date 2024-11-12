-- Drop existing table if it exists
drop table if exists tasks cascade;

-- Create tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date timestamp with time zone,
  channel_id uuid references channels(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  assigned_to uuid references auth.users(id) on delete set null
);

-- Enable RLS
alter table tasks enable row level security;

-- Create policies
create policy "Users can view tasks they created or are assigned to"
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
  with check (auth.uid() = created_by);

create policy "Task creators and assignees can update tasks"
  on tasks for update
  using (auth.uid() = created_by or auth.uid() = assigned_to);

-- Create indexes
create index idx_tasks_created_by on tasks(created_by);
create index idx_tasks_assigned_to on tasks(assigned_to);
create index idx_tasks_channel_id on tasks(channel_id);
create index idx_tasks_status on tasks(status);

-- Enable realtime
alter publication supabase_realtime add table tasks;