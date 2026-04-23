-- =============================================================================
-- Seed 003: Complete Curriculum
-- All courses, prerequisites, and sample offerings per bylaw
-- =============================================================================

DO $$
DECLARE
    v_cs_dept INT;
    v_is_dept INT;
    v_it_dept INT;
    v_se_dept INT;
    v_fall2025_id INT;
    v_spring2026_id INT;
    v_doctor_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM seed_logs WHERE seed_name = '003_complete_curriculum.sql') THEN
        RAISE NOTICE 'Seed 003 already run, skipping';
        RETURN;
    END IF;

    SELECT id INTO v_cs_dept FROM departments WHERE code = 'CS';
    SELECT id INTO v_is_dept FROM departments WHERE code = 'IS';
    SELECT id INTO v_it_dept FROM departments WHERE code = 'IT';
    SELECT id INTO v_se_dept FROM departments WHERE code = 'SE';
    SELECT id INTO v_fall2025_id FROM semesters WHERE label = 'Fall 2025';
    SELECT id INTO v_spring2026_id FROM semesters WHERE label = 'Spring 2026';
    SELECT id INTO v_doctor_id FROM doctors WHERE user_id = '00000000-0000-0000-0000-000000000002';

    -- =========================================================================
    -- UNIVERSITY REQUIREMENTS (12 credits total)
    -- =========================================================================
    INSERT INTO courses (code, name_ar, name_en, credits, category, level, is_mandatory) VALUES
    ('UNV111', 'كتابة التقارير التقنية',   'Technical Report Writing', 1, 'university_req', 1, TRUE),
    ('UNV112', 'قضايا مجتمعية',             'Societal Issues',          1, 'university_req', 1, TRUE),
    ('UNV113', 'اللغة الإنجليزية (1)',      'English Language (1)',     1, 'university_req', 1, TRUE),
    ('UNV114', 'مهارات التواصل',            'Communication Skills',     1, 'university_req', 1, TRUE),
    ('UNV211', 'اللغة الإنجليزية (2)',      'English Language (2)',     1, 'university_req', 2, FALSE),
    ('UNV212', 'مهارات التفكير النقدي',     'Critical Thinking Skills', 1, 'university_req', 2, FALSE),
    ('UNV311', 'إدارة المشاريع',            'Project Management Basics',2, 'university_req', 3, FALSE),
    ('UNV312', 'ريادة الأعمال',             'Entrepreneurship',         2, 'university_req', 3, FALSE),
    ('UNV411', 'أخلاقيات مهنة الحاسب',     'Computer Ethics',          2, 'university_req', 4, FALSE);

    -- =========================================================================
    -- BASIC SCIENCES & MATHEMATICS (15 credits)
    -- =========================================================================
    INSERT INTO courses (code, name_ar, name_en, credits, category, level, is_mandatory) VALUES
    ('BS111', 'رياضيات (1)',               'Math (1)',                          3, 'math_science', 1, TRUE),
    ('BS112', 'رياضيات تقطيعية',          'Discrete Mathematics',              3, 'math_science', 1, TRUE),
    ('BS113', 'رياضيات (2)',               'Math (2)',                          3, 'math_science', 1, TRUE),
    ('BS114', 'رياضيات (3)',               'Math (3)',                          3, 'math_science', 2, TRUE),
    ('BS115', 'إلكترونيات',               'Electronics',                       3, 'math_science', 1, TRUE),
    ('BS116', 'احتمالات وإحصاء (1)',      'Probability and Statistics (1)',    3, 'math_science', 1, TRUE),
    ('BS117', 'بحوث العمليات',            'Operations Research',               3, 'math_science', 2, TRUE);

    -- =========================================================================
    -- BASIC COMPUTING SCIENCES (15 credits)
    -- =========================================================================
    INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory) VALUES
    ('CS111', 'أساسيات علوم الحاسب',      'Fundamentals of Computer Science', 3, 'basic_computing', v_cs_dept, 1, TRUE),
    ('CS112', 'البرمجة الهيكلية',          'Structured Programming',           3, 'basic_computing', v_cs_dept, 1, TRUE),
    ('CS211', 'البرمجة كائنية التوجه',     'Object Oriented Programming',      3, 'basic_computing', v_cs_dept, 2, TRUE),
    ('CS212', 'هياكل البيانات',            'Data Structures',                  3, 'basic_computing', v_cs_dept, 2, TRUE),
    ('IS111', 'مقدمة في نظم المعلومات',   'Intro to Information Systems',     3, 'basic_computing', v_is_dept, 1, TRUE),
    ('IT111', 'أساسيات رقمية',             'Digital Fundamentals',             3, 'basic_computing', v_it_dept, 1, TRUE);

    -- =========================================================================
    -- COMPUTER SCIENCE - APPLIED COURSES (38 mandatory credits)
    -- =========================================================================
    INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory) VALUES
    -- Level 2 (prerequisite: CS212)
    ('CS213', 'تحليل الخوارزميات',        'Algorithms Analysis',              3, 'applied_computing', v_cs_dept, 2, TRUE),
    ('CS214', 'نظم التشغيل',              'Operating Systems',                3, 'applied_computing', v_cs_dept, 2, TRUE),
    -- Level 3
    ('CS311', 'أمن الحاسب',               'Computer Security',                3, 'applied_computing', v_cs_dept, 3, TRUE),
    ('CS312', 'تنظيم الحاسب',             'Computer Organization',            3, 'applied_computing', v_cs_dept, 3, TRUE),
    ('CS313', 'الذكاء الاصطناعي',         'Artificial Intelligence',           3, 'applied_computing', v_cs_dept, 3, TRUE),
    ('CS314', 'التعلم الآلي',              'Machine Learning',                 3, 'applied_computing', v_cs_dept, 3, TRUE),
    ('CS315', 'تحليل البيانات الضخمة',    'Big Data Analysis',                3, 'applied_computing', v_cs_dept, 3, TRUE),
    ('CS316', 'نظم التشغيل المتقدمة',     'Advanced Operating Systems',       3, 'applied_computing', v_cs_dept, 3, TRUE),
    -- Level 4
    ('CS411', 'نظرية الحوسبة',             'Computation Theory',               3, 'applied_computing', v_cs_dept, 4, TRUE),
    ('CS412', 'إنترنت الأشياء',            'Internet of Things',               3, 'applied_computing', v_cs_dept, 4, TRUE),
    ('CS413', 'حل المشكلات واتخاذ القرارات','Problem Solving & Decision Making',3, 'applied_computing', v_cs_dept, 4, TRUE),
    ('CS414', 'علم البيانات',              'Data Science',                     3, 'applied_computing', v_cs_dept, 4, TRUE),
    ('CS415', 'الحوسبة السحابية',          'Cloud Computing',                  3, 'applied_computing', v_cs_dept, 4, TRUE),
    ('CS416', 'المترجمات',                 'Compilers',                        3, 'applied_computing', v_cs_dept, 4, TRUE);

    -- CS Electives (choose 10 credits)
    INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory) VALUES
    ('CS321', 'التشفير',                   'Cryptography',                     3, 'elective', v_cs_dept, 3, FALSE),
    ('CS322', 'أمن الشبكات والإنترنت',    'Network & Internet Security',      3, 'elective', v_cs_dept, 3, FALSE),
    ('CS331', 'تفاعل الإنسان والحاسب',    'Human Computer Interaction',       3, 'elective', v_cs_dept, 3, FALSE),
    ('CS332', 'اكتشاف المعرفة',           'Knowledge Discovery',              3, 'elective', v_cs_dept, 3, FALSE),
    ('CS342', 'نماذج البيانات والتصور',    'Data Models and Visualization',    3, 'elective', v_cs_dept, 3, FALSE),
    ('CS423', 'الحوسبة المتنقلة',          'Mobile Computing',                 3, 'elective', v_cs_dept, 4, FALSE),
    ('CS424', 'برمجة التطبيقات المحمولة', 'Mobile Application Programming',   3, 'elective', v_cs_dept, 4, FALSE),
    ('CS433', 'موضوعات مختارة في الذكاء الاصطناعي','Selected Topics in AI',   3, 'elective', v_cs_dept, 4, FALSE),
    ('CS434', 'الحوسبة عالية الأداء',     'High Performance Computing',       3, 'elective', v_cs_dept, 4, FALSE),
    ('CS443', 'معالجة اللغة الطبيعية',    'Natural Language Processing',      3, 'elective', v_cs_dept, 4, FALSE);

    -- =========================================================================
    -- INFORMATION SYSTEMS - APPLIED COURSES
    -- =========================================================================
    INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory) VALUES
    ('IS211', 'نظم قواعد البيانات',        'Database Systems',                 3, 'applied_computing', v_is_dept, 2, TRUE),
    ('IS212', 'أساليب التحسين',            'Optimization Methods',             3, 'applied_computing', v_is_dept, 2, TRUE),
    ('IS311', 'تحليل وتصميم نظم المعلومات','Analysis and Design of IS',        3, 'applied_computing', v_is_dept, 3, TRUE),
    ('IS312', 'إدارة قواعد البيانات',      'Database Management Systems',      3, 'applied_computing', v_is_dept, 3, TRUE),
    ('IS313', 'إدارة الملفات ومعالجتها',  'File Management & Processing',     3, 'applied_computing', v_is_dept, 3, TRUE),
    ('IS314', 'استرجاع المعلومات',         'Information Retrieval',            3, 'applied_computing', v_is_dept, 3, TRUE),
    ('IS315', 'مستودعات البيانات',         'Data Warehousing',                 3, 'applied_computing', v_is_dept, 3, TRUE),
    ('IS316', 'تحليل البيانات وإدارتها',  'Data Analytics & Management',      3, 'applied_computing', v_is_dept, 3, TRUE),
    ('IS317', 'تطوير نظم المعلومات الويبية','Web-based IS Development',        3, 'applied_computing', v_is_dept, 3, TRUE),
    ('IS318', 'نظرية المعلومات وضغط البيانات','Information Theory & Data Compression',3,'applied_computing',v_is_dept,3,TRUE),
    ('IS411', 'استخراج البيانات',          'Data Mining',                      3, 'applied_computing', v_is_dept, 4, TRUE),
    ('IS412', 'إدارة مشاريع نظم المعلومات','IS Project Management',            3, 'applied_computing', v_is_dept, 4, TRUE),
    ('IS413', 'موضوعات مختارة في هندسة نظم المعلومات','Selected Topics in IS Engineering',3,'applied_computing',v_is_dept,4,TRUE);

    INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory) VALUES
    ('IS321', 'موضوعات مختارة في هندسة البيانات','Selected Topics in Data Engineering',3,'elective',v_is_dept,3,FALSE),
    ('IS322', 'قواعد البيانات السحابية',   'Cloud Databases',                  3, 'elective', v_is_dept, 3, FALSE),
    ('IS331', 'نظم المعلومات المؤسسية',    'Enterprise Information Systems',   3, 'elective', v_is_dept, 3, FALSE),
    ('IS332', 'نظم معلومات الإدارة',       'Management Information Systems',   3, 'elective', v_is_dept, 3, FALSE),
    ('IS341', 'ضمان جودة نظم المعلومات',  'IS Quality Assurance',             3, 'elective', v_is_dept, 3, FALSE),
    ('IS342', 'أمن نظم المعلومات وإدارة المخاطر','IS Security & Risk Management',3,'elective',v_is_dept,3,FALSE),
    ('IS351', 'معالجة وتحليل البيانات',    'Data Processing & Analysis',       3, 'elective', v_is_dept, 3, FALSE),
    ('IS414', 'موضوعات مختارة في قواعد البيانات','Selected Topics in Databases',3,'elective',v_is_dept,4,FALSE),
    ('IS415', 'منهجيات تطوير نظم المعلومات','IS Development Methodologies',    3, 'elective', v_is_dept, 4, FALSE),
    ('IS423', 'قواعد البيانات الموزعة',    'Distributed Databases',            3, 'elective', v_is_dept, 4, FALSE),
    ('IS424', 'موضوعات متقدمة في نظم المعلومات','Selected Topics in Advanced IS',3,'elective',v_is_dept,4,FALSE),
    ('IS433', 'التجارة الإلكترونية',       'E-Business',                       3, 'elective', v_is_dept, 4, FALSE),
    ('IS434', 'إدارة العمليات التجارية',   'Business Process Management',      3, 'elective', v_is_dept, 4, FALSE),
    ('IS444', 'تدقيق وضبط نظم المعلومات', 'IS Audit & Control',               3, 'elective', v_is_dept, 4, FALSE);

    -- =========================================================================
    -- INFORMATION TECHNOLOGY - APPLIED COURSES
    -- =========================================================================
    INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory) VALUES
    ('IT211', 'تصميم الدوائر المنطقية',    'Digital Logic Design',             3, 'applied_computing', v_it_dept, 2, TRUE),
    ('IT311', 'الحاسوب الرسومي',           'Computer Graphics',                3, 'applied_computing', v_it_dept, 3, TRUE),
    ('IT312', 'التعرف على الأنماط',        'Pattern Recognition',              3, 'applied_computing', v_it_dept, 3, TRUE),
    ('IT313', 'أمن شبكات الحاسب',          'Information & Computer Network Security',3,'applied_computing',v_it_dept,3,TRUE),
    ('IT314', 'الإشارات والأنظمة',         'Signals & Systems',                3, 'applied_computing', v_it_dept, 3, TRUE),
    ('IT315', 'المعالجات الدقيقة',         'Microprocessors',                  3, 'applied_computing', v_it_dept, 3, TRUE),
    ('IT316', 'معالجة الصور',              'Image Processing',                 3, 'applied_computing', v_it_dept, 3, TRUE),
    ('IT317', 'شبكات الحاسب المتقدمة',     'Advanced Computer Networks',       3, 'applied_computing', v_it_dept, 3, TRUE),
    ('IT318', 'معمارية الحاسب',            'Computer Architecture',            3, 'applied_computing', v_it_dept, 3, TRUE),
    ('IT319', 'الوسائط الرقمية المتعددة',  'Digital Multimedia',               3, 'applied_computing', v_it_dept, 3, TRUE),
    ('IT411', 'أنظمة الروبوتات',           'Robot Systems',                    3, 'applied_computing', v_it_dept, 4, TRUE),
    ('IT413', 'تكنولوجيا الاتصالات',       'Communication Technology',         3, 'applied_computing', v_it_dept, 4, TRUE),
    ('IT414', 'الأمن السيبراني',           'Cyber Security',                   3, 'applied_computing', v_it_dept, 4, TRUE),
    ('IT415', 'شبكات الحوسبة السحابية',    'Cloud Computing Networks',         3, 'applied_computing', v_it_dept, 4, TRUE);

    INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory) VALUES
    ('IT321', 'نظم تشغيل الشبكات',        'Network Operating Systems',        3, 'elective', v_it_dept, 3, FALSE),
    ('IT322', 'تكنولوجيا البلوك تشين',     'Blockchain Technology',            3, 'elective', v_it_dept, 3, FALSE),
    ('IT331', 'الأنظمة المدمجة',           'Embedded Systems',                 3, 'elective', v_it_dept, 3, FALSE),
    ('IT332', 'الرؤية الآلية',             'Machine Vision',                   3, 'elective', v_it_dept, 3, FALSE),
    ('IT341', 'الرسوم المتحركة بالحاسب',  'Computer Animation',               3, 'elective', v_it_dept, 3, FALSE),
    ('IT342', 'رسوميات الحاسب المتقدمة',  'Advanced Computer Graphics',       3, 'elective', v_it_dept, 3, FALSE),
    ('IT423', 'شبكات المحمول',             'Mobile Networks',                  3, 'elective', v_it_dept, 4, FALSE),
    ('IT424', 'موضوعات مختارة في الشبكات','Selected Topics in Networks',       3, 'elective', v_it_dept, 4, FALSE),
    ('IT433', 'التعرف المتقدم على الأنماط','Advanced Pattern Recognition',     3, 'elective', v_it_dept, 4, FALSE),
    ('IT434', 'موضوعات مختارة في الأنظمة المدمجة','Selected Topics in Embedded Systems',3,'elective',v_it_dept,4,FALSE),
    ('IT443', 'معالجة الصور المتقدمة',     'Advanced Image Processing',        3, 'elective', v_it_dept, 4, FALSE),
    ('IT444', 'موضوعات مختارة في الوسائط المتعددة','Selected Topics in Multimedia',3,'elective',v_it_dept,4,FALSE);

    -- =========================================================================
    -- SOFTWARE ENGINEERING - APPLIED COURSES
    -- =========================================================================
    INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory) VALUES
    ('SE211', 'هندسة البرمجيات',           'Software Engineering',             3, 'applied_computing', v_se_dept, 2, TRUE),
    ('SE311', 'تحليل متطلبات البرمجيات',  'Software Requirements Analysis',   3, 'applied_computing', v_se_dept, 3, TRUE),
    ('SE312', 'هندسة البرمجيات لتطبيقات الإنترنت','Software Engineering for Internet Applications',3,'applied_computing',v_se_dept,3,TRUE),
    ('SE313', 'تصميم وهندسة البرمجيات',   'Software Design & Architecture',   3, 'applied_computing', v_se_dept, 3, TRUE),
    ('SE314', 'ضمان جودة البرمجيات',       'Software Quality Assurance',       3, 'applied_computing', v_se_dept, 3, TRUE),
    ('SE315', 'هندسة البرمجيات المتقدمة', 'Advanced Software Engineering',    3, 'applied_computing', v_se_dept, 3, TRUE),
    ('SE316', 'تصميم واجهة المستخدم',      'User Interface Design',            3, 'applied_computing', v_se_dept, 3, TRUE),
    ('SE411', 'إدارة مشاريع البرمجيات',   'Software Project Management',      3, 'applied_computing', v_se_dept, 4, TRUE),
    ('SE412', 'اختبار البرمجيات والتحقق', 'Software Testing & Validation',    3, 'applied_computing', v_se_dept, 4, TRUE),
    ('SE413', 'نهج هندسة البرمجيات في تفاعل الإنسان والحاسب','SE Approach to HCI',3,'applied_computing',v_se_dept,4,TRUE),
    ('SE415', 'أخلاقيات هندسة البرمجيات', 'Ethics in Software Engineering',   3, 'applied_computing', v_se_dept, 4, TRUE),
    ('SE416', 'تطور البرمجيات وصيانتها',  'Software Evolution & Maintenance', 3, 'applied_computing', v_se_dept, 4, TRUE),
    ('SE417', 'تصميم برمجيات الأنظمة المدمجة','Embedded Systems Software Design',3,'applied_computing',v_se_dept,4,TRUE);

    INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory) VALUES
    ('SE321', 'أمن البرمجيات',             'Software Security',                3, 'elective', v_se_dept, 3, FALSE),
    ('SE322', 'أنماط التصميم',             'Design Patterns',                  3, 'elective', v_se_dept, 3, FALSE),
    ('SE331', 'إدارة تطوير البرمجيات',     'Software Development Management',  3, 'elective', v_se_dept, 3, FALSE),
    ('SE332', 'تطوير تطبيقات الويب',       'Web Application Development',      3, 'elective', v_se_dept, 3, FALSE),
    ('SE341', 'موضوعات مختارة في هندسة البرمجيات (1)','Selected Topics in SE (1)',3,'elective',v_se_dept,3,FALSE),
    ('SE342', 'ممارسة هندسة البرمجيات المهنية','Professional SE Practice',     3, 'elective', v_se_dept, 3, FALSE),
    ('SE423', 'هندسة قابلية استخدام البرمجيات','Software Usability Engineering',3,'elective',v_se_dept,4,FALSE),
    ('SE424', 'تطبيقات الهاتف المحمول',   'Mobile Applications',              3, 'elective', v_se_dept, 4, FALSE),
    ('SE433', 'تطوير الألعاب',             'Games Development',                3, 'elective', v_se_dept, 4, FALSE),
    ('SE434', 'النمذجة والتصميم ثلاثي الأبعاد','3D Modeling & Design',         3, 'elective', v_se_dept, 4, FALSE),
    ('SE443', 'الأساليب الشكلية في هندسة البرمجيات','Formal Methods in SE',   3, 'elective', v_se_dept, 4, FALSE),
    ('SE444', 'موضوعات مختارة في هندسة البرمجيات','Selected Topics in SE',     3, 'elective', v_se_dept, 4, FALSE);

    -- =========================================================================
    -- GRADUATION PROJECTS & TRAINING (non-credit bearing)
    -- =========================================================================
    INSERT INTO courses (code, name_ar, name_en, credits, category, level, is_mandatory, is_credit_bearing) VALUES
    -- CS Projects
    ('PR411', 'مشروع التخرج (1)',  'Graduation Project (1)', 3, 'project', 4, TRUE, TRUE),
    ('PR412', 'مشروع التخرج (2)',  'Graduation Project (2)', 3, 'project', 4, TRUE, TRUE),
    -- Training (non-credit bearing per bylaw)
    ('TR311', 'التدريب الصيفي (1)', 'Summer Training (1)',   3, 'training', 3, TRUE, FALSE),
    ('TR411', 'التدريب الصيفي (2)', 'Summer Training (2)',   3, 'training', 4, TRUE, FALSE);

    -- =========================================================================
    -- COURSE PREREQUISITES (encoded per bylaw)
    -- =========================================================================

    -- Basic chain
    INSERT INTO course_prerequisites (course_id, prereq_course_id) VALUES
    -- CS112 needs CS111
    ((SELECT id FROM courses WHERE code='CS112'), (SELECT id FROM courses WHERE code='CS111')),
    -- BS113 (Math 2) needs BS111 (Math 1)
    ((SELECT id FROM courses WHERE code='BS113'), (SELECT id FROM courses WHERE code='BS111')),
    -- BS114 (Math 3) needs BS113
    ((SELECT id FROM courses WHERE code='BS114'), (SELECT id FROM courses WHERE code='BS113')),
    -- BS116 needs BS111
    ((SELECT id FROM courses WHERE code='BS116'), (SELECT id FROM courses WHERE code='BS111')),
    -- BS117 needs BS111
    ((SELECT id FROM courses WHERE code='BS117'), (SELECT id FROM courses WHERE code='BS111')),
    -- CS211 OOP needs CS112
    ((SELECT id FROM courses WHERE code='CS211'), (SELECT id FROM courses WHERE code='CS112')),
    -- CS212 Data Structures needs CS112
    ((SELECT id FROM courses WHERE code='CS212'), (SELECT id FROM courses WHERE code='CS112')),
    -- IS211 Database Systems needs CS112
    ((SELECT id FROM courses WHERE code='IS211'), (SELECT id FROM courses WHERE code='CS112')),
    -- IT211 Digital Logic Design needs BS115
    ((SELECT id FROM courses WHERE code='IT211'), (SELECT id FROM courses WHERE code='BS115')),
    -- SE211 Software Engineering needs CS112
    ((SELECT id FROM courses WHERE code='SE211'), (SELECT id FROM courses WHERE code='CS112')),
    -- CS213 Algorithms Analysis needs CS212
    ((SELECT id FROM courses WHERE code='CS213'), (SELECT id FROM courses WHERE code='CS212')),
    -- CS214 OS needs CS212
    ((SELECT id FROM courses WHERE code='CS214'), (SELECT id FROM courses WHERE code='CS212')),
    -- IS212 Optimization needs IS211
    ((SELECT id FROM courses WHERE code='IS212'), (SELECT id FROM courses WHERE code='IS211')),
    -- CS311 Security needs CS212
    ((SELECT id FROM courses WHERE code='CS311'), (SELECT id FROM courses WHERE code='CS212')),
    -- CS312 Computer Org needs CS212
    ((SELECT id FROM courses WHERE code='CS312'), (SELECT id FROM courses WHERE code='CS212')),
    -- CS313 AI needs CS212
    ((SELECT id FROM courses WHERE code='CS313'), (SELECT id FROM courses WHERE code='CS212')),
    -- CS314 ML needs CS313
    ((SELECT id FROM courses WHERE code='CS314'), (SELECT id FROM courses WHERE code='CS313')),
    -- CS315 Big Data needs IS311
    ((SELECT id FROM courses WHERE code='CS315'), (SELECT id FROM courses WHERE code='IS311')),
    -- CS316 Advanced OS needs CS214
    ((SELECT id FROM courses WHERE code='CS316'), (SELECT id FROM courses WHERE code='CS214')),
    -- IS311 Analysis Design needs IS211
    ((SELECT id FROM courses WHERE code='IS311'), (SELECT id FROM courses WHERE code='IS211')),
    -- IS312 DBMS needs IS211
    ((SELECT id FROM courses WHERE code='IS312'), (SELECT id FROM courses WHERE code='IS211')),
    -- IS313 File Mgmt needs IS211
    ((SELECT id FROM courses WHERE code='IS313'), (SELECT id FROM courses WHERE code='IS211')),
    -- IS314 Info Retrieval needs IS211
    ((SELECT id FROM courses WHERE code='IS314'), (SELECT id FROM courses WHERE code='IS211')),
    -- IS315 Data Warehousing needs IS312
    ((SELECT id FROM courses WHERE code='IS315'), (SELECT id FROM courses WHERE code='IS312')),
    -- IS316 Data Analytics needs IS312
    ((SELECT id FROM courses WHERE code='IS316'), (SELECT id FROM courses WHERE code='IS312')),
    -- IS317 Web IS needs IS311
    ((SELECT id FROM courses WHERE code='IS317'), (SELECT id FROM courses WHERE code='IS311')),
    -- IS318 Info Theory needs BS116
    ((SELECT id FROM courses WHERE code='IS318'), (SELECT id FROM courses WHERE code='BS116')),
    -- IT311 Graphics needs IT211
    ((SELECT id FROM courses WHERE code='IT311'), (SELECT id FROM courses WHERE code='IT211')),
    -- IT312 Pattern Recog needs IT211
    ((SELECT id FROM courses WHERE code='IT312'), (SELECT id FROM courses WHERE code='IT211')),
    -- IT313 Network Security needs IT211
    ((SELECT id FROM courses WHERE code='IT313'), (SELECT id FROM courses WHERE code='IT211')),
    -- IT314 Signals needs IT211
    ((SELECT id FROM courses WHERE code='IT314'), (SELECT id FROM courses WHERE code='IT211')),
    -- IT315 Microprocessors needs IT211
    ((SELECT id FROM courses WHERE code='IT315'), (SELECT id FROM courses WHERE code='IT211')),
    -- IT316 Image Processing needs IT311
    ((SELECT id FROM courses WHERE code='IT316'), (SELECT id FROM courses WHERE code='IT311')),
    -- IT317 Advanced Networks needs IT311
    ((SELECT id FROM courses WHERE code='IT317'), (SELECT id FROM courses WHERE code='IT311')),
    -- IT318 Computer Architecture needs IT315
    ((SELECT id FROM courses WHERE code='IT318'), (SELECT id FROM courses WHERE code='IT315')),
    -- IT319 Digital Multimedia needs IT311
    ((SELECT id FROM courses WHERE code='IT319'), (SELECT id FROM courses WHERE code='IT311')),
    -- SE311 Req Analysis needs SE211
    ((SELECT id FROM courses WHERE code='SE311'), (SELECT id FROM courses WHERE code='SE211')),
    -- SE312 SE Internet needs SE211
    ((SELECT id FROM courses WHERE code='SE312'), (SELECT id FROM courses WHERE code='SE211')),
    -- SE313 Design Arch needs SE211
    ((SELECT id FROM courses WHERE code='SE313'), (SELECT id FROM courses WHERE code='SE211')),
    -- SE314 Quality needs SE311
    ((SELECT id FROM courses WHERE code='SE314'), (SELECT id FROM courses WHERE code='SE311')),
    -- SE315 Advanced SE needs SE313
    ((SELECT id FROM courses WHERE code='SE315'), (SELECT id FROM courses WHERE code='SE313')),
    -- SE316 UI Design needs SE211
    ((SELECT id FROM courses WHERE code='SE316'), (SELECT id FROM courses WHERE code='SE211')),
    -- CS411 Computation Theory needs CS213
    ((SELECT id FROM courses WHERE code='CS411'), (SELECT id FROM courses WHERE code='CS213')),
    -- CS412 IoT needs CS312
    ((SELECT id FROM courses WHERE code='CS412'), (SELECT id FROM courses WHERE code='CS312')),
    -- CS413 Problem Solving needs CS313
    ((SELECT id FROM courses WHERE code='CS413'), (SELECT id FROM courses WHERE code='CS313')),
    -- CS414 Data Science needs CS314 and CS315
    ((SELECT id FROM courses WHERE code='CS414'), (SELECT id FROM courses WHERE code='CS314')),
    -- CS415 Cloud needs CS312
    ((SELECT id FROM courses WHERE code='CS415'), (SELECT id FROM courses WHERE code='CS312')),
    -- CS416 Compilers needs CS213
    ((SELECT id FROM courses WHERE code='CS416'), (SELECT id FROM courses WHERE code='CS213')),
    -- IS411 Data Mining needs IS316
    ((SELECT id FROM courses WHERE code='IS411'), (SELECT id FROM courses WHERE code='IS316')),
    -- IS412 IS Project Mgmt needs IS311
    ((SELECT id FROM courses WHERE code='IS412'), (SELECT id FROM courses WHERE code='IS311')),
    -- IS413 Selected Topics needs IS311
    ((SELECT id FROM courses WHERE code='IS413'), (SELECT id FROM courses WHERE code='IS311')),
    -- IT411 Robot Systems needs IT314
    ((SELECT id FROM courses WHERE code='IT411'), (SELECT id FROM courses WHERE code='IT314')),
    -- IT413 Communication Tech needs IT314
    ((SELECT id FROM courses WHERE code='IT413'), (SELECT id FROM courses WHERE code='IT314')),
    -- IT414 Cyber Security needs IT313
    ((SELECT id FROM courses WHERE code='IT414'), (SELECT id FROM courses WHERE code='IT313')),
    -- IT415 Cloud Networks needs IT317
    ((SELECT id FROM courses WHERE code='IT415'), (SELECT id FROM courses WHERE code='IT317')),
    -- SE411 Project Mgmt needs SE311
    ((SELECT id FROM courses WHERE code='SE411'), (SELECT id FROM courses WHERE code='SE311')),
    -- SE412 Testing needs SE314
    ((SELECT id FROM courses WHERE code='SE412'), (SELECT id FROM courses WHERE code='SE314')),
    -- SE413 SE HCI needs SE316
    ((SELECT id FROM courses WHERE code='SE413'), (SELECT id FROM courses WHERE code='SE316')),
    -- SE415 Ethics needs SE411
    ((SELECT id FROM courses WHERE code='SE415'), (SELECT id FROM courses WHERE code='SE411')),
    -- SE416 Evolution needs SE412
    ((SELECT id FROM courses WHERE code='SE416'), (SELECT id FROM courses WHERE code='SE412')),
    -- SE417 Embedded SE needs SE313
    ((SELECT id FROM courses WHERE code='SE417'), (SELECT id FROM courses WHERE code='SE313')),
    -- CS321 Cryptography needs CS311
    ((SELECT id FROM courses WHERE code='CS321'), (SELECT id FROM courses WHERE code='CS311')),
    -- CS322 Network Security needs CS311
    ((SELECT id FROM courses WHERE code='CS322'), (SELECT id FROM courses WHERE code='CS311')),
    -- CS332 Knowledge Discovery needs CS313
    ((SELECT id FROM courses WHERE code='CS332'), (SELECT id FROM courses WHERE code='CS313')),
    -- CS423 Mobile Computing needs CS312
    ((SELECT id FROM courses WHERE code='CS423'), (SELECT id FROM courses WHERE code='CS312')),
    -- CS424 Mobile App needs CS211
    ((SELECT id FROM courses WHERE code='CS424'), (SELECT id FROM courses WHERE code='CS211')),
    -- CS433 Topics AI needs CS313
    ((SELECT id FROM courses WHERE code='CS433'), (SELECT id FROM courses WHERE code='CS313')),
    -- CS434 High Performance needs CS316
    ((SELECT id FROM courses WHERE code='CS434'), (SELECT id FROM courses WHERE code='CS316')),
    -- CS443 NLP needs CS313
    ((SELECT id FROM courses WHERE code='CS443'), (SELECT id FROM courses WHERE code='CS313'));

    -- Graduation Project PR411 requires 85 credits (handled in service layer)
    -- PR412 requires PR411 completion
    INSERT INTO course_prerequisites (course_id, prereq_course_id) VALUES
    ((SELECT id FROM courses WHERE code='PR412'), (SELECT id FROM courses WHERE code='PR411'));

    -- Training TR411 requires TR311
    INSERT INTO course_prerequisites (course_id, prereq_course_id) VALUES
    ((SELECT id FROM courses WHERE code='TR411'), (SELECT id FROM courses WHERE code='TR311'));

    -- =========================================================================
    -- SAMPLE COURSE OFFERINGS FOR FALL 2025
    -- =========================================================================
    IF v_fall2025_id IS NOT NULL THEN
        INSERT INTO course_offerings (semester_id, course_id, doctor_id, section, capacity) VALUES
        (v_fall2025_id, (SELECT id FROM courses WHERE code='CS111'), v_doctor_id, 'A', 60),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='CS112'), v_doctor_id, 'A', 60),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='BS111'), NULL, 'A', 60),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='BS112'), NULL, 'A', 60),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='BS115'), NULL, 'A', 60),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='IS111'), NULL, 'A', 60),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='IT111'), NULL, 'A', 60),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='UNV111'), NULL, 'A', 120),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='UNV112'), NULL, 'A', 120),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='UNV113'), NULL, 'A', 120),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='UNV114'), NULL, 'A', 120),
        -- Level 2 offerings
        (v_fall2025_id, (SELECT id FROM courses WHERE code='CS211'), v_doctor_id, 'A', 55),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='CS212'), v_doctor_id, 'A', 55),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='CS213'), v_doctor_id, 'A', 55),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='CS214'), v_doctor_id, 'A', 55),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='BS113'), NULL, 'A', 60),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='BS114'), NULL, 'A', 60),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='BS116'), NULL, 'A', 60),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='IS211'), v_doctor_id, 'A', 55),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='IT211'), v_doctor_id, 'A', 55),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='SE211'), v_doctor_id, 'A', 55),
        -- Level 3 CS offerings
        (v_fall2025_id, (SELECT id FROM courses WHERE code='CS311'), v_doctor_id, 'A', 50),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='CS312'), v_doctor_id, 'A', 50),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='CS313'), v_doctor_id, 'A', 50),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='CS314'), v_doctor_id, 'A', 50),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='CS315'), v_doctor_id, 'A', 50),
        (v_fall2025_id, (SELECT id FROM courses WHERE code='CS316'), v_doctor_id, 'A', 50);
    END IF;

    -- SPRING 2026 offerings
    IF v_spring2026_id IS NOT NULL THEN
        INSERT INTO course_offerings (semester_id, course_id, doctor_id, section, capacity) VALUES
        (v_spring2026_id, (SELECT id FROM courses WHERE code='CS111'), v_doctor_id, 'A', 60),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='CS112'), v_doctor_id, 'A', 60),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='BS111'), NULL, 'A', 60),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='BS113'), NULL, 'A', 60),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='BS116'), NULL, 'A', 60),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='IS111'), NULL, 'A', 60),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='IT111'), NULL, 'A', 60),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='UNV111'), NULL, 'A', 120),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='UNV113'), NULL, 'A', 120),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='CS211'), v_doctor_id, 'A', 55),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='CS212'), v_doctor_id, 'A', 55),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='CS213'), v_doctor_id, 'A', 55),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='BS114'), NULL, 'A', 60),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='BS117'), NULL, 'A', 60),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='IS211'), v_doctor_id, 'A', 55),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='IS212'), v_doctor_id, 'A', 55),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='IT211'), v_doctor_id, 'A', 55),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='SE211'), v_doctor_id, 'A', 55),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='CS311'), v_doctor_id, 'A', 50),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='CS313'), v_doctor_id, 'A', 50),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='CS411'), v_doctor_id, 'A', 45),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='CS412'), v_doctor_id, 'A', 45),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='CS414'), v_doctor_id, 'A', 45),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='CS415'), v_doctor_id, 'A', 45),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='PR411'), v_doctor_id, 'A', 30),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='IS311'), v_doctor_id, 'A', 50),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='IS312'), v_doctor_id, 'A', 50),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='SE311'), v_doctor_id, 'A', 50),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='SE313'), v_doctor_id, 'A', 50),
        (v_spring2026_id, (SELECT id FROM courses WHERE code='IT311'), v_doctor_id, 'A', 50);
    END IF;

    INSERT INTO seed_logs (seed_name, rows_affected) VALUES ('003_complete_curriculum.sql', 200);
    RAISE NOTICE 'Seed 003 completed';
END $$;
