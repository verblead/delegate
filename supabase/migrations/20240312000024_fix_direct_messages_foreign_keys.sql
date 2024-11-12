-- Drop existing tables if they exist
drop table if exists direct_message_attachments cascade;
drop table if exists direct_messages cascade;

-- Create direct_messages table with proper foreign key relationships
create table direct_messages (
  id uuid default uuid_generate_v4() primary key,
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
  id uuid default uuid_generate_v4() primary key,
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

-- Create policies
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

create policy "Users can delete their conversations"
  on direct_messages for delete
  using (
    auth.uid() = sender_id or
    auth.uid() = recipient_id
  );

create policy "Users can view attachments of their messages"
  on direct_message_attachments for select
  using (
    exists (
      select 1 from direct_messages
      where direct_messages.id = message_id
      and (direct_messages.sender_id = auth.uid() 
        or direct_messages.recipient_id = auth.uid())
    )
  );

-- Create indexes for better performance
create index idx_direct_messages_sender_id on direct_messages(sender_id);
create index idx_direct_messages_recipient_id on direct_messages(recipient_id);
create index idx_direct_messages_created_at on direct_messages(created_at);
create index idx_direct_messages_read on direct_messages(read);

-- Enable realtime
alter publication supabase_realtime add table direct_messages;
alter publication supabase_realtime add table direct_message_attachments;