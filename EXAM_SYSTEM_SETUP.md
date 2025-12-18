# Exam Management System Setup Guide

## Overview
The exam management system supports three types of exams with separate database tables:
- **Entrance Exam** - For admission/entrance testing
- **Main Exam** - For course completion assessment
- **Internal Exam** - For internal/periodic assessments

## Database Tables

### 1. Entrance Exam Results Table
```sql
entrance_exam_results
├── id (UUID, Primary Key)
├── lead_id (UUID, Foreign Key → leads)
├── name (TEXT)
├── email (TEXT)
├── phone (TEXT)
├── score (NUMERIC)
├── total_marks (INTEGER, default: 100)
├── passing_marks (INTEGER, default: 40)
├── status (TEXT: pending, passed, failed)
├── submitted_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

### 2. Main Exam Results Table
```sql
main_exam_results
├── id (UUID, Primary Key)
├── exam_id (UUID, Foreign Key → exams)
├── student_id (UUID, Foreign Key → students)
├── batch_id (TEXT, Foreign Key → batches)
├── course_id (UUID, Foreign Key → courses)
├── name (TEXT)
├── email (TEXT)
├── phone (TEXT)
├── score (NUMERIC)
├── total_marks (INTEGER, default: 100)
├── passing_marks (INTEGER, default: 40)
├── status (TEXT: pending, passed, failed)
├── submitted_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

### 3. Internal Exam Results Table
```sql
internal_exam_results
├── id (UUID, Primary Key)
├── exam_id (UUID, Foreign Key → exams)
├── student_id (UUID, Foreign Key → students)
├── batch_id (TEXT, Foreign Key → batches)
├── course_id (UUID, Foreign Key → courses)
├── name (TEXT)
├── email (TEXT)
├── phone (TEXT)
├── score (NUMERIC)
├── total_marks (INTEGER, default: 100)
├── passing_marks (INTEGER, default: 40)
├── status (TEXT: pending, passed, failed)
├── submitted_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

## Setup Instructions

### Step 1: Run SQL Migration
Execute the SQL script `scripts/03-create-exam-tables.sql` in your Supabase dashboard to create the tables.

### Step 2: Create Exams
1. Go to **Exam Master** page
2. Click **Create Exam** button
3. Select exam type (Entrance, Main, or Internal)
4. Fill in exam details:
   - Exam Title
   - Course (optional)
   - Google Form URL
   - Google Sheet URL
5. Click **Create Exam**

### Step 3: Setup Google Form Integration
1. After creating an exam, you'll receive an `exam_id`
2. Open your Google Sheet linked to the form
3. Paste the `exam_id` in cell **Z1**
4. The Google Apps Script will automatically sync submissions to the database

### Step 4: View Results
1. Go to **Exam Master** page
2. Find your exam in the list
3. Click **Results** button to view all submissions
4. Results are automatically categorized by exam type

## Google Apps Script Setup

The system uses Google Apps Script to automatically sync form submissions to Supabase.

### For Entrance Exams:
- Inserts data into `entrance_exam_results` table
- Links to leads (not students)
- Tracks admission test scores

### For Main Exams:
- Inserts data into `main_exam_results` table
- Links to students and batches
- Tracks course completion scores

### For Internal Exams:
- Inserts data into `internal_exam_results` table
- Links to students and batches
- Tracks periodic assessment scores

## API Endpoints

### Create Exam
```
POST /api/exam-master/create
Body: {
  exam_title: string
  course_id: string | null
  google_form_url: string
  google_sheet_url: string
  exam_type: "entrance_exam" | "main_exam" | "internal_exam"
}
```

### Fetch Results
```
GET /api/exam-master/responses?exam_id={examId}&exam_type={type}
```

## Library Functions

### Entrance Exam Results
```typescript
getEntranceExamResults() // Get all entrance exam results
getEntranceExamResultsByLead(leadId) // Get results for specific lead
createEntranceExamResult(result) // Create new result
```

### Main Exam Results
```typescript
getMainExamResults(examId) // Get results for specific exam
getMainExamResultsByBatch(batchId) // Get results for specific batch
createMainExamResult(result) // Create new result
```

### Internal Exam Results
```typescript
getInternalExamResults(examId) // Get results for specific exam
getInternalExamResultsByBatch(batchId) // Get results for specific batch
createInternalExamResult(result) // Create new result
```

## Features

✅ Separate tables for each exam type
✅ Real-time Google Form integration
✅ Automatic result syncing
✅ Pass/Fail status tracking
✅ Score percentage calculation
✅ Batch and course filtering
✅ Lead and student linking
✅ Comprehensive results dashboard

## Troubleshooting

### Results not appearing?
1. Check if exam_id is in cell Z1 of Google Sheet
2. Verify Google Apps Script is running
3. Check Supabase RLS policies are allowing inserts
4. Review browser console for errors

### Wrong exam type?
1. Ensure you selected correct exam type when creating
2. Results are filtered by exam type automatically
3. Check the exam type badge on the exam card

### Missing data?
1. Verify all required fields are in the Google Form
2. Check that form responses are being recorded
3. Ensure Google Sheet is properly linked to form
