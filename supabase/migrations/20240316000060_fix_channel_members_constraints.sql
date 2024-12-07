-- First, let's check and fix the foreign key constraints
DO $$ 
BEGIN
    -- Drop the existing foreign key if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'channel_members_user_id_fkey'
    ) THEN
        ALTER TABLE channel_members DROP CONSTRAINT channel_members_user_id_fkey;
    END IF;

    -- Add the correct foreign key constraint to profiles table instead of users
    ALTER TABLE channel_members
        ADD CONSTRAINT channel_members_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;

    -- Ensure channel_id foreign key exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'channel_members_channel_id_fkey'
    ) THEN
        ALTER TABLE channel_members
            ADD CONSTRAINT channel_members_channel_id_fkey
            FOREIGN KEY (channel_id)
            REFERENCES channels(id)
            ON DELETE CASCADE;
    END IF;

    -- Add unique constraint to prevent duplicate memberships
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'channel_members_user_channel_unique'
    ) THEN
        ALTER TABLE channel_members
            ADD CONSTRAINT channel_members_user_channel_unique
            UNIQUE (user_id, channel_id);
    END IF;
END $$;
