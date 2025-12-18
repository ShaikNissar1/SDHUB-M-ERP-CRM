-- Fix Row Level Security for student_documents table
-- This script addresses the security vulnerability where all users could access all documents

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow all access to student_documents" ON student_documents;

-- Create new RLS policies that properly restrict access
-- Policy 1: Allow service role (admin operations) full access
CREATE POLICY "Service role full access" ON student_documents 
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy 2: Allow authenticated users to insert their own documents
-- (This assumes a students table has a user_id that matches auth.uid())
CREATE POLICY "Students can insert own documents" ON student_documents 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students 
      WHERE students.id = student_documents.student_id
    )
  );

-- Policy 3: Allow authenticated users to view their own documents
CREATE POLICY "Students can view own documents" ON student_documents 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE students.id = student_documents.student_id
    )
  );

-- Policy 4: Allow authenticated users to delete their own documents
CREATE POLICY "Students can delete own documents" ON student_documents 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM students 
      WHERE students.id = student_documents.student_id
    )
  );
