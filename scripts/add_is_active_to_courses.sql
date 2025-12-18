-- Add is_active column to courses table
ALTER TABLE courses
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Update any existing courses to be active
UPDATE courses SET is_active = true WHERE is_active IS NULL;
