const { Client } = require('pg');

async function audit() {
  const client = new Client({
    host: process.env.PGHOST || 'localhost',
    port: 5432,
    user: process.env.PGUSER || 'postgres',
    password: 'admin123',
    database: 'student_registration_system'
  });

  await client.connect();
  console.log('--- STARTING DB AUDIT ---');

  // 1. Orphaned course offerings (no doctor)
  const q1 = await client.query(`SELECT COUNT(*) FROM course_offerings WHERE doctor_id IS NULL`);
  console.log('Orphaned Course Offerings (NULL Doctor):', q1.rows[0].count);

  // 2. Orphaned course offerings (doctor no longer exists)
  const q2 = await client.query(`SELECT COUNT(*) FROM course_offerings co LEFT JOIN doctors d ON co.doctor_id = d.id WHERE d.id IS NULL AND co.doctor_id IS NOT NULL`);
  console.log('Course Offerings with Invalid Doctor ID:', q2.rows[0].count);

  // 3. Students without valid users
  const q3 = await client.query(`SELECT COUNT(*) FROM students s LEFT JOIN users u ON s.user_id = u.id WHERE u.id IS NULL`);
  console.log('Students with Invalid User ID:', q3.rows[0].count);

  // 4. Enrollments to missing students
  const q4 = await client.query(`SELECT COUNT(*) FROM enrollments e LEFT JOIN students s ON e.student_id = s.id WHERE s.id IS NULL`);
  console.log('Enrollments with Invalid Student ID:', q4.rows[0].count);

  // 5. Enrollments to missing offerings
  const q5 = await client.query(`SELECT COUNT(*) FROM enrollments e LEFT JOIN course_offerings co ON e.offering_id = co.id WHERE co.id IS NULL`);
  console.log('Enrollments with Invalid Offering ID:', q5.rows[0].count);

  // 6. Schedules without offerings
  const q6 = await client.query(`SELECT COUNT(*) FROM doctor_schedule_slots s LEFT JOIN course_offerings co ON s.offering_id = co.id WHERE co.id IS NULL`);
  console.log('Schedule Slots with Invalid Offering ID:', q6.rows[0].count);

  // 7. Missing Prerequisites
  const q7 = await client.query(`SELECT COUNT(*) FROM course_prerequisites cp LEFT JOIN courses c ON cp.prereq_course_id = c.id WHERE c.id IS NULL`);
  console.log('Prerequisites pointing to Invalid Course:', q7.rows[0].count);

  console.log('--- END DB AUDIT ---');
  await client.end();
}

audit().catch(console.error);


