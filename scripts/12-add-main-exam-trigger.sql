-- Trigger to automatically update leads table with final_score when main_exam_results are inserted
-- This ensures final_score is updated in leads table even when inserts bypass the webhook

-- Create function to update leads table on main exam result insert
CREATE OR REPLACE FUNCTION update_lead_final_score_on_exam_insert()
RETURNS TRIGGER AS $$
DECLARE
  lead_id_var UUID;
BEGIN
  -- Find the lead by email or phone
  SELECT id INTO lead_id_var FROM leads
  WHERE 
    (email = NEW.email AND NEW.email IS NOT NULL)
    OR (phone = NEW.phone AND NEW.phone IS NOT NULL)
  LIMIT 1;
  
  -- Update the lead's final_score
  IF lead_id_var IS NOT NULL THEN
    UPDATE leads
    SET 
      final_score = NEW.score,
      updated_at = NOW()
    WHERE id = lead_id_var;
    
    -- Link the exam result to the lead
    UPDATE main_exam_results
    SET lead_id = lead_id_var
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on main_exam_results table
DROP TRIGGER IF EXISTS main_exam_results_update_lead_trigger ON main_exam_results;
CREATE TRIGGER main_exam_results_update_lead_trigger
AFTER INSERT ON main_exam_results
FOR EACH ROW
EXECUTE FUNCTION update_lead_final_score_on_exam_insert();

-- Similarly, create trigger for entrance_exam_results to update entrance_score
CREATE OR REPLACE FUNCTION update_lead_entrance_score_on_exam_insert()
RETURNS TRIGGER AS $$
DECLARE
  lead_id_var UUID;
BEGIN
  -- Find the lead by email or phone
  SELECT id INTO lead_id_var FROM leads
  WHERE 
    (email = NEW.email AND NEW.email IS NOT NULL)
    OR (phone = NEW.phone AND NEW.phone IS NOT NULL)
  LIMIT 1;
  
  -- Update the lead's entrance_score
  IF lead_id_var IS NOT NULL THEN
    UPDATE leads
    SET 
      entrance_score = NEW.score,
      updated_at = NOW()
    WHERE id = lead_id_var;
    
    -- Link the exam result to the lead
    UPDATE entrance_exam_results
    SET lead_id = lead_id_var
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on entrance_exam_results table
DROP TRIGGER IF EXISTS entrance_exam_results_update_lead_trigger ON entrance_exam_results;
CREATE TRIGGER entrance_exam_results_update_lead_trigger
AFTER INSERT ON entrance_exam_results
FOR EACH ROW
EXECUTE FUNCTION update_lead_entrance_score_on_exam_insert();
