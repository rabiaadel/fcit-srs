const { Client } = require('pg');

async function checkDatabase() {
  const client = new Client({
    connectionString: 'postgresql://postgres:StudentRegistrationPassword2026!@postgres:5432/student_registration_system'
  });

  await client.connect();

  console.log('--- Checking for multiple doctors teaching the same course ---');
  const multipleDoctorsQuery = `
    SELECT 
      sem.label as semester, 
      c.code as course_code, 
      c.name_en as course_name,
      COUNT(DISTINCT co.doctor_id) as doctor_count,
      STRING_AGG(DISTINCT u.full_name_en, ', ') as doctors
    FROM course_offerings co
    JOIN courses c ON co.course_id = c.id
    JOIN semesters sem ON co.semester_id = sem.id
    LEFT JOIN doctors d ON co.doctor_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    WHERE co.is_active = true
    GROUP BY sem.label, c.code, c.name_en
    HAVING COUNT(DISTINCT co.doctor_id) > 1
    ORDER BY sem.label, c.code;
  `;
  const res1 = await client.query(multipleDoctorsQuery);
  if (res1.rows.length === 0) {
    console.log('No courses taught by multiple doctors in the same semester.');
  } else {
    for (const row of res1.rows) {
      console.log(`- Semester: ${row.semester} | Course: ${row.course_code} - ${row.course_name} | Doctors: ${row.doctors}`);
    }
  }

  console.log('\n--- Checking for doctors with overlapping schedules ---');
  const overlapQuery = `
    SELECT 
      u.full_name_en as doctor_name,
      sem.label as semester,
      s1.day_of_week,
      s1.start_time,
      s1.end_time,
      c1.code as course1,
      c2.code as course2
    FROM doctor_schedule_slots s1
    JOIN course_offerings co1 ON s1.offering_id = co1.id
    JOIN courses c1 ON co1.course_id = c1.id
    JOIN semesters sem ON co1.semester_id = sem.id
    JOIN doctors d ON co1.doctor_id = d.id
    JOIN users u ON d.user_id = u.id
    JOIN course_offerings co2 ON co1.doctor_id = co2.doctor_id AND co1.semester_id = co2.semester_id AND co1.id < co2.id
    JOIN courses c2 ON co2.course_id = c2.id
    JOIN doctor_schedule_slots s2 ON s2.offering_id = co2.id 
      AND s1.day_of_week = s2.day_of_week 
      AND s1.start_time < s2.end_time 
      AND s1.end_time > s2.start_time
    WHERE co1.is_active = true AND co2.is_active = true
    ORDER BY u.full_name_en, sem.label, s1.day_of_week;
  `;
  const res2 = await client.query(overlapQuery);
  if (res2.rows.length === 0) {
    console.log('No doctors found with overlapping schedules.');
  } else {
    for (const row of res2.rows) {
      console.log(`- Doctor: ${row.doctor_name} | Semester: ${row.semester} | Day: ${row.day_of_week} | Time: ${row.start_time} - ${row.end_time} | Courses: ${row.course1} and ${row.course2}`);
    }
  }

  await client.end();
}

checkDatabase().catch(console.error);
