
# Academic Regulations & Bylaw API (2024-7-73)

This JSON structure represents the official academic bylaw of the Faculty of Computers and Information.

## Design Philosophy
- **Dynamic Extensibility**: All business rules for graduation, grading, warnings, and registration are encoded as rules in the JSON.
- **Grading Constraints**: Uses the 4.0 GPA scale where `A+` = 4.0 and passing grade is `D`.
- **Registration Constraints**: Minimum hours = 9, Maximum hours = 21 (CGPA dependent).
- **Curriculum Architecture**: 
  - University Requirements: 12 Hours
  - Faculty Requirements: 60 Hours
  - Specialization Requirements: 60 Hours
  - Project: 6 Hours
  - Total: 138 Hours

## Usage in Backend
The backend should parse this JSON file and expose a `BylawService` that acts as a singleton engine.

Example checking max hours:
```javascript
const getMaxHours = (cgpa) => {
  const rules = bylaw.registration_rules.regular_semester.max_hours_by_gpa;
  for (const rule of rules) {
    if (cgpa >= rule.min_cgpa) return rule.max_hours;
  }
  return 12; // Fallback
}
```
