-- Drop existing messages table if it exists
drop table if exists messages cascade;

-- Create messages table with all required columns
create table messages (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  channel_id uuid references channels(id) on delete cascade not null,
  parent_id uuid references messages(id) on delete cascade,
  task_id uuid references tasks(id) on delete set null,
  mentions uuid[] default array[]::uuid[],
  attachments jsonb[] default array[]::jsonb[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table messages enable row level security;

-- Enable replication
alter publication supabase_realtime add table messages;
alter table messages replica identity full;

-- Create policies
create policy "Users can view messages in channels they are members of"
  on messages for select
  using (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = messages.channel_id
      and channel_members.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in channels they are members of"
  on messages for insert
  with check (
    exists (
      select 1 from channel_members
      where channel_members.channel_id = messages.channel_id
      and channel_members.user_id = auth.uid()
    )
    and auth.uid() = sender_id
  );

create policy "Users can update their own messages"
  on messages for update
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

create policy "Users can delete their own messages"
  on messages for delete
  using (auth.uid() = sender_id);

-- Create indexes for better performance
create index messages_channel_id_idx on messages(channel_id);
create index messages_sender_id_idx on messages(sender_id);
create index messages_parent_id_idx on messages(parent_id);
create index messages_created_at_idx on messages(created_at);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_messages_updated_at
  before update on messages
  for each row
  execute function update_updated_at_column();