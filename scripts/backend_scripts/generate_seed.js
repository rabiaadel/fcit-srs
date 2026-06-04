const fs = require('fs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Helpers for UUID and hashing
const generateUUID = () => crypto.randomUUID();

const ARABIC_FIRST_NAMES_MALE = ['محمد', 'أحمد', 'محمود', 'مصطفى', 'علي', 'حسين', 'خالد', 'عمر', 'طارق', 'يوسف', 'حسن', 'إبراهيم', 'عبدالله', 'عبدالرحمن', 'ياسين', 'زياد', 'كريم', 'رامي', 'هاني', 'تامر'];
const ARABIC_FIRST_NAMES_FEMALE = ['فاطمة', 'عائشة', 'مريم', 'سارة', 'نور', 'ياسمين', 'منى', 'هدى', 'نهى', 'ريهام', 'آية', 'سلوى', 'ندى', 'إسراء', 'دينا', 'رانيا', 'دعاء', 'رحمة', 'هبة', 'شروق'];
const ARABIC_LAST_NAMES = ['محمود', 'السيد', 'حسن', 'علي', 'إبراهيم', 'عثمان', 'فاروق', 'منصور', 'صالح', 'توفيق', 'جابر', 'سلامة', 'يونس', 'سعد', 'ياسين', 'كامل', 'جلال', 'فؤاد', 'رضوان', 'النجار'];

const getRandomName = (gender) => {
    const first = gender === 'M' ? ARABIC_FIRST_NAMES_MALE : ARABIC_FIRST_NAMES_FEMALE;
    const fName = first[Math.floor(Math.random() * first.length)];
    const mName = ARABIC_LAST_NAMES[Math.floor(Math.random() * ARABIC_LAST_NAMES.length)];
    const lName = ARABIC_LAST_NAMES[Math.floor(Math.random() * ARABIC_LAST_NAMES.length)];
    return `${fName} ${mName} ${lName}`;
};

const transliterate = (arabicName) => {
    const map = {
        'محمد': 'Mohamed', 'أحمد': 'Ahmed', 'محمود': 'Mahmoud', 'مصطفى': 'Mostafa', 'علي': 'Ali', 'حسين': 'Hussein', 'خالد': 'Khaled', 'عمر': 'Omar', 'طارق': 'Tarek', 'يوسف': 'Youssef', 'حسن': 'Hassan', 'إبراهيم': 'Ibrahim', 'عبدالله': 'Abdallah', 'عبدالرحمن': 'Abdelrahman', 'ياسين': 'Yassin', 'زياد': 'Ziad', 'كريم': 'Karim', 'رامي': 'Ramy', 'هاني': 'Hany', 'تامر': 'Tamer',
        'فاطمة': 'Fatma', 'عائشة': 'Aisha', 'مريم': 'Mariam', 'سارة': 'Sarah', 'نور': 'Nour', 'ياسمين': 'Yasmine', 'منى': 'Mona', 'هدى': 'Hoda', 'نهى': 'Noha', 'ريهام': 'Reham', 'آية': 'Aya', 'سلوى': 'Salwa', 'ندى': 'Nada', 'إسراء': 'Esraa', 'دينا': 'Dina', 'رانيا': 'Rania', 'دعاء': 'Doaa', 'رحمة': 'Rahma', 'هبة': 'Heba', 'شروق': 'Shorouk',
        'السيد': 'Elsayed', 'عثمان': 'Osman', 'فاروق': 'Farouk', 'منصور': 'Mansour', 'صالح': 'Saleh', 'توفيق': 'Tawfik', 'جابر': 'Gaber', 'سلامة': 'Salama', 'يونس': 'Younes', 'سعد': 'Saad', 'كامل': 'Kamel', 'جلال': 'Galal', 'فؤاد': 'Fouad', 'رضوان': 'Radwan', 'النجار': 'Elnaggar'
    };
    
    return arabicName.split(' ').map(part => map[part] || 'El' + part).join(' ');
};

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function generateSeed() {
    let sql = `-- =============================================================================\n`;
    sql += `-- Seed 004: Realistic Data Generation\n`;
    sql += `-- 60 Students (15 per level) + 5 Doctors\n`;
    sql += `-- =============================================================================\n\n`;
    sql += `DO $$\nDECLARE\n`;
    sql += `    v_cs_dept INT; v_is_dept INT; v_it_dept INT; v_se_dept INT;\n`;
    sql += `    doc_record RECORD; off_record RECORD;\n`;
    sql += `    doc_cursor CURSOR FOR SELECT id FROM doctors;\n`;
    sql += `    off_rec RECORD; stu_rec RECORD; course_rec RECORD;\n`;
    sql += `    num_slots INT; v_sem_id INT; v_level INT;\n`;
    sql += `    v_day VARCHAR; v_start TIME; v_end TIME; v_room VARCHAR; v_type VARCHAR;\n`;
    sql += `    v_days VARCHAR[] := ARRAY['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];\n`;
    sql += `    v_times TIME[] := ARRAY['08:30:00'::TIME, '10:30:00'::TIME, '12:30:00'::TIME, '14:30:00'::TIME];\n`;
    sql += `    v_rooms VARCHAR[] := ARRAY['Hall 1', 'Hall 2', 'Hall 3', 'Hall 4', 'Lab A', 'Lab B', 'Lab C'];\n`;
    sql += `BEGIN\n`;
    sql += `    IF EXISTS (SELECT 1 FROM seed_logs WHERE seed_name = '004_realistic_data.sql') THEN\n`;
    sql += `        RAISE NOTICE 'Seed 004 already run, skipping';\n`;
    sql += `        RETURN;\n`;
    sql += `    END IF;\n\n`;
    sql += `    SELECT id INTO v_cs_dept FROM departments WHERE code = 'CS';\n`;
    sql += `    SELECT id INTO v_is_dept FROM departments WHERE code = 'IS';\n`;
    sql += `    SELECT id INTO v_it_dept FROM departments WHERE code = 'IT';\n`;
    sql += `    SELECT id INTO v_se_dept FROM departments WHERE code = 'SE';\n\n`;

    const pwHash = await bcrypt.hash('Password@2026!', 10);
    
    // --- DOCTORS (15 Total) ---
    sql += `    -- INSERT DOCTORS\n`;
    for (let i = 1; i <= 15; i++) {
        const gender = Math.random() > 0.5 ? 'M' : 'F';
        const nameAr = getRandomName(gender);
        const nameEn = transliterate(nameAr);
        const id = generateUUID();
        const email = `dr.${nameEn.split(' ')[0].toLowerCase()}${i}@fci.tanta.edu.eg`;
        
        // Distribute departments evenly
        const depts = ['cs', 'it', 'is', 'se', null];
        const dept = depts[i % depts.length];
        
        sql += `    INSERT INTO users (id, email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)\n`;
        sql += `    VALUES ('${id}', '${email}', '${pwHash}', 'doctor', '${nameAr}', '${nameEn}', TRUE, FALSE);\n`;
        
        let deptVar = dept ? `v_${dept}_dept` : `NULL`;
        sql += `    INSERT INTO doctors (user_id, academic_title, department_id)\n`;
        sql += `    VALUES ('${id}', 'Dr.', ${deptVar});\n\n`;
    }

    // --- STUDENTS ---
    // Levels: 1 (0-27 cr), 2 (28-62 cr), 3 (63-97 cr), 4 (98-138 cr)
    const levels = [
        { level: 1, minCr: 0, maxCr: 27, spec: null, year: 2025 },
        { level: 2, minCr: 28, maxCr: 62, spec: null, year: 2024 },
        { level: 3, minCr: 63, maxCr: 97, spec: ['CS', 'IT', 'IS'], year: 2023 },
        { level: 4, minCr: 98, maxCr: 135, spec: ['CS', 'IT', 'IS'], year: 2022 }
    ];

    sql += `    -- INSERT STUDENTS\n`;
    let studentIdCounter = 1;
    levels.forEach(lvlInfo => {
        sql += `    -- LEVEL ${lvlInfo.level}\n`;
        for (let i = 0; i < 15; i++) {
            const gender = Math.random() > 0.5 ? 'M' : 'F';
            const nameAr = getRandomName(gender);
            const nameEn = transliterate(nameAr);
            const id = generateUUID();
            const spec = lvlInfo.spec ? lvlInfo.spec[i % lvlInfo.spec.length] : null;
            const codePrefix = spec || 'GEN';
            const studentCode = `${lvlInfo.year}${codePrefix}${String(studentIdCounter++).padStart(4, '0')}`;
            const email = `s.${studentCode.toLowerCase()}@fci.tanta.edu.eg`;
            const credits = getRandomInt(lvlInfo.minCr, lvlInfo.maxCr);
            const gpa = (Math.random() * (4.0 - 1.5) + 1.5).toFixed(3);
            let academic_status = 'active';
            let warnings = 0;
            if (gpa < 2.0 && lvlInfo.level > 1) {
                academic_status = 'warning';
                warnings = getRandomInt(1, 2);
                if (warnings >= 2) academic_status = 'probation';
            }
            
            sql += `    INSERT INTO users (id, email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)\n`;
            sql += `    VALUES ('${id}', '${email}', '${pwHash}', 'student', '${nameAr}', '${nameEn}', TRUE, FALSE);\n`;
            
            const specVal = spec ? `'${spec}'` : `NULL`;
            sql += `    INSERT INTO students (user_id, student_code, enrollment_year, specialization, total_credits_passed, cgpa, academic_status, consecutive_warnings, total_warnings)\n`;
            sql += `    VALUES ('${id}', '${studentCode}', ${lvlInfo.year}, ${specVal}, ${credits}, ${gpa}, '${academic_status}', ${warnings}, ${warnings});\n\n`;
        }
    });

    // --- ASSIGN COURSES TO DOCTORS ---
    sql += `    -- RE-ASSIGN COURSE OFFERINGS TO DOCTORS REALISTICALLY (ROUND ROBIN)\n`;
    // We will clear existing assignments from seed 003 first
    sql += `    UPDATE course_offerings SET doctor_id = NULL;\n`;

    // Dynamic PL/pgSQL block to assign all offerings round-robin
    // Dynamic PL/pgSQL block to assign all offerings round-robin
    sql += `
        OPEN doc_cursor;
        FOR off_record IN SELECT id FROM course_offerings LOOP
            FETCH doc_cursor INTO doc_record;
            IF NOT FOUND THEN
                CLOSE doc_cursor;
                OPEN doc_cursor;
                FETCH doc_cursor INTO doc_record;
            END IF;
            UPDATE course_offerings SET doctor_id = doc_record.id WHERE id = off_record.id;
        END LOOP;
        CLOSE doc_cursor;

        -- Generate Schedules
        TRUNCATE doctor_schedule_slots RESTART IDENTITY CASCADE;
        FOR off_rec IN SELECT id FROM course_offerings LOOP
            num_slots := (random() * 1 + 1)::INT; 
            FOR i IN 1..num_slots LOOP
                v_day := v_days[(random() * 4 + 1)::INT];
                v_start := v_times[(random() * 3 + 1)::INT];
                v_end := v_start + interval '2 hours';
                v_room := v_rooms[(random() * 6 + 1)::INT];
                v_type := CASE WHEN v_room LIKE 'Lab%' THEN 'lab' ELSE 'lecture' END;

                BEGIN
                    INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
                    VALUES (off_rec.id, v_day, v_start, v_end, v_room, v_type)
                    ON CONFLICT DO NOTHING;
                EXCEPTION WHEN unique_violation THEN NULL;
                END;
            END LOOP;
        END LOOP;

        -- Generate Enrollments
        SELECT id INTO v_sem_id FROM semesters WHERE status IN ('registration', 'active') LIMIT 1;
        IF v_sem_id IS NOT NULL THEN
            FOR stu_rec IN SELECT id, COALESCE(total_credits_passed, 0) as credits FROM students LOOP
                IF stu_rec.credits >= 99 THEN
                    v_level := 4;
                ELSIF stu_rec.credits >= 66 THEN
                    v_level := 3;
                ELSIF stu_rec.credits >= 33 THEN
                    v_level := 2;
                ELSE
                    v_level := 1;
                END IF;

                FOR course_rec IN 
                    SELECT co.id FROM course_offerings co
                    JOIN courses c ON c.id = co.course_id
                    WHERE co.semester_id = v_sem_id AND c.level <= v_level
                    ORDER BY random() LIMIT 5
                LOOP
                    BEGIN
                        INSERT INTO enrollments (student_id, offering_id, semester_id, status)
                        VALUES (stu_rec.id, course_rec.id, v_sem_id, 'registered')
                        ON CONFLICT DO NOTHING;
                    EXCEPTION WHEN unique_violation THEN NULL;
                    END;
                END LOOP;
            END LOOP;
        END IF;
    `;

    sql += `    INSERT INTO seed_logs (seed_name, rows_affected) VALUES ('004_realistic_data.sql', 75);\n`;
    sql += `    RAISE NOTICE 'Seed 004 completed';\n`;
    sql += `END $$;\n`;

    fs.writeFileSync('../database/seeds/004_realistic_data.sql', sql);
    console.log('Seed file generated at database/seeds/004_realistic_data.sql');
}

generateSeed().catch(console.error);
