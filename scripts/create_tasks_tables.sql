-- Create tasks table for admin to create tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  assignment_type TEXT CHECK (assignment_type IN ('batch', 'individual')) NOT NULL,
  batch_id TEXT REFERENCES batches(id),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create student_tasks junction table for individual task assignments
CREATE TABLE IF NOT EXISTS student_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT,
  student_email TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, student_id)
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all access to student_tasks" ON student_tasks FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_batch_id ON tasks(batch_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_student_tasks_task_id ON student_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_student_tasks_student_id ON student_tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_student_tasks_completed ON student_tasks(completed);
