-- Add updated_at column to queue_entries table
ALTER TABLE queue_entries 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_queue_entries_updated_at ON queue_entries;

-- Create the trigger
CREATE TRIGGER update_queue_entries_updated_at
    BEFORE UPDATE ON queue_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 