-- =============================================================================
-- Seed 002: Initial Setup - Departments, Academic Years, Semesters, Rules
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM seed_logs WHERE seed_name = '002_initial_setup.sql') THEN
        RAISE NOTICE 'Seed 002 already run, skipping';
        RETURN;
    END IF;

    -- -----------------------------------------------------------------------
    -- DEPARTMENTS
    -- -----------------------------------------------------------------------
    INSERT INTO departments (code, name_ar, name_en) VALUES
    ('CS', 'قسم علوم الحاسب',       'Computer Science'),
    ('IS', 'قسم نظم المعلومات',     'Information Systems'),
    ('IT', 'قسم تكنولوجيا المعلومات', 'Information Technology'),
    ('SE', 'قسم هندسة البرمجيات',   'Software Engineering');

    -- Set doctor department
    UPDATE doctors SET department_id = (SELECT id FROM departments WHERE code = 'CS')
    WHERE user_id = '00000000-0000-0000-0000-000000000002';

    -- -----------------------------------------------------------------------
    -- ACADEMIC YEARS
    -- -----------------------------------------------------------------------
    INSERT INTO academic_years (year_label, start_date, end_date, is_current) VALUES
    ('2023-2024', '2023-09-01', '2024-06-30', FALSE),
    ('2024-2025', '2024-09-01', '2025-06-30', FALSE),
    ('2025-2026', '2025-09-01', '2026-06-30', TRUE);

    -- -----------------------------------------------------------------------
    -- SEMESTERS (2024-2025 and 2025-2026)
    -- -----------------------------------------------------------------------
    -- Fall 2024
    INSERT INTO semesters (academic_year_id, semester_type, label, status,
        start_date, end_date, registration_start, registration_end,
        add_drop_deadline, withdrawal_deadline, exam_start, exam_end, grade_entry_deadline,
        min_credits, max_credits_default)
    VALUES (
        (SELECT id FROM academic_years WHERE year_label = '2024-2025'),
        'fall', 'Fall 2024', 'closed',
        '2024-09-15', '2025-01-15',
        '2024-09-01', '2024-09-14',
        '2024-09-29',  -- week 2 end
        '2024-11-03',  -- week 7 end
        '2025-01-18', '2025-01-30', '2025-02-10',
        2, 20
    );

    -- Spring 2025
    INSERT INTO semesters (academic_year_id, semester_type, label, status,
        start_date, end_date, registration_start, registration_end,
        add_drop_deadline, withdrawal_deadline, exam_start, exam_end, grade_entry_deadline,
        min_credits, max_credits_default)
    VALUES (
        (SELECT id FROM academic_years WHERE year_label = '2024-2025'),
        'spring', 'Spring 2025', 'closed',
        '2025-02-15', '2025-06-15',
        '2025-02-01', '2025-02-14',
        '2025-03-01',
        '2025-04-05',
        '2025-06-18', '2025-06-30', '2025-07-10',
        2, 20
    );

    -- Fall 2025 (current)
    INSERT INTO semesters (academic_year_id, semester_type, label, status,
        start_date, end_date, registration_start, registration_end,
        add_drop_deadline, withdrawal_deadline, exam_start, exam_end, grade_entry_deadline,
        min_credits, max_credits_default)
    VALUES (
        (SELECT id FROM academic_years WHERE year_label = '2025-2026'),
        'fall', 'Fall 2025', 'active',
        '2025-09-15', '2026-01-15',
        '2025-09-01', '2025-09-14',
        '2025-09-29',
        '2025-11-03',
        '2026-01-18', '2026-01-30', '2026-02-10',
        2, 20
    );

    -- Spring 2026 (upcoming)
    INSERT INTO semesters (academic_year_id, semester_type, label, status,
        start_date, end_date, registration_start, registration_end,
        add_drop_deadline, withdrawal_deadline, exam_start, exam_end, grade_entry_deadline,
        min_credits, max_credits_default)
    VALUES (
        (SELECT id FROM academic_years WHERE year_label = '2025-2026'),
        'spring', 'Spring 2026', 'registration',
        '2026-02-15', '2026-06-15',
        '2026-02-01', '2026-02-14',
        '2026-03-01',
        '2026-04-05',
        '2026-06-18', '2026-06-30', '2026-07-10',
        2, 20
    );

    -- Summer 2026 (upcoming)
    INSERT INTO semesters (academic_year_id, semester_type, label, status,
        start_date, end_date, registration_start, registration_end,
        add_drop_deadline, withdrawal_deadline, exam_start, exam_end, grade_entry_deadline,
        min_credits, max_credits_default)
    VALUES (
        (SELECT id FROM academic_years WHERE year_label = '2025-2026'),
        'summer', 'Summer 2026', 'upcoming',
        '2026-07-01', '2026-08-15',
        '2026-06-20', '2026-06-30',
        '2026-07-15',
        '2026-07-22',
        '2026-08-16', '2026-08-20', '2026-08-25',
        2, 7
    );

    -- -----------------------------------------------------------------------
    -- ACADEMIC RULES (bylaw reference table)
    -- -----------------------------------------------------------------------
    INSERT INTO academic_rules (rule_id, category, title, description, article_ref, numeric_value) VALUES
    ('TOTAL_CREDITS',     'Graduation', 'Total Required Credit Hours', 'Students must pass 132 credit hours', 'Art.4', 132),
    ('MIN_CGPA',          'Graduation', 'Minimum CGPA for Graduation', 'Minimum cumulative GPA of 2.0 required', 'Art.4', 2.0),
    ('MAX_SEMESTERS',     'Duration',   'Maximum Regular Semesters', 'Maximum 8 regular semesters before dismissal', 'Art.4', 8),
    ('MIN_ATTENDANCE',    'Attendance', 'Minimum Attendance Percentage', 'Students must attend at least 42% of sessions', 'Art.14', 42),
    ('ABSENCE_THRESHOLD', 'Attendance', 'Excessive Absence Threshold', 'More than 25% absence triggers warnings', 'Art.14', 25),
    ('ADD_DROP_WEEKS',    'Registration','Add/Drop Deadline', 'End of week 2 from registration start', 'Art.12', 2),
    ('WITHDRAWAL_WEEKS',  'Registration','Course Withdrawal Deadline', 'End of week 7 from registration start', 'Art.13', 7),
    ('WARNING_THRESHOLD', 'Academic',   'Academic Warning CGPA Threshold', 'CGPA below 2.0 triggers academic warning', 'Art.25', 2.0),
    ('CONSEC_WARNINGS',   'Dismissal',  'Consecutive Warnings Limit', '4 consecutive warnings leads to dismissal', 'Art.26', 4),
    ('TOTAL_WARNINGS',    'Dismissal',  'Total Warnings Limit', '6 total warnings leads to dismissal', 'Art.26', 6),
    ('PROJECT_PREREQ',    'Projects',   'Graduation Project Prerequisites', 'Must pass 85+ credit hours to register for project', 'Art.21', 85),
    ('HONORS_CGPA',       'Honors',     'Honors Degree Minimum CGPA', 'CGPA >= 3.0 required for honors', 'Art.27', 3.0),
    ('MAX_RETAKES',       'Repetition', 'Maximum Voluntary Retakes', 'Maximum 3 courses can be retaken for improvement', 'Art.23', 3),
    ('RETAKE_MAX_GRADE',  'Repetition', 'Maximum Grade on Retake', 'Grade capped at B (3.0) on improvement retakes', 'Art.22', 3.0),
    ('SUMMER_MAX_CREDITS','Registration','Summer Semester Max Credits', 'Maximum 7 credit hours in summer semester', 'Art.11', 7),
    ('FRESHMAN_MAX',      'Registration','Freshman Semester Max Credits', 'Maximum 27 credit hours for freshmen', 'Art.11', 27),
    ('NEW_STUDENT_MAX',   'Registration','New Student First Semester Max', 'Maximum 20 credit hours for new students', 'Art.11', 20),
    ('MIN_PASSING_TOTAL', 'Grading',    'Minimum Passing Total Grade', 'Minimum 40% of total course grade to pass', 'Art.16', 40),
    ('MIN_PASSING_FINAL', 'Grading',    'Minimum Passing Final Exam', 'Minimum 30% of final exam score to pass', 'Art.16', 30),
    ('SPEC_START_CREDITS','Specialization','Specialization Start Credits', 'Specialization begins after 63 credit hours', 'Art.4', 63),
    ('LEAVE_MAX_CONSEC',  'Leave',      'Maximum Consecutive Leave Semesters', 'Maximum 4 consecutive semesters of leave', 'Art.15', 4),
    ('LEAVE_MAX_TOTAL',   'Leave',      'Maximum Total Leave Semesters', 'Maximum 6 non-consecutive semesters of leave', 'Art.15', 6);

    INSERT INTO seed_logs (seed_name, rows_affected) VALUES ('002_initial_setup.sql', 50);
    RAISE NOTICE 'Seed 002 completed';
END $$;
