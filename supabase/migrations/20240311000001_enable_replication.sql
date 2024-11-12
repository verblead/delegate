-- Enable replication for all relevant tables
alter publication supabase_realtime add table channels;
alter publication supabase_realtime add table channel_members;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table message_reactions;
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table profiles;
alter publication supabase_realtime add table achievements;
alter publication supabase_realtime add table user_achievements;

-- Enable row level security (RLS) for realtime
alter table channels replica identity full;
alter table channel_members replica identity full;
alter table messages replica identity full;
alter table message_reactions replica identity full;
alter table tasks replica identity full;
alter table profiles replica identity full;
alter table achievements replica identity full;
alter table user_achievements replica identity full;