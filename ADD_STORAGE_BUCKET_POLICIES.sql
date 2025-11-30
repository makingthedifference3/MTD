-- Storage Bucket Policies for MTD_Bills
-- Run this in Supabase SQL Editor

-- Since you're using custom auth (not Supabase Auth), 
-- we need to allow the 'anon' role (which your app uses)

-- Allow anon users to upload files
CREATE POLICY "Allow anon uploads"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'MTD_Bills');

-- Allow anon users to update files
CREATE POLICY "Allow anon updates"
ON storage.objects FOR UPDATE
TO anon
USING (bucket_id = 'MTD_Bills');

-- Allow anon users to delete files
CREATE POLICY "Allow anon deletes"
ON storage.objects FOR DELETE
TO anon
USING (bucket_id = 'MTD_Bills');

-- Allow public read access (so bill links work for viewing)
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'MTD_Bills');

-- Verify policies were created
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
