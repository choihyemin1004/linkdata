/*
  # Link Management System Schema Update

  1. Changes
    - Add user_id to categories and tags tables
    - Update RLS policies to enforce user-based access
    - Preserve existing tables structure
    - Add new columns and relationships

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS categories_order_idx ON categories("order");
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories(user_id);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tags_user_id_idx ON tags(user_id);

-- Add new columns to existing links table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'links' AND column_name = 'category_id') THEN
    ALTER TABLE links 
      ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
      ADD COLUMN is_pinned boolean DEFAULT false,
      ADD COLUMN "order" integer DEFAULT 0,
      ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS links_category_id_idx ON links(category_id);
CREATE INDEX IF NOT EXISTS links_is_pinned_idx ON links(is_pinned);
CREATE INDEX IF NOT EXISTS links_order_idx ON links("order");

-- Create link_tags junction table
CREATE TABLE IF NOT EXISTS link_tags (
  link_id uuid REFERENCES links(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (link_id, tag_id)
);

CREATE INDEX IF NOT EXISTS link_tags_link_id_idx ON link_tags(link_id);
CREATE INDEX IF NOT EXISTS link_tags_tag_id_idx ON link_tags(tag_id);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  link_id uuid REFERENCES links(id) ON DELETE CASCADE,
  action text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_logs_timestamp_idx ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS activity_logs_link_id_idx ON activity_logs(link_id);
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON activity_logs(user_id);

-- Enable Row Level Security for all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can read their own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can read their own tags"
  ON tags FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
  ON tags FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON tags FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Link_tags policies
CREATE POLICY "Users can read their own link_tags"
  ON link_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = link_tags.link_id
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own link_tags"
  ON link_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = link_tags.link_id
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own link_tags"
  ON link_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = link_tags.link_id
      AND links.user_id = auth.uid()
    )
  );

-- Activity_logs policies
CREATE POLICY "Users can read their own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_links_updated_at ON links;
CREATE TRIGGER update_links_updated_at
    BEFORE UPDATE ON links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories if they don't exist
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Get the admin user's ID
  SELECT id INTO admin_id FROM auth.users WHERE email = 'planhompro@gmail.com' LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    -- Insert categories only if they don't exist for this user
    INSERT INTO categories (name, color, "order", user_id)
    SELECT 'Very Important', '#FF4444', 1, admin_id
    WHERE NOT EXISTS (
      SELECT 1 FROM categories 
      WHERE name = 'Very Important' AND user_id = admin_id
    );

    INSERT INTO categories (name, color, "order", user_id)
    SELECT 'Sometimes Needed', '#FFBB33', 2, admin_id
    WHERE NOT EXISTS (
      SELECT 1 FROM categories 
      WHERE name = 'Sometimes Needed' AND user_id = admin_id
    );

    INSERT INTO categories (name, color, "order", user_id)
    SELECT 'Not Used Often', '#00C851', 3, admin_id
    WHERE NOT EXISTS (
      SELECT 1 FROM categories 
      WHERE name = 'Not Used Often' AND user_id = admin_id
    );
  END IF;
END $$;