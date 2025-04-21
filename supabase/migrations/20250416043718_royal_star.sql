/*
  # Link Management System Schema Update

  1. Changes
    - Preserve existing links table
    - Add new tables: categories, tags, link_tags, activity_logs
    - Add new columns to links table
    - Update security policies

  2. New Tables
    - categories
    - tags
    - link_tags
    - activity_logs

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS categories_order_idx ON categories("order");

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to existing links table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'links' AND column_name = 'category_id') THEN
    ALTER TABLE links 
      ADD COLUMN category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
      ADD COLUMN is_pinned boolean DEFAULT false,
      ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS links_category_id_idx ON links(category_id);
CREATE INDEX IF NOT EXISTS links_is_pinned_idx ON links(is_pinned);

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
  link_id uuid REFERENCES links(id) ON DELETE CASCADE,
  action text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_logs_timestamp_idx ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS activity_logs_link_id_idx ON activity_logs(link_id);

-- Enable Row Level Security for new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for all users" ON categories
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON categories
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for all users" ON categories
  FOR DELETE TO authenticated USING (true);

-- Tags policies
CREATE POLICY "Enable read access for all users" ON tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for all users" ON tags
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON tags
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for all users" ON tags
  FOR DELETE TO authenticated USING (true);

-- Link_tags policies
CREATE POLICY "Enable read access for all users" ON link_tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for all users" ON link_tags
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON link_tags
  FOR DELETE TO authenticated USING (true);

-- Activity_logs policies
CREATE POLICY "Enable read access for all users" ON activity_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for all users" ON activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Insert default categories if they don't exist
INSERT INTO categories (name, color, "order")
SELECT 'Very Important', '#FF4444', 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Very Important');

INSERT INTO categories (name, color, "order")
SELECT 'Sometimes Needed', '#FFBB33', 2
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Sometimes Needed');

INSERT INTO categories (name, color, "order")
SELECT 'Not Used Often', '#00C851', 3
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Not Used Often');

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