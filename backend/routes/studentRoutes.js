// routes/studentRoutes.js
// ─────────────────────────────────────────────
// Routes define the API endpoints
// Each route maps to a controller function
// ─────────────────────────────────────────────

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

// ─── Define REST API Routes ──────────────────

// GET  /students        → Fetch all students
router.get('/', getAllStudents);

// POST /students        → Add a new student
router.post('/', addStudent);

// PUT  /students/:id    → Update a student by ID
router.put('/:id', updateStudent);

// DELETE /students/:id  → Delete a student by ID
router.delete('/:id', deleteStudent);

module.exports = router;
