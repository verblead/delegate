-- Add INSERT policy for volunteer_tasks
CREATE POLICY "Users can create volunteer tasks" ON public.volunteer_tasks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add UPDATE policy for volunteer_tasks (for volunteering and completing tasks)
CREATE POLICY "Users can update volunteer tasks" ON public.volunteer_tasks
FOR UPDATE
TO authenticated
USING (
    -- Allow update if:
    -- 1. User is the creator
    -- 2. User is the volunteer
    -- 3. User is volunteering for an open task
    created_by = auth.uid() OR 
    volunteer_id = auth.uid() OR 
    (status = 'open' AND volunteer_id IS NULL)
)
WITH CHECK (
    created_by = auth.uid() OR 
    volunteer_id = auth.uid() OR 
    (status = 'open' AND volunteer_id IS NULL)
);

-- Add DELETE policy for volunteer_tasks
CREATE POLICY "Users can delete their own volunteer tasks" ON public.volunteer_tasks
FOR DELETE
TO authenticated
USING (created_by = auth.uid());
