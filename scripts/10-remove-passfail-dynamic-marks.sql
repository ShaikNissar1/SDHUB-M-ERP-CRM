-- Remove pass/fail columns and make total_marks nullable to capture actual exam total marks
-- This allows HR to decide pass/fail status separately

ALTER TABLE entrance_exam_results 
DROP COLUMN IF EXISTS passing_marks,
DROP COLUMN IF EXISTS status,
ALTER COLUMN total_marks DROP DEFAULT,
ALTER COLUMN total_marks SET DEFAULT NULL;

ALTER TABLE main_exam_results
DROP COLUMN IF EXISTS passing_marks,
DROP COLUMN IF EXISTS status,
ALTER COLUMN total_marks DROP DEFAULT,
ALTER COLUMN total_marks SET DEFAULT NULL;

ALTER TABLE internal_exam_results
DROP COLUMN IF EXISTS passing_marks,
DROP COLUMN IF EXISTS status,
ALTER COLUMN total_marks DROP DEFAULT,
ALTER COLUMN total_marks SET DEFAULT NULL;

-- Also update the exams table to remove passing_marks
ALTER TABLE exams
DROP COLUMN IF EXISTS passing_marks;
