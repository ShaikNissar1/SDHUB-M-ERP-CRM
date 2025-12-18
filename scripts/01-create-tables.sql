-- Create tables for the ERP/CRM system

-- 1. LEADS/ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  qualification TEXT,
  source TEXT,
  status TEXT DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_follow_up_date DATE,
  assigned_hr TEXT,
  remarks TEXT,
  entrance_score NUMERIC,
  final_score NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_course ON leads(course);
CREATE INDEX idx_leads_next_followup ON leads(next_follow_up_date);

-- 2. LEAD HISTORY TABLE
CREATE TABLE IF NOT EXISTS lead_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lead_history_lead_id ON lead_history(lead_id);

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  duration TEXT,
  languages TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. COURSE MODULES TABLE
CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  teacher_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);

-- 5. BATCHES TABLE
CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'Upcoming',
  total_students INTEGER DEFAULT 0,
  trainer_id UUID,
  trainer_name TEXT,
  max_students INTEGER,
  description TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  notification_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_batches_course_id ON batches(course_id);
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_batches_start_date ON batches(start_date);

-- 6. BATCH MODULE ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS batch_module_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  teacher_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_batch_module_assignments_batch_id ON batch_module_assignments(batch_id);

-- 7. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  status TEXT DEFAULT 'active',
  rating NUMERIC DEFAULT 0,
  contact TEXT,
  email TEXT,
  phone TEXT,
  alt_contact TEXT,
  photo_url TEXT,
  gender TEXT,
  dob DATE,
  blood_group TEXT,
  addr_permanent TEXT,
  addr_correspondence TEXT,
  emergency_contact TEXT,
  experience_years INTEGER,
  previous_institutes TEXT,
  skills TEXT,
  joining_date DATE,
  contract_type TEXT,
  assigned_course_ids UUID[] DEFAULT '{}',
  assigned_batch_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_teachers_status ON teachers(status);
CREATE INDEX idx_teachers_email ON teachers(email);

-- 8. TEACHER DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS teacher_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_teacher_documents_teacher_id ON teacher_documents(teacher_id);

-- 9. TEACHER NOTES TABLE
CREATE TABLE IF NOT EXISTS teacher_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_teacher_notes_teacher_id ON teacher_notes(teacher_id);

-- 10. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  qualification TEXT,
  course_id UUID REFERENCES courses(id),
  course_name TEXT,
  batch_id TEXT REFERENCES batches(id),
  batch_number TEXT,
  aadhaar_number TEXT,
  pan_number TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'Active',
  photo_url TEXT,
  gender TEXT,
  dob DATE,
  blood_group TEXT,
  address_permanent TEXT,
  address_correspondence TEXT,
  guardian_name TEXT,
  guardian_contact TEXT,
  emergency_contact TEXT,
  alt_contact TEXT,
  experience_years INTEGER,
  previous_institutes TEXT,
  skills TEXT,
  join_date DATE,
  contract_type TEXT,
  notes JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_phone ON students(phone);
CREATE INDEX idx_students_batch_id ON students(batch_id);
CREATE INDEX idx_students_course_id ON students(course_id);
CREATE INDEX idx_students_status ON students(status);

-- 11. STUDENT DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size INTEGER,
  type TEXT,
  kind TEXT,
  url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_student_documents_student_id ON student_documents(student_id);

-- 12. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  person_id UUID NOT NULL,
  person_name TEXT NOT NULL,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status TEXT NOT NULL,
  notes TEXT,
  batch_id TEXT,
  course_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attendance_person_id ON attendance(person_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_type ON attendance(type);
CREATE INDEX idx_attendance_batch_id ON attendance(batch_id);

-- 13. TEST RESULTS TABLE
CREATE TABLE IF NOT EXISTS test_results (
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

CREATE INDEX idx_test_results_email ON test_results(email);
CREATE INDEX idx_test_results_course ON test_results(course);
CREATE INDEX idx_test_results_submitted_at ON test_results(submitted_at);

-- 14. EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  course_id UUID REFERENCES courses(id),
  batch_id TEXT REFERENCES batches(id),
  form_link TEXT NOT NULL,
  sheet_link TEXT,
  total_marks INTEGER,
  passing_marks INTEGER,
  duration_minutes INTEGER,
  created_by TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_exams_course_id ON exams(course_id);
CREATE INDEX idx_exams_status ON exams(status);

-- 15. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id),
  batch_id TEXT NOT NULL REFERENCES batches(id),
  certificate_number TEXT UNIQUE,
  issued_date DATE,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_certificates_student_id ON certificates(student_id);
CREATE INDEX idx_certificates_batch_id ON certificates(batch_id);

-- Enable RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_module_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now - adjust based on auth)
CREATE POLICY "Allow all access to leads" ON leads FOR ALL USING (true);
CREATE POLICY "Allow all access to lead_history" ON lead_history FOR ALL USING (true);
CREATE POLICY "Allow all access to courses" ON courses FOR ALL USING (true);
CREATE POLICY "Allow all access to course_modules" ON course_modules FOR ALL USING (true);
CREATE POLICY "Allow all access to batches" ON batches FOR ALL USING (true);
CREATE POLICY "Allow all access to batch_module_assignments" ON batch_module_assignments FOR ALL USING (true);
CREATE POLICY "Allow all access to teachers" ON teachers FOR ALL USING (true);
CREATE POLICY "Allow all access to teacher_documents" ON teacher_documents FOR ALL USING (true);
CREATE POLICY "Allow all access to teacher_notes" ON teacher_notes FOR ALL USING (true);
CREATE POLICY "Allow all access to students" ON students FOR ALL USING (true);
CREATE POLICY "Allow all access to student_documents" ON student_documents FOR ALL USING (true);
CREATE POLICY "Allow all access to attendance" ON attendance FOR ALL USING (true);
CREATE POLICY "Allow all access to test_results" ON test_results FOR ALL USING (true);
CREATE POLICY "Allow all access to exams" ON exams FOR ALL USING (true);
CREATE POLICY "Allow all access to certificates" ON certificates FOR ALL USING (true);
