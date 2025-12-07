-- Migration: Add receipt_views table to track which users have seen which receipts
-- This ensures notification persistence across devices and browser sessions

-- Create receipt_views table
CREATE TABLE IF NOT EXISTS public.receipt_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  expense_id UUID NOT NULL REFERENCES public.project_expenses(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, expense_id) -- Prevent duplicate entries
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_receipt_views_user_id ON public.receipt_views(user_id);
CREATE INDEX IF NOT EXISTS idx_receipt_views_expense_id ON public.receipt_views(expense_id);

-- Enable RLS
ALTER TABLE public.receipt_views ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view and manage their own receipt views
CREATE POLICY "Users can view their own receipt views"
  ON public.receipt_views
  FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert their own receipt views"
  ON public.receipt_views
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own receipt views"
  ON public.receipt_views
  FOR DELETE
  USING (user_id = auth.uid()::text);

-- Service role bypass (for backend operations)
CREATE POLICY "Service role can manage all receipt views"
  ON public.receipt_views
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Grant permissions
GRANT ALL ON public.receipt_views TO authenticated;
GRANT ALL ON public.receipt_views TO anon;
GRANT ALL ON public.receipt_views TO service_role;

-- Add comments
COMMENT ON TABLE public.receipt_views IS 'Tracks which users have viewed which paid expense receipts for notification management';
COMMENT ON COLUMN public.receipt_views.user_id IS 'ID of the user who viewed the receipt';
COMMENT ON COLUMN public.receipt_views.expense_id IS 'ID of the expense whose receipt was viewed';
COMMENT ON COLUMN public.receipt_views.viewed_at IS 'Timestamp when the receipt was viewed';
