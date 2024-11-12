-- Create projects table
create table projects (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  status text not null default 'planning' check (status in ('planning', 'in_progress', 'completed', 'on_hold')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  deadline timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete cascade not null
);

-- Create project members table
create table project_members (
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (project_id, user_id)
);

-- Create project tasks table
create table project_tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assigned_to uuid references auth.users(id) on delete set null,
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete cascade not null
);

-- Create project files table
create table project_files (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  type text not null,
  size integer not null,
  url text not null,
  uploaded_by uuid references auth.users(id) on delete cascade not null,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create project notes table
create table project_notes (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  content text not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table projects enable row level security;
alter table project_members enable row level security;
alter table project_tasks enable row level security;
alter table project_files enable row level security;
alter table project_notes enable row level security;

-- Create policies
create policy "Users can view projects they are members of"
  on projects for select
  using (
    auth.uid() = created_by or
    exists (
      select 1 from project_members
      where project_members.project_id = id
      and project_members.user_id = auth.uid()
    )
  );

create policy "Users can create projects"
  on projects for insert
  with check (auth.uid() = created_by);

create policy "Project owners can update their projects"
  on projects for update
  using (auth.uid() = created_by);

-- Create indexes
create index idx_projects_created_by on projects(created_by);
create index idx_project_members_user_id on project_members(user_id);
create index idx_project_tasks_project_id on project_tasks(project_id);
create index idx_project_files_project_id on project_files(project_id);
create index idx_project_notes_project_id on project_notes(project_id);

-- Enable realtime
alter publication supabase_realtime add table projects;
alter publication supabase_realtime add table project_members;
alter publication supabase_realtime add table project_tasks;
alter publication supabase_realtime add table project_files;
alter publication supabase_realtime add table project_notes;