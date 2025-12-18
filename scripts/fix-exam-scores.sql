-- Fix existing text-based scores in exam results tables
-- This script converts text scores to numeric values and links them with leads

-- 1. Fix entrance_exam_results scores
UPDATE entrance_exam_results
SET score = CAST(SUBSTRING(score::text, '^[0-9]+(\.[0-9]+)?') AS numeric)
WHERE score IS NOT NULL AND score::text ~ '^[0-9]+';

-- 2. Fix main_exam_results scores
UPDATE main_exam_results
SET score = CAST(SUBSTRING(score::text, '^[0-9]+(\.[0-9]+)?') AS numeric)
WHERE score IS NOT NULL AND score::text ~ '^[0-9]+';

-- 3. Fix internal_exam_results scores
UPDATE internal_exam_results
SET score = CAST(SUBSTRING(score::text, '^[0-9]+(\.[0-9]+)?') AS numeric)
WHERE score IS NOT NULL AND score::text ~ '^[0-9]+';

-- 4. Link entrance exam results to leads and update entrance_score
UPDATE leads
SET entrance_score = (
  SELECT MAX(entrance_exam_results.score)
  FROM entrance_exam_results
  WHERE (entrance_exam_results.email = leads.email OR entrance_exam_results.phone = leads.phone)
    AND entrance_exam_results.score IS NOT NULL
),
updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM entrance_exam_results
  WHERE (entrance_exam_results.email = leads.email OR entrance_exam_results.phone = leads.phone)
);

-- 5. Link main exam results to leads and update final_score
UPDATE leads
SET final_score = (
  SELECT MAX(main_exam_results.score)
  FROM main_exam_results
  WHERE (main_exam_results.email = leads.email OR main_exam_results.phone = leads.phone)
    AND main_exam_results.score IS NOT NULL
),
updated_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM main_exam_results
  WHERE (main_exam_results.email = leads.email OR main_exam_results.phone = leads.phone)
);

-- 6. Update lead_id in exam results tables for referential integrity
UPDATE entrance_exam_results
SET lead_id = (
  SELECT leads.id FROM leads
  WHERE (leads.email = entrance_exam_results.email OR leads.phone = entrance_exam_results.phone)
  LIMIT 1
)
WHERE lead_id IS NULL AND (email IS NOT NULL OR phone IS NOT NULL);

UPDATE main_exam_results
SET lead_id = (
  SELECT leads.id FROM leads
  WHERE (leads.email = main_exam_results.email OR leads.phone = main_exam_results.phone)
  LIMIT 1
)
WHERE lead_id IS NULL AND (email IS NOT NULL OR phone IS NOT NULL);

UPDATE internal_exam_results
SET lead_id = (
  SELECT leads.id FROM leads
  WHERE (leads.email = internal_exam_results.email OR leads.phone = internal_exam_results.phone)
  LIMIT 1
)
WHERE lead_id IS NULL AND (email IS NOT NULL OR phone IS NOT NULL);
