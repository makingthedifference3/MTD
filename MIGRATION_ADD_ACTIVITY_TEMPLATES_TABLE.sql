-- Create activity_templates table for saving reusable activity templates

CREATE TABLE IF NOT EXISTS public.activity_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_activity_templates_created_by ON public.activity_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_activity_templates_created_at ON public.activity_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_templates_name ON public.activity_templates(name);

-- Add comments
COMMENT ON TABLE public.activity_templates IS 'Stores reusable activity templates for projects';
COMMENT ON COLUMN public.activity_templates.activities IS 'JSONB array of activity objects with title, description, priority, items, etc.';

-- Enable RLS
ALTER TABLE public.activity_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow authenticated users to read all templates
CREATE POLICY "Allow authenticated users to read activity templates"
  ON public.activity_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create templates
CREATE POLICY "Allow authenticated users to create activity templates"
  ON public.activity_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own templates
CREATE POLICY "Allow users to update their own activity templates"
  ON public.activity_templates
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Allow users to delete their own templates
CREATE POLICY "Allow users to delete their own activity templates"
  ON public.activity_templates
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_templates TO authenticated;
GRANT SELECT ON public.activity_templates TO anon;
