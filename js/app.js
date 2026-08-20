/* ============================================================
   CampusCare – App Router & Event Handling
   SPA routing, event delegation, initialization
   ============================================================ */

const App = {
    // ── Initialization ──────────────────────────────────
    _landingTimer: null,  // holds the real-time polling interval for the landing page
    init() {
        DataStore.init();
        // Wait for Supabase configuration to initialize first
        window.supabaseInitPromise.then(() => {
            Auth.initSessionListener().then(() => {
                this.router();
            });
        });
        window.addEventListener('hashchange', () => this.router());
        // Global event delegation
        document.addEventListener('click', (e) => this.handleClick(e));
        document.addEventListener('submit', (e) => this.handleSubmit(e));
        document.addEventListener('change', (e) => this.handleChange(e));
        document.addEventListener('input', (e) => this.handleInput(e));
    },

    // ── Router ──────────────────────────────────────────
    async router() {
        const hash = window.location.hash || '#/';
        const app = document.getElementById('app');
        if (!app) return;

        // Clear landing real-time poller when navigating away
        if (this._landingTimer) {
            clearInterval(this._landingTimer);
            this._landingTimer = null;
        }

        // Wait for auth initialization to complete
        await Auth.ensureInitialized();

        // Route guard
        if (!Auth.checkAccess(hash)) {
            if (Auth.isLoggedIn()) {
                // Wrong role
                const role = Auth.isAdmin() ? 'admin' : 'student';
                window.location.hash = `#/${role}/dashboard`;
                return;
            }
            window.location.hash = '#/login';
            return;
        }

        // Show loading indicator in app container while fetching dashboard/data
        const needsLoading = ['#/student/dashboard', '#/student/complaints', '#/admin/dashboard', '#/admin/complaints', '#/admin/urgent', '#/admin/students', '#/admin/departments', '#/admin/reports'].includes(hash) || hash.startsWith('#/student/complaint/') || hash.startsWith('#/admin/complaint/');
        if (needsLoading && app.innerHTML.trim() !== '') {
            app.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;min-height:80vh;flex-direction:column;color:var(--text-secondary);">
                    <div class="loading-spinner"></div>
                    <p style="font-size:0.875rem;margin-top:12px;font-weight:500;">Loading secure data...</p>
                </div>
            `;
        }

        let html = '';
        const user = Auth.getCurrentUser();

        try {
            // Match routes
            if (hash === '#/' || hash === '') {
                html = Views.landing();
            } else if (hash === '#/login') {
                html = Views.login();
            } else if (hash === '#/register') {
                html = Views.register();
            }
            // Student routes
            else if (hash === '#/student/dashboard') {
                const complaints = await Complaints.getByStudent(user.uid);
                html = Views.studentDashboard(complaints);
            } else if (hash === '#/student/raise-complaint') {
                html = Views.raiseComplaint();
            } else if (hash === '#/student/complaints') {
                const complaints = await Complaints.getByStudent(user.uid);
                html = Views.myComplaints(complaints);
            } else if (hash.startsWith('#/student/complaint/')) {
                const id = hash.replace('#/student/complaint/', '');
                const complaint = await Complaints.getById(id);
                html = Views.complaintDetail(complaint);
            } else if (hash === '#/student/notifications') {
                html = Views.studentNotifications();
            } else if (hash === '#/student/profile') {
                html = Views.studentProfile();
            } else if (hash === '#/student/help') {
                html = Views.helpSupport();
            }
            // Admin routes
            else if (hash === '#/admin/dashboard') {
                const stats = await Admin.getDashboardStats();
                const recent = await Admin.getRecentComplaints(5);
                html = Views.adminDashboard(stats, recent);
            } else if (hash === '#/admin/complaints') {
                const complaints = await Complaints.getAll();
                html = Views.adminComplaints(complaints);
            } else if (hash.startsWith('#/admin/complaint/')) {
                const id = hash.replace('#/admin/complaint/', '');
                const complaint = await Complaints.getById(id);
                let student = null;
                if (complaint && window.supabase) {
                    // Fetch student avatar/email info
                    const { data } = await supabase.from('profiles').select('*').eq('id', complaint.studentId).maybeSingle();
                    if (data) {
                        student = {
                            avatar: data.avatar || 'U',
                            email: data.email
                        };
                    }
                }
                html = Views.adminComplaintDetail(complaint, student);
            } else if (hash === '#/admin/urgent') {
                const urgent = await Admin.getUrgentComplaints();
                html = Views.adminUrgent(urgent);
            } else if (hash === '#/admin/students') {
                const students = await Admin.getAllStudents();
                html = Views.adminStudents(students);
            } else if (hash === '#/admin/departments') {
                const depts = await Admin.getComplaintsByDepartment();
                html = Views.adminDepartments(depts);
            } else if (hash === '#/admin/reports') {
                const stats = await Admin.getDashboardStats();
                const depts = await Admin.getComplaintsByDepartment();
                html = Views.adminReports(stats, depts);
            } else if (hash === '#/admin/notifications') {
                html = Views.adminNotifications();
            } else if (hash === '#/admin/settings') {
                html = Views.adminSettings();
            }
            // Fallback
            else {
                html = Views.landing();
            }
        } catch (err) {
            console.error('Error rendering route:', err);
            html = `<div style="padding:48px;text-align:center;"><h3>Error loading page</h3><p style="color:var(--error-600);">${err.message}</p><a href="#/" class="btn btn-primary btn-sm">Home</a></div>`;
        }

        app.innerHTML = html;

        // Post-render setup
        this.afterRender(hash);
    },

    // ── After Render ────────────────────────────────────
    afterRender(hash) {
        // Render charts if on admin dashboard or reports
        if (hash === '#/admin/dashboard') {
            this.renderDashboardCharts();
        }
        if (hash === '#/admin/reports') {
            this.renderReportCharts();
        }

        // Setup file upload drag/drop
        this.setupFileUpload();

        // Setup scroll-reveal animations on landing page
        if (hash === '#/' || hash === '') {
            this.setupScrollReveal();
            this.setupLandingRealtime();
        }

        // Focus management
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus({ preventScroll: true });
        }

        // Scroll to top
        window.scrollTo(0, 0);
    },

    setupScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        if (!revealElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

        revealElements.forEach(el => observer.observe(el));
    },

    // ── Landing Real-Time Stats Updater ──────────────────
    setupLandingRealtime() {
        // Helper: patch a single element's textContent only when the value changes
        const patch = (id, text) => {
            const el = document.getElementById(id);
            if (el && el.textContent !== text) el.textContent = text;
        };

        const refresh = async () => {
            // Bail out if landing page is no longer rendered
            if (!document.getElementById('rt-stat-total')) {
                clearInterval(this._landingTimer);
                this._landingTimer = null;
                return;
            }

            const allComplaints = await Complaints.getAll();
            const s = Complaints.getStats(allComplaints);
            
            let studentCount = 0;
            if (window.supabase) {
                try {
                    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
                    studentCount = count || 0;
                } catch (e) {
                    console.warn('Real-time query profiles count error:', e);
                }
            }

            const rate = s.total > 0 ? Math.round((s.resolved / s.total) * 100) : 0;

            // Stats strip
            patch('rt-stat-resolved', String(s.resolved));
            patch('rt-stat-rate',     rate + '%');
            patch('rt-stat-total',    String(s.total));
            patch('rt-stat-students', String(studentCount));

            // Hero mockup card
            patch('rt-total',      s.total + ' total');
            patch('rt-pending',    s.pending + ' pending');
            patch('rt-inprogress', s.inProgress + ' active');
            patch('rt-resolved',   s.resolved + ' done');
        };

        // Run once immediately, then every 3 seconds
        refresh();
        this._landingTimer = setInterval(refresh, 3000);
    },

    async renderDashboardCharts() {
        const statusData = await Admin.getStatusDistribution();
        Charts.renderDonutChart('status-chart', statusData, { centerLabel: 'Complaints' });

        const monthlyData = await Admin.getComplaintsByMonth();
        Charts.renderBarChart('monthly-chart', monthlyData);
    },

    async renderReportCharts() {
        const statusData = await Admin.getStatusDistribution();
        Charts.renderDonutChart('report-status-chart', statusData, { centerLabel: 'Complaints' });

        const monthlyData = await Admin.getComplaintsByMonth();
        Charts.renderBarChart('report-monthly-chart', monthlyData);

        const categoryData = await Admin.getComplaintsByCategory();
        const categoryColors = ['#6366f1', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#f97316', '#06b6d4', '#ef4444', '#3b82f6', '#64748b'];
        Charts.renderBarChart('report-category-chart', categoryData.map((c, i) => ({
            label: c.name,
            month: c.name,
            count: c.count,
            color: categoryColors[i % categoryColors.length]
        })));
    },

    // ── Helper for button loading states ────────────────
    setLoading(btn, isLoading, customText = 'Processing...') {
        if (!btn) return;
        if (isLoading) {
            btn.disabled = true;
            btn.dataset.originalHtml = btn.innerHTML;
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${customText}`;
        } else {
            btn.disabled = false;
            btn.innerHTML = btn.dataset.originalHtml || btn.innerHTML;
        }
    },

    // ── Event Handlers ──────────────────────────────────
    handleClick(e) {
        const target = e.target.closest('[data-action]');

        // Logout
        if (target && target.dataset.action === 'logout') {
            e.preventDefault();
            Utils.showConfirm('Are you sure you want to logout?', () => {
                Auth.logout().then(() => {
                    window.location.hash = '#/login';
                    Utils.showToast('You have been logged out.', 'info');
                });
            }, 'Logout');
            return;
        }

        // Sidebar toggle
        if (e.target.closest('#hamburger-btn')) {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            if (sidebar) sidebar.classList.add('open');
            if (overlay) overlay.classList.add('active');
            return;
        }
        if (e.target.closest('#sidebar-close-btn') || e.target.closest('#sidebar-overlay')) {
            this.closeSidebar();
            return;
        }

        // Close sidebar on nav link click (mobile)
        if (e.target.closest('.sidebar-link') && window.innerWidth <= 1024) {
            this.closeSidebar();
        }

        // Theme toggle
        if (e.target.closest('#theme-toggle-btn')) {
            this.toggleTheme();
            return;
        }

        // Notification bell
        if (e.target.closest('#notif-bell-btn')) {
            e.stopPropagation();
            this.toggleNotifDropdown();
            return;
        }

        // Close notif dropdown when clicking outside
        if (!e.target.closest('#notif-bell-btn') && !e.target.closest('.notif-dropdown')) {
            const dropdown = document.getElementById('notif-dropdown');
            if (dropdown) dropdown.classList.add('hidden');
        }

        // Mark all notifications read
        if (target && target.dataset.action === 'mark-all-read') {
            const user = Auth.getCurrentUser();
            if (user) {
                Notifications.markAllAsRead(user.uid);
                Utils.showToast('All notifications marked as read.', 'success');
                this.router(); // Refresh
            }
            return;
        }

        // Read single notification
        if (target && target.dataset.action === 'read-notif') {
            const notifId = target.dataset.notifId;
            if (notifId) {
                Notifications.markAsRead(notifId);
                target.classList.remove('unread');
            }
            return;
        }

        // FAQ toggle
        if (target && target.dataset.action === 'toggle-faq') {
            const idx = target.dataset.index;
            const faqItem = document.querySelector(`.faq-item[data-faq="${idx}"]`);
            if (faqItem) faqItem.classList.toggle('open');
            return;
        }

        // Edit profile toggle
        if (e.target.closest('#edit-profile-btn')) {
            const display = document.getElementById('profile-display');
            const edit = document.getElementById('profile-edit');
            if (display) display.style.display = 'none';
            if (edit) edit.style.display = 'block';
            return;
        }
        if (e.target.closest('#cancel-edit-btn')) {
            const display = document.getElementById('profile-display');
            const edit = document.getElementById('profile-edit');
            if (display) display.style.display = 'block';
            if (edit) edit.style.display = 'none';
            return;
        }

        // Toggle password visibility
        if (e.target.closest('.toggle-password')) {
            const btn = e.target.closest('.toggle-password');
            const input = btn.parentElement.querySelector('input');
            if (input) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                btn.querySelector('i').className = `fa-solid fa-eye${isPassword ? '-slash' : ''}`;
            }
            return;
        }

        // Star rating
        if (e.target.closest('.star-btn')) {
            const star = e.target.closest('.star-btn');
            const rating = parseInt(star.dataset.value);
            const container = document.getElementById('star-rating');
            if (container) {
                container.dataset.rating = rating;
                container.querySelectorAll('.star-btn').forEach(s => {
                    const val = parseInt(s.dataset.value);
                    s.className = val <= rating ? 'fa-solid fa-star star-btn' : 'fa-regular fa-star star-btn';
                });
            }
            return;
        }

        // Admin: Save changes button
        if (e.target.closest('#save-admin-changes')) {
            const btn = e.target.closest('#save-admin-changes');
            const compId = btn.dataset.complaintId;
            this.saveAdminChanges(compId);
            return;
        }

        // Admin: Add note
        if (e.target.closest('#add-admin-note-btn')) {
            const btn = e.target.closest('#add-admin-note-btn');
            const compId = btn.dataset.complaintId;
            const textEl = document.getElementById('admin-note-text');
            const text = textEl ? textEl.value.trim() : '';
            if (!text) {
                Utils.showToast('Please enter a note.', 'warning');
                return;
            }
            e.preventDefault();
            this.setLoading(btn, true, 'Adding...');
            Admin.addAdminNote(compId, text).then(() => {
                this.setLoading(btn, false);
                Utils.showToast('Note added successfully.', 'success');
                this.router();
            }).catch(err => {
                this.setLoading(btn, false);
                Utils.showToast('Failed to add note: ' + err.message, 'error');
            });
            return;
        }

        // Admin: Resolve complaint
        if (e.target.closest('#resolve-complaint-btn')) {
            const btn = e.target.closest('#resolve-complaint-btn');
            const compId = btn.dataset.complaintId;
            const textEl = document.getElementById('resolution-text');
            const text = textEl ? textEl.value.trim() : '';
            if (!text) {
                Utils.showToast('Please describe the resolution.', 'warning');
                return;
            }
            Utils.showConfirm('Are you sure you want to resolve this complaint?', () => {
                this.setLoading(btn, true, 'Resolving...');
                Admin.resolveComplaint(compId, text).then(() => {
                    this.setLoading(btn, false);
                    Utils.showToast('Complaint resolved successfully!', 'success');
                    this.router();
                }).catch(err => {
                    this.setLoading(btn, false);
                    Utils.showToast('Failed to resolve complaint: ' + err.message, 'error');
                });
            }, 'Resolve Complaint');
            return;
        }

        // File upload area click
        if (e.target.closest('#file-upload-area')) {
            const fileInput = document.getElementById('comp-file');
            if (fileInput) fileInput.click();
            return;
        }

        // Remove uploaded file
        if (e.target.closest('.file-remove')) {
            document.getElementById('file-preview-container').innerHTML = '';
            document.getElementById('comp-file').value = '';
            return;
        }

        // Dark mode toggle in settings
        if (e.target.closest('#dark-mode-toggle')) {
            this.toggleTheme();
            return;
        }
    },

    handleSubmit(e) {
        // Login form
        if (e.target.id === 'login-form') {
            e.preventDefault();
            
            if (window.SUPABASE_CONFIG_ERROR) {
                Utils.showToast(window.SUPABASE_CONFIG_ERROR, 'error');
                return;
            }

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                Utils.showToast('Please fill in all fields.', 'warning');
                return;
            }

            this.performLogin(email, password);
            return;
        }

        // Register form
        if (e.target.id === 'register-form') {
            e.preventDefault();

            if (window.SUPABASE_CONFIG_ERROR) {
                Utils.showToast(window.SUPABASE_CONFIG_ERROR, 'error');
                return;
            }

            this.handleRegister();
            return;
        }

        // Complaint form
        if (e.target.id === 'complaint-form') {
            e.preventDefault();

            if (window.SUPABASE_CONFIG_ERROR) {
                Utils.showToast(window.SUPABASE_CONFIG_ERROR, 'error');
                return;
            }

            this.handleComplaintSubmit();
            return;
        }

        // Feedback form
        if (e.target.id === 'feedback-form') {
            e.preventDefault();

            if (window.SUPABASE_CONFIG_ERROR) {
                Utils.showToast(window.SUPABASE_CONFIG_ERROR, 'error');
                return;
            }

            this.handleFeedbackSubmit(e.target);
            return;
        }

        // Profile edit form
        if (e.target.id === 'profile-edit-form') {
            e.preventDefault();

            if (window.SUPABASE_CONFIG_ERROR) {
                Utils.showToast(window.SUPABASE_CONFIG_ERROR, 'error');
                return;
            }

            this.handleProfileEdit();
            return;
        }
    },

    handleChange(e) {
        // File input
        if (e.target.id === 'comp-file') {
            this.handleFileSelect(e.target);
            return;
        }
    },

    handleInput(e) {
        // Search & filter for complaints
        if (e.target.id === 'search-input' || e.target.classList.contains('filter-select') ||
            e.target.id === 'filter-category' || e.target.id === 'filter-status' ||
            e.target.id === 'filter-priority' || e.target.id === 'sort-by') {
            this.filterComplaints();
        }
    },

    // ── Login ───────────────────────────────────────────
    async performLogin(email, password) {
        const form = document.getElementById('login-form');
        const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
        this.setLoading(submitBtn, true, 'Logging in...');

        const result = await Auth.login(email, password);
        this.setLoading(submitBtn, false);

        if (result.success) {
            const role = result.user.role;
            Utils.showToast(`Welcome back, ${result.user.name}!`, 'success', 'Login Successful');
            window.location.hash = `#/${role}/dashboard`;
        } else {
            Utils.showToast(result.message, 'error', 'Login Failed');
        }
    },

    // ── Register ────────────────────────────────────────
    async handleRegister() {
        const { valid } = Utils.validateForm({
            'reg-name': [{ required: true, message: 'Full name is required' }],
            'reg-student-id': [{ required: true, message: 'Student ID is required' }],
            'reg-email': [
                { required: true, message: 'Email is required' },
                { email: true, message: 'Please enter a valid email' }
            ],
            'reg-course': [{ required: true, message: 'Please select a course' }],
            'reg-year': [{ required: true, message: 'Please select your year' }],
            'reg-password': [
                { required: true, message: 'Password is required' },
                { minLength: 6, message: 'Password must be at least 6 characters' }
            ],
            'reg-confirm-password': [
                { required: true, message: 'Please confirm your password' },
                { match: 'reg-password', message: 'Passwords do not match' }
            ]
        });

        if (!valid) {
            Utils.showToast('Please fix the errors in the form.', 'warning');
            return;
        }

        const form = document.getElementById('register-form');
        const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
        this.setLoading(submitBtn, true, 'Creating account...');

        const result = await Auth.register({
            name: document.getElementById('reg-name').value.trim(),
            studentId: document.getElementById('reg-student-id').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            phone: document.getElementById('reg-phone').value.trim(),
            course: document.getElementById('reg-course').value,
            year: document.getElementById('reg-year').value,
            password: document.getElementById('reg-password').value
        });

        this.setLoading(submitBtn, false);

        if (result.success) {
            Utils.showToast(result.message, 'success', 'Registration Complete');
            window.location.hash = '#/login';
        } else {
            Utils.showToast(result.message, 'error', 'Registration Failed');
        }
    },

    // ── Complaint Submit ────────────────────────────────
    async handleComplaintSubmit() {
        const { valid } = Utils.validateForm({
            'comp-title': [{ required: true, message: 'Complaint title is required' }],
            'comp-category': [{ required: true, message: 'Please select a category' }],
            'comp-location': [{ required: true, message: 'Location is required' }],
            'comp-description': [
                { required: true, message: 'Description is required' },
                { minLength: 20, message: 'Please provide at least 20 characters' }
            ],
            'comp-priority': [{ required: true, message: 'Please select a priority' }]
        });

        if (!valid) {
            Utils.showToast('Please fix the errors in the form.', 'warning');
            return;
        }

        const form = document.getElementById('complaint-form');
        const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
        this.setLoading(submitBtn, true, 'Submitting...');

        const result = await Complaints.create({
            title: document.getElementById('comp-title').value.trim(),
            category: document.getElementById('comp-category').value,
            location: document.getElementById('comp-location').value.trim(),
            description: document.getElementById('comp-description').value.trim(),
            priority: document.getElementById('comp-priority').value,
            date: document.getElementById('comp-date').value,
            contact: document.getElementById('comp-contact').value.trim(),
            image: null
        });

        this.setLoading(submitBtn, false);

        if (result.success) {
            Utils.showToast(
                `Complaint ID: ${result.complaint.id}`,
                'success',
                'Complaint Submitted Successfully!'
            );
            setTimeout(() => {
                window.location.hash = '#/student/complaints';
            }, 1000);
        } else {
            Utils.showToast(result.message || 'Failed to submit complaint.', 'error');
        }
    },

    // ── Feedback Submit ─────────────────────────────────
    async handleFeedbackSubmit(form) {
        const compId = form.dataset.complaintId;
        const ratingEl = document.getElementById('star-rating');
        const rating = ratingEl ? parseInt(ratingEl.dataset.rating) : 0;
        const comment = document.getElementById('feedback-comment').value.trim();

        if (rating === 0) {
            Utils.showToast('Please select a star rating.', 'warning');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        this.setLoading(submitBtn, true, 'Submitting feedback...');

        await Complaints.addFeedback(compId, { rating, comment });
        this.setLoading(submitBtn, false);
        Utils.showToast('Thank you for your feedback!', 'success');
        this.router();
    },

    // ── Profile Edit ────────────────────────────────────
    async handleProfileEdit() {
        const form = document.getElementById('profile-edit-form');
        const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
        this.setLoading(submitBtn, true, 'Updating profile...');

        const result = await Auth.updateProfile({
            name: document.getElementById('edit-name').value.trim(),
            phone: document.getElementById('edit-phone').value.trim(),
            course: document.getElementById('edit-course').value.trim(),
            year: document.getElementById('edit-year').value
        });

        this.setLoading(submitBtn, false);

        if (result.success) {
            Utils.showToast('Profile updated successfully!', 'success');
            this.router();
        } else {
            Utils.showToast(result.message, 'error');
        }
    },

    // ── Admin: Save changes ─────────────────────────────
    async saveAdminChanges(compId) {
        const statusEl = document.getElementById('admin-status-select');
        const deptEl = document.getElementById('admin-dept-select');
        const priorityEl = document.getElementById('admin-priority-select');

        const complaint = await Complaints.getById(compId);
        if (!complaint) return;

        const submitBtn = document.getElementById('save-admin-changes');
        this.setLoading(submitBtn, true, 'Saving changes...');

        let changed = false;

        // Status change
        if (statusEl && statusEl.value !== complaint.status) {
            await Admin.updateComplaintStatus(compId, statusEl.value);
            changed = true;
        }

        // Department assignment
        if (deptEl && deptEl.value && deptEl.value !== complaint.department) {
            await Admin.assignDepartment(compId, deptEl.value);
            changed = true;
        }

        // Priority change
        if (priorityEl && priorityEl.value !== complaint.priority) {
            await Admin.changePriority(compId, priorityEl.value);
            changed = true;
        }

        this.setLoading(submitBtn, false);

        if (changed) {
            Utils.showToast('Complaint updated successfully.', 'success');
            this.router(); // Re-render to show updates
        } else {
            Utils.showToast('No changes to save.', 'info');
        }
    },

    // ── Filter & Search Complaints ──────────────────────
    async filterComplaints() {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('filter-category');
        const statusFilter = document.getElementById('filter-status');
        const priorityFilter = document.getElementById('filter-priority');
        const sortBy = document.getElementById('sort-by');

        const query = searchInput ? searchInput.value : '';
        const filters = {
            category: categoryFilter ? categoryFilter.value : '',
            status: statusFilter ? statusFilter.value : '',
            priority: priorityFilter ? priorityFilter.value : ''
        };
        const sort = sortBy ? sortBy.value : 'date-desc';

        // Get base complaints
        const user = Auth.getCurrentUser();
        let complaints;
        if (Auth.isAdmin()) {
            complaints = await Complaints.getAll();
        } else {
            complaints = await Complaints.getByStudent(user.uid);
        }

        // Apply search
        complaints = Complaints.search(query, complaints);

        // Apply filters
        complaints = Complaints.filter(filters, complaints);

        // Apply sort
        const [sortField, sortOrder] = sort.split('-');
        complaints = Complaints.sort(sortField, sortOrder, complaints);

        // Update list
        const listContainer = document.getElementById('complaints-list');
        if (listContainer) {
            const role = Auth.isAdmin() ? 'admin' : 'student';
            listContainer.innerHTML = Views._renderComplaintsTable(complaints, role);
        }
    },

    // ── Sidebar ─────────────────────────────────────────
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
    },

    // ── Theme Toggle ────────────────────────────────────
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        DataStore.set(DataStore.KEYS.THEME, next);

        // Update all theme icons on the page
        const themeBtns = document.querySelectorAll('#theme-toggle-btn, .theme-toggle-btn');
        themeBtns.forEach(btn => {
            btn.innerHTML = `<i class="fa-solid ${next === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>`;
        });

        // Update toggle in settings if present
        const darkToggle = document.getElementById('dark-mode-toggle');
        if (darkToggle) {
            darkToggle.checked = next === 'dark';
        }
    },

    // ── Notification Dropdown ───────────────────────────
    toggleNotifDropdown() {
        const dropdown = document.getElementById('notif-dropdown');
        if (!dropdown) return;

        if (dropdown.classList.contains('hidden')) {
            const user = Auth.getCurrentUser();
            const notifs = Notifications.getAll(user.uid).slice(0, 5);

            dropdown.innerHTML = `
                <div class="notif-dropdown-header">
                    <h4>Notifications</h4>
                    ${notifs.some(n => !n.read) ? `<button data-action="mark-all-read">Mark all read</button>` : ''}
                </div>
                <div class="notif-list">
                    ${notifs.length > 0 ? notifs.map(n => `
                        <div class="notif-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}" data-action="read-notif">
                            <div class="notif-icon ${n.type}">
                                <i class="fa-solid ${n.type === 'success' ? 'fa-circle-check' : n.type === 'warning' ? 'fa-triangle-exclamation' : n.type === 'urgent' ? 'fa-circle-exclamation' : 'fa-info-circle'}"></i>
                            </div>
                            <div class="notif-content">
                                <p><strong>${Utils.escapeHtml(n.title)}</strong></p>
                                <p>${Utils.escapeHtml(n.message)}</p>
                                <div class="notif-time">${Utils.timeAgo(n.createdAt)}</div>
                            </div>
                        </div>
                    `).join('') : '<div style="padding:24px;text-align:center;color:var(--text-tertiary);font-size:0.8125rem;">No notifications</div>'}
                </div>
                ${notifs.length > 0 ? `
                <div style="padding:12px 20px;border-top:1px solid var(--border-color);text-align:center;">
                    <a href="#/${Auth.isAdmin() ? 'admin' : 'student'}/notifications" style="font-size:0.8125rem;color:var(--primary-600);font-weight:600;">View All Notifications</a>
                </div>` : ''}
            `;
            dropdown.classList.remove('hidden');
        } else {
            dropdown.classList.add('hidden');
        }
    },

    // ── File Upload ─────────────────────────────────────
    setupFileUpload() {
        const area = document.getElementById('file-upload-area');
        if (!area) return;

        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });
        area.addEventListener('dragleave', () => {
            area.classList.remove('dragover');
        });
        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            const fileInput = document.getElementById('comp-file');
            if (e.dataTransfer.files.length > 0 && fileInput) {
                fileInput.files = e.dataTransfer.files;
                this.handleFileSelect(fileInput);
            }
        });
    },

    handleFileSelect(input) {
        const container = document.getElementById('file-preview-container');
        if (!container || !input.files || input.files.length === 0) return;

        const file = input.files[0];
        if (file.size > 5 * 1024 * 1024) {
            Utils.showToast('File size exceeds 5MB limit.', 'warning');
            input.value = '';
            return;
        }

        container.innerHTML = `
            <div class="file-preview">
                <i class="fa-solid ${file.type.startsWith('image/') ? 'fa-image' : 'fa-file-pdf'}" style="font-size:1.25rem;color:var(--primary-500);"></i>
                <span class="file-name">${Utils.escapeHtml(file.name)}</span>
                <span style="font-size:0.75rem;color:var(--text-tertiary);">${(file.size / 1024).toFixed(1)} KB</span>
                <button type="button" class="file-remove" aria-label="Remove file"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;
    }
};

// ── Boot ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
