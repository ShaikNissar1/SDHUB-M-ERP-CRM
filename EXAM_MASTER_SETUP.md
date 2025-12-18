# Exam Master Setup Guide - Universal Google Forms Integration

## Overview

This guide explains how to set up the universal Exam Master system for Main Exams and Internal Exams. The Entrance Exam logic remains unchanged.

## Architecture

```
Google Form → Google Sheet → Apps Script → Supabase exam_responses → ERP Dashboard
```

## Step-by-Step Setup

### 1. Create Exam in ERP

1. Go to **Exam Master** page
2. Click **+ Add Exam**
3. Fill in:
   - **Exam Title**: Name of your exam
   - **Exam Type**: Main Exam or Internal Exam
   - **Course**: Select course (optional)
   - **Google Form URL**: Paste your Google Form link
   - **Google Sheet URL**: Paste the linked response sheet link
4. Click **Create Exam**
5. You'll receive an **exam_id** - copy this

### 2. Set Up Google Sheet

1. Open your Google Sheet (linked to the form)
2. Scroll right to find column **Z**
3. Click on cell **Z1**
4. Paste the exam_id you received
5. Press Enter

### 3. Deploy Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code
3. Copy the entire **universal-apps-script.gs** code
4. Paste it into the Apps Script editor
5. Click **Save**

### 4. Create Trigger

1. Click the **Triggers** icon (clock) on the left sidebar
2. Click **Create new trigger**
3. Configure:
   - **Function**: `onFormSubmit`
   - **Deployment**: Head
   - **Event source**: From form
   - **Event type**: On form submit
   - **Failure notification**: Notify me daily
4. Click **Save**
5. Grant permissions when prompted

### 5. Test Submission

1. Open your Google Form
2. Submit a test response
3. Wait 5-10 seconds
4. Check **Supabase** → **exam_responses** table
5. You should see your test response

## Column Mapping

Your Google Form columns must be in this order:

| Column | Field | Example |
|--------|-------|---------|
| A | Timestamp | Auto (Google Forms) |
| B | Name | John Doe |
| C | Email | john@example.com |
| D | Phone | 9876543210 |
| E | Course | Fullstack |
| F | Score | 85 |
| G | Exam Type | Main |
| Z | Exam ID | (hidden) |

If your columns are different, edit the `COLUMN_MAPPING` in the Apps Script.

## Troubleshooting

### Data not appearing in Supabase

1. Check Apps Script execution logs:
   - Go to **Extensions > Apps Script**
   - Click **Execution log** (View menu)
   - Look for errors

2. Verify exam_id in Z1:
   - Make sure cell Z1 contains the exam_id
   - No spaces or extra characters

3. Check trigger:
   - Go to **Triggers** (clock icon)
   - Verify `onFormSubmit` trigger exists
   - Check "Event type" is "On form submit"

### Invalid URL Error

- Make sure you're using the full Google Form URL: `https://forms.google.com/forms/d/{formId}/viewform`
- Make sure you're using the full Google Sheet URL: `https://docs.google.com/spreadsheets/d/{sheetId}/edit`

### Permission Denied

- When creating the trigger, you must grant permissions
- Click "Review permissions" and select your Google account
- Click "Allow"

## Dashboard Features

Once set up, you can:

- **View Submissions**: See all responses in real-time
- **Filter by Course**: Filter responses by course
- **Export Data**: Download responses as CSV
- **Link to Leads**: Automatically link responses to enquiries
- **View Analytics**: See submission counts and statistics

## Security Notes

- The Apps Script uses your Supabase API key (read-only)
- All data is validated before insertion
- Only form submissions trigger the script
- Students cannot edit responses after submission

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Apps Script execution logs
3. Verify all URLs are correct
4. Ensure exam_id is in cell Z1
