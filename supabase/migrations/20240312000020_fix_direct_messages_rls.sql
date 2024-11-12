-- Drop existing policies
drop policy if exists "Users can view their own direct messages" on direct_messages;
drop policy if exists "Users can send direct messages" on direct_messages;
drop policy if exists "Users can update their own sent messages" on direct_messages;

-- Enable RLS
alter table direct_messages enable row level security;

-- Create improved policies
create policy "Users can view their direct messages"
  on direct_messages for select
  using (
    auth.uid() = sender_id or 
    auth.uid() = recipient_id
  );

create policy "Users can send direct messages"
  on direct_messages for insert
  with check (
    auth.uid() = sender_id
  );

create policy "Users can update their own messages"
  on direct_messages for update
  using (
    auth.uid() = sender_id
  );

-- Create foreign key relationships if they don't exist
alter table direct_messages
  drop constraint if exists direct_messages_sender_id_fkey,
  drop constraint if exists direct_messages_recipient_id_fkey;

alter table direct_messages
  add constraint direct_messages_sender_id_fkey
    foreign key (sender_id)
    references profiles(id)
    on delete cascade,
  add constraint direct_messages_recipient_id_fkey
    foreign key (recipient_id)
    references profiles(id)
    on delete cascade;

-- Create indexes for better performance
create index if not exists idx_direct_messages_sender_id
  on direct_messages(sender_id);
create index if not exists idx_direct_messages_recipient_id
  on direct_messages(recipient_id);
create index if not exists idx_direct_messages_created_at
  on direct_messages(created_at);

-- Enable realtime
alter publication supabase_realtime add table direct_messages;