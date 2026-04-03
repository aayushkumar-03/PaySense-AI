import fs from 'fs';
import path from 'path';
import pool from './pool';

async function runMigration() {
  const isReset = process.argv.includes('--reset');

  try {
    const client = await pool.connect();
    
    if (isReset) {
      console.log('Reset flag detected. Dropping all tables...');
      await client.query(`
        DROP TABLE IF EXISTS savings_suggestions CASCADE;
        DROP TABLE IF EXISTS alerts CASCADE;
        DROP TABLE IF EXISTS chat_messages CASCADE;
        DROP TABLE IF EXISTS chat_sessions CASCADE;
        DROP TABLE IF EXISTS financial_goals CASCADE;
        DROP TABLE IF EXISTS credit_scores CASCADE;
        DROP TABLE IF EXISTS budgets CASCADE;
        DROP TABLE IF EXISTS transactions CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);
      console.log('Tables dropped.');
    }

    console.log('Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await client.query(schemaSql);
    
    console.log('Migration completed successfully!');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
