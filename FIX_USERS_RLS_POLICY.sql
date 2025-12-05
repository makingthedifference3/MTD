-- Fix RLS for users table to allow anonymous access
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS admin_all_users ON public.users;

-- Create a policy that allows all operations for everyone (since we're not using Supabase Auth)
CREATE POLICY "Allow all access to users table" ON public.users
FOR ALL
USING (true)
WITH CHECK (true);

-- Alternatively, if you want read-only for non-admins, use this instead:
-- CREATE POLICY "Allow public read access to users" ON public.users
-- FOR SELECT USING (true);
--
-- CREATE POLICY "Allow public insert to users" ON public.users
-- FOR INSERT WITH CHECK (true);
--
-- CREATE POLICY "Allow public update to users" ON public.users
-- FOR UPDATE USING (true) WITH CHECK (true);
--
-- CREATE POLICY "Allow public delete from users" ON public.users
-- FOR DELETE USING (true);
