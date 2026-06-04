# UniSmart FCIT SRS — Extended Usage Scenarios v3
## New Scenarios: US-221 → US-440+
*Generated from live system testing · May 2026 · Covers all v3 features + edge cases*

---

> **Scenario format:**
> **Setup** → **I am [role]** → **Steps** (numbered, as lived) → **Expected Outcome** → `TC-ref / Art.X`

---

## 🔑 SECTION D — ADMIN SUPERADMIN FEATURES (US-221 → US-290)

### Domain D1: Curriculum Plan Management

---

**US-221 — Admin views full GENERAL curriculum plan**
_Setup:_ Navigate to `/admin/curriculum`. Default specialization = GENERAL.
1. Page loads with the GENERAL plan selected.
**Expected:** Courses displayed in card grid grouped by Year (1–4) → Semester (1–2). Each card shows: course code (blue), Arabic name, English name, credits badge, category badge (mandatory/elective/training/project), prerequisite count warning tag if prereqs > 0. `Ref: TC-230`

---

**US-222 — Admin switches curriculum view to CS specialization**
_Setup:_ On `/admin/curriculum`.
1. I click the specialization selector → choose "CS".
**Expected:** Grid reloads with CS-specific plan. Courses unique to CS appear; GENERAL courses may overlap. Specializations available: GENERAL, CS, IS, IT, SE. `Ref: TC-231`

---

**US-223 — Admin adds a new course to Year 1 Semester 2 of CS plan**
_Setup:_ On `/admin/curriculum`. "إضافة مقرر" button visible.
1. I click "+ إضافة مقرر".
2. Modal opens: select course CS112 from dropdown, Year = 1, Semester = 2.
3. I click "إضافة".
**Expected:** `POST /api/v1/admin/curriculum`; course CS112 appears in Year 1 Sem 2 card group; success toast; audit log entry created. `Ref: TC-232`

---

**US-224 — Admin tries to add same course twice to same specialization**
_Setup:_ CS112 already exists in CS plan.
1. I try to add CS112 again to the CS plan.
**Expected:** `409` — backend uses `ON CONFLICT DO UPDATE` so it updates the position instead of failing; toast "تم تحديث موقع المقرر في الخطة"; no duplicate row. `Ref: TC-233`

---

**US-225 — Admin removes a course from curriculum plan**
_Setup:_ Course CS999 (obsolete) is in the plan.
1. I click the 🗑 delete icon on the CS999 card.
2. Browser confirm dialog: "حذف CS999 من الخطة؟"
3. I confirm.
**Expected:** `DELETE /api/v1/admin/curriculum/:planId`; card disappears; toast "تم الحذف"; existing enrollments NOT affected. `Ref: TC-234`

---

**US-226 — Admin moves a course to a different year/semester in plan**
_Setup:_ MA101 is currently in Year 1 Sem 1 but should be Year 1 Sem 2.
1. I click the edit (pencil) icon on MA101 card.
2. Change Year = 1, Semester = 2.
3. Save.
**Expected:** `PUT /api/v1/admin/curriculum/:planId`; card moves to correct group; no data loss. `Ref: TC-235`

---

**US-227 — Student registration page shows courses grouped by curriculum plan**
_Setup:_ Registration is open. Student is Year 2. Navigate to `/student/courses`.
1. Page loads with curriculum plan grouping.
**Expected:** Courses organized by "السنة 1 - الفصل 1", "السنة 1 - الفصل 2", etc. Student's current-level courses highlighted. Plan courses without offerings show as "غير متاح هذا الفصل". `Ref: TC-236`

---

**US-228 — Admin creates an IS-specific curriculum variant**
_Setup:_ IS specialization has no plan yet.
1. I select "IS" from curriculum specialization selector.
2. Empty state shown. I click "ابدأ بإضافة مقررات".
3. I add IS401 to Year 4 Sem 1.
**Expected:** IS plan created with first entry; IS students will see this as their plan in registration. `Ref: TC-237`

---

### Domain D2: Bylaw Configuration (Superadmin Override)

---

**US-229 — Admin views all 21 bylaw parameters grouped by category**
_Setup:_ Navigate to `/admin/bylaw-config`.
**Expected:** Parameters grouped: 🎓 التخرج, 📋 الحضور, 📝 الدرجات, ⚠️ الإنذارات, 📅 التسجيل, 🔄 الإعادة, 📆 التقويم. Each param shows: Arabic label, description, article reference badge, current value, default value. Modified params highlighted in yellow. `Ref: TC-238`

---

**US-230 — Admin increases summer semester max credits from 7 to 9**
_Setup:_ On `/admin/bylaw-config`, category "التسجيل".
1. I click "تعديل" next to `summer_max_credits`.
2. Input becomes editable. Current value: 7. I type 9.
3. I click "حفظ".
**Expected:** `PUT /api/v1/admin/bylaw-config/summer_max_credits` → `{"value":"9"}`; value updates; param row shows yellow "معدّل" badge; audit log entry: "summer_max_credits changed from 7 to 9"; students can now register up to 9 credits in summer. `Ref: TC-239, Art.11`

---

**US-231 — System enforces updated summer credit limit immediately**
_Setup:_ After admin set summer_max_credits to 9.
1. Student tries to register 8 credits in summer semester.
**Expected:** Registration succeeds (was blocked at 8 before change); new limit 9 is used in real-time bylaw checks. `Ref: TC-240`

---

**US-232 — Admin resets a modified parameter to default**
_Setup:_ summer_max_credits is currently 9 (modified from default 7).
1. I click "إعادة" (red reset button) next to the modified row.
2. Confirm dialog.
**Expected:** Value resets to 7; "معدّل" badge disappears; audit log entry: "reset to default 7". `Ref: TC-241`

---

**US-233 — Admin attempts to set attendance threshold below minimum**
_Setup:_ `min_attendance_pct` has min_value = 20.
1. I try to set `min_attendance_pct` to 15.
**Expected:** `400` — "Value cannot be less than 20"; input shows validation error; current value unchanged. `Ref: TC-242`

---

**US-234 — Admin lowers warning CGPA threshold from 2.0 to 1.8**
_Setup:_ `warning_cgpa_threshold` currently = 2.0.
1. I update to 1.8.
**Expected:** Next semester finalization uses 1.8 as the threshold; students with CGPA between 1.8 and 2.0 will NOT receive warnings until CGPA < 1.8. `Ref: TC-243, Art.25`

---

**US-235 — Admin changes add/drop window from 2 weeks to 3 weeks**
_Setup:_ `add_drop_weeks` = 2.
1. I update to 3.
**Expected:** Next new semester created will have `add_drop_deadline = start_date + 21 days` (3×7); existing semesters not retroactively changed. `Ref: TC-244, Art.12`

---

**US-236 — Admin changes graduation credit requirement from 132 to 128**
_Setup:_ `total_credits_required` = 132.
1. I update to 128.
**Expected:** Graduation eligibility checks now use 128; students with 128 credits become graduation-eligible; checklist on `/student/graduation` shows "128/128 ساعة". `Ref: TC-245, Art.4`

---

**US-237 — Admin views audit trail of all bylaw config changes**
_Setup:_ Several bylaw params have been changed.
1. I query the audit log or navigate to `/admin/reports`.
**Expected:** Each change logged: key, old_value, new_value, admin user, timestamp. Full trail of who changed what and when. `Ref: TC-246`

---

**US-238 — Admin sees which parameters differ from defaults at a glance**
_Setup:_ 3 parameters have been modified.
1. On bylaw config page.
**Expected:** Modified params highlighted yellow with "معدّل" badge; non-modified params have neutral background. Total modified count shown in page header. `Ref: TC-247`

---

### Domain D3: Department Management

---

**US-239 — Admin views all departments with doctor and course counts**
_Setup:_ Navigate to `/admin/departments`. 4 departments seeded.
**Expected:** Card grid shows each department: code badge (blue), Arabic name, English name, "نشط/معطل" status badge, "X مدرس · Y مقرر" stats, "تعديل" button. `Ref: TC-248`

---

**US-240 — Admin creates a new department**
_Setup:_ On `/admin/departments`, click "+ إضافة قسم".
1. Fill: كود = "AI", الاسم بالعربية = "الذكاء الاصطناعي", الاسم بالإنجليزية = "Artificial Intelligence".
2. Click "حفظ".
**Expected:** `POST /api/v1/admin/departments`; new card appears in grid; code "AI" shown; doctor/course count = 0; is_active = true. `Ref: TC-249`

---

**US-241 — Admin tries to create department with duplicate code**
_Setup:_ Department "CS" already exists.
1. I try to create another department with code "CS".
**Expected:** `409` — "كود القسم موجود بالفعل"; form shows inline error; no DB insert. `Ref: TC-250`

---

**US-242 — Admin edits department name**
_Setup:_ Department "CS" has incorrect Arabic name.
1. I click "تعديل" on CS card.
2. I change nameAr to the correct value.
3. I save.
**Expected:** `PATCH /api/v1/admin/departments/:id`; card updates immediately; Arabic name corrected. `Ref: TC-251`

---

**US-243 — Admin assigns head of department**
_Setup:_ Department CS has no head. Dr. Ahmed is a doctor.
1. I edit the CS department.
2. I select Dr. Ahmed as head from the doctor dropdown.
3. Save.
**Expected:** `head_id` set in departments table; head name shown on department card; Dr. Ahmed's profile shows department head role. `Ref: TC-252`

---

### Domain D4: Doctor Schedule Assignment

---

**US-244 — Admin assigns a weekly schedule to a course offering**
_Setup:_ CS212 Section A is offered Spring 2026. No schedule slots yet. Admin navigates to offering management.
1. I click "تعيين الجدول" for CS212 Section A.
2. I add slot: Day=Sunday, Start=10:00, End=12:00, Room=Lab-A, Type=lecture.
3. I add slot: Day=Tuesday, Start=14:00, End=16:00, Room=Lab-A, Type=lab.
4. I submit.
**Expected:** `POST /api/v1/admin/offerings/:id/schedule`; two `doctor_schedule_slots` rows created; doctor receives notification: "تم تعيين جدول مقرر CS212: الأحد 10:00-12:00, الثلاثاء 14:00-16:00"; success toast. `Ref: TC-253`

---

**US-245 — Doctor views their assigned weekly schedule**
_Setup:_ Admin assigned schedule to CS212 for Dr. Ahmed. Dr. Ahmed navigates to `/doctor/schedule`.
**Expected:** Weekly grid shows CS212 block in Sunday 10:00 and Tuesday 14:00 cells; block shows course code, course name, time, room; "طباعة / PDF" button visible. `Ref: TC-254`

---

**US-246 — Doctor prints/exports schedule as PDF**
_Setup:_ Dr. Ahmed is on `/doctor/schedule`. Has 3 courses with assigned slots.
1. I click "🖨️ طباعة / PDF".
**Expected:** New browser window/tab opens with print-formatted HTML schedule; includes: doctor name, semester label, weekly table (Sun–Thu), all courses with times and rooms, detailed course list; `window.print()` auto-triggers; user can save as PDF from browser. `Ref: TC-255`

---

**US-247 — Admin reassigns schedule (replaces existing slots)**
_Setup:_ CS212 already has 2 schedule slots.
1. Admin reassigns with new slots (different times).
**Expected:** `DELETE` old slots, `INSERT` new slots in the same transaction; old notification was sent; a new notification sent to doctor: "تم تحديث جدول مقرر CS212". `Ref: TC-256`

---

**US-248 — Doctor sees all offerings listed with schedule under my courses**
_Setup:_ Dr. Ahmed has 3 offerings, 2 with schedules, 1 without.
1. On `/doctor/schedule`, scroll to "مقرراتي التفصيلية" section.
**Expected:** All 3 courses listed. Two show their schedule slots (e.g., "الأحد 10:00 | الثلاثاء 14:00"). The third shows "جدول غير محدد". `Ref: TC-257`

---

**US-249 — Student sees assigned room in schedule page**
_Setup:_ Admin assigned room "B-201" to CS212 slot.
1. Student navigates to `/student/schedule`.
**Expected:** CS212 row shows room "B-201"; no room → shows "—". `Ref: TC-258`

---

### Domain D5: Course Prerequisite Management (Admin UI)

---

**US-250 — Admin views prerequisites for a course via UI**
_Setup:_ CS212 has CS112 as a strict prerequisite. Admin on `/admin/courses`.
1. I click on CS212 → prerequisite management section.
**Expected:** `GET /api/v1/admin/courses/:id/prerequisites`; list shows: CS112 (OOP), strict=true; with remove button. `Ref: TC-259`

---

**US-251 — Admin adds a new prerequisite to a course**
_Setup:_ Admin wants CS311 to require CS212.
1. I select CS212 from the prerequisite selector for CS311.
2. I choose "strict" (not advisory).
3. I save.
**Expected:** `POST /api/v1/admin/courses/:id/prerequisites` → inserts `course_prerequisites` row; students without CS212 passed are now blocked from CS311 at next registration. `Ref: TC-260`

---

**US-252 — Admin removes a prerequisite**
_Setup:_ CS212 has an incorrect prerequisite MA501.
1. I click the delete button next to MA501 in the prerequisite list.
**Expected:** `DELETE /api/v1/admin/courses/:courseId/prerequisites/:prereqId`; prerequisite removed; students who were blocked by MA501 can now register CS212 if other conditions met. `Ref: TC-261`

---

**US-253 — Admin makes a prerequisite advisory (not strict)**
_Setup:_ MA211 has CS101 as advisory prerequisite.
1. I update the is_strict flag to false.
**Expected:** `PUT /api/v1/admin/curriculum/:planId`; advisory prereqs show as recommendations, not hard blocks; student sees a warning but can still register. `Ref: TC-262`

---

---

## 🔔 SECTION E — NOTIFICATION DETAIL SYSTEM (US-254 → US-270)

### Domain E1: Notification Detail Modal (All Roles)

---

**US-254 — Student clicks a warning notification → full detail modal**
_Setup:_ Student has an unread academic warning notification. On `/student/notifications`.
1. I click the warning notification row (⚠️ icon, yellow badge "إنذار أكاديمي").
**Expected:** Modal opens with: red header bar, warning icon (⚠️), notification title bold, full Arabic message text (CGPA, warning count, action required), relative timestamp, "مقروء/غير مقروء" badge. Modal dismisses on backdrop click or ✕ button. `Ref: TC-263`

---

**US-255 — Notification auto-marked read when modal opens**
_Setup:_ Student has 3 unread notifications. Clicks the first one.
1. Modal opens.
**Expected:** Blue dot on that notification disappears immediately; bell badge decrements by 1; `PUT /api/v1/notifications/:id/read` fires; other 2 notifications stay unread. `Ref: TC-264`

---

**US-256 — Notification modal shows "عرض التفاصيل" link**
_Setup:_ Enrollment notification has `link = "/student/schedule"`.
1. I open the notification modal.
**Expected:** A "🔗 عرض التفاصيل" link button appears; clicking it navigates to `/student/schedule` and closes the modal. `Ref: TC-265`

---

**US-257 — Admin clicks semester_event notification**
_Setup:_ Admin has a notification: "الفصل الدراسي أُغلق — تم الإنهاء".
1. I click it on `/admin/notifications`.
**Expected:** Modal with blue calendar header (📅), full finalization summary message (students warned, dismissed counts), timestamp. `Ref: TC-266`

---

**US-258 — Doctor clicks schedule_assigned notification**
_Setup:_ Admin assigned schedule to Dr. Ahmed's CS212 offering.
1. Dr. Ahmed opens notification. Clicks the schedule_assigned notification.
**Expected:** Modal with green header (📋), message: "تم تعيين جدول مقرر CS212: الأحد 10:00-12:00…", link to "/doctor/schedule". `Ref: TC-267`

---

**US-259 — Notification detail shows full long message without truncation**
_Setup:_ An admin announcement has a 400-character message body.
1. Student opens the announcement notification modal.
**Expected:** Full 400-character message shown in scrollable body area; no truncation; `white-space: pre-wrap` preserves line breaks. `Ref: TC-268`

---

**US-260 — Clicking already-read notification still shows full detail**
_Setup:_ Student clicks a notification with grey (already-read) indicator.
1. I click the greyed-out notification.
**Expected:** Modal opens with full detail; no re-marking-read API call (already read); backdrop and ✕ close modal. `Ref: TC-269`

---

**US-261 — Notifications list row shows hover state and arrow indicator**
_Setup:_ On `/student/notifications`, I hover over a notification row.
1. I hover.
**Expected:** Background changes to light blue (#dbeafe44); cursor becomes pointer; a "›" arrow shows on the right side indicating it's clickable; unread blue dot remains visible. `Ref: TC-270`

---

**US-262 — Admin "قراءة الكل" marks all notifications read**
_Setup:_ Admin has 6 unread notifications.
1. I click "تعليم الكل كمقروء" button.
**Expected:** `PUT /api/v1/notifications/read-all`; all blue dots disappear; bell badge = 0; toast "تم تعليم الكل كمقروء"; no need to open each individually. `Ref: TC-271`

---

**US-263 — Notification modal dismisses on pressing Escape key**
_Setup:_ Notification modal is open.
1. I press the Escape key.
**Expected:** Modal closes; user returns to notification list; no state corruption. `Ref: TC-272`

---

---

## 📅 SECTION F — SEMESTER LIFECYCLE v3 (US-264 → US-290)

### Domain F1: Enhanced Semester Creation

---

**US-264 — Admin creates semester with auto-calculated deadlines using bylaw config**
_Setup:_ Navigate to `/admin/semesters` → "إنشاء فصل جديد".
1. Fill: Label = "الفصل الأول 2026-2027", Type = fall, Start = 2026-09-01, Reg Start = 2026-08-15.
2. Submit.
**Expected:** System reads `add_drop_weeks` (2) and `withdrawal_weeks` (7) from `bylaw_config`;
  - `add_drop_deadline` = 2026-09-01 + 14 days = 2026-09-15
  - `withdrawal_deadline` = 2026-09-01 + 49 days = 2026-10-20
Status = 'upcoming'; success toast. `Ref: TC-273, Art.12, Art.13`

---

**US-265 — Admin creates semester after changing add_drop_weeks to 3**
_Setup:_ Admin changed `add_drop_weeks` to 3 in bylaw config.
1. Admin creates new semester with start = 2026-09-01.
**Expected:** `add_drop_deadline` = 2026-09-22 (3 weeks × 7 days); new bylaw value used. `Ref: TC-274`

---

**US-266 — Admin views semester status badge color coding**
_Setup:_ 5 semesters in different statuses.
**Expected:** upcoming = grey pill, registration = blue, active = green, grading = orange, closed = dark grey/black. Each pill labeled in Arabic. `Ref: TC-275`

---

**US-267 — Admin transitions semester: registration → active notification blast**
_Setup:_ Admin closes registration window (status → active).
**Expected:** System sends bulk notification to all active students: "انتهت فترة التسجيل للفصل الثاني 2025-2026. يمكنك الحذف والإضافة حتى [deadline]". `Ref: TC-276`

---

**US-268 — Admin transitions semester: active → grading notification blast**
_Setup:_ Admin moves semester to grading.
**Expected:** All assigned doctors receive: "بدأت مرحلة إدخال الدرجات للفصل الثاني 2025-2026. يرجى إدخال درجات طلابك". `Ref: TC-277`

---

**US-269 — Finalization summary shows counts from bylaw config thresholds**
_Setup:_ After finalization, `min_attendance_pct` was 42.
**Expected:** Return payload: `{absGradesAssigned: N, warningsIssued: M, dismissals: P}` uses the current bylaw values, not hardcoded 42. Admin can retroactively see which threshold was active. `Ref: TC-278`

---

**US-270 — Admin views deadline countdown on registration page**
_Setup:_ Navigate to `/admin/registration`. Active semester has 5 days until add_drop_deadline.
**Expected:** Page shows green "مفتوح" badge + countdown: "5 أيام متبقية حتى انتهاء فترة الحذف والإضافة". Red if ≤ 3 days. `Ref: TC-279`

---

---

## 📚 SECTION G — COURSE & REGISTRATION v3 (US-271 → US-320)

### Domain G1: Level-Based Registration Enforcement

---

**US-271 — Freshman (Year 1) only sees Year 1 courses in registration**
_Setup:_ Student is in first year (`current_level = 'الأول'`, 0 credits). Registration open.
1. Navigate to `/student/courses`.
**Expected:** Available courses panel shows only Level 1 courses (from curriculum plan Year 1); Level 2, 3, 4 courses not visible unless explicitly added by admin override. `Ref: TC-280, Art.11`

---

**US-272 — Sophomore (Year 2) sees Year 1 and Year 2 courses**
_Setup:_ Student has 40 passed credits → current_level = الثاني.
1. Navigate to `/student/courses`.
**Expected:** Courses from curriculum plan Years 1 and 2 visible (including retakeable failed Year 1 courses); Year 3 and 4 courses hidden. `Ref: TC-281`

---

**US-273 — Student in Year 3 can retake failed Year 1 course**
_Setup:_ Student is Year 3 (66+ credits). Failed MA101 in Year 1.
1. MA101 appears in available courses (Year 1 course, student eligible by level).
2. I click "إضافة" for MA101.
**Expected:** Registration allowed; `attempt_number = 2`; no level block since student's level ≥ course's level. `Ref: TC-282, Art.22`

---

**US-274 — Admin overrides level restriction for specific student**
_Setup:_ A gifted freshman needs to take a Year 2 course (admin exception).
1. Admin opens student detail → Enrollment tab.
2. Admin force-adds Year 2 course via offering ID override form.
**Expected:** `POST /api/v1/admin/students/:id/enroll` — admin bypass skips level check; enrollment created; student's schedule now shows the advanced course. `Ref: TC-283`

---

**US-275 — Student with dismissed status sees all courses blocked**
_Setup:_ Student `academic_status = 'dismissed'`.
1. Navigate to `/student/courses`.
**Expected:** Red banner: "أنت في حالة فصل أكاديمي ولا يمكنك التسجيل"; all course cards show `can_register = false`; no "إضافة" buttons active. `Ref: TC-284, Art.26`

---

**US-276 — Student sees canRegister=false with specific blockReason per course**
_Setup:_ Various courses with different block reasons.
1. On `/student/courses`, look at each course card.
**Expected:** Each blocked course card displays the block reason below the course name in red:
  - "مسجل بالفعل" — already enrolled
  - "متطلب سابق: CS112 — لم تجتزه بعد"
  - "تجاوز حد الساعات المعتمدة"
  - "القسم ممتلئ (35/35)"
  - "خارج مستواك الدراسي"
`Ref: TC-285`

---

**US-277 — Summer semester shows max 7-credit warning in UI**
_Setup:_ Summer semester registration open. Student tries to add 8 credits.
1. Stat counter shows "7/7 ساعة" when at limit.
2. Any additional course shows `can_register = false` with "تجاوز حد الصيف (7 ساعات)".
**Expected:** Frontend clears the credit counter at 7 for summer; `blockReason` shown per card. `Ref: TC-286, Art.11`

---

**US-278 — Registration page shows progress bar toward credit cap**
_Setup:_ Student CGPA = 2.8 (max 20 credits). Has 15 selected.
1. On `/student/courses`, right panel.
**Expected:** Credit counter: "15/20 ساعة مختارة" with progress bar; turning orange at 80%, red at limit; courses that would exceed limit show block reason. `Ref: TC-287`

---

**US-279 — Student sees curriculum plan semester grouping in registration**
_Setup:_ Curriculum plan exists. Registration open. Student navigates to `/student/courses`.
1. Plan-grouped view is shown.
**Expected:** Courses grouped into collapsible sections: "السنة 1 - الفصل 1", "السنة 1 - الفصل 2", etc. Each section shows total credits. Courses with no offering this semester shown as dimmed/unavailable. `Ref: TC-288`

---

**US-280 — Admin verifies registration statistics after open window**
_Setup:_ Registration has been open for 2 days.
1. Navigate to `/admin/reports/detailed?type=enrollment_stats&semesterId=X`.
**Expected:** Table showing: course code, fill percentage, spare capacity, withdrawal count; sorted by fill_pct descending. Courses at 100% capacity flagged red. `Ref: TC-289`

---

### Domain G2: Advanced Registration Edge Cases

---

**US-281 — Student registers for elective and sees it grouped correctly**
_Setup:_ CS423 (Elective) is in Year 4 Sem 1 of the plan.
1. I add CS423 as a Year-4 student.
**Expected:** Registration succeeds; elective badge shown in green; it counts toward total credits; appears in schedule. `Ref: TC-290`

---

**US-282 — Student with CGPA exactly 2.0 gets max 20 credits (Art. 11)**
_Setup:_ CGPA = exactly 2.0 (boundary).
1. I try to register 20 credits.
**Expected:** Allowed; CGPA 2.0 falls in the "2.0–2.49" range → max 20; 21st credit blocked. `Ref: TC-291, Art.11`

---

**US-283 — Student with CGPA 2.5 gets max 70% of plan (Art. 11)**
_Setup:_ CGPA = 2.5. Bylaw says max for 2.5–2.99 is 70% of plan hours (typically 21–22 in a full semester).
1. I register 21 credits.
**Expected:** Allowed if bylaw `cgpa_limit_high` = 70 (meaning 70% of 30 = 21 hours); system dynamically reads from `bylaw_config`. `Ref: TC-292, Art.11`

---

**US-284 — Admin temporarily waives add/drop deadline for a student**
_Setup:_ Student missed add/drop window due to medical emergency. Admin can override.
1. Admin uses force-enroll on student detail page after add/drop has closed.
**Expected:** Admin enrollment override bypasses the date check; enrollment created successfully; regular bylaw checks (capacity, prereqs) still apply unless admin ignores them. `Ref: TC-293`

---

**US-285 — Notification sent when student successfully registers a course**
_Setup:_ Student registers CS212 during open registration.
**Expected:** Immediate notification in student feed: title="تم التسجيل في CS212", message="تم تسجيلك في مقرر Data Structures للفصل الثاني 2025-2026", type='enrollment', link='/student/schedule'. `Ref: TC-294`

---

**US-286 — Notification sent when student's course is force-dropped by admin**
_Setup:_ Admin force-drops CS311 for a student (locked grades).
**Expected:** Student receives notification: "تم إلغاء تسجيلك في CS311 بواسطة الإدارة". Doctor receives: "تم حذف تسجيل طالب من مقررك CS311". `Ref: TC-295`

---

---

## 🏫 SECTION H — DOCTOR ADVANCED SCENARIOS (US-287 → US-330)

### Domain H1: Grade Entry Edge Cases

---

**US-287 — Doctor enters grade for student whose attendance barred them (Abs)**
_Setup:_ After finalization, student in CS212 had 35% attendance → assigned "Abs".
1. Doctor opens CS212 roster.
**Expected:** Student row shows "Abs" grade; row is fully locked; no edit button; tooltip: "درجة الغياب مقيَّدة بواسطة النظام عند الإنهاء". Doctor cannot override Abs. `Ref: TC-296, Art.14, BUG-009`

---

**US-288 — Doctor enters improvement retake grade — cap at B (3.0) applied**
_Setup:_ Student retaking CS101 voluntarily. Previous attempt: D (1.0). Current attempt: A+ (4.0).
1. Doctor enters midterm=20, coursework=10, practical=10, final=56. Total=96/100.
**Expected:** total=96; letter_grade="A+"; but `is_improvement_retake=true` → `grade_points` capped at 3.0 (B) for GPA; transcript shows A+ with note "أقصى نقاط GPA للإعادة: 3.0". `Ref: TC-297, Art.22`

---

**US-289 — Doctor saves partial grades mid-semester**
_Setup:_ Only midterm results available yet. Semester still active.
1. Doctor enters midterm=18, coursework=9, practical=0, final=null.
**Expected:** Partial save accepted; `grade_locked=false`; total shows 27 (partial); letter grade not assigned yet; student can see partial grade in schedule view. `Ref: TC-298`

---

**US-290 — Doctor receives reminder notification for pending grades**
_Setup:_ Semester in grading status for 3+ days. 15 students have incomplete grades in CS212.
**Expected:** Doctor receives system notification: "⚠️ تذكير: 15 طالبًا في مقرر CS212 بدون درجات مكتملة — يرجى الإدخال قبل إنهاء الفصل"; type='grade'; daily until resolved. `Ref: TC-299`

---

**US-291 — Doctor views full grade history for a retake student**
_Setup:_ Student took CS212 twice. On first attempt: F. On second: B.
1. Doctor opens CS212 roster, finds that student.
**Expected:** Row shows: attempt_number=2, letter_grade=B, grade_points=3.0; a small indicator "(إعادة)" visible. Doctor can see both attempts exist. `Ref: TC-300`

---

**US-292 — Doctor enters grade for training course (TR401)**
_Setup:_ TR401 is a training course. `is_credit_bearing=false`.
1. Doctor enters "Pass" grade equivalent.
**Expected:** Grade recorded; `grade_points=null`; NOT included in GPA formula; IS counted toward `total_credits_passed`; transcript shows "P" in grade pill with note "تدريب". `Ref: TC-301, Art.20`

---

### Domain H2: Attendance Advanced Scenarios

---

**US-293 — Doctor creates first attendance session with backdated date**
_Setup:_ CS412 started 2 weeks ago with no attendance records.
1. Doctor opens Attendance tab → "+ تسجيل جلسة حضور".
2. Sets date to 2 weeks ago (backdate).
**Expected:** Session created with past date; system does not block past dates; session appears in history with correct date; attendance percentages update. `Ref: TC-302`

---

**US-294 — Doctor marks an excused absence**
_Setup:_ Recording a new attendance session. Student Fatma has a medical excuse.
1. Doctor toggles Fatma to absent, then checks "عذر رسمي".
**Expected:** `is_excused=true` in attendance_records; Fatma's absence count increments but shown as "⚠️ غائب بعذر"; policy may exclude excused absences from the 42% threshold calculation. `Ref: TC-303`

---

**US-295 — Doctor views attendance percentage per student sorted by risk**
_Setup:_ After 15 sessions. Various students at different attendance levels.
**Expected:** Attendance tab shows student list sorted by attendance_pct ascending (most at-risk first); students below 42% shown in red with "خطر الحرمان" badge; students 42–58% in orange; ≥59% in green. `Ref: TC-304`

---

**US-296 — System prevents duplicate session (same date + type)**
_Setup:_ Doctor already recorded a lecture session today.
1. Doctor tries to create another lecture session for today.
**Expected:** `409` — "جلسة محاضرة لهذا اليوم موجودة بالفعل"; doctor can create a lab session for same day (different type). `Ref: TC-305`

---

**US-297 — Doctor records attendance for a large class (50+ students)**
_Setup:_ CS111 has 52 enrolled students.
1. Doctor creates attendance session.
**Expected:** All 52 students shown in scrollable list; bulk select/deselect option; default = all present; doctor can toggle individuals. Performance: page loads in < 1 second. `Ref: TC-306`

---

**US-298 — Attendance summary auto-updates after session save**
_Setup:_ After doctor saves a session with 3 absences.
**Expected:** `attendance_summary` table (or computed view) immediately reflects new percentages; no page refresh needed; doctor can see updated % in the student list row. `Ref: TC-307`

---

---

## 🎓 SECTION I — STUDENT ADVANCED SCENARIOS (US-299 → US-370)

### Domain I1: Dashboard & Warnings Deep Dive

---

**US-299 — Student dashboard shows warning count correctly after 2 warnings**
_Setup:_ Student received warnings in Sem 2 and Sem 3. `total_warnings=2, consecutive_warnings=2`.
**Expected:** Dashboard "الإنذارات" stat card shows 2; a persistent red banner: "لديك 2 إنذار أكاديمي متتالي — خطر الفصل عند الإنذار الرابع". `Ref: TC-308, Art.26`

---

**US-300 — Student GPA chart shows correct semester labels on x-axis**
_Setup:_ Student has 4 semesters of GPA history.
**Expected:** Bar chart x-axis: "ف1 2023-2024", "ف2 2023-2024", "ف1 2024-2025", "ف2 2024-2025"; bars colored by value; dashed red line at 2.0 threshold. `Ref: TC-309`

---

**US-301 — First-semester student with CGPA < 2.0 sees informational banner (not warning)**
_Setup:_ Fresh student, first semester completed. CGPA = 1.5.
**Expected:** No red warning banner; instead an informational amber banner: "معدلك التراكمي 1.500 — حاول تحسينه في الفصل القادم. الفصل الأول معفى من الإنذارات الأكاديمية."; total_warnings remains 0. `Ref: TC-310, Art.25`

---

**US-302 — Student warning recovers after CGPA rises above 2.0**
_Setup:_ Student had `consecutive_warnings=2`. After latest finalization CGPA = 2.3.
**Expected:** No new warning; `consecutive_warnings=0` (reset); `total_warnings=2` (unchanged); dashboard shows green "تعافى معدلك ✅" banner; notification: "تجاوز معدلك 2.0 في هذا الفصل — تمت إعادة تعيين الإنذارات المتتالية". `Ref: TC-311, Art.25`

---

**US-303 — Student sees correct level after credits threshold**
_Setup:_ Student had 65 credits (Sophomore). Just passed 3-credit course → 68 credits (Junior threshold = 66).
**Expected:** After finalization, dashboard shows "المستوى الحالي: الثالث" (changed from الثاني); level change notification sent. `Ref: TC-312, Art.10`

---

### Domain I2: Transcript Deep Dive

---

**US-304 — Transcript shows Abs grade with attendance percentage note**
_Setup:_ Student was barred from CS412 (35% attendance).
**Expected:** CS412 row shows: letter_grade="Abs" (red pill), a note "حُرمت من الامتحان - حضور: 35%"; grade_points=0; included in GPA calculation as 0. `Ref: TC-313, Art.14`

---

**US-305 — Transcript shows both attempts of retaken course**
_Setup:_ Student failed CS101 (Attempt 1: F, 0.0) then passed (Attempt 2: B, 3.0).
**Expected:** Attempt 1 row: `is_counted_in_gpa=false`, greyed-out, label "(إعادة - لا يحتسب في المعدل)". Attempt 2 row: `is_counted_in_gpa=true`, normal styling. CGPA uses only the better attempt. `Ref: TC-314, Art.22`

---

**US-306 — Transcript GPA formula verified with training course exclusion**
_Setup:_ Semester courses: CS212 (3cr, B=3.0), TR401 (training, 3cr, P), MA211 (3cr, A=4.0).
**Expected:** Semester GPA = (3×3.0 + 3×4.0) / (3+3) = 21/6 = **3.500**; TR401 excluded from formula; training credits counted toward `total_credits_passed` but not GPA denominator. `Ref: TC-315, Art.18, Art.20`

---

**US-307 — Transcript shows W grade without affecting CGPA**
_Setup:_ Student withdrew from CS311 (W grade assigned).
**Expected:** CS311 shows grey "W" pill; note "منسحب - لا يؤثر على المعدل"; grade_points=null; NOT in GPA denominator; semester GPA unchanged by withdrawal. `Ref: TC-316, Art.13`

---

**US-308 — Transcript cumulative GPA recalculates correctly after each semester**
_Setup:_ Sem1: 3 courses 15cr avg 3.0; Sem2: 3 courses 12cr avg 2.5.
**Expected:** Pinned header: cumulative = (15×3.0 + 12×2.5)/(15+12) = (45+30)/27 = 75/27 = **2.778**. Each semester header shows its own GPA alongside the cumulative to that point. `Ref: TC-317, Art.18`

---

### Domain I3: Graduation Advanced Scenarios

---

**US-309 — Student exactly at 132 credits with all conditions passes eligibility**
_Setup:_ 132 credits, CGPA=2.2, no F, training done, project done.
**Expected:** All 5 checklist items ✅; "🎓 أنت مؤهل للتخرج!" green banner; progress bar 100%. `Ref: TC-318, Art.4`

---

**US-310 — Student eligible for honors with all 4 conditions met**
_Setup:_ CGPA=3.8, all grades ≥ B+(3.3), no F/Abs, completed in 6 semesters, 132 credits.
**Expected:** Regular graduation banner + "🏆 مؤهل لمرتبة الشرف" gold banner. All 4 honors conditions checkmarked. `Ref: TC-319, Art.27`

---

**US-311 — Graduation checklist reads live bylaw config for credit requirement**
_Setup:_ Admin changed `total_credits_required` to 128.
**Expected:** Graduation checklist shows "✅ 128/128 ساعة معتمدة" (not 132); student is eligible at 128 credits now. `Ref: TC-320, Art.4`

---

**US-312 — Student with 9-semester duration is dismissed before graduation**
_Setup:_ Student completed 8 regular semesters without graduating. Tries to register semester 9.
**Expected:** Registration blocked; `academic_status='dismissed'`; message: "تجاوزت الحد الأقصى للدراسة (8 فصول دراسية وفق اللوائح)"; graduation page shows dismissal status. `Ref: TC-321, Art.26, Art.4`

---

**US-313 — Graduation page shows 8-semester countdown warning**
_Setup:_ Student completed 7 regular semesters.
**Expected:** On `/student/graduation`, warning box: "⚠️ تنبيه: أنت في فصلك السابع من أصل 8 فصول. يجب التخرج قبل نهاية الفصل القادم." `Ref: TC-322, Art.26`

---

---

## ⚙️ SECTION J — SYSTEM / SECURITY ADVANCED (US-314 → US-360)

---

**US-314 — Rate limiter blocks 11th login attempt in 1 minute**
_Setup:_ Login page is accessible.
1. 11 rapid POST to `/api/v1/auth/login` with wrong credentials.
**Expected:** First 10 return 401; 11th returns `429 Too Many Requests`; `Retry-After` header present; rate-limit window resets after 1 minute. `Ref: TC-323`

---

**US-315 — Refresh token rotation prevents reuse**
_Setup:_ User has received new tokens via refresh. Old refresh token is captured.
1. Attacker sends POST `/api/v1/auth/refresh` with old refresh token.
**Expected:** `401` — "Refresh token invalid or expired"; old token was rotated out; no new tokens issued to attacker. `Ref: TC-324`

---

**US-316 — Concurrent enrollment race condition handled correctly**
_Setup:_ CS412 has exactly 1 remaining seat. Two students click register simultaneously.
**Expected:** `SELECT...FOR UPDATE` row-level lock; exactly one enrollment succeeds (enrolled_count = capacity); other gets `400 "القسم ممتلئ"`; enrolled_count never exceeds capacity. `Ref: TC-325, BUG-010`

---

**US-317 — Health endpoint returns correct DB status**
_Setup:_ Navigate to `/api/v1/health`.
**Expected:** `{"success":true,"status":"ok","timestamp":"..."}` with 200; if DB is down, `status:"unhealthy"` with 503. `Ref: TC-326`

---

**US-318 — Admin cannot use student JWT on admin endpoint**
_Setup:_ Attacker has a student JWT.
1. GET `/api/v1/admin/students` with student JWT.
**Expected:** `403 Forbidden` — "Insufficient role permissions"; no admin data exposed. `Ref: TC-327`

---

**US-319 — Doctor cannot modify another doctor's grade entries**
_Setup:_ Dr. Ahmed tries to PATCH enrollment from Dr. Samir's course.
1. PATCH `/api/v1/doctor/enrollments/:id/grades` with Dr. Ahmed's token for Dr. Samir's course.
**Expected:** `403` — backend verifies the requesting doctor is assigned to the offering; cross-doctor grade tampering blocked. `Ref: TC-328`

---

**US-320 — Cascade delete verified: deleting user removes all linked data**
_Setup:_ A test student user created for verification.
1. Admin (or DB) deletes the `users` row.
**Expected:** `students`, `enrollments`, `notifications`, `academic_warnings`, `attendance_records`, `refresh_tokens` all cascade-deleted via `ON DELETE CASCADE` FKs. No orphan rows. `Ref: TC-329, TC-214`

---

**US-321 — Admin creates user with must_change_pw = true → forced password change**
_Setup:_ Admin creates Dr. Samir's account.
1. Dr. Samir opens `/login` and logs in.
**Expected:** Immediate redirect to `/change-password`; backend detects `must_change_pw=true`; access to `/doctor/*` routes blocked until password changed; cannot navigate around the block. `Ref: TC-330`

---

---

## 📊 SECTION K — REPORTS & ANALYTICS v3 (US-322 → US-360)

---

**US-322 — Admin views GPA distribution as histogram bands**
_Setup:_ Navigate to `/admin/reports` → GPA Distribution tab.
**Expected:** Bar chart with bands: 0–1, 1–2, 2–3, 3–3.5, 3.5–4; count of students per band; colors: red for < 2.0, orange for 2.0–3.0, green for ≥ 3.0. `Ref: TC-331`

---

**US-323 — Admin views top 20 students by CGPA**
_Setup:_ `/admin/reports` → Top Students section.
**Expected:** Ranked table: rank, student code, full name, specialization, level, CGPA; sorted descending; download option. `Ref: TC-332`

---

**US-324 — Admin views dismissed students report with reason**
_Setup:_ 2 students dismissed: one by consecutive warnings, one by total warnings.
**Expected:** Table shows each dismissed student with: name, code, `total_warnings`, `consecutive_warnings`, dismissal reason string derived from the condition triggered (Art.26 clause). `Ref: TC-333`

---

**US-325 — Admin views enrollment statistics for a specific semester**
_Setup:_ Spring 2026 has 15 offerings. `/admin/reports` → Enrollment Stats → select Spring 2026.
**Expected:** Table: course, section, capacity, enrolled, fill%, doctor, withdrawals, drops; sorted by fill% descending; "مكتمل" badge for 100% full courses. `Ref: TC-334`

---

**US-326 — Admin views system overview stats on reports page**
_Setup:_ `/admin/reports` → Overview tab.
**Expected:** Cards showing: active students, warning students, dismissed students, graduated students, avg CGPA, active enrollments, active offerings. `Ref: TC-335`

---

---

## 🔄 SECTION L — FULL INTEGRATION SCENARIOS (US-327 → US-380)

---

**US-327 — Complete semester lifecycle with bylaw overrides active**
1. Admin changes `add_drop_weeks` to 3, `min_attendance_pct` to 45.
2. Admin creates new semester (deadlines computed with 3-week add/drop).
3. Admin opens registration → student registers.
4. Semester goes active → student can add/drop for 3 weeks (not 2).
5. Doctor records attendance; student has 44% (above old 42% but below new 45%).
6. Admin finalizes → student should get Abs with new 45% threshold.
**Expected:** The entire lifecycle uses real-time bylaw values at each step; Abs assigned because 44% < 45%; audit log shows the bylaw was 45% during this finalization. `Ref: TC-336`

---

**US-328 — Curriculum plan change affects next registration cycle**
1. Admin adds CS999 (new AI course) to Year 3 Sem 1 of CS plan.
2. Admin opens registration for Spring 2027.
3. CS999 offered this semester.
4. Year 3 CS student navigates to `/student/courses`.
**Expected:** CS999 appears in the "السنة 3 - الفصل 1" group in the student's plan-grouped registration view; properly labeled as part of their plan. `Ref: TC-337`

---

**US-329 — Admin assigns doctor schedule → doctor sees it → student sees room**
1. Admin assigns CS212 slot: Sunday 09:00–11:00, Room B-201.
2. Dr. Ahmed views `/doctor/schedule` → sees "الأحد 09:00-11:00, B-201".
3. Student enrolled in CS212 views `/student/schedule`.
**Expected:** Student sees room "B-201" in their schedule page for CS212; full chain: admin → doctor → student. `Ref: TC-338`

---

**US-330 — Notification chain: registration → attendance warning → finalization**
1. Student registers CS212 → enrollment notification.
2. After 10 sessions, attendance drops to 30% → attendance_warning notification.
3. Admin finalizes → Abs grade → warning notification (if CGPA < 2.0).
**Expected:** Student receives 3 distinct notifications, each with correct type icon, color-coded modal when clicked, and appropriate `link` for navigation. `Ref: TC-339`

---

**US-331 — Admin bylaw change prevents honors for a borderline student**
1. Admin changes `honors_min_cgpa` from 3.0 to 3.2.
2. Student has CGPA = 3.1, all other honors conditions met.
3. Student navigates to `/student/graduation`.
**Expected:** Regular graduation eligible (CGPA ≥ 2.0, 132 credits); honors NOT eligible: "غير مؤهل لمرتبة الشرف: المعدل التراكمي (3.100) أقل من الحد المطلوب (3.200)"; bylaw override reflected in real-time. `Ref: TC-340, Art.27`

---

---

## 📋 Summary of New Scenarios

| Section | Domain | Scenario IDs | Count |
|---|---|---|---|
| **D** | Admin Superadmin — Curriculum | US-221–228 | 8 |
| **D** | Admin Superadmin — Bylaw Config | US-229–238 | 10 |
| **D** | Admin Superadmin — Departments | US-239–243 | 5 |
| **D** | Admin Superadmin — Doctor Schedule | US-244–249 | 6 |
| **D** | Admin Superadmin — Prerequisites UI | US-250–253 | 4 |
| **E** | Notification Detail Modal | US-254–263 | 10 |
| **F** | Semester Lifecycle v3 | US-264–270 | 7 |
| **G** | Course & Registration v3 | US-271–286 | 16 |
| **H** | Doctor Advanced | US-287–298 | 12 |
| **I** | Student Advanced (Dashboard/Transcript/Graduation) | US-299–313 | 15 |
| **J** | System / Security | US-314–321 | 8 |
| **K** | Reports & Analytics v3 | US-322–326 | 5 |
| **L** | Full Integration | US-327–331 | 5 |
| **TOTAL NEW** | | **US-221–US-331** | **111** |

**Combined Total (v2 + v3): 220 original + 111 new = 331 scenarios**

---

## 🆕 New Feature Coverage Matrix

| Feature | Scenarios |
|---|---|
| Curriculum plan management | US-221–228, US-279, US-328 |
| Bylaw config admin override | US-229–238, US-265, US-269, US-311, US-327, US-331 |
| Department CRUD | US-239–243 |
| Doctor schedule assignment + PDF | US-244–249, US-329 |
| Prerequisite management UI | US-250–253 |
| Notification detail modal | US-254–263, US-330 |
| Level-based registration | US-271–276, US-303 |
| Summer credit enforcement (bylaw) | US-277, US-282 |
| Curriculum-grouped registration | US-227, US-279 |
| Transcript improvements | US-304–308 |
| Graduation with dynamic thresholds | US-309–313, US-311 |
| Enhanced semester creation | US-264–270 |
| Concurrent enrollment fix | US-316 |
| Refresh token security | US-315 |
| Cascade delete | US-320 |

---

## 🐛 Bug Fix Validation (v3)

| Bug ID | Original Defect | Fixed By | Validated By |
|---|---|---|---|
| BUG-011 | Clicking notification showed nothing | NotificationModal component | US-254–263 |
| BUG-012 | No doctor schedule or PDF | DoctorSchedulePage + print | US-245–246 |
| BUG-013 | No curriculum plan / course hierarchy | curriculum_plans table + UI | US-221–228 |
| BUG-014 | Bylaw params hardcoded in code | bylaw_config table + API | US-229–238 |
| BUG-015 | No department management UI | AdminDepartmentsPage | US-239–243 |
| BUG-016 | GraduationPage read wrong JSON path | Fixed eligibility nesting | US-188, US-309 |
| BUG-017 | Dashboard credits showed None | Fixed totalCreditsPassed mapping | US-141, US-299 |
| BUG-018 | POST /admin/semesters duplicate route | Renamed to /create-enhanced | US-264 |

---

*All scenarios traceable to: database schema v3 · bylaw_config table · API routes (85 total) · frontend NewPages.jsx*
*Live test results: 26/27 passing on fresh DB with seeded data (May 2026)*
