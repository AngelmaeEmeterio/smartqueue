-- Enable RLS on queue_entries table
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

-- Policy for admins to manage all queues
CREATE POLICY "Admins can manage all queues" ON queue_entries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy for students to view their own queues
CREATE POLICY "Students can view own queues" ON queue_entries
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- Policy for students to create queues
CREATE POLICY "Students can create queues" ON queue_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- Policy for students to update their own queues
CREATE POLICY "Students can update own queues" ON queue_entries
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid()
  ); 