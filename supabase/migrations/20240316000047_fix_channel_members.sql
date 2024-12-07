-- Add any missing columns to channel_members
alter table channel_members add column if not exists role text not null default 'member';

-- Enable RLS on channel_members
alter table channel_members enable row level security;

-- Create policies for channel_members
create policy "Users can view channel members"
on channel_members for select
to authenticated
using (true);

create policy "Users can join channels"
on channel_members for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can leave channels"
on channel_members for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can update their own role"
on channel_members for update
to authenticated
using (auth.uid() = user_id);
