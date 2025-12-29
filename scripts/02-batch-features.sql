-- 1. Add new columns to batches table
ALTER TABLE batches 
ADD COLUMN IF NOT EXISTS syllabus_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_module TEXT,
ADD COLUMN IF NOT EXISTS last_class_date DATE;

-- 2. Create batch_schedule table
CREATE TABLE IF NOT EXISTS batch_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL, -- 'Monday', 'Tuesday', etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  mode TEXT CHECK (mode IN ('Online', 'Offline')),
  classroom_link TEXT, -- Room number or Zoom link
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_batch_schedule_batch_id ON batch_schedule(batch_id);

-- 3. Create batch_teachers junction table (for multiple teachers per batch)
CREATE TABLE IF NOT EXISTS batch_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(batch_id, teacher_id)
);

CREATE INDEX IF NOT EXISTS idx_batch_teachers_batch_id ON batch_teachers(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_teachers_teacher_id ON batch_teachers(teacher_id);

-- 4. Enable RLS
ALTER TABLE batch_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_teachers ENABLE ROW LEVEL SECURITY;

-- 5. Create basic policies
CREATE POLICY "Allow all access to batch_schedule" ON batch_schedule FOR ALL USING (true);
CREATE POLICY "Allow all access to batch_teachers" ON batch_teachers FOR ALL USING (true);
