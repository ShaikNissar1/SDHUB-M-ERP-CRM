-- Fix RLS policies for student_documents to allow service role uploads and fix course fetch
-- Drop existing student_documents policies
DROP POLICY IF EXISTS "Students can insert own documents" ON student_documents;
DROP POLICY IF EXISTS "Students can view own documents" ON student_documents;
DROP POLICY IF EXISTS "Students can delete own documents" ON student_documents;
DROP POLICY IF EXISTS "Service role full access" ON student_documents;
DROP POLICY IF EXISTS "Allow all access to student_documents" ON student_documents;

-- Create new policies that allow all operations (for now, since this app doesn't have auth)
CREATE POLICY "Allow all access to student_documents" ON student_documents FOR ALL USING (true);

-- Also ensure courses table allows all access
DROP POLICY IF EXISTS "Allow all access to courses" ON courses;
CREATE POLICY "Allow all access to courses" ON courses FOR ALL USING (true);
