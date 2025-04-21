/*
  # Create links table

  1. New Tables
    - `links`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `url` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `links` table
    - Add policies for authenticated users to:
      - Read their own links
      - Create new links
      - Update their own links
      - Delete their own links
*/

-- Create the links table
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own links"
  ON links
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own links"
  ON links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own links"
  ON links
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links"
  ON links
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS links_user_id_idx ON links(user_id);
CREATE INDEX IF NOT EXISTS links_created_at_idx ON links(created_at);