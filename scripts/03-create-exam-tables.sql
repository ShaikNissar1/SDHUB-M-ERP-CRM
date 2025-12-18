-- Create separate tables for different exam types

-- Entrance Exam Results Table
CREATE TABLE IF NOT EXISTS entrance_exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  score NUMERIC,
  total_marks INTEGER DEFAULT 100,
  passing_marks INTEGER DEFAULT 40,
  status TEXT DEFAULT 'pending', -- pending, passed, failed
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main Exam Results Table
CREATE TABLE IF NOT EXISTS main_exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  score NUMERIC,
  total_marks INTEGER DEFAULT 100,
  passing_marks INTEGER DEFAULT 40,
  status TEXT DEFAULT 'pending', -- pending, passed, failed
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Internal Exam Results Table
CREATE TABLE IF NOT EXISTS internal_exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  score NUMERIC,
  total_marks INTEGER DEFAULT 100,
  passing_marks INTEGER DEFAULT 40,
  status TEXT DEFAULT 'pending', -- pending, passed, failed
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_entrance_exam_results_lead_id ON entrance_exam_results(lead_id);
CREATE INDEX IF NOT EXISTS idx_entrance_exam_results_submitted_at ON entrance_exam_results(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_main_exam_results_exam_id ON main_exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_main_exam_results_student_id ON main_exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_main_exam_results_batch_id ON main_exam_results(batch_id);
CREATE INDEX IF NOT EXISTS idx_main_exam_results_submitted_at ON main_exam_results(submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_internal_exam_results_exam_id ON internal_exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_internal_exam_results_student_id ON internal_exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_internal_exam_results_batch_id ON internal_exam_results(batch_id);
CREATE INDEX IF NOT EXISTS idx_internal_exam_results_submitted_at ON internal_exam_results(submitted_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE entrance_exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE main_exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_exam_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now, restrict as needed)
CREATE POLICY "Allow all access to entrance_exam_results" ON entrance_exam_results FOR ALL USING (true);
CREATE POLICY "Allow all access to main_exam_results" ON main_exam_results FOR ALL USING (true);
CREATE POLICY "Allow all access to internal_exam_results" ON internal_exam_results FOR ALL USING (true);
