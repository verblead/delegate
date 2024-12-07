-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for channel members" ON public.channels;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.channels;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.channels;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.channels;

-- Enable RLS
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Anyone can view channels"
ON public.channels FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create channels"
ON public.channels FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Channel creators can update channels"
ON public.channels FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Channel creators can delete channels"
ON public.channels FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channels_created_by ON public.channels(created_by);

-- Enable realtime
ALTER publication supabase_realtime ADD TABLE public.channels;