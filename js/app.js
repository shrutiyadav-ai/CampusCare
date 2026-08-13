/* ============================================================
   CampusCare – App Router & Event Handling
   SPA routing, event delegation, initialization
   ============================================================ */

const App = {
    // ── Initialization ──────────────────────────────────
    init() {
        DataStore.init();
        this.router();
        window.addEventListener('hashchange', () => this.router());
        // Global event delegation
        document.addEventListener('click', (e) => this.handleClick(e));
        document.addEventListener('submit', (e) => this.handleSubmit(e));
        document.addEventListener('change', (e) => this.handleChange(e));
        document.addEventListener('input', (e) => this.handleInput(e));
    },

    // ── Router ──────────────────────────────────────────
    router() {
        const hash = window.location.hash || '#/';
        const app = document.getElementById('app');
        if (!app) return;

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

        let html = '';

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
            html = Views.studentDashboard();
        } else if (hash === '#/student/raise-complaint') {
            html = Views.raiseComplaint();
        } else if (hash === '#/student/complaints') {
            html = Views.myComplaints();
        } else if (hash.startsWith('#/student/complaint/')) {
            const id = hash.replace('#/student/complaint/', '');
            html = Views.complaintDetail(id);
        } else if (hash === '#/student/notifications') {
            html = Views.studentNotifications();
        } else if (hash === '#/student/profile') {
            html = Views.studentProfile();
        } else if (hash === '#/student/help') {
            html = Views.helpSupport();
        }
        // Admin routes
        else if (hash === '#/admin/dashboard') {
            html = Views.adminDashboard();
        } else if (hash === '#/admin/complaints') {
            html = Views.adminComplaints();
        } else if (hash.startsWith('#/admin/complaint/')) {
            const id = hash.replace('#/admin/complaint/', '');
            html = Views.adminComplaintDetail(id);
        } else if (hash === '#/admin/urgent') {
            html = Views.adminUrgent();
        } else if (hash === '#/admin/students') {
            html = Views.adminStudents();
        } else if (hash === '#/admin/departments') {
            html = Views.adminDepartments();
        } else if (hash === '#/admin/reports') {
            html = Views.adminReports();
        } else if (hash === '#/admin/notifications') {
            html = Views.adminNotifications();
        } else if (hash === '#/admin/settings') {
            html = Views.adminSettings();
        }
        // Fallback
        else {
            html = Views.landing();
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

    renderDashboardCharts() {
        const statusData = Admin.getStatusDistribution();
        Charts.renderDonutChart('status-chart', statusData, { centerLabel: 'Complaints' });

        const monthlyData = Admin.getComplaintsByMonth();
        Charts.renderBarChart('monthly-chart', monthlyData);
    },

    renderReportCharts() {
        const statusData = Admin.getStatusDistribution();
        Charts.renderDonutChart('report-status-chart', statusData, { centerLabel: 'Complaints' });

        const monthlyData = Admin.getComplaintsByMonth();
        Charts.renderBarChart('report-monthly-chart', monthlyData);

        const categoryData = Admin.getComplaintsByCategory();
        const categoryColors = ['#6366f1', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#f97316', '#06b6d4', '#ef4444', '#3b82f6', '#64748b'];
        Charts.renderBarChart('report-category-chart', categoryData.map((c, i) => ({
            label: c.name,
            month: c.name,
            count: c.count,
            color: categoryColors[i % categoryColors.length]
        })));
    },

    // ── Event Handlers ──────────────────────────────────
    handleClick(e) {
        const target = e.target.closest('[data-action]');

        // Logout
        if (target && target.dataset.action === 'logout') {
            e.preventDefault();
            Utils.showConfirm('Are you sure you want to logout?', () => {
                Auth.logout();
                window.location.hash = '#/login';
                Utils.showToast('You have been logged out.', 'info');
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
                Notifications.markAllAsRead(user.id);
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
            Admin.addAdminNote(compId, text);
            Utils.showToast('Note added successfully.', 'success');
            this.router();
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
                Admin.resolveComplaint(compId, text);
                Utils.showToast('Complaint resolved successfully!', 'success');
                this.router();
            }, 'Resolve Complaint');
            return;
        }

        // Reset data
        if (target && target.dataset.action === 'reset-data') {
            Utils.showConfirm('This will clear all data and restore sample complaints. Are you sure?', () => {
                localStorage.clear();
                DataStore.init();
                Auth.logout();
                window.location.hash = '#/login';
                Utils.showToast('All data has been reset.', 'info');
            }, 'Reset Data');
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
            this.handleRegister();
            return;
        }

        // Complaint form
        if (e.target.id === 'complaint-form') {
            e.preventDefault();
            this.handleComplaintSubmit();
            return;
        }

        // Feedback form
        if (e.target.id === 'feedback-form') {
            e.preventDefault();
            this.handleFeedbackSubmit(e.target);
            return;
        }

        // Profile edit form
        if (e.target.id === 'profile-edit-form') {
            e.preventDefault();
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
    performLogin(email, password) {
        const result = Auth.login(email, password);
        if (result.success) {
            const role = result.user.role;
            Utils.showToast(`Welcome back, ${result.user.name}!`, 'success', 'Login Successful');
            window.location.hash = `#/${role}/dashboard`;
        } else {
            Utils.showToast(result.message, 'error', 'Login Failed');
        }
    },

    // ── Register ────────────────────────────────────────
    handleRegister() {
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

        const result = Auth.register({
            name: document.getElementById('reg-name').value.trim(),
            studentId: document.getElementById('reg-student-id').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            phone: document.getElementById('reg-phone').value.trim(),
            course: document.getElementById('reg-course').value,
            year: document.getElementById('reg-year').value,
            password: document.getElementById('reg-password').value
        });

        if (result.success) {
            Utils.showToast(result.message, 'success', 'Registration Complete');
            window.location.hash = '#/login';
        } else {
            Utils.showToast(result.message, 'error', 'Registration Failed');
        }
    },

    // ── Complaint Submit ────────────────────────────────
    handleComplaintSubmit() {
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

        const result = Complaints.create({
            title: document.getElementById('comp-title').value.trim(),
            category: document.getElementById('comp-category').value,
            location: document.getElementById('comp-location').value.trim(),
            description: document.getElementById('comp-description').value.trim(),
            priority: document.getElementById('comp-priority').value,
            date: document.getElementById('comp-date').value,
            contact: document.getElementById('comp-contact').value.trim(),
            image: null // File handling is demo-only
        });

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
    handleFeedbackSubmit(form) {
        const compId = form.dataset.complaintId;
        const ratingEl = document.getElementById('star-rating');
        const rating = ratingEl ? parseInt(ratingEl.dataset.rating) : 0;
        const comment = document.getElementById('feedback-comment').value.trim();

        if (rating === 0) {
            Utils.showToast('Please select a star rating.', 'warning');
            return;
        }

        Complaints.addFeedback(compId, { rating, comment });
        Utils.showToast('Thank you for your feedback!', 'success');
        this.router();
    },

    // ── Profile Edit ────────────────────────────────────
    handleProfileEdit() {
        const result = Auth.updateProfile({
            name: document.getElementById('edit-name').value.trim(),
            phone: document.getElementById('edit-phone').value.trim(),
            course: document.getElementById('edit-course').value.trim(),
            year: document.getElementById('edit-year').value
        });

        if (result.success) {
            Utils.showToast('Profile updated successfully!', 'success');
            this.router();
        } else {
            Utils.showToast(result.message, 'error');
        }
    },

    // ── Admin: Save changes ─────────────────────────────
    saveAdminChanges(compId) {
        const statusEl = document.getElementById('admin-status-select');
        const deptEl = document.getElementById('admin-dept-select');
        const priorityEl = document.getElementById('admin-priority-select');

        const complaint = Complaints.getById(compId);
        if (!complaint) return;

        let changed = false;

        // Status change
        if (statusEl && statusEl.value !== complaint.status) {
            Admin.updateComplaintStatus(compId, statusEl.value);
            changed = true;
        }

        // Department assignment
        if (deptEl && deptEl.value && deptEl.value !== complaint.department) {
            Admin.assignDepartment(compId, deptEl.value);
            changed = true;
        }

        // Priority change
        if (priorityEl && priorityEl.value !== complaint.priority) {
            Admin.changePriority(compId, priorityEl.value);
            changed = true;
        }

        if (changed) {
            Utils.showToast('Complaint updated successfully.', 'success');
            this.router(); // Re-render to show updates
        } else {
            Utils.showToast('No changes to save.', 'info');
        }
    },

    // ── Filter & Search Complaints ──────────────────────
    filterComplaints() {
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
            complaints = Complaints.getAll();
        } else {
            complaints = Complaints.getByStudent(user.id);
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
            const notifs = Notifications.getAll(user.id).slice(0, 5);

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
