-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable self update" ON public.profiles;
DROP POLICY IF EXISTS "Allow viewing channel members" ON public.channel_members;
DROP POLICY IF EXISTS "Allow channel creation membership" ON public.channel_members;

-- Create simplified profile policies
CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create simplified channel policies
CREATE POLICY "Anyone can view channels"
ON public.channels FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create channels"
ON public.channels FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Create simplified channel member policies
CREATE POLICY "Anyone can view channel members"
ON public.channel_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Channel admins can manage members"
ON public.channel_members FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.channel_members
        WHERE channel_id = channel_members.channel_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
    OR NOT EXISTS (
        SELECT 1 FROM public.channel_members
        WHERE channel_id = channel_members.channel_id
    )
);