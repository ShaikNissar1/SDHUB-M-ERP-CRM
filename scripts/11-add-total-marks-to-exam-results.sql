-- Add total_marks column to entrance_exam_results
ALTER TABLE entrance_exam_results
ADD COLUMN total_marks numeric DEFAULT NULL;

-- Add total_marks column to main_exam_results
ALTER TABLE main_exam_results
ADD COLUMN total_marks numeric DEFAULT NULL;

-- Add total_marks column to internal_exam_results
ALTER TABLE internal_exam_results
ADD COLUMN total_marks numeric DEFAULT NULL;
