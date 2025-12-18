-- Fix score linking between exam results and leads table
-- Convert text scores to numeric and establish proper relationships

-- 1. Update entrance_exam_results: ensure scores are numeric and link lead_id
UPDATE entrance_exam_results
SET 
  score = CAST(TRIM(score::text) AS NUMERIC),
  lead_id = COALESCE(lead_id, (SELECT id FROM leads WHERE email = entrance_exam_results.email LIMIT 1)),
  total_marks = CASE WHEN total_marks IS NULL THEN NULL ELSE total_marks END
WHERE score IS NOT NULL OR email IS NOT NULL;

-- 2. Update main_exam_results: ensure scores are numeric and link lead_id
UPDATE main_exam_results
SET 
  score = CAST(TRIM(score::text) AS NUMERIC),
  lead_id = COALESCE(lead_id, (SELECT id FROM leads WHERE email = main_exam_results.email LIMIT 1)),
  total_marks = CASE WHEN total_marks IS NULL THEN NULL ELSE total_marks END
WHERE score IS NOT NULL OR email IS NOT NULL;

-- 3. Update internal_exam_results: ensure scores are numeric and link lead_id
UPDATE internal_exam_results
SET 
  score = CAST(TRIM(score::text) AS NUMERIC),
  lead_id = COALESCE(lead_id, (SELECT id FROM leads WHERE email = internal_exam_results.email LIMIT 1)),
  total_marks = CASE WHEN total_marks IS NULL THEN NULL ELSE total_marks END
WHERE score IS NOT NULL OR email IS NOT NULL;

-- 4. Sync scores from exam results tables to leads table
UPDATE leads
SET 
  entrance_score = (
    SELECT score FROM entrance_exam_results 
    WHERE entrance_exam_results.email = leads.email 
    OR (entrance_exam_results.phone = leads.phone AND leads.email IS NULL)
    ORDER BY entrance_exam_results.submitted_at DESC 
    LIMIT 1
  ),
  final_score = (
    SELECT score FROM main_exam_results 
    WHERE main_exam_results.email = leads.email 
    OR (main_exam_results.phone = leads.phone AND leads.email IS NULL)
    ORDER BY main_exam_results.submitted_at DESC 
    LIMIT 1
  ),
  updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM entrance_exam_results WHERE entrance_exam_results.email = leads.email
) OR EXISTS (
  SELECT 1 FROM main_exam_results WHERE main_exam_results.email = leads.email
);

-- 5. Add constraints to prevent future text storage of scores
ALTER TABLE entrance_exam_results 
  ALTER COLUMN score SET NOT NULL;

ALTER TABLE main_exam_results 
  ALTER COLUMN score SET NOT NULL;

ALTER TABLE internal_exam_results 
  ALTER COLUMN score SET NOT NULL;

-- 6. Add index on phone to speed up phone-based lookups
CREATE INDEX IF NOT EXISTS idx_entrance_exam_results_phone ON entrance_exam_results(phone);
CREATE INDEX IF NOT EXISTS idx_main_exam_results_phone ON main_exam_results(phone);
CREATE INDEX IF NOT EXISTS idx_internal_exam_results_phone ON internal_exam_results(phone);
