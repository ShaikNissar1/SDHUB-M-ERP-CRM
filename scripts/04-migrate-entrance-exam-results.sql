-- Migration: Alter entrance_exam_results table to match test_results schema

-- Drop the old table and recreate with test_results schema
DROP TABLE IF EXISTS entrance_exam_results CASCADE;

-- Recreate entrance_exam_results with same schema as test_results
CREATE TABLE IF NOT EXISTS entrance_exam_results (
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

-- Create indexes for better query performance
CREATE INDEX idx_entrance_exam_results_email ON entrance_exam_results(email);
CREATE INDEX idx_entrance_exam_results_course ON entrance_exam_results(course);
CREATE INDEX idx_entrance_exam_results_submitted_at ON entrance_exam_results(submitted_at);
CREATE INDEX idx_entrance_exam_results_lead_id ON entrance_exam_results(lead_id);

-- Enable RLS (Row Level Security)
ALTER TABLE entrance_exam_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Allow all access to entrance_exam_results" ON entrance_exam_results FOR ALL USING (true);
