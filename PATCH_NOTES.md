# FCIT-SRS Patch — 3 Root-Cause Fixes

## Files Changed

### 1. `backend/src/services/gpa.service.js`
**Bug fixed:** Grade save returns HTTP 400 with message `getBylaw is not a function`

**Root cause:** Circular module dependency.
- `bylaw.service.js` requires `gpa.service.js`
- `gpa.service.js` required `bylaw.service.js` at module top level

Node.js resolves circular dependencies by returning a *partially-evaluated* module.
Whichever loads second gets the other's `module.exports` before it is fully assigned,
so `{ getBylaw }` destructures as `undefined`. Any call to `getBylaw()` inside
`percentageToLetter` or `percentageToPoints` then throws
`TypeError: getBylaw is not a function`, which the controller converts to a 400 response.

**Fix:** Removed the top-level `require('./bylaw.service')`. Added a **lazy require**
*inside* each function that needs `getBylaw()`. Node's module cache means this is only
evaluated once — no performance penalty — and the circular dependency is fully broken.

---

### 2. `backend/src/controllers/admin.extensions.js`
**Bugs fixed:**
a) Student count shows `0` in "Courses and Academic Tasks" on the schedule page
b) Schedule page provides no warning when two courses are assigned overlapping times

**Root cause (a):** `getDoctorOwnSchedule` selected `co.enrolled_count`, a *denormalised*
counter column on `course_offerings`. This counter can drift out of sync with actual
enrollments (trigger misfire, manual DB edits, etc.). The live truth is in the
`enrollments` table.

**Fix (a):** Replaced `co.enrolled_count` in the SELECT with a live correlated subquery:
```sql
(SELECT COUNT(*) FROM enrollments e
 WHERE e.offering_id = co.id
   AND e.status IN ('registered','completed')) AS enrolled_count
```
Also updated `totalStudents` in the API response to use this live count.

**Root cause (b):** The per-slot conflict check in `assignScheduleToOffering` prevents
*new* overlaps, but legacy/seed data may already contain them. Once persisted, nothing
in the read path flagged them for the doctor.

**Fix (b):** Added an overlap-detection loop after building `weeklyGrid`. It sets
`hasConflict: true` on every conflicting slot object and populates a `scheduleConflicts`
array returned in the API response. No DB changes required.

---

### 3. `frontend/src/pages/doctor/DoctorSchedulePage.jsx`
**Bugs fixed:** (UI side of fixes 2a and 2b above)

**Changes:**
- `totalStudents` now reads `data.totalStudents` from the backend (live count) instead of
  summing the stale `o.enrolled_count` fields client-side.
- `scheduleConflicts` array is read from the response.
- **Conflict banner:** rendered above the stats row when `scheduleConflicts.length > 0`,
  listing every conflicting course pair with day/time details and a call to action.
- **SlotCard:** conflicting slots get a red border, red background, red "⚠ تعارض" label,
  and a glow box-shadow. Hover tooltip also mentions the conflict.
