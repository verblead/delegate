-- Create meeting messages table
create table meeting_messages (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  meeting_id uuid references meetings(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table meeting_messages enable row level security;

-- Create policies
create policy "Users can view messages in meetings they are in"
  on meeting_messages for select
  using (
    exists (
      select 1 from meeting_participants
      where meeting_participants.meeting_id = meeting_messages.meeting_id
      and meeting_participants.user_id = auth.uid()
    )
  );

create policy "Users can send messages in meetings they are in"
  on meeting_messages for insert
  with check (
    exists (
      select 1 from meeting_participants
      where meeting_participants.meeting_id = meeting_messages.meeting_id
      and meeting_participants.user_id = auth.uid()
    )
    and auth.uid() = user_id
  );

-- Create indexes
create index idx_meeting_messages_meeting_id on meeting_messages(meeting_id);
create index idx_meeting_messages_user_id on meeting_messages(user_id);
create index idx_meeting_messages_created_at on meeting_messages(created_at);

-- Enable realtime
alter publication supabase_realtime add table meeting_messages;