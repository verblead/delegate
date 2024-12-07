-- Create channel-avatars storage bucket
INSERT INTO storage.buckets (id, name)
VALUES ('channel-avatars', 'channel-avatars')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for channel avatars
CREATE POLICY "Allow authenticated users to view channel avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'channel-avatars');

CREATE POLICY "Allow channel admins to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'channel-avatars'
    AND (storage.foldername(name))[1] IN (
        SELECT c.id::text
        FROM channels c
        JOIN channel_members cm ON cm.channel_id = c.id
        WHERE cm.user_id = auth.uid()
        AND cm.is_admin = true
    )
);

CREATE POLICY "Allow channel admins to update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'channel-avatars'
    AND (storage.foldername(name))[1] IN (
        SELECT c.id::text
        FROM channels c
        JOIN channel_members cm ON cm.channel_id = c.id
        WHERE cm.user_id = auth.uid()
        AND cm.is_admin = true
    )
);
