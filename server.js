const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const db = require('./db/index');
const { generateReceiptPDF, generateSignature } = require('./utils/pdf');
const { verifyReceiptPDF } = require('./utils/verifier');

const app = express();
const PORT = process.env.PORT || 3000;

// Create receipts folders if they don't exist
const receiptsDir = path.join(__dirname, 'receipts');
const studentReceiptsDir = path.join(receiptsDir, 'student');
const adminReceiptsDir = path.join(receiptsDir, 'admin');

if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir);
if (!fs.existsSync(studentReceiptsDir)) fs.mkdirSync(studentReceiptsDir);
if (!fs.existsSync(adminReceiptsDir)) fs.mkdirSync(adminReceiptsDir);

// Configure Multer for PDF file uploads (verification)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // limit to 5MB
});

// Configure multer storage for student profile photos
const studentPhotoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'public', 'uploads', 'students');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `student-${uniqueSuffix}${ext}`);
    }
});

const studentPhotoUpload = multer({
    storage: studentPhotoStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype.toLowerCase()) || file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG and WEBP images are allowed!'), false);
        }
    }
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'englishers-super-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        secure: false // Set to true if using HTTPS
    }
}));

// Expiration Lock Middleware
const EXPIRATION_DATE = new Date('2026-07-20T23:59:59'); // July 20th, 2026

function checkSystemExpiration(req, res, next) {
    if (new Date() > EXPIRATION_DATE) {
        // If it's an API request, return JSON error
        if (req.path.startsWith('/api/')) {
            return res.status(403).json({
                error: 'انتهت فترة الصلاحية البرمجية للنظام. يرجى التواصل مع مطور المنصة لتمديد الصلاحية.'
            });
        }
        // If it's a page request, return a clean HTML message
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(403).send(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>نظام ENGLISHERS | صلاحية منتهية</title>
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: radial-gradient(circle at 10% 20%, rgb(4, 12, 36) 0%, rgb(16, 24, 52) 90%);
                        color: #ffffff;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        text-align: center;
                        padding: 20px;
                    }
                    .container {
                        background: rgba(28, 38, 80, 0.4);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        padding: 40px;
                        border-radius: 16px;
                        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                        max-width: 500px;
                    }
                    .icon {
                        font-size: 64px;
                        color: #ff4757;
                        margin-bottom: 20px;
                    }
                    h1 {
                        font-size: 24px;
                        margin-bottom: 15px;
                        color: #ffffff;
                    }
                    p {
                        font-size: 15px;
                        color: #a4b0be;
                        line-height: 1.6;
                        margin-bottom: 30px;
                    }
                    .footer {
                        font-size: 12px;
                        color: #747d8c;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">🔒</div>
                    <h1>انتهت صلاحية تشغيل النظام البرمجية</h1>
                    <p>عذراً، لقد انتهت صلاحية الفترة التجريبية/البرمجية المخصصة لتشغيل هذا النظام وتأمين قاعدة البيانات الخاصة بنادي ENGLISHERS بتاريخ 20/07/2026.<br><br>يرجى التواصل مع مطور المنصة لتفعيلها وتمديد تاريخ الترخيص المعتمد.</p>
                    <div class="footer">ENGLISHERS CLUB • جميع الحقوق محفوظة © 2026</div>
                </div>
            </body>
            </html>
        `);
    }
    next();
}

app.use(checkSystemExpiration);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// GET: Retrieve server's local LAN IP address
app.get('/api/lan-ip', (req, res) => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let lanIp = '127.0.0.1';
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                lanIp = iface.address;
                break;
            }
        }
    }
    res.json({ ip: lanIp });
});

// Authentication Helper Middlewares
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    next();
}

function requireRole(roles) {
    return (req, res, next) => {
        if (!req.session.user || !roles.includes(req.session.user.role)) {
            return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
        }
        next();
    };
}

// ----------------------------------------
// AUTHENTICATION APIS
// ----------------------------------------

// POST: Log in
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username.trim()]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        // Set session
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            student_id: user.student_id
        };

        res.json({ message: 'Logged in successfully', user: req.session.user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST: Log out
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// GET: Current user profile session details
app.get('/api/auth/me', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.json({ user: null });
    }
});

// Middleware wrapper to catch multer errors for student photos upload
const handleStudentPhotoUpload = (req, res, next) => {
    studentPhotoUpload.single('photo')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: `حدث خطأ أثناء تحميل الصورة: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

// POST: Register student self-service (generates student profile & user login credentials)
app.post('/api/auth/register-student', handleStudentPhotoUpload, async (req, res) => {
    const {
        name, national_id, dob, pob, qualification, phone, address, purpose,
        username, password, period, study_type, referral
    } = req.body;

    if (!name || !national_id || !dob || !pob || !qualification || !phone || !address || !purpose || !username || !password || !period || !study_type || !referral) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
    }

    // 12-digit national ID check (English characters only)
    const natId = national_id.trim();
    if (!/^\d{12}$/.test(natId)) {
        return res.status(400).json({ error: 'رقم البطاقة الوطنية يجب أن يتكون من 12 رقماً باللغة الإنكليزية فقط.' });
    }

    const uName = username.trim();
    if (uName.length < 3) {
        return res.status(400).json({ error: 'اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل.' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Check if student with national ID already exists
        const checkStudent = await client.query(
            'SELECT id FROM students WHERE national_id = $1',
            [natId]
        );
        if (checkStudent.rows.length > 0) {
            return res.status(400).json({ error: 'رقم البطاقة الوطنية مسجل مسبقاً في النظام.' });
        }

        // Check if user account with this username already exists
        const checkUser = await client.query(
            'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
            [uName]
        );
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ error: 'اسم المستخدم هذا محجوز لحساب آخر، يرجى اختيار اسم مستخدم آخر.' });
        }

        const level = 'غير محدد'; // Default level, set by admin later
        const photoPath = req.file ? `/uploads/students/${req.file.filename}` : null;

        // 1. Insert Student profile
        const studentResult = await client.query(
            `INSERT INTO students (
                name, national_id, dob, pob, qualification, phone, address, purpose,
                level, period, study_type, referral, photo_path
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
            [
                name.trim(), natId, dob, pob.trim(), qualification.trim(),
                phone.trim(), address.trim(), purpose.trim(), level, period, study_type, referral.trim(), photoPath
            ]
        );
        const studentId = studentResult.rows[0].id;

        // 2. Hash Password
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Create User record
        await client.query(
            `INSERT INTO users (username, password, role, student_id) VALUES ($1, $2, $3, $4)`,
            [uName, passwordHash, 'student', studentId]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'تم التسجيل بنجاح! جاري توجيهك للمنصة...',
            studentId
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'حدث خطأ في السيرفر أثناء تسجيل الحساب.' });
    } finally {
        client.release();
    }
});

// ----------------------------------------
// COURSE MANAGEMENT APIS
// ----------------------------------------

// GET: All courses
app.get('/api/courses', requireAuth, async (req, res) => {
    try {
        let result;
        if (req.session.user.role === 'student') {
            // Students only see courses they are assigned to
            result = await db.query(
                `SELECT c.* FROM courses c 
                 JOIN course_students cs ON c.id = cs.course_id 
                 WHERE cs.student_id = $1`,
                [req.session.user.student_id]
            );
        } else {
            // Admin and Manager see all courses
            result = await db.query('SELECT * FROM courses ORDER BY id DESC');
        }
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper to automatically update the course month number based on 12-lecture cycles
async function updateCourseMonthNum(courseId, client) {
    const dbClient = client || db;
    // Count unique dates in attendance for this course
    const res = await dbClient.query(
        'SELECT COUNT(DISTINCT date)::integer FROM attendance WHERE course_id = $1',
        [courseId]
    );
    const actualLecturesCount = res.rows[0].count || 0;
    
    // Calculate new month number: 12 lectures per month
    const newMonthNum = Math.floor(actualLecturesCount / 12) + 1;
    
    // Update courses table
    await dbClient.query(
        'UPDATE courses SET month_num = $1 WHERE id = $2',
        [newMonthNum, courseId]
    );
    return newMonthNum;
}

// POST: Create a course (Admin & Manager only)
app.post('/api/courses', requireAuth, requireRole(['manager', 'admin', 'teacher']), async (req, res) => {
    const { name, teacher, schedule_type, time_slot, month_num, curriculum, start_date } = req.body;
    if (!name || !teacher || !schedule_type || !time_slot || !month_num || !curriculum) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            `INSERT INTO courses (name, teacher, schedule_type, time_slot, month_num, curriculum, start_date) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name.trim(), teacher.trim(), schedule_type, time_slot.trim(), parseInt(month_num), curriculum.trim(), start_date || new Date()]
        );
        const course = result.rows[0];

        // Seed initial 12 dates
        const startDateStr = new Date(course.start_date).toISOString().split('T')[0];
        const dates = getCourseDatesArray(startDateStr, course.schedule_type, 12);
        for (const d of dates) {
            await client.query(
                `INSERT INTO course_dates (course_id, date, time_slot, schedule_type) 
                 VALUES ($1, $2, $3, $4)`,
                [course.id, d, course.time_slot, course.schedule_type]
            );
        }

        await client.query('COMMIT');
        res.status(201).json(course);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// PUT: Update a course (Admin & Manager only)
app.put('/api/courses/:id', requireAuth, requireRole(['manager', 'admin', 'teacher']), async (req, res) => {
    const { name, teacher, schedule_type, time_slot, month_num, curriculum, start_date } = req.body;
    if (!name || !teacher || !schedule_type || !time_slot || !month_num || !curriculum || !start_date) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const result = await db.query(
            `UPDATE courses 
             SET name = $1, teacher = $2, schedule_type = $3, time_slot = $4, month_num = $5, curriculum = $6, start_date = $7 
             WHERE id = $8 RETURNING *`,
            [name.trim(), teacher.trim(), schedule_type, time_slot.trim(), parseInt(month_num), curriculum.trim(), start_date, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE: Course (Admin & Manager only)
app.delete('/api/courses/:id', requireAuth, requireRole(['manager', 'admin', 'teacher']), async (req, res) => {
    try {
        const result = await db.query('DELETE FROM courses WHERE id = $1 RETURNING id', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found.' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET: Course Details + Assigned Students
app.get('/api/courses/:id/details', requireAuth, async (req, res) => {
    const courseId = req.params.id;

    // Security check: Student can only access details of their own course
    if (req.session.user.role === 'student') {
        const check = await db.query(
            'SELECT 1 FROM course_students WHERE course_id = $1 AND student_id = $2',
            [courseId, req.session.user.student_id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this course.' });
        }
    }

    try {
        const courseRes = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
        if (courseRes.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const studentsRes = await db.query(
            `SELECT s.id, s.name, s.phone, s.level 
             FROM students s 
             JOIN course_students cs ON s.id = cs.student_id 
             WHERE cs.course_id = $1`,
            [courseId]
        );

        res.json({
            course: courseRes.rows[0],
            students: studentsRes.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET: Fetch all scheduled dates for a course
app.get('/api/courses/:id/dates', requireAuth, async (req, res) => {
    const courseId = req.params.id;

    // Security check: Student can only access their own course
    if (req.session.user.role === 'student') {
        const check = await db.query(
            'SELECT 1 FROM course_students WHERE course_id = $1 AND student_id = $2',
            [courseId, req.session.user.student_id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ error: 'Access denied to this course.' });
        }
    }

    try {
        const result = await db.query(
            `SELECT TO_CHAR(date, 'YYYY-MM-DD') AS date, time_slot, schedule_type 
             FROM course_dates 
             WHERE course_id = $1 ORDER BY date ASC`,
            [courseId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST: Extend course dates (Admin & Manager only)
app.post('/api/courses/:id/extend', requireAuth, requireRole(['manager', 'admin', 'teacher']), async (req, res) => {
    const courseId = req.params.id;
    const { num_days, start_date, schedule_type, time_slot } = req.body;

    if (!num_days || !start_date || !schedule_type || !time_slot) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Generate new dates array
        const dates = getCourseDatesArray(start_date, schedule_type, parseInt(num_days));
        let addedCount = 0;

        for (const d of dates) {
            const insRes = await client.query(
                `INSERT INTO course_dates (course_id, date, time_slot, schedule_type) 
                 VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
                [courseId, d, time_slot, schedule_type]
            );
            if (insRes.rowCount > 0) {
                addedCount++;
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Course dates extended successfully.', addedCount });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error while extending course.' });
    } finally {
        client.release();
    }
});

// PUT: Update a specific date and time slot for a course session (Admin & Manager only)
app.put('/api/courses/:id/dates/:dateStr', requireAuth, requireRole(['manager', 'admin', 'teacher']), async (req, res) => {
    const courseId = req.params.id;
    const oldDate = req.params.dateStr;
    const { newDate, newTimeSlot } = req.body;

    if (!newDate || !newTimeSlot) {
        return res.status(400).json({ error: 'New date and time slot are required.' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // If the date is changing, check for duplicate primary keys
        if (oldDate !== newDate) {
            const check = await client.query(
                'SELECT 1 FROM course_dates WHERE course_id = $1 AND date = $2',
                [courseId, newDate]
            );
            if (check.rows.length > 0) {
                return res.status(400).json({ error: 'التاريخ الجديد موجود بالفعل في جدول الكورس.' });
            }

            // Update attendance date to cascade updates
            await client.query(
                'UPDATE attendance SET date = $1 WHERE course_id = $2 AND date = $3',
                [newDate, courseId, oldDate]
            );
        }

        // Update course_dates
        await client.query(
            `UPDATE course_dates 
             SET date = $1, time_slot = $2 
             WHERE course_id = $3 AND date = $4`,
            [newDate, newTimeSlot, courseId, oldDate]
        );

        await client.query('COMMIT');
        res.json({ message: 'Session updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error while updating session.' });
    } finally {
        client.release();
    }
});

// DELETE: Delete a specific date from a course schedule (Admin & Manager only)
app.delete('/api/courses/:id/dates/:dateStr', requireAuth, requireRole(['manager', 'admin', 'teacher']), async (req, res) => {
    const courseId = req.params.id;
    const { dateStr } = req.params;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Delete attendance records for this date
        await client.query(
            'DELETE FROM attendance WHERE course_id = $1 AND date = $2',
            [courseId, dateStr]
        );

        // 2. Delete date from course_dates
        await client.query(
            'DELETE FROM course_dates WHERE course_id = $1 AND date = $2',
            [courseId, dateStr]
        );

        await updateCourseMonthNum(courseId, client);

        await client.query('COMMIT');
        res.json({ message: 'Date deleted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error while deleting session.' });
    } finally {
        client.release();
    }
});

// POST: Postpone a specific session date for a course (Admin & Manager & Teacher only)
app.post('/api/courses/:id/dates/:dateStr/postpone', requireAuth, requireRole(['manager', 'admin', 'teacher']), async (req, res) => {
    const courseId = parseInt(req.params.id);
    const dateStr = req.params.dateStr;
    const { method, newDate, newTimeSlot } = req.body; // method: 'specific' or 'shift'

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Fetch the course to check its schedule type
        const courseRes = await client.query('SELECT * FROM courses WHERE id = $1', [courseId]);
        if (courseRes.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        const course = courseRes.rows[0];

        if (method === 'specific') {
            if (!newDate || !newTimeSlot) {
                return res.status(400).json({ error: 'New date and time slot are required for specific postponement.' });
            }

            // Check if newDate already exists in course_dates
            const check = await client.query(
                'SELECT 1 FROM course_dates WHERE course_id = $1 AND date = $2',
                [courseId, newDate]
            );
            if (check.rows.length > 0 && newDate !== dateStr) {
                return res.status(400).json({ error: 'التاريخ الجديد موجود بالفعل في جدول الكورس.' });
            }

            // Update attendance
            await client.query(
                'UPDATE attendance SET date = $1 WHERE course_id = $2 AND date = $3',
                [newDate, courseId, dateStr]
            );

            // Update course_dates
            await client.query(
                'UPDATE course_dates SET date = $1, time_slot = $2 WHERE course_id = $3 AND date = $4',
                [newDate, newTimeSlot, courseId, dateStr]
            );

        } else if (method === 'shift') {
            // Shift schedule forward by one lecture!
            // 1. Get all chronological course dates
            const datesRes = await client.query(
                `SELECT TO_CHAR(date, 'YYYY-MM-DD') AS date_str, time_slot 
                 FROM course_dates 
                 WHERE course_id = $1 
                 ORDER BY date ASC`,
                [courseId]
            );
            const courseDates = datesRes.rows;

            // Find the index of the postponed date
            const targetIndex = courseDates.findIndex(d => d.date_str === dateStr);
            if (targetIndex === -1) {
                return res.status(404).json({ error: 'Postponed session date not found in schedule.' });
            }

            // 2. Generate the shifted dates list
            // We need count = (courseDates.length - targetIndex) + 1 calendar dates
            const countToGenerate = courseDates.length - targetIndex + 1;
            const newCalendarDates = getCourseDatesArray(courseDates[targetIndex].date_str, course.schedule_type, countToGenerate);

            // 3. Perform updates from last to first (descending) to avoid unique key conflicts
            for (let i = courseDates.length - 1; i >= targetIndex; i--) {
                const oldDate = courseDates[i].date_str;
                const newDateVal = newCalendarDates[i - targetIndex + 1];

                // Update attendance for this date (descending)
                await client.query(
                    'UPDATE attendance SET date = $1 WHERE course_id = $2 AND date = $3',
                    [newDateVal, courseId, oldDate]
                );

                // Update course_dates
                await client.query(
                    'UPDATE course_dates SET date = $1 WHERE course_id = $2 AND date = $3',
                    [newDateVal, courseId, oldDate]
                );
            }
        }

        // Recalculate month_num just in case
        await updateCourseMonthNum(courseId, client);

        await client.query('COMMIT');
        res.json({ message: 'Session postponed successfully.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error while postponing session.' });
    } finally {
        client.release();
    }
});

// POST: Assign a student to a course (Admin & Manager only)
app.post('/api/courses/:id/students', requireAuth, requireRole(['manager', 'admin', 'teacher']), async (req, res) => {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ error: 'Student ID is required.' });

    try {
        // Check if mapping exists
        const check = await db.query(
            'SELECT 1 FROM course_students WHERE course_id = $1 AND student_id = $2',
            [req.params.id, studentId]
        );
        if (check.rows.length > 0) {
            return res.status(400).json({ error: 'Student already assigned to this course.' });
        }

        await db.query(
            'INSERT INTO course_students (course_id, student_id) VALUES ($1, $2)',
            [req.params.id, studentId]
        );
        res.json({ message: 'Student assigned successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE: Remove a student from a course (Admin & Manager only)
app.delete('/api/courses/:id/students/:studentId', requireAuth, requireRole(['manager', 'admin', 'teacher']), async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM course_students WHERE course_id = $1 AND student_id = $2 RETURNING *',
            [req.params.id, req.params.studentId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found.' });
        }
        res.json({ message: 'Student removed from course.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ----------------------------------------
// STUDENT RECORD APIS
// ----------------------------------------

// GET: All students (Admin & Manager only)
app.get('/api/students', requireAuth, requireRole(['manager', 'admin', 'teacher']), async (req, res) => {
    try {
        const result = await db.query(`
            SELECT s.*, 
                   COALESCE((SELECT COUNT(*)::integer FROM attendance WHERE student_id = s.id), 0) AS attendance_count,
                   (
                       SELECT COUNT(*)::integer 
                       FROM course_students cs
                       JOIN courses c ON cs.course_id = c.id
                       WHERE cs.student_id = s.id 
                         AND EXISTS (
                             SELECT 1 FROM course_dates cd 
                             WHERE cd.course_id = c.id AND cd.date >= CURRENT_DATE
                         )
                   ) AS active_courses_count,
                   (
                       SELECT COUNT(*)::integer 
                       FROM course_students cs
                       WHERE cs.student_id = s.id
                   ) AS total_courses_count
            FROM students s 
            ORDER BY s.id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET: Single student profile
app.get('/api/students/:id', requireAuth, async (req, res) => {
    const studentId = parseInt(req.params.id);

    // Security: Student can only view their own profile
    if (req.session.user.role === 'student' && req.session.user.student_id !== studentId) {
        return res.status(403).json({ error: 'Access denied.' });
    }

    try {
        const studentRes = await db.query('SELECT * FROM students WHERE id = $1', [studentId]);
        if (studentRes.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        // Fetch courses the student is in
        const coursesRes = await db.query(
            `SELECT c.* FROM courses c 
             JOIN course_students cs ON c.id = cs.course_id 
             WHERE cs.student_id = $1`,
            [studentId]
        );

        // Fetch payments made by this student
        const paymentsRes = await db.query(
            `SELECT id, created_at, amount, payment_type, custom_description 
             FROM payments WHERE student_id = $1 ORDER BY id DESC`,
            [studentId]
        );

        // Fetch total attendance sessions recorded for warning logic
        const attendanceCountRes = await db.query(
            'SELECT COUNT(*) FROM attendance WHERE student_id = $1',
            [studentId]
        );
        const attendanceCount = parseInt(attendanceCountRes.rows[0].count || 0);

        res.json({
            student: studentRes.rows[0],
            courses: coursesRes.rows,
            payments: paymentsRes.rows,
            attendanceCount: attendanceCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT: Update student personal info & optional photo (Manager & Admin only)
app.put('/api/students/:id/personal', requireAuth, requireRole(['manager', 'admin']), handleStudentPhotoUpload, async (req, res) => {
    const studentId = parseInt(req.params.id);
    const { name, phone, national_id, dob, pob, qualification, address, purpose, period, study_type, referral } = req.body;
    
    if (!name || !phone || !national_id || !dob || !pob || !qualification || !address || !purpose || !period || !study_type || !referral) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
    }
    
    try {
        const photoPath = req.file ? `/uploads/students/${req.file.filename}` : null;
        let query, params;
        
        if (photoPath) {
            query = `UPDATE students 
                     SET name = $1, phone = $2, national_id = $3, dob = $4, pob = $5, 
                         qualification = $6, address = $7, purpose = $8, period = $9, 
                         study_type = $10, referral = $11, photo_path = $12
                     WHERE id = $13 RETURNING *`;
            params = [name, phone, national_id, dob, pob, qualification, address, purpose, period, study_type, referral, photoPath, studentId];
        } else {
            query = `UPDATE students 
                     SET name = $1, phone = $2, national_id = $3, dob = $4, pob = $5, 
                         qualification = $6, address = $7, purpose = $8, period = $9, 
                         study_type = $10, referral = $11
                     WHERE id = $12 RETURNING *`;
            params = [name, phone, national_id, dob, pob, qualification, address, purpose, period, study_type, referral, studentId];
        }

        const result = await db.query(query, params);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'لم يتم العثور على ملف الطالب.' });
        }
        
        res.json({ message: 'تم تحديث البيانات الشخصية والصورة بنجاح.', student: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'حدث خطأ في الخادم الداخلي' });
    }
});

// PUT: Fill administrative academic details for student (Admin & Manager only)
app.put('/api/students/:id/admin', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
    const { interviewer, suitable_group, level, notes } = req.body;

    try {
        const result = await db.query(
            `UPDATE students 
             SET interviewer = $1, suitable_group = $2, level = $3, notes = $4 
             WHERE id = $5 RETURNING *`,
            [
                interviewer ? interviewer.trim() : null,
                suitable_group ? suitable_group.trim() : null,
                level ? level.trim() : 'غير محدد',
                notes ? notes.trim() : null,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student profile not found.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT: Update student financial dues (Admin & Manager only)
app.put('/api/students/:id/dues', requireAuth, requireRole(['manager', 'admin', 'teacher']), async (req, res) => {
    const { reg_fee, curriculum_fee, course_fee, payment_plan, installment_amount } = req.body;

    const rFee = parseFloat(reg_fee || 0);
    const cFee = parseFloat(curriculum_fee || 0);
    const coFee = parseFloat(course_fee || 0);
    const plan = payment_plan === 'installment' ? 'installment' : 'cash';
    const instAmount = parseFloat(installment_amount || 0);

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Update student basic fee fields and plan
        const result = await client.query(
            `UPDATE students 
             SET reg_fee = $1, curriculum_fee = $2, course_fee = $3, payment_plan = $4, installment_amount = $5
             WHERE id = $6 RETURNING *`,
            [rFee, cFee, coFee, plan, instAmount, req.params.id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Student profile not found.' });
        }

        // Recalculate total_due (including custom dues)
        const recalculateRes = await client.query(
            `UPDATE students 
             SET total_due = reg_fee + curriculum_fee + course_fee + COALESCE((
                 SELECT SUM(amount) FROM student_custom_dues WHERE student_id = students.id
             ), 0)
             WHERE id = $1 RETURNING *`,
            [req.params.id]
        );

        await client.query('COMMIT');
        res.json(recalculateRes.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error while updating dues.' });
    } finally {
        client.release();
    }
});

// POST: Add student custom due (Admin & Manager only)
app.post('/api/students/:id/custom-dues', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
    const studentId = req.params.id;
    const { title, amount } = req.body;

    if (!title || !amount) {
        return res.status(400).json({ error: 'Title and amount are required.' });
    }

    const dueAmount = parseFloat(amount);
    if (isNaN(dueAmount) || dueAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Check if student exists
        const studentCheck = await client.query('SELECT 1 FROM students WHERE id = $1', [studentId]);
        if (studentCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Student not found.' });
        }

        // Insert custom due
        const insertRes = await client.query(
            `INSERT INTO student_custom_dues (student_id, title, amount) 
             VALUES ($1, $2, $3) RETURNING *`,
            [studentId, title, dueAmount]
        );

        // Update student's total_due
        await client.query(
            `UPDATE students 
             SET total_due = reg_fee + curriculum_fee + course_fee + COALESCE((
                 SELECT SUM(amount) FROM student_custom_dues WHERE student_id = students.id
             ), 0)
             WHERE id = $1`,
            [studentId]
        );

        await client.query('COMMIT');
        res.status(201).json(insertRes.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error while adding custom due.' });
    } finally {
        client.release();
    }
});

// GET: Retrieve all custom dues for a specific student (Admin & Manager & the Student themselves)
app.get('/api/students/:id/custom-dues', requireAuth, async (req, res) => {
    const studentId = req.params.id;

    // Security: Student can only view their own custom dues
    if (req.session.user.role === 'student' && req.session.user.student_id !== parseInt(studentId)) {
        return res.status(403).json({ error: 'Forbidden. You can only view your own dues.' });
    }

    try {
        const result = await db.query(
            'SELECT * FROM student_custom_dues WHERE student_id = $1 ORDER BY id DESC',
            [studentId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error while fetching custom dues.' });
    }
});

// DELETE: Delete student custom due (Admin & Manager only)
app.delete('/api/students/:id/custom-dues/:dueId', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
    const studentId = req.params.id;
    const dueId = req.params.dueId;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Delete custom due
        const deleteRes = await client.query(
            'DELETE FROM student_custom_dues WHERE id = $1 AND student_id = $2 RETURNING *',
            [dueId, studentId]
        );

        if (deleteRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Custom due record not found.' });
        }

        // Update student's total_due
        await client.query(
            `UPDATE students 
             SET total_due = reg_fee + curriculum_fee + course_fee + COALESCE((
                 SELECT SUM(amount) FROM student_custom_dues WHERE student_id = students.id
             ), 0)
             WHERE id = $1`,
            [studentId]
        );

        await client.query('COMMIT');
        res.json({ message: 'Custom due deleted successfully.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error while deleting custom due.' });
    } finally {
        client.release();
    }
});

// ----------------------------------------
// ATTENDANCE APIS
// ----------------------------------------

// GET: Fetch attendance for a specific course
app.get('/api/courses/:id/attendance', requireAuth, async (req, res) => {
    const courseId = req.params.id;

    // Security: Student can only see their own attendance
    if (req.session.user.role === 'student') {
        try {
            const result = await db.query(
                `SELECT student_id, TO_CHAR(date, 'YYYY-MM-DD') AS date, status FROM attendance 
                 WHERE course_id = $1 AND student_id = $2 ORDER BY date DESC`,
                [courseId, req.session.user.student_id]
            );
            return res.json(result.rows);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    try {
        const result = await db.query(
            `SELECT student_id, TO_CHAR(date, 'YYYY-MM-DD') AS date, status FROM attendance 
             WHERE course_id = $1 ORDER BY date ASC`,
            [courseId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST: Save attendance sheet for a course and date (Admin & Manager only)
app.post('/api/courses/:id/attendance', requireAuth, requireRole(['manager', 'admin', 'teacher']), async (req, res) => {
    const courseId = req.params.id;
    const { date, attendance } = req.body; // attendance is { student_id: 'present'/'absent' }

    if (!date || !attendance) {
        return res.status(400).json({ error: 'Date and attendance data are required.' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        for (const [studentIdStr, status] of Object.entries(attendance)) {
            const studentId = parseInt(studentIdStr);

            // Upsert attendance
            await client.query(
                `INSERT INTO attendance (course_id, student_id, date, status) 
                 VALUES ($1, $2, $3, $4) 
                 ON CONFLICT (course_id, student_id, date) 
                 DO UPDATE SET status = EXCLUDED.status`,
                [courseId, studentId, date, status]
            );
        }

        await updateCourseMonthNum(courseId, client);

        await client.query('COMMIT');
        res.json({ message: 'Attendance updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.release();
    }
});

// POST: Save bulk attendance sheet for a course (Admin & Manager only)
app.post('/api/courses/:id/attendance-bulk', requireAuth, requireRole(['manager', 'admin', 'teacher']), async (req, res) => {
    const courseId = req.params.id;
    const { attendanceSheet } = req.body; // { dateStr: { studentId: status } }

    if (!attendanceSheet) {
        return res.status(400).json({ error: 'Attendance sheet data is required.' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        for (const [date, studentsMap] of Object.entries(attendanceSheet)) {
            for (const [studentIdStr, status] of Object.entries(studentsMap)) {
                const studentId = parseInt(studentIdStr);

                if (status === 'none') {
                    // Delete attendance record to keep database clean if status is set back to none
                    await client.query(
                        'DELETE FROM attendance WHERE course_id = $1 AND student_id = $2 AND date = $3',
                        [courseId, studentId, date]
                    );
                } else {
                    // Upsert attendance
                    await client.query(
                        `INSERT INTO attendance (course_id, student_id, date, status) 
                         VALUES ($1, $2, $3, $4) 
                         ON CONFLICT (course_id, student_id, date) 
                         DO UPDATE SET status = EXCLUDED.status`,
                        [courseId, studentId, date, status]
                    );
                }
            }
        }

        await updateCourseMonthNum(courseId, client);

        await client.query('COMMIT');
        res.json({ message: 'Attendance sheet updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error while saving bulk attendance.' });
    } finally {
        client.release();
    }
});

// ----------------------------------------
// PAYMENT & RECEIPT APIS
// ----------------------------------------

// GET: All payments (Admin & Manager only)
app.get('/api/payments', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
    try {
        const result = await db.query(
            `SELECT p.*, s.name as student_name, s.phone 
             FROM payments p 
             JOIN students s ON p.student_id = s.id 
             ORDER BY p.id DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST: Generate payment receipt and PDF files (Admin & Manager only)
app.post('/api/payments', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
    const { studentId, amount, paymentType, customDescription } = req.body;
    if (!studentId || !amount || !paymentType) {
        return res.status(400).json({ error: 'Student ID, Amount, and Payment Type are required.' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Invalid amount.' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Fetch student details
        const studentResult = await client.query('SELECT name, national_id, phone FROM students WHERE id = $1', [studentId]);
        if (studentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found.' });
        }
        const student = studentResult.rows[0];

        // 1. Insert payment record (generates serial primary key)
        // Set temp signature first
        const paymentResult = await client.query(
            `INSERT INTO payments (student_id, amount, payment_type, custom_description, signature, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [studentId, numericAmount, paymentType, customDescription ? customDescription.trim() : null, 'TEMP_SIGNATURE', req.session.user.id]
        );
        const payment = paymentResult.rows[0];

        // Format Date
        const dateStr = new Date(payment.created_at).toISOString().split('T')[0];

        // 2. Generate secure HMAC signature
        const signature = generateSignature(payment.id, student.name, payment.amount, dateStr);

        // 3. Update receipt signature in database
        await client.query('UPDATE payments SET signature = $1 WHERE id = $2', [signature, payment.id]);
        payment.signature = signature;

        // 4. Update student's total_paid in DB
        await client.query(
            'UPDATE students SET total_paid = total_paid + $1 WHERE id = $2',
            [numericAmount, studentId]
        );

        // 5. Generate both receipt PDFs asynchronously
        const cleanName = student.name.trim().replace(/[\s/\\?%*:|"<>]+/g, '_');
        const studentPDFPath = path.join(studentReceiptsDir, `receipt_${payment.id}_${cleanName}_student.pdf`);
        const adminPDFPath = path.join(adminReceiptsDir, `receipt_${payment.id}_${cleanName}_admin.pdf`);

        await generateReceiptPDF(payment, student, studentPDFPath, 'student');
        await generateReceiptPDF(payment, student, adminPDFPath, 'admin');

        await client.query('COMMIT');
        res.status(201).json({
            message: 'Receipt generated successfully',
            paymentId: payment.id,
            amount: payment.amount,
            signature
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Internal server error while generating receipt.' });
    } finally {
        client.release();
    }
});

// GET: Download Student PDF Copy
app.get('/api/payments/:id/download-student', requireAuth, async (req, res) => {
    const paymentId = parseInt(req.params.id);

    try {
        const paymentRes = await db.query(
            `SELECT p.student_id, s.name as student_name 
             FROM payments p 
             JOIN students s ON p.student_id = s.id 
             WHERE p.id = $1`, 
            [paymentId]
        );
        if (paymentRes.rows.length === 0) {
            return res.status(404).json({ error: 'Receipt not found.' });
        }
        const studentName = paymentRes.rows[0].student_name;

        // Security check: student can only download their own receipt
        if (req.session.user.role === 'student' && req.session.user.student_id !== paymentRes.rows[0].student_id) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const cleanName = studentName.trim().replace(/[\s/\\?%*:|"<>]+/g, '_');
        const filePath = path.join(studentReceiptsDir, `receipt_${paymentId}_${cleanName}_student.pdf`);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Receipt file not found on server.' });
        }

        res.download(filePath, `receipt_${paymentId}_${cleanName}_student.pdf`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/api/payments/:id/download-admin', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
    const paymentId = parseInt(req.params.id);

    try {
        const paymentRes = await db.query(
            `SELECT p.id, s.name as student_name 
             FROM payments p 
             JOIN students s ON p.student_id = s.id 
             WHERE p.id = $1`, 
            [paymentId]
        );
        if (paymentRes.rows.length === 0) {
            return res.status(404).json({ error: 'Receipt not found.' });
        }
        const studentName = paymentRes.rows[0].student_name;
        const cleanName = studentName.trim().replace(/[\s/\\?%*:|"<>]+/g, '_');

        const filePath = path.join(adminReceiptsDir, `receipt_${paymentId}_${cleanName}_admin.pdf`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Receipt file not found on server.' });
        }

        res.download(filePath, `receipt_${paymentId}_${cleanName}_admin.pdf`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT: Modify payment (ONLY Manager can do this!)
app.put('/api/payments/:id', requireAuth, requireRole(['manager']), async (req, res) => {
    const paymentId = parseInt(req.params.id);
    const { amount, paymentType, customDescription } = req.body;

    if (!amount || !paymentType) {
        return res.status(400).json({ error: 'Amount and Payment Type are required.' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Invalid amount.' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Fetch original payment
        const origPaymentRes = await client.query('SELECT amount, student_id FROM payments WHERE id = $1', [paymentId]);
        if (origPaymentRes.rows.length === 0) {
            return res.status(404).json({ error: 'Receipt not found.' });
        }
        const origPayment = origPaymentRes.rows[0];

        // Fetch student details
        const studentRes = await client.query('SELECT name, national_id, phone FROM students WHERE id = $1', [origPayment.student_id]);
        const student = studentRes.rows[0];

        // Subtract original payment amount and add new amount
        const diffAmount = numericAmount - parseFloat(origPayment.amount);

        // Update payment database record
        const paymentResult = await client.query(
            `UPDATE payments 
             SET amount = $1, payment_type = $2, custom_description = $3 
             WHERE id = $4 RETURNING *`,
            [numericAmount, paymentType, customDescription ? customDescription.trim() : null, paymentId]
        );
        const payment = paymentResult.rows[0];

        // Recalculate signature
        const dateStr = new Date(payment.created_at).toISOString().split('T')[0];
        const signature = generateSignature(payment.id, student.name, payment.amount, dateStr);

        await client.query('UPDATE payments SET signature = $1 WHERE id = $2', [signature, payment.id]);
        payment.signature = signature;

        // Update student total_paid
        await client.query(
            'UPDATE students SET total_paid = total_paid + $1 WHERE id = $2',
            [diffAmount, origPayment.student_id]
        );

        // Re-generate both PDFs
        const cleanName = student.name.trim().replace(/[\s/\\?%*:|"<>]+/g, '_');
        const studentPDFPath = path.join(studentReceiptsDir, `receipt_${payment.id}_${cleanName}_student.pdf`);
        const adminPDFPath = path.join(adminReceiptsDir, `receipt_${payment.id}_${cleanName}_admin.pdf`);

        await generateReceiptPDF(payment, student, studentPDFPath, 'student');
        await generateReceiptPDF(payment, student, adminPDFPath, 'admin');

        await client.query('COMMIT');
        res.json({ message: 'Receipt updated successfully by Manager', paymentId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error while modifying receipt.' });
    } finally {
        client.release();
    }
});

// DELETE: Delete payment (ONLY Manager can do this!)
app.delete('/api/payments/:id', requireAuth, requireRole(['manager']), async (req, res) => {
    const paymentId = parseInt(req.params.id);

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Fetch original payment details (join to get student name for filename cleanup)
        const paymentRes = await client.query(
            `SELECT p.amount, p.student_id, s.name as student_name 
             FROM payments p 
             JOIN students s ON p.student_id = s.id 
             WHERE p.id = $1`, 
            [paymentId]
        );
        if (paymentRes.rows.length === 0) {
            return res.status(404).json({ error: 'Receipt not found.' });
        }
        const payment = paymentRes.rows[0];

        // Deduct payment amount from student's total_paid
        await client.query(
            'UPDATE students SET total_paid = total_paid - $1 WHERE id = $2',
            [parseFloat(payment.amount), payment.student_id]
        );

        // Delete from database
        await client.query('DELETE FROM payments WHERE id = $1', [paymentId]);

        // Delete files from server filesystem
        const cleanName = payment.student_name.trim().replace(/[\s/\\?%*:|"<>]+/g, '_');
        const studentPDFPath = path.join(studentReceiptsDir, `receipt_${paymentId}_${cleanName}_student.pdf`);
        const adminPDFPath = path.join(adminReceiptsDir, `receipt_${paymentId}_${cleanName}_admin.pdf`);

        if (fs.existsSync(studentPDFPath)) fs.unlinkSync(studentPDFPath);
        if (fs.existsSync(adminPDFPath)) fs.unlinkSync(adminPDFPath);

        await client.query('COMMIT');
        res.json({ message: 'Receipt deleted and total paid updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error while deleting receipt.' });
    } finally {
        client.release();
    }
});

// POST: Verify uploaded PDF receipt integrity (Admin & Manager only)
app.post('/api/payments/verify-pdf', requireAuth, requireRole(['manager', 'admin']), upload.single('receipt'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a PDF file.' });
    }

    try {
        const result = await verifyReceiptPDF(req.file.buffer);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server verification error.' });
    }
});

// ----------------------------------------
// DATA EXPORT APIS
// ----------------------------------------

// Helper function to convert DB rows to CSV
function convertToCSV(columns, rows) {
    const header = columns.join(',');
    const csvRows = rows.map(row => {
        return columns.map(col => {
            let val = row[col];
            if (val === null || val === undefined) return '""';

            // Format Dates
            if (val instanceof Date) {
                val = val.toISOString().split('T')[0];
            }

            // Format Strings (escape quotes)
            let valStr = String(val).replace(/"/g, '""');
            return `"${valStr}"`;
        }).join(',');
    });
    return [header, ...csvRows].join('\n');
}

// GET: Export Courses CSV (Admin & Manager only)
app.get('/api/export/courses', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM courses ORDER BY id ASC');
        const columns = ['id', 'name', 'teacher', 'schedule_type', 'time_slot', 'month_num', 'curriculum', 'created_at'];
        const csv = convertToCSV(columns, result.rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="courses_export.csv"');
        res.status(200).send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error exporting course data');
    }
});

// GET: Export Students CSV (Admin & Manager only)
app.get('/api/export/students', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM students ORDER BY id ASC');
        const columns = [
            'id', 'name', 'national_id', 'dob', 'pob', 'qualification', 'phone',
            'address', 'purpose', 'level', 'period', 'study_type', 'referral',
            'interviewer', 'suitable_group', 'reg_fee', 'curriculum_fee',
            'course_fee', 'total_due', 'total_paid', 'created_at'
        ];
        const csv = convertToCSV(columns, result.rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="students_export.csv"');
        res.status(200).send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error exporting student data');
    }
});

// GET: Export Payments CSV (Admin & Manager only)
app.get('/api/export/payments', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
    try {
        const result = await db.query(
            `SELECT p.id, p.created_at, p.student_id, s.name as student_name, 
                    p.amount, p.payment_type, p.custom_description, p.signature 
             FROM payments p 
             JOIN students s ON p.student_id = s.id 
             ORDER BY p.id ASC`
        );
        const columns = ['id', 'created_at', 'student_id', 'student_name', 'amount', 'payment_type', 'custom_description', 'signature'];
        const csv = convertToCSV(columns, result.rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="payments_export.csv"');
        res.status(200).send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error exporting payments data');
    }
});
// ----------------------------------------
// TESTING & LAUNCH SETUP APIS (MANAGER ONLY)
// ----------------------------------------

// POST: Inject rich mock data for testing
app.post('/api/test/mock-data', requireAuth, requireRole(['manager']), async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Insert Mock Courses
        const course1Res = await client.query(
            `INSERT INTO courses (name, teacher, schedule_type, time_slot, month_num, curriculum, start_date) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            ['General English Level 1', 'أ. علي الخفاجي', 'even', '10:00 AM - 12:00 PM', 1, 'Oxford English File 1', '2026-07-01']
        );
        const course2Res = await client.query(
            `INSERT INTO courses (name, teacher, schedule_type, time_slot, month_num, curriculum, start_date) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            ['IELTS Preparation Course', 'أ. مريم السامرائي', 'odd', '02:00 PM - 04:00 PM', 1, 'Cambridge IELTS 18', '2026-07-01']
        );
        const course3Res = await client.query(
            `INSERT INTO courses (name, teacher, schedule_type, time_slot, month_num, curriculum, start_date) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            ['Conversation Club Level 2', 'أ. جون سميث', 'even', '04:00 PM - 06:00 PM', 2, 'English Conversations', '2026-07-01']
        );

        const c1Id = course1Res.rows[0].id;
        const c2Id = course2Res.rows[0].id;
        const c3Id = course3Res.rows[0].id;

        // Seed initial 12 dates for mock courses
        const c1Dates = getCourseDatesArray('2026-07-01', 'even', 12);
        for (const d of c1Dates) {
            await client.query('INSERT INTO course_dates (course_id, date, time_slot, schedule_type) VALUES ($1, $2, $3, $4)', [c1Id, d, '10:00 AM - 12:00 PM', 'even']);
        }
        const c2Dates = getCourseDatesArray('2026-07-01', 'odd', 12);
        for (const d of c2Dates) {
            await client.query('INSERT INTO course_dates (course_id, date, time_slot, schedule_type) VALUES ($1, $2, $3, $4)', [c2Id, d, '02:00 PM - 04:00 PM', 'odd']);
        }
        const c3Dates = getCourseDatesArray('2026-07-01', 'even', 12);
        for (const d of c3Dates) {
            await client.query('INSERT INTO course_dates (course_id, date, time_slot, schedule_type) VALUES ($1, $2, $3, $4)', [c3Id, d, '04:00 PM - 06:00 PM', 'even']);
        }

        // 2. Insert Mock Students
        const passwordHash1 = await bcrypt.hash('123456789012', 10);
        const passwordHash2 = await bcrypt.hash('234567890123', 10);
        const passwordHash3 = await bcrypt.hash('345678901234', 10);

        const s1Res = await client.query(
            `INSERT INTO students (
                name, national_id, dob, pob, qualification, phone, address, purpose, level, period, study_type, referral,
                interviewer, suitable_group, reg_fee, curriculum_fee, course_fee, total_due, total_paid
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
            ['أحمد حسن علي', '123456789012', '2002-05-15', 'بغداد', 'طالب جامعي', '07701111111', 'بغداد / المنصور', 'السفر والدراسة', 'A2', 'afternoon', 'in_person', 'فيسبوك', 'أ. مريم', 'Group A - Level 1', 15000.00, 25000.00, 150000.00, 190000.00, 0.00]
        );
        const s2Res = await client.query(
            `INSERT INTO students (
                name, national_id, dob, pob, qualification, phone, address, purpose, level, period, study_type, referral,
                interviewer, suitable_group, reg_fee, curriculum_fee, course_fee, total_due, total_paid
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
            ['فاطمة عبد الرضا', '234567890123', '1998-09-22', 'البصرة', 'خريجة بكالوريوس', '07802222222', 'بغداد / الكرادة', 'العمل والترقية', 'B1', 'evening', 'in_person', 'صديق', 'أ. علي', 'IELTS Group B', 15000.00, 30000.00, 200000.00, 245000.00, 0.00]
        );
        const s3Res = await client.query(
            `INSERT INTO students (
                name, national_id, dob, pob, qualification, phone, address, purpose, level, period, study_type, referral,
                interviewer, suitable_group, reg_fee, curriculum_fee, course_fee, total_due, total_paid
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
            ['مصطفى خالد نجم', '345678901234', '2000-11-03', 'نينوى', 'طالب هندسة', '07903333333', 'بغداد / الجادرية', 'الهجرة', 'B2', 'evening', 'online', 'انستغرام', 'أ. جون', 'Conversation Group C', 15000.00, 20000.00, 120000.00, 155000.00, 0.00]
        );

        const s1 = s1Res.rows[0];
        const s2 = s2Res.rows[0];
        const s3 = s3Res.rows[0];

        // Insert student users with clean custom usernames
        await client.query(`INSERT INTO users (username, password, role, student_id) VALUES ($1, $2, $3, $4)`, ['ahmad_ali', passwordHash1, 'student', s1.id]);
        await client.query(`INSERT INTO users (username, password, role, student_id) VALUES ($1, $2, $3, $4)`, ['fatima_abdul', passwordHash2, 'student', s2.id]);
        await client.query(`INSERT INTO users (username, password, role, student_id) VALUES ($1, $2, $3, $4)`, ['mustafa_khaled', passwordHash3, 'student', s3.id]);

        // 3. Map students to courses
        await client.query(`INSERT INTO course_students (course_id, student_id) VALUES ($1, $2)`, [c1Id, s1.id]);
        await client.query(`INSERT INTO course_students (course_id, student_id) VALUES ($1, $2)`, [c2Id, s2.id]);
        await client.query(`INSERT INTO course_students (course_id, student_id) VALUES ($1, $2)`, [c3Id, s3.id]);

        // 4. Create Mock Attendance
        // For c1Id (Even starting 2026-07-01): 2026-07-01 (Wed), 2026-07-04 (Sat)
        await client.query(`INSERT INTO attendance (course_id, student_id, date, status) VALUES ($1, $2, $3, $4)`, [c1Id, s1.id, '2026-07-01', 'present']);
        await client.query(`INSERT INTO attendance (course_id, student_id, date, status) VALUES ($1, $2, $3, $4)`, [c1Id, s1.id, '2026-07-04', 'present']);

        // For c2Id (Odd starting 2026-07-01): 2026-07-02 (Thu), 2026-07-05 (Sun)
        await client.query(`INSERT INTO attendance (course_id, student_id, date, status) VALUES ($1, $2, $3, $4)`, [c2Id, s2.id, '2026-07-02', 'present']);
        await client.query(`INSERT INTO attendance (course_id, student_id, date, status) VALUES ($1, $2, $3, $4)`, [c2Id, s2.id, '2026-07-05', 'absent']);

        // For c3Id (Even starting 2026-07-01): 2026-07-01 (Wed), 2026-07-04 (Sat)
        await client.query(`INSERT INTO attendance (course_id, student_id, date, status) VALUES ($1, $2, $3, $4)`, [c3Id, s3.id, '2026-07-01', 'absent']);
        await client.query(`INSERT INTO attendance (course_id, student_id, date, status) VALUES ($1, $2, $3, $4)`, [c3Id, s3.id, '2026-07-04', 'present']);

        // 5. Create Mock Payments & PDFs
        const mockPayments = [
            { studentId: s1.id, student: s1, amount: 50000.00, type: 'installment', desc: 'القسط الأول من أجور الكورس' },
            { studentId: s1.id, student: s1, amount: 40000.00, type: 'custom', desc: 'أجور التسجيل والمنهج الدراسي كاملاً' },
            { studentId: s2.id, student: s2, amount: 245000.00, type: 'full', desc: 'تسديد كامل مبلغ أجور الدورة والمنهج' }
        ];

        for (const mp of mockPayments) {
            const pRes = await client.query(
                `INSERT INTO payments (student_id, amount, payment_type, custom_description, signature, created_by) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [mp.studentId, mp.amount, mp.type, mp.desc, 'TEMP', req.session.user.id]
            );
            const payment = pRes.rows[0];
            const dateStr = new Date(payment.created_at).toISOString().split('T')[0];
            const signature = generateSignature(payment.id, mp.student.name, payment.amount, dateStr);

            await client.query('UPDATE payments SET signature = $1 WHERE id = $2', [signature, payment.id]);
            payment.signature = signature;

            // Update student paid amount in DB
            await client.query('UPDATE students SET total_paid = total_paid + $1 WHERE id = $2', [mp.amount, mp.studentId]);

            // Generate PDFs
            const cleanName = mp.student.name.trim().replace(/[\s/\\?%*:|"<>]+/g, '_');
            const studentPDFPath = path.join(studentReceiptsDir, `receipt_${payment.id}_${cleanName}_student.pdf`);
            const adminPDFPath = path.join(adminReceiptsDir, `receipt_${payment.id}_${cleanName}_admin.pdf`);
            await generateReceiptPDF(payment, mp.student, studentPDFPath, 'student');
            await generateReceiptPDF(payment, mp.student, adminPDFPath, 'admin');
        }

        await client.query('COMMIT');
        res.json({ message: 'تم حقن البيانات التجريبية والمحاكاة بنجاح!' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'عطل أثناء حقن البيانات التجريبية.' });
    } finally {
        client.release();
    }
});

// POST: Clear all dynamic database tables for launch reset
app.post('/api/test/clear-db', requireAuth, requireRole(['manager']), async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Delete all payments, attendance, course assignments, courses, and student profiles
        await client.query('DELETE FROM payments');
        await client.query('DELETE FROM attendance');
        await client.query('DELETE FROM course_students');
        await client.query('DELETE FROM courses');

        // 2. Delete student users (leaving only manager and admin)
        await client.query("DELETE FROM users WHERE role = 'student'");

        // 3. Delete student profiles
        await client.query('DELETE FROM students');

        // 4. Delete generated PDF receipt files from disk
        const deleteFolderFiles = (dirPath) => {
            if (fs.existsSync(dirPath)) {
                const files = fs.readdirSync(dirPath);
                for (const file of files) {
                    fs.unlinkSync(path.join(dirPath, file));
                }
            }
        };

        deleteFolderFiles(studentReceiptsDir);
        deleteFolderFiles(adminReceiptsDir);

        await client.query('COMMIT');
        res.json({ message: 'تم مسح وتصفير كافة جداول قاعدة البيانات بنجاح لتهيئة الإطلاق!' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'حدث خطأ أثناء محاولة تصفير قاعدة البيانات.' });
    } finally {
        client.release();
    }
});

// ----------------------------------------
// START SERVER
// ----------------------------------------

// Calculate lecture dates helper
function getCourseDatesArray(startDateStr, scheduleType, numDays = 12) {
    const dates = [];
    const parts = startDateStr.split('-');
    let current = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));

    // Day index: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    const targetDays = scheduleType === 'even' ? [6, 1, 3] : [0, 2, 4];

    while (dates.length < numDays) {
        const dayOfWeek = current.getDay();
        if (targetDays.includes(dayOfWeek)) {
            const y = current.getFullYear();
            const m = String(current.getMonth() + 1).padStart(2, '0');
            const d = String(current.getDate()).padStart(2, '0');
            dates.push(`${y}-${m}-${d}`);
        }
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

// Database migration & initialization
async function initCourseDates() {
    const client = await db.pool.connect();
    try {
        // Verify/add photo_path column in students table
        await client.query(`
            ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_path VARCHAR(555);
        `);
        console.log('students.photo_path column verified/created.');

        // Verify course_dates table
        await client.query(`
            CREATE TABLE IF NOT EXISTS course_dates (
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                time_slot VARCHAR(100),
                schedule_type VARCHAR(10) CHECK (schedule_type IN ('even', 'odd')),
                PRIMARY KEY (course_id, date)
            );
        `);
        console.log('course_dates table verified/created.');

        // Verify student_custom_dues table
        await client.query(`
            CREATE TABLE IF NOT EXISTS student_custom_dues (
                id SERIAL PRIMARY KEY,
                student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('student_custom_dues table verified/created.');

        // Get all courses
        const coursesRes = await client.query('SELECT * FROM courses');
        for (const course of coursesRes.rows) {
            // Check if this course has any dates
            const datesRes = await client.query('SELECT COUNT(*) FROM course_dates WHERE course_id = $1', [course.id]);
            const count = parseInt(datesRes.rows[0].count);
            if (count === 0) {
                console.log(`Migrating/seeding dates for Course ${course.id}: ${course.name}...`);
                const startDateStr = new Date(course.start_date).toISOString().split('T')[0];
                const dates = getCourseDatesArray(startDateStr, course.schedule_type, 12);
                for (const d of dates) {
                    await client.query(
                        `INSERT INTO course_dates (course_id, date, time_slot, schedule_type) 
                         VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
                        [course.id, d, course.time_slot, course.schedule_type]
                    );
                }
            }
        }
    } catch (err) {
        console.error('Error during initCourseDates:', err);
    } finally {
        client.release();
    }
}

app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Englishers Club Server is running at http://localhost:${PORT}`);
    console.log(`LAN Access: Open on other network devices at http://<YOUR_LAN_IP>:${PORT}`);
    await initCourseDates();
});
