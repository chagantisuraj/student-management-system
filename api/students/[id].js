// api/students/[id].js
// ─────────────────────────────────────────────
// Vercel Serverless Function
// Handles: PUT    /students/:id  →  Update a student
//          DELETE /students/:id  →  Delete a student
// ─────────────────────────────────────────────

const getPool = require('../lib/db');
const cors = require('cors');

// ─── CORS Middleware ─────────────────────────
const corsMiddleware = cors({
  origin: '*',
  methods: ['GET', 'PUT', 'DELETE', 'OPTIONS'],
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

  // Extract and validate the :id param
  const { id } = req.query;
  if (!id || isNaN(id))
    return res.status(400).json({ success: false, message: 'Invalid student ID.' });

  const db = getPool();

  // ── PUT /students/:id ──────────────────────
  if (req.method === 'PUT') {
    try {
      const { name, roll_number, branch } = req.body;

      // Validate fields
      const errors = validateStudent(name, roll_number, branch);
      if (errors.length > 0)
        return res.status(400).json({ success: false, message: errors.join(' ') });

      // Check student exists
      const [existing] = await db.query('SELECT id FROM students WHERE id = ?', [id]);
      if (existing.length === 0)
        return res.status(404).json({ success: false, message: 'Student not found.' });

      // Check duplicate roll number (excluding current student)
      const [duplicate] = await db.query(
        'SELECT id FROM students WHERE roll_number = ? AND id != ?',
        [roll_number.trim().toUpperCase(), id]
      );
      if (duplicate.length > 0)
        return res.status(409).json({
          success: false,
          message: `Roll number "${roll_number}" is already used by another student.`,
        });

      // Update record
      await db.query(
        'UPDATE students SET name = ?, roll_number = ?, branch = ? WHERE id = ?',
        [name.trim(), roll_number.trim().toUpperCase(), branch.trim(), id]
      );

      // Return updated student
      const [updated] = await db.query(
        'SELECT id, name, roll_number, branch, created_at FROM students WHERE id = ?',
        [id]
      );

      return res.status(200).json({
        success: true,
        message: 'Student updated successfully!',
        data: updated[0],
      });
    } catch (error) {
      console.error('Error updating student:', error);
      return res.status(500).json({ success: false, message: 'Server error while updating student.' });
    }
  }

  // ── DELETE /students/:id ───────────────────
  if (req.method === 'DELETE') {
    try {
      // Check student exists
      const [existing] = await db.query('SELECT id, name FROM students WHERE id = ?', [id]);
      if (existing.length === 0)
        return res.status(404).json({ success: false, message: 'Student not found.' });

      const studentName = existing[0].name;

      // Delete
      await db.query('DELETE FROM students WHERE id = ?', [id]);

      return res.status(200).json({
        success: true,
        message: `Student "${studentName}" deleted successfully!`,
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      return res.status(500).json({ success: false, message: 'Server error while deleting student.' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
};
