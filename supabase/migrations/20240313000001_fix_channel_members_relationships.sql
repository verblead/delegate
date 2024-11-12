-- Drop existing foreign key if it exists
alter table channel_members 
  drop constraint if exists channel_members_user_id_fkey;

-- Add proper foreign key relationship
alter table channel_members
  add constraint channel_members_user_id_fkey 
  foreign key (user_id) 
  references auth.users(id) 
  on delete cascade;

-- Create index for better performance
create index if not exists idx_channel_members_user_id 
  on channel_members(user_id);