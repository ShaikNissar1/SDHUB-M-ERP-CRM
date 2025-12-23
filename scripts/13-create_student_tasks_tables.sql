-- Create tasks table for task assignments
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_by UUID,
  assigned_role TEXT CHECK (assigned_role IN ('teacher', 'admin')),
  course_id UUID REFERENCES courses(id),
  batch_id TEXT REFERENCES batches(id),
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create student_tasks mapping table
CREATE TABLE IF NOT EXISTS student_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(task_id, student_id)
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true);

-- RLS Policies for student_tasks
CREATE POLICY "Students can view own tasks" ON student_tasks 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Students can update task status" ON student_tasks 
FOR UPDATE 
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_tasks_student_id ON student_tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_student_tasks_status ON student_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_batch_id ON tasks(batch_id);
CREATE INDEX IF NOT EXISTS idx_tasks_course_id ON tasks(course_id);
