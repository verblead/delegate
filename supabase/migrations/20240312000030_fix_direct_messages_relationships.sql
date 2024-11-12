-- Drop existing tables if they exist
drop table if exists direct_message_attachments cascade;
drop table if exists direct_messages cascade;

-- Create direct_messages table with proper relationships
create table direct_messages (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  recipient_id uuid references profiles(id) on delete cascade not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint different_users check (sender_id != recipient_id)
);

-- Create direct_message_attachments table
create table direct_message_attachments (
  id uuid default gen_random_uuid() primary key,
  message_id uuid references direct_messages(id) on delete cascade not null,
  file_name text not null,
  file_type text not null,
  file_size integer not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table direct_messages enable row level security;
alter table direct_message_attachments enable row level security;

-- Create RLS policies for direct_messages
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

create policy "Users can update own messages"
  on direct_messages for update
  using (
    auth.uid() = sender_id
  );

create policy "Users can delete own messages"
  on direct_messages for delete
  using (
    auth.uid() = sender_id
  );

-- Create RLS policies for direct_message_attachments
create policy "Users can view message attachments"
  on direct_message_attachments for select
  using (
    exists (
      select 1 from direct_messages
      where direct_messages.id = message_id
      and (
        auth.uid() = direct_messages.sender_id or 
        auth.uid() = direct_messages.recipient_id
      )
    )
  );

create policy "Users can upload attachments"
  on direct_message_attachments for insert
  with check (
    exists (
      select 1 from direct_messages
      where direct_messages.id = message_id
      and auth.uid() = direct_messages.sender_id
    )
  );

-- Create indexes for better performance
create index idx_direct_messages_sender_id on direct_messages(sender_id);
create index idx_direct_messages_recipient_id on direct_messages(recipient_id);
create index idx_direct_messages_created_at on direct_messages(created_at);
create index idx_direct_messages_read on direct_messages(read);
create index idx_direct_message_attachments_message_id on direct_message_attachments(message_id);

-- Enable realtime
alter publication supabase_realtime add table direct_messages;
alter publication supabase_realtime add table direct_message_attachments;