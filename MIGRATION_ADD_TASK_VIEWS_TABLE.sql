-- Migration: Add task_views table to track which users have seen which tasks
-- This ensures notification persistence across devices and browser sessions

-- Create task_views table
CREATE TABLE IF NOT EXISTS public.task_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id) -- Prevent duplicate entries
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_views_user_id ON public.task_views(user_id);
CREATE INDEX IF NOT EXISTS idx_task_views_task_id ON public.task_views(task_id);

-- Enable RLS
ALTER TABLE public.task_views ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view and manage their own task views
CREATE POLICY "Users can view their own task views"
  ON public.task_views
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own task views"
  ON public.task_views
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own task views"
  ON public.task_views
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- Service role bypass (for backend operations)
CREATE POLICY "Service role can manage all task views"
  ON public.task_views
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Grant permissions
GRANT ALL ON public.task_views TO authenticated;
GRANT ALL ON public.task_views TO anon;
GRANT ALL ON public.task_views TO service_role;

-- Add comments
COMMENT ON TABLE public.task_views IS 'Tracks which users have viewed which tasks for notification management';
COMMENT ON COLUMN public.task_views.user_id IS 'ID of the user who viewed the task';
COMMENT ON COLUMN public.task_views.task_id IS 'ID of the task that was viewed';
COMMENT ON COLUMN public.task_views.viewed_at IS 'Timestamp when the task was viewed';
