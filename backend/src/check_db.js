const { pool } = require('./config/database');

async function check() {
  try {
    const res = await pool.query(`
      SELECT s.id, s.label, s.status, ay.year_label, s.start_date, s.end_date, s.registration_start, s.registration_end, s.add_drop_deadline, s.withdrawal_deadline
      FROM semesters s
      JOIN academic_years ay ON ay.id = s.academic_year_id
      ORDER BY ay.year_label DESC, s.id DESC
      LIMIT 10;
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
check();
