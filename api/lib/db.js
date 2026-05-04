// api/lib/db.js
// ─────────────────────────────────────────────
// Shared database connection for Vercel serverless functions
// Uses environment variables for cloud MySQL credentials
// ─────────────────────────────────────────────

const mysql = require('mysql2/promise');

let pool;

/**
 * Returns a singleton connection pool.
 * Reused across warm serverless invocations.
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:     process.env.DB_HOST,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port:     parseInt(process.env.DB_PORT || '3306'),

      // Enable SSL for cloud databases (Railway, PlanetScale, Aiven, etc.)
      ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,

      waitForConnections: true,
      connectionLimit: 5,   // Keep low for serverless (each fn gets its own pool)
      queueLimit: 0,
    });
  }
  return pool;
}

module.exports = getPool;
