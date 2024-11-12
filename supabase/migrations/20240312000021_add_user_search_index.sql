-- Add GIN index for faster text search on profiles
create extension if not exists pg_trgm;

create index if not exists idx_profiles_email_search 
  on profiles using gin (email gin_trgm_ops);
  
create index if not exists idx_profiles_username_search 
  on profiles using gin (username gin_trgm_ops);

-- Update or create policy for searching users
create policy "Anyone can search users"
  on profiles for select
  using (true);