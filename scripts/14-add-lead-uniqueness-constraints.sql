-- Add unique constraints to prevent lead duplicates
-- This script adds database-level constraints to ensure duplicates cannot be inserted

-- First, clean up any existing duplicates(keep the first one by created_at)
DELETE FROM leads l1
WHERE l1.id NOT IN (
  SELECT MIN(l2.id)
  FROM leads l2
  WHERE (l1.email = l2.email AND l1.email != '')
    OR (l1.phone = l2.phone AND l1.phone != '')
  GROUP BY COALESCE(l2.email, ''), COALESCE(l2.phone, '')
);

-- Add unique constraint on email (for non-empty emails)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_email_unique 
ON leads(email) 
WHERE email IS NOT NULL AND email != '';

-- Add unique constraint on phone (for non-empty phones)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_phone_unique 
ON leads(phone) 
WHERE phone IS NOT NULL AND phone != '';

-- Add index for faster lookups by email or phone
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_email_phone 
ON leads(email, phone);

-- Log the constraint additions
SELECT 'Uniqueness constraints added to leads table' as message;
