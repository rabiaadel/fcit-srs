const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'admin123',
  database: 'student_registration_system'
});

async function run() {
  try {
    await client.connect();
    
    const tables = [
      'users', 'students', 'doctors', 'courses', 'course_offerings', 
      'curriculum_plans', 'enrollments', 'doctor_schedule_slots', 'semesters'
    ];
    
    for (const table of tables) {
      try {
        const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`${table}: ${res.rows[0].count}`);
      } catch (err) {
        console.log(`${table}: ERROR - ${err.message}`);
      }
    }
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.end();
  }
}

run();
