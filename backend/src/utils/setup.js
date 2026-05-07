// =============================================================================
// Unified DB Setup — migrate + seed in ONE process with ONE pool
//
// [C4-FIX] Root cause: migrate.js and seed.js each call pool.end() after running.
// Node.js caches modules. When entrypoint calls: node migrate.js && node seed.js
// as SEPARATE processes → separate pools → WORKS.
// But migrate.js itself does: require('../config/database') → runs schema → pool.end()
// then seed.js does require('../config/database') → gets the SAME cached pool
// which is already ended → "Cannot use a pool after calling end on the pool"
//
// FIX: Run both in one process. Create pool once. Use it for both. Close once.
// This also reduces startup time by ~2s (no second process spawn + connect).
// =============================================================================
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');
const logger = require('./logger');

const DB_BASE = process.env.DB_MIGRATION_PATH || '/app/database';

// Create a FRESH pool — not the cached one from config/database.js
// This prevents any interference with the main application pool
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME     || 'student_registration_system',
  max: 2,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 5000,
});

async function runFile(client, filePath, label) {
  if (!fs.existsSync(filePath)) {
    logger.warn(`${label}: file not found at ${filePath}, skipping`);
    return false;
  }
  const sql = fs.readFileSync(filePath, 'utf8');
  logger.info(`${label}: applying...`);
  await client.query(sql);
  logger.info(`${label}: done`);
  return true;
}

async function setup() {
  let client;
  let exitCode = 0;

  try {
    client = await pool.connect();
    logger.info('Setup: connected to database');

    // ── Migrations ────────────────────────────────────────────────────────────
    logger.info('Running migrations...');
    await runFile(client, path.join(DB_BASE, 'schema.sql'),       'Schema');
    await runFile(client, path.join(DB_BASE, 'enhancements.sql'), 'Enhancements');
    logger.info('Migrations complete');

    // ── Seeds ──────────────────────────────────────────────────────────────────
    logger.info('Running seeds...');
    const seedsDir = path.join(DB_BASE, 'seeds');
    if (fs.existsSync(seedsDir)) {
      const files = fs.readdirSync(seedsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();
      for (const file of files) {
        await runFile(client, path.join(seedsDir, file), `Seed:${file}`);
      }
    } else {
      logger.warn('Seeds directory not found');
    }
    logger.info('All seeds complete');

  } catch (err) {
    logger.error('Setup error', { error: err.message, stack: err.stack?.slice(0, 200) });
    exitCode = 1;
  } finally {
    if (client) client.release();
    // Close THIS setup pool, not the application pool
    await pool.end().catch(() => {});
    if (exitCode !== 0) process.exit(exitCode);
  }
}

setup();
