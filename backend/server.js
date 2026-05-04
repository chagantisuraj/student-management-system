// server.js
// ─────────────────────────────────────────────
// Main entry point of the application
// Express server setup and middleware configuration
// ─────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware Setup ────────────────────────

// CORS: Allow requests from any origin (for network access)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from /frontend folder
// When user visits http://localhost:3000, it loads index.html
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── API Routes ──────────────────────────────

// All student-related routes go through /students
const studentRoutes = require('./routes/studentRoutes');
app.use('/students', studentRoutes);

// ─── Root Route ──────────────────────────────
// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── 404 Handler ─────────────────────────────
// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`
  });
});

// ─── Global Error Handler ────────────────────
// Catches any unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server.'
  });
});

// ─── Start Server ────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   Student Management System - Running!   ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Local:   http://localhost:${PORT}           ║`);
  console.log(`║  Network: http://<your-ip>:${PORT}           ║`);
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  Press CTRL+C to stop the server         ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
