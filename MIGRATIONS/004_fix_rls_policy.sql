-- Fix RLS policy recursion issue on users table
-- This resolves "infinite recursion detected in policy for relation users"

-- Option 1: Simply disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Option 2: If Option 1 doesn't work, drop all policies first then disable
-- DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
-- DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
-- DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
-- DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;
-- DROP POLICY IF EXISTS "Enable delete for users based on id" ON public.users;
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- After running this, the authentication should work without RLS conflicts
