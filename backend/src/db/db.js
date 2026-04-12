require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,                          // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,         // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000,    // How long to wait for a connection
});

// The pool will emit an error on behalf of any idle client it contains
// if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client:', err.message);
  // We don't need to exit, the pool will handle connection recreation
});

pool.connect()
  .then(() => console.log("✅ Successfully reached Supabase"))
  .catch(err => console.error("❌ Supabase connection error:", err.message));

module.exports = pool;