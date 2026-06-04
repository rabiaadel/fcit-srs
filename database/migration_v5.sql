-- =============================================================================
-- Migration v5 — Full Audit Fix Migration
-- Applies all schema changes identified in the FCIT SRS audit report.
-- Run AFTER migration_v4.sql.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Fix UNV mandatory courses: 1 credit → 2 credits each (Art. 31a)
--    Total mandatory UNV: 4 courses × 2 credits = 8 credits (mandatory set)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE courses SET credits = 2
WHERE code IN ('UNV111', 'UNV112', 'UNV113', 'UNV114')
  AND credits = 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Add section_label column to course_offerings (allows multi-section courses)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE course_offerings
  ADD COLUMN IF NOT EXISTS section_label VARCHAR(10) DEFAULT 'A';

-- Drop the old unique constraint that prevented multiple sections
ALTER TABLE course_offerings
  DROP CONSTRAINT IF EXISTS course_offerings_semester_id_course_id_key;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'course_offerings_semester_course_section_key') THEN
    ALTER TABLE course_offerings
      ADD CONSTRAINT course_offerings_semester_course_section_key
      UNIQUE (semester_id, course_id, section_label);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Add excuse_approved column to enrollments (Art. 14 — Incomplete grade)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS excuse_approved BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN enrollments.excuse_approved IS
  'Art. 14: TRUE when student submitted a valid excuse for missing the final exam. '
  'Used during finalization to assign grade I instead of Abs when >= 60% coursework was completed.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Fix course_retake_log: add avoidance type + correct unique constraint
--    Art. 23 (dismissal avoidance) is uncapped; Art. 24 (improvement) capped at 3
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'course_retake_log') THEN
    -- Drop the broken constraint that prevented logging more than one retake per course
    ALTER TABLE course_retake_log
      DROP CONSTRAINT IF EXISTS course_retake_log_student_id_course_id_key;

    -- Add original_enrollment_id if not already present (added in migration_v4)
    ALTER TABLE course_retake_log
      ADD COLUMN IF NOT EXISTS original_enrollment_id UUID REFERENCES enrollments(id);

    -- Extend the retake_type check to include 'avoidance'
    ALTER TABLE course_retake_log
      DROP CONSTRAINT IF EXISTS course_retake_log_retake_type_check;

    ALTER TABLE course_retake_log
      ADD CONSTRAINT course_retake_log_retake_type_check
      CHECK (retake_type IN ('failed', 'improvement', 'avoidance'));

    -- New unique constraint: one log entry per (student, course, type, original attempt)
    ALTER TABLE course_retake_log
      DROP CONSTRAINT IF EXISTS course_retake_log_student_id_course_id_retake_type_original_en;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'course_retake_log_student_course_type_orig_key') THEN
      ALTER TABLE course_retake_log
        ADD CONSTRAINT course_retake_log_student_course_type_orig_key
        UNIQUE (student_id, course_id, retake_type, original_enrollment_id);
    END IF;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Recompute student GPAs/credits that may be wrong due to UNV credit fix
-- ─────────────────────────────────────────────────────────────────────────────
-- Recompute CGPA for any student who has completed a UNV course
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT e.student_id
    FROM enrollments e
    JOIN course_offerings co ON co.id = e.offering_id
    JOIN courses c ON c.id = co.course_id
    WHERE c.code IN ('UNV111','UNV112','UNV113','UNV114')
      AND e.status = 'completed'
  LOOP
    BEGIN
      PERFORM recompute_student_cgpa(r.student_id);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'recompute_student_cgpa failed for %: %', r.student_id, SQLERRM;
    END;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Record migration
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schema_migrations') THEN
    INSERT INTO schema_migrations (version, description, applied_at)
    VALUES ('v5', 'Full audit fix: UNV credits, section_label, excuse_approved, retake_log constraint, avoidance retake type', NOW())
    ON CONFLICT (version) DO NOTHING;
  END IF;
END $$;
