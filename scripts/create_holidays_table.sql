-- Create holidays table
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'Institute' CHECK (type IN ('Institute', 'Batch', 'Public')),
  batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to holidays" ON holidays
  FOR ALL USING (true);

-- Insert some common holidays for testing
INSERT INTO holidays (date, name, type) VALUES
  ('2025-01-01', 'New Year''s Day', 'Public'),
  ('2025-01-26', 'Republic Day', 'Public'),
  ('2025-08-15', 'Independence Day', 'Public'),
  ('2025-10-02', 'Gandhi Jayanti', 'Public'),
  ('2025-12-25', 'Christmas Day', 'Public')
ON CONFLICT (date) DO NOTHING;
