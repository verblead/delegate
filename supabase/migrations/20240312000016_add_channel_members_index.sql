-- Add index for faster channel membership lookups
create index if not exists idx_channel_members_user_channel on channel_members(user_id, channel_id);

-- Add index for role-based queries
create index if not exists idx_channel_members_role on channel_members(role);