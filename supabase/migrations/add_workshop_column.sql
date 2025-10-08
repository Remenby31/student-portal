-- Add workshop column to student_submissions table
ALTER TABLE student_submissions
ADD COLUMN workshop TEXT NOT NULL DEFAULT 'Workshop 3'
CHECK (workshop IN ('Workshop 3', 'Workshop 4'));

-- Add comment to explain the column
COMMENT ON COLUMN student_submissions.workshop IS 'Selected workshop: Workshop 3 or Workshop 4';
