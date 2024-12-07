-- Drop the existing foreign key constraint if it exists
alter table if exists public.messages
drop constraint if exists messages_sender_id_fkey;

-- Add the new foreign key constraint with explicit reference to auth.users
alter table public.messages
add constraint messages_sender_id_fkey
foreign key (sender_id)
references auth.users(id)
on delete cascade;
