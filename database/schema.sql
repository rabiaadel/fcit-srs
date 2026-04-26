-- =============================================================================
-- FCIT - Faculty of Computers and Informatics, Tanta University
-- Student Registration System - Complete Database Schema
-- Encodes ALL bylaws from the 2024 regulations document
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMERATIONS
-- =============================================================================

DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'student'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE semester_type AS ENUM ('fall', 'spring', 'summer'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE semester_status AS ENUM ('upcoming', 'registration', 'active', 'grading', 'closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enrollment_status AS ENUM ('registered', 'withdrawn', 'excused_withdrawn', 'dropped', 'completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE grade_code AS ENUM ('A+','A','A-','B+','B','B-','C+','C','C-','D+','D','D-','F','P','W','Abs','I','Con'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE specialization_code AS ENUM ('CS', 'IS', 'IT', 'SE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE course_category AS ENUM ('university_req', 'math_science', 'basic_computing', 'applied_computing', 'elective', 'project', 'training'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE student_level AS ENUM ('freshman', 'sophomore', 'junior', 'senior'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE academic_status AS ENUM ('active', 'warning', 'probation', 'dismissed', 'graduated', 'on_leave', 'withdrawn'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE track_type AS ENUM ('science_math', 'science_science'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE warning_type AS ENUM ('academic', 'attendance', 'dismissal'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE training_status AS ENUM ('not_started', 'in_progress', 'completed', 'failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE project_status AS ENUM ('not_started', 'in_progress', 'submitted', 'passed', 'failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- CORE USER TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL,
    full_name_ar    VARCHAR(255) NOT NULL,
    full_name_en    VARCHAR(255) NOT NULL,
    national_id     VARCHAR(14) UNIQUE,
    phone           VARCHAR(20),
    is_active       BOOLEAN DEFAULT TRUE,
    must_change_pw  BOOLEAN DEFAULT TRUE,
    last_login      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- FACULTY STRUCTURE
-- =============================================================================

CREATE TABLE IF NOT EXISTS departments (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(10) UNIQUE NOT NULL,   -- CS, IS, IT, SE
    name_ar     VARCHAR(255) NOT NULL,
    name_en     VARCHAR(255) NOT NULL,
    head_id     UUID REFERENCES users(id),
    is_active   BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS doctors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id   INT REFERENCES departments(id),
    academic_title  VARCHAR(100),   -- Prof., Assoc. Prof., Dr., Lect.
    specialization  VARCHAR(255),
    office_location VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- STUDENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS students (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_code        VARCHAR(20) UNIQUE NOT NULL,   -- e.g. 2024CS0001
    enrollment_year     INT NOT NULL,
    specialization      specialization_code,
    track               track_type NOT NULL DEFAULT 'science_math',
    current_level       student_level DEFAULT 'freshman',
    academic_status     academic_status DEFAULT 'active',
    cgpa                NUMERIC(4,3) DEFAULT 0.000 CHECK (cgpa >= 0 AND cgpa <= 4),
    total_credits_passed INT DEFAULT 0,
    total_credits_attempted INT DEFAULT 0,
    semesters_enrolled  INT DEFAULT 0,       -- total regular semesters attended
    consecutive_warnings INT DEFAULT 0,
    total_warnings      INT DEFAULT 0,
    consecutive_leaves  INT DEFAULT 0,
    total_leaves        INT DEFAULT 0,
    -- Bylaw: science track students may need remedial math
    remedial_math_required BOOLEAN DEFAULT FALSE,
    remedial_math_passed   BOOLEAN DEFAULT FALSE,
    -- Graduation
    graduation_date     DATE,
    graduation_gpa_class VARCHAR(50),   -- Poor/Weak/Satisfactory/Good/Very Good/Excellent
    honors_degree       BOOLEAN DEFAULT FALSE,
    -- Notes
    advisor_id          UUID REFERENCES users(id),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ACADEMIC CALENDAR
-- =============================================================================

CREATE TABLE IF NOT EXISTS academic_years (
    id          SERIAL PRIMARY KEY,
    year_label  VARCHAR(20) UNIQUE NOT NULL,   -- e.g. 2024-2025
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    is_current  BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS semesters (
    id                      SERIAL PRIMARY KEY,
    academic_year_id        INT NOT NULL REFERENCES academic_years(id),
    semester_type           semester_type NOT NULL,
    label                   VARCHAR(50) NOT NULL,   -- e.g. "Fall 2024"
    status                  semester_status DEFAULT 'upcoming',
    -- Dates per bylaw: 16-17 teaching weeks, summer 7-8 weeks
    start_date              DATE NOT NULL,
    end_date                DATE NOT NULL,
    registration_start      DATE NOT NULL,
    registration_end        DATE NOT NULL,    -- add/drop deadline = +14 days from reg_start
    add_drop_deadline       DATE NOT NULL,    -- BYLAW: end of week 2
    withdrawal_deadline     DATE NOT NULL,    -- BYLAW: end of week 7
    exam_start              DATE,
    exam_end                DATE,
    grade_entry_deadline    DATE,
    -- Credit hour limits per bylaw
    min_credits             INT DEFAULT 2,
    max_credits_default     INT DEFAULT 20,
    -- Summer special
    is_summer               BOOLEAN GENERATED ALWAYS AS (semester_type = 'summer') STORED,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (academic_year_id, semester_type)
);

-- =============================================================================
-- COURSES
-- =============================================================================

CREATE TABLE IF NOT EXISTS courses (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(10) UNIQUE NOT NULL,   -- e.g. CS311, BS113
    name_ar         VARCHAR(255) NOT NULL,
    name_en         VARCHAR(255) NOT NULL,
    credits         INT NOT NULL CHECK (credits >= 0 AND credits <= 9),
    category        course_category NOT NULL,
    department_id   INT REFERENCES departments(id),
    level           INT NOT NULL CHECK (level BETWEEN 1 AND 4),   -- academic year level
    -- Bylaw: non-credit bearing courses
    is_credit_bearing BOOLEAN DEFAULT TRUE,
    -- For training and projects
    is_mandatory    BOOLEAN DEFAULT TRUE,
    description     TEXT,
    syllabus_url    VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_prerequisites (
    id              SERIAL PRIMARY KEY,
    course_id       INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    prereq_course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    is_strict       BOOLEAN DEFAULT TRUE,   -- must be PASSED (not just enrolled)
    UNIQUE (course_id, prereq_course_id),
    CHECK (course_id != prereq_course_id)
);

-- =============================================================================
-- COURSE OFFERINGS (per semester)
-- =============================================================================

CREATE TABLE IF NOT EXISTS course_offerings (
    id              SERIAL PRIMARY KEY,
    semester_id     INT NOT NULL REFERENCES semesters(id),
    course_id       INT NOT NULL REFERENCES courses(id),
    doctor_id       UUID REFERENCES doctors(id),
    section         VARCHAR(10) DEFAULT 'A',
    capacity        INT DEFAULT 60,
    enrolled_count  INT DEFAULT 0,
    room            VARCHAR(50),
    schedule        JSONB,   -- {days: ["Sun","Tue","Thu"], time: "9:00-11:00"}
    is_active       BOOLEAN DEFAULT TRUE,
    UNIQUE (semester_id, course_id, section)
);

-- =============================================================================
-- ENROLLMENTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS enrollments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id          UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    offering_id         INT NOT NULL REFERENCES course_offerings(id),
    semester_id         INT NOT NULL REFERENCES semesters(id),
    status              enrollment_status DEFAULT 'registered',
    -- Registration timestamps for auditing
    registered_at       TIMESTAMPTZ DEFAULT NOW(),
    withdrawn_at        TIMESTAMPTZ,
    withdrawal_reason   TEXT,
    -- Grades
    midterm_grade       NUMERIC(5,2),         -- 0-100
    coursework_grade    NUMERIC(5,2),         -- 0-100
    practical_grade     NUMERIC(5,2),         -- 0-100
    final_exam_grade    NUMERIC(5,2),         -- 0-100
    total_grade         NUMERIC(5,2),         -- 0-100
    letter_grade        grade_code,
    grade_points        NUMERIC(3,1),         -- 0.0-4.0
    -- Bylaw: distinguish retake vs first attempt
    attempt_number      INT DEFAULT 1,
    is_improvement_retake BOOLEAN DEFAULT FALSE,  -- voluntary retake for GPA improvement
    is_counted_in_gpa   BOOLEAN DEFAULT TRUE,     -- highest attempt counts
    -- Meta
    grade_entered_by    UUID REFERENCES users(id),
    grade_entered_at    TIMESTAMPTZ,
    grade_locked        BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, offering_id)
);

-- =============================================================================
-- ATTENDANCE
-- =============================================================================

CREATE TABLE IF NOT EXISTS attendance_sessions (
    id              SERIAL PRIMARY KEY,
    offering_id     INT NOT NULL REFERENCES course_offerings(id),
    session_date    DATE NOT NULL,
    session_type    VARCHAR(20) DEFAULT 'lecture',   -- lecture, lab, tutorial
    total_students  INT DEFAULT 0,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id              SERIAL PRIMARY KEY,
    session_id      INT NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    enrollment_id   UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    is_present      BOOLEAN DEFAULT FALSE,
    is_excused      BOOLEAN DEFAULT FALSE,
    notes           TEXT,
    UNIQUE (session_id, enrollment_id)
);

-- Materialized view for fast attendance % calculation
CREATE TABLE IF NOT EXISTS attendance_summary (
    enrollment_id       UUID PRIMARY KEY REFERENCES enrollments(id) ON DELETE CASCADE,
    total_sessions      INT DEFAULT 0,
    attended_sessions   INT DEFAULT 0,
    excused_absences    INT DEFAULT 0,
    attendance_pct      NUMERIC(5,2) DEFAULT 0.00,
    last_updated        TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ACADEMIC STANDING
-- =============================================================================

-- GPA per semester per student
CREATE TABLE IF NOT EXISTS semester_gpa_records (
    id              SERIAL PRIMARY KEY,
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester_id     INT NOT NULL REFERENCES semesters(id),
    credits_attempted INT DEFAULT 0,
    credits_passed  INT DEFAULT 0,
    grade_points_earned NUMERIC(6,3) DEFAULT 0,
    semester_gpa    NUMERIC(4,3) DEFAULT 0.000,
    cumulative_gpa  NUMERIC(4,3) DEFAULT 0.000,     -- CGPA after this semester
    classification  VARCHAR(50),                     -- Excellent/Very Good/etc
    computed_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, semester_id)
);

-- Academic warnings tracker
CREATE TABLE IF NOT EXISTS academic_warnings (
    id              SERIAL PRIMARY KEY,
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester_id     INT NOT NULL REFERENCES semesters(id),
    warning_type    warning_type DEFAULT 'academic',
    cgpa_at_warning NUMERIC(4,3),
    is_consecutive  BOOLEAN DEFAULT FALSE,
    resolved        BOOLEAN DEFAULT FALSE,
    notes           TEXT,
    issued_by       UUID REFERENCES users(id),
    issued_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, semester_id, warning_type)
);

-- Leave of absence records
CREATE TABLE IF NOT EXISTS academic_leaves (
    id              SERIAL PRIMARY KEY,
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    semester_id     INT NOT NULL REFERENCES semesters(id),
    reason          TEXT,
    status          leave_status DEFAULT 'pending',
    is_excused      BOOLEAN DEFAULT FALSE,
    approved_by     UUID REFERENCES users(id),
    approved_at     TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- GRADUATION PROJECTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS graduation_projects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    -- Bylaw: PR411 and PR412, 3 credits each, 7 weeks each
    part            INT NOT NULL CHECK (part IN (1, 2)),
    course_id       INT REFERENCES courses(id),
    semester_id     INT NOT NULL REFERENCES semesters(id),
    supervisor_id   UUID REFERENCES doctors(id),
    title           VARCHAR(500),
    status          project_status DEFAULT 'not_started',
    -- Grades: 40% total minimum, 15% final defense minimum
    coursework_grade NUMERIC(5,2),   -- 50% weight of semester work
    defense_grade    NUMERIC(5,2),   -- 15% minimum
    total_grade      NUMERIC(5,2),
    letter_grade     grade_code,
    grade_points     NUMERIC(3,1),
    is_passed        BOOLEAN DEFAULT FALSE,
    submitted_at     TIMESTAMPTZ,
    defended_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, part)
);

-- =============================================================================
-- TRAINING / INTERNSHIP
-- =============================================================================

CREATE TABLE IF NOT EXISTS training_records (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    training_number INT NOT NULL CHECK (training_number IN (1, 2)),
    organization    VARCHAR(255),
    start_date      DATE,
    end_date        DATE,
    duration_weeks  INT,
    supervisor_name VARCHAR(255),
    supervisor_email VARCHAR(255),
    status          training_status DEFAULT 'not_started',
    grade           grade_code,   -- P or F
    report_url      VARCHAR(500),
    notes           TEXT,
    approved_by     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, training_number)
);

-- =============================================================================
-- COURSE REPETITION TRACKING
-- =============================================================================

-- Tracks retakes for bylaw enforcement
CREATE TABLE IF NOT EXISTS course_retake_log (
    id              SERIAL PRIMARY KEY,
    student_id      UUID NOT NULL REFERENCES students(id),
    course_id       INT NOT NULL REFERENCES courses(id),
    -- Bylaw: max 3 voluntary improvement retakes
    retake_type     VARCHAR(20) NOT NULL CHECK (retake_type IN ('failed', 'improvement')),
    attempt_count   INT DEFAULT 1,
    best_grade      NUMERIC(5,2),
    best_letter     grade_code,
    best_points     NUMERIC(3,1),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, course_id)
);

-- =============================================================================
-- ANNOUNCEMENTS & NOTIFICATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS announcements (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(500) NOT NULL,
    body        TEXT NOT NULL,
    target_role user_role,       -- NULL = all roles
    created_by  UUID REFERENCES users(id),
    is_pinned   BOOLEAN DEFAULT FALSE,
    expires_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    link        VARCHAR(500),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ACADEMIC RULES META (for audit/reference)
-- =============================================================================

CREATE TABLE IF NOT EXISTS academic_rules (
    id          SERIAL PRIMARY KEY,
    rule_id     VARCHAR(50) UNIQUE NOT NULL,
    category    VARCHAR(100) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    article_ref VARCHAR(50),
    numeric_value NUMERIC,
    is_active   BOOLEAN DEFAULT TRUE
);

-- =============================================================================
-- SEED LOGS (track which seeds have run)
-- =============================================================================

CREATE TABLE IF NOT EXISTS seed_logs (
    id          SERIAL PRIMARY KEY,
    seed_name   VARCHAR(255) UNIQUE NOT NULL,
    run_at      TIMESTAMPTZ DEFAULT NOW(),
    rows_affected INT DEFAULT 0
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_national_id ON users(national_id);

-- Students
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_code ON students(student_code);
CREATE INDEX IF NOT EXISTS idx_students_specialization ON students(specialization);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(academic_status);
CREATE INDEX IF NOT EXISTS idx_students_level ON students(current_level);

-- Enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_offering ON enrollments(offering_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_semester ON enrollments(semester_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_semester ON enrollments(student_id, semester_id);

-- Courses
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);

-- Course offerings
CREATE INDEX IF NOT EXISTS idx_offerings_semester ON course_offerings(semester_id);
CREATE INDEX IF NOT EXISTS idx_offerings_course ON course_offerings(course_id);
CREATE INDEX IF NOT EXISTS idx_offerings_doctor ON course_offerings(doctor_id);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_enrollment ON attendance_records(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance_records(session_id);

-- Warnings
CREATE INDEX IF NOT EXISTS idx_warnings_student ON academic_warnings(student_id);
CREATE INDEX IF NOT EXISTS idx_warnings_semester ON academic_warnings(semester_id);

-- GPA records
CREATE INDEX IF NOT EXISTS idx_gpa_student ON semester_gpa_records(student_id);
CREATE INDEX IF NOT EXISTS idx_gpa_semester ON semester_gpa_records(semester_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamps
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_students_updated_at ON students;
CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_enrollments_updated_at ON enrollments;
CREATE TRIGGER trg_enrollments_updated_at
    BEFORE UPDATE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- -------------------------------------------------------
-- GPA calculation per bylaw grading scale
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION percentage_to_grade_points(pct NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
    IF pct >= 96 THEN RETURN 4.0;
    ELSIF pct >= 92 THEN RETURN 3.7;
    ELSIF pct >= 88 THEN RETURN 3.4;
    ELSIF pct >= 84 THEN RETURN 3.2;
    ELSIF pct >= 80 THEN RETURN 3.0;
    ELSIF pct >= 76 THEN RETURN 2.8;
    ELSIF pct >= 72 THEN RETURN 2.6;
    ELSIF pct >= 68 THEN RETURN 2.4;
    ELSIF pct >= 64 THEN RETURN 2.2;
    ELSIF pct >= 60 THEN RETURN 2.0;
    ELSIF pct >= 55 THEN RETURN 1.5;
    ELSIF pct >= 50 THEN RETURN 1.0;
    ELSE RETURN 0.0;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION percentage_to_letter_grade(pct NUMERIC)
RETURNS grade_code AS $$
BEGIN
    IF pct >= 96 THEN RETURN 'A+';
    ELSIF pct >= 92 THEN RETURN 'A';
    ELSIF pct >= 88 THEN RETURN 'A-';
    ELSIF pct >= 84 THEN RETURN 'B+';
    ELSIF pct >= 80 THEN RETURN 'B';
    ELSIF pct >= 76 THEN RETURN 'B-';
    ELSIF pct >= 72 THEN RETURN 'C+';
    ELSIF pct >= 68 THEN RETURN 'C';
    ELSIF pct >= 64 THEN RETURN 'C-';
    ELSIF pct >= 60 THEN RETURN 'D+';
    ELSIF pct >= 55 THEN RETURN 'D';
    ELSIF pct >= 50 THEN RETURN 'D-';
    ELSE RETURN 'F';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- -------------------------------------------------------
-- Determine student level from passed credits (BYLAW Art.10)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION credits_to_level(credits INT)
RETURNS student_level AS $$
BEGIN
    IF credits >= 102 THEN RETURN 'senior';
    ELSIF credits >= 66 THEN RETURN 'junior';
    ELSIF credits >= 33 THEN RETURN 'sophomore';
    ELSE RETURN 'freshman';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- -------------------------------------------------------
-- Max credits per semester based on CGPA (BYLAW Art.11)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION get_max_credits_by_cgpa(
    p_cgpa NUMERIC,
    p_level student_level,
    p_is_new_student BOOLEAN DEFAULT FALSE,
    p_is_summer BOOLEAN DEFAULT FALSE
)
RETURNS INT AS $$
BEGIN
    -- Summer semester limit (BYLAW: max 7)
    IF p_is_summer THEN RETURN 7; END IF;
    -- New students first semester (BYLAW: max 20)
    IF p_is_new_student THEN RETURN 20; END IF;
    -- By CGPA (Art. 11): >=3.0→70, 2.5-3.0→20, <2.5→40
    IF p_cgpa >= 3.0 THEN RETURN 70;
    ELSIF p_cgpa >= 2.5 THEN RETURN 20;
    ELSE RETURN 40;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- -------------------------------------------------------
-- CGPA classification (BYLAW Art.18)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION cgpa_to_classification(cgpa NUMERIC)
RETURNS VARCHAR AS $$
BEGIN
    IF cgpa >= 3.5 THEN RETURN 'Excellent';
    ELSIF cgpa >= 3.0 THEN RETURN 'Very Good';
    ELSIF cgpa >= 2.5 THEN RETURN 'Good';
    ELSIF cgpa >= 2.0 THEN RETURN 'Satisfactory';
    ELSIF cgpa >= 1.0 THEN RETURN 'Weak';
    ELSE RETURN 'Poor';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- -------------------------------------------------------
-- Recompute student CGPA (called after grade finalization)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION recompute_student_cgpa(p_student_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total_quality_points NUMERIC := 0;
    v_total_credits INT := 0;
    v_new_cgpa NUMERIC := 0;
    v_level student_level;
    v_passed INT := 0;
BEGIN
    -- Sum all credit-bearing, completed, counted enrollments
    SELECT
        COALESCE(SUM(c.credits * e.grade_points), 0),
        COALESCE(SUM(CASE WHEN e.is_counted_in_gpa AND e.status = 'completed' THEN c.credits ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN e.status = 'completed' AND e.letter_grade NOT IN ('F','Abs') AND c.is_credit_bearing THEN c.credits ELSE 0 END), 0)
    INTO v_total_quality_points, v_total_credits, v_passed
    FROM enrollments e
    JOIN course_offerings co ON co.id = e.offering_id
    JOIN courses c ON c.id = co.course_id
    WHERE e.student_id = p_student_id
      AND e.is_counted_in_gpa = TRUE
      AND e.status = 'completed'
      AND c.is_credit_bearing = TRUE;

    IF v_total_credits > 0 THEN
        v_new_cgpa := ROUND(v_total_quality_points / v_total_credits, 3);
    END IF;

    v_level := credits_to_level(v_passed);

    UPDATE students SET
        cgpa = v_new_cgpa,
        total_credits_passed = v_passed,
        total_credits_attempted = v_total_credits,
        current_level = v_level,
        updated_at = NOW()
    WHERE id = p_student_id;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- Check if student can register for a course (prerequisite check)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION student_meets_prerequisites(
    p_student_id UUID,
    p_course_id INT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_prereq_count INT;
    v_met_count INT;
BEGIN
    -- Count prerequisites
    SELECT COUNT(*) INTO v_prereq_count
    FROM course_prerequisites cp
    WHERE cp.course_id = p_course_id AND cp.is_strict = TRUE;

    IF v_prereq_count = 0 THEN RETURN TRUE; END IF;

    -- Count how many the student has passed
    SELECT COUNT(DISTINCT cp.prereq_course_id) INTO v_met_count
    FROM course_prerequisites cp
    JOIN course_offerings co ON co.course_id = cp.prereq_course_id
    JOIN enrollments e ON e.offering_id = co.id
        AND e.student_id = p_student_id
        AND e.status = 'completed'
        AND e.letter_grade NOT IN ('F','Abs','W','I')
    WHERE cp.course_id = p_course_id
      AND cp.is_strict = TRUE;

    RETURN v_met_count >= v_prereq_count;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- Get student's current semester credit load
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION get_student_semester_credits(
    p_student_id UUID,
    p_semester_id INT
)
RETURNS INT AS $$
DECLARE
    v_credits INT;
BEGIN
    SELECT COALESCE(SUM(c.credits), 0) INTO v_credits
    FROM enrollments e
    JOIN course_offerings co ON co.id = e.offering_id
    JOIN courses c ON c.id = co.course_id
    WHERE e.student_id = p_student_id
      AND e.semester_id = p_semester_id
      AND e.status IN ('registered', 'completed');
    RETURN v_credits;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- Update enrollment count on course offering
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_offering_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'registered' THEN
        UPDATE course_offerings SET enrolled_count = enrolled_count + 1 WHERE id = NEW.offering_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'registered' AND NEW.status != 'registered' THEN
            UPDATE course_offerings SET enrolled_count = GREATEST(0, enrolled_count - 1) WHERE id = NEW.offering_id;
        ELSIF OLD.status != 'registered' AND NEW.status = 'registered' THEN
            UPDATE course_offerings SET enrolled_count = enrolled_count + 1 WHERE id = NEW.offering_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'registered' THEN
        UPDATE course_offerings SET enrolled_count = GREATEST(0, enrolled_count - 1) WHERE id = OLD.offering_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enrollment_count ON enrollments;
CREATE TRIGGER trg_enrollment_count
    AFTER INSERT OR UPDATE OR DELETE ON enrollments
    FOR EACH ROW EXECUTE FUNCTION update_offering_enrollment_count();

-- -------------------------------------------------------
-- Auto-detect academic warning after semester finalization
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION process_semester_warnings(p_semester_id INT)
RETURNS TABLE(student_id UUID, action VARCHAR) AS $$
DECLARE
    rec RECORD;
    v_sem_number INT;
BEGIN
    -- Identify students with CGPA < 2.0 (exclude first semester - bylaw)
    FOR rec IN
        SELECT s.id, s.cgpa, s.consecutive_warnings, s.total_warnings, s.semesters_enrolled
        FROM students s
        WHERE s.academic_status IN ('active', 'warning')
          AND s.semesters_enrolled > 1  -- first semester excluded from warning
    LOOP
        IF rec.cgpa < 2.0 THEN
            -- Issue warning
            INSERT INTO academic_warnings (student_id, semester_id, warning_type, cgpa_at_warning)
            VALUES (rec.id, p_semester_id, 'academic', rec.cgpa)
            ON CONFLICT (student_id, semester_id, warning_type) DO NOTHING;

            UPDATE students SET
                consecutive_warnings = consecutive_warnings + 1,
                total_warnings = total_warnings + 1,
                academic_status = CASE
                    WHEN (consecutive_warnings + 1) >= 4 OR (total_warnings + 1) >= 6
                        OR semesters_enrolled > 8 THEN 'dismissed'
                    ELSE 'warning'
                END
            WHERE id = rec.id;

            student_id := rec.id;
            action := CASE
                WHEN rec.consecutive_warnings + 1 >= 4 THEN 'DISMISSED_CONSECUTIVE'
                WHEN rec.total_warnings + 1 >= 6 THEN 'DISMISSED_TOTAL'
                ELSE 'WARNING_ISSUED'
            END;
            RETURN NEXT;
        ELSE
            -- Clear consecutive warnings if CGPA recovered
            UPDATE students SET
                consecutive_warnings = 0,
                academic_status = CASE
                    WHEN academic_status = 'warning' THEN 'active'
                    ELSE academic_status
                END
            WHERE id = rec.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Student transcript view
CREATE OR REPLACE VIEW v_student_transcript AS
SELECT
    s.id AS student_id,
    s.student_code,
    u.full_name_ar,
    u.full_name_en,
    s.specialization,
    s.current_level,
    s.cgpa,
    s.total_credits_passed,
    s.academic_status,
    sem.id AS semester_id,
    sem.label AS semester_label,
    sem.semester_type,
    c.code AS course_code,
    c.name_ar AS course_name_ar,
    c.name_en AS course_name_en,
    c.credits,
    e.total_grade,
    e.letter_grade,
    e.grade_points,
    e.status AS enrollment_status,
    e.attempt_number,
    e.is_counted_in_gpa
FROM students s
JOIN users u ON u.id = s.user_id
JOIN enrollments e ON e.student_id = s.id
JOIN course_offerings co ON co.id = e.offering_id
JOIN courses c ON c.id = co.course_id
JOIN semesters sem ON sem.id = e.semester_id
ORDER BY sem.start_date, c.code;

-- Current semester registrations
CREATE OR REPLACE VIEW v_current_registrations AS
SELECT
    e.id AS enrollment_id,
    s.student_code,
    u.full_name_ar,
    u.full_name_en,
    c.code AS course_code,
    c.name_en AS course_name,
    c.credits,
    sem.label AS semester,
    e.status,
    e.total_grade,
    e.letter_grade
FROM enrollments e
JOIN students s ON s.id = e.student_id
JOIN users u ON u.id = s.user_id
JOIN course_offerings co ON co.id = e.offering_id
JOIN courses c ON c.id = co.course_id
JOIN semesters sem ON sem.id = e.semester_id
WHERE sem.status IN ('registration', 'active', 'grading');

-- Doctor's course roster
CREATE OR REPLACE VIEW v_doctor_courses AS
SELECT
    d.id AS doctor_id,
    u.full_name_en AS doctor_name,
    sem.label AS semester,
    sem.status AS semester_status,
    c.code AS course_code,
    c.name_en AS course_name,
    c.credits,
    co.id AS offering_id,
    co.section,
    co.enrolled_count,
    co.capacity
FROM doctors d
JOIN users u ON u.id = d.user_id
JOIN course_offerings co ON co.doctor_id = d.id
JOIN courses c ON c.id = co.course_id
JOIN semesters sem ON sem.id = co.semester_id;

-- Graduation eligibility check
CREATE OR REPLACE VIEW v_graduation_eligibility AS
SELECT
    s.id AS student_id,
    s.student_code,
    u.full_name_en,
    s.specialization,
    s.cgpa,
    s.total_credits_passed,
    s.semesters_enrolled,
    s.academic_status,
    -- Bylaw: 132 credits, CGPA >= 2.0
    (s.total_credits_passed >= 132) AS credits_met,
    (s.cgpa >= 2.0) AS gpa_met,
    (s.academic_status NOT IN ('dismissed', 'withdrawn')) AS status_ok,
    -- Honors: CGPA >= 3.0, <= 8 semesters, no F
    (s.cgpa >= 3.0 AND s.semesters_enrolled <= 8) AS honors_possible,
    (s.total_credits_passed >= 132 AND s.cgpa >= 2.0 AND s.academic_status NOT IN ('dismissed','withdrawn')) AS is_eligible
FROM students s
JOIN users u ON u.id = s.user_id;
