# Google Form to Supabase Integration Guide

## Overview
This guide explains how to automatically save Google Form submissions to your Supabase leads table, which will then appear in the enquiries page.

## Step 1: Deploy the Webhook

1. Your webhook is already created at: `/api/webhooks/google-form`
2. Deploy your Next.js app to Vercel
3. Your webhook URL will be: `https://your-domain.vercel.app/api/webhooks/google-form`

## Step 2: Set Up Google Apps Script

1. Open your Google Sheet connected to your Google Form
2. Go to **Extensions > Apps Script**
3. Delete any existing code
4. Copy the entire code from `scripts/google-form-integration.gs`
5. Replace `YOUR_WEBHOOK_URL_HERE` with your actual webhook URL
6. Click **Save**

## Step 3: Set Up Form Submission Trigger

1. In the Apps Script editor, click the **Triggers** icon (clock icon on left)
2. Click **Create new trigger**
3. Configure as follows:
   - Function: `onFormSubmit`
   - Deployment: Head
   - Event source: From form
   - Event type: On form submit
   - Failure notification: Notify me daily
4. Click **Create**
5. Grant permissions when prompted

## Step 4: Test the Integration

### Option A: Test via Apps Script
1. In Apps Script, click **Run** next to the `testWebhook()` function
2. Check the execution logs to see if it worked
3. Check your Supabase dashboard to see if a test lead was created

### Option B: Test via Google Form
1. Submit a test response through your Google Form
2. Wait a few seconds
3. Go to your enquiries page - the new lead should appear!

## Field Mapping

Your Google Form fields are mapped to Supabase as follows:

| Google Form Field | Supabase Field |
|---|---|
| Full Name | name |
| Email | email |
| Contact | phone |
| Course Interested | course |
| Education Qualification | qualification |
| How did you hear about us? | source |
| Age, Gender, Residence Area | remarks |

## Troubleshooting

### Webhook not receiving data
- Check that your webhook URL is correct in the Apps Script
- Verify the URL is accessible (test in browser)
- Check Supabase logs for any errors

### Data not appearing in enquiries page
- Refresh the page
- Check Supabase dashboard directly to see if data was saved
- Check browser console for any errors

### Apps Script errors
- Check the execution logs in Apps Script (View > Execution log)
- Verify all field names match your Google Form exactly
- Make sure the trigger is set up correctly

## Environment Variables Required

Make sure these are set in your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)

## Security Notes

- The webhook accepts POST requests from anywhere (consider adding authentication)
- The service role key is used server-side only
- All data is validated before insertion
- Consider adding rate limiting for production
