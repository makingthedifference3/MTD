-- Migration: Add Bucket Support for Utilization Certificates
-- Purpose: Update utilization_certificates table to support file bucket storage
-- This allows uploading PDFs, images, and other file types via Supabase Storage

-- 1. Add new columns to utilization_certificates table for bucket file paths
ALTER TABLE public.utilization_certificates
ADD COLUMN IF NOT EXISTS certificate_bucket_path character varying,
ADD COLUMN IF NOT EXISTS certificate_file_name character varying,
ADD COLUMN IF NOT EXISTS certificate_file_size_mb numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS certificate_file_type character varying,
ADD COLUMN IF NOT EXISTS annexure_bucket_path character varying,
ADD COLUMN IF NOT EXISTS annexure_file_name character varying,
ADD COLUMN IF NOT EXISTS annexure_file_size_mb numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS annexure_file_type character varying,
ADD COLUMN IF NOT EXISTS supporting_files jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS uploaded_by uuid REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS file_upload_date timestamp with time zone;

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_utilization_certificates_bucket_path 
ON public.utilization_certificates(certificate_bucket_path);

CREATE INDEX IF NOT EXISTS idx_utilization_certificates_uploaded_by 
ON public.utilization_certificates(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_utilization_certificates_status_created_at 
ON public.utilization_certificates(status, created_at DESC);

-- 3. Update certificate_type CHECK constraint to include more types
ALTER TABLE public.utilization_certificates 
DROP CONSTRAINT IF EXISTS utilization_certificates_certificate_type_check;

ALTER TABLE public.utilization_certificates
ADD CONSTRAINT utilization_certificates_certificate_type_check 
CHECK (certificate_type::text = ANY (ARRAY[
  'Quarterly'::character varying, 
  'Half-Yearly'::character varying, 
  'Annual'::character varying, 
  'Project Completion'::character varying,
  'Project-Specific'::character varying
]::text[]));

-- 4. Add trigger to update file_upload_date when files are uploaded
CREATE OR REPLACE FUNCTION update_uc_file_upload_date()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.certificate_bucket_path IS NOT NULL OR NEW.annexure_bucket_path IS NOT NULL) THEN
    NEW.file_upload_date = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_uc_file_upload_date_trigger ON public.utilization_certificates;

CREATE TRIGGER update_uc_file_upload_date_trigger
BEFORE UPDATE ON public.utilization_certificates
FOR EACH ROW
EXECUTE FUNCTION update_uc_file_upload_date();

-- 5. Create supporting_files structure documentation
-- supporting_files is JSONB array with structure:
-- [
--   {
--     "id": "unique-id",
--     "name": "file name",
--     "bucket_path": "path/to/file",
--     "file_type": "pdf|image|document",
--     "file_size_mb": 2.5,
--     "uploaded_at": "2024-12-01T10:30:00Z",
--     "uploaded_by_id": "user-uuid",
--     "public_url": "https://..."
--   }
-- ]

-- 6. Comment on columns for documentation
COMMENT ON COLUMN public.utilization_certificates.certificate_bucket_path 
IS 'Supabase Storage bucket path for main certificate file';

COMMENT ON COLUMN public.utilization_certificates.certificate_file_name 
IS 'Original file name of the certificate';

COMMENT ON COLUMN public.utilization_certificates.certificate_file_type 
IS 'MIME type of certificate (pdf, image/jpeg, etc.)';

COMMENT ON COLUMN public.utilization_certificates.annexure_bucket_path 
IS 'Supabase Storage bucket path for annexure/supporting document';

COMMENT ON COLUMN public.utilization_certificates.supporting_files 
IS 'JSONB array of additional supporting documents with metadata';

COMMENT ON COLUMN public.utilization_certificates.uploaded_by 
IS 'User ID who uploaded the files';

COMMENT ON COLUMN public.utilization_certificates.file_upload_date 
IS 'Timestamp when files were last uploaded';
