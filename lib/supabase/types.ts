export type Lead = {
  id: string
  name: string
  email: string
  phone: string
  course: string
  qualification?: string
  source?: string
  status?: string
  created_at?: string
  next_follow_up_date?: string
  assigned_hr?: string
  remarks?: string
  entrance_score?: number
  final_score?: number
  updated_at?: string
}

export type Course = {
  id: string
  name: string
  description?: string
  duration?: string
  languages?: string[]
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export type CourseModule = {
  id: string
  course_id: string
  title: string
  teacher_id?: string
  created_at?: string
}

export type Batch = {
  id: string
  course_id: string
  course_name: string
  name: string
  start_date: string
  end_date: string
  status: "Active" | "Upcoming" | "Completed"
  total_students: number
  trainer_id?: string
  trainer_name?: string
  max_students?: number
  description?: string
  completed_at?: string
  notification_sent_at?: string
  created_at?: string
  syllabus_completion_percentage?: number
  current_module?: string
  last_class_date?: string
  updated_at?: string
}

export type Teacher = {
  id: string
  name: string
  role?: string
  status?: "active" | "on_leave" | "inactive"
  rating?: number
  contact?: string
  email?: string
  phone?: string
  alt_contact?: string
  photo_url?: string
  gender?: string
  dob?: string
  blood_group?: string
  addr_permanent?: string
  addr_correspondence?: string
  emergency_contact?: string
  experience_years?: number
  previous_institutes?: string
  skills?: string
  joining_date?: string
  contract_type?: string
  assigned_course_ids?: string[]
  assigned_batch_ids?: string[]
  created_at?: string
  updated_at?: string
}

export type Student = {
  id: string
  name: string
  email?: string
  phone?: string
  qualification?: string
  course_id?: string
  course_name?: string
  batch_id?: string
  batch_number?: string
  aadhaar_number?: string
  pan_number?: string
  submitted_at?: string
  status?: "Active" | "Completed" | "Admitted" | "Pending" | "Alumni" | "Dropped"
  photo_url?: string
  gender?: string
  dob?: string
  blood_group?: string
  address_permanent?: string
  address_correspondence?: string
  guardian_name?: string
  guardian_contact?: string
  emergency_contact?: string
  alt_contact?: string
  experience_years?: number
  previous_institutes?: string
  skills?: string
  join_date?: string
  contract_type?: string
  notes?: Array<{ id: string; text: string; ts: number }>
  created_at?: string
  updated_at?: string
}

export type Attendance = {
  id: string
  type: "student" | "teacher"
  person_id: string
  person_name: string
  date: string
  check_in?: string
  check_out?: string
  status: "Present" | "Absent" | "On Leave"
  notes?: string
  batch_id?: string
  course_id?: string
  created_at?: string
  updated_at?: string
}

export type TestResult = {
  id: string
  lead_id?: string
  name: string
  email?: string
  phone?: string
  course?: string
  exam?: string
  score?: number
  submitted_at?: string
  created_at?: string
}

export type Exam = {
  id: string
  title: string
  type: "Entrance" | "Main" | "Internal Assessment"
  course_id?: string
  batch_id?: string
  form_link: string
  sheet_link?: string
  total_marks?: number
  passing_marks?: number
  duration_minutes?: number
  created_by?: string
  status?: "Active" | "Inactive"
  created_at?: string
  updated_at?: string
}

export type Certificate = {
  id: string
  student_id: string
  course_id: string
  batch_id: string
  certificate_number?: string
  issued_date?: string
  status?: "Pending" | "Issued" | "Revoked"
  created_at?: string
}
