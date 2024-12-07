-- Drop existing attachments tables
drop table if exists public.message_attachments cascade;
drop table if exists public.direct_message_attachments cascade;

-- Create message attachments table
create table public.message_attachments (
    id uuid default gen_random_uuid() primary key,
    message_id uuid references public.messages(id) on delete cascade not null,
    file_name text not null,
    file_type text,
    file_size bigint,
    url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create direct message attachments table
create table public.direct_message_attachments (
    id uuid default gen_random_uuid() primary key,
    message_id uuid references public.direct_messages(id) on delete cascade not null,
    file_name text not null,
    file_type text,
    file_size bigint,
    url text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.message_attachments enable row level security;
alter table public.direct_message_attachments enable row level security;

-- Message attachments policies
create policy "Users can view message attachments"
on public.message_attachments for select
to authenticated
using (
    exists (
        select 1 from public.messages m
        join public.channel_members cm on cm.channel_id = m.channel_id
        where m.id = message_id
        and cm.user_id = auth.uid()
    )
);

create policy "Users can upload message attachments"
on public.message_attachments for insert
to authenticated
with check (
    exists (
        select 1 from public.messages m
        where m.id = message_id
        and m.sender_id = auth.uid()
    )
);

-- Direct message attachments policies
create policy "Users can view direct message attachments"
on public.direct_message_attachments for select
to authenticated
using (
    exists (
        select 1 from public.direct_messages dm
        where dm.id = message_id
        and (dm.sender_id = auth.uid() or dm.recipient_id = auth.uid())
    )
);

create policy "Users can upload direct message attachments"
on public.direct_message_attachments for insert
to authenticated
with check (
    exists (
        select 1 from public.direct_messages dm
        where dm.id = message_id
        and dm.sender_id = auth.uid()
    )
);

-- Enable realtime
alter publication supabase_realtime add table public.message_attachments;
alter publication supabase_realtime add table public.direct_message_attachments;