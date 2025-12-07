-- Add is_placeholder column to distinguish admin-created records from real user accounts
ALTER TABLE public.student_records 
ADD COLUMN is_placeholder boolean NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.student_records.is_placeholder IS 'True if record was created by admin without a linked auth user';