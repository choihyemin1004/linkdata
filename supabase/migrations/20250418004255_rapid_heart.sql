/*
  # Fix Categories

  1. Changes
    - Ensure default categories exist for admin user
    - Update category colors and emojis
*/

-- First, get the admin user's ID
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Get the admin user's ID
  SELECT id INTO admin_id FROM auth.users WHERE email = 'planhompro@gmail.com' LIMIT 1;
  
  IF admin_id IS NOT NULL THEN
    -- Delete existing categories for this user to avoid duplicates
    DELETE FROM categories WHERE user_id = admin_id;

    -- Insert the three default categories
    INSERT INTO categories (name, color, "order", user_id)
    VALUES 
      ('Very Important', '#FF4444', 1, admin_id),
      ('Sometimes Needed', '#FFBB33', 2, admin_id),
      ('Not Used Often', '#00C851', 3, admin_id);
  END IF;
END $$;