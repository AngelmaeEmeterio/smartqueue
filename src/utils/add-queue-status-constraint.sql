-- Drop existing constraint if it exists
ALTER TABLE queue_entries DROP CONSTRAINT IF EXISTS queue_entries_status_check;

-- Add check constraint for valid status values
ALTER TABLE queue_entries 
ADD CONSTRAINT queue_entries_status_check 
CHECK (status IN ('waiting', 'serving', 'completed', 'cancelled'));

-- Update any existing invalid status values to 'waiting'
UPDATE queue_entries 
SET status = 'waiting' 
WHERE status NOT IN ('waiting', 'serving', 'completed', 'cancelled'); 