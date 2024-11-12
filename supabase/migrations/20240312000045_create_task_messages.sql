-- Create task messages table
create table task_messages (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references volunteer_tasks(id) on delete cascade not null,
  content text not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create task notes table
create table task_notes (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references volunteer_tasks(id) on delete cascade not null,
  content text not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create task files table
create table task_files (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references volunteer_tasks(id) on delete cascade not null,
  name text not null,
  size integer not null,
  type text not null,
  url text not null,
  uploaded_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table task_messages enable row level security;
alter table task_notes enable row level security;
alter table task_files enable row level security;

-- Create policies
create policy "Users can view messages for their tasks"
  on task_messages for select
  using (
    exists (
      select 1 from volunteer_tasks
      where volunteer_tasks.id = task_id
      and (volunteer_tasks.volunteer_id = auth.uid() or volunteer_tasks.created_by = auth.uid())
    )
  );

create policy "Users can send messages for their tasks"
  on task_messages for insert
  with check (
    exists (
      select 1 from volunteer_tasks
      where volunteer_tasks.id = task_id
      and (volunteer_tasks.volunteer_id = auth.uid() or volunteer_tasks.created_by = auth.uid())
    )
  );

create policy "Users can view notes for their tasks"
  on task_notes for select
  using (
    exists (
      select 1 from volunteer_tasks
      where volunteer_tasks.id = task_id
      and (volunteer_tasks.volunteer_id = auth.uid() or volunteer_tasks.created_by = auth.uid())
    )
  );

create policy "Users can create notes for their tasks"
  on task_notes for insert
  with check (
    exists (
      select 1 from volunteer_tasks
      where volunteer_tasks.id = task_id
      and (volunteer_tasks.volunteer_id = auth.uid() or volunteer_tasks.created_by = auth.uid())
    )
  );

create policy "Users can view files for their tasks"
  on task_files for select
  using (
    exists (
      select 1 from volunteer_tasks
      where volunteer_tasks.id = task_id
      and (volunteer_tasks.volunteer_id = auth.uid() or volunteer_tasks.created_by = auth.uid())
    )
  );

create policy "Users can upload files for their tasks"
  on task_files for insert
  with check (
    exists (
      select 1 from volunteer_tasks
      where volunteer_tasks.id = task_id
      and (volunteer_tasks.volunteer_id = auth.uid() or volunteer_tasks.created_by = auth.uid())
    )
  );

-- Create indexes
create index idx_task_messages_task_id on task_messages(task_id);
create index idx_task_notes_task_id o