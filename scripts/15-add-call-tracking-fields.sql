-- Add call tracking fields to leads table
-- This migration adds fields to track call attempts and last call date

-- Add call_attempts column if it doesn't exist
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS call_attempts INTEGER DEFAULT 0;

-- Add last_call_at column if it doesn't exist
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS last_call_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create an index on call_attempts for performance
CREATE INDEX IF NOT EXISTS idx_leads_call_attempts ON leads(call_attempts);

-- Create an index on last_call_at for performance
CREATE INDEX IF NOT EXISTS idx_leads_last_call_at ON leads(last_call_at);

-- Create an index on next_follow_up_date for priority filtering
CREATE INDEX IF NOT EXISTS idx_leads_next_follow_up_date ON leads(next_follow_up_date);

-- Log the migration
COMMENT ON COLUMN leads.call_attempts IS 'Number of times the lead has been called';
COMMENT ON COLUMN leads.last_call_at IS 'Timestamp of the last call made to this lead';
