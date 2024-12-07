-- Insert a test channel member if none exists (using the current user)
INSERT INTO channel_members (channel_id, user_id, role)
SELECT 
    c.id as channel_id,
    auth.uid() as user_id,
    'owner' as role
FROM channels c
WHERE NOT EXISTS (
    SELECT 1 FROM channel_members cm 
    WHERE cm.channel_id = c.id 
    AND cm.user_id = auth.uid()
)
LIMIT 1;

-- Verify the view works
SELECT 
    cm.*,
    p.username,
    p.avatar_url
FROM channel_members cm
JOIN profiles p ON p.id = cm.user_id
WHERE cm.channel_id IN (
    SELECT channel_id 
    FROM channel_members 
    WHERE user_id = auth.uid()
)
LIMIT 5;
