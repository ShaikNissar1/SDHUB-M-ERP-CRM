# Supabase Integration Guide

## Setup Instructions

### 1. Run the SQL Migration
Execute the SQL script in `scripts/01-create-tables.sql` in your Supabase SQL editor to create all tables.

### 2. Environment Variables
Add these to your Vercel project environment variables:
- `SUPABASE_NEXT_PUBLIC_SUPABASE_URL` - Your Supabase projecSUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY` - Your Supabase anonymous key

## Completed Integrations

### ✅ Leads/Enquiries
- **File**: `components/tables/leads-table.tsx`
- **Hook**: `hooks/use-supabase-leads.ts`
- **Features**: Real-time sync, add/update/delete leads, filters, search
- **Status**: CONNECTED

### ✅ Supabase Infrastructure
- **Files**: 
  - `lib/supabase/client.ts` - Browser client
  - `lib/supabase/server.ts` - Server client
  - `lib/supabase/types.ts` - TypeScript types
  - `lib/supabase/leads.ts` - Lead operations
  - `lib/supabase/courses.ts` - Course operations
  - `lib/supabase/batches.ts` - Batch operations
  - `lib/supabase/teachers.ts` - Teacher operations
  - `lib/supabase/students.ts` - Student operations
  - `lib/supabase/attendance.ts` - Attendance operations
  - `lib/supabase/test-results.ts` - Test results operations
  - `lib/supabase/exams.ts` - Exam operations

## Remaining Integrations

### 📋 Students & Documents
**Pages to update**:
- `app/(app)/documents/page.tsx` - Main documents page
- `app/(app)/documents/[recordId]/page.tsx` - Document detail page
- `app/(app)/students/page.tsx` - Students list

**Steps**:
1. Create `hooks/use-supabase-students.ts` hook (already created)
2. Update documents page to fetch from `students` table
3. Update student records to use Supabase instead of localStorage
4. Connect file uploads to Supabase Storage

### 📚 Courses & Batches
**Pages to update**:
- `app/(app)/courses/page.tsx` - Courses management
- `app/(app)/batches/page.tsx` - Batches management
- `app/(app)/batches/[batchId]/page.tsx` - Batch details

**Steps**:
1. Create `hooks/use-supabase-courses.ts` hook (already created)
2. Create `hooks/use-supabase-batches.ts` hook (already created)
3. Update courses page to fetch from `courses` table
4. Update batches page to fetch from `batches` table
5. Connect module assignments to `batch_module_assignments` table

### 👨‍🏫 Teachers
**Pages to update**:
- `app/(app)/teachers/page.tsx` - Teachers list
- `app/(app)/teachers/[teacherId]/page.tsx` - Teacher profile

**Steps**:
1. Create `hooks/use-supabase-teachers.ts` hook (already created)
2. Update teachers page to fetch from `teachers` table
3. Update teacher profile to show documents and notes
4. Connect teacher documents to Supabase Storage

### 📍 Attendance
**Pages to update**:
- `app/(app)/attendance/page.tsx` - Attendance marking
- `app/(app)/attendance/student/[id]/page.tsx` - Student attendance
- `app/(app)/attendance/teacher/[id]/page.tsx` - Teacher attendance

**Steps**:
1. Create `hooks/use-supabase-attendance.ts` hook (already created)
2. Update attendance page to fetch/save from `attendance` table
3. Connect date picker to filter attendance records
4. Implement bulk mark attendance functionality

### 📊 Dashboard & Reports
**Pages to update**:
- `app/(app)/page.tsx` - Main dashboard
- `app/(app)/reports/page.tsx` - Reports page

**Steps**:
1. Update KPI cards to calculate from Supabase data
2. Update charts to fetch from Supabase
3. Connect follow-ups due today from leads table
4. Generate reports from aggregated data

### 📝 Test Results & Exams
**Pages to update**:
- `app/(app)/test-results/page.tsx` - Test results
- `app/(app)/exam-master/page.tsx` - Exam management

**Steps**:
1. Update test results page to fetch from `test_results` table
2. Update exam master to fetch from `exams` table
3. Connect form submissions to create test results
4. Auto-update lead status based on test results

## Data Migration

To migrate existing localStorage data to Supabase:

1. **Leads**: Use the leads import script
2. **Students**: Use the students import script
3. **Courses**: Use the courses import script
4. **Batches**: Use the batches import script
5. **Teachers**: Use the teachers import script

## Real-Time Features

All hooks support real-time updates via Supabase subscriptions:
- Changes made in one browser tab appear instantly in others
- New records appear immediately
- Deletions are reflected in real-time

## Error Handling

All Supabase operations include error logging:
- Check browser console for detailed error messages
- Errors are caught and logged without breaking the UI
- Fallback to empty data if fetch fails

## Next Steps

1. Run the SQL migration script
2. Add environment variables to Vercel
3. Update remaining pages using the provided hooks
4. Test real-time sync across multiple tabs
5. Migrate existing localStorage data to Supabase
