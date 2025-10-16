-- Add Workshop 6 to workshop column constraint

-- Step 1: Drop the old constraint
ALTER TABLE student_submissions
DROP CONSTRAINT IF EXISTS student_submissions_workshop_check;

-- Step 2: Add new constraint with Workshop 6
ALTER TABLE student_submissions
ADD CONSTRAINT student_submissions_workshop_check
CHECK (workshop IN ('Workshop 3', 'Workshop 4 & 5', 'Workshop 6'));

-- Step 3: Update comment to reflect the change
COMMENT ON COLUMN student_submissions.workshop IS 'Selected workshop: Workshop 3, Workshop 4 & 5, or Workshop 6';
