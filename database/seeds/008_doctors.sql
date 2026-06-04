SET client_encoding = 'UTF8';

-- =============================================================================
-- 008_doctors.sql — Doctor roster from official schedule
-- Generated from final_doctors_schedule_modified.json
-- Total doctors: 18
-- Idempotent: ON CONFLICT DO UPDATE / DO NOTHING
-- =============================================================================

BEGIN;

-- أ.د. نانسي الحفناوي
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'nancy.hefnawy@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'نانسي الحفناوي',
    'Nancy El-Hefnawy',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'IS'), 'أستاذ دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- أ.م.د. أمنية البربري
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'omnia.barbary@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'أمنية البربري',
    'Omnia El-Barbary',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'IS'), 'أستاذ مشارك دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- أ.م.د. إيمان البقري
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'iman.baqary@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'إيمان البقري',
    'Iman El-Baqary',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'IS'), 'أستاذ مشارك دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. أحمد سليم
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'dr.ahmed@fci.tanta.edu.eg',
    crypt('Doctor@2026!', gen_salt('bf')),
    'doctor',
    'أحمد سليم',
    'Ahmed Saleem',
    true,
    false
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'CS'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. أروى أبو الوفا
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'arwa.elwafa@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'أروى أبو الوفا',
    'Arwa Abu-Elwafa',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'IT'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. أسامة غنيم
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'osama.ghonaim@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'أسامة غنيم',
    'Osama Ghonaim',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'CS'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. إبراهيم جاد
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'ibrahim.gad@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'إبراهيم جاد',
    'Ibrahim Gad',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'IS'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. تهاني علام
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'tahany.allam@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'تهاني علام',
    'Tahany Allam',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'IT'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. شيماء هجرس
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'shimaa.hagras@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'شيماء هجرس',
    'Shimaa Hagras',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'IS'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. عايدة نصر
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'aida.nasr@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'عايدة نصر',
    'Aida Nasr',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'IT'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. مروة
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'marwa@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'مروة',
    'Marwa',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'IT'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. مريان وجدي
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'marian.wagdy@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'مريان وجدي',
    'Marian Wagdy',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'IT'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. مصطفى العشري
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'mostafa.ashry@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'مصطفى العشري',
    'Mostafa El-Ashry',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'CS'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. هاني الغايش
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'hany.ghayesh@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'هاني الغايش',
    'Hany El-Ghayesh',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'IS'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. هناء عبد الهادي
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'hanaa.hady@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'هناء عبد الهادي',
    'Hanaa Abdel-Hady',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'CS'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. هناء عيسى
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'hanaa.eissa@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'هناء عيسى',
    'Hanaa Eissa',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'CS'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. وليد سمير
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'waleed.samir@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'وليد سمير',
    'Waleed Samir',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, NULL, 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

-- د. وليد عبد الخالق
WITH new_user AS (
  INSERT INTO users (email, password_hash, role, full_name_ar, full_name_en, is_active, must_change_pw)
  VALUES (
    'waleed.khalek@fcit.tanta.edu.eg',
    crypt('Doctor@2026', gen_salt('bf')),
    'doctor',
    'وليد عبد الخالق',
    'Waleed Abdel-Khalek',
    true,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name_ar = EXCLUDED.full_name_ar,
    full_name_en = EXCLUDED.full_name_en
  RETURNING id
)
INSERT INTO doctors (user_id, department_id, academic_title)
SELECT new_user.id, (SELECT id FROM departments WHERE code = 'CS'), 'دكتور'
FROM new_user
ON CONFLICT (user_id) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  academic_title = EXCLUDED.academic_title;

COMMIT;
