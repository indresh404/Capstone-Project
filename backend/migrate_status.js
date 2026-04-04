const pool = require('./src/db/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting migration...');
    await client.query(`
      ALTER TABLE timetable 
      ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'scheduled';
    `);
    console.log('✅ Added status column to timetable');
    
    // Seed some as completed for testing
    await client.query(`
      UPDATE timetable 
      SET status = 'completed' 
      WHERE id IN (
        SELECT id FROM timetable LIMIT 10
      );
    `);
    console.log('✅ Seeded some records as completed');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    process.exit();
  }
}

migrate();
