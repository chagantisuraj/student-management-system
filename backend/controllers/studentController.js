// controllers/studentController.js
// ─────────────────────────────────────────────
// Controller handles all business logic
// (Database queries + Response sending)
// ─────────────────────────────────────────────

const db = require('../config/db');

// ─── Helper: Input Validation ───────────────
// Validates student data before DB operations
function validateStudent(name, roll_number, branch) {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long.');
  }
  if (!roll_number || roll_number.trim().length < 2) {
    errors.push('Roll number is required.');
  }
  if (!branch || branch.trim().length < 2) {
    errors.push('Branch is required.');
  }

  // Roll number format: alphanumeric only
  if (roll_number && !/^[a-zA-Z0-9\/\-]+$/.test(roll_number.trim())) {
    errors.push('Roll number should only contain letters, numbers, / or -.');
  }

  return errors;
}

// ─── GET /students ───────────────────────────
// Fetch all students from the database
const getAllStudents = async (req, res) => {
  try {
    // Raw SQL query - no ORM
    const [rows] = await db.query(
      'SELECT id, name, roll_number, branch, created_at FROM students ORDER BY id ASC'
    );

    // Return success response with data
    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching students.'
    });
  }
};

// ─── POST /students ──────────────────────────
// Add a new student to the database
const addStudent = async (req, res) => {
  try {
    const { name, roll_number, branch } = req.body;

    // Step 1: Validate input
    const errors = validateStudent(name, roll_number, branch);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(' ')
      });
    }

    // Step 2: Check if roll number already exists
    const [existing] = await db.query(
      'SELECT id FROM students WHERE roll_number = ?',
      [roll_number.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Roll number "${roll_number}" already exists.`
      });
    }

    // Step 3: Insert new student
    const [result] = await db.query(
      'INSERT INTO students (name, roll_number, branch) VALUES (?, ?, ?)',
      [name.trim(), roll_number.trim().toUpperCase(), branch.trim()]
    );

    // Step 4: Fetch the newly created student to return
    const [newStudent] = await db.query(
      'SELECT id, name, roll_number, branch, created_at FROM students WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Student added successfully!',
      data: newStudent[0]
    });

  } catch (error) {
    console.error('Error adding student:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding student: ' + error.message
    });
  }
};

// ─── PUT /students/:id ───────────────────────
// Update an existing student's details
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, roll_number, branch } = req.body;

    // Step 1: Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID.'
      });
    }

    // Step 2: Validate input fields
    const errors = validateStudent(name, roll_number, branch);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(' ')
      });
    }

    // Step 3: Check if student exists
    const [existing] = await db.query(
      'SELECT id FROM students WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    // Step 4: Check roll number uniqueness (excluding current student)
    const [duplicate] = await db.query(
      'SELECT id FROM students WHERE roll_number = ? AND id != ?',
      [roll_number.trim(), id]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Roll number "${roll_number}" is already used by another student.`
      });
    }

    // Step 5: Update the student record
    await db.query(
      'UPDATE students SET name = ?, roll_number = ?, branch = ? WHERE id = ?',
      [name.trim(), roll_number.trim().toUpperCase(), branch.trim(), id]
    );

    // Step 6: Return updated student data
    const [updated] = await db.query(
      'SELECT id, name, roll_number, branch, created_at FROM students WHERE id = ?',
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully!',
      data: updated[0]
    });

  } catch (error) {
    console.error('Error updating student:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating student.'
    });
  }
};

// ─── DELETE /students/:id ────────────────────
// Remove a student from the database
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Validate ID
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID.'
      });
    }

    // Step 2: Check if student exists before deleting
    const [existing] = await db.query(
      'SELECT id, name FROM students WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    const studentName = existing[0].name;

    // Step 3: Delete the student
    await db.query('DELETE FROM students WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: `Student "${studentName}" deleted successfully!`
    });

  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting student.'
    });
  }
};

// Export all controller functions
module.exports = {
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent
};
