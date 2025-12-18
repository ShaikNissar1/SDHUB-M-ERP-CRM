-- Add exam_id column to test_results table for better data integrity
-- This allows linking test results directly to exams table via UUID

ALTER TABLE test_results
ADD COLUMN IF NOT EXISTS exam_id UUID REFERENCES exams(id);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_test_results_exam_id ON test_results(exam_id);

-- Optional: Update existing records to link them to exams by matching exam title
-- This is a one-time migration to populate exam_id for existing records
UPDATE test_results tr
SET exam_id = e.id
FROM exams e
WHERE tr.exam = e.title
AND tr.exam_id IS NULL;
