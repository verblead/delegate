-- Create volunteer tasks table
create table volunteer_tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  points integer not null default 0,
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  volunteer_id uuid references auth.users(id) on delete set null,
  due_date timestamp with time zone
);

-- Enable RLS
alter table volunteer_tasks enable row level security;

-- Create policies
create policy "Anyone can view volunteer tasks"
  on volunteer_tasks for select
  using (true);

create policy "Admins can create volunteer tasks"
  on volunteer_tasks for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Volunteers can update tasks they volunteered for"
  on volunteer_tasks for update
  using (
    volunteer_id = auth.uid() or 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can delete volunteer tasks"
  on volunteer_tasks for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create indexes
create index idx_volunteer_tasks_status on volunteer_tasks(status);
create index idx_volunteer_tasks_created_by on volunteer_tasks(created_by);
create index idx_volunteer_tasks_volunteer_id on volunteer_tasks(volunteer_id);

-- Enable realtime
alter publication supabase_realtime add table volunteer_tasks;