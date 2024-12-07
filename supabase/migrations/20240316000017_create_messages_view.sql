-- Drop existing view if it exists
drop view if exists public.messages_with_sender;

-- Create view for messages with sender information
create or replace view public.messages_with_sender as
select 
    m.id,
    m.content,
    m.channel_id,
    m.sender_id,
    m.created_at,
    m.has_attachments,
    p.username as sender_username,
    p.avatar_url as sender_avatar_url
from public.messages m
left join public.profiles p on p.id = m.sender_id;

-- Grant access to the view
grant select on public.messages_with_sender to authenticated;

-- Enable RLS on the view
alter view public.messages_with_sender set (security_invoker = on);
