require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const logger = require('./logger');

async function runMigrations() {
  const client = await pool.connect();
  let failed = false;
  try {
    logger.info('Running database migrations...');
    const schemaPath = path.join('/app/database', 'schema.sql');
    const enhancePath = path.join('/app/database', 'enhancements.sql');

    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schema);
      logger.info('Schema applied');
    }
    if (fs.existsSync(enhancePath)) {
      const enhancements = fs.readFileSync(enhancePath, 'utf8');
      await client.query(enhancements);
      logger.info('Enhancements applied');
    }
    logger.info('Migrations complete');
  } catch (err) {
    logger.error('Migration error', { error: err.message });
    failed = true;
  } finally {
    client.release();
    await pool.end().catch(() => {});
    if (failed) process.exit(1);
  }
}

runMigrations();
