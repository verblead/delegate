-- Insert a test message
insert into public.messages (content, channel_id, sender_id, has_attachments)
values (
    'Test message from migration',
    'c73a1408-a929-405b-bc58-5ada323accad',  -- Church Family channel
    '4853a266-4821-4baf-901a-22a03773f0f4',  -- Your user ID
    false
);
