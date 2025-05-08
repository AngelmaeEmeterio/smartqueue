-- First, create the admin user in auth.users (you'll need to do this through Supabase dashboard)
-- Then, insert the admin user into the users table
INSERT INTO users (id, email, full_name, role, created_at)
VALUES (
  'YOUR_ADMIN_AUTH_ID', -- Replace this with the actual auth user ID from Supabase
  'admin@qserve.com',
  'System Administrator',
  'admin',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Add RLS policy to allow admin access
CREATE POLICY "Admins can do everything" ON queue_entries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add RLS policy to allow admins to view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id); 