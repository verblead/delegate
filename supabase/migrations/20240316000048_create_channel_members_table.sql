-- Create channel_members table if it doesn't exist
create table if not exists channel_members (
    id uuid default gen_random_uuid() primary key,
    channel_id uuid not null references channels(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null default 'member',
    created_at timestamptz not null default now(),
    unique (channel_id, user_id)
);

-- Create index for faster lookups
create index if not exists channel_members_channel_id_idx on channel_members(channel_id);
create index if not exists channel_members_user_id_idx on channel_members(user_id);

-- Enable RLS
alter table channel_members enable row level security;

-- Create policies
do $$
begin
    drop policy if exists "Users can view channel members" on channel_members;
    drop policy if exists "Users can join channels" on channel_members;
    drop policy if exists "Users can leave channels" on channel_members;
    drop policy if exists "Users can update their own role" on channel_members;
end $$;

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
