-- Drop existing policies
drop policy if exists "Users can view events they created or are attending" on schedule_events;
drop policy if exists "Users can create events" on schedule_events;
drop policy if exists "Event creators can update their events" on schedule_events;
drop policy if exists "Event creators can delete their events" on schedule_events;

-- Create improved policies
create policy "Users can view events"
  on schedule_events for select
  using (true);

create policy "Users can create events"
  on schedule_events for insert
  with check (true);

create policy "Users can update their own events"
  on schedule_events for update
  using (auth.uid() = created_by);

create policy "Users can delete their own events"
  on schedule_events for delete
  using (auth.uid() = created_by);