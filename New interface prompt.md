Design a complete high-fidelity interactive web app prototype for the new modern web platform called **Englishers Club Management Platform (منصة نادي إنكليشرز)**.

The platform is an all-in-one educational management system, academic tracking cockpit, and financial accounting suite specifically built for Englishers Club — a premier private language institute in Baghdad, Iraq, specializing in spoken English fluency, communicative mastery, IELTS/TOEFL test prep, and customized conversational courses.

---

## PRODUCT CONCEPT & DOMAIN CONTEXT

Englishers Club provides intensive conversational and professional English courses structured in monthly levels (Level A1 Starter through Level C2 Mastery), test preparation courses (IELTS, TOEFL), and specialized accent training (American Accent). 

In traditional institutes and within the earlier platform version, administration, teachers, and students faced multiple operational friction points:
1. **Inefficient Space Utilization on Large Displays:** When running on desktop monitors, 2K/4K displays, and widescreen institute workstations, interfaces often suffered from excessive empty voids, crowded button clusters, or awkward stretched components.
2. **Attendance Grid Friction:** In high-volume courses (10-30 students across 12-16 lecture dates), teachers struggled with lost context when scrolling down or across large tables.
3. **Complex Payment & Installment Tracking:** Students either pay in cash or via multi-part installment plans. Tracking overdue fees, custom dues (books, workshops), discounts, and lecture entitlements required constant manual calculations.
4. **Teacher Course Assignments:** Teachers need a dedicated, focused portal where they only manage their active classes, track session attendance, record individual behavioral/academic notes, and request session postponements without administrative clutter.
5. **Local Network Connectivity:** Receptionists, managers, teachers, and students frequently connect from mobile phones and tablets within the institute's Wi-Fi network, requiring instant local bridging without cumbersome IP entry.

Our new UI/UX revolutionizes this experience:
* **Fluid Ergonomic Bento Architecture:** The entire interface dynamically scales using fluid typography and balanced grid boundaries across all resolutions — from mobile phones to 34" ultrawide and 4K displays — completely eliminating wasted whitespace and button crowding.
* **Tactile Attendance Cockpit:** Features sticky frozen dates headers, sticky frozen student names columns, and custom high-contrast orange zipper-pull scroll controllers (`كبسولة سكرول برتقالية`) for effortless touch and mouse scrubbing.
* **Student 360° Profile Cockpit:** Centralizes academic enrollment, real-time attendance gauges, warning status, installment schedules, cryptographic payment receipts, and administrative notes into a unified interactive dossier.
* **Instant Local Bridging (LAN QR):** One-click QR code and link generator enabling any smartphone or tablet on the local Wi-Fi to pair with the server instantly.
* **Cryptographic Tamper-Proof Receipts:** Built-in receipt generation with unique serial numbers, SHA-256 cryptographic verification signatures, thermal print formats, and direct WhatsApp payment reminders.

---

# DESIGN PRINCIPLES

Create a prestigious, modern, high-end educational SaaS product tailored for the Middle East (Bilingual: Native RTL Arabic with English course terminology and tabular Latin numbers).

### Visual Direction:
* **Clean Light Foundation with Prestigious Navy & Amber Accents:** A crisp, ultra-clean surface architecture (`#f8fafc` background, `#ffffff` elevated cards) anchored by deep Englishers Royal Navy (`#0f172a`, `#1a2b4c`) and accented by energetic Englishers Amber/Orange (`#ea580c`, `#f59e0b`).
* **Modern Bento Grid Layout:** Organized, rounded cards (`border-radius: 12px` to `18px`) with subtle borders (`1.5px solid #e2e8f0`), soft shadows (`0 4px 20px rgba(0,0,0,0.04)`), and zero visual clutter.
* **High-Contrast Status Indicators:**
  * **Success / Present / Active:** Vibrant Emerald (`#10b981`)
  * **Warning / Installment Due / Waiting:** Warm Amber (`#f59e0b`)
  * **Danger / Absent / Debt / Frozen:** Crimson Coral (`#ef4444`)
  * **Info / In-Person:** Royal Blue (`#2563eb`)
  * **Online / Tech:** Vivid Indigo/Cyan (`#06b6d4`, `#6366f1`)
* **Typography:**
  * Primary Arabic Headings & Body: IBM Plex Sans Arabic or Cairo (crisp, professional, contemporary Arabic letterforms).
  * Latin Numerals & Course Codes: Inter or Outfit with tabular figures (`font-variant-numeric: tabular-nums`) for perfect alignment in financial receipts, dates, and attendance grids.
* **Zero Wasted Space & Button Ergonomics:**
  * Eliminate cramped clusters: Group related actions into clean segmented pill controls and dropdown action menus.
  * Establish clear visual hierarchy: High-emphasis primary CTA buttons (`btn-primary` filled with gradient or solid brand color), neutral secondary outlines (`btn-outline`), and protected destructive buttons (`btn-danger`).
  * Fullscreen capability: Dedicated platform-wide Fullscreen toggle button (`ملء الشاشة`) for immersive workstation use.

---

# RESPONSIVE & DISPLAY ADAPTATION

The platform must deliver a flawless, tailored experience across all hardware environments:

1. **4K Ultra HD & Ultrawide Displays (1800px – 2560px+):**
   * Auto-expanding Bento layouts (4 to 6 columns for KPI stat widgets).
   * Generous boundary frames on course tables (`max-width: 1850px`, centered with elegant gutters).
   * Generous font scaling (`clamp()`) to ensure absolute readability from across a desk.
2. **Large Desktop Workstations (1400px – 1799px - e.g. 24"-27" iMacs & PCs):**
   * 3 to 4 column dashboard widgets.
   * Wide attendance sheet canvas displaying 12-16 session dates simultaneously without horizontal cramping.
3. **Standard Laptops (1024px – 1399px):**
   * 2 to 3 column grids, standard collapsible sidebar.
   * Sticky table headers and columns activate smoothly.
4. **Tablets & iPads (768px – 1023px - Used by Teachers & Reception):**
   * Collapsible off-canvas drawer navigation with translucent backdrop.
   * Touch-optimized attendance toggles (minimum 44px tap targets).
   * Quick-tap zipper-pull sliders for responsive table scrubbing.
5. **Mobile Devices (375px – 767px - Used by Students & Mobile Admin):**
   * Single-column responsive cards.
   * Swipeable horizontal tab bars.
   * Bottom sheet modals for quick actions.

---

# USER ROLES & PERMISSION MATRIX

The platform serves four distinct user roles:

### 1. General Manager / Super Admin (المدير العام / مسؤول النظام)
* Full unrestricted master privileges.
* Management of courses, student directory, teachers, financial ledger, and due notifications.
* Base dues configuration (registration fee, curriculum fee, course fee), custom dues, and discounts.
* Data export (CSV/Excel) for students, courses, payments, and attendance.
* Exclusive access to developer testing sandbox (Database wipe & mock data injection for user `ali`).

### 2. Academic Counselor / Front Desk / Interviewer (موظف الاستقبال والمقابلات)
* Registering new incoming students via interactive intake form.
* Recording placement interview results (CEFR Level A1–C2, recommended group, interviewer name).
* Configuring payment plans (Cash vs Installments) and issuing tamper-proof payment receipts.
* Enrolling students into active courses and managing student profile records.

### 3. Course Instructor / Teacher (الأستاذ / المعلم)
* Dedicated simplified instructor cockpit showing only their assigned courses.
* Interactive attendance grid (marking Present, Absent, Excused for each student session).
* Recording per-session per-student academic/behavioral notes.
* Requesting lecture postponements and viewing student lecture quotas (purchased vs attended).

### 4. Student (الطالب)
* Personal academic portal accessible via mobile or desktop using registered Phone Number + National ID.
* Overview of currently enrolled courses, instructors, and lecture schedules.
* Live attendance progress bar, attendance history, and lecture quota balance.
* Financial account statement showing total dues, paid amounts, remaining installments, and downloadable PDF receipts.

---

# GLOBAL SYSTEM NAVIGATION & CHROME

### RTL Collapsible Sidebar (القائمة الجانبية):
* **Brand Header:** Englishers Club Logo (horizontal badge with dark/light contrast), subtitle "منصة إدارة النادي التعليمي".
* **Navigation Links (Admin / Manager):**
  1. **Courses Directory:** `جدول الكورسات` (Graduation cap icon)
  2. **Students Directory:** `قائمة الطلاب` (Users icon)
  3. **Receipts & Payments:** `الوصولات والمدفوعات` (Receipt icon)
  4. **Student Dues & Debt:** `مستحقات الطلاب` (File invoice dollar icon)
  5. **Due Notifications:** `إشعارات الاستحقاق` (Bell icon with dynamic red counter badge)
  6. **Faculty & Teachers:** `قائمة المعلمين` (Chalkboard user icon)
  7. **Reports & Exports:** `تصدير البيانات` (File CSV icon)
* **Navigation Links (Teacher View):**
  1. **My Courses:** `كورساتي التدريسية` (Graduation cap icon)
  2. **Attendance Management:** `سجل الحضور والغياب` (Calendar check icon)
* **Navigation Links (Student View):**
  1. **My Dashboard:** `لوحة الطالب` (Gauge icon)
  2. **My Attendance:** `سجل حضوري` (User check icon)
  3. **My Receipts:** `وصولاتي المالية` (Receipt icon)
* **Sidebar Footer:**
  * User Identity Card: Display Name, Role Tag (`مدير عام`, `معلم`, `طالب`), and Avatar.
  * Logout CTA: `تسجيل الخروج` (Danger outline pill with exit icon).

### Global Top Navbar (الشريط العلوي):
* **Left Section (RTL):**
  * Sidebar toggle hamburger button (icon `fa-bars`).
  * Dynamic breadcrumb / active page title (e.g. `جدول الكورسات الدراسية`, `ملف الطالب: علي ناصر`).
* **Right Section (RTL Actions):**
  * **Quick Add Student Button:** `إضافة طالب جديد ➕` (Primary pill button, open instant registration modal).
  * **LAN Network Link & QR Button:** `رابط الشبكة: 192.168.1.XX` (Secondary button with QR icon; clicking opens connection modal).
  * **Platform Fullscreen Toggle:** `ملء الشاشة` (Outline button with expand/compress icon; triggers browser fullscreen F11 state and persists across tab navigation).
  * **Notification Bell:** Live badge indicator for overdue student installments.

### Testing Sandbox Banner (خاص بالمطور / المستخدم ali):
* High-visibility amber banner visible exclusively for administrative testing.
* Two trigger buttons:
  * `تفريغ كافة البيانات 🗑️` (Confirms and resets database).
  * `حقن بيانات وهمية تجريبية 🧪` (Seeds 12 rich courses, teachers, mock students, dues, and attendance).

---

# SCREEN 01 — AUTHENTICATION & LOGIN

Create a clean, welcoming authentication portal.

* **Layout:** Centered card with subtle backdrop gradient, soft shadow, Englishers Club vertical brand logo.
* **Title:** `تسجيل الدخول إلى منصة إنكليشرز`
* **Subtitle:** `منصة إدارة النادي التعليمي وكورسات اللغة الإنكليزية`
* **Dual Login Mode Support:**
  * **For Staff / Admins / Teachers:** Username (`اسم المستخدم`) + Password (`كلمة المرور`).
  * **For Students:** Active Phone Number (`رقم الهاتف: 0770XXXXXXX`) + National ID (`رقم الهوية / البطاقة الموحدة`).
* **Input Fields:**
  * Input 1: `اسم المستخدم أو رقم الهاتف` with user icon.
  * Input 2: `كلمة المرور أو رقم الهوية` with lock icon and password visibility toggle.
* **Actions:**
  * Primary Button: `تسجيل الدخول` with arrow icon.
  * Secondary Link: `طالب جديد؟ ملء استمارة تسجيل الطالب` (Switches view to Screen 02).
* **Validation & Error Handling:** Real-time error alert badge (`اسم المستخدم أو كلمة المرور غير صحيحة`).

---

# SCREEN 02 — STUDENT PUBLIC SELF-REGISTRATION

An interactive, multi-step public intake form for prospective students.

* **Header:** `تسجيل طالب جديد` | `الرجاء ملء كافة المعلومات بدقة للتسجيل في النادي`
* **Form Sections (Clean Multi-Column Grid):**
  * **1. Personal Data (المعلومات الشخصية):**
    * Full Name: `الاسم الكامل للطالب (الثلاثي واللقب)`
    * National ID / Unified Card: `رقم الهوية / البطاقة الموحدة (12 رقماً)` with optional auto-generation note.
    * Date of Birth: `تاريخ الميلاد (DD/MM/YYYY)` with formatted date picker.
    * Place of Birth: `محل الولادة (المحافظة)` (e.g. بغداد, البصرة, النجف).
    * Academic Qualification: `التحصيل الدراسي` (e.g. خريج بكالوريوس هندسة, طالب إعدادية).
    * Active Phone Number: `رقم الهاتف النشط` (Validation: 11-digit Iraqi mobile number: `0770...`, `0780...`, `0750...`).
    * Residential Address: `عنوان السكن بالتفصيل` (المحافظة / المنطقة / أقرب نقطة دالة).
  * **2. Academic Preferences (التفضيلات الدراسية):**
    * Purpose of Learning English: `الغاية من تعلم اللغة الإنكليزية` (Dropdown: سفر, دراسة, تطوير ذات, أخرى with custom text input).
    * Preferred Study Period: `الفترة المناسبة للدراسة` (Dropdown: صباحي Morning, عصري Afternoon, مسائي Evening).
    * Study Delivery Mode: `نوع الدراسة` (Dropdown: حضوري داخل المعهد In-Person, إلكتروني أونلاين Online).
    * Referral Source: `كيف عرفت بنادي إنكليشرز؟` (Dropdown: السوشيل ميديا, الأصدقاء, الإدارة, عقود, أخرى).
  * **3. Account Credentials (إعداد حساب تسجيل الدخول):**
    * Account Username: `اسم المستخدم بالإنكليزية` (e.g. `ahmad_ali`).
    * Account Password: `كلمة المرور`.
  * **4. Photo & Agreements:**
    * Student Portrait: `الصورة الشخصية للطالب (اختياري)` with drag-and-drop preview box.
    * Terms Agreement Checkbox: `أوافق على لائحة قوانين وشروط النادي العامة` (Clickable link opens Screen 19).
* **Actions:**
  * Primary Submit CTA: `إرسال واستكمال التسجيل` (Paper plane icon).
  * Secondary CTA: `العودة لتسجيل الدخول`.
* **Success State:** Displays registered student card with instant credentials summary and welcome message.

---

# SCREEN 03 — EXECUTIVE DASHBOARD & OVERVIEW

A Bento-grid dashboard presenting the institute's vital telemetry at a glance.

* **Top Metric Widgets (Dynamic 4 to 6 Column Grid):**
  1. **Total Active Students:** `الطلاب النشطون` (e.g. `142 طالب` with +8% growth pill).
  2. **Active Courses:** `الكورسات الجارية` (e.g. `12 كورس` across 3 shifts).
  3. **Today's Attendance Rate:** `نسبة حضور اليوم` (e.g. `94.2%` with progress ring).
  4. **Monthly Institute Revenue:** `إيرادات الشهر الحالية` (e.g. `18,450,000 ع.د`).
  5. **Pending Receivables & Dues:** `المستحقات المتبقية بذمة الطلاب` (e.g. `4,200,000 ع.د` with alert icon).
  6. **Students on Lecture Quota Warning:** `طلاب تجاوزوا الحصص المشتراة` (e.g. `5 طلاب` with warning badge).
* **Main Visual Modules:**
  * **Module A (Center-Left): Active Courses Live Status:** Cards showing course name, assigned instructor, shift, enrolled students count, and today's session indicator.
  * **Module B (Center-Right): Real-Time Financial Activity:** Recent receipts issued, payment types (Cash vs Installment), and cryptographic verification badge.
  * **Module C (Bottom): Actionable Alerts Queue:** Overdue installment payments with direct WhatsApp reminder triggers.

---

# SCREEN 04 — COURSES CATALOG & DIRECTORY (`tab-courses`)

The central operational hub for managing all classes in the institute.

* **Header Controls Bar:**
  * Title: `قائمة الدورات والكورسات الدراسية`
  * **Filter Pill Group 1 (Status):** `الكورسات (الكل)` | `النشطة (نشط)` | `غير النشطة (غير نشط)`
  * **Filter Pill Group 2 (Mode):** `الكل` | `الاونلاين 🌐` | `الحضوري 🏫`
  * **Primary Action:** `إضافة دورة جديدة ➕` (Opens Screen 06).
* **Courses Table / Responsive Cards Grid:**
  * Columns:
    1. **Course Name & Code:** `اسم الكورس` (e.g. "Level A1 - Starter - الدورة الصباحية الأولى", "IELTS Academic Masterclass").
    2. **Assigned Instructor:** `المعلم المسند له` (e.g. "أ. محمد عمار ابراهيم" with teacher avatar; displays "غير محدد" in grey badge if unassigned).
    3. **Schedule Type:** `جدول الأيام` (e.g. "سبت - اثنين - أربعاء" Even Days / "أحد - ثلاثاء - خميس" Odd Days).
    4. **Time Slot:** `التوقيت` (e.g. "10:00 AM - 12:00 PM", "04:00 PM - 06:00 PM").
    5. **Month Cycle & Level:** `رقم الشهر / المنهج` (e.g. "الشهر 1 - Starter English").
    6. **Enrolled Students:** `الطلاب المشتركون` (e.g. "18 طالب" with badge).
    7. **Start Date & Delivery:** `تاريخ البدء والنوع` (e.g. "01/10/2026 - حضوري").
    8. **Status Toggle:** `الحالة` (Active green switch / Inactive grey switch).
    9. **Actions Menu:**
       * `إدارة الكورس والحضور` (Primary blue button with eye/calendar icon; opens Screen 05).
       * `تعديل الكورس` (Outline edit button).
       * `حذف الكورس` (Danger icon button with confirmation).

---

# SCREEN 05 — COURSE MANAGEMENT & ATTENDANCE COCKPIT (`course-details-modal`)

**This is the signature, highest-frequency operational cockpit in the platform.** 
It opens in an immersive wide modal or dedicated workspace view.

* **Modal Header Banner:**
  * Course Title: `إدارة كورس: Level B1 Intermediate - كورس المحادثة المسائي`
  * Instructor Badge: `المعلم: أ. علي ناصر`
  * Schedule & Room: `أحد - ثلاثاء - خميس | 06:00 PM - 08:00 PM | قاعة 2`
  * Progress Pill: `المحاضرة 7 من 12`
  * Close Button.
* **Three Functional Workspace Tabs:**
  1. `سجل وجدول الحضور والغياب` (Attendance Sheet & Zipper Controllers)
  2. `الطلاب المقيدون بالكورس` (Enrolled Students Roster)
  3. `تواريخ ومواعيد المحاضرات` (Session Dates & Postponement Calendar)

### Tab 1 Details: Interactive Attendance Sheet with Zipper Controllers
* **Sticky Table Layout:**
  * **Sticky Top Row (الصف الأول ثابت):** Remains permanently fixed at the top while scrolling vertically down the student list. Shows Date Headers (e.g. `01/10/2026`, `03/10/2026` ... `26/10/2026`), lecture session number (`محاضرة 1`, `محاضرة 2`), and quick session status.
  * **Sticky First Column (العمود الأول ثابت باليمين RTL):** Remains permanently pinned on the right while scrolling horizontally through dates. Displays: Student Photo thumbnail, Student Full Name, and purchased lectures quota badge (`8/12 محاضرة`).
* **Interactive Attendance Cells (خلايا رصد الحضور):**
  * Each cell contains a compact, ergonomic 3-state selector:
    * `حاضر` (Present - Green pill badge `btn-present`)
    * `غائب` (Absent - Red pill badge `btn-absent`)
    * `غير محدد / مجاز` (Unmarked/Excused - Grey outline badge)
  * **Session Note Button (زر الملاحظة 📝):** Located inside each cell. Clicking opens Screen 17 (`attendance-note-modal`) to view or save remarks (e.g. "تأخر 20 دقيقة", "لم يحل الواجب", "أداء ممتاز في المحادثة"). If a note already exists, the icon glows amber with a small badge.
* **Tactile Zipper-Pull Scroll Controllers (كبسولة السكرول البرتقالية الشبيهة بسحاب الملابس):**
  * **Vertical Zipper Controller (السكرولر العمودي):** Placed along the edge of the table. A fixed-height, rounded amber capsule (`كبسولة برتقالية أنيقة`) with a tactile grip icon (`fa-grip-vertical`) that users can effortlessly grab and slide up/down to scroll through long student lists.
  * **Horizontal Zipper Controller (السكرولر الأفقي):** Placed at the bottom of the table. A fixed-width, rounded amber capsule with a grip icon (`fa-grip-horizontal`) that users can drag left/right to navigate between past and future lecture dates smoothly.
* **Batch Action Footer Bar:**
  * `حفظ سجل الحضور بالكامل` (Primary green button).
  * `تحضير الجميع كـ حاضر` (Quick bulk-fill button).
  * `تصدير سجل الحضور كـ Excel` (Export button).

### Tab 2 Details: Enrolled Students Roster
* Quick Enrollment Bar: Dropdown to search and select any registered student, enrollment date picker, and button `+ إضافة الطالب للكورس`.
* Table of enrolled students with enrollment date, phone number, total attendance percentage, payment status, and action buttons (`تعديل تاريخ الانضمام`, `إلغاء التنسيب من الكورس`).

### Tab 3 Details: Session Dates & Schedule Calendar
* List of all 12–16 sessions generated for the course.
* Actions per session:
  * `تأجيل المحاضرة` (Postpone session to a new date; opens Screen 18).
  * `تعديل التوقيت` (Change time slot).
  * `إضافة محاضرة إضافية / تمديد الكورس` (`+ تمديد الكورس بمحاضرات إضافية`).

---

# SCREEN 06 — ADD / EDIT COURSE MODAL (`course-modal`)

Modal form to create a new course or edit an existing one.

* **Modal Title:** `إضافة دورة جديدة` / `تعديل بيانات الكورس`
* **Form Grid:**
  1. Course Name: `اسم الدورة / الكورس` (e.g. "Level B2 - Upper Intermediate - الدورة المسائية").
  2. Assigned Instructor: `المعلم المسؤول` (Dropdown populated dynamically from active teachers; allows selecting a teacher or choosing "غير محدد").
  3. Schedule Pattern: `جدول الأيام` (Radio selector: `سبت - اثنين - أربعاء (زوجي)` vs `أحد - ثلاثاء - خميس (فردي)`).
  4. Time Slot: `توقيت المحاضرة` (Dropdown or text: "10:00 AM - 12:00 PM", "02:00 PM - 04:00 PM", "06:00 PM - 08:00 PM").
  5. Month Cycle: `رقم الشهر / المستوى` (Numeric selector: 1, 2, 3, 4...).
  6. Curriculum Name: `المنهاج التدريبي` (e.g. "English File 4th Edition", "Cambridge IELTS 18").
  7. Start Date: `تاريخ بداية الكورس` (Date picker).
  8. Delivery Mode: `طريقة التدريس` (Pill toggle: `حضوري داخل المعهد` vs `إلكتروني أونلاين`).
* **Actions:**
  * `حفظ بيانات الكورس` (Primary button).
  * `إلغاء الأمر` (Outline button).

---

# SCREEN 07 — STUDENTS DIRECTORY (`tab-students`)

Master database of all registered students with instant filters and multi-parameter search.

* **Search & Filter Header:**
  * **Search Input:** `بحث بالاسم، رقم الهاتف، أو رقم الهوية...` with live filtering.
  * **Status Filter Tabs:**
    * `الكل`
    * `النشطون (نشط)` (Green badge)
    * `قائمة الانتظار (انتظار)` (Amber badge)
    * `المجمدون (مجمد)` (Cyan/Ice badge)
    * `الخريجون (خريج)` (Purple badge)
    * `المنسحبون (منسحب)` (Grey badge)
  * **Level Filter:** `المستوى:` (Dropdown: A1, A2, B1, B2, C1, C2, الكل).
  * **Study Mode Filter:** `النوع:` (حضوري vs أونلاين).
* **Students Data Table:**
  * Columns:
    1. **Student Avatar & Name:** Photo thumbnail, Full Name, National ID.
    2. **Phone Number:** Active mobile with one-click WhatsApp launch icon.
    3. **Enrolled Course(s):** Badges showing active courses (e.g. `Level A2 - مسائي`).
    4. **Financial Balance:**
       * Total Due (`المستحق`)
       * Total Paid (`المدفوع`)
       * Remaining Debt (`المتبقي`) highlighted in red if > 0.
    5. **Lecture Quota / Warnings:** Purchased lectures vs attended sessions (e.g. `10/12 محاضرة`). If attended >= purchased, displays red warning badge: `⚠️ مستحق التجديد`.
    6. **Status Badge:** `نشط`, `مجمد`, `خريج`, etc.
    7. **Action Triggers:**
       * `عرض الملف الشامل 360°` (Primary button; opens Screen 08).
       * `قطع وصل دفع 💵` (Opens Screen 10).
       * `خيارات إضافية` (Dropdown: تجميد الحساب, تعديل البيانات, حذف).

---

# SCREEN 08 — STUDENT 360° COMPREHENSIVE PROFILE MODAL (`student-details-modal`)

**The complete interactive dossier for any individual student.**

* **Hero Dossier Card:**
  * Student Photo (clickable to expand fullscreen via Screen 20), Full Name, National ID, Age & DOB, Phone Number.
  * Quick Status Badges: Level badge (`مستوى B1`), Delivery mode (`حضوري`), Account state (`حساب نشط` / `حساب مجمد`).
  * Quick Actions Bar:
    * `قطع وصل قبض جديد 💳`
    * `تجميد / إلغاء تجميد الحساب ❄️`
    * `تعديل البيانات الشخصية ✏️`
    * `مراسلة عبر واتساب 💬`
* **Four Comprehensive Dossier Tabs:**

### Tab 1: Personal & Placement Details (البيانات الشخصية والأكاديمية)
* Grid showing Place of Birth, Academic Qualification, Detailed Address, Purpose of Learning, Placement Interviewer Name, Recommended Study Group, Registration Date.

### Tab 2: Enrolled Courses & Attendance History (الكورسات وسجل الحضور)
* Cards for each enrolled course with instructor name and schedule.
* **Attendance Quota Gauge:** Visual progress bar showing `عدد المحاضرات المستهلكة: 9 من أصل 12 محاضرة مشتراة`.
* Detailed breakdown table of every attended lecture date with Present/Absent status and associated session notes.

### Tab 3: Financial Statement & Installments (كشف الحساب والأقساط)
* Financial Summary Bento Cards:
  * Total Tuition & Dues: `إجمالي الرسوم والمستحقات` (e.g. `200,000 ع.د`)
  * Total Paid: `إجمالي الواصل الفعلي` (e.g. `125,000 ع.د`)
  * Outstanding Debt: `المبلغ المتبقي بذمته` (e.g. `75,000 ع.د`)
* Payment Plan indicator: `خطة الدفع: أقساط شهرية (قسط شهري: 50,000 ع.د)`
* Base Fees Breakdown: Registration Fee (25,000 IQD), Curriculum Book Fee (25,000 IQD), Course Fee (150,000 IQD).
* Custom Dues & Discounts Applied (e.g. "كتاب محادثة إضافي: +15,000 ع.د", "خصم تفوق: -25,000 ع.د").
* Installment Schedule Matrix: List of installment months, due dates, amounts, paid status, and notification timestamps.

### Tab 4: Issued Receipts History (سجل الوصولات المقطوعة)
* Chronological list of all payment receipts issued for this student.
* Receipt serial number, date, amount, payment type, cashier name, and buttons to preview or print the PDF receipt.

---

# SCREEN 09 — FINANCIAL LEDGER & RECEIPTS (`tab-payments`)

Master accounting dashboard tracking all financial intake and receipts across the institute.

* **Top Financial Telemetry Bar:**
  * Total Inflow Today: `مقبوضات اليوم` (e.g. `1,250,000 ع.د`).
  * Total Inflow This Month: `مقبوضات الشهر` (e.g. `18,450,000 ع.د`).
  * Total Number of Receipts Issued: `إجمالي الوصولات المقطوعة` (e.g. `284 وصل`).
  * Primary Action: `+ قطع وصل دفع جديد` (Opens Screen 10).
* **Receipts Audit Table:**
  * Columns:
    1. **Receipt Serial Number:** `رقم الوصل` (e.g. `#REC-2026-0142`).
    2. **Issue Date & Time:** `تاريخ وساعة القبض` (e.g. `02/10/2026 - 04:30 PM`).
    3. **Student Name & Phone:** `اسم الطالب ورقم الهاتف`.
    4. **Amount Paid:** `المبلغ المقبوض` (e.g. `50,000 ع.د` in bold green font).
    5. **Payment Type:** `نوع الدفعة` (Badge: `دفعة كاملة Full`, `قسط شهري Installment`, `رسوم مخصصة Custom`).
    6. **Cashier / Creator:** `الموظف القابض` (e.g. "محمد عمار").
    7. **Cryptographic Signature Badge:** `التوقيع المشفر` (Shield icon with SHA-256 hash slice e.g. `a3f9...d81c` verifying receipt authenticity).
    8. **Actions:**
       * `طباعة الوصل الحراري (Thermal 80mm)` (Print icon).
       * `تحميل نسخة الطالب (PDF A4)` (Download student copy).
       * `تحميل نسخة الإدارة (PDF A4)` (Download archive copy).
       * `التحقق من صحة الوصل` (Opens verification scanner).

---

# SCREEN 10 — ISSUE NEW PAYMENT RECEIPT MODAL (`payment-modal`)

Interactive point-of-sale modal to issue official payment receipts.

* **Modal Title:** `قطع وصل قبض مالي جديد`
* **Student Selection & Live Ledger:**
  * Searchable Student Dropdown: Selecting a student immediately loads their real-time financial status card:
    * `إجمالي المستحق:` 200,000 ع.د
    * `المدفوع سابقاً:` 100,000 ع.د
    * `المتبقي الحالي:` 100,000 ع.د
* **Receipt Parameters:**
  * Payment Type: Radio pills (`قسط شهري Installment`, `تسديد كامل الدفعة Full`, `رسوم مخصصة أخرى Custom`).
  * Amount to Pay: `المبلغ المراد قبضه (دينار عراقي)` (Auto-formats with commas e.g. `50,000`).
  * Purpose / Description: `الوصف والبيان` (e.g. "دفعة القسط الأول لكورس المستوى B1").
  * Cashier Confirmation: Automatically tags current authenticated staff user.
* **Instant Calculation Preview:**
  * Remaining Debt After This Payment: `المبلغ المتبقي بعد هذا الوصل:` (Dynamically recalculates).
* **Actions:**
  * `حفظ وطباعة الوصل فوراً 🖨️` (Generates receipt, signs cryptographically, and opens print dialog).
  * `حفظ فقط` (Saves receipt to database).
  * `إلغاء الأمر`.

---

# SCREEN 11 — STUDENT DUES & RECEIVABLES (`tab-dues`)

Accounts receivable management center tracking outstanding student debts, custom fees, and scholarships.

* **Filter Bar:** Search student, filter by payment plan (`نقدي` vs `أقساط`), filter by debt status (`عليهم مستحقات` vs `خالص الذمة`).
* **Receivables Ledger Table:**
  * Columns:
    1. Student Name & Phone
    2. Payment Plan (`نقدي` / `أقساط`)
    3. Base Fees (`الرسوم الأساسية: التسجيل 25k + المنهاج + الكورس`)
    4. Custom Dues (`الرسوم المضافة`)
    5. Discounts Granted (`الخصومات الممنوحة`)
    6. Total Due (`صافي المستحق`)
    7. Total Paid (`الواصل`)
    8. Net Debt Balance (`الرصيد المتبقي`)
    9. Actions:
       * `تعديل الرسوم الأساسية` (Opens `#base-dues-modal`).
       * `إضافة رسم مخصص (كتب/ورش)` (Opens `#custom-dues-modal`).
       * `منح خصم / منحة` (Opens `#discount-modal`).
       * `سجل الدفعات المقبوضة`.

---

# SCREEN 12 — INSTALLMENT REMINDERS & DUE NOTIFICATIONS (`tab-notifications`)

Automated installment notification center connecting administrative records directly with WhatsApp outreach.

* **Header Summary:**
  * Total Upcoming Due Installments: `أقساط مستحقة خلال هذا الأسبوع` (e.g. `14 قسط`).
  * Overdue Past-Due Installments: `أقساط متأخرة تجاوزت موعدها` (e.g. `6 أقساط` in red alert card).
* **Notification Queue Table:**
  * Columns:
    1. Student Name & Active Phone Number.
    2. Enrolled Course & Instructor.
    3. Installment Month & Due Date (`تاريخ الاستحقاق`).
    4. Installment Amount Due (`مبلغ القسط`).
    5. Lecture Consumption Status (`عدد المحاضرات المحضورة: 11 من 12`).
    6. Notification Status (`لم يتم التنبيه` vs `تم إرسال إشعار بتاريخ 01/10/2026`).
    7. **Action Pipeline:**
       * `إرسال رسالة تذكير عبر واتساب 💬` (Green WhatsApp pill button: One click opens WhatsApp Web / App with a pre-composed, polite Arabic notification message containing student name, course title, due amount, and institute contact numbers).
       * `تعليم كـ تم التنبيه` (Manually marks notification timestamp).

---

# SCREEN 13 — FACULTY & TEACHERS MANAGEMENT (`tab-teachers`)

Instructor workforce directory and multi-course assignment management.

* **Header Action Bar:**
  * Title: `إدارة وقائمة المعلمين والأساتذة`
  * Action: `+ إضافة معلم جديد` (Opens Screen 13 Modal).
* **Teachers Cards / Table View:**
  * Columns:
    1. **Teacher Profile:** Name, Username, Contact Phone.
    2. **Assigned Courses (الكورسات المنسوبة له):** Displays badges for all active courses assigned to this teacher (e.g. `Level A1 مسائي`, `IELTS كورس السبت`). If none, displays `لا توجد كورسات منسوبة حالياً`.
    3. **Active Students Count:** Total students currently under this teacher's instruction.
    4. **Teaching Schedule Slots:** Even days / Odd days summary.
    5. **Actions:**
       * `تعديل بيانات وتنسيب الكورسات` (Opens `#teacher-modal`).
       * `عرض سجل حضور كورسات المعلم`.
       * `حذف حساب المعلم`.

### Teacher Add/Edit Modal (`teacher-modal`):
* Full Name: `اسم المعلم الكامل`
* Username: `اسم المستخدم لتسجيل الدخول`
* Password: `كلمة المرور (اتركه فارغاً للإبقاء على الحالية)`
* **Assigned Courses Multi-Select Checklist (الكورسات المنسوبة للمعلم):**
  * Checkbox list of all courses in the institute.
  * Shows course title, schedule, and time slot.
  * **Strict Assignment Rule:** Each course can only belong to one teacher. Unchecking a course automatically unassigns it (`teacher_id = NULL`, `teacher = 'غير محدد'`) without deleting the course or affecting student attendance history.

---

# SCREEN 14 — DATA EXPORT & AUDIT REPORTS (`tab-reports`)

Reporting and compliance center for generating structured Excel/CSV spreadsheets.

* **Export Cards (Clean Bento Grid):**
  1. **Students Master Roster Export:**
     * Description: Complete database of all students with contact info, levels, registration dates, dues, and statuses.
     * CTA: `تصدير ملف بيانات الطلاب (CSV / Excel) 📥`
  2. **Courses & Attendance Export:**
     * Description: Full attendance matrix across all courses, instructors, and session dates.
     * CTA: `تصدير بيانات الكورسات وسجل الحضور (CSV / Excel) 📥`
  3. **Financial Payments & Receipts Ledger:**
     * Description: Accounting records of all issued receipts, amounts, payment methods, and cashiers.
     * CTA: `تصدير كشف المقبوضات والوصولات (CSV / Excel) 📥`

---

# SCREEN 15 — STUDENT SELF-SERVICE PORTAL (`tab-student-dashboard`)

A modern, student-facing dashboard optimized for smartphones and tablets.

* **Greeting Hero Card:**
  * `أهلاً بك، [اسم الطالب] 👋` | `مرحباً بك في نادي إنكليشرز للغة الإنكليزية`
  * Active Level Badge: `المستوى الحالي: B1 Intermediate`
* **My Active Courses:**
  * Interactive course cards showing: Course Title, Instructor Name, Schedule & Room, Next Lecture Date & Time.
* **Attendance & Quota Tracker:**
  * Animated Progress Ring: `حضورك: 10 / 12 محاضرة` (83% Attendance rate).
  * Status indicator: `حالتك ممتازة - مؤهل للانتقال للمستوى التالي`.
* **Financial Account Summary:**
  * Total Paid vs Remaining Installment.
  * Next Installment Due Date.
* **My Receipts History:**
  * List of issued receipts with button `تحميل نسختي من الوصل (PDF) 📄`.

---

# SCREEN 16 — LAN LOCAL NETWORK QR LINK MODAL (`lan-qr-modal`)

Local Wi-Fi pairing modal allowing staff and students to access the platform seamlessly from mobile devices without typing manual network addresses.

* **Modal Header:** `الاتصال بالمنصة عبر الشبكة المحلية (Wi-Fi)`
* **Center QR Code Display:** Large, crisp QR code dynamically generated from the server's LAN IP (e.g. `http://192.168.1.45:3000`).
* **Direct URL Input:** Read-only styled input box showing the exact LAN URL with a `نسخ الرابط (Copy Link)` button.
* **Instructions Card:**
  * 1. تأكد من اتصال هاتفك بنفس شبكة Wi-Fi الخاصة بالمعهد.
  * 2. افتح كاميرا الهاتف وامسح رمز QR أعلاه.
  * 3. ستفتح المنصة مباشرة على متصفح هاتفك أو جهاز الآيباد.

---

# SCREEN 17 — ATTENDANCE SESSION NOTES MODAL (`attendance-note-modal`)

Contextual popup to record individual student session observations.

* **Modal Title:** `ملاحظة الحضور للمحاضرة`
* **Context Header:** Displays Student Name, Course Title, and Session Date.
* **Textarea:** Large, comfortable input for writing academic or behavioral feedback (e.g. "أظهر تفاعلاً ممتازاً في نقاش المحادثة الجماعية", "يحتاج لمراجعة قواعد زمن الماضي التام").
* **Actions:**
  * `حفظ الملاحظة` (Saves note to database; updates table cell with active note badge).
  * `إلغاء وإغلاق`.

---

# SCREEN 18 — SESSION DATE & POSTPONEMENT MODAL (`postpone-session-modal`)

Modal to handle holiday or emergency session rescheduling.

* **Modal Title:** `تأجيل موعد المحاضرة`
* **Original Date:** Displays current scheduled session date.
* **New Proposed Date Picker:** Date input to select the rescheduled date.
* **Reason / Note:** Text input (e.g. "عطلة رسمية", "ظرف طارئ للمعلم").
* **Actions:**
  * `تأكيد تأجيل المحاضرة` (Updates course calendar and adjusts subsequent attendance slots).
  * `إلغاء`.

---

# SCREEN 19 — TERMS & POLICY VIEWER MODAL (`policy-modal`)

Modal displaying the official Englishers Club bylaws and enrollment regulations.

* **Modal Title:** `لائحة قوانين وشروط نادي إنكليشرز العامة`
* **Policy Points (Formatted with Clean Checkmarks & Badges):**
  * سياسة الحضور والغياب (الحد الأقصى للغياب المسموح به محاضرتان لكل مستوى).
  * سياسة الأقساط والمستحقات المالية ومواعيد الاستحقاق.
  * شروط تجميد الاشتراك والمهلة المحددة لذلك.
  * تعليمات الاختبارات التقييمية وشهادات التخرج.
* **Close Button.**

---

# SCREEN 20 — DEVELOPER & ADMIN SANDBOX PANEL (`ali-testing-panel`)

Administrative sandbox banner and modal for platform testing.

* **Wipe Confirmation Modal:** Strong two-step warning modal: `هل أنت متأكد تماماً من تفريغ كافة البيانات؟` with danger confirmation.
* **Seed Mock Data Trigger:** Single-click injection of 12 courses, teachers, mock students, dues, receipts, and attendance records with instant UI refresh.

---

# IMPORTANT UX & ERGONOMIC RULES

### 1. Large Screen Optimization & Void Elimination:
* The previous UI suffered from empty dead space on 24"+ monitors and 4K displays.
* In the new UI, all main tabs (`#tab-courses`, `#tab-students`, `#tab-payments`, `#tab-dues`) utilize responsive Bento containers that expand into 3 to 6 columns.
* Data tables feature elegant boundary framing (`max-width: 1850px` on 4K, `max-width: 1500px` on 1440p) with balanced auto margins, preventing content from being stretched uncomfortably across the monitor edge while keeping all data dense, legible, and aesthetically balanced.

### 2. Button Grouping & Action Hierarchy:
* Buttons must never be crowded or stacked haphazardly.
* High-frequency actions use prominent primary buttons with clear iconography.
* Secondary filters use compact segmented pill groups (`btn-group`).
* Destructive actions (Delete, Wipe) are styled in muted danger outlines and require explicit confirmation dialogs.

### 3. Tactile Attendance Table Usability:
* In the attendance sheet, users must NEVER lose their sense of place:
  * Date headers row stays pinned at the top on vertical scroll.
  * Student names column stays pinned at the right (in RTL) on horizontal scroll.
* The custom orange zipper-pull scroll controllers provide a fixed-size, tactile handle that is intuitive to grab with a mouse or finger, solving the common issue of tiny, invisible native scrollbars.

### 4. Bilingual & RTL Considerations:
* The interface is natively RTL (Right-to-Left).
* Icons must follow correct RTL orientation (e.g. arrow icons for navigation flip appropriately).
* Numerical currency amounts (e.g. `25,000 ع.د`) and dates (e.g. `02/10/2026`) must maintain strict tabular formatting.

---

# IMPORTANT BUSINESS LOGIC & DATA FLOWS

The prototype must strictly respect the institute's established business and backend rules:

### 1. Tuition & Financial Structure:
* Base Student Cost: Registration Fee (`reg_fee`: default 25,000 IQD) + Curriculum Book Fee (`curriculum_fee`) + Course Tuition (`course_fee`) = `total_due`.
* Custom Dues (`student_custom_dues`): Additional books, private coaching, or re-testing fees add directly to `total_due`.
* Discounts: Scholarship or promotional deductions subtract directly from `total_due`.
* Payment Plans:
  * **Cash (نقدي):** Paid in full upfront.
  * **Installments (أقساط):** Divided into monthly installments (`student_installments`) with assigned due dates.
* Receipt Security: Every receipt generates a SHA-256 cryptographic hash combining Receipt ID, Student Name, Amount, and Issue Date to prove authenticity and prevent forgery.

### 2. Academic Cycle & Attendance Quota:
* Standard Level Cycle: 12 academic lectures per level (expandable via course extension).
* Purchased Lectures Quota (`purchased_lectures`): Tracks how many lectures the student has paid for.
* Warning State: When a student's attended sessions reach or exceed their purchased lectures (`attended >= purchased_lectures`), the system automatically flags the student with a warning badge and adds them to the renewal notifications queue.
* Account Freezing (`is_frozen`): Freezing a student pauses their active attendance tracking and retains their remaining lecture balance until unfrozen.

### 3. Course & Faculty Exclusivity:
* Each course has a single primary teacher (`teacher_id`).
* When managing a teacher's assigned courses in `#teacher-modal`, selecting courses assigns them exclusively to that teacher. Deselecting a course unassigns it (`teacher_id = NULL`, `teacher = 'غير محدد'`) without deleting the course or orphanizing enrolled students.

---

# PROTOTYPE INTERACTIONS (CLICKABLE USER FLOWS)

The Figma prototype must feature the following interactive, clickable user journeys:

### Journey A: Administrative Daily Attendance Routine
1. Admin/Teacher logs in on **Screen 01** → lands on **Screen 04 (Courses Directory)**.
2. Clicks `إدارة الكورس والحضور` on "Level B1 Intermediate" → opens **Screen 05 (Course Cockpit Modal)**.
3. Scrolls down the student roster: Notice the **Dates Header Row** remains fixed at the top.
4. Grabs the **Orange Zipper-Pull Slider** and drags left/right to scrub between lecture dates: Notice the **Student Names Column** remains pinned at the right.
5. Clicks attendance pill on a student from `غير محدد` → `حاضر` (turns emerald green).
6. Clicks `📝` note icon on the cell → opens **Screen 17 (Attendance Note Modal)** → types feedback → clicks `حفظ` → note indicator glows amber.
7. Clicks `حفظ سجل الحضور بالكامل` → receives success toast notification.

### Journey B: Student Registration to Receipt Issuance
1. Prospective student fills intake form on **Screen 02** → clicks `إرسال` → student record created.
2. Receptionist views new student in **Screen 07 (Students Directory)**.
3. Clicks `عرض الملف الشامل 360°` → opens **Screen 08 (Student Dossier Modal)**.
4. Clicks `قطع وصل قبض مالي 💳` → opens **Screen 10 (Payment Modal)**.
5. Selects `قسط شهري`, enters `50,000 ع.د`, clicks `حفظ وطباعة الوصل` → receipt generated on **Screen 09** with cryptographic signature hash.

### Journey C: Installment Due Alert & WhatsApp Outreach
1. Receptionist clicks `إشعارات الاستحقاق` in the sidebar → opens **Screen 12**.
2. Reviews overdue installment list → spots student with 11/12 attended lectures.
3. Clicks `إرسال رسالة تذكير عبر واتساب 💬` → triggers simulated WhatsApp interaction with pre-filled Arabic message.
4. Clicks `تعليم كـ تم التنبيه` → notification badge count updates in real-time.

### Journey D: Faculty Course Assignment
1. Admin navigates to **Screen 13 (Teachers Management)**.
2. Clicks `تعديل بيانات وتنسيب الكورسات` on "أ. محمد عمار" → opens `#teacher-modal`.
3. Checks/unchecks courses in the checklist → clicks `حفظ البيانات` → assigned course badges update instantly in the table.

---

# DESIGN SYSTEM SPECIFICATIONS

Create a unified, reusable Figma component library:

### 1. Color Palette Tokens:
* `Brand-Navy-900`: `#0f172a` (Primary dark foundation, sidebar background, headings)
* `Brand-Navy-800`: `#1e293b` (Secondary dark surfaces)
* `Brand-Amber-500`: `#f59e0b` (Primary energetic accent, zipper pull thumbs, warnings)
* `Brand-Orange-600`: `#ea580c` (Primary CTAs, active highlights)
* `Emerald-500`: `#10b981` (Present status, paid badges, success notifications)
* `Crimson-500`: `#ef4444` (Absent status, debts, danger alerts)
* `Slate-50`: `#f8fafc` (App main background)
* `Slate-100`: `#f1f5f9` (Subtle card fills, zebra striping)
* `Slate-200`: `#e2e8f0` (Crisp container borders)
* `Slate-500`: `#64748b` (Secondary descriptive text)
* `Pure-White`: `#ffffff` (Elevated card surfaces)

### 2. Typography Hierarchy:
* Display Headline: 28px – 34px Bold (Arabic Cairo / IBM Plex Sans Arabic)
* Section Title / Modal Header: 20px – 24px SemiBold
* Card Title / Table Header: 15px – 17px SemiBold
* Body Regular: 13px – 14px Regular
* Meta / Footnote: 11px – 12px Regular
* Tabular Figures: 14px – 18px Medium (Inter / Outfit Tabular Numerals for currency & dates)

### 3. Reusable UI Components:
* **Buttons:** `btn-primary` (Amber/Orange fill), `btn-outline` (Navy/Slate border), `btn-danger` (Crimson), `btn-sm` compact pills.
* **Badges:** Status pill badges for Active, Inactive, Frozen, Graduated, Withdrawn.
* **Attendance Toggles:** 3-state pills (`حاضر`, `غائب`, `غير محدد`).
* **Tactile Zipper Scrollers:** Fixed-size amber capsule thumbs with vertical and horizontal grip icons.
* **Bento Stat Cards:** Elevated metric widgets with icon, numerical value, label, and trend pill.
* **Dossier Headers:** Student and Course profile cards with avatar, metadata tags, and quick actions.
* **Tables:** Sticky header rows, sticky first column, hover highlights, zebra striping.
* **Modals:** Centered backdrop overlays with smooth scale-in transitions.
* **QR LAN Widget:** High-contrast QR code container with copyable IP link input.

---

# CONTENT STYLE & REALISTIC LOCAL DATA

Use authentic, realistic Iraqi educational institute mock content throughout all Figma screens:

* **Institute Name:** `نادي إنكليشرز للغة الإنكليزية - Englishers Club`
* **Currency:** Iraqi Dinars (`ع.د` / `IQD`) with realistic tuition figures:
  * Registration Fee: `25,000 ع.د`
  * Curriculum Book Fee: `25,000 ع.د`
  * Monthly Level Tuition: `150,000 ع.د` – `250,000 ع.د`
  * Installment Amount: `50,000 ع.د` – `75,000 ع.د`
* **Student Names (Realistic Iraqi Names):**
  * علي ناصر الخزالي
  * مصطفى حميد الساعدي
  * مريم حسن الزبيدي
  * زينب جاسم العبيدي
  * عمر فاروق الدليمي
  * حسين عبد الله التميمي
  * نور الهدى مرتضى
  * كرار حيدر الشمري
  * فاطمة عباس المالكي
* **Instructors & Staff Names:**
  * أ. محمد عمار ابراهيم
  * أ. سارة أحمد الجبوري
  * أ. حيدر الكرخي
  * أ. علي ناصر
* **Course Titles & Curriculums:**
  * `Level A1 - Starter - كورس المحادثة التأسيسي`
  * `Level A2 - Elementary - كورس الطلاقة الصباحي`
  * `Level B1 - Intermediate - كورس المحادثة والتواصل`
  * `Level B2 - Upper Intermediate - كورس الإتقان المسائي`
  * `IELTS Academic Masterclass - دورة التحضير لاختبار الآيلتس`
  * `American Accent & Pronunciation - دورة اللهجة الأمريكية`

---

# FINAL REQUIREMENT

The goal of this Figma prototype is to create an **elite, interactive, production-ready design specification** that the institute founder and development team can inspect, test, and validate before code integration begins.

* **Do not generate backend or database code.**
* **Do not invent placeholder lorem-ipsum content; use the realistic Arabic and Iraqi data defined above.**
* **Ensure all interactions, modals, drawers, and tabs are fully wireframed, styled, and linked.**
* **Ensure 100% architectural alignment with the existing PostgreSQL database schema and Express backend API routes.**

The resulting Figma prototype will serve as the exact visual and ergonomic blueprint for replacing the frontend with this new, world-class interface.
