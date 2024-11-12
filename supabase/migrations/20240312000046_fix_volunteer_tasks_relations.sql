-- Drop existing foreign key constraints if they exist
alter table volunteer_tasks 
  drop constraint if exists volunteer_tasks_created_by_fkey,
  drop constraint if exists volunteer_tasks_volunteer_id_fkey;

-- Add correct foreign key constraints
alter table volunteer_tasks
  add constraint volunteer_tasks_created_by_fkey 
    foreign key (created_by) 
    references profiles(id) 
    on delete cascade,
  add constraint volunteer_tasks_volunteer_id_fkey 
    foreign key (volunteer_id) 
    references profiles(id) 
    on delete set null;

-- Create indexes for better performance
create index if not exists idx_volunteer_tasks_created_by 
  on volunteer_tasks(created_by);
create index if not exists idx_volunteer_tasks_volunteer_id 
  on volunteer_tasks(volunteer_id);