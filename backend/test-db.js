require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.college_id, 
        u.email, 
        u.phone,
        COALESCE(
          (SELECT json_agg(fs.subject_id) FROM faculty_subjects fs WHERE fs.faculty_id = u.id),
          '[]'::json
        ) as subject_ids
      FROM users u 
      WHERE u.role = 'faculty' 
      ORDER BY u.name
    `);
    console.log(result.rows);
  } catch(e) {
    console.error("DB ERROR: ", e);
  }
  process.exit();
}
run();
