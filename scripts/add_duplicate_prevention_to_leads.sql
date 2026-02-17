-- Add unique constraint to prevent duplicate leads with same email and phone
-- This ensures that no two records can have the same combination of email and phone

-- First, let's clean up any existing duplicates (keeping the most recent one)
DELETE FROM leads 
WHERE id NOT IN (
    SELECT DISTINCT ON (email, phone) id 
    FROM leads 
    ORDER BY email, phone, created_at DESC
);

-- Now add the unique constraint to prevent future duplicates
ALTER TABLE leads 
ADD CONSTRAINT unique_email_phone_combination UNIQUE (email, phone);

-- Also create a composite index for better performance on the unique constraint
CREATE INDEX idx_leads_email_phone ON leads(email, phone);