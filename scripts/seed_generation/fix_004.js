const fs = require('fs');
let content = fs.readFileSync('database/seeds/004_real_professors.sql', 'utf8');

const lines = content.split('\n');
let currentSemester = '';
let currentCourse = '';
let doctor = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('INSERT INTO course_offerings')) {
    const valsLine = lines[i+1];
    if (valsLine && valsLine.includes('VALUES')) {
      if (valsLine.includes('v_spring2026_id')) currentSemester = 'Spring';
      else currentSemester = 'Fall';
      
      const match = valsLine.match(/code='([^']+)'/);
      if (match) currentCourse = match[1];
      
      const docMatch = valsLine.match(/v_dr_[a-z_]+/);
      if (docMatch) doctor = docMatch[0];
    }
  }
  
  if (line.includes('-- No schedule slot') && currentSemester === 'Spring') {
    // Replace with a valid slot
    const slotStr = `  INSERT INTO doctor_schedule_slots (offering_id, day_of_week, start_time, end_time, room, session_type)
  VALUES (v_offering_id, 'Mon', '13:00', '15:00', 'Online', 'lecture')
  ON CONFLICT (offering_id, day_of_week, start_time)
  DO UPDATE SET end_time=EXCLUDED.end_time, room=EXCLUDED.room;`;
    lines[i] = slotStr;
  }
}

fs.writeFileSync('database/seeds/004_real_professors.sql', lines.join('\n'));
console.log('Fixed Spring 2026 schedule slots');
