const { query } = require('../config/database');

/**
 * Generates a student code: {year}{prefix}{sequentialNumber}
 * Sequential number is zero-padded to 4 digits.
 * Uses SELECT ... FOR UPDATE to prevent race conditions under concurrent inserts.
 *
 * @param {string} year   - e.g. "2024"
 * @param {string} prefix - e.g. "CS" or "GEN"
 * @param {object} client - pg transaction client
 * @returns {Promise<string>} - e.g. "2024CS0042"
 */
async function generateStudentCode(year, prefix, client) {
  // Use a transaction-level advisory lock to serialize code generation
  await client.query(`SELECT pg_advisory_xact_lock(hashtext('student_code_gen_' || $1))`, [`${year}${prefix}`]);

  const { rows } = await client.query(
    `SELECT COUNT(*) AS cnt
     FROM students
     WHERE student_code LIKE $1`,
    [`${year}${prefix}%`]
  );
  const seq = parseInt(rows[0].cnt, 10) + 1;
  return `${year}${prefix}${String(seq).padStart(4, '0')}`;
}

module.exports = { generateStudentCode };
