const fs = require('fs');

const classes = [
  // Year 1 - Fall 2025
  { sem: 'fall2025', c: 'BS112', dr: 'aida', day: 'Sat', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'fall2025', c: 'CS111', dr: 'osama', day: 'Sun', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'IS111', dr: 'omnia', day: 'Sun', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'BS111', dr: 'nancy', day: 'Mon', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'BS116', dr: 'shimaa', day: 'Mon', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'fall2025', c: 'UNV113', dr: 'walid_s', day: 'Mon', start: '13:00', end: '15:00', room: 'Online', section: 'Main' },
  // Year 1 - Spring 2026
  { sem: 'spring2026', c: 'BS115', dr: 'aida', day: 'Sat', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'UNV112', dr: 'ahmed', day: 'Sat', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'BS113', dr: 'mostafa', day: 'Sun', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'BS115', dr: 'nancy', day: 'Mon', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Section 2' },
  { sem: 'spring2026', c: 'UNV114', dr: 'arwa', day: 'Tue', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'UNV111', dr: 'shimaa', day: 'Wed', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'CS112', dr: 'osama', day: 'Wed', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  // Year 2 - Fall 2025
  { sem: 'fall2025', c: 'BS114', dr: 'hanaa_h', day: 'Sat', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'BS117', dr: 'nancy', day: 'Sat', start: '13:00', end: '15:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'CS211', dr: 'osama', day: 'Tue', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'fall2025', c: 'SE211', dr: 'arwa', day: 'Wed', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'fall2025', c: 'CS212', dr: 'mostafa', day: 'Thu', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'IT211', dr: 'aida', day: 'Thu', start: '13:00', end: '15:00', room: 'Online', section: 'Main' },
  // Year 2 - Spring 2026
  { sem: 'spring2026', c: 'IS211', dr: 'omnia', day: 'Sun', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'CS214', dr: 'hanaa_e', day: 'Mon', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'IT317', dr: 'marian', day: 'Tue', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'IS212', dr: 'nancy', day: 'Tue', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'CS213', dr: 'osama', day: 'Thu', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  // Year 3 CS - Fall 2025
  { sem: 'fall2025', c: 'IT311', dr: 'ahmed', day: 'Sun', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'CS313', dr: 'ahmed', day: 'Sun', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'CS311', dr: 'mostafa', day: 'Mon', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'fall2025', c: 'IS311', dr: 'shimaa', day: 'Mon', start: '11:00', end: '13:00', room: 'Central Hall (Lower)', section: 'Main' },
  { sem: 'fall2025', c: 'CS312', dr: 'walid_k', day: 'Wed', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'CS331', dr: 'osama', day: 'Thu', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  // Year 3 CS - Spring 2026
  { sem: 'spring2026', c: 'CS314', dr: 'walid_k', day: 'Sat', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'CS332', dr: 'ahmed', day: 'Wed', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'CS411', dr: 'mostafa', day: 'Wed', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'SE315', dr: 'arwa', day: 'Wed', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'CS315', dr: 'walid_k', day: 'Thu', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'CS316', dr: 'ahmed', day: 'Thu', start: '07:00', end: '09:00', room: 'Central Hall (Upper)', section: 'Main' },
  // Year 3 IT - Fall 2025
  { sem: 'fall2025', c: 'IT311', dr: 'ahmed', day: 'Sun', start: '11:00', end: '13:00', room: 'Online', section: 'Section B' },
  { sem: 'fall2025', c: 'IT321', dr: 'hany', day: null, start: null, end: null, room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'CS313', dr: 'ahmed', day: 'Tue', start: '11:00', end: '13:00', room: 'Online', section: 'Section B' },
  { sem: 'fall2025', c: 'IT315', dr: 'tahani', day: 'Wed', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'IT312', dr: 'marian', day: 'Thu', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'IT314', dr: 'aida', day: 'Thu', start: '09:00', end: '11:00', room: 'Hall 2', section: 'Main' },
  // Year 3 IT - Spring 2026
  { sem: 'spring2026', c: 'IT319', dr: 'marian', day: 'Sun', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'IT322', dr: 'aida', day: 'Sun', start: '11:00', end: '13:00', room: 'Hall 3', section: 'Main' },
  { sem: 'spring2026', c: 'IT318', dr: 'arwa', day: 'Mon', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IT317', dr: 'tahani', day: 'Thu', start: '07:00', end: '09:00', room: 'Online', section: 'Section B' },
  { sem: 'spring2026', c: 'IT316', dr: 'marian', day: 'Thu', start: '15:00', end: '17:00', room: 'Online', section: 'Main' },
  // Year 3 IS - Fall 2025
  { sem: 'fall2025', c: 'CS314', dr: 'ahmed', day: 'Sun', start: '09:00', end: '11:00', room: 'Hall 3', section: 'Main' },
  { sem: 'fall2025', c: 'IS313', dr: 'hany', day: 'Sun', start: '11:00', end: '13:00', room: 'Hall 3', section: 'Main' },
  { sem: 'fall2025', c: 'IS311', dr: 'shimaa', day: 'Sun', start: '11:00', end: '13:00', room: 'Central Hall (Lower)', section: 'Section B' },
  { sem: 'fall2025', c: 'IS312', dr: 'shimaa', day: 'Mon', start: '09:00', end: '11:00', room: 'Hall 1', section: 'Main' },
  { sem: 'fall2025', c: 'CS313', dr: 'ahmed', day: 'Tue', start: '07:00', end: '09:00', room: 'Online', section: 'Section C' },
  { sem: 'fall2025', c: 'IS351', dr: 'omnia', day: 'Tue', start: '09:00', end: '11:00', room: 'Hall 2', section: 'Main' },
  // Year 3 IS - Spring 2026
  { sem: 'spring2026', c: 'IS315', dr: 'shimaa', day: 'Sat', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IS317', dr: 'ibrahim', day: 'Sun', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IS321', dr: 'shimaa', day: 'Tue', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IS318', dr: 'omnia', day: 'Tue', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IS314', dr: 'omnia', day: 'Wed', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IS321', dr: 'hany', day: 'Thu', start: '11:00', end: '13:00', room: 'Hall 3', section: 'Section B' },
  // Year 4 CS - Fall 2025
  { sem: 'fall2025', c: 'CS315', dr: 'walid_k', day: 'Sat', start: '09:00', end: '11:00', room: 'Central Hall (Lower)', section: 'Main' },
  { sem: 'fall2025', c: 'CS443', dr: 'marian', day: 'Sat', start: '11:00', end: '13:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'fall2025', c: 'SE321', dr: 'ahmed', day: 'Sun', start: '09:00', end: '11:00', room: 'Central Hall (Lower)', section: 'Main' },
  { sem: 'fall2025', c: 'CS434', dr: 'walid_k', day: 'Mon', start: '09:00', end: '11:00', room: 'Central Hall (Lower)', section: 'Main' },
  { sem: 'fall2025', c: 'CS413', dr: 'hanaa_h', day: 'Wed', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  // Year 4 CS - Spring 2026
  { sem: 'spring2026', c: 'CS331', dr: 'hanaa_h', day: 'Sat', start: '07:00', end: '09:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'CS332', dr: 'ahmed', day: 'Sun', start: '07:00', end: '09:00', room: 'Central Hall (Upper)', section: 'Section B' },
  { sem: 'spring2026', c: 'CS416', dr: 'hanaa_h', day: 'Mon', start: '07:00', end: '09:00', room: 'Central Hall (Upper)', section: 'Main' },
  { sem: 'spring2026', c: 'CS415', dr: 'walid_k', day: 'Mon', start: '11:00', end: '13:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'CS433', dr: 'mostafa', day: null, start: null, end: null, room: 'Online', section: 'Main' },
  // Year 4 IT - Fall 2025
  { sem: 'fall2025', c: 'IT415', dr: 'arwa', day: 'Sat', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'IT315', dr: 'tahani', day: 'Sat', start: '11:00', end: '13:00', room: 'Online', section: 'Section B' },
  { sem: 'fall2025', c: 'CS315', dr: 'walid_k', day: 'Sun', start: '09:00', end: '11:00', room: 'Central Hall (Lower)', section: 'Section B' },
  { sem: 'fall2025', c: 'IT444', dr: 'marian', day: 'Tue', start: '09:00', end: '11:00', room: 'Hall 1', section: 'Main' },
  { sem: 'fall2025', c: 'IT313', dr: 'aida', day: 'Wed', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Main' },
  // Year 4 IT - Spring 2026
  { sem: 'spring2026', c: 'IT319', dr: 'marian', day: 'Sun', start: '09:00', end: '11:00', room: 'Central Hall (Upper)', section: 'Section B' },
  { sem: 'spring2026', c: 'IT414', dr: 'aida', day: 'Mon', start: '09:00', end: '11:00', room: 'Hall 2', section: 'Main' },
  { sem: 'spring2026', c: 'IT413', dr: 'arwa', day: 'Tue', start: '11:00', end: '13:00', room: 'Hall 3', section: 'Main' },
  { sem: 'spring2026', c: 'IT314', dr: 'marwa', day: 'Tue', start: '09:00', end: '11:00', room: 'Hall 1', section: 'Main' },
  { sem: 'spring2026', c: 'IT411', dr: 'iman', day: 'Wed', start: '09:00', end: '11:00', room: 'Hall 2', section: 'Main' },
  // Year 4 IS - Fall 2025
  { sem: 'fall2025', c: 'IS341', dr: 'ibrahim', day: 'Sat', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'fall2025', c: 'IS411', dr: 'shimaa', day: 'Sat', start: '07:00', end: '09:00', room: 'Hall 3', section: 'Main' },
  { sem: 'fall2025', c: 'IS412', dr: 'hany', day: 'Sat', start: '11:00', end: '13:00', room: 'Hall 1', section: 'Main' },
  { sem: 'fall2025', c: 'CS314', dr: 'ahmed', day: null, start: null, end: null, room: 'Hall 3', section: 'Section B' },
  { sem: 'fall2025', c: 'IS351', dr: 'omnia', day: 'Sun', start: '09:00', end: '11:00', room: 'Hall 2', section: 'Section B' },
  // Year 4 IS - Spring 2026
  { sem: 'spring2026', c: 'IS413', dr: 'ibrahim', day: 'Sun', start: '07:00', end: '09:00', room: 'Online', section: 'Main' },
  { sem: 'spring2026', c: 'IS342', dr: 'shimaa', day: 'Mon', start: '09:00', end: '11:00', room: 'Hall 1', section: 'Main' },
  { sem: 'spring2026', c: 'IS415', dr: 'iman', day: 'Mon', start: '11:00', end: '13:00', room: 'Hall 1', section: 'Main' },
  { sem: 'spring2026', c: 'IS414', dr: 'shimaa', day: 'Tue', start: '09:00', end: '11:00', room: 'Hall 3', section: 'Main' },
  { sem: 'spring2026', c: 'IS421', dr: 'hany', day: 'Thu', start: '11:00', end: '13:00', room: 'Hall 3', section: 'Main' }
];

let dbTxt = fs.readFileSync('db_offerings.txt', 'utf8').split('\\n');
let dbSet = new Set();
for(let line of dbTxt) {
  if(line.trim()) {
    let parts = line.split('|').map(x => x.trim());
    if(parts.length === 3) {
      dbSet.add(parts.join('|'));
    }
  }
}

classes.forEach(c => {
  const semLabel = c.sem === 'fall2025' ? 'Fall 2025' : 'Spring 2026';
  const key = semLabel + '|' + c.c + '|' + c.section;
  if (!dbSet.has(key)) {
    console.log('Missing: ' + key);
  }
});
