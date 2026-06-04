-- Migration V4: Fix course_retake_log constraint

ALTER TABLE course_retake_log ADD COLUMN IF NOT EXISTS original_enrollment_id UUID REFERENCES enrollments(id);

ALTER TABLE course_retake_log DROP CONSTRAINT IF EXISTS course_retake_log_student_id_course_id_key;

-- Add the new composite unique constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'course_retake_log_unique_attempt'
    ) THEN
        ALTER TABLE course_retake_log ADD CONSTRAINT course_retake_log_unique_attempt UNIQUE (student_id, course_id, retake_type, original_enrollment_id);
    END IF;
END $$;
