-- Check if there are any records in channel_members
SELECT COUNT(*) FROM channel_members;

-- Check if the view returns any records
SELECT COUNT(*) FROM channel_members_with_profiles;

-- Check a sample of records from both tables
SELECT cm.*, p.username, p.avatar_url 
FROM channel_members cm 
JOIN profiles p ON p.id = cm.user_id 
LIMIT 5;
