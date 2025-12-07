-- Migration: Create team_templates table
-- This table stores reusable team member configurations for projects

-- Create the team_templates table
CREATE TABLE IF NOT EXISTS team_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_templates_name ON team_templates(name);

-- Add index on created_by for user-specific queries
CREATE INDEX IF NOT EXISTS idx_team_templates_created_by ON team_templates(created_by);

-- Add RLS (Row Level Security) policies
ALTER TABLE team_templates ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view all templates
CREATE POLICY "Anyone can view team templates"
  ON team_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create templates
CREATE POLICY "Authenticated users can create templates"
  ON team_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Users can update templates they created
CREATE POLICY "Users can update their own templates"
  ON team_templates
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policy: Users can delete templates they created
CREATE POLICY "Users can delete their own templates"
  ON team_templates
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Add comment to the table
COMMENT ON TABLE team_templates IS 'Stores reusable team member configurations for projects';
COMMENT ON COLUMN team_templates.members IS 'JSONB array of team members: [{user_id: UUID, role: TEXT}]';
