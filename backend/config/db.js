// config/db.js
// ─────────────────────────────────────────────
// Database configuration file
// Yahan hum MySQL se connection banate hain
// ─────────────────────────────────────────────

const mysql = require('mysql2');

// Create a connection pool (better than single connection)
// Pool automatically manages multiple connections
const pool = mysql.createPool({
  host: 'localhost',       // Database server address
  user: 'root',            // MySQL username (change if different)
  password: '',            // MySQL password (change to your password)
  database: 'student_db', // Database name (must match SQL schema)
  waitForConnections: true,
  connectionLimit: 10,     // Max 10 simultaneous connections
  queueLimit: 0
});

// Convert pool to use Promises (async/await support)
const promisePool = pool.promise();

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('➡️  Make sure MySQL is running and credentials are correct.');
  } else {
    console.log('✅ MySQL Database connected successfully!');
    connection.release(); // Release connection back to pool
  }
});

module.exports = promisePool;
