// Seeding script to initialize the PostgreSQL database schema and populate realistic users, teachers, courses, and students.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./index');

// Helper to calculate 12 lecture dates based on schedule pattern
function getCourseDatesArray(startDateStr, scheduleType, numDays = 12) {
    const dates = [];
    const parts = startDateStr.split('-');
    let current = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0);
    // Day index: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    const targetDays = scheduleType === 'even' ? [6, 1, 3] : [0, 2, 4];

    while (dates.length < numDays) {
        if (targetDays.includes(current.getDay())) {
            const y = current.getFullYear();
            const m = String(current.getMonth() + 1).padStart(2, '0');
            const d = String(current.getDate()).padStart(2, '0');
            dates.push(`${y}-${m}-${d}`);
        }
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

function generateSignature(paymentId, studentName, amount, date) {
    const secret = process.env.RECEIPT_SECRET || 'ENGLISHERS_SUPER_SECURE_QR_SECRET_2026';
    const payload = `${paymentId}|${studentName.trim()}|${Number(amount).toFixed(2)}|${date}|${secret}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
}

async function seed() {
    try {
        console.log('Reading schema file...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql on database...');
        await db.query(schemaSql);
        console.log('Schema created successfully.');

        // Generate hashed passwords
        console.log('Hashing passwords for default accounts...');
        const managerPasswordHash = await bcrypt.hash('Manager@Englishers2026', 10);
        const adminPasswordHash = await bcrypt.hash('Admin@Englishers2026', 10);
        const aliPasswordHash = await bcrypt.hash('ali', 10);

        // Seed Manager
        console.log('Inserting default Manager...');
        const mgrRes = await db.query(
            `INSERT INTO users (username, password, role, name) VALUES ($1, $2, $3, $4) RETURNING id`,
            ['manager', managerPasswordHash, 'manager', 'المدير العام']
        );
        const managerUserId = mgrRes.rows[0].id;

        // Seed Admin
        console.log('Inserting default Admin...');
        await db.query(
            `INSERT INTO users (username, password, role, name) VALUES ($1, $2, $3, $4)`,
            ['admin', adminPasswordHash, 'admin', 'المسؤولة الإدارية']
        );

        // Seed testing user 'ali'
        console.log("Inserting testing user 'ali'...");
        await db.query(
            `INSERT INTO users (username, password, role, name) VALUES ($1, $2, 'manager', 'علي (حساب تجريب)')`,
            ['ali', aliPasswordHash]
        );

        // Seed requested Admin accounts
        const newAdminList = ['Rzan1', 'Mhm1', 'IBM1', 'SHM1', 'JSM1'];
        for (const acc of newAdminList) {
            const h = await bcrypt.hash(acc, 10);
            await db.query(
                `INSERT INTO users (username, password, role, name) VALUES ($1, $2, 'admin', $3)`,
                [acc, h, acc]
            );
        }

        // Seed Teachers
        console.log('Inserting teachers...');
        const mockTeachers = [
            { username: 'teacher_ali', name: 'أ. علي الخفاجي' },
            { username: 'teacher_marwa', name: 'أ. مروة العبيدي' },
            { username: 'teacher_zainab', name: 'أ. زينب الكرخي' },
            { username: 'teacher_hassan', name: 'أ. حسن العامري' }
        ];

        const teacherIds = {};
        for (const t of mockTeachers) {
            const h = await bcrypt.hash(t.username, 10);
            const insRes = await db.query(
                `INSERT INTO users (username, password, role, name) VALUES ($1, $2, 'teacher', $3) RETURNING id`,
                [t.username, h, t.name]
            );
            teacherIds[t.username] = insRes.rows[0].id;
        }

        // Seed 12 Realistic Courses
        console.log('Inserting 12 rich courses with schedule patterns and dates...');
        const mockCoursesData = [
            {
                name: 'كورس اللغة الإنكليزية للمبتدئين (A1 - المجموعة الأولى)',
                teacherKey: 'teacher_ali',
                teacherName: 'أ. علي الخفاجي',
                schedule_type: 'even',
                time_slot: '10:00 AM - 12:00 PM',
                month_num: 1,
                curriculum: 'الكتاب الأساسي + كراسة التمارين التفاعلية',
                start_date: '2026-08-01',
                course_type: 'in_person',
                is_active: true
            },
            {
                name: 'دورة المحادثة والطلاقة الشاملة (B1)',
                teacherKey: 'teacher_marwa',
                teacherName: 'أ. مروة العبيدي',
                schedule_type: 'odd',
                time_slot: '04:00 PM - 06:00 PM',
                month_num: 1,
                curriculum: 'منهج Oxford English File (Intermediate)',
                start_date: '2026-08-02',
                course_type: 'in_person',
                is_active: true
            },
            {
                name: 'كورس التحضير المكثف لامتحان الآيلتس (IELTS Preparation)',
                teacherKey: 'teacher_hassan',
                teacherName: 'أ. حسن العامري',
                schedule_type: 'even',
                time_slot: '06:00 PM - 08:00 PM',
                month_num: 2,
                curriculum: 'Cambridge IELTS Academic 18 + نماذج سبيكينغ',
                start_date: '2026-08-01',
                course_type: 'online',
                is_active: true
            },
            {
                name: 'دورة القواعد والتأسيس اللغوي (Grammar Mastery A2)',
                teacherKey: 'teacher_zainab',
                teacherName: 'أ. زينب الكرخي',
                schedule_type: 'odd',
                time_slot: '12:00 PM - 02:00 PM',
                month_num: 1,
                curriculum: 'English Grammar in Use (Raymond Murphy)',
                start_date: '2026-08-02',
                course_type: 'in_person',
                is_active: true
            },
            {
                name: 'كورس الإنكليزية للأعمال والتواصل المهني (Business English)',
                teacherKey: 'teacher_marwa',
                teacherName: 'أ. مروة العبيدي',
                schedule_type: 'even',
                time_slot: '08:00 PM - 10:00 PM',
                month_num: 1,
                curriculum: 'Market Leader + كتابة المراسلات الإدارية',
                start_date: '2026-08-01',
                course_type: 'online',
                is_active: true
            },
            {
                name: 'نادي المحادثة التفاعلي المتقدم (Advanced Speaking Club C1)',
                teacherKey: 'teacher_ali',
                teacherName: 'أ. علي الخفاجي',
                schedule_type: 'odd',
                time_slot: '02:00 PM - 04:00 PM',
                month_num: 3,
                curriculum: 'مناظرات ونقاشات صوتية ومقالات أكاديمية',
                start_date: '2026-08-02',
                course_type: 'in_person',
                is_active: true
            },
            {
                name: 'دورة التوفل والمصطلحات الأكاديمية (TOEFL iBT Prep)',
                teacherKey: 'teacher_hassan',
                teacherName: 'أ. حسن العامري',
                schedule_type: 'odd',
                time_slot: '06:00 PM - 08:00 PM',
                month_num: 2,
                curriculum: 'Official Guide to TOEFL Test + كراسة الاستماع',
                start_date: '2026-08-02',
                course_type: 'online',
                is_active: true
            },
            {
                name: 'كورس النطق واللكنة الصوتية (Phonetics & Accent Training)',
                teacherKey: 'teacher_zainab',
                teacherName: 'أ. زينب الكرخي',
                schedule_type: 'even',
                time_slot: '02:00 PM - 04:00 PM',
                month_num: 1,
                curriculum: 'مخارج الحروف البريطانية والأمريكية + تدريب صوتي',
                start_date: '2026-08-01',
                course_type: 'in_person',
                is_active: true
            },
            {
                name: 'كورس اللغة الإنكليزية التفاعلي أونلاين (A1 Online)',
                teacherKey: 'teacher_marwa',
                teacherName: 'أ. مروة العبيدي',
                schedule_type: 'even',
                time_slot: '06:00 PM - 08:00 PM',
                month_num: 1,
                curriculum: 'الكتاب التأسيسي + أنشطة تفاعلية أونلاين',
                start_date: '2026-08-01',
                course_type: 'online',
                is_active: true
            },
            {
                name: 'دورة مهارات الكتابة الأكاديمية المتقدمة (Academic Writing)',
                teacherKey: 'teacher_hassan',
                teacherName: 'أ. حسن العامري',
                schedule_type: 'odd',
                time_slot: '10:00 AM - 12:00 PM',
                month_num: 3,
                curriculum: 'مقالات وبحوث أكاديمية باللغة الإنكليزية',
                start_date: '2026-08-02',
                course_type: 'in_person',
                is_active: false
            },
            {
                name: 'دورة اللغة الإنكليزية لليافعين (Young Learners Club)',
                teacherKey: 'teacher_zainab',
                teacherName: 'أ. زينب الكرخي',
                schedule_type: 'even',
                time_slot: '04:00 PM - 06:00 PM',
                month_num: 1,
                curriculum: 'قصص تفاعلية وألعاب لغوية مصورة',
                start_date: '2026-08-01',
                course_type: 'in_person',
                is_active: false
            },
            {
                name: 'كورس المحادثة الدبلوماسية والعلاقات العامة (PR English)',
                teacherKey: 'teacher_ali',
                teacherName: 'أ. علي الخفاجي',
                schedule_type: 'odd',
                time_slot: '08:00 PM - 10:00 PM',
                month_num: 2,
                curriculum: 'بروتوكول الخطاب الإنجليزي والتفاوض الدولي',
                start_date: '2026-08-02',
                course_type: 'online',
                is_active: true
            }
        ];

        const insertedCourses = [];
        const courseDatesMap = {};

        for (const mc of mockCoursesData) {
            const cRes = await db.query(`
                INSERT INTO courses (name, teacher, teacher_id, schedule_type, time_slot, month_num, curriculum, start_date, course_type, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id, start_date, schedule_type, time_slot, name
            `, [
                mc.name,
                mc.teacherName,
                teacherIds[mc.teacherKey] || null,
                mc.schedule_type,
                mc.time_slot,
                mc.month_num,
                mc.curriculum,
                mc.start_date,
                mc.course_type,
                mc.is_active
            ]);
            const courseObj = cRes.rows[0];
            insertedCourses.push(courseObj);

            // Generate and insert 12 dates for each course
            const cDates = getCourseDatesArray(mc.start_date, mc.schedule_type, 12);
            courseDatesMap[courseObj.id] = cDates;
            for (const d of cDates) {
                await db.query(
                    `INSERT INTO course_dates (course_id, date, time_slot, schedule_type) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
                    [courseObj.id, d, courseObj.time_slot, courseObj.schedule_type]
                );
            }
        }

        // Seed 10 Diverse Students
        console.log('Inserting 10 students and linking to courses...');
        const mockStudents = [
            { name: 'احمد علي حسنين', national_id: '100020003001', dob: '2001-04-15', pob: 'بغداد', qualification: 'بكالوريوس هندسة', phone: '07701111111', address: 'بغداد / الكرادة', purpose: 'تطوير ذات', level: 'A1', period: 'morning', study_type: 'in_person', referral: 'السوشيل ميديا', reg: 25000, curr: 0, course: 150000, plan: 'installment', inst: 50000, paid: 75000, is_frozen: false, purchased_lectures: 12 },
            { name: 'سارة محمد الكعبي', national_id: '100020003002', dob: '1999-08-20', pob: 'البصرة', qualification: 'خريجة لغات', phone: '07702222222', address: 'بغداد / المنصور', purpose: 'دراسة', level: 'B1', period: 'evening', study_type: 'in_person', referral: 'الأصدقاء', reg: 25000, curr: 0, course: 200000, plan: 'cash', inst: 0, paid: 225000, is_frozen: false, purchased_lectures: 12 },
            { name: 'مصطفى حميد الساعدي', national_id: '100020003003', dob: '2002-01-10', pob: 'ميسان', qualification: 'طالب جامعي', phone: '07703333333', address: 'بغداد / الشعب', purpose: 'سفر', level: 'A2', period: 'morning', study_type: 'in_person', referral: 'الإدارة', reg: 25000, curr: 0, course: 150000, plan: 'installment', inst: 50000, paid: 25000, is_frozen: false, purchased_lectures: 10 },
            { name: 'مريم حسن الزبيدي', national_id: '100020003004', dob: '2000-11-05', pob: 'بغداد', qualification: 'طبيبة أسنان', phone: '07704444444', address: 'بغداد / الجادرية', purpose: 'تطوير ذات', level: 'B2', period: 'evening', study_type: 'online', referral: 'عقود', reg: 25000, curr: 0, course: 250000, plan: 'cash', inst: 0, paid: 275000, is_frozen: false, purchased_lectures: 12 },
            { name: 'زينب جاسم العبيدي', national_id: '100020003005', dob: '2003-03-30', pob: 'بابل', qualification: 'طالبة إعدادية', phone: '07705555555', address: 'بغداد / الأعظمية', purpose: 'دراسة', level: 'C1', period: 'afternoon', study_type: 'in_person', referral: 'السوشيل ميديا', reg: 25000, curr: 0, course: 150000, plan: 'installment', inst: 50000, paid: 75000, is_frozen: false, purchased_lectures: 12 },
            { name: 'عمر فاروق الدليمي', national_id: '100020003006', dob: '1998-06-18', pob: 'الأنبار', qualification: 'ماجستير إدارة', phone: '07706666666', address: 'بغداد / اليرموك', purpose: 'تطوير ذات', level: 'C2', period: 'evening', study_type: 'in_person', referral: 'الأصدقاء', reg: 25000, curr: 0, course: 300000, plan: 'cash', inst: 0, paid: 325000, is_frozen: false, purchased_lectures: 12 },
            { name: 'حسين عبد الله التميمي', national_id: '100020003007', dob: '2001-09-12', pob: 'بغداد', qualification: 'دبلوم تقني', phone: '07707777777', address: 'بغداد / الدورة', purpose: 'تطوير ذات', level: 'A1', period: 'morning', study_type: 'in_person', referral: 'الإدارة', reg: 25000, curr: 0, course: 150000, plan: 'installment', inst: 50000, paid: 25000, is_frozen: false, purchased_lectures: 12 },
            { name: 'نور الهدى مرتضى', national_id: '100020003008', dob: '2004-02-22', pob: 'نجف', qualification: 'طالبة جامعية', phone: '07708888888', address: 'بغداد / زيونة', purpose: 'دراسة', level: 'B1', period: 'afternoon', study_type: 'online', referral: 'السوشيل ميديا', reg: 25000, curr: 0, course: 200000, plan: 'cash', inst: 0, paid: 225000, is_frozen: false, purchased_lectures: 12 },
            { name: 'كرار حيدر الشمري', national_id: '100020003009', dob: '2000-07-14', pob: 'بغداد', qualification: 'محاسب', phone: '07709999999', address: 'بغداد / الغدير', purpose: 'تطوير ذات', level: 'A2', period: 'evening', study_type: 'in_person', referral: 'الأصدقاء', reg: 25000, curr: 0, course: 150000, plan: 'installment', inst: 50000, paid: 75000, is_frozen: true, purchased_lectures: 12 },
            { name: 'فاطمة عباس المالكي', national_id: '100020003010', dob: '2002-12-01', pob: 'كربلاء', qualification: 'خريجة قانون', phone: '07800000000', address: 'بغداد / القادسية', purpose: 'سفر', level: 'B2', period: 'morning', study_type: 'in_person', referral: 'عقود', reg: 25000, curr: 0, course: 200000, plan: 'cash', inst: 0, paid: 225000, is_frozen: false, purchased_lectures: 12 }
        ];

        for (let i = 0; i < mockStudents.length; i++) {
            const s = mockStudents[i];
            const primaryCourse = insertedCourses[i % insertedCourses.length];
            const totalDue = s.reg + s.curr + s.course;

            const stuRes = await db.query(`
                INSERT INTO students (
                    name, national_id, dob, pob, qualification, phone, address, purpose, 
                    level, period, study_type, referral, interviewer, suitable_group,
                    reg_fee, curriculum_fee, course_fee, total_due, total_paid, payment_plan, installment_amount, is_frozen, purchased_lectures
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
                RETURNING id`,
                [
                    s.name, s.national_id, s.dob, s.pob, s.qualification, s.phone, s.address, s.purpose,
                    s.level, s.period, s.study_type, s.referral, 'محمد عمار ابراهيم', primaryCourse.name,
                    s.reg, s.curr, s.course, totalDue, s.paid, s.plan, s.inst, s.is_frozen, s.purchased_lectures || 12
                ]
            );
            const studentId = stuRes.rows[0].id;

            // Enroll in primary course
            await db.query(
                `INSERT INTO course_students (course_id, student_id) VALUES ($1, $2)`,
                [primaryCourse.id, studentId]
            );

            // Also enroll in secondary course for multi-course enrollment realism
            const secondaryCourse = insertedCourses[(i + 3) % insertedCourses.length];
            if (secondaryCourse.id !== primaryCourse.id && i % 2 === 0) {
                await db.query(
                    `INSERT INTO course_students (course_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [secondaryCourse.id, studentId]
                );
            }

            // Create payment receipt records
            if (s.paid > 0) {
                const payRes = await db.query(
                    `INSERT INTO payments (student_id, amount, payment_type, custom_description, signature, created_by)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at`,
                    [studentId, s.paid, s.plan === 'installment' ? 'installment' : 'full', 'دفع رسوم ومستحقات الكورس التجريبي', 'TEMP_SIGN', managerUserId]
                );
                const payId = payRes.rows[0].id;
                const payDateStr = new Date(payRes.rows[0].created_at).toISOString().split('T')[0];
                const sig = generateSignature(payId, s.name, s.paid, payDateStr);
                await db.query(`UPDATE payments SET signature = $1 WHERE id = $2`, [sig, payId]);
            }

            // Add attendance records
            if (!s.is_frozen) {
                const targetCoursesForAttendance = [primaryCourse];
                if (secondaryCourse.id !== primaryCourse.id && i % 2 === 0) {
                    targetCoursesForAttendance.push(secondaryCourse);
                }
                for (const crs of targetCoursesForAttendance) {
                    const cDates = courseDatesMap[crs.id] || [];
                    for (let dIdx = 0; dIdx < 4; dIdx++) {
                        if (cDates[dIdx]) {
                            const status = (i + dIdx) % 5 === 0 ? 'absent' : 'present';
                            await db.query(
                                `INSERT INTO attendance (course_id, student_id, date, status) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
                                [crs.id, studentId, cDates[dIdx], status]
                            );
                        }
                    }
                }
            }
        }

        console.log(`Database seeding finished successfully with ${insertedCourses.length} courses and ${mockStudents.length} students!`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seed();
