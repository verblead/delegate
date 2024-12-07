INSERT INTO "public"."channel_posts" (
  "id", 
  "channel_id", 
  "user_id", 
  "content", 
  "has_attachments", 
  "created_at", 
  "updated_at",
  "sender_id"
) VALUES (
  '45b0fa6b-1f1f-4214-875f-b4d1b4d4cbda',
  'c73a1408-a929-405b-bc58-5ada323accad',
  '4853a266-4821-4baf-901a-22a03773f0f4',
  'I love Jesus',
  'false',
  '2024-12-06 21:25:07+00',
  '2024-12-06 21:25:10+00',
  '4853a266-4821-4baf-901a-22a03773f0f4'  -- sender_id must equal user_id due to the constraint
);
