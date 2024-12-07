-- Drop existing messages table constraints
alter table if exists public.messages
drop constraint if exists messages_channel_id_fkey;

-- Add foreign key constraint for channel_id
alter table public.messages
add constraint messages_channel_id_fkey
foreign key (channel_id)
references public.channels(id)
on delete cascade;

-- Drop and recreate the insert policy to ensure proper channel membership check
drop policy if exists "Users can insert messages in their channels" on public.messages;

create policy "Users can insert messages in their channels"
on public.messages for insert
to authenticated
with check (
    exists (
        select 1 
        from public.channel_members cm
        where cm.channel_id = messages.channel_id
        and cm.user_id = auth.uid()
    )
);

-- Drop and recreate the select policy to ensure proper channel membership check
drop policy if exists "Users can view messages in their channels" on public.messages;

create policy "Users can view messages in their channels"
on public.messages for select
to authenticated
using (
    exists (
        select 1 
        from public.channel_members cm
        where cm.channel_id = messages.channel_id
        and cm.user_id = auth.uid()
    )
);
