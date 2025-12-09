-- Migration: Enhance real_time_updates table for new form fields
-- Date: 2025-12-09
-- Purpose: Add additional fields to support the updates folder form structure

-- 1. Make pdf_url nullable (it will be generated later)
ALTER TABLE public.real_time_updates 
ALTER COLUMN pdf_url DROP NOT NULL;

-- 2. Make csr_partner_id nullable (allow updates without specific partner)
ALTER TABLE public.real_time_updates 
ALTER COLUMN csr_partner_id DROP NOT NULL;

-- 3. Add new fields for enhanced functionality
ALTER TABLE public.real_time_updates 
ADD COLUMN IF NOT EXISTS update_code character varying UNIQUE,
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS update_type character varying DEFAULT 'Progress' CHECK (update_type IN ('Progress', 'Issue', 'Achievement', 'Milestone')),
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_sent_to_client boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- 4. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_real_time_updates_project_id ON public.real_time_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_real_time_updates_csr_partner_id ON public.real_time_updates(csr_partner_id);
CREATE INDEX IF NOT EXISTS idx_real_time_updates_update_code ON public.real_time_updates(update_code);
CREATE INDEX IF NOT EXISTS idx_real_time_updates_created_at ON public.real_time_updates(created_at DESC);

-- 5. Add RLS policies for security (if not already exists)
ALTER TABLE public.real_time_updates ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read public updates
DROP POLICY IF EXISTS "Allow read public updates" ON public.real_time_updates;
CREATE POLICY "Allow read public updates" ON public.real_time_updates
  FOR SELECT
  USING (is_public = true OR auth.role() = 'authenticated');

-- Policy: Allow authenticated users to insert updates
DROP POLICY IF EXISTS "Allow insert updates" ON public.real_time_updates;
CREATE POLICY "Allow insert updates" ON public.real_time_updates
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow users to update their own updates
DROP POLICY IF EXISTS "Allow update own updates" ON public.real_time_updates;
CREATE POLICY "Allow update own updates" ON public.real_time_updates
  FOR UPDATE
  USING (created_by = auth.uid() OR auth.role() = 'service_role');

-- Policy: Allow users to delete their own updates
DROP POLICY IF EXISTS "Allow delete own updates" ON public.real_time_updates;
CREATE POLICY "Allow delete own updates" ON public.real_time_updates
  FOR DELETE
  USING (created_by = auth.uid() OR auth.role() = 'service_role');

-- 6. Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_real_time_updates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_real_time_updates_updated_at ON public.real_time_updates;
CREATE TRIGGER trigger_update_real_time_updates_updated_at
  BEFORE UPDATE ON public.real_time_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_real_time_updates_updated_at();

-- 7. Update existing records to have update_code if missing
UPDATE public.real_time_updates 
SET update_code = 'UPDATE-' || UPPER(TO_HEX(EXTRACT(EPOCH FROM created_at)::INTEGER)) || '-' || SUBSTRING(MD5(id::text), 1, 6)
WHERE update_code IS NULL;

COMMENT ON TABLE public.real_time_updates IS 'Stores real-time project updates with form data, photos, and metadata';
COMMENT ON COLUMN public.real_time_updates.update_code IS 'Unique identifier code for the update';
COMMENT ON COLUMN public.real_time_updates.update_no IS 'Sequential update number (e.g., 22)';
COMMENT ON COLUMN public.real_time_updates.date IS 'Date of the update in DD/MM/YYYY format';
COMMENT ON COLUMN public.real_time_updates.location IS 'Location where update activity occurred';
COMMENT ON COLUMN public.real_time_updates.day IS 'Day of the week (e.g., Wednesday)';
COMMENT ON COLUMN public.real_time_updates.tutor IS 'Name of the tutor conducting the activity';
COMMENT ON COLUMN public.real_time_updates.filled_by IS 'Name of person who filled the update form';
COMMENT ON COLUMN public.real_time_updates.resident_count IS 'Number of residents/participants';
COMMENT ON COLUMN public.real_time_updates.residents IS 'JSONB array of resident names';
COMMENT ON COLUMN public.real_time_updates.activity IS 'Description of activities conducted';
COMMENT ON COLUMN public.real_time_updates.photos IS 'JSONB array of photo URLs';
COMMENT ON COLUMN public.real_time_updates.title IS 'Optional title for the update';
COMMENT ON COLUMN public.real_time_updates.description IS 'Optional detailed description';
COMMENT ON COLUMN public.real_time_updates.update_type IS 'Type of update: Progress, Issue, Achievement, or Milestone';
COMMENT ON COLUMN public.real_time_updates.is_public IS 'Whether the update is publicly visible';
COMMENT ON COLUMN public.real_time_updates.is_sent_to_client IS 'Whether the update has been sent to the client';
