-- Fix RLS for projects table to allow public reads (for anon key)
-- Run this in Supabase SQL Editor

-- Ensure RLS is enabled (already is in schema, but safe to set)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policy if present
DROP POLICY IF EXISTS admin_all_projects ON public.projects;
DROP POLICY IF EXISTS public_read_projects ON public.projects;

-- Allow all clients (anon) to read projects
CREATE POLICY public_read_projects ON public.projects
FOR SELECT
USING (true);
