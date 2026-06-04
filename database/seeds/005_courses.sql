SET client_encoding = 'UTF8';

-- =============================================================================
-- 005_courses.sql — All courses from official 2024 bylaw curriculum
-- Generated from fcit_curriculum_terms_by_level_with_terms_v2.json
-- Total unique courses: 114
-- Idempotent: ON CONFLICT (code) DO UPDATE
-- =============================================================================

BEGIN;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'UNV111',
  'كتابة التقارير الفنية',
  'Technical Report Writing',
  2,
  'university_req',
  NULL,
  1,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'UNV112',
  'قضايا مجتمعية',
  'Societal Issues',
  2,
  'university_req',
  NULL,
  1,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'UNV113',
  'اللغة الإنجليزية (1)',
  'English Language (1)',
  2,
  'university_req',
  NULL,
  1,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'UNV114',
  'مهارات الاتصال',
  'Communication Skills',
  2,
  'university_req',
  NULL,
  1,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'UNV115',
  'مبادئ علم النفس',
  'Fundamentals of Psychology',
  2,
  'university_req',
  NULL,
  1,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'UNV120',
  'تسويق ومبيعات',
  'Marketing and Sales',
  2,
  'university_req',
  NULL,
  1,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'UNV116',
  'مبادئ علم الاجتماع',
  'Fundamentals of Sociology',
  2,
  'university_req',
  NULL,
  1,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'UNV117',
  'سياسات مقارنة',
  'Comparative Politics',
  2,
  'university_req',
  NULL,
  1,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'UNV118',
  'موضوعات مختارة في الإنسانيات',
  'Selected Topics in Humanities',
  2,
  'university_req',
  NULL,
  1,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'BS111',
  'رياضيات (1)',
  'Math (1)',
  3,
  'math_science',
  NULL,
  1,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'BS112',
  'تراكيب محددة',
  'Discrete Mathematics',
  3,
  'math_science',
  NULL,
  1,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'BS113',
  'رياضيات (2)',
  'Math (2)',
  3,
  'math_science',
  NULL,
  1,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'BS115',
  'إلكترونيات',
  'Electronics',
  3,
  'math_science',
  NULL,
  1,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'BS116',
  'إحصاء واحتمالات (1)',
  'Probability and Statistics (1)',
  3,
  'math_science',
  NULL,
  1,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS111',
  'أساسيات علوم الحاسب',
  'Fundamentals of Computer Science',
  3,
  'basic_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  1,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS112',
  'برمجة هيكلية',
  'Structured Programming',
  3,
  'basic_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  1,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT111',
  'أساسيات تكنولوجيا المعلومات',
  'Fundamentals of Information Technology',
  3,
  'basic_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  1,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS111',
  'مقدمة في نظم المعلومات',
  'Introduction to Information Systems',
  2,
  'basic_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  1,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'UNV119',
  'الأخلاق والمهنية',
  'Ethics and Professionalism',
  2,
  'university_req',
  NULL,
  2,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'UNV121',
  'اللغة الإنجليزية (2)',
  'English Language (2)',
  2,
  'university_req',
  NULL,
  2,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'BS114',
  'رياضيات (3)',
  'Math (3)',
  3,
  'math_science',
  NULL,
  2,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'BS117',
  'بحوث العمليات',
  'Operations Research',
  3,
  'math_science',
  NULL,
  2,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS211',
  'برمجة شيئية',
  'Object Oriented Programming',
  3,
  'basic_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  2,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS212',
  'هياكل البيانات',
  'Data Structures',
  3,
  'basic_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  2,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'SE211',
  'مقدمة في هندسة البرمجيات',
  'Introduction to Software Engineering',
  3,
  'basic_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  2,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS211',
  'مقدمة في نظم قواعد البيانات',
  'Introduction to Database Systems',
  3,
  'basic_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  2,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS212',
  'طرق الأمثلية',
  'Optimization Methods',
  3,
  'basic_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  2,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT211',
  'تصميم المنطق الرقمي',
  'Digital Logic Design',
  3,
  'basic_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  2,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT212',
  'تكنولوجيا شبكات الحاسب',
  'Computer Network Technology',
  3,
  'basic_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  2,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS213',
  'تحليل وتصميم الخوارزميات',
  'Algorithms Analysis and Design',
  3,
  'basic_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  2,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS214',
  'نظم التشغيل',
  'Operating Systems',
  3,
  'basic_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  2,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS311',
  'تحليل وتصميم نظم المعلومات',
  'Analysis and Design of Information Systems',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS311',
  'أمن الحاسب',
  'Computer Security',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS312',
  'تنظيم وبنية الحاسبات',
  'Computer Organization and Architecture',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS313',
  'الذكاء الاصطناعي',
  'Artificial Intelligence',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS411',
  'نظرية الحاسبات',
  'Computation Theory',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT311',
  'الرسم بالحاسب',
  'Computer Graphics',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS314',
  'التعلم الآلي',
  'Machine Learning',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS315',
  'تحليل البيانات الضخمة',
  'Big Data Analysis',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS316',
  'نظم التشغيل المتقدمة',
  'Advanced Operating Systems',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'SE315',
  'هندسة البرمجيات المتقدمة',
  'Advanced Software Engineering',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS318',
  'نظرية المعلومات وضغط البيانات',
  'Information Theory and Data Compression',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS321',
  'التشفير',
  'Cryptography',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'CS'),
  3,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS322',
  'أمن الشبكات والإنترنت',
  'Network and Internet Security',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'CS'),
  3,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS331',
  'تفاعل الإنسان مع الحاسب',
  'Human Computer Interaction',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'CS'),
  3,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS332',
  'اكتشاف المعرفة',
  'Knowledge Discovery',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'CS'),
  3,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS351',
  'معالجة البيانات والتحليل',
  'Data Processing and Analysis',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS412',
  'إنترنت الأشياء',
  'Internet of Things (IoT)',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS413',
  'حل المشكلات واتخاذ القرارات',
  'Problem Solving and Decision Making',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS414',
  'علم البيانات',
  'Data Science',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS415',
  'الحوسبة السحابية',
  'Cloud Computing',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS416',
  'المترجمات',
  'Compilers',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS423',
  'الحوسبة المتنقلة',
  'Mobile Computing',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'CS'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS424',
  'برمجة تطبيقات المحمول',
  'Mobile Application Programming',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'CS'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS433',
  'موضوعات مختارة في الذكاء الاصطناعي',
  'Selected Topics in Artificial Intelligence',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'CS'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS434',
  'الحوسبة عالية الأداء',
  'High Performance Computing',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'CS'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS342',
  'نماذج البيانات والتصور',
  'Data Models and Visualization',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'CS'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'CS443',
  'معالجة اللغات الطبيعية',
  'Natural Language Processing',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'CS'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS444',
  'موضوعات مختارة في نظم المعلومات المتقدمة',
  'Selected Topics in Advanced Information Systems',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IS'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'PR411',
  'مشروع التخرج (1)',
  'Graduation Project (1)',
  3,
  'project',
  NULL,
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'PR412',
  'مشروع التخرج (2)',
  'Graduation Project (2)',
  3,
  'project',
  NULL,
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS342',
  'أمن وإدارة مخاطر نظم المعلومات',
  'Information Systems Security and Risk Management',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS312',
  'إدارة قواعد البيانات',
  'Database Management Systems',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS313',
  'إدارة الملفات ومعالجتها',
  'File Management and Processing',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS314',
  'استرجاع المعلومات',
  'Information Retrieval',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS315',
  'مستودع البيانات',
  'Data Warehousing',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS316',
  'تحليل البيانات وإدارتها',
  'Data Analytics and Management',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS317',
  'تطوير نظم المعلومات المستندة إلى الويب',
  'Web-based Information Systems Development',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS321',
  'موضوعات مختارة في هندسة البيانات',
  'Selected Topics in Data Engineering',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS322',
  'قواعد البيانات السحابية',
  'Cloud Databases',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS331',
  'نظم معلومات المؤسسية',
  'Enterprise Information Systems',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS332',
  'نظم المعلومات الإدارية',
  'Management Information Systems',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IS'),
  3,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS411',
  'التنقيب في البيانات',
  'Data Mining',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS434',
  'هيكليات خدمة التوجه',
  'Service Oriented Architectures',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS414',
  'إدارة ونمذجة البيانات الكبيرة',
  'Big Data Management and Modeling',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS412',
  'إدارة مشاريع نظم المعلومات',
  'Information Systems Project Management',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS413',
  'موضوعات مختارة في نظم المعلومات 1',
  'Selected Topics in Information Systems 1',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS415',
  'منهجيات تطوير نظم المعلومات',
  'Information Systems Development Methodologies',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IS'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS341',
  'ضمان جودة نظم المعلومات',
  'Information Systems Quality Assurance',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IS'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS423',
  'قواعد البيانات الموزعة',
  'Distributed Databases',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IS'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS424',
  'موضوعات مختارة في نظم المعلومات المتقدمة',
  'Selected Topics in Advanced Information Systems',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IS'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS433',
  'الأعمال الإلكترونية',
  'E-Business',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IS'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IS443',
  'مراجعة ورقابة نظم المعلومات',
  'Information Systems Audit and Control',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IS'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'PR421',
  'مشروع التخرج (1)',
  'Graduation Project (1)',
  3,
  'project',
  NULL,
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'PR422',
  'مشروع التخرج (2)',
  'Graduation Project (2)',
  3,
  'project',
  NULL,
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT312',
  'التعرف على الأنماط',
  'Pattern Recognition',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT313',
  'تأمين شبكات الحاسبات والمعلومات',
  'Information and Computer Networks Security',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT314',
  'إشارات ونظم',
  'Signals and Systems',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT315',
  'المعالجات الدقيقة',
  'Microprocessors',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT316',
  'معالجة الصور',
  'Image Processing',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT317',
  'شبكات الحاسب المتقدمة',
  'Advanced Computer Networks',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT318',
  'بنية الحاسبات',
  'Computer Architecture',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT319',
  'الوسائط الرقمية المتعددة',
  'Digital Multimedia',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  3,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT321',
  'نظم تشغيل الشبكات',
  'Network Operating Systems',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IT'),
  3,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT322',
  'تكنولوجيا سلسلة الكتل',
  'Blockchain Technology',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IT'),
  3,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT331',
  'الأنظمة المدمجة',
  'Embedded Systems',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IT'),
  3,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT332',
  'رؤية الآلة',
  'Machine Vision',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IT'),
  3,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT411',
  'أنظمة الروبوتات',
  'Robot Systems',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT413',
  'تكنولوجيا الاتصالات',
  'Communication Technology',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT414',
  'الأمن السيبراني',
  'Cyber Security',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT446',
  'الواقع الافتراضي',
  'Virtual Reality',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT444',
  'التنقيب في الوسائط المتعددة',
  'Multimedia Mining',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT342',
  'معالجة الإشارات الرقمية',
  'Digital Signal Processing',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT416',
  'الإنسان الآلي',
  'Robotics',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT415',
  'شبكات الحوسبة السحابية',
  'Cloud Computing Networks',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT341',
  'الرسوميات الحاسوبية',
  'Computer Animation',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT423',
  'شبكات المحمول',
  'Mobile Networks',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT424',
  'موضوعات مختارة في شبكات الحاسب',
  'Selected Topics in Computer Networks',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT433',
  'التعرف على الأنماط المتقدم',
  'Advanced Pattern Recognition',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT434',
  'موضوعات مختارة في الأنظمة المدمجة والروبوتات',
  'Selected Topics in Embedded Systems and Robotic',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'IT443',
  'معالجة الصور المتقدمة',
  'Advanced Image Processing',
  3,
  'elective',
  (SELECT id FROM departments WHERE code = 'IT'),
  4,
  false,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'PR431',
  'مشروع التخرج (1)',
  'Graduation Project (1)',
  3,
  'project',
  NULL,
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'PR432',
  'مشروع التخرج (2)',
  'Graduation Project (2)',
  3,
  'project',
  NULL,
  4,
  true,
  true
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

INSERT INTO courses (code, name_ar, name_en, credits, category, department_id, level, is_mandatory, is_active)
VALUES (
  'SE321',
  'هندسة البرمجيات التطبيقية',
  'Applied Software Engineering',
  3,
  'applied_computing',
  (SELECT id FROM departments WHERE code = 'CS'),
  3,
  false,
  false
)
ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  credits = EXCLUDED.credits,
  category = EXCLUDED.category,
  level = EXCLUDED.level,
  is_mandatory = EXCLUDED.is_mandatory;

COMMIT;
