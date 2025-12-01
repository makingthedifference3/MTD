-- =====================================================================
-- MIGRATION: Add file storage support for Articles
-- Run this in Supabase SQL Editor
-- =====================================================================

-- 1. Add file_url column to media_articles if not exists
ALTER TABLE public.media_articles 
ADD COLUMN IF NOT EXISTS file_url TEXT;

-- 2. Create storage bucket for article files (images, PDFs, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-files',
  'article-files', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'image/svg+xml'];

-- 3. Drop any existing policies for this bucket (cleanup)
DROP POLICY IF EXISTS "Allow public read access on article-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert on article-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update on article-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete on article-files" ON storage.objects;
DROP POLICY IF EXISTS "Public read article-files" ON storage.objects;
DROP POLICY IF EXISTS "Auth insert article-files" ON storage.objects;
DROP POLICY IF EXISTS "Auth update article-files" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete article-files" ON storage.objects;
DROP POLICY IF EXISTS "article-files_public_select" ON storage.objects;
DROP POLICY IF EXISTS "article-files_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "article-files_public_update" ON storage.objects;
DROP POLICY IF EXISTS "article-files_public_delete" ON storage.objects;

-- 4. Create FULLY OPEN policies (no authentication required)
-- Anyone can read
CREATE POLICY "article-files_public_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-files');

-- Anyone can upload
CREATE POLICY "article-files_public_insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'article-files');

-- Anyone can update
CREATE POLICY "article-files_public_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'article-files');

-- Anyone can delete
CREATE POLICY "article-files_public_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'article-files');

-- =====================================================================
-- VERIFICATION: Run these to check everything is set up correctly
-- =====================================================================
-- SELECT * FROM storage.buckets WHERE id = 'article-files';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE 'article-files%';
