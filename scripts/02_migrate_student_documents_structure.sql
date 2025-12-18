-- Add new columns to student_documents table if they don't exist
ALTER TABLE public.student_documents
ADD COLUMN IF NOT EXISTS student_name text,
ADD COLUMN IF NOT EXISTS folder_name text,
ADD COLUMN IF NOT EXISTS path text;

-- Create index on folder_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_student_documents_folder_name 
ON public.student_documents(folder_name);

CREATE INDEX IF NOT EXISTS idx_student_documents_student_name 
ON public.student_documents(student_name);

-- Add foreign key constraint if not exists
ALTER TABLE public.student_documents
ADD CONSTRAINT fk_student_documents_student_id 
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- Create or replace trigger function to auto-generate folder_name and path
CREATE OR REPLACE FUNCTION public.set_document_folder_and_path()
RETURNS TRIGGER AS $$
BEGIN
  -- Get student name from students table if not provided
  IF NEW.student_name IS NULL THEN
    SELECT name INTO NEW.student_name FROM public.students WHERE id = NEW.student_id;
  END IF;
  
  -- Generate folder_name: StudentName_StudentID (sanitized)
  IF NEW.folder_name IS NULL THEN
    NEW.folder_name := regexp_replace(NEW.student_name, '\s+', '_', 'g') || '_' || NEW.student_id::text;
  END IF;
  
  -- Generate full path: folder_name/kind/filename
  IF NEW.path IS NULL AND NEW.kind IS NOT NULL THEN
    NEW.path := NEW.folder_name || '/' || NEW.kind || '/' || NEW.name;
  ELSIF NEW.path IS NULL THEN
    NEW.path := NEW.folder_name || '/' || NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_document_folder_and_path ON public.student_documents;

-- Create trigger to run before insert
CREATE TRIGGER trigger_set_document_folder_and_path
BEFORE INSERT ON public.student_documents
FOR EACH ROW
EXECUTE FUNCTION public.set_document_folder_and_path();

-- Create trigger to run before update
CREATE TRIGGER trigger_set_document_folder_and_path_update
BEFORE UPDATE ON public.student_documents
FOR EACH ROW
EXECUTE FUNCTION public.set_document_folder_and_path();
