# Supabase Integration Checklist

## ✅ Completed
- [x] Create Supabase Tables & Schema
- [x] Setup Supabase Client & Utilities
- [x] Connect Leads/Enquiries to Supabase
- [x] Create custom hooks for all entities
- [x] Create extended operations for complex queries

## 📋 Remaining Page Updates

### Students & Documents
- [ ] Update `app/(app)/documents/page.tsx` to use `useSupabaseStudents` hook
- [ ] Update `app/(app)/documents/[recordId]/page.tsx` to fetch from Supabase
- [ ] Connect file uploads to Supabase Storage
- [ ] Update student record creation to use Supabase

### Courses & Batches
- [ ] Update `app/(app)/courses/page.tsx` to use `useSuperbaseCourses` hook
- [ ] Update `app/(app)/batches/page.tsx` to use `useSuperbaseBatches` hook
- [ ] Connect module assignments to batch_module_assignments table
- [ ] Update batch creation to sync with Supabase

### Teachers
- [ ] Update `app/(app)/teachers/page.tsx` to use `useSupabaseTeachers` hook
- [ ] Update `app/(app)/teachers/[teacherId]/page.tsx` to fetch documents and notes
- [ ] Connect teacher document uploads to Supabase Storage
- [ ] Update teacher profile to sync changes

### Attendance
- [ ] Update `app/(app)/attendance/page.tsx` to use `useSupabaseAttendance` hook
- [ ] Implement bulk mark attendance functionality
- [ ] Connect date picker to filter attendance records
- [ ] Update attendance status changes to sync with Supabase

### Dashboard & Reports
- [ ] Update `app/(app)/page.tsx` KPI cards to calculate from Supabase
- [ ] Update charts to fetch aggregated data from Supabase
- [ ] Connect follow-ups due today from leads table
- [ ] Generate reports from Supabase data

### Test Results & Exams
- [ ] Update `app/(app)/test-results/page.tsx` to fetch from test_results table
- [ ] Update `app/(app)/exam-master/page.tsx` to fetch from exams table
- [ ] Connect form submissions to create test results
- [ ] Auto-update lead status based on test results

## 🔧 Configuration Steps

1. **Run SQL Migration**
   ```bash
   # Execute scripts/01-create-tables.sql in Supabase SQL editor
   ```

2. **Add Environment Variables**
   - All environment variables are already configured in the project

3. **Test Real-time Sync**
   - Open app in multiple tabs
   - Make changes in one tab
   - Verify changes appear in other tabs

4. **Migrate Existing Data**
   - Export localStorage data
   - Import into Supabase tables
   - Verify data integrity

## 📚 Hook Usage Examples

### Leads
```typescript
const { leads, loading, error } = useSupabaseLeads()
```

### Courses
```typescript
const { courses, loading, error } = useSuperbaseCourses()
```

### Batches
```typescript
const { batches, loading, error } = useSuperbaseBatches()
```

### Teachers
```typescript
const { teachers, loading, error } = useSupabaseTeachers()
```

### Students
```typescript
const { students, loading, error } = useSupabaseStudents()
```

### Attendance
```typescript
const { attendance, loading, error } = useSupabaseAttendance(date)
```

### Documents
```typescript
const { documents, loading, error } = useSupabaseDocuments(studentId)
```

## 🚀 Next Steps

1. Complete page updates using provided hooks
2. Test each page with Supabase data
3. Verify real-time sync across tabs
4. Migrate existing localStorage data
5. Deploy to production
