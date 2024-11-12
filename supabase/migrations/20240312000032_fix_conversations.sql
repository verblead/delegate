-- Drop existing conversations table if it exists
drop table if exists conversations cascade;

-- Create conversations table to persist conversation list
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  participant_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_conversation unique(user_id, participant_id)
);

-- Enable RLS
alter table conversations enable row level security;

-- Create RLS policies
create policy "Users can view their own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can create conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own conversations"
  on conversations for delete
  using (auth.uid() = user_id);

-- Create indexes
create index idx_conversations_user_id on conversations(user_id);
create index idx_conversations_participant_id on conversations(participant_id);

-- Enable realtime
alter publication supabase_realtime add table conversations;