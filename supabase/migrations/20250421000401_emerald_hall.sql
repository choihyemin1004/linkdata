/*
  # Add RLS policies for tags table

  1. Security Changes
    - Add RLS policies for the tags table to allow authenticated users to:
      - Insert their own tags
      - Update their own tags
      - Delete their own tags
      - Read their own tags
    
  2. Policy Details
    - All policies are scoped to authenticated users
    - Users can only manage tags where they are the owner (user_id matches auth.uid())
*/

-- Enable RLS on tags table (if not already enabled)
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