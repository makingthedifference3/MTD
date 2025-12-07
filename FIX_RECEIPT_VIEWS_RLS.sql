-- Cleanup script: Drop old RLS policies and recreate with correct ones
-- Run this AFTER running the main migration if you already executed it

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own receipt views" ON public.receipt_views;
DROP POLICY IF EXISTS "Users can insert their own receipt views" ON public.receipt_views;
DROP POLICY IF EXISTS "Users can delete their own receipt views" ON public.receipt_views;
DROP POLICY IF EXISTS "Service role can manage all receipt views" ON public.receipt_views;

-- Recreate policies with correct auth.uid()
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

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'receipt_views';
