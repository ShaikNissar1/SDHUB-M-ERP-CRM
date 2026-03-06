# Database Migration Execution Guide

## 📋 Overview
This guide walks you through executing the database migration that adds call tracking fields to the `leads` table. These fields enable the new "Log Call" functionality in the enquiries management system.

## 🔍 What This Migration Does

The migration script `scripts/15-add-call-tracking-fields.sql` performs the following operations:

### New Columns Added to `leads` table:
1. **`call_attempts`** (INTEGER)
   - Tracks how many times a lead has been called
   - Default value: 0
   - Used to display call count in table and highlight leads with 3+ calls in red

2. **`last_call_at`** (TIMESTAMP WITH TIME ZONE)
   - Records when the last call was made to this lead
   - Default value: NULL
   - Used for historical tracking and reporting

### Performance Indices Created:
- `idx_leads_call_attempts` - Optimizes filtering by call attempts
- `idx_leads_last_call_at` - Optimizes sorting/filtering by last call time
- `idx_leads_next_follow_up_date` - Improves performance for follow-up date queries

## ✅ Pre-Migration Checklist

Before running the migration, verify:

- [ ] You have Supabase admin/editor access to your project
- [ ] You have a backup of your database (Supabase provides automatic backups)
- [ ] No other migrations are running
- [ ] The application is in a non-critical time window (fewer users)
- [ ] You have the migration script content ready

## 🚀 Step-by-Step Execution

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New Query" button

3. **Paste Migration Script**
   - Copy the entire contents of `scripts/15-add-call-tracking-fields.sql`
   - Paste into the query editor

4. **Execute the Migration**
   - Click the "RUN" button (blue play icon)
   - Wait for completion (should take < 5 seconds)

5. **Verify Success**
   - Look for green success message
   - Check that all 5 operations completed:
     - `ALTER TABLE` for `call_attempts`
     - `ALTER TABLE` for `last_call_at`
     - `CREATE INDEX` for call_attempts
     - `CREATE INDEX` for last_call_at
     - `CREATE INDEX` for next_follow_up_date

### Option 2: Using psql (Advanced)

If you have PostgreSQL client installed:

```bash
# Get connection string from Supabase dashboard
# Project Settings → Database → Connection strings → URI

psql "your-connection-string-here" < scripts/15-add-call-tracking-fields.sql
```

## 🔧 Migration Script Content

The script contains:

```sql
BEGIN;

-- Add call_attempts column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS call_attempts INTEGER DEFAULT 0;

-- Add last_call_at column
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS last_call_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create performance indices
CREATE INDEX IF NOT EXISTS idx_leads_call_attempts ON leads(call_attempts);
CREATE INDEX IF NOT EXISTS idx_leads_last_call_at ON leads(last_call_at);
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up_date ON leads(next_follow_up_date);

-- Add column documentation
COMMENT ON COLUMN leads.call_attempts IS 'Number of times this lead has been called';
COMMENT ON COLUMN leads.last_call_at IS 'Timestamp of the last call made to this lead';

COMMIT;
```

## ⚠️ Troubleshooting

### Issue: "Relation 'leads' does not exist"
**Cause:** You're connected to the wrong database
**Solution:** Verify you're in the correct Supabase project

### Issue: "Column already exists"
**Cause:** Migration was already run
**Solution:** This is safe - the script uses `IF NOT EXISTS` clauses, so it won't cause errors

### Issue: "Permission denied"
**Cause:** User role doesn't have ALTER TABLE permissions
**Solution:** Use a higher-privilege role (project owner or admin)

### Issue: Generic error after migration
**Cause:** Script may have partially failed
**Solution:** 
1. Check Supabase activity logs for detailed error
2. Manually verify columns exist:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'leads' 
   AND column_name IN ('call_attempts', 'last_call_at');
   ```

## 📊 Post-Migration Verification

After successful execution, verify the migration in Supabase:

1. **Check Columns**
   - Go to Table Editor
   - Click on "leads" table
   - Verify `call_attempts` and `last_call_at` columns exist
   - Check their data types and defaults

2. **Check Indices**
   - Go to "Database" → "Indices"
   - Search for `idx_leads_`
   - Verify all 3 new indices are listed

3. **Test Application**
   - Open the enquiries page
   - Click "⚙ More" on any lead
   - Select "Log Call"
   - Fill in call outcome and follow-up date
   - Click "Save Call"
   - **Expected:** No error message, call count increments, status changes to "Contacted"

## 🔙 Rollback Plan

If issues occur, you can rollback:

```sql
BEGIN;

ALTER TABLE leads DROP COLUMN IF EXISTS call_attempts;
ALTER TABLE leads DROP COLUMN IF EXISTS last_call_at;
DROP INDEX IF EXISTS idx_leads_call_attempts;
DROP INDEX IF EXISTS idx_leads_last_call_at;
DROP INDEX IF EXISTS idx_leads_next_follow_up_date;

COMMIT;
```

**Note:** Only do this if the migration causes critical issues. Contact support if unsure.

## 📝 Related Files

- **Migration Script:** `scripts/15-add-call-tracking-fields.sql`
- **Frontend Component:** `components/tables/leads-table.tsx` (Log Call modal uses these fields)
- **Hook:** `hooks/use-supabase-leads.ts` (Fetches leads with new fields)

## ✨ Next Steps

After migration execution completes:

1. ✅ Verify columns were created successfully
2. ✅ Test "Log Call" functionality in the enquiries page
3. ✅ Check that call counts display correctly
4. ✅ Verify follow-up date highlighting works
5. ✅ Monitor error logs for any issues

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Supabase activity logs for detailed error messages
3. Verify database connection and permissions
4. Check application console for any JavaScript errors

---

**Migration Status:** Ready for execution
**Last Updated:** 2024-02-20
**Estimated Execution Time:** < 5 seconds
