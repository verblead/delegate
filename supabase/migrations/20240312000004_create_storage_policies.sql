-- Create storage bucket if it doesn't exist
insert into storage.buckets (id, name)
values ('meeting-recordings', 'meeting-recordings')
on conflict do nothing;

-- Create function to extract meeting ID from path
create or replace function storage.get_meeting_id_from_path(name text)
returns uuid
language plpgsql
as $$
begin
  -- Assumes path format: 'meeting-id/filename'
  return (split_part(name, '/', 1))::uuid;
exception
  when others then
    return null::uuid;
end;
$$;

-- Policy for viewing recordings
create policy "Meeting participants can access recordings"
on storage.objects for select
using (
  bucket_id = 'meeting-recordings'
  and exists (
    select 1 from public.meeting_participants
    where meeting_participants.meeting_id = storage.get_meeting_id_from_path(name)
    and meeting_participants.user_id = auth.uid()
  )
);

-- Policy for uploading recordings
create policy "Meeting hosts can upload recordings"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'meeting-recordings'
  and exists (
    select 1 from public.meetings
    where meetings.id = storage.get_meeting_id_from_path(name)
    and meetings.host_id = auth.uid()
  )
);

-- Policy for deleting recordings
create policy "Meeting hosts can delete recordings"
on storage.objects for delete
using (
  bucket_id = 'meeting-recordings'
  and exists (
    select 1 from public.meetings
    where meetings.id = storage.get_meeting_id_from_path(name)
    and meetings.host_id = auth.uid()
  )
);