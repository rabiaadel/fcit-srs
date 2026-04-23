require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const logger = require('./logger');

async function runSeeds() {
  const client = await pool.connect();
  try {
    logger.info('Running seeds...');
    const seedsDir = path.join('/app/database', 'seeds');
    if (!fs.existsSync(seedsDir)) {
      logger.warn('Seeds directory not found');
      return;
    }

    const files = fs.readdirSync(seedsDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      logger.info(`Running seed: ${file}`);
      await client.query(sql);
      logger.info(`Seed ${file} complete`);
    }
    logger.info('All seeds complete');
  } catch (err) {
    logger.error('Seed error', { error: err.message });
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeeds();
