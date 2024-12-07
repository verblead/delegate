-- Drop all existing policies on messages table
drop policy if exists "Anyone can send messages" on public.messages;
drop policy if exists "Anyone can view messages" on public.messages;
drop policy if exists "Enable delete for users based on sender_id" on public.messages;
drop policy if exists "Enable insert access for authenticated users" on public.messages;
drop policy if exists "Enable read access for all users" on public.messages;
drop policy if exists "Enable read access for authenticated users" on public.messages;
drop policy if exists "Enable update for users based on sender_id" on public.messages;
drop policy if exists "Message owners can delete their messages" on public.messages;
drop policy if exists "Message owners can update their messages" on public.messages;
drop policy if exists "Temporary debug messages policy" on public.messages;
drop policy if exists "Users can delete their own messages" on public.messages;
drop policy if exists "Users can update their own messages" on public.messages;

-- Drop existing policies
drop policy if exists "Users can view messages in their channels" on public.messages;
drop policy if exists "Users can insert messages in their channels" on public.messages;
drop policy if exists "Authenticated users can insert messages" on public.messages;
drop policy if exists "Message owners can update their messages" on public.messages;

-- Enable RLS
alter table public.messages enable row level security;

-- Create simplified policies for message access
create policy "Users can view messages in their channels"
on public.messages for select
to authenticated
using (
    exists (
        select 1 from public.channel_members cm
        where cm.channel_id = messages.channel_id
        and cm.user_id = auth.uid()
    )
);

create policy "Users can insert messages in their channels"
on public.messages for insert
to authenticated
with check (
    exists (
        select 1 from public.channel_members cm
        where cm.channel_id = channel_id
        and cm.user_id = auth.uid()
    )
    and auth.uid() = sender_id
);

create policy "Message owners can update their messages"
on public.messages for update
to authenticated
using (auth.uid() = sender_id)
with check (auth.uid() = sender_id);

create policy "Message owners can delete their messages"
on public.messages for delete
to authenticated
using (auth.uid() = sender_id);
