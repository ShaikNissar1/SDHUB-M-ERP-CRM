-- Migrate internal_exam_results table to match test_results schema
-- This standardizes the schema across all exam types

-- Drop old internal_exam_results table
DROP TABLE IF EXISTS internal_exam_results CASCADE;

-- Recreate with test_results schema
CREATE TABLE IF NOT EXISTS internal_exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  course TEXT,
  exam TEXT,
  score NUMERIC,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_internal_exam_results_email ON internal_exam_results(email);
CREATE INDEX IF NOT EXISTS idx_internal_exam_results_course ON internal_exam_results(course);
CREATE INDEX IF NOT EXISTS idx_internal_exam_results_submitted_at ON internal_exam_results(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_internal_exam_results_lead_id ON internal_exam_results(lead_id);

-- Enable RLS (Row Level Security)
ALTER TABLE internal_exam_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all access to internal_exam_results" ON internal_exam_results FOR ALL USING (true);
