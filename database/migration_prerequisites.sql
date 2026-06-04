-- =============================================================================
-- FCIT SRS — Full Prerequisite Hierarchy Migration
-- Based on FCIT bylaws for all 4 specializations: CS, IS, IT, SE
-- Run after schema + seeds
-- =============================================================================

-- Helper: safe insert (ignore duplicates)
CREATE OR REPLACE FUNCTION add_prereq(p_course_code TEXT, p_prereq_code TEXT, p_strict BOOLEAN DEFAULT TRUE)
RETURNS VOID AS $$
DECLARE
  v_course_id INT; v_prereq_id INT;
BEGIN
  SELECT id INTO v_course_id FROM courses WHERE code = p_course_code;
  SELECT id INTO v_prereq_id FROM courses WHERE code = p_prereq_code;
  IF v_course_id IS NULL THEN RAISE NOTICE 'Course not found: %', p_course_code; RETURN; END IF;
  IF v_prereq_id IS NULL THEN RAISE NOTICE 'Prereq not found: %', p_prereq_code; RETURN; END IF;
  INSERT INTO course_prerequisites (course_id, prereq_course_id, is_strict)
  VALUES (v_course_id, v_prereq_id, p_strict)
  ON CONFLICT (course_id, prereq_course_id) DO UPDATE SET is_strict = p_strict;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- BASIC SCIENCES (BS) chain
-- ─────────────────────────────────────────────────────────────────────────────
SELECT add_prereq('BS113','BS111');   -- Math(2) requires Math(1)
SELECT add_prereq('BS114','BS113');   -- Math(3) requires Math(2)
SELECT add_prereq('BS116','BS111');   -- Probability requires Math(1)
SELECT add_prereq('BS117','BS111');   -- Operations Research requires Math(1)

-- ─────────────────────────────────────────────────────────────────────────────
-- COMPUTER SCIENCE (CS) chain — full 4-year hierarchy
-- ─────────────────────────────────────────────────────────────────────────────
-- Year 1 → Year 2
SELECT add_prereq('CS112','CS111');      -- Structured Programming requires CS Fundamentals
SELECT add_prereq('IS111','CS111',FALSE); -- IS Intro: advisory only on CS Fundamentals

-- Year 2 (OOP, DS, Algorithms, OS)
SELECT add_prereq('CS211','CS112');   -- OOP requires Structured Programming
SELECT add_prereq('CS212','CS112');   -- Data Structures requires Structured Programming
SELECT add_prereq('CS213','CS212');   -- Algorithms requires Data Structures
SELECT add_prereq('CS214','CS212');   -- Operating Systems requires Data Structures
SELECT add_prereq('SE211','CS112');   -- Software Engineering requires Structured Programming
SELECT add_prereq('IS211','IS111');   -- Database Systems requires IS Intro          [FIXED: was CS112]
SELECT add_prereq('IS212','BS113');   -- Optimization Methods requires Math(2)       [FIXED: was IS211]
SELECT add_prereq('IT211','BS115');   -- Digital Logic requires Electronics

-- Year 3 (Security, Networks, AI, etc.)
SELECT add_prereq('CS311','IT212');   -- Computer Security requires Networks Tech     [FIXED: was CS212]
SELECT add_prereq('CS312','IT211');   -- Computer Organization requires Digital Logic [FIXED: was CS212]
SELECT add_prereq('CS313','CS212');   -- AI requires Data Structures
SELECT add_prereq('CS314','CS211');   -- Machine Learning requires OOP                [FIXED: was CS313]
SELECT add_prereq('CS315','IS311');   -- Big Data requires Analysis & Design of IS
SELECT add_prereq('CS316','CS214');   -- Advanced OS requires Operating Systems
SELECT add_prereq('IS311','IS211');   -- Analysis & Design of IS requires Database
SELECT add_prereq('IS312','IS211');   -- DB Management requires Database Systems
SELECT add_prereq('IS313','CS212');   -- File Management requires Data Structures     [FIXED: was IS211]
SELECT add_prereq('IS314','BS115');   -- Information Retrieval requires Electronics   [FIXED: was IS211]
SELECT add_prereq('IS315','IS311');   -- Data Warehousing requires Analysis & Design  [FIXED: was IS312]
SELECT add_prereq('IS316','IS315');   -- Data Analytics requires Data Warehousing     [FIXED: was IS312]
SELECT add_prereq('IS317','CS211');   -- Web-based IS requires OOP                   [FIXED: was IS311]
SELECT add_prereq('IS318','BS116');   -- Information Theory requires Probability
SELECT add_prereq('SE311','SE211');   -- SW Requirements requires Software Engineering
SELECT add_prereq('SE312','SE211');   -- SW for Internet requires Software Engineering
SELECT add_prereq('SE313','SE211');   -- SW Design requires Software Engineering
SELECT add_prereq('IT311','CS112');   -- Computer Graphics requires Structured Prog   [FIXED: was IT211]
SELECT add_prereq('IT312','BS117');   -- Pattern Recognition requires Operations Res  [FIXED: was IT211]
SELECT add_prereq('IT313','IT111');   -- Info & Network Security requires IT Intro    [FIXED: was IT211]
SELECT add_prereq('IT314','BS114');   -- Signals & Systems requires Math(3)           [FIXED: was IT211]
SELECT add_prereq('IT315','IT211');   -- Microprocessors requires Digital Logic

-- Year 3 → 4 Security / Crypto
SELECT add_prereq('CS321','CS311');   -- Cryptography requires Computer Security
SELECT add_prereq('CS322','CS311');   -- Network Security requires Computer Security
SELECT add_prereq('CS332','CS313');   -- Knowledge Discovery requires AI

-- Year 4
SELECT add_prereq('CS411','BS112');   -- Computation Theory requires Discrete Math    [FIXED: was CS213]
SELECT add_prereq('CS412','IT212');   -- IoT requires Networks Technology             [FIXED: was CS312]
SELECT add_prereq('CS413','CS213');   -- Problem Solving requires Algorithms          [FIXED: was CS313]
SELECT add_prereq('CS414','CS314');   -- Data Science requires Machine Learning
SELECT add_prereq('CS415','CS316');   -- Cloud Computing requires Advanced OS         [FIXED: was CS312]
SELECT add_prereq('CS416','CS411');   -- Compilers requires Computation Theory        [FIXED: was CS213]
SELECT add_prereq('CS423','CS312');   -- Mobile Computing requires Computer Organization
SELECT add_prereq('CS424','CS211');   -- Mobile App Programming requires OOP
SELECT add_prereq('CS433','CS313');   -- Selected Topics AI requires AI
SELECT add_prereq('CS434','CS316');   -- High Performance Computing requires Advanced OS
SELECT add_prereq('CS443','CS313');   -- NLP requires AI
SELECT add_prereq('IS411','BS116');   -- Data Mining requires Probability & Statistics [FIXED: was IS316]
SELECT add_prereq('IS412','IS311');   -- IS Project Management requires Analysis & Design
SELECT add_prereq('IS413','IS317');   -- Selected Topics IS requires Web-based IS     [FIXED: was IS311]
SELECT add_prereq('IT316','IT314');   -- Image Processing requires Signals & Systems
SELECT add_prereq('IT317','IT212');   -- Advanced Networks requires Networks Technology [FIXED: was IT311]
SELECT add_prereq('IT318','BS115');   -- Computer Architecture requires Electronics   [FIXED: was IT315]
SELECT add_prereq('IT319','IT311');   -- Digital Multimedia requires Computer Graphics
SELECT add_prereq('IT411','IT314');   -- Robot Systems requires Signals & Systems
SELECT add_prereq('IT413','IT317');   -- Communication Technology requires Adv Networks [FIXED: was IT314]
SELECT add_prereq('IT414','IT313');   -- Cyber Security requires Info & Network Security
SELECT add_prereq('IT415','IT111');   -- Cloud Networks requires IT Intro              [FIXED: was IT317]
SELECT add_prereq('SE314','SE311');   -- SW Quality Assurance requires SW Requirements
SELECT add_prereq('SE315','SE211');   -- Advanced SW Eng requires Software Engineering [FIXED: was SE313]
SELECT add_prereq('SE316','SE211');   -- UI Design requires Software Engineering
SELECT add_prereq('SE411','SE311');   -- SW Project Management requires SW Requirements
SELECT add_prereq('SE412','SE314');   -- SW Testing requires SW Quality Assurance
SELECT add_prereq('SE413','SE316');   -- HCI requires UI Design
SELECT add_prereq('SE415','SE411');   -- Ethics in SE requires SW Project Management
SELECT add_prereq('SE416','SE412');   -- SW Evolution requires SW Testing
SELECT add_prereq('SE417','SE313');   -- Embedded SW requires SW Design

-- Training and Projects
SELECT add_prereq('TR411','TR311');   -- Training 2 requires Training 1
SELECT add_prereq('PR412','PR411');   -- Project 2 requires Project 1

-- ─────────────────────────────────────────────────────────────────────────────
-- Update Spring 2026 semester dates to be CURRENT (today = May 2026)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE semesters SET
  registration_start   = '2026-05-01',
  registration_end     = '2026-05-31',
  start_date           = '2026-06-01',
  end_date             = '2026-08-31',
  add_drop_deadline    = '2026-06-14',
  withdrawal_deadline  = '2026-07-20'
WHERE label = 'Spring 2026';

-- Also update Fall 2025 to have current dates for doctor grade entry
UPDATE semesters SET
  add_drop_deadline    = '2025-10-01',
  withdrawal_deadline  = '2025-11-15'
WHERE label = 'Fall 2025';

-- Drop the helper function
DROP FUNCTION IF EXISTS add_prereq(TEXT,TEXT,BOOLEAN);

DO $$ BEGIN
  RAISE NOTICE 'Prerequisite migration completed';
END $$;
