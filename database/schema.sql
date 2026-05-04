-- ─────────────────────────────────────────────
-- schema.sql
-- Student Management System - Database Schema
-- ─────────────────────────────────────────────
-- HOW TO USE:
-- 1. Open MySQL Workbench or phpMyAdmin
-- 2. Copy and paste this entire file
-- 3. Execute it (Ctrl+Enter or Run button)
-- ─────────────────────────────────────────────

-- Step 1: Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS student_db;

-- Step 2: Select (use) the database
USE student_db;

-- Step 3: Drop the table if it already exists (fresh start)
DROP TABLE IF EXISTS students;

-- Step 4: Create the students table
CREATE TABLE students (
    id          INT AUTO_INCREMENT PRIMARY KEY,  -- Unique ID for each student
    name        VARCHAR(100)  NOT NULL,           -- Student's full name
    roll_number VARCHAR(20)   NOT NULL UNIQUE,    -- Must be unique
    branch      VARCHAR(50)   NOT NULL,           -- ECE, CSE, ME, etc.
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP  -- Auto-set on insert
);

-- Step 5: Insert sample student records
INSERT INTO students (name, roll_number, branch) VALUES
('Arjun Sharma',    '22ECE001', 'Electronics & Communication'),
('Priya Verma',     '22ECE002', 'Electronics & Communication'),
('Rohit Kumar',     '22CSE001', 'Computer Science'),
('Sneha Patel',     '22CSE002', 'Computer Science'),
('Aditya Singh',    '22ME001',  'Mechanical Engineering'),
('Kavya Nair',      '22EEE001', 'Electrical Engineering'),
('Rahul Gupta',     '22ECE003', 'Electronics & Communication'),
('Ananya Mishra',   '22IT001',  'Information Technology');

-- ─── Verify the data ──────────────────────────
-- Run this to check if data was inserted correctly
SELECT * FROM students;

-- ─── Raw SQL for Reference (CRUD Operations) ─
-- These are the exact queries used in the backend

-- READ: Get all students
-- SELECT id, name, roll_number, branch, created_at FROM students ORDER BY id ASC;

-- CREATE: Add a student
-- INSERT INTO students (name, roll_number, branch) VALUES ('Name', 'ROLL001', 'Branch');

-- UPDATE: Edit a student
-- UPDATE students SET name = 'New Name', roll_number = 'NEW001', branch = 'New Branch' WHERE id = 1;

-- DELETE: Remove a student
-- DELETE FROM students WHERE id = 1;

-- CHECK DUPLICATE ROLL NUMBER:
-- SELECT id FROM students WHERE roll_number = '22ECE001';
