-- Database Schema for Englishers Club Management Platform

-- Drop tables if they exist (for reset/seeding purposes)
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS course_students CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Students table: stores personal and admin registration details
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(255) NOT NULL,
    national_id VARCHAR(50) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    pob VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    purpose TEXT NOT NULL,
    level VARCHAR(10) NOT NULL, -- A1, A2, B1, B2
    period VARCHAR(20) NOT NULL, -- morning, afternoon, evening
    study_type VARCHAR(20) NOT NULL, -- in_person, online
    referral VARCHAR(255) NOT NULL,
    
    -- Admin sections (completed after testing)
    interviewer VARCHAR(255),
    suitable_group VARCHAR(255),
    reg_fee NUMERIC(10, 2) DEFAULT 0.00,
    curriculum_fee NUMERIC(10, 2) DEFAULT 0.00,
    course_fee NUMERIC(10, 2) DEFAULT 0.00,
    total_due NUMERIC(10, 2) DEFAULT 0.00,
    total_paid NUMERIC(10, 2) DEFAULT 0.00,
    payment_plan VARCHAR(20) DEFAULT 'cash' CHECK (payment_plan IN ('cash', 'installment')),
    installment_amount NUMERIC(10, 2) DEFAULT 0.00,
    photo_path VARCHAR(555),
    notes TEXT
);

-- Users table: manages system access
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('manager', 'admin', 'student', 'teacher')),
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE
);

-- Courses table: stores course information
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    teacher VARCHAR(255) NOT NULL,
    schedule_type VARCHAR(10) NOT NULL CHECK (schedule_type IN ('even', 'odd')), -- even: Sat, Mon, Wed | odd: Sun, Tue, Thu
    time_slot VARCHAR(100) NOT NULL, -- e.g., "10:00 AM - 12:00 PM"
    month_num INTEGER NOT NULL, -- Month 1, 2, etc.
    curriculum VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Course-Students mapping
CREATE TABLE course_students (
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, student_id)
);

-- Attendance table: tracks student presence/absence per course session
CREATE TABLE attendance (
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent')),
    PRIMARY KEY (course_id, student_id, date)
);

-- Payments table: stores payment receipts
CREATE TABLE payments (
    id SERIAL PRIMARY KEY, -- Receipt Serial Number
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('installment', 'full', 'custom')),
    custom_description TEXT,
    signature VARCHAR(64) NOT NULL, -- Cryptographic hash to prove authenticity
    created_by INTEGER REFERENCES users(id)
);

-- Course Dates table: stores course session dates, times, and schedules
CREATE TABLE course_dates (
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot VARCHAR(100),
    schedule_type VARCHAR(10) CHECK (schedule_type IN ('even', 'odd')),
    PRIMARY KEY (course_id, date)
);

-- Student Custom Dues table: stores arbitrary student financial dues (e.g. books, workshops, extra exams)
CREATE TABLE student_custom_dues (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student Installments table: stores monthly installment schedule, amounts, and customized lecture balance
CREATE TABLE student_installments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    month_index INTEGER NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    lectures_count INTEGER DEFAULT 12,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


