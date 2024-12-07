-- First, let's check if we have the correct trigger for syncing auth.users to profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, username, email, avatar_url)
    values (
        new.id,
        new.raw_user_meta->>'username',
        new.email,
        new.raw_user_meta->>'avatar_url'
    );
    return new;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it exists and recreate it
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Update channel_members to use profiles instead of auth.users
alter table if exists channel_members 
    drop constraint if exists channel_members_user_id_fkey;

alter table channel_members
    add constraint channel_members_user_id_fkey
    foreign key (user_id)
    references profiles(id)
    on delete cascade;

-- Ensure all profiles exist for existing auth users
insert into public.profiles (id, username, email, avatar_url)
select 
    au.id,
    coalesce(au.raw_user_meta->>'username', split_part(au.email, '@', 1)),
    au.email,
    au.raw_user_meta->>'avatar_url'
from auth.users au
left join public.profiles p on p.id = au.id
where p.id is null;

-- Update the channel_members_with_profiles view
create or replace view channel_members_with_profiles as
select 
    cm.*,
    p.username,
    p.avatar_url,
    p.status,
    p.points,
    p.last_seen,
    c.name as channel_name
from channel_members cm
join profiles p on p.id = cm.user_id
join channels c on c.id = cm.channel_id;

-- Grant necessary permissions
grant select on channel_members_with_profiles to authenticated;
grant select, insert, update, delete on channel_members to authenticated;

-- Add RLS policies
alter table channel_members enable row level security;

-- Users can view members of channels they're in
create policy "Users can view channel members"
on channel_members for select
using (
    exists (
        select 1 from channel_members cm
        where cm.channel_id = channel_members.channel_id
        and cm.user_id = auth.uid()
    )
);

-- Channel admins can manage members
create policy "Channel admins can manage members"
on channel_members for all
using (
    exists (
        select 1 from channel_members cm
        where cm.channel_id = channel_members.channel_id
        and cm.user_id = auth.uid()
        and cm.role in ('admin', 'owner')
    )
)
with check (
    exists (
        select 1 from channel_members cm
        where cm.channel_id = channel_members.channel_id
        and cm.user_id = auth.uid()
        and cm.role in ('admin', 'owner')
    )
);

-- Members can leave channels
create policy "Members can leave channels"
on channel_members for delete
using (
    user_id = auth.uid()
);
