// api/students/index.js
// ─────────────────────────────────────────────
// Vercel Serverless Function
// Handles: GET /students  →  Fetch all students
//          POST /students →  Add a new student
// ─────────────────────────────────────────────

const getPool = require('../lib/db');
const cors = require('cors');

// ─── CORS Middleware ─────────────────────────
const corsMiddleware = cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

// ─── Input Validation ─────────────────────────
function validateStudent(name, roll_number, branch) {
  const errors = [];
  if (!name || name.trim().length < 2)
    errors.push('Name must be at least 2 characters long.');
  if (!roll_number || roll_number.trim().length < 2)
    errors.push('Roll number is required.');
  if (!branch || branch.trim().length < 2)
    errors.push('Branch is required.');
  if (roll_number && !/^[a-zA-Z0-9\/\-]+$/.test(roll_number.trim()))
    errors.push('Roll number should only contain letters, numbers, / or -.');
  return errors;
}

// ─── Main Handler ─────────────────────────────
module.exports = async (req, res) => {
  await runMiddleware(req, res, corsMiddleware);

  // Handle preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getPool();

  // ── GET /students ──────────────────────────
  if (req.method === 'GET') {
    try {
      const [rows] = await db.query(
        'SELECT id, name, roll_number, branch, created_at FROM students ORDER BY id ASC'
      );
      return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
      console.error('Error fetching students:', error);
      return res.status(500).json({ success: false, message: 'Server error while fetching students.' });
    }
  }

  // ── POST /students ─────────────────────────
  if (req.method === 'POST') {
    try {
      const { name, roll_number, branch } = req.body;

      // Validate input
      const errors = validateStudent(name, roll_number, branch);
      if (errors.length > 0)
        return res.status(400).json({ success: false, message: errors.join(' ') });

      // Check for duplicate roll number
      const [existing] = await db.query(
        'SELECT id FROM students WHERE roll_number = ?',
        [roll_number.trim().toUpperCase()]
      );
      if (existing.length > 0)
        return res.status(409).json({ success: false, message: `Roll number "${roll_number}" already exists.` });

      // Insert student
      const [result] = await db.query(
        'INSERT INTO students (name, roll_number, branch) VALUES (?, ?, ?)',
        [name.trim(), roll_number.trim().toUpperCase(), branch.trim()]
      );

      // Return the newly created student
      const [newStudent] = await db.query(
        'SELECT id, name, roll_number, branch, created_at FROM students WHERE id = ?',
        [result.insertId]
      );

      return res.status(201).json({
        success: true,
        message: 'Student added successfully!',
        data: newStudent[0],
      });
    } catch (error) {
      console.error('Error adding student:', error);
      return res.status(500).json({ success: false, message: 'Server error while adding student.' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
};
