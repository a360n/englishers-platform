// Frontend client-side application logic for Englishers Club Platform

// State Management
let currentUser = null;
let studentsList = [];
let paymentsList = [];
let coursesList = [];
let currentStudentFilter = 'all';
let activeCourseId = null;
let currentAttendanceData = {}; // { dateStr: { studentId: 'present'/'absent' } }
let courseStudentsList = [];
let allAttendanceDates = [];
let courseSessionsList = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    setupEventListeners();
});

// Check user login session
async function checkSession() {
    try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (data.user) {
            currentUser = data.user;
            showPortal('main');
            renderUserProfile();
            loadDashboardData();
            
            // Show server LAN IP if available
            try {
                fetch('/api/lan-ip')
                    .then(r => r.json())
                    .then(ipData => {
                        const showIp = ipData.ip || window.location.hostname;
                        document.getElementById('lan-ip-banner').innerHTML = `سيرفر المعهد الرئيسي نشط | IP الشبكة: <strong style="color:var(--secondary-color);">${showIp}</strong> | المنفذ: 3000`;
                    })
                    .catch(() => {
                        document.getElementById('lan-ip-banner').innerHTML = `سيرفر المعهد الرئيسي نشط | IP الشبكة: ${window.location.hostname}`;
                    });
            } catch (err) {
                document.getElementById('lan-ip-banner').innerHTML = `سيرفر المعهد الرئيسي نشط | IP الشبكة: ${window.location.hostname}`;
            }
        } else {
            showPortal('auth');
        }
    } catch (err) {
        console.error('Error checking session:', err);
        showPortal('auth');
    }
}

// Setup portal UI views
function showPortal(portal) {
    const authPortal = document.getElementById('auth-portal');
    const mainPortal = document.getElementById('main-portal');
    
    if (portal === 'main') {
        authPortal.style.display = 'none';
        mainPortal.style.display = 'flex';
    } else {
        authPortal.style.display = 'flex';
        mainPortal.style.display = 'none';
        showAuthCard('login');
    }
}

function showAuthCard(card) {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    
    if (card === 'login') {
        loginCard.style.display = 'block';
        registerCard.style.display = 'none';
    } else {
        loginCard.style.display = 'none';
        registerCard.style.display = 'block';
    }
}

// User details rendering in sidebar
function renderUserProfile() {
    const nameEl = document.getElementById('user-display-name');
    const roleEl = document.getElementById('user-display-role');
    const adminGroup = document.getElementById('menu-admin-group');
    const studentGroup = document.getElementById('menu-student-group');
    const testSection = document.getElementById('manager-testing-section');
    const aliTestingPanel = document.getElementById('ali-testing-panel');
    
    nameEl.textContent = currentUser.username;
    if (aliTestingPanel) {
        aliTestingPanel.style.display = (currentUser && currentUser.username === 'ali') ? 'flex' : 'none';
    }
    const quickAddBtn = document.getElementById('admin-quick-add-student-btn');
    if (quickAddBtn) {
        const activeTab = document.querySelector('.tab-content:not([style*="display: none"])');
        const isStudentsTab = activeTab && activeTab.id === 'tab-students';
        const isManagerOrAdmin = currentUser && ['manager', 'admin'].includes(currentUser.role);
        quickAddBtn.style.display = (isManagerOrAdmin && isStudentsTab) ? 'inline-flex' : 'none';
    }
    
    if (currentUser.role === 'manager') {
        roleEl.textContent = 'المدير العام';
        adminGroup.style.display = 'block';
        studentGroup.style.display = 'none';
        if (testSection) testSection.style.display = 'block';
        // Reset display of all sidebar items
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.style.display = 'block';
        });
        switchTab('tab-courses');
    } else if (currentUser.role === 'admin') {
        roleEl.textContent = 'المسؤولة الإدارية';
        adminGroup.style.display = 'block';
        studentGroup.style.display = 'none';
        if (testSection) testSection.style.display = 'none';
        // Reset display of all sidebar items
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.style.display = 'block';
        });
        switchTab('tab-courses');
    } else if (currentUser.role === 'teacher') {
        roleEl.textContent = 'أستاذ / معلم';
        adminGroup.style.display = 'block';
        studentGroup.style.display = 'none';
        if (testSection) testSection.style.display = 'none';
        // Only show 'Courses' tab for teacher
        document.querySelectorAll('.sidebar-item').forEach(item => {
            const tab = item.getAttribute('data-tab');
            if (['tab-students', 'tab-payments', 'tab-dues', 'tab-reports'].includes(tab)) {
                item.style.display = 'none';
            } else {
                item.style.display = 'block';
            }
        });
        switchTab('tab-courses');
    } else if (currentUser.role === 'student') {
        roleEl.textContent = 'حساب طالب';
        adminGroup.style.display = 'none';
        studentGroup.style.display = 'block';
        if (testSection) testSection.style.display = 'none';
        switchTab('tab-student-dashboard');
    }
}

// Switch between dashboard tabs
function switchTab(tabId) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.style.display = 'none');
    
    const activeTab = document.getElementById(tabId);
    if (activeTab) activeTab.style.display = 'block';
    
    // Sidebar active state
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update Top Navbar Page Title & Quick Add Student button visibility
    const titleEl = document.getElementById('page-title');
    const quickAddBtn = document.getElementById('admin-quick-add-student-btn');
    if (quickAddBtn) {
        const isManagerOrAdmin = currentUser && ['manager', 'admin'].includes(currentUser.role);
        quickAddBtn.style.display = (isManagerOrAdmin && tabId === 'tab-students') ? 'inline-flex' : 'none';
    }

    switch (tabId) {
        case 'tab-courses': titleEl.textContent = 'جدول الكورسات والدورات'; break;
        case 'tab-students': titleEl.textContent = 'قائمة وإدارة الطلاب'; break;
        case 'tab-payments': titleEl.textContent = 'الوصولات والمعاملات المالية'; break;
        case 'tab-dues': titleEl.textContent = 'مستحقات وأقساط الطلاب'; break;
        case 'tab-notifications': titleEl.textContent = 'إشعارات ومواعيد استحقاق الأقساط'; break;
        case 'tab-reports': titleEl.textContent = 'تصدير وحفظ البيانات'; break;
        case 'tab-student-dashboard': titleEl.textContent = 'لوحة معلومات الطالب'; break;
        default: titleEl.textContent = 'لوحة التحكم';
    }
}

// Load data based on user roles
function loadDashboardData() {
    if (currentUser.role === 'manager' || currentUser.role === 'admin' || currentUser.role === 'teacher') {
        fetchCourses();
        fetchStudents();
        if (currentUser.role !== 'teacher') {
            fetchPayments();
        }
    } else if (currentUser.role === 'student') {
        fetchStudentDashboard(currentUser.student_id);
    }
}

// Event Listeners Configuration
function setupEventListeners() {
    // Tab switching
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
            
            // Auto-close sidebar on item click
            document.querySelector('.sidebar').classList.remove('active');
            document.getElementById('sidebar-backdrop').classList.remove('active');
        });
    });

    // Auth Card toggles
    document.getElementById('show-register-btn').addEventListener('click', (e) => {
        e.preventDefault();
        showAuthCard('register');
    });
    
    document.getElementById('hide-register-btn').addEventListener('click', (e) => {
        e.preventDefault();
        showAuthCard('login');
    });

    // View Policy Link Click Listener
    const policyLink = document.getElementById('view-policy-link');
    if (policyLink) {
        policyLink.addEventListener('click', (e) => {
            e.preventDefault();
            openPolicyModal();
        });
    }

    // Login Form Submit
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        
        errorEl.style.display = 'none';

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                currentUser = data.user;
                showPortal('main');
                renderUserProfile();
                loadDashboardData();
            } else {
                errorEl.textContent = data.error || 'حدث خطأ أثناء تسجيل الدخول.';
                errorEl.style.display = 'flex';
            }
        } catch (err) {
            console.error(err);
            errorEl.textContent = 'تعذر الاتصال بالسيرفر الرئيسي.';
            errorEl.style.display = 'flex';
        }
    });

    // Student Self-Registration Form Submit
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('register-error');
        const successEl = document.getElementById('register-success');
        
        errorEl.style.display = 'none';
        successEl.style.display = 'none';

        // Check if student agreed to terms and conditions
        const agreeChecked = document.getElementById('reg-agree-policy').checked;
        if (!agreeChecked) {
            errorEl.textContent = 'يجب الموافقة على شروط وقوانين النادي العامة لتسجيل الحساب.';
            errorEl.style.display = 'flex';
            return;
        }

        const formData = new FormData();
        formData.append('name', document.getElementById('reg-name').value);
        formData.append('national_id', document.getElementById('reg-national-id').value);
        formData.append('dob', document.getElementById('reg-dob').value);
        formData.append('pob', document.getElementById('reg-pob').value);
        formData.append('qualification', document.getElementById('reg-qualification').value);
        formData.append('phone', document.getElementById('reg-phone').value);
        formData.append('address', document.getElementById('reg-address').value);
        formData.append('purpose', document.getElementById('reg-purpose').value);
        const usernameVal = document.getElementById('reg-username').value;
        const passwordVal = document.getElementById('reg-password').value;
        formData.append('username', usernameVal);
        formData.append('password', passwordVal);
        formData.append('period', document.getElementById('reg-period').value);
        formData.append('study_type', document.getElementById('reg-study-type').value);
        formData.append('referral', document.getElementById('reg-referral').value);

        const photoInput = document.getElementById('reg-photo');
        if (photoInput && photoInput.files[0]) {
            formData.append('photo', photoInput.files[0]);
        }

        try {
            const res = await fetch('/api/auth/register-student', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                successEl.textContent = 'تم التسجيل بنجاح! جاري تسجيل دخولك للمنصة تلقائياً...';
                successEl.style.display = 'flex';
                document.getElementById('register-form').reset();
                
                // Auto-login student with the registered credentials
                try {
                    const loginRes = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: usernameVal,
                            password: passwordVal
                        })
                    });
                    if (loginRes.ok) {
                        setTimeout(() => {
                            checkSession();
                        }, 1500);
                    } else {
                        setTimeout(() => {
                            showAuthCard('login');
                        }, 2000);
                    }
                } catch (loginErr) {
                    console.error(loginErr);
                    setTimeout(() => {
                        showAuthCard('login');
                    }, 2000);
                }
            } else {
                errorEl.textContent = data.error || 'فشل التسجيل.';
                errorEl.style.display = 'flex';
            }
        } catch (err) {
            console.error(err);
            errorEl.textContent = 'تعذر الاتصال بالسيرفر الرئيسي.';
            errorEl.style.display = 'flex';
        }
    });

    // Logout Button Click
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            currentUser = null;
            showPortal('auth');
        } catch (err) {
            console.error('Logout error:', err);
        }
    });

    // Course Creation/Update Form Submit
    document.getElementById('course-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('course-modal-id').value;
        
        // Combine start and end times
        const startTime = document.getElementById('course-time-start').value;
        const endTime = document.getElementById('course-time-end').value;
        const timeSlot = `${startTime} - ${endTime}`;

        const curriculumSelectVal = document.getElementById('course-curriculum-select').value;
        const curriculumVal = curriculumSelectVal === 'Custom Curriculum'
            ? document.getElementById('course-curriculum-custom').value
            : curriculumSelectVal;

        // Validate start date pattern
        if (!validateCourseStartDatePattern()) {
            alert('عذراً، تاريخ بدء الكورس غير متوافق مع نمط التوزيع الأسبوعي المختار. يرجى اختيار تاريخ يوافق أحد أيام النمط (زوجي: سبت/اثنين/أربعاء، فردي: أحد/ثلاثاء/خميس).');
            return;
        }

        const payload = {
            name: document.getElementById('course-name').value,
            teacher: document.getElementById('course-teacher').value,
            schedule_type: document.getElementById('course-schedule').value,
            time_slot: timeSlot,
            start_date: document.getElementById('course-start-date').value,
            month_num: document.getElementById('course-month').value,
            curriculum: curriculumVal
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/courses/${id}` : '/api/courses';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.ok) {
                closeCourseModal();
                fetchCourses();
            } else {
                alert(data.error || 'حدث خطأ أثناء حفظ الكورس.');
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Assign Student to Course Form
    document.getElementById('assign-student-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentId = document.getElementById('assign-student-select').value;
        if (!studentId) return;

        try {
            const res = await fetch(`/api/courses/${activeCourseId}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert('تم إضافة الطالب بنجاح للدورة.');
                openCourseDetailsModal(activeCourseId); // Refresh modal view
                fetchStudents(); // Refresh dues and current course data
                fetchCourses();
            } else {
                alert(data.error || 'فشل التنسيب.');
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Extend Course Days Form
    document.getElementById('extend-course-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateExtendStartDatePattern()) {
            alert('عذراً، تاريخ بدء تمديد الكورس غير متوافق مع نمط التوزيع الأسبوعي المختار للأيام المضافة.');
            return;
        }

        const numDays = document.getElementById('extend-num-days').value;
        const startDate = document.getElementById('extend-start-date').value;
        const scheduleType = document.getElementById('extend-schedule').value;
        const timeStart = document.getElementById('extend-time-start').value;
        const timeEnd = document.getElementById('extend-time-end').value;
        const timeSlot = `${timeStart} - ${timeEnd}`;

        try {
            const res = await fetch(`/api/courses/${activeCourseId}/extend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    num_days: numDays,
                    start_date: startDate,
                    schedule_type: scheduleType,
                    time_slot: timeSlot
                })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert(`تم تمديد الدورة وإضافة ${data.addedCount} محاضرة جديدة بنجاح!`);
                openCourseDetailsModal(activeCourseId); // Refresh modal view
            } else {
                alert(data.error || 'فشل تمديد الكورس.');
            }
        } catch (err) {
            console.error(err);
            alert('حدث خطأ أثناء الاتصال بالسيرفر.');
        }
    });

    // Edit Course Session Form
    document.getElementById('edit-session-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const oldDate = document.getElementById('edit-session-old-date').value;
        const newDate = document.getElementById('edit-session-date').value;
        const timeStart = document.getElementById('edit-session-time-start').value;
        const timeEnd = document.getElementById('edit-session-time-end').value;
        const timeSlot = `${timeStart} - ${timeEnd}`;

        try {
            const res = await fetch(`/api/courses/${activeCourseId}/dates/${oldDate}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newDate,
                    newTimeSlot: timeSlot
                })
            });
            const data = await res.json();
            
            if (res.ok) {
                alert('تم تحديث موعد وتاريخ المحاضرة بنجاح!');
                closeEditSessionModal();
                openCourseDetailsModal(activeCourseId); // Refresh modal view
            } else {
                alert(data.error || 'فشل تحديث المحاضرة.');
            }
        } catch (err) {
            console.error(err);
            alert('حدث خطأ أثناء الاتصال بالسيرفر.');
        }
    });

    // Admin Evaluation Form Submit
    document.getElementById('admin-evaluation-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentId = document.getElementById('sd-student-id').value;
        const interviewerSelectVal = document.getElementById('eval-interviewer').value;
        const interviewerVal = interviewerSelectVal === 'Other'
            ? document.getElementById('eval-interviewer-custom').value
            : interviewerSelectVal;

        const payload = {
            interviewer: interviewerVal,
            suitable_group: document.getElementById('eval-group').value,
            level: document.getElementById('eval-level').value,
            notes: document.getElementById('eval-notes').value,
            is_frozen: document.getElementById('eval-is-frozen').checked
        };

        try {
            const res = await fetch(`/api/students/${studentId}/admin`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                alert('تم تحديث التقييم والمستحقات والتنسيب بنجاح.');
                closeStudentDetailsModal();
                fetchStudents();
                fetchCourses();
            } else {
                alert(data.error || 'فشل التحديث.');
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Create Payment Form Submit
    document.getElementById('payment-creation-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            studentId: document.getElementById('pay-student-select').value,
            amount: document.getElementById('pay-amount').value.replace(/,/g, ''),
            paymentType: document.getElementById('pay-type').value,
            customDescription: document.getElementById('pay-custom-description').value
        };

        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                alert(`تم تسجيل الدفعة بنجاح! رقم الوصل التسلسلي: ${data.paymentId}`);
                document.getElementById('payment-creation-form').reset();
                toggleCustomDescField();
                fetchPayments();
                fetchStudents();
            } else {
                alert(data.error || 'فشل توليد الوصل.');
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Drag and Drop Verification Area
    const dragArea = document.getElementById('verify-drag-area');
    const verifyInput = document.getElementById('verify-file-input');

    dragArea.addEventListener('click', () => verifyInput.click());
    
    dragArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragArea.classList.add('dragover');
    });

    dragArea.addEventListener('dragleave', () => {
        dragArea.classList.remove('dragover');
    });

    dragArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dragArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            verifyReceiptFile(e.dataTransfer.files[0]);
        }
    });

    verifyInput.addEventListener('change', () => {
        if (verifyInput.files.length > 0) {
            verifyReceiptFile(verifyInput.files[0]);
        }
    });

    // Student search filter
    document.getElementById('student-search-input').addEventListener('input', () => {
        filterAndRenderStudents();
    });

    // Payment search filter
    const paymentSearchInput = document.getElementById('payment-search-input');
    if (paymentSearchInput) {
        paymentSearchInput.addEventListener('input', () => {
            filterAndRenderPayments();
        });
    }

    // Auto-format currency inputs with thousands separator commas
    const currencyInputIds = [
        'pay-amount',
        'edit-payment-amount',
        'dues-reg-fee',
        'dues-curriculum-fee',
        'dues-course-fee',
        'dues-installment-amount',
        'custom-dues-amount'
    ];
    currencyInputIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                formatCurrencyInput(input);
            });
        }
    });

    // Edit Payment Form Submit
    document.getElementById('edit-payment-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-payment-id').value;
        const payload = {
            amount: document.getElementById('edit-payment-amount').value.replace(/,/g, ''),
            paymentType: document.getElementById('edit-payment-type').value,
            customDescription: document.getElementById('edit-payment-custom-description').value
        };

        try {
            const res = await fetch(`/api/payments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                alert('تم تحديث بيانات الوصل المالي بنجاح.');
                closePaymentModal();
                fetchPayments();
                fetchStudents();
            } else {
                alert(data.error || 'فشل تحديث الوصل.');
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Mock Data Inject Button Click
    document.getElementById('btn-inject-mock').addEventListener('click', async () => {
        if (!confirm('هل تريد حقن بيانات تجريبية وهمية في قاعدة البيانات؟ سيشمل ذلك دورات تجريبية، طلاب وهميين، وسجلات حضور ووصولات دفع.')) return;
        
        try {
            const res = await fetch('/api/test/mock-data', { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                alert(data.message);
                loadDashboardData();
            } else {
                alert(data.error || 'فشل حقن البيانات التجريبية.');
            }
        } catch (err) {
            console.error(err);
            alert('عطل في الاتصال بالسيرفر.');
        }
    });

    // Clear Database Button Click
    document.getElementById('btn-clear-db').addEventListener('click', async () => {
        if (!confirm('تحذير شديد: هل أنت متأكد من مسح كافة بيانات الطلاب والدورات والوصولات والملفات بالكامل؟ هذا الإجراء لا يمكن التراجع عنه وسيعيد تهيئة النظام لعملية الإطلاق الفعلي.')) return;
        if (!confirm('الرجاء التأكيد للمرة الثانية: هل تريد بالتأكيد تصفير قاعدة البيانات بالكامل؟')) return;
        
        try {
            const res = await fetch('/api/test/clear-db', { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                alert(data.message);
                loadDashboardData();
            } else {
                alert(data.error || 'فشل تصفير قاعدة البيانات.');
            }
        } catch (err) {
            console.error(err);
            alert('عطل في الاتصال بالسيرفر.');
        }
    });

    // Sidebar toggle and backdrop overlay controls
    document.getElementById('toggle-sidebar-btn').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.add('active');
        document.getElementById('sidebar-backdrop').classList.add('active');
    });

    document.getElementById('sidebar-backdrop').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.remove('active');
        document.getElementById('sidebar-backdrop').classList.remove('active');
    });

    // Student Dues Form Submit Listener
    const duesFormEl = document.getElementById('student-dues-form');
    if (duesFormEl) {
        duesFormEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            const studentId = document.getElementById('dues-student-id').value;
            const regFee = document.getElementById('dues-reg-fee').value.replace(/,/g, '');
            const currFee = document.getElementById('dues-curriculum-fee').value.replace(/,/g, '');
            const courseFee = document.getElementById('dues-course-fee').value.replace(/,/g, '');
            const paymentPlan = document.getElementById('dues-payment-plan').value;
            const installmentAmount = document.getElementById('dues-installment-amount').value.replace(/,/g, '');

            if (!studentId) {
                alert('الرجاء تحديد الطالب أولاً.');
                return;
            }

            try {
                const res = await fetch(`/api/students/${studentId}/dues`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reg_fee: regFee,
                        curriculum_fee: currFee,
                        course_fee: courseFee,
                        payment_plan: paymentPlan,
                        installment_amount: installmentAmount
                    })
                });
                const data = await res.json();

                if (res.ok) {
                    alert('تم تحديث المستحقات المالية للطالب بنجاح.');
                    closeBaseDuesModal();
                    fetchStudents(); // Reload students and update table
                } else {
                    alert(data.error || 'فشل تحديث المستحقات المالية.');
                }
            } catch (err) {
                console.error(err);
                alert('حدث خطأ أثناء الاتصال بالسيرفر.');
            }
        });
    }

    // Student Custom Dues Form Submit Listener
    const customDuesFormEl = document.getElementById('student-custom-dues-form');
    if (customDuesFormEl) {
        customDuesFormEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            const studentId = document.getElementById('custom-dues-student-id').value;
            const title = document.getElementById('custom-dues-title').value.trim();
            const amount = document.getElementById('custom-dues-amount').value.replace(/,/g, '');

            if (!studentId) {
                alert('الرجاء تحديد الطالب أولاً.');
                return;
            }

            try {
                const res = await fetch(`/api/students/${studentId}/custom-dues`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, amount })
                });
                const data = await res.json();

                if (res.ok) {
                    alert('تمت إضافة المستحقات المالية الإضافية بنجاح.');
                    document.getElementById('custom-dues-title').value = '';
                    document.getElementById('custom-dues-amount').value = '';
                    fetchStudents(); // Refresh global student balances and tables
                    fetchAndRenderCustomDues(studentId); // Refresh local list
                } else {
                    alert(data.error || 'فشل إضافة المستحقات الإضافية.');
                }
            } catch (err) {
                console.error(err);
                alert('حدث خطأ أثناء الاتصال بالسيرفر.');
            }
        });
    }
}

// ----------------------------------------
// DATA FETCHING & RENDERING FUNCTIONS
// ----------------------------------------

// Fetch Courses list
async function fetchCourses() {
    try {
        const res = await fetch('/api/courses');
        coursesList = await res.json();
        renderCoursesTable(coursesList);
        populateEvalGroupDropdown();
    } catch (err) {
        console.error(err);
    }
}

function renderCoursesTable(courses) {
    const tbody = document.getElementById('courses-table-body');
    tbody.innerHTML = '';
    
    courses.forEach(c => {
        const scheduleStr = c.schedule_type === 'even' ? 'زوجي (سبت/اثنين/أربعاء)' : 'فردي (أحد/ثلاثاء/خميس)';
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.onclick = () => openCourseDetailsModal(c.id);
        
        row.innerHTML = `
            <td>C-${c.id}</td>
            <td><strong>${c.name}</strong></td>
            <td>${c.teacher}</td>
            <td>${scheduleStr}</td>
            <td>${c.time_slot}</td>
            <td>الشهر ${c.month_num}</td>
            <td>${c.curriculum}</td>
        `;
        tbody.appendChild(row);
    });
}

// Fetch Students list
async function fetchStudents() {
    try {
        const res = await fetch('/api/students');
        studentsList = await res.json();
        filterAndRenderStudents();
        populateStudentOptions();
        renderDuesTable();
        checkAdminDuesAlerts(studentsList);
    } catch (err) {
        console.error(err);
    }
}

function renderStudentsTable(students) {
    const tbody = document.getElementById('students-table-body');
    tbody.innerHTML = '';

    students.forEach(s => {
        const totalDue = parseFloat(s.total_due || 0);
        const totalPaid = parseFloat(s.total_paid || 0);
        const balance = totalPaid - totalDue;

        const studyTypeStr = s.study_type === 'in_person' ? 'حضوري' : 'إلكتروني';
        const regDate = new Date(s.created_at).toLocaleDateString('ar-IQ');

        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        if (s.is_frozen) {
            row.classList.add('tr-frozen');
        }
        row.onclick = () => openStudentDetailsModal(s.id);
        
        let balanceHtml = '';
        if (balance > 0) {
            balanceHtml = `<td style="color:var(--success); font-weight:700;">+${balance.toLocaleString()} IQD</td>`;
        } else if (balance < 0) {
            balanceHtml = `<td style="color:var(--danger); font-weight:700;">${balance.toLocaleString()} IQD</td>`;
        } else {
            balanceHtml = `<td style="color:var(--text-muted); font-weight:700;">0 IQD</td>`;
        }

        let courseBadgeHtml = '';
        if (s.current_course_name) {
            courseBadgeHtml = `<td><span class="badge badge-info" style="font-weight:700;"><i class="fa-solid fa-graduation-cap" style="margin-left:4px;"></i>${s.current_course_name}</span></td>`;
        } else {
            courseBadgeHtml = `<td><span class="badge badge-warning" style="background:#fff3cd; color:#856404; border:1px solid #ffe8a1; font-weight:700;"><i class="fa-solid fa-clock-rotate-left" style="margin-left:4px;"></i>قائمة الانتظار</span></td>`;
        }

        const frozenBadgeHtml = s.is_frozen 
            ? `<span class="badge badge-frozen" style="padding: 2px 6px; font-size: 10px; margin-right: 6px;"><i class="fa-solid fa-snowflake"></i> مجمد</span>`
            : '';

        row.innerHTML = `
            <td>S-${s.id}</td>
            <td><strong>${s.name}</strong>${frozenBadgeHtml}</td>
            <td>${s.phone}</td>
            ${courseBadgeHtml}
            <td><span class="badge ${s.study_type === 'in_person' ? 'badge-info' : 'badge-warning'}">${studyTypeStr}</span></td>
            <td>${regDate}</td>
            <td>${totalDue.toLocaleString()} IQD</td>
            <td style="color:var(--success); font-weight:700;">${totalPaid.toLocaleString()} IQD</td>
            ${balanceHtml}
        `;
        tbody.appendChild(row);
    });
}

function populateStudentOptions() {
    const selectPayment = document.getElementById('pay-student-select');
    const selectAssign = document.getElementById('assign-student-select');
    const selectDues = document.getElementById('dues-student-select');
    const selectCustomDues = document.getElementById('custom-dues-student-select');
    
    // Clear
    if (selectPayment) selectPayment.innerHTML = '<option value="">-- اختر الطالب --</option>';
    if (selectAssign) selectAssign.innerHTML = '<option value="">-- اختر الطالب --</option>';
    if (selectDues) selectDues.innerHTML = '<option value="">-- اختر الطالب --</option>';
    if (selectCustomDues) selectCustomDues.innerHTML = '<option value="">-- اختر الطالب --</option>';
    
    studentsList.forEach(s => {
        const natIdStr = s.national_id ? ` | هوية: ${s.national_id}` : '';
        const optionText = `${s.name} (${s.phone}${natIdStr})`;
        
        if (selectPayment) {
            const optPay = document.createElement('option');
            optPay.value = s.id;
            optPay.textContent = optionText;
            optPay.setAttribute('data-name', s.name || '');
            optPay.setAttribute('data-phone', s.phone || '');
            optPay.setAttribute('data-national-id', s.national_id || '');
            selectPayment.appendChild(optPay);
        }

        if (selectAssign) {
            const optAssign = document.createElement('option');
            optAssign.value = s.id;
            const extraStatus = parseInt(s.active_courses_count || 0) > 0 ? ' - (منسوب لكورس نشط)' : '';
            optAssign.textContent = optionText + extraStatus;
            optAssign.setAttribute('data-name', s.name || '');
            optAssign.setAttribute('data-phone', s.phone || '');
            optAssign.setAttribute('data-national-id', s.national_id || '');
            selectAssign.appendChild(optAssign);
        }

        if (selectDues) {
            const optDues = document.createElement('option');
            optDues.value = s.id;
            optDues.textContent = optionText;
            optDues.setAttribute('data-name', s.name || '');
            optDues.setAttribute('data-phone', s.phone || '');
            optDues.setAttribute('data-national-id', s.national_id || '');
            selectDues.appendChild(optDues);
        }

        if (selectCustomDues) {
            const optCustomDues = document.createElement('option');
            optCustomDues.value = s.id;
            optCustomDues.textContent = optionText;
            optCustomDues.setAttribute('data-name', s.name || '');
            optCustomDues.setAttribute('data-phone', s.phone || '');
            optCustomDues.setAttribute('data-national-id', s.national_id || '');
            selectCustomDues.appendChild(optCustomDues);
        }
    });

    // Re-apply filter if search inputs have values
    const paySearch = document.getElementById('pay-student-search');
    if (paySearch && paySearch.value) filterStudentDropdown('pay-student-search', 'pay-student-select');

    const assignSearch = document.getElementById('assign-student-search');
    if (assignSearch && assignSearch.value) filterStudentDropdown('assign-student-search', 'assign-student-select');
}

function filterStudentDropdown(inputId, selectId) {
    const input = document.getElementById(inputId);
    const select = document.getElementById(selectId);
    if (!input || !select) return;

    const query = input.value.toLowerCase().trim();
    const options = select.querySelectorAll('option');

    options.forEach(opt => {
        if (!opt.value) {
            opt.style.display = '';
            return;
        }
        const name = (opt.getAttribute('data-name') || opt.textContent).toLowerCase();
        const phone = opt.getAttribute('data-phone') || '';
        const natId = opt.getAttribute('data-national-id') || '';

        if (name.includes(query) || phone.includes(query) || natId.includes(query)) {
            opt.style.display = '';
        } else {
            opt.style.display = 'none';
        }
    });
}

// Fetch Payments log
async function fetchPayments() {
    try {
        const res = await fetch('/api/payments');
        paymentsList = await res.json();
        filterAndRenderPayments();
    } catch (err) {
        console.error(err);
    }
}

function renderPaymentsTable(payments) {
    const tbody = document.getElementById('payments-table-body');
    tbody.innerHTML = '';

    payments.forEach(p => {
        const dateStr = new Date(p.created_at).toLocaleDateString('ar-IQ') + ' ' + new Date(p.created_at).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
        
        let typeStr = 'أقساط';
        if (p.payment_type === 'full') typeStr = 'دفع كامل';
        if (p.payment_type === 'custom') typeStr = 'مخصص';

        // Check user role for editing/deletion permission (Admin only)
        let actionsHtml = `<span style="font-size:12px; color:var(--text-muted);">مغلق (المسؤولة الإدارية فقط)</span>`;
        if (currentUser.role === 'admin') {
            actionsHtml = `
                <button class="btn btn-secondary btn-sm" onclick="openEditPaymentModal(${p.id})" style="padding:4px 8px; font-size:11px;" title="تعديل الوصل"><i class="fa-solid fa-edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deletePayment(${p.id})" style="padding:4px 8px; font-size:11px;" title="حذف الوصل"><i class="fa-solid fa-trash"></i></button>
            `;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>R-${p.id}</td>
            <td>${dateStr}</td>
            <td><strong>${p.student_name}</strong></td>
            <td><span class="badge badge-info">${typeStr}</span></td>
            <td>${p.custom_description || '-'}</td>
            <td style="font-weight:700; color:var(--primary-color);">${parseFloat(p.amount).toLocaleString()} IQD</td>
            <td>
                <a href="/api/payments/${p.id}/download-student" class="btn btn-outline btn-sm" style="padding:4px 8px; font-size:11px;" download>تحميل نسخة الطالب <i class="fa-solid fa-file-arrow-down"></i></a>
                <a href="/api/payments/${p.id}/download-admin" class="btn btn-secondary btn-sm" style="padding:4px 8px; font-size:11px;" download>المكتب <i class="fa-solid fa-file-invoice"></i></a>
            </td>
            <td>${actionsHtml}</td>
        `;
        tbody.appendChild(row);
    });
}

// ----------------------------------------
// MODAL TRIGGERS
// ----------------------------------------

// Course Modals
function openAddCourseModal() {
    document.getElementById('course-modal-title').textContent = 'إضافة دورة جديدة';
    document.getElementById('course-modal-id').value = '';
    document.getElementById('course-form').reset();
    
    // Set default values
    document.getElementById('course-start-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('course-time-start').value = '10:00';
    document.getElementById('course-time-end').value = '12:00';

    // Reset curriculum fields
    const select = document.getElementById('course-curriculum-select');
    if (select) select.selectedIndex = 0;
    const customInput = document.getElementById('course-curriculum-custom');
    if (customInput) {
        customInput.value = '';
        customInput.style.display = 'none';
        customInput.removeAttribute('required');
    }
    
    validateCourseStartDatePattern();
    document.getElementById('course-modal').classList.add('active');
}

function openEditCourseModal(id) {
    const course = coursesList.find(c => c.id === id);
    if (!course) return;

    document.getElementById('course-modal-title').textContent = 'تعديل بيانات الدورة';
    document.getElementById('course-modal-id').value = course.id;
    document.getElementById('course-name').value = course.name;
    document.getElementById('course-teacher').value = course.teacher;
    document.getElementById('course-schedule').value = course.schedule_type;
    
    // Set start date
    if (course.start_date) {
        document.getElementById('course-start-date').value = course.start_date.split('T')[0];
    }
    validateCourseStartDatePattern();
    
    // Split and set start/end times
    const times = course.time_slot.split(' - ');
    document.getElementById('course-time-start').value = times[0] || '10:00';
    document.getElementById('course-time-end').value = times[1] || '12:00';

    document.getElementById('course-month').value = course.month_num;
    
    // Set curriculum fields
    const select = document.getElementById('course-curriculum-select');
    const customInput = document.getElementById('course-curriculum-custom');
    
    const standardCurriculums = [
        'American English File Starter',
        'American English File 1',
        'American English File 2',
        'American English File 3',
        'American English File 4',
        'American English File 5',
        'IELTS',
        'Family And Friends Starter',
        'Family And Friends 1',
        'Family And Friends 2',
        'Family And Friends 3',
        'Family And Friends 4'
    ];

    if (course.curriculum && standardCurriculums.includes(course.curriculum.trim())) {
        if (select) select.value = course.curriculum.trim();
        if (customInput) {
            customInput.value = '';
            customInput.style.display = 'none';
            customInput.removeAttribute('required');
        }
    } else {
        if (select) select.value = 'Custom Curriculum';
        if (customInput) {
            customInput.value = course.curriculum || '';
            customInput.style.display = 'block';
            customInput.setAttribute('required', 'true');
        }
    }
    
    document.getElementById('course-modal').classList.add('active');
}

function closeCourseModal() {
    document.getElementById('course-modal').classList.remove('active');
}

async function deleteCourse(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الكورس بالكامل؟ سيتم إزالة كافة تنسيبات الطلاب وسجلات حضورهم.')) return;
    try {
        const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
        if (res.ok) {
            closeCourseDetailsModal();
            fetchCourses();
        } else {
            alert('فشل في حذف الكورس.');
        }
    } catch (err) {
        console.error(err);
    }
}

// Calculate 12 lecture dates based on course start date and schedule pattern (even/odd)
function getCourseDates(startDateStr, scheduleType) {
    const dates = [];
    const parts = startDateStr.split('T')[0].split('-');
    let current = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    
    // Day index: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    // even: Sat (6), Mon (1), Wed (3)
    // odd: Sun (0), Tue (2), Thu (4)
    const targetDays = scheduleType === 'even' ? [6, 1, 3] : [0, 2, 4];
    
    while (dates.length < 12) {
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

// Course details and attendance matrix modal
async function openCourseDetailsModal(id) {
    activeCourseId = id;
    document.getElementById('assign-student-form').reset();
    
    try {
        // Fetch course assignments and basic info
        const res = await fetch(`/api/courses/${id}/details`);
        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'تعذر جلب تفاصيل الدورة.');
            return;
        }

        const course = data.course;
        courseStudentsList = data.students.map(st => {
            const mainSt = studentsList.find(s => s.id === st.id);
            return {
                ...st,
                is_frozen: mainSt ? mainSt.is_frozen : st.is_frozen
            };
        });

        // Render Header details
        document.getElementById('cd-teacher').textContent = course.teacher;
        document.getElementById('cd-curriculum').textContent = course.curriculum;
        document.getElementById('cd-time').textContent = course.time_slot;
        document.getElementById('cd-schedule').textContent = course.schedule_type === 'even' ? 'زوجي (سبت/اثنين/أربعاء)' : 'فردي (أحد/ثلاثاء/خميس)';
        const cdMonthEl = document.getElementById('cd-month');
        if (cdMonthEl) cdMonthEl.textContent = `الشهر ${course.month_num}`;
        document.getElementById('course-details-modal-title').textContent = `إدارة كورس: ${course.name}`;

        // Fetch Attendance records
        const attRes = await fetch(`/api/courses/${id}/attendance`);
        const attRecords = await attRes.json();

        // Fetch course dates from database
        const datesRes = await fetch(`/api/courses/${id}/dates`);
        const datesData = await datesRes.json();
        courseSessionsList = datesData;
        allAttendanceDates = datesData.map(d => d.date);

        // Build attendance dates list structure
        // Form structure: { dateStr: { studentId: status } }
        currentAttendanceData = {};
        allAttendanceDates.forEach(date => {
            currentAttendanceData[date] = {};
        });

        // Fill with existing attendance records
        attRecords.forEach(rec => {
            const dateStr = rec.date.split('T')[0];
            if (currentAttendanceData[dateStr]) {
                currentAttendanceData[dateStr][rec.student_id] = rec.status;
            }
        });

        // Set extend form defaults
        document.getElementById('extend-num-days').value = '12';
        document.getElementById('extend-schedule').value = course.schedule_type;
        const times = course.time_slot.split(' - ');
        document.getElementById('extend-time-start').value = times[0] || '10:00';
        document.getElementById('extend-time-end').value = times[1] || '12:00';

        if (allAttendanceDates.length > 0) {
            const lastDateParts = allAttendanceDates[allAttendanceDates.length - 1].split('-');
            const lastDate = new Date(parseInt(lastDateParts[0]), parseInt(lastDateParts[1]) - 1, parseInt(lastDateParts[2]));
            lastDate.setDate(lastDate.getDate() + 1); // next day
            
            const y = lastDate.getFullYear();
            const m = String(lastDate.getMonth() + 1).padStart(2, '0');
            const d = String(lastDate.getDate()).padStart(2, '0');
            document.getElementById('extend-start-date').value = `${y}-${m}-${d}`;
        } else {
            document.getElementById('extend-start-date').value = new Date().toISOString().split('T')[0];
        }

        // Render attendance table
        renderAttendanceSheet();
        
        document.getElementById('course-details-modal').classList.add('active');
    } catch (err) {
        console.error(err);
    }
}

function renderAttendanceSheet() {
    const wrapper = document.getElementById('attendance-sheet-wrapper');
    wrapper.innerHTML = '';

    if (courseStudentsList.length === 0) {
        wrapper.innerHTML = `<div style="padding:30px; text-align:center; color:var(--text-secondary); font-weight:600;">لا يوجد طلاب منسوبين لهذا الكورس حالياً. اختر طالباً لتنسيبه أعلاه.</div>`;
        return;
    }

    const table = document.createElement('table');
    table.className = 'attendance-table';

    // 1. Build Header Row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th>أسماء الطلاب</th>`;
    
    courseSessionsList.forEach((session, index) => {
        const date = session.date;
        const timeSlot = session.time_slot || 'غير محدد';
        
        headerRow.innerHTML += `
            <th style="min-width:110px; text-align:center; vertical-align: top; padding: 10px 5px;">
                <div style="font-weight:800; font-size:12px; color:var(--primary-color);">م.${index + 1}</div>
                <div style="font-size:10px; font-weight:700; margin-top:2px; color:var(--text-primary);">${date}</div>
                <div style="font-size:9px; font-weight:normal; color:var(--text-secondary); margin-top:2px; direction: ltr;">${timeSlot}</div>
                <div style="display:flex; justify-content:center; gap:8px; margin-top:6px; border-top:1px dashed var(--border-color); padding-top:5px;">
                    <a href="javascript:void(0)" onclick="editSessionDate('${date}', '${timeSlot}')" style="color:var(--secondary-color); font-size:11px;" title="تعديل الموعد"><i class="fa-solid fa-pen-to-square"></i></a>
                    <a href="javascript:void(0)" onclick="openPostponeModal('${date}', '${timeSlot}')" style="color:#d97706; font-size:11px;" title="تأجيل المحاضرة"><i class="fa-solid fa-clock-rotate-left"></i></a>
                    <a href="javascript:void(0)" onclick="deleteSessionDate('${date}')" style="color:var(--danger); font-size:11px;" title="حذف المحاضرة"><i class="fa-solid fa-trash-can"></i></a>
                </div>
            </th>
        `;
    });
    
    // Add actions column
    headerRow.innerHTML += `<th>الإجراءات</th>`;
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 2. Build Student Rows
    const tbody = document.createElement('tbody');
    courseStudentsList.forEach(student => {
        const row = document.createElement('tr');
        if (student.is_frozen) {
            row.classList.add('tr-frozen');
        }

        const frozenBadge = student.is_frozen 
            ? `<span class="badge badge-frozen" style="padding:2px 6px; font-size:10px; margin-right:4px;"><i class="fa-solid fa-snowflake"></i> مجمد</span>`
            : '';

        let colsHtml = `<td><strong>${student.name}</strong>${frozenBadge}<br><small style="color:var(--text-muted);">${student.phone}</small></td>`;
        
        // Render cells for each of the 12 dates
        allAttendanceDates.forEach(date => {
            const status = currentAttendanceData[date]?.[student.id] || 'none';

            if (student.is_frozen) {
                if (status === 'present') {
                    colsHtml += `
                        <td>
                            <button class="attendance-btn attendance-present" disabled style="opacity: 0.8; cursor: not-allowed; pointer-events: none;" title="حساب الطالب مجمد (سجل سابق مقفل)">
                                حاضر 🔒
                            </button>
                        </td>
                    `;
                } else if (status === 'absent') {
                    colsHtml += `
                        <td>
                            <button class="attendance-btn attendance-absent" disabled style="opacity: 0.8; cursor: not-allowed; pointer-events: none;" title="حساب الطالب مجمد (سجل سابق مقفل)">
                                غائب 🔒
                            </button>
                        </td>
                    `;
                } else {
                    colsHtml += `
                        <td>
                            <button class="attendance-btn" disabled style="opacity: 0.65; cursor: not-allowed; pointer-events: none; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; font-weight: bold; font-size: 11px;" title="حساب الطالب مجمد، لا يمكن تسجيل حضور أو غياب">
                                <i class="fa-solid fa-snowflake"></i> مجمد
                            </button>
                        </td>
                    `;
                }
            } else {
                let btnClass = 'attendance-none';
                let btnText = 'غير محدد';
                
                if (status === 'present') { btnClass = 'attendance-present'; btnText = 'حاضر'; }
                else if (status === 'absent') { btnClass = 'attendance-absent'; btnText = 'غائب'; }

                colsHtml += `
                    <td>
                        <button class="attendance-btn ${btnClass}" onclick="cycleAttendanceState('${date}', ${student.id}, this)">
                            ${btnText}
                        </button>
                    </td>
                `;
            }
        });

        // Delete student from course button
        colsHtml += `
            <td>
                <button class="btn btn-danger btn-sm" onclick="removeStudentFromCourse(${student.id})" style="padding:4px 8px; font-size:11px;">إزالة <i class="fa-solid fa-user-minus"></i></button>
            </td>
        `;
        row.innerHTML = colsHtml;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);
}

// Cycles cell state: present -> absent -> none -> present
function cycleAttendanceState(dateStr, studentId, btnEl) {
    const student = courseStudentsList.find(s => s.id === studentId) || studentsList.find(s => s.id === studentId);
    if (student && student.is_frozen) {
        alert('عذراً، هذا الطالب حساب مجمد حالياً ولا يمكن تسجيل حضور أو غياب له.');
        return;
    }
    if (!currentAttendanceData[dateStr]) currentAttendanceData[dateStr] = {};
    const currentStatus = currentAttendanceData[dateStr][studentId] || 'none';
    let nextStatus = 'present';

    if (currentStatus === 'present') nextStatus = 'absent';
    else if (currentStatus === 'absent') nextStatus = 'none';

    currentAttendanceData[dateStr][studentId] = nextStatus;

    // Update classes visually
    btnEl.className = 'attendance-btn';
    if (nextStatus === 'present') {
        btnEl.classList.add('attendance-present');
        btnEl.textContent = 'حاضر';
    } else if (nextStatus === 'absent') {
        btnEl.classList.add('attendance-absent');
        btnEl.textContent = 'غائب';
    } else {
        btnEl.classList.add('attendance-none');
        btnEl.textContent = 'غير محدد';
    }
}

// Save all modifications to server
async function saveAttendanceSheet() {
    try {
        const res = await fetch(`/api/courses/${activeCourseId}/attendance-bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                attendanceSheet: currentAttendanceData
            })
        });

        if (res.ok) {
            alert('تم حفظ سجل الحضور والغياب بالكامل بنجاح!');
            openCourseDetailsModal(activeCourseId); // reload modal data
            fetchCourses(); // reload courses list to update month numbers!
        } else {
            alert('فشل في حفظ سجل الحضور.');
        }
    } catch (err) {
        console.error(err);
    }
}

async function removeStudentFromCourse(studentId) {
    if (!confirm('هل تريد إزالة هذا الطالب من هذا الكورس؟ (لن تفقد سجلات الحضور السابقة، ولكن سيتم فك تنسيبه)')) return;
    
    try {
        const res = await fetch(`/api/courses/${activeCourseId}/students/${studentId}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            openCourseDetailsModal(activeCourseId);
            fetchStudents(); // Refresh student dues and current course data
            fetchCourses();
        } else {
            alert('فشل إزالة الطالب.');
        }
    } catch (err) {
        console.error(err);
    }
}

function closeCourseDetailsModal() {
    document.getElementById('course-details-modal').classList.remove('active');
}

// Session (Lecture) edit and delete helper triggers
function editSessionDate(date, timeSlot) {
    document.getElementById('edit-session-old-date').value = date;
    document.getElementById('edit-session-date').value = date;
    
    // Split time slot into start and end inputs
    const times = timeSlot.split(' - ');
    document.getElementById('edit-session-time-start').value = times[0] || '10:00';
    document.getElementById('edit-session-time-end').value = times[1] || '12:00';
    
    document.getElementById('edit-session-modal').classList.add('active');
}

function closeEditSessionModal() {
    document.getElementById('edit-session-modal').classList.remove('active');
}

async function deleteSessionDate(date) {
    if (!confirm(`هل أنت متأكد من حذف محاضرة تاريخ ${date} بالكامل؟ سيتم مسح سجلات حضور هذا اليوم لجميع الطلاب نهائياً ولا يمكن التراجع عن هذا الإجراء.`)) return;
    
    try {
        const res = await fetch(`/api/courses/${activeCourseId}/dates/${date}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        
        if (res.ok) {
            alert('تم حذف المحاضرة وسجلات حضورها بنجاح.');
            openCourseDetailsModal(activeCourseId);
        } else {
            alert(data.error || 'فشل حذف المحاضرة.');
        }
    } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء الاتصال بالسيرفر.');
    }
}

// Student Details & Admin Evaluation Modals
async function openStudentDetailsModal(id) {
    try {
        const res = await fetch(`/api/students/${id}`);
        const data = await res.json();
        
        if (!res.ok) {
            alert(data.error || 'فشل جلب معلومات الطالب.');
            return;
        }

        const student = data.student;

        // Render Student Info panel
        const sdAvatarImgEl = document.getElementById('sd-avatar-img');
        const sdAvatarInitialEl = document.getElementById('sd-avatar-initial');
        if (sdAvatarImgEl && sdAvatarInitialEl) {
            if (student.photo_path) {
                sdAvatarImgEl.src = student.photo_path;
                sdAvatarImgEl.style.display = 'block';
                sdAvatarInitialEl.style.display = 'none';
            } else {
                sdAvatarImgEl.style.display = 'none';
                sdAvatarInitialEl.style.display = 'block';
                sdAvatarInitialEl.textContent = student.name.charAt(0);
            }
        }
        document.getElementById('sd-name').textContent = student.name;
        document.getElementById('sd-level').textContent = `مستوى الطالب: ${student.level}`;
        document.getElementById('sd-phone').textContent = student.phone;
        document.getElementById('sd-national-id').textContent = student.national_id;
        
        const dobStr = student.dob ? student.dob.split('T')[0] : '';
        document.getElementById('sd-dob-pob').textContent = `${dobStr} (${student.pob})`;
        document.getElementById('sd-dob-pob').setAttribute('data-raw-dob', dobStr);
        document.getElementById('sd-dob-pob').setAttribute('data-raw-pob', student.pob || '');
        
        document.getElementById('sd-qualification').textContent = student.qualification;
        document.getElementById('sd-address').textContent = student.address;
        document.getElementById('sd-purpose').textContent = student.purpose;
        
        const periodStr = student.period === 'morning' ? 'صباحي' : student.period === 'afternoon' ? 'عصري' : 'مسائي';
        const typeStr = student.study_type === 'in_person' ? 'حضوري' : 'إلكتروني';
        document.getElementById('sd-period-type').textContent = `${periodStr} - ${typeStr}`;
        document.getElementById('sd-period-type').setAttribute('data-raw-period', student.period || 'morning');
        document.getElementById('sd-period-type').setAttribute('data-raw-study-type', student.study_type || 'in_person');
        document.getElementById('sd-referral').textContent = student.referral;

        // Current assigned course status check
        const currentCourseEl = document.getElementById('sd-current-course');
        if (currentCourseEl) {
            const assignedCourses = data.courses || [];
            if (assignedCourses.length === 0) {
                currentCourseEl.innerHTML = '<span class="badge badge-warning" style="font-size:11px; padding:3px 6px;">قائمة الانتظار (Waiting List)</span>';
            } else {
                currentCourseEl.textContent = assignedCourses.map(c => c.name).join(', ');
            }
        }

        // Show/hide Personal Edit Button (Manager and Admin only)
        const editBtnContainer = document.getElementById('manager-edit-btn-container');
        if (editBtnContainer) {
            editBtnContainer.style.display = currentUser && (currentUser.role === 'manager' || currentUser.role === 'admin') ? 'block' : 'none';
        }
        toggleStudentPersonalEdit(false);

        // Fill Admin Fields
        document.getElementById('sd-student-id').value = student.id;
        const interviewerSelect = document.getElementById('eval-interviewer');
        const interviewerCustom = document.getElementById('eval-interviewer-custom');
        if (interviewerSelect) {
            const standardInterviewerNames = ['محمد عمار ابراهيم', 'شموع محمد صاحب'];
            const interviewerVal = student.interviewer ? student.interviewer.trim() : '';
            
            if (interviewerVal === '') {
                interviewerSelect.value = '';
                if (interviewerCustom) {
                    interviewerCustom.value = '';
                    interviewerCustom.style.display = 'none';
                    interviewerCustom.removeAttribute('required');
                }
            } else if (standardInterviewerNames.includes(interviewerVal)) {
                interviewerSelect.value = interviewerVal;
                if (interviewerCustom) {
                    interviewerCustom.value = '';
                    interviewerCustom.style.display = 'none';
                    interviewerCustom.removeAttribute('required');
                }
            } else {
                interviewerSelect.value = 'Other';
                if (interviewerCustom) {
                    interviewerCustom.value = interviewerVal;
                    interviewerCustom.style.display = 'block';
                    interviewerCustom.setAttribute('required', 'true');
                }
            }
        }

        const groupSelect = document.getElementById('eval-group');
        if (groupSelect) {
            populateEvalGroupDropdown();
            const targetGroup = student.current_course_name || student.suitable_group || 'قائمة الانتظار';
            groupSelect.value = targetGroup;
            if (groupSelect.selectedIndex === -1) {
                const opt = document.createElement('option');
                opt.value = targetGroup;
                opt.textContent = targetGroup + ' (كورس سابق)';
                groupSelect.appendChild(opt);
                groupSelect.value = targetGroup;
            }
        }
        document.getElementById('eval-level').value = student.level || 'غير محدد';
        document.getElementById('eval-notes').value = student.notes || '';
        const frozenEl = document.getElementById('eval-is-frozen');
        if (frozenEl) frozenEl.checked = !!student.is_frozen;

        // Financials Summary in modal
        const due = parseFloat(student.total_due || 0);
        const paid = parseFloat(student.total_paid || 0);
        document.getElementById('sd-financial-due').textContent = due.toLocaleString();
        document.getElementById('sd-financial-paid').textContent = paid.toLocaleString();
        const balEl = document.getElementById('sd-financial-balance');
        const balVal = paid - due;
        if (balVal > 0) {
            balEl.textContent = `+${balVal.toLocaleString()}`;
            balEl.style.color = 'var(--success)';
        } else if (balVal < 0) {
            balEl.textContent = balVal.toLocaleString();
            balEl.style.color = 'var(--danger)';
        } else {
            balEl.textContent = '0';
            balEl.style.color = 'var(--text-muted)';
        }

        document.getElementById('student-details-modal').classList.add('active');
    } catch (err) {
        console.error(err);
    }
}

function closeStudentDetailsModal() {
    document.getElementById('student-details-modal').classList.remove('active');
}

// Payment/Receipt Form controls
function toggleCustomDescField() {
    const type = document.getElementById('pay-type').value;
    const group = document.getElementById('custom-desc-group');
    if (type === 'custom') {
        group.style.display = 'block';
        document.getElementById('pay-custom-description').setAttribute('required', 'true');
    } else {
        group.style.display = 'none';
        document.getElementById('pay-custom-description').removeAttribute('required');
    }
}

function toggleEditCustomDescField() {
    const type = document.getElementById('edit-payment-type').value;
    const group = document.getElementById('edit-custom-desc-group');
    if (type === 'custom') {
        group.style.display = 'block';
        document.getElementById('edit-payment-custom-description').setAttribute('required', 'true');
    } else {
        group.style.display = 'none';
        document.getElementById('edit-payment-custom-description').removeAttribute('required');
    }
}

// Edit Receipt (Manager Only)
function openEditPaymentModal(id) {
    // Note: this function will only be triggered for manager roles due to frontend restriction
    fetch(`/api/payments`)
        .then(res => res.json())
        .then(payments => {
            const payment = payments.find(p => p.id === id);
            if (!payment) return;

            document.getElementById('edit-payment-id').value = payment.id;
            document.getElementById('edit-payment-student-name').value = payment.student_name;
            const amountVal = Math.round(parseFloat(payment.amount) || 0);
            document.getElementById('edit-payment-amount').value = amountVal.toLocaleString();
            document.getElementById('edit-payment-type').value = payment.payment_type;
            document.getElementById('edit-payment-custom-description').value = payment.custom_description || '';
            
            toggleEditCustomDescField();
            document.getElementById('payment-modal').classList.add('active');
        });
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('active');
}

async function deletePayment(id) {
    if (!confirm('تحذير: هل أنت متأكد من حذف هذا الوصل بالكامل؟ سيتم إعادة خصم قيمة الوصل من سجل مدفوعات الطالب.')) return;
    try {
        const res = await fetch(`/api/payments/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('تم حذف الوصل وإعادة تحديث مستحقات الطالب بنجاح.');
            fetchPayments();
            fetchStudents();
        } else {
            alert('فشل حذف الوصل.');
        }
    } catch (err) {
        console.error(err);
    }
}

// Verify student PDF Receipt File
async function verifyReceiptFile(file) {
    const resultBox = document.getElementById('verify-result-box');
    resultBox.style.display = 'block';
    resultBox.innerHTML = `<div style="padding:15px; text-align:center; color:var(--text-secondary); font-weight:600;"><i class="fa-solid fa-spinner fa-spin"></i> جاري قراءة الملف والتحقق من التوقيع الرقمي...</div>`;

    const formData = new FormData();
    formData.append('receipt', file);

    try {
        const res = await fetch('/api/payments/verify-pdf', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (data.valid) {
            resultBox.innerHTML = `
                <div class="verification-result verification-valid">
                    <div class="verification-title"><i class="fa-solid fa-circle-check"></i> الوصل موثوق وسليم 100%</div>
                    <p style="font-size:12px; margin-bottom:5px;">هذا الملف يطابق بيانات التسجيل الرسمية بالنظام ولم يتعرض لأي تعديل خارجي.</p>
                    <ul class="verification-details">
                        <li>الرقم التسلسلي: <span>R-${data.details.serial}</span></li>
                        <li>اسم الطالب: <span>${data.details.studentName}</span></li>
                        <li>المبلغ المدفوع: <span>${parseFloat(data.details.amount).toLocaleString()} IQD</span></li>
                        <li>تاريخ المعاملة: <span>${data.details.dateStr}</span></li>
                        <li>نوع الدفع: <span>${data.details.paymentType === 'full' ? 'دفع كامل' : data.details.paymentType === 'installment' ? 'أقساط' : 'مخصص'}</span></li>
                        <li>وصف الدفعة: <span>${data.details.description || 'لا يوجد'}</span></li>
                    </ul>
                </div>
            `;
        } else {
            resultBox.innerHTML = `
                <div class="verification-result verification-invalid">
                    <div class="verification-title"><i class="fa-solid fa-triangle-exclamation"></i> تحذير: الوصل غير صالح أو تم التعديل عليه!</div>
                    <p style="font-size:13px; font-weight:500;">سبب الرفض: ${data.reason}</p>
                </div>
            `;
        }
    } catch (err) {
        console.error(err);
        resultBox.innerHTML = `<div class="verification-result verification-invalid"><div class="verification-title">فشل التحقق بسبب عطل فني في الاتصال بالسيرفر.</div></div>`;
    }
}

// ----------------------------------------
// STUDENT PANEL HANDLERS (STUDENT PORTAL)
// ----------------------------------------

async function fetchStudentDashboard(studentId) {
    try {
        const res = await fetch(`/api/students/${studentId}`);
        const data = await res.json();
        
        if (!res.ok) {
            alert('فشل جلب بيانات لوحة الطالب.');
            return;
        }

        const student = data.student;
        const courses = data.courses;
        const payments = data.payments;

        // Render welcome banner details
        const welcomeNameEl = document.getElementById('stu-display-name');
        if (welcomeNameEl) welcomeNameEl.textContent = student.name;
        
        const stuAvatarImgEl = document.getElementById('stu-avatar-img');
        const stuAvatarInitialEl = document.getElementById('stu-avatar-initial');
        if (stuAvatarImgEl && stuAvatarInitialEl) {
            if (student.photo_path) {
                stuAvatarImgEl.src = student.photo_path;
                stuAvatarImgEl.style.display = 'block';
                stuAvatarInitialEl.style.display = 'none';
            } else {
                stuAvatarImgEl.style.display = 'none';
                stuAvatarInitialEl.style.display = 'block';
                stuAvatarInitialEl.textContent = student.name ? student.name.trim().charAt(0) : 'أ';
            }
        }

        // Render Stats
        const totalDue = parseFloat(student.total_due || 0);
        const totalPaid = parseFloat(student.total_paid || 0);
        const balance = totalPaid - totalDue;

        document.getElementById('stu-total-due').textContent = `${totalDue.toLocaleString()} IQD`;
        document.getElementById('stu-total-paid').textContent = `${totalPaid.toLocaleString()} IQD`;
        
        const balEl = document.getElementById('stu-balance');
        if (balance > 0) {
            balEl.textContent = `+${balance.toLocaleString()} IQD`;
            balEl.style.color = 'var(--success)';
        } else if (balance < 0) {
            balEl.textContent = `${balance.toLocaleString()} IQD`;
            balEl.style.color = 'var(--danger)';
        } else {
            balEl.textContent = `0 IQD`;
            balEl.style.color = 'var(--text-muted)';
        }

        // Installment Details Card & Warning Checks for Student Portal
        const installmentCard = document.getElementById('stu-installment-card');
        const installmentWarning = document.getElementById('stu-installment-warning');
        
        if (installmentCard) {
            if (student.payment_plan === 'installment') {
                const instAmount = parseFloat(student.installment_amount || 0);
                document.getElementById('stu-next-installment').textContent = `${instAmount.toLocaleString()} IQD`;
                installmentCard.style.display = 'flex';
                
                // Calculate warnings
                const attCount = parseInt(data.attendanceCount || 0);
                const currentMonthIndex = Math.floor(attCount / 12) + 1;
                const sessionsInCurrentMonth = attCount % 12;
                const expectedPaymentTotal = currentMonthIndex * instAmount;
                
                if (sessionsInCurrentMonth >= 9 && totalPaid < expectedPaymentTotal) {
                    const isCritical = sessionsInCurrentMonth >= 11;
                    const warnIcon = isCritical ? '🚨' : '⚠️';
                    const warnClass = isCritical ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)';
                    const warnBorder = isCritical ? 'var(--danger)' : 'var(--warning)';
                    const warnTitle = isCritical ? 'إنذار سداد القسط الشهري (حرج)' : 'تنبيه استحقاق القسط الشهري';
                    
                    installmentWarning.innerHTML = `
                        <div style="background: ${warnClass}; border: 1.5px solid ${warnBorder}; padding: 16px 20px; border-radius: 12px; color: var(--text-primary); text-align: right; animation: fadeIn 0.4s ease; direction: rtl;">
                            <strong style="color:${warnBorder}; font-size: 15px;">${warnIcon} ${warnTitle}:</strong> 
                            لقد أكملت <strong>${sessionsInCurrentMonth} محاضرات من أصل 12 محاضرة</strong> لهذا الشهر. يرجى تسديد قسط هذا الشهر البالغ <strong>${instAmount.toLocaleString()} IQD</strong> للإدارة لتفادي تعليق الحساب.
                        </div>
                    `;
                    installmentWarning.style.display = 'block';
                } else {
                    installmentWarning.style.display = 'none';
                }
            } else {
                installmentCard.style.display = 'none';
                installmentWarning.style.display = 'none';
            }
        }

        // Render assigned Course Info
        const courseBox = document.getElementById('stu-course-info-box');
        if (courses.length === 0) {
            courseBox.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p style="margin-bottom: 12px; font-weight: bold; color: var(--danger);">
                        حالة التنسيب: <span class="badge badge-warning" style="font-size: 12px; padding: 4px 8px;">قائمة الانتظار (Waiting List)</span>
                    </p>
                    <p style="color: var(--text-muted); font-size: 13px; line-height: 1.6;">
                        أنت غير منسوب لأي كورس نشط حالياً. يرجى الانتظار حتى تقوم الإدارة بتنسيبك لشعبة دراسية.
                    </p>
                </div>
            `;
        } else {
            const course = courses[0]; // Student's primary course
            const scheduleStr = course.schedule_type === 'even' ? 'زوجي (السبت، الاثنين، الأربعاء)' : 'فردي (الأحد، الثلاثاء، الخميس)';
            courseBox.innerHTML = `
                <div style="font-size:14px; color:var(--text-primary);">
                    <p style="margin-bottom:10px;"><strong>اسم الكورس:</strong> ${course.name}</p>
                    <p style="margin-bottom:10px;"><strong>المعلم:</strong> ${course.teacher}</p>
                    <p style="margin-bottom:10px;"><strong>المنهج الدراسي:</strong> ${course.curriculum}</p>
                    <p style="margin-bottom:10px;"><strong>المواعيد:</strong> ${scheduleStr}</p>
                    <p style="margin-bottom:10px;"><strong>التوقيت:</strong> ${course.time_slot}</p>
                    <p style="margin-bottom:10px;"><strong>الشهر الحالي بالدورة:</strong> الشهر ${course.month_num}</p>
                </div>
            `;

            // Fetch attendance for this specific course
            fetchStudentAttendance(course.id, studentId);
        }

        // Render student payments log table
        const tbody = document.getElementById('stu-payments-table-body');
        tbody.innerHTML = '';

        if (payments.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">لا توجد أي وصولات دفع صادرة لك حتى الآن.</td></tr>`;
        } else {
            payments.forEach(p => {
                const dateStr = new Date(p.created_at).toLocaleDateString('ar-IQ');
                
                let typeStr = 'أقساط';
                if (p.payment_type === 'full') typeStr = 'دفع كامل';
                if (p.payment_type === 'custom') typeStr = 'مخصص';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>R-${p.id}</td>
                    <td>${dateStr}</td>
                    <td><span class="badge badge-info">${typeStr}</span></td>
                    <td>${p.custom_description || '-'}</td>
                    <td style="font-weight:700;">${parseFloat(p.amount).toLocaleString()} IQD</td>
                    <td>
                        <a href="/api/payments/${p.id}/download-student" class="btn btn-secondary btn-sm" style="padding: 4px 8px; font-size:11px;" download>تحميل نسخة الوصل PDF <i class="fa-solid fa-file-arrow-down"></i></a>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }

    } catch (err) {
        console.error(err);
    }
}

async function fetchStudentAttendance(courseId, studentId) {
    try {
        const res = await fetch(`/api/courses/${courseId}/attendance`);
        const records = await res.json();

        // Filter for this student (handle loose comparisons and undefined fields)
        const myAttendance = records.filter(r => r.student_id == null || r.student_id == studentId);
        
        // Count Present vs Absent
        let presentCount = 0;
        let absentCount = 0;

        const tbody = document.getElementById('stu-attendance-table-body');
        tbody.innerHTML = '';

        myAttendance.forEach(rec => {
            const dateStr = rec.date.split('T')[0];
            const isPresent = rec.status === 'present';
            
            if (isPresent) presentCount++;
            else absentCount++;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dateStr}</td>
                <td>
                    <span class="badge ${isPresent ? 'badge-success' : 'badge-danger'}">
                        ${isPresent ? 'حاضر' : 'غائب'}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });

        document.getElementById('stu-present-count').textContent = presentCount;
        document.getElementById('stu-absent-count').textContent = absentCount;

    } catch (err) {
        console.error(err);
    }
}

function filterAndRenderDues() {
    const searchInput = document.getElementById('dues-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let filtered = studentsList;
    if (query) {
        filtered = filtered.filter(s => 
            (s.name && s.name.toLowerCase().includes(query)) ||
            (s.phone && s.phone.includes(query)) ||
            (s.national_id && s.national_id.includes(query))
        );
    }
    renderDuesTable(filtered);
}

// Renders the student financial dues status table
function renderDuesTable(studentsToRender) {
    const tbody = document.getElementById('dues-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const list = studentsToRender || studentsList;

    list.forEach(s => {
        const regFee = parseFloat(s.reg_fee || 0);
        const currFee = parseFloat(s.curriculum_fee || 0);
        const courseFee = parseFloat(s.course_fee || 0);
        const totalDue = parseFloat(s.total_due || 0);
        const totalPaid = parseFloat(s.total_paid || 0);
        const balance = totalPaid - totalDue;

        let balanceHtml = '';
        if (balance > 0) {
            balanceHtml = `<td style="color:var(--success); font-weight:700;">+${balance.toLocaleString()} IQD</td>`;
        } else if (balance < 0) {
            balanceHtml = `<td style="color:var(--danger); font-weight:700;">${balance.toLocaleString()} IQD</td>`;
        } else {
            balanceHtml = `<td style="color:var(--text-muted); font-weight:700;">0 IQD</td>`;
        }

        // Calculate and render monthly installment warning indicators
        let warningHtml = '';
        if (s.payment_plan === 'installment') {
            const attCount = parseInt(s.attendance_count || 0);
            const instAmount = parseFloat(s.installment_amount || 0);
            
            const currentMonthIndex = Math.floor(attCount / 12) + 1;
            const sessionsInCurrentMonth = attCount % 12;
            const expectedPaymentTotal = currentMonthIndex * instAmount;

            if (sessionsInCurrentMonth >= 9 && totalPaid < expectedPaymentTotal) {
                const badgeClass = sessionsInCurrentMonth >= 11 ? 'badge-danger' : 'badge-warning';
                const labelText = sessionsInCurrentMonth >= 11 ? 'قسط متأخر (حرج)' : 'قسط مستحق قريباً';
                warningHtml = `<br><span class="badge ${badgeClass}" style="font-size: 10px; padding: 2px 6px; margin-top: 4px; display:inline-block;">${labelText} (${sessionsInCurrentMonth}/12 محاضرة)</span>`;
            } else {
                warningHtml = `<br><span class="badge badge-success" style="font-size: 10px; padding: 2px 6px; margin-top: 4px; background: rgba(16, 185, 129, 0.1); color: var(--success); display:inline-block;">أقساط - مسدد للشهر الحالي</span>`;
            }
        } else {
            warningHtml = `<br><span class="badge badge-info" style="font-size: 10px; padding: 2px 6px; margin-top: 4px; background: rgba(59, 130, 246, 0.1); color: var(--info); display:inline-block;">نظام الدفع: كاش بالكامل</span>`;
        }

        const natIdStr = s.national_id ? `<br><small style="color:var(--text-muted);">هوية: ${s.national_id}</small>` : '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${s.name}</strong><br><small style="color:var(--text-muted);">${s.phone}</small>${natIdStr}${warningHtml}</td>
            <td>${(regFee + currFee).toLocaleString()} IQD</td>
            <td>${courseFee.toLocaleString()} IQD</td>
            <td style="font-weight:700;">${totalDue.toLocaleString()} IQD</td>
            <td style="color:var(--success); font-weight:700;">${totalPaid.toLocaleString()} IQD</td>
            ${balanceHtml}
            <td style="text-align: center;">
                <button class="btn btn-primary btn-sm" onclick="openBaseDuesModal(${s.id})" style="padding: 6px 10px; font-size: 11px; margin-left: 5px; border-radius: 6px;">
                    <i class="fa-solid fa-file-invoice-dollar"></i> المستحقات الأساسية
                </button>
                <button class="btn btn-success btn-sm" onclick="openCustomDuesModal(${s.id})" style="padding: 6px 10px; font-size: 11px; border-radius: 6px;">
                    <i class="fa-solid fa-plus-circle"></i> المستحقات الإضافية
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Fetch and render custom dues list for selected student
async function fetchAndRenderCustomDues(studentId) {
    const container = document.getElementById('custom-dues-list-container');
    const tbody = document.getElementById('custom-dues-list-body');
    if (!tbody || !container) return;

    try {
        const res = await fetch(`/api/students/${studentId}/custom-dues`);
        const dues = await res.json();

        if (res.ok) {
            tbody.innerHTML = '';
            if (dues.length === 0) {
                container.style.display = 'none';
                return;
            }

            dues.forEach(d => {
                const dateStr = new Date(d.created_at).toLocaleDateString('ar-IQ');
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${d.title}</strong></td>
                    <td style="font-weight: 700; color: var(--danger);">${parseFloat(d.amount).toLocaleString()} IQD</td>
                    <td>${dateStr}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteCustomDue(${studentId}, ${d.id})" style="padding: 4px 8px; font-size: 11px;">
                            حذف <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            container.style.display = 'block';
        } else {
            console.error('Failed to load custom dues:', dues.error);
        }
    } catch (err) {
        console.error(err);
    }
}

// Delete custom due
async function deleteCustomDue(studentId, dueId) {
    if (!confirm('هل أنت متأكد من حذف هذه المستحقات الإضافية؟ سيتأثر إجمالي المستحقات للطالب تبعاً لذلك.')) return;

    try {
        const res = await fetch(`/api/students/${studentId}/custom-dues/${dueId}`, {
            method: 'DELETE'
        });
        const data = await res.json();

        if (res.ok) {
            alert('تم حذف المستحقات الإضافية بنجاح.');
            fetchStudents(); // Refresh global balances and tables
            fetchAndRenderCustomDues(studentId); // Refresh local list
        } else {
            alert(data.error || 'فشل حذف المستحقات.');
        }
    } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء الاتصال بالسيرفر.');
    }
}

// Base Dues Modal Controls
function toggleInstallmentInput(plan) {
    const group = document.getElementById('dues-installment-amount-group');
    if (!group) return;
    if (plan === 'installment') {
        group.style.display = 'block';
    } else {
        group.style.display = 'none';
        const amountInput = document.getElementById('dues-installment-amount');
        if (amountInput) amountInput.value = 0;
    }
}

function openBaseDuesModal(studentId) {
    const student = studentsList.find(s => s.id === studentId);
    if (!student) return;

    document.getElementById('dues-student-id').value = student.id;
    document.getElementById('base-dues-student-name').textContent = student.name;
    const mergedRegAndCurr = Math.round(student.reg_fee || 0) + Math.round(student.curriculum_fee || 0);
    document.getElementById('dues-reg-fee').value = mergedRegAndCurr.toLocaleString();
    document.getElementById('dues-curriculum-fee').value = '0';
    document.getElementById('dues-course-fee').value = Math.round(student.course_fee || 0).toLocaleString();

    // Populate plan inputs
    const plan = student.payment_plan || 'cash';
    const planSelect = document.getElementById('dues-payment-plan');
    if (planSelect) planSelect.value = plan;

    const amountInput = document.getElementById('dues-installment-amount');
    if (amountInput) amountInput.value = Math.round(student.installment_amount || 0).toLocaleString();

    toggleInstallmentInput(plan);

    document.getElementById('base-dues-modal').classList.add('active');
}

function closeBaseDuesModal() {
    document.getElementById('base-dues-modal').classList.remove('active');
}

// Custom Dues Modal Controls
function openCustomDuesModal(studentId) {
    const student = studentsList.find(s => s.id === studentId);
    if (!student) return;

    document.getElementById('custom-dues-student-id').value = student.id;
    document.getElementById('custom-dues-student-name').textContent = student.name;
    document.getElementById('custom-dues-title').value = '';
    document.getElementById('custom-dues-amount').value = '';

    fetchAndRenderCustomDues(student.id);

    document.getElementById('custom-dues-modal').classList.add('active');
}

function closeCustomDuesModal() {
    document.getElementById('custom-dues-modal').classList.remove('active');
}

// Club Policy Modal Controls
function openPolicyModal() {
    document.getElementById('policy-modal').classList.add('active');
}

function closePolicyModal() {
    document.getElementById('policy-modal').classList.remove('active');
}

// Standalone Notifications Page Controller
let allDuesAlerts = [];
let currentNotifFilter = 'all';

function checkAdminDuesAlerts(students) {
    const oldContainer = document.getElementById('admin-alerts-container');
    if (oldContainer) oldContainer.style.display = 'none';

    allDuesAlerts = [];
    if (!['manager', 'admin', 'teacher'].includes(currentUser.role)) {
        updateNotificationBadge(0);
        return;
    }

    students.forEach(s => {
        if (s.payment_plan === 'installment') {
            const attCount = parseInt(s.attendance_count || 0);
            const instAmount = parseFloat(s.installment_amount || 0);
            const totalPaid = parseFloat(s.total_paid || 0);
            
            // Calculate warning conditions
            const currentMonthIndex = Math.floor(attCount / 12) + 1;
            const sessionsInCurrentMonth = attCount % 12;
            const expectedPaymentTotal = currentMonthIndex * instAmount;
            
            if (sessionsInCurrentMonth >= 9 && totalPaid < expectedPaymentTotal) {
                const isCritical = sessionsInCurrentMonth >= 11;
                allDuesAlerts.push({
                    student: s,
                    sessions: sessionsInCurrentMonth,
                    amount: instAmount,
                    monthNum: currentMonthIndex,
                    isCritical: isCritical
                });
            }
        }
    });

    updateNotificationBadge(allDuesAlerts.length);
    renderNotificationStats();
    filterAndRenderNotifications();
}

function updateNotificationBadge(count) {
    const badge = document.getElementById('notifications-count-badge');
    if (!badge) return;
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function renderNotificationStats() {
    const criticalCount = allDuesAlerts.filter(a => a.isCritical).length;
    const upcomingCount = allDuesAlerts.filter(a => !a.isCritical).length;
    const totalAmount = allDuesAlerts.reduce((sum, a) => sum + a.amount, 0);

    const critEl = document.getElementById('notif-stat-critical');
    const upcomEl = document.getElementById('notif-stat-upcoming');
    const totEl = document.getElementById('notif-stat-total-amount');

    if (critEl) critEl.textContent = criticalCount;
    if (upcomEl) upcomEl.textContent = upcomingCount;
    if (totEl) totEl.textContent = totalAmount.toLocaleString() + ' IQD';
}

function setNotifFilter(filterType) {
    currentNotifFilter = filterType;
    const buttons = document.querySelectorAll('.btn-notif-filter');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-secondary)';
        btn.style.fontWeight = 'normal';
    });

    let activeBtn;
    if (filterType === 'all') activeBtn = buttons[0];
    else if (filterType === 'critical') activeBtn = buttons[1];
    else if (filterType === 'upcoming') activeBtn = buttons[2];

    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'var(--primary-color)';
        activeBtn.style.color = '#fff';
        activeBtn.style.fontWeight = 'bold';
    }

    filterAndRenderNotifications();
}

function filterAndRenderNotifications() {
    const cardsContainer = document.getElementById('notifications-cards-container');
    const emptyState = document.getElementById('notifications-empty-state');
    if (!cardsContainer) return;

    const searchInput = document.getElementById('notif-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let filtered = allDuesAlerts;

    if (currentNotifFilter === 'critical') {
        filtered = filtered.filter(a => a.isCritical);
    } else if (currentNotifFilter === 'upcoming') {
        filtered = filtered.filter(a => !a.isCritical);
    }

    if (query) {
        filtered = filtered.filter(a => 
            (a.student.name && a.student.name.toLowerCase().includes(query)) ||
            (a.student.phone && a.student.phone.includes(query)) ||
            (a.student.national_id && a.student.national_id.includes(query))
        );
    }

    if (filtered.length === 0) {
        cardsContainer.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    let html = '';
    filtered.forEach(item => {
        const s = item.student;
        const badgeBg = item.isCritical ? 'background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5;' : 'background: #fff3cd; color: #856404; border: 1px solid #ffe8a1;';
        const urgencyText = item.isCritical ? '🚨 قسط متأخر جداً (حرج)' : '⚠️ قرب انتهاء الشهر الحالي';
        const courseName = s.current_course_name || s.suitable_group || 'غير محدد';
        const avatarUrl = s.photo_path || '/images/default_student.png';

        html += `
            <div style="background: var(--bg-card); border: 1.5px solid ${item.isCritical ? 'var(--danger)' : 'var(--warning)'}; border-radius: var(--border-radius-md); padding: 18px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="${avatarUrl}" onerror="this.src='/images/default_student.png'" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);">
                            <div>
                                <h4 style="margin: 0; font-size: 15px; color: var(--text-primary); font-weight: bold;">${s.name}</h4>
                                <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;"><i class="fa-solid fa-phone" style="margin-left: 4px;"></i>${s.phone}</div>
                            </div>
                        </div>
                        <span style="${badgeBg} font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 6px;">${urgencyText}</span>
                    </div>

                    <div style="background: rgba(0,0,0,0.03); padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span style="color: var(--text-secondary);">الكورس الحالي:</span>
                            <strong style="color: var(--primary-color);">${courseName}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                            <span style="color: var(--text-secondary);">تقدم المحاضرات:</span>
                            <strong>${item.sessions} / 12 محاضرة (الشهر ${item.monthNum})</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">المبلغ المطلوب تسديده:</span>
                            <strong style="color: var(--danger); font-size: 14px;">${item.amount.toLocaleString()} IQD</strong>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="btn btn-primary btn-sm" onclick="openPaymentModalWithStudent(${s.id})" style="flex: 1; font-size: 12px; padding: 6px 10px; display: flex; align-items: center; justify-content: center; gap: 5px;">
                        <i class="fa-solid fa-plus-circle"></i> تسجيل دفع القسط
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="openStudentDetailsModal(${s.id})" style="font-size: 12px; padding: 6px 10px;" title="عرض الملف">
                        <i class="fa-solid fa-user"></i>
                    </button>
                    <a href="tel:${s.phone}" class="btn btn-outline btn-sm" style="font-size: 12px; padding: 6px 10px; color: var(--success); border-color: var(--success);" title="اتصال بالتلفون">
                        <i class="fa-solid fa-phone"></i>
                    </a>
                </div>
            </div>
        `;
    });

    cardsContainer.innerHTML = html;
}

function openPaymentModalWithStudent(studentId) {
    switchTab('tab-payments');
    const select = document.getElementById('pay-student-select');
    if (select) {
        select.value = studentId;
    }
}

function toggleCustomCurriculumInput(value) {
    const customInput = document.getElementById('course-curriculum-custom');
    if (!customInput) return;
    if (value === 'Custom Curriculum') {
        customInput.style.display = 'block';
        customInput.setAttribute('required', 'true');
    } else {
        customInput.style.display = 'none';
        customInput.removeAttribute('required');
        customInput.value = '';
    }
}

// Postpone session modals and logic
function openPostponeModal(date, timeSlot) {
    document.getElementById('postpone-session-date').value = date;
    document.getElementById('postpone-session-label').textContent = `${date} (${timeSlot})`;
    
    // Reset inputs
    document.querySelector('input[name="postpone-method"][value="shift"]').checked = true;
    togglePostponeFields('shift');
    
    // Set default new time slot from old
    const times = timeSlot.split(' - ');
    document.getElementById('postpone-time-start').value = times[0] || '10:00';
    document.getElementById('postpone-time-end').value = times[1] || '12:00';
    
    // Find next day matching schedule type as a suggestion
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('postpone-new-date').value = tomorrow.toISOString().split('T')[0];

    document.getElementById('postpone-session-modal').classList.add('active');
}

function closePostponeModal() {
    document.getElementById('postpone-session-modal').classList.remove('active');
}

function togglePostponeFields(method) {
    const fields = document.getElementById('postpone-specific-fields');
    if (!fields) return;
    if (method === 'specific') {
        fields.style.display = 'block';
        document.getElementById('postpone-new-date').setAttribute('required', 'true');
        document.getElementById('postpone-time-start').setAttribute('required', 'true');
        document.getElementById('postpone-time-end').setAttribute('required', 'true');
    } else {
        fields.style.display = 'none';
        document.getElementById('postpone-new-date').removeAttribute('required');
        document.getElementById('postpone-time-start').removeAttribute('required');
        document.getElementById('postpone-time-end').removeAttribute('required');
    }
}

// Register postpone form listener
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('postpone-session-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const dateStr = document.getElementById('postpone-session-date').value;
            const method = document.querySelector('input[name="postpone-method"]:checked').value;
            
            const payload = { method };
            if (method === 'specific') {
                const startTime = document.getElementById('postpone-time-start').value;
                const endTime = document.getElementById('postpone-time-end').value;
                payload.newDate = document.getElementById('postpone-new-date').value;
                payload.newTimeSlot = `${startTime} - ${endTime}`;
            }

            try {
                const res = await fetch(`/api/courses/${activeCourseId}/dates/${dateStr}/postpone`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                if (res.ok) {
                    closePostponeModal();
                    openCourseDetailsModal(activeCourseId); // reload attendance grid
                    fetchCourses(); // reload main courses table just in case month_num changed
                    alert('تم تأجيل المحاضرة بنجاح!');
                } else {
                    alert(data.error || 'حدث خطأ أثناء تأجيل المحاضرة.');
                }
            } catch (err) {
                console.error(err);
                alert('فشل الاتصال بالسيرفر أثناء عملية التأجيل.');
            }
        });
    }
});

function populateEvalGroupDropdown() {
    const groupSelect = document.getElementById('eval-group');
    if (!groupSelect) return;
    
    // Save current selected value to restore it
    const currentVal = groupSelect.value;
    
    // Reset options and add Waiting List option
    groupSelect.innerHTML = `
        <option value="" disabled selected>-- اختر الدورة/الشعبة --</option>
        <option value="قائمة الانتظار" style="font-weight:bold; color: #856404; background-color: #fff3cd;">📋 قائمة الانتظار (غير منسوب لكورس)</option>
    `;
    
    // Append all active courses
    if (Array.isArray(coursesList)) {
        coursesList.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.name;
            opt.textContent = `${c.name} (مع الأستاذ: ${c.teacher})`;
            groupSelect.appendChild(opt);
        });
    }

    // Restore selected value if it matches one of the options
    if (currentVal) {
        groupSelect.value = currentVal;
    }
}

function toggleCustomInterviewerInput(value) {
    const customInput = document.getElementById('eval-interviewer-custom');
    if (!customInput) return;
    if (value === 'Other') {
        customInput.style.display = 'block';
        customInput.setAttribute('required', 'true');
    } else {
        customInput.style.display = 'none';
        customInput.removeAttribute('required');
    }
}

function setStudentFilter(filterType) {
    currentStudentFilter = filterType;
    
    // Update button active styles
    const buttons = document.querySelectorAll('.btn-filter');
    buttons.forEach(btn => {
        // Reset style classes
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-secondary)';
        btn.style.fontWeight = 'normal';
    });
    
    // Find active button
    let activeBtn;
    if (filterType === 'all') activeBtn = buttons[0];
    else if (filterType === 'waiting') activeBtn = buttons[1];
    else if (filterType === 'current') activeBtn = buttons[2];
    else if (filterType === 'graduated') activeBtn = buttons[3];
    
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'var(--primary-color)';
        activeBtn.style.color = '#fff';
        activeBtn.style.fontWeight = 'bold';
    }
    
    // Apply filters
    filterAndRenderStudents();
}

function filterAndRenderStudents() {
    const searchInput = document.getElementById('student-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let filtered = studentsList || [];

    // Apply status filter first
    if (currentStudentFilter === 'waiting') {
        filtered = filtered.filter(s => !s.current_course_name);
    } else if (currentStudentFilter === 'current') {
        filtered = filtered.filter(s => !!s.current_course_name);
    } else if (currentStudentFilter === 'graduated') {
        filtered = filtered.filter(s => parseInt(s.total_courses_count || 0) > 0 && !s.current_course_name);
    }

    // Apply search query second
    if (query) {
        filtered = filtered.filter(s => 
            (s.name && s.name.toLowerCase().includes(query)) || 
            (s.phone && s.phone.includes(query)) ||
            (s.national_id && s.national_id.includes(query))
        );
    }

    renderStudentsTable(filtered);
}

function toggleStudentPersonalEdit(showEdit) {
    const viewContainer = document.getElementById('student-details-view-container');
    const editContainer = document.getElementById('student-details-edit-container');
    if (!viewContainer || !editContainer) return;
    
    if (showEdit) {
        viewContainer.style.display = 'none';
        editContainer.style.display = 'block';
        
        // Clear photo file input on edit start
        const photoInput = document.getElementById('edit-stu-photo');
        if (photoInput) photoInput.value = '';

        // Populate edit inputs
        document.getElementById('edit-stu-name').value = document.getElementById('sd-name').textContent || '';
        document.getElementById('edit-stu-phone').value = document.getElementById('sd-phone').textContent || '';
        document.getElementById('edit-stu-national-id').value = document.getElementById('sd-national-id').textContent || '';
        
        const rawDob = document.getElementById('sd-dob-pob').getAttribute('data-raw-dob') || '';
        document.getElementById('edit-stu-dob').value = rawDob;
        
        document.getElementById('edit-stu-pob').value = document.getElementById('sd-dob-pob').getAttribute('data-raw-pob') || '';
        document.getElementById('edit-stu-qualification').value = document.getElementById('sd-qualification').textContent || '';
        document.getElementById('edit-stu-address').value = document.getElementById('sd-address').textContent || '';
        document.getElementById('edit-stu-purpose').value = document.getElementById('sd-purpose').textContent || '';
        
        const rawPeriod = document.getElementById('sd-period-type').getAttribute('data-raw-period') || 'morning';
        const rawStudyType = document.getElementById('sd-period-type').getAttribute('data-raw-study-type') || 'in_person';
        document.getElementById('edit-stu-period').value = rawPeriod;
        document.getElementById('edit-stu-study-type').value = rawStudyType;
        
        document.getElementById('edit-stu-referral').value = document.getElementById('sd-referral').textContent || '';
    } else {
        viewContainer.style.display = 'block';
        editContainer.style.display = 'none';
    }
}

// Register edit form submit listener
document.addEventListener('DOMContentLoaded', () => {
    const personalForm = document.getElementById('edit-student-personal-form');
    if (personalForm) {
        personalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const studentId = document.getElementById('sd-student-id').value;
            
            const formData = new FormData();
            formData.append('name', document.getElementById('edit-stu-name').value);
            formData.append('phone', document.getElementById('edit-stu-phone').value);
            formData.append('national_id', document.getElementById('edit-stu-national-id').value);
            formData.append('dob', document.getElementById('edit-stu-dob').value);
            formData.append('pob', document.getElementById('edit-stu-pob').value);
            formData.append('qualification', document.getElementById('edit-stu-qualification').value);
            formData.append('address', document.getElementById('edit-stu-address').value);
            formData.append('purpose', document.getElementById('edit-stu-purpose').value);
            formData.append('period', document.getElementById('edit-stu-period').value);
            formData.append('study_type', document.getElementById('edit-stu-study-type').value);
            formData.append('referral', document.getElementById('edit-stu-referral').value);

            const photoInput = document.getElementById('edit-stu-photo');
            if (photoInput && photoInput.files[0]) {
                formData.append('photo', photoInput.files[0]);
            }

            try {
                const res = await fetch(`/api/students/${studentId}/personal`, {
                    method: 'PUT',
                    body: formData
                });
                
                const data = await res.json();
                if (res.ok) {
                    alert('تم تحديث البيانات الشخصية والصورة بنجاح.');
                    // Reload student details to view updated info
                    openStudentDetailsModal(studentId);
                    fetchStudents(); // Refresh general student list
                } else {
                    alert(data.error || 'فشل تحديث البيانات الشخصية.');
                }
            } catch (err) {
                console.error(err);
                alert('حدث خطأ أثناء الاتصال بالسيرفر لتحديث البيانات الشخصية.');
            }
        });
    }
});

function filterAndRenderPayments() {
    const searchInput = document.getElementById('payment-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let filtered = paymentsList || [];

    if (query) {
        filtered = filtered.filter(p => {
            const serialStr = `r-${p.id}`.toLowerCase();
            const rawIdStr = `${p.id}`;
            const studentName = p.student_name ? p.student_name.toLowerCase() : '';
            const studentPhone = p.student_phone || p.phone || '';
            const studentNatId = p.student_national_id || p.national_id || '';
            return serialStr.includes(query) || rawIdStr.includes(query) || studentName.includes(query) || studentPhone.includes(query) || studentNatId.includes(query);
        });
    }

    renderPaymentsTable(filtered);
}

function formatCurrencyInput(input) {
    let cursorPosition = input.selectionStart;
    const originalLength = input.value.length;

    // Keep only digits
    let value = input.value.replace(/\D/g, '');

    if (value) {
        // Remove leading zeros
        value = parseInt(value, 10).toString();
        // Add commas every 3 digits
        const formatted = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        input.value = formatted;

        // Correct cursor position offset
        const newLength = formatted.length;
        cursorPosition = cursorPosition + (newLength - originalLength);
        input.setSelectionRange(cursorPosition, cursorPosition);
    } else {
        input.value = '';
    }
}

// Fullscreen Image Lightbox Controls
function openFullscreenImage(imgSrc) {
    if (!imgSrc) return;
    const modal = document.getElementById('image-fullscreen-modal');
    const modalImg = document.getElementById('fullscreen-modal-img');
    if (modal && modalImg) {
        modalImg.src = imgSrc;
        modal.classList.add('active');
    }
}

function closeFullscreenImage() {
    const modal = document.getElementById('image-fullscreen-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function expandCurrentAvatar(imgId) {
    const img = document.getElementById(imgId);
    if (img && img.style.display !== 'none' && img.src) {
        openFullscreenImage(img.src);
    }
}

// Close fullscreen image modal on Escape key press
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeFullscreenImage();
    }
});

// Testing user 'ali' functions
async function confirmWipeDatabase() {
    const confirmed = confirm('⚠️ تحذير مهم جداً!\n\nهل أنت متأكد من رغبتك في تفريغ قاعدة البيانات بالكامل؟\nسيتم مسح كافة سجلات الطلاب والدورات والوصولات المالية فوراً لتهيئة النظام!');
    if (!confirmed) return;

    try {
        const res = await fetch('/api/testing/wipe-db', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            alert(data.message || 'تم تفريغ كافة البيانات بنجاح.');
            // Refresh data views
            fetchCourses();
            fetchStudents();
            fetchPayments();
        } else {
            alert(data.error || 'فشل تفريغ قاعدة البيانات.');
        }
    } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء الاتصال بالسيرفر لتفريغ البيانات.');
    }
}

async function triggerSeedMockData() {
    try {
        const res = await fetch('/api/testing/seed-mock-data', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            alert(data.message || 'تمت عملية حقن 10 طلاب وكورسين ودفعات مالية وهمية بنجاح!');
            // Refresh data views
            fetchCourses();
            fetchStudents();
            fetchPayments();
        } else {
            alert(data.error || 'فشل حقن البيانات الوهمية.');
        }
    } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء الاتصال بالسيرفر لحقن البيانات الوهمية.');
    }
}

// Admin / Manager Student Self-Registration Form Modal Controls
function openAdminRegisterStudentModal() {
    const modal = document.getElementById('admin-register-student-modal');
    const form = document.getElementById('admin-register-student-form');
    const errEl = document.getElementById('admin-reg-alert-error');
    const succEl = document.getElementById('admin-reg-alert-success');
    if (form) form.reset();
    if (errEl) errEl.style.display = 'none';
    if (succEl) succEl.style.display = 'none';
    if (modal) modal.classList.add('active');
}

function closeAdminRegisterStudentModal() {
    const modal = document.getElementById('admin-register-student-modal');
    if (modal) modal.classList.remove('active');
}

// Submit listener for Admin/Manager Student Registration Form
document.addEventListener('DOMContentLoaded', () => {
    const adminRegForm = document.getElementById('admin-register-student-form');
    if (adminRegForm) {
        adminRegForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errEl = document.getElementById('admin-reg-alert-error');
            const succEl = document.getElementById('admin-reg-alert-success');
            if (errEl) errEl.style.display = 'none';
            if (succEl) succEl.style.display = 'none';

            const formData = new FormData();
            formData.append('name', document.getElementById('admin-reg-name').value);
            formData.append('national_id', document.getElementById('admin-reg-national-id').value);
            formData.append('dob', document.getElementById('admin-reg-dob').value);
            formData.append('pob', document.getElementById('admin-reg-pob').value);
            formData.append('qualification', document.getElementById('admin-reg-qualification').value);
            formData.append('phone', document.getElementById('admin-reg-phone').value);
            formData.append('address', document.getElementById('admin-reg-address').value);
            formData.append('purpose', document.getElementById('admin-reg-purpose').value);
            formData.append('period', document.getElementById('admin-reg-period').value);
            formData.append('study_type', document.getElementById('admin-reg-study-type').value);
            formData.append('referral', document.getElementById('admin-reg-referral').value);
            formData.append('username', document.getElementById('admin-reg-username').value);
            formData.append('password', document.getElementById('admin-reg-password').value);

            const photoInput = document.getElementById('admin-reg-photo');
            if (photoInput && photoInput.files[0]) {
                formData.append('photo', photoInput.files[0]);
            }

            try {
                const res = await fetch('/api/auth/register-student', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();

                if (res.ok) {
                    succEl.textContent = 'تم تسجيل الطالب وتوليد حسابه بنجاح!';
                    succEl.style.display = 'block';
                    adminRegForm.reset();
                    
                    fetchStudents(); // Refresh students list immediately
                    
                    setTimeout(() => {
                        closeAdminRegisterStudentModal();
                    }, 1800);
                } else {
                    errEl.textContent = data.error || 'فشل تسجيل الطالب.';
                    errEl.style.display = 'block';
                    const modalContainer = document.querySelector('#admin-register-student-modal .modal-container');
                    if (modalContainer) modalContainer.scrollTop = 0;
                }
            } catch (err) {
                console.error(err);
                errEl.textContent = 'حدث خطأ أثناء الاتصال بالسيرفر لتسجيل الطالب.';
                errEl.style.display = 'block';
                const modalContainer = document.querySelector('#admin-register-student-modal .modal-container');
                if (modalContainer) modalContainer.scrollTop = 0;
            }
        });
    }
});

// Map day numbers (0-6) to Arabic day names for schedule pattern validation
const ARABIC_DAY_NAMES = [
    'الأحد (فردي)',
    'الاثنين (زوجي)',
    'الثلاثاء (فردي)',
    'الأربعاء (زوجي)',
    'الخميس (فردي)',
    'الجمعة (عطلة)',
    'السبت (زوجي)'
];

function validateCourseStartDatePattern() {
    const scheduleSelect = document.getElementById('course-schedule');
    const dateInput = document.getElementById('course-start-date');
    const warningEl = document.getElementById('course-start-date-warning');
    if (!scheduleSelect || !dateInput || !warningEl) return true;

    const scheduleType = scheduleSelect.value;
    const dateVal = dateInput.value;

    if (!dateVal) {
        warningEl.style.display = 'none';
        return true;
    }

    const dateParts = dateVal.split('-');
    const dt = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    const dayOfWeek = dt.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat

    const validDays = scheduleType === 'even' ? [6, 1, 3] : [0, 2, 4];
    const isEven = scheduleType === 'even';
    const dayName = ARABIC_DAY_NAMES[dayOfWeek];

    if (!validDays.includes(dayOfWeek)) {
        const requiredText = isEven ? 'زوجي (السبت، الاثنين، أو الأربعاء)' : 'فردي (الأحد، الثلاثاء، أو الخميس)';
        warningEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="margin-left: 5px;"></i> تعارض في النمط: اليوم المختار يوافق <strong>${dayName}</strong>. يجب أن يوافق تاريخ البدء <strong>${requiredText}</strong>.`;
        warningEl.style.display = 'block';
        return false;
    } else {
        warningEl.style.display = 'none';
        return true;
    }
}

function validateExtendStartDatePattern() {
    const scheduleSelect = document.getElementById('extend-schedule');
    const dateInput = document.getElementById('extend-start-date');
    const warningEl = document.getElementById('extend-start-date-warning');
    if (!scheduleSelect || !dateInput || !warningEl) return true;

    const scheduleType = scheduleSelect.value;
    const dateVal = dateInput.value;

    if (!dateVal) {
        warningEl.style.display = 'none';
        return true;
    }

    const dateParts = dateVal.split('-');
    const dt = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    const dayOfWeek = dt.getDay();

    const validDays = scheduleType === 'even' ? [6, 1, 3] : [0, 2, 4];
    const isEven = scheduleType === 'even';
    const dayName = ARABIC_DAY_NAMES[dayOfWeek];

    if (!validDays.includes(dayOfWeek)) {
        const requiredText = isEven ? 'زوجي (السبت، الاثنين، أو الأربعاء)' : 'فردي (الأحد، الثلاثاء، أو الخميس)';
        warningEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="margin-left: 5px;"></i> تعارض في النمط: التاريخ المختار للتمديد يوافق <strong>${dayName}</strong>. يجب أن يوافق <strong>${requiredText}</strong>.`;
        warningEl.style.display = 'block';
        return false;
    } else {
        warningEl.style.display = 'none';
        return true;
    }
}
