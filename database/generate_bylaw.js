const fs = require('fs');
const path = require('path');

const bylaw = {
  metadata: {
    version: "2024-7-73",
    total_credit_hours: 138,
    passing_cgpa: 2.0,
    degree: "Bachelor of Computers and Information"
  },
  departments: [
    { code: "CS", name_ar: "علوم الحاسب", name_en: "Computer Science" },
    { code: "IS", name_ar: "نظم المعلومات", name_en: "Information Systems" },
    { code: "IT", name_ar: "تكنولوجيا المعلومات", name_en: "Information Technology" },
    { code: "SE", name_ar: "هندسة البرمجيات", name_en: "Software Engineering" }
  ],
  levels: [
    { id: 1, name_ar: "الفرقة الأولى", name_en: "First Year", min_credits: 0, max_credits: 27 },
    { id: 2, name_ar: "الفرقة الثانية", name_en: "Second Year", min_credits: 28, max_credits: 62 },
    { id: 3, name_ar: "الفرقة الثالثة", name_en: "Third Year", min_credits: 63, max_credits: 97 },
    { id: 4, name_ar: "الفرقة الرابعة", name_en: "Fourth Year", min_credits: 98, max_credits: 138 }
  ],
  semesters: {
    regular: { types: { fall: "الترم الأول", spring: "الترم الثاني" }, weeks: 15 },
    summer: { types: { summer: "الترم الصيفي" }, weeks: 8 }
  },
  grading_system: [
    { grade: "A+", min_percent: 96, max_percent: 100, points: 4.0, description_ar: "ممتاز", description_en: "Excellent" },
    { grade: "A", min_percent: 92, max_percent: 95.99, points: 3.7, description_ar: "ممتاز", description_en: "Excellent" },
    { grade: "A-", min_percent: 88, max_percent: 91.99, points: 3.4, description_ar: "ممتاز", description_en: "Excellent" },
    { grade: "B+", min_percent: 84, max_percent: 87.99, points: 3.2, description_ar: "جيد جداً", description_en: "Very Good" },
    { grade: "B", min_percent: 80, max_percent: 83.99, points: 3.0, description_ar: "جيد", description_en: "Good" },
    { grade: "B-", min_percent: 76, max_percent: 79.99, points: 2.8, description_ar: "جيد", description_en: "Good" },
    { grade: "C+", min_percent: 72, max_percent: 75.99, points: 2.6, description_ar: "مقبول", description_en: "Pass" },
    { grade: "C", min_percent: 68, max_percent: 71.99, points: 2.4, description_ar: "مقبول", description_en: "Pass" },
    { grade: "C-", min_percent: 64, max_percent: 67.99, points: 2.2, description_ar: "مقبول", description_en: "Pass" },
    { grade: "D+", min_percent: 60, max_percent: 63.99, points: 2.0, description_ar: "ضعيف", description_en: "Weak" },
    { grade: "D", min_percent: 55, max_percent: 59.99, points: 1.5, description_ar: "ضعيف", description_en: "Weak" },
    { grade: "D-", min_percent: 50, max_percent: 54.99, points: 1.0, description_ar: "ضعيف جداً", description_en: "Very Weak" },
    { grade: "F", min_percent: 0, max_percent: 49.99, points: 0.0, description_ar: "راسب", description_en: "Fail" }
  ],
  academic_status: {
    warning_threshold: 2.0,
    dismissal: {
      consecutive_warnings: 4,
      non_consecutive_warnings: 6
    },
    max_years_regular: 3
  },
  registration_rules: {
    regular_semester: {
      min_hours: 9,
      max_hours_by_gpa: [
        { min_cgpa: 3.0, max_hours: 24 },
        { min_cgpa: 2.0, max_hours: 21 },
        { min_cgpa: 0.0, max_hours: 18 }
      ],
      max_hours_new_students: 18,
      graduating_student_allowance: 3
    },
    summer_semester: {
      max_hours: 9,
      max_hours_graduating: 12
    }
  },
  attendance_rules: {
    min_attendance_percent: 75,
    denial_grade: "F"
  },
  withdrawal_rules: {
    max_semesters_consecutive: 2,
    max_semesters_total: 4,
    max_semesters_total_with_excuse: 6
  },
  course_categories: {
    UNV: "University Requirements",
    BS: "Basic Sciences",
    CS: "Computer Science",
    IS: "Information Systems",
    IT: "Information Technology",
    SE: "Software Engineering",
    PR: "Project",
    TR: "Training"
  },
  curriculum: {
    university_requirements: {
      total_credits: 12,
      mandatory: [
        { code: "UNV111", name_ar: "كتابة التقارير الفنية", name_en: "Technical Report Writing", credits: 2, prerequisites: [] },
        { code: "UNV112", name_ar: "قضايا مجتمعية", name_en: "Societal Issues", credits: 2, prerequisites: [] },
        { code: "UNV113", name_ar: "لغة انجليزية (1)", name_en: "English Language (1)", credits: 2, prerequisites: [] },
        { code: "UNV114", name_ar: "مهارات الإتصال", name_en: "Communication Skills", credits: 2, prerequisites: [] }
      ],
      elective: [
        { code: "UNV115", name_ar: "مبادئ علم النفس", name_en: "Fundamentals of Psychology", credits: 2, prerequisites: [] },
        { code: "UNV116", name_ar: "مبادئ علم الاجتماع", name_en: "Fundamentals of Sociology", credits: 2, prerequisites: [] },
        { code: "UNV117", name_ar: "سياسات مقارنة", name_en: "Comparative Politics", credits: 2, prerequisites: [] },
        { code: "UNV118", name_ar: "موضوعات مختارة في الإنسانيات", name_en: "Selected Topics in Humanities", credits: 2, prerequisites: [] },
        { code: "UNV119", name_ar: "الأخلاق والمهنية", name_en: "Ethics and Professionalism", credits: 2, prerequisites: [] },
        { code: "UNV120", name_ar: "تسويق ومبيعات", name_en: "Marketing and Sales", credits: 2, prerequisites: [] },
        { code: "UNV121", name_ar: "لغة انجليزية (2)", name_en: "English Language (2)", credits: 2, prerequisites: ["UNV113"] },
        { code: "UNV411", name_ar: "ريادة الأعمال", name_en: "Entrepreneurship", credits: 2, prerequisites: [] }
      ]
    },
    faculty_requirements: {
      total_credits: 60,
      basic_sciences: [
        { code: "BS111", name_ar: "رياضيات (1)", name_en: "Math (1)", credits: 3, prerequisites: [] },
        { code: "BS112", name_ar: "رياضيات متقطعة", name_en: "Discrete Mathematics", credits: 3, prerequisites: [] },
        { code: "BS113", name_ar: "رياضيات (2)", name_en: "Math (2)", credits: 3, prerequisites: ["BS111"] },
        { code: "BS114", name_ar: "رياضيات (3)", name_en: "Math (3)", credits: 3, prerequisites: ["BS113"] },
        { code: "BS115", name_ar: "الكترونيات", name_en: "Electronics", credits: 3, prerequisites: [] },
        { code: "BS116", name_ar: "إحصاء واحتمالات (1)", name_en: "Probability and Statistics (1)", credits: 3, prerequisites: [] },
        { code: "BS117", name_ar: "بحوث العمليات", name_en: "Operations Research", credits: 3, prerequisites: ["BS116"] }
      ],
      basic_computing: [
        { code: "CS111", name_ar: "أساسيات علوم الحاسب", name_en: "Fundamentals of Computer Science", credits: 3, prerequisites: [] },
        { code: "CS112", name_ar: "برمجه هيكلية", name_en: "Structured Programming", credits: 3, prerequisites: [] },
        { code: "IT111", name_ar: "أساسيات تكنولوجيا المعلومات", name_en: "Fundamentals of Information Technology", credits: 3, prerequisites: [] },
        { code: "IS111", name_ar: "مقدمة فى نظم المعلومات", name_en: "Introduction to information systems", credits: 3, prerequisites: [] },
        { code: "CS211", name_ar: "برمجه شيئية", name_en: "Object Oriented Programming", credits: 3, prerequisites: ["CS112"] },
        { code: "CS212", name_ar: "هياكل البيانات", name_en: "Data Structures", credits: 3, prerequisites: ["CS112"] },
        { code: "SE211", name_ar: "مقدمة في هندسة البرمجيات", name_en: "Introduction to Software Engineering", credits: 3, prerequisites: [] },
        { code: "IS211", name_ar: "مقدمة في نظم قواعد البيانات", name_en: "Introduction to Database Systems", credits: 3, prerequisites: ["IS111"] },
        { code: "IS212", name_ar: "طرق الأمثلية", name_en: "Optimization methods", credits: 3, prerequisites: ["BS112"] },
        { code: "IT211", name_ar: "تصميم المنطق الرقمي", name_en: "Digital Logic Design", credits: 3, prerequisites: ["BS115"] },
        { code: "IT212", name_ar: "تكنولوجيا شبكات الحاسب", name_en: "Computer network Technology", credits: 3, prerequisites: ["CS111"] },
        { code: "CS213", name_ar: "تحليل وتصميم الخوارزميات", name_en: "Algorithm Analysis and Design", credits: 3, prerequisites: ["CS212"] },
        { code: "CS214", name_ar: "نظم التشغيل", name_en: "Operating Systems", credits: 3, prerequisites: ["CS212"] }
      ]
    },
    specialization_requirements: {
      CS: {
        mandatory: [
          { code: "IS311", name_ar: "تحليل وتصميم نظم المعلومات", name_en: "Analysis and Design of Information Systems", credits: 3, prerequisites: ["IS211"] },
          { code: "CS311", name_ar: "أمن الحاسب", name_en: "Computer security", credits: 3, prerequisites: ["IT212"] },
          { code: "CS312", name_ar: "تنظيم وبنية الحاسبات", name_en: "Computer Organization and Architecture", credits: 3, prerequisites: ["IT211"] },
          { code: "CS313", name_ar: "الذكاء الأصطناعي", name_en: "Artificial Intelligence", credits: 3, prerequisites: ["CS212"] },
          { code: "IT311", name_ar: "الرسم بالحاسب", name_en: "Computer Graphic", credits: 3, prerequisites: ["CS112"] },
          { code: "CS314", name_ar: "تعلم الآلة", name_en: "Machine Learning", credits: 3, prerequisites: ["CS211"] },
          { code: "CS315", name_ar: "تحليل البيانات الكبيره", name_en: "Big Data Analysis", credits: 3, prerequisites: ["IS311"] },
          { code: "CS316", name_ar: "نظم التشغيل المتقدمة", name_en: "Advanced Operating Systems", credits: 3, prerequisites: ["CS214"] },
          { code: "SE315", name_ar: "هندسه البرمجيات المتقدمة", name_en: "Advanced Software Engineering", credits: 3, prerequisites: ["SE211"] },
          { code: "IS318", name_ar: "نظرية المعلومات وضغط البيانات", name_en: "Information Theory and Data Compression", credits: 3, prerequisites: ["BS116"] },
          { code: "CS411", name_ar: "نظرية الحاسبات", name_en: "Computation Theory", credits: 3, prerequisites: ["BS112"] },
          { code: "CS412", name_ar: "إنترنت الأشياء", name_en: "Internet of Things (IOT)", credits: 3, prerequisites: ["IT212"] },
          { code: "CS413", name_ar: "حل المشاكل و إتخاذ القرارات", name_en: "Problem solving and decision making", credits: 3, prerequisites: ["CS213"] },
          { code: "CS414", name_ar: "علم البيانات", name_en: "Data Science", credits: 3, prerequisites: ["CS314"] },
          { code: "CS415", name_ar: "الحوسبة السحابية", name_en: "Cloud Computing", credits: 3, prerequisites: ["CS316"] },
          { code: "CS416", name_ar: "المترجمات", name_en: "Compilers", credits: 3, prerequisites: ["CS411"] }
        ],
        elective: []
      },
      IS: {
        mandatory: [
          { code: "IS311", name_ar: "تحليل وتصميم نظم المعلومات", name_en: "Analysis and Design of Information Systems", credits: 3, prerequisites: ["IS211"] },
          { code: "IS312", name_ar: "نظم إدارة قواعد البيانات", name_en: "Database Management Systems", credits: 3, prerequisites: ["IS211"] },
          { code: "IS313", name_ar: "إدارة ومعالجه الملفات", name_en: "File management and processing", credits: 3, prerequisites: ["CS212"] },
          { code: "IS314", name_ar: "إسترجاع المعلومات", name_en: "Information retrieval", credits: 3, prerequisites: ["BS115"] },
          { code: "CS313", name_ar: "الذكاء الأصطناعي", name_en: "Artificial Intelligence", credits: 3, prerequisites: ["CS212"] },
          { code: "IS315", name_ar: "مستودع البيانات", name_en: "Data Warehousing", credits: 3, prerequisites: ["IS311"] },
          { code: "IS316", name_ar: "تحليل البيانات وإدارتها", name_en: "Data Analytics and Management", credits: 3, prerequisites: ["IS315"] },
          { code: "IS317", name_ar: "تطوير نظم المعلومات المستنده إلي الويب", name_en: "Web-based Information Systems Development", credits: 3, prerequisites: ["CS211"] },
          { code: "IS318", name_ar: "نظرية المعلومات و ضغط البيانات", name_en: "InformationTheory and Data compression", credits: 3, prerequisites: ["BS116"] },
          { code: "CS315", name_ar: "تعلم الأله", name_en: "Machine Learning", credits: 3, prerequisites: ["CS211"] },
          { code: "IS411", name_ar: "التنقيب في البيانات", name_en: "Data mining", credits: 3, prerequisites: ["BS116"] },
          { code: "CS413", name_ar: "حل المشاكل و إتخاذ القرارات", name_en: "Problem solving and decision making", credits: 3, prerequisites: ["CS213"] },
          { code: "CS414", name_ar: "علوم البيانات", name_en: "Data Science", credits: 3, prerequisites: ["CS314"] },
          { code: "IS412", name_ar: "إدارة مشاريع نظم المعلومات", name_en: "Information Systems Project management", credits: 3, prerequisites: ["IS311"] },
          { code: "IS413", name_ar: "موضوعات مختارة في نظم المعلومات ١", name_en: "Selected Topics in Information Systems 1", credits: 3, prerequisites: ["IS317"] },
          { code: "IS414", name_ar: "موضوعات مختارة في قواعد البيانات", name_en: "Selected Topics in Databases", credits: 3, prerequisites: ["IS312"] },
          { code: "IS415", name_ar: "منهجيات تطوير نظم المعلومات", name_en: "Information Systems Development Methodologies", credits: 3, prerequisites: ["IS311"] }
        ],
        elective: []
      },
      IT: {
        mandatory: [
          { code: "IT311", name_ar: "الرسم بالحاسب", name_en: "computer graphic", credits: 3, prerequisites: ["CS112"] },
          { code: "IT312", name_ar: "التعرف علي الأنماط", name_en: "Pattern Recognition", credits: 3, prerequisites: ["BS117"] },
          { code: "IT313", name_ar: "تأمين شبكات الحاسبات والمعلومات", name_en: "Information and Computer Networks Security", credits: 3, prerequisites: ["IT111"] },
          { code: "IT314", name_ar: "أشارات ونظم", name_en: "Signals and Systems", credits: 3, prerequisites: ["BS114"] },
          { code: "IT315", name_ar: "المعالجات الدقيقة", name_en: "Microprocessors", credits: 3, prerequisites: ["IT211"] },
          { code: "IT316", name_ar: "معالجه الصور", name_en: "image processing", credits: 3, prerequisites: ["IT314"] },
          { code: "IT317", name_ar: "شبكات الحاسب متقدم", name_en: "Advanced Computer Networks", credits: 3, prerequisites: ["IT212"] },
          { code: "SE315", name_ar: "هندسة البرمجيات المتقدمة", name_en: "Advanced software engineering", credits: 3, prerequisites: ["SE211"] },
          { code: "IT318", name_ar: "بنيه الحاسبات", name_en: "Computer Architecture", credits: 3, prerequisites: ["BS115"] },
          { code: "IT319", name_ar: "الوسائط المتعدده الرقمية", name_en: "Digital Multimedia", credits: 3, prerequisites: ["IT311"] },
          { code: "IT411", name_ar: "أنظمة الروبوت", name_en: "Robot systems", credits: 3, prerequisites: ["IT315"] },
          { code: "CS313", name_ar: "الذكاء الإصطناعي", name_en: "Artificial Intelligence", credits: 3, prerequisites: ["CS212"] },
          { code: "CS412", name_ar: "إنترنت الأشياء", name_en: "Internet of things", credits: 3, prerequisites: ["IT212"] },
          { code: "IT413", name_ar: "تكنولوجيا الإتصالات", name_en: "Communication Technology", credits: 3, prerequisites: ["IT317"] },
          { code: "IT414", name_ar: "الأمن السيبراني", name_en: "Cyber Security", credits: 3, prerequisites: ["IT313"] },
          { code: "IT415", name_ar: "شبكات الحوسبة السحابية", name_en: "Cloud Computing Networks", credits: 3, prerequisites: ["IT111"] }
        ],
        elective: []
      },
      SE: {
        mandatory: [
          { code: "IT212", name_ar: "تكنولوجيا شبكات الحاسب", name_en: "computer network technology", credits: 3, prerequisites: ["CS311"] },
          { code: "SE211", name_ar: "مقدمة في هندسة البرمجيات", name_en: "Introduction to software engineering", credits: 3, prerequisites: [] },
          { code: "SE311", name_ar: "تحليل متطلبات البرمجيات", name_en: "Software Requirements Analysis", credits: 3, prerequisites: [] },
          { code: "IT211", name_ar: "تصميم المنطقي", name_en: "logic design", credits: 3, prerequisites: [] },
          { code: "CS312", name_ar: "تنظيم وبناء الحاسب", name_en: "Computer Organization and Architecture", credits: 3, prerequisites: [] },
          { code: "CS212", name_ar: "هياكل بيانات", name_en: "Data structures", credits: 3, prerequisites: [] },
          { code: "CS313", name_ar: "الذكاء الإصطناعي", name_en: "Artificial Intelligence", credits: 3, prerequisites: [] },
          { code: "SE312", name_ar: "هندسة البرمجيات لتطبيقات الإنترنت", name_en: "Software Engineering for Internet Applications", credits: 3, prerequisites: ["SE211"] },
          { code: "SE313", name_ar: "تصميم وعمارة البرمجيات", name_en: "Software Design and Architecture", credits: 3, prerequisites: ["SE311"] },
          { code: "SE314", name_ar: "ضمان جودة البرمجيات", name_en: "SoftwareQuality Assurance", credits: 3, prerequisites: ["SE311"] },
          { code: "CS214", name_ar: "نظم التشغيل", name_en: "Operating Systems", credits: 3, prerequisites: [] },
          { code: "CS316", name_ar: "نظم التشغيل المتقدمة", name_en: "Advanced Operating Systems", credits: 3, prerequisites: [] },
          { code: "SE315", name_ar: "هندسه البرمجيات المتقدمة", name_en: "Advanced Software Engineering", credits: 3, prerequisites: ["SE211"] },
          { code: "SE316", name_ar: "تصميم واجهات المستخدم", name_en: "User Interface Design", credits: 3, prerequisites: [] },
          { code: "SE411", name_ar: "إدارة مشاريع البرمجيات", name_en: "Software Project Management", credits: 3, prerequisites: ["SE314"] },
          { code: "SE412", name_ar: "الإختبار والتحقق من البرمجيات", name_en: "Software testing and validation", credits: 3, prerequisites: ["SE314"] },
          { code: "SE413", name_ar: "أسلوب هندسة البرمجيات في طرق إتصال الإنسان مع الحاسب", name_en: "Software Engineering Approach to Human Computer Interaction", credits: 3, prerequisites: ["SE315"] },
          { code: "SE414", name_ar: "إعادة استخدام البرمجيات", name_en: "Software Reuse", credits: 3, prerequisites: ["SE313"] },
          { code: "SE415", name_ar: "الأخلاقيات والممارسة المهنية في هندسة البرمجيات", name_en: "Ethics and professional practice in software engineering", credits: 3, prerequisites: [] },
          { code: "SE416", name_ar: "تطوير البرمجيات وصيانتها", name_en: "Software Evolution and Maintenance", credits: 3, prerequisites: ["SE412"] },
          { code: "SE417", name_ar: "تصميم برمجيات الأنظمه المدمجة", name_en: "Embedded systems software design", credits: 3, prerequisites: ["SE411"] }
        ],
        elective: []
      }
    }
  }
};

fs.writeFileSync(path.join(__dirname, 'academic-regulations.json'), JSON.stringify(bylaw, null, 2));

const mdContent = `
# Academic Regulations & Bylaw API (2024-7-73)

This JSON structure represents the official academic bylaw of the Faculty of Computers and Information.

## Design Philosophy
- **Dynamic Extensibility**: All business rules for graduation, grading, warnings, and registration are encoded as rules in the JSON.
- **Grading Constraints**: Uses the 4.0 GPA scale where \`A+\` = 4.0 and passing grade is \`D\`.
- **Registration Constraints**: Minimum hours = 9, Maximum hours = 21 (CGPA dependent).
- **Curriculum Architecture**: 
  - University Requirements: 12 Hours
  - Faculty Requirements: 60 Hours
  - Specialization Requirements: 60 Hours
  - Project: 6 Hours
  - Total: 138 Hours

## Usage in Backend
The backend should parse this JSON file and expose a \`BylawService\` that acts as a singleton engine.

Example checking max hours:
\`\`\`javascript
const getMaxHours = (cgpa) => {
  const rules = bylaw.registration_rules.regular_semester.max_hours_by_gpa;
  for (const rule of rules) {
    if (cgpa >= rule.min_cgpa) return rule.max_hours;
  }
  return 12; // Fallback
}
\`\`\`
`;

fs.writeFileSync(path.join(__dirname, 'academic-regulations.md'), mdContent);
console.log("Successfully generated academic-regulations.json and academic-regulations.md");
