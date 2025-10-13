-- Update workshop column constraint to accept 'Workshop 4 & 5' instead of 'Workshop 4'

-- Step 1: Drop the old constraint
ALTER TABLE student_submissions
DROP CONSTRAINT IF EXISTS student_submissions_workshop_check;

-- Step 2: Update existing 'Workshop 4' entries to 'Workshop 4 & 5' (if any)
UPDATE student_submissions
SET workshop = 'Workshop 4 & 5'
WHERE workshop = 'Workshop 4';

-- Step 3: Add new constraint with updated value
ALTER TABLE student_submissions
ADD CONSTRAINT student_submissions_workshop_check
CHECK (workshop IN ('Workshop 3', 'Workshop 4 & 5'));

-- Step 4: Update comment to reflect the change
COMMENT ON COLUMN student_submissions.workshop IS 'Selected workshop: Workshop 3 or Workshop 4 & 5';
