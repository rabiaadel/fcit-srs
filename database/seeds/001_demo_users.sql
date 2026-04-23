-- =============================================================================
-- Seed 001: Demo Users
-- Admin:   admin@fci.tanta.edu.eg   / Admin@2026!
-- Doctor:  dr.ahmed@fci.tanta.edu.eg / Doctor@2026!
-- Student: s.2024cs001@fci.tanta.edu.eg / Student@2026!
-- All passwords: bcrypt 10 rounds
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM seed_logs WHERE seed_name = '001_demo_users.sql') THEN
        RAISE NOTICE 'Seed 001 already run, skipping';
        RETURN;
    END IF;

    -- Insert demo users
    -- Admin password: Admin@2026!
    INSERT INTO users (id, email, password_hash, role, full_name_ar, full_name_en, national_id, phone, must_change_pw)
    VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'admin@fci.tanta.edu.eg',
        '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQsA3eKFMkiuX8ehtOgQihtVhxG4bO',
        'admin',
        'مدير النظام',
        'System Administrator',
        '30001011234567',
        '01012345678',
        FALSE
    ),
    -- Doctor password: Doctor@2026!
    (
        '00000000-0000-0000-0000-000000000002',
        'dr.ahmed@fci.tanta.edu.eg',
        '$2b$10$KCCV6NAZ5x1YUaKOLxbr8OQNl4Gx2GH0nRO9mPBJdE0DJkbTe8D.S',
        'doctor',
        'د. أحمد محمد السيد',
        'Dr. Ahmed Mohamed El-Sayed',
        '19800515234567',
        '01098765432',
        FALSE
    ),
    -- Student password: Student@2026!
    (
        '00000000-0000-0000-0000-000000000003',
        's.2024cs001@fci.tanta.edu.eg',
        '$2b$10$kzqN0JjEZOqq3D5gYnSj9.mVNptjXCrN8j1XeD8EjX0tG.sR7aUzC',
        'student',
        'محمد علي حسن',
        'Mohamed Ali Hassan',
        '20060101345678',
        '01234567890',
        FALSE
    );

    -- Doctor profile
    INSERT INTO doctors (user_id, academic_title, specialization, office_location)
    VALUES (
        '00000000-0000-0000-0000-000000000002',
        'Dr.',
        'Computer Science',
        'Building A, Room 204'
    );

    -- Student profile
    INSERT INTO students (
        user_id, student_code, enrollment_year, specialization, track,
        current_level, academic_status, cgpa, total_credits_passed, semesters_enrolled,
        remedial_math_required, remedial_math_passed
    ) VALUES (
        '00000000-0000-0000-0000-000000000003',
        '2024CS001',
        2024,
        'CS',
        'science_math',
        'freshman',
        'active',
        0.000,
        0,
        0,
        FALSE,
        FALSE
    );

    INSERT INTO seed_logs (seed_name, rows_affected) VALUES ('001_demo_users.sql', 3);
    RAISE NOTICE 'Seed 001 completed';
END $$;
