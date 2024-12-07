-- Drop existing update policy
DROP POLICY IF EXISTS "Enable self update" ON public.profiles;

-- Create new policy that allows both self-update and admin role updates
CREATE POLICY "Enable self update and admin role updates"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
