// =============================================================================
// Unified DB Setup — schema + migrations + seeds in ONE process
//
// Flow:
//   1. schema.sql          (base DDL)
//   2. enhancements.sql    (views, helpers)
//   3. migration_v3.sql    (curriculum_plans, bylaw_config tables)
//   4. migration_v4.sql    (schema additions)
//   5. migration_v5.sql    (section_label, constraint fixes)
//   6. seeds/001–009       (idempotent data population)
//
// Every seed file is idempotent (ON CONFLICT safe), so re-running is harmless.
// The admin-exists check is a performance optimization to skip seeds on warm boots.
// =============================================================================
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');
const logger = require('./logger');

const DB_BASE = process.env.DB_MIGRATION_PATH || '/app/database';

// Create a FRESH pool — not the cached one from config/database.js
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

// Ordered list of schema/migration files to run before seeds
const SCHEMA_FILES = [
  'schema.sql',
  'enhancements.sql',
  'migration_v3.sql',
  'migration_v4.sql',
  'migration_v5.sql',
];

async function setup() {
  let client = null;
  let exitCode = 0;

  try {
    client = await pool.connect();
    logger.info('Setup: connected to database');

    // ── 1. Schema + migrations (always idempotent via IF NOT EXISTS / OR REPLACE) ──
    logger.info('Running schema and migrations...');
    for (const file of SCHEMA_FILES) {
      await runFile(client, path.join(DB_BASE, file), `Schema:${file}`);
    }
    logger.info('Schema and migrations complete');

    // ── 2. Seeds — skip if admin already exists (performance guard) ──────────
    const adminCheck = await client.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    ).catch(() => ({ rows: [] }));

    if (adminCheck.rows.length > 0) {
      logger.info('Admin user already exists. Skipping seeds.');
    } else {
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
    }

    // ── 3. Historical data — run when student count < 5 ──────────────────
    // This covers both:
    //   a) Fresh install (seeds just ran, only 1 demo student exists)
    //   b) Re-seeded DB (someone wiped data)
    // The guard < 5 is deliberate: demo student (1) is already there after
    // seed 010; any count ≥ 5 means historical data was previously generated.
    //
    // ROOT CAUSE: generate-historical-data.js was never called from the
    // entrypoint. This block fixes that by calling seedHistoricalData()
    // directly from setup.js after seeds complete.
    let studentCount = 0;
    try {
      const sc = await client.query('SELECT COUNT(*)::int AS n FROM students');
      studentCount = sc.rows[0].n;
    } catch (_) { /* table may not exist on very first boot */ }

    if (studentCount < 5) {
      logger.info(`Student count is ${studentCount} — running historical data seeder...`);
      client.release();
      client = null; // release before seedHistorical opens its own connection
      try {
        const { seedHistoricalData } = require('./seedHistorical');
        await seedHistoricalData(pool, logger);
        logger.info('Historical data seeding complete ✓');
      } catch (histErr) {
        logger.error('Historical data seeding failed (non-fatal)', {
          error: histErr.message,
          stack: histErr.stack?.slice(0, 800),
        });
      }
    } else {
      logger.info(`Student count is ${studentCount} — historical data already present, skipping.`);
    }

    logger.info('Database setup complete ✓');

  } catch (err) {
    logger.error('Setup error', { error: err.message, stack: err.stack?.slice(0, 500) });
    exitCode = 1;
  } finally {
    if (client) client.release();
    await pool.end().catch(() => {});
    if (exitCode !== 0) process.exit(exitCode);
  }
}

setup();
