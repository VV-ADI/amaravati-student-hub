-- Add public read access to student_records for demo purposes
CREATE POLICY "Allow public read access to student_records"
ON public.student_records
FOR SELECT
USING (true);

-- Add public insert access to student_records
CREATE POLICY "Allow public insert to student_records"
ON public.student_records
FOR INSERT
WITH CHECK (true);

-- Add public update access to student_records
CREATE POLICY "Allow public update to student_records"
ON public.student_records
FOR UPDATE
USING (true);

-- Add public delete access to student_records
CREATE POLICY "Allow public delete to student_records"
ON public.student_records
FOR DELETE
USING (true);