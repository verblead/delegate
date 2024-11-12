-- Create message_attachments table
create table message_attachments (
  id uuid default gen_random_uuid() primary key,
  message_id uuid references messages(id) on delete cascade not null,
  file_name text not null,
  file_type text not null,
  file_size integer not null,
  url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table message_attachments enable row level security;

-- Create policies
create policy "Users can view message attachments in their channels"
  on message_attachments for select
  using (
    exists (
      select 1 from messages m
      join channel_members cm on cm.channel_id = m.channel_id
      where m.id = message_attachments.message_id
      and cm.user_id = auth.uid()
    )
  );

create policy "Users can upload attachments to their messages"
  on message_attachments for insert
  with check (
    exists (
      select 1 from messages
      where messages.id = message_id
      and messages.sender_id = auth.uid()
    )
  );

create policy "Users can delete their own message attachments"
  on message_attachments for delete
  using (
    exists (
      select 1 from messages
      where messages.id = message_id
      and messages.sender_id = auth.uid()
    )
  );

-- Create indexes
create index idx_message_attachments_message_id on message_attachments(message_id);

-- Enable realtime
alter publication supabase_realtime add table message_attachments;