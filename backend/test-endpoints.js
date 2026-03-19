require('dotenv').config();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || 'secret'; // checking likely env vars

async function run() {
  try {
    // Generate token
    let admin = await pool.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
    if(admin.rows.length === 0) { console.error("No admin found"); process.exit(1); }
    let token = jwt.sign({ id: admin.rows[0].id, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

    console.log("Token:", token.substring(0,20)+'...');

    const resFac = await fetch('http://localhost:5000/api/timetable/faculty/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('faculty/all Status:', resFac.status);
    const facData = await resFac.json();
    console.log('faculty/all Response:', JSON.stringify(facData).substring(0, 150));

    const resSub = await fetch('http://localhost:5000/api/timetable/subjects/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('subjects/all Status:', resSub.status);
    const subData = await resSub.json();
    console.log('subjects/all Response:', JSON.stringify(subData).substring(0, 150));

  } catch(e) {
    console.error("ERROR: ", e);
  }
  process.exit();
}
run();
