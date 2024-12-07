-- Drop existing policies if they exist
drop policy if exists "Users can create comments" on "public"."post_comments";
drop policy if exists "Users can delete their own comments" on "public"."post_comments";
drop policy if exists "Users can update their own comments" on "public"."post_comments";
drop policy if exists "Users can view comments" on "public"."post_comments";

-- Disable RLS
alter table "public"."post_comments" disable row level security;

-- Create policies
alter table "public"."post_comments" enable row level security;

-- INSERT policy: Users can create comments
create policy "Users can create comments"
on "public"."post_comments"
for insert
to authenticated
with check (true);

-- DELETE policy: Users can delete their own comments
create policy "Users can delete their own comments"
on "public"."post_comments"
for delete
to authenticated
using (auth.uid() = user_id);

-- UPDATE policy: Users can update their own comments
create policy "Users can update their own comments"
on "public"."post_comments"
for update
to authenticated
using (auth.uid() = user_id);

-- SELECT policy: Users can view comments
create policy "Users can view comments"
on "public"."post_comments"
for select
to authenticated
using (true);
