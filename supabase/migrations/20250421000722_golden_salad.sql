/*
  # Fix RLS policies for tags table

  1. Changes
    - Drop existing policies to avoid conflicts
    - Recreate RLS policies for the tags table
    
  2. Security
    - Maintain same security model where users can only access their own tags
    - Policies cover all CRUD operations
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create their own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can read their own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can update their own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can delete their own tags" ON public.tags;

-- Enable RLS on tags table
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Policy for inserting tags
CREATE POLICY "Users can create their own tags"
ON public.tags
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for selecting tags
CREATE POLICY "Users can read their own tags"
ON public.tags
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for updating tags
CREATE POLICY "Users can update their own tags"
ON public.tags
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for deleting tags
CREATE POLICY "Users can delete their own tags"
ON public.tags
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);