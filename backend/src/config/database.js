const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME     || 'student_registration_system',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { error: err.message });
});

pool.on('connect', () => {
  logger.debug('New database connection established');
});

// Helper: run a query with automatic error logging
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn('Slow query detected', { text: text.substring(0, 100), duration });
    }
    return res;
  } catch (err) {
    logger.error('Database query error', {
      text: text.substring(0, 200),
      params: JSON.stringify(params),
      error: err.message
    });
    throw err;
  }
};

// Helper: run queries in a transaction
const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// Health check
const checkHealth = async () => {
  try {
    const res = await query('SELECT 1 AS ok, NOW() AS server_time');
    return { healthy: true, time: res.rows[0].server_time };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
};

module.exports = { pool, query, withTransaction, checkHealth };
