/* ============================================================
   CampusCare – Views Module
   All view rendering functions (HTML templates)
   ============================================================ */

const Views = {

    // ════════════════════════════════════════════════════
    //  LANDING PAGE
    // ════════════════════════════════════════════════════
    landing() {
        const stats = { total: 0, pending: 0, inProgress: 0, resolved: 0, urgent: 0 };
        const studentCount = 0;
        const resolutionRate = 0;

        return `
        <div class="landing-page">
            ${window.SUPABASE_CONFIG_ERROR ? `
                <div class="config-error-banner" style="background:#FEF2F2;border-bottom:1px solid #FCA5A5;color:#991B1B;padding:12px 24px;text-align:center;font-size:0.875rem;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;z-index:9999;position:relative;">
                    <i class="fa-solid fa-triangle-exclamation" style="color:#EF4444;"></i>
                    <span>${window.SUPABASE_CONFIG_ERROR}</span>
                </div>
            ` : ''}
            <!-- Navigation Bar -->
            <nav class="landing-nav" id="landing-nav">
                <div class="landing-nav-logo">
                    <div class="logo-icon"><i class="fa-solid fa-graduation-cap"></i></div>
                    <span class="logo-text">CampusCare</span>
                </div>
                <div class="landing-nav-links" id="landing-nav-links">
                    <a href="#/" class="nav-link active" onclick="event.preventDefault(); document.getElementById('hero')?.scrollIntoView({behavior:'smooth'})">Home</a>
                    <a href="#how-it-works" class="nav-link" onclick="event.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})">How It Works</a>
                    <a href="#categories" class="nav-link" onclick="event.preventDefault(); document.getElementById('categories')?.scrollIntoView({behavior:'smooth'})">Categories</a>
                    <a href="#about" class="nav-link" onclick="event.preventDefault(); document.getElementById('about')?.scrollIntoView({behavior:'smooth'})">About</a>
                    <a href="#/login" class="btn btn-outline btn-sm nav-login-btn">Login</a>
                </div>
                <button class="landing-hamburger" id="landing-hamburger" aria-label="Open menu" onclick="document.getElementById('landing-nav-links').classList.toggle('open'); this.classList.toggle('active');">
                    <span></span><span></span><span></span>
                </button>
            </nav>

            <!-- Hero Section -->
            <section class="hero-section" id="hero">
                <div class="hero-inner">
                    <div class="hero-text reveal-on-scroll">
                        <h1>Raise Your Voice.<br>Improve Your Campus.</h1>
                        <p class="hero-subtitle">A simple and transparent platform for students to report campus issues, track complaints, and stay informed about their resolution.</p>
                        <div class="hero-buttons">
                            <a href="#/register" class="btn btn-primary"><i class="fa-solid fa-paper-plane"></i> Raise a Complaint</a>
                            <a href="#/login" class="btn btn-outline"><i class="fa-solid fa-magnifying-glass"></i> Track Complaint</a>
                        </div>
                    </div>
                    <div class="hero-visual reveal-on-scroll">
                        <div class="mockup-card">
                            <div class="mockup-card-header">
                                <span class="mockup-dot"></span>
                                <span class="mockup-dot"></span>
                                <span class="mockup-dot"></span>
                                <span class="mockup-card-title">Dashboard Overview</span>
                            </div>
                            <div class="mockup-card-body">
                                <div class="mockup-status-item submitted">
                                    <div class="mockup-status-icon"><i class="fa-solid fa-paper-plane"></i></div>
                                    <div class="mockup-status-info">
                                        <span class="mockup-status-label">Complaint Submitted</span>
                                        <span class="mockup-status-count" id="rt-total">${stats.total} total</span>
                                    </div>
                                    <span class="mockup-status-badge pending-badge" id="rt-pending">${stats.pending} pending</span>
                                </div>
                                <div class="mockup-status-item in-progress">
                                    <div class="mockup-status-icon"><i class="fa-solid fa-arrows-rotate"></i></div>
                                    <div class="mockup-status-info">
                                        <span class="mockup-status-label">In Progress</span>
                                        <span class="mockup-status-count">Being reviewed</span>
                                    </div>
                                    <span class="mockup-status-badge progress-badge" id="rt-inprogress">${stats.inProgress} active</span>
                                </div>
                                <div class="mockup-status-item resolved">
                                    <div class="mockup-status-icon"><i class="fa-solid fa-circle-check"></i></div>
                                    <div class="mockup-status-info">
                                        <span class="mockup-status-label">Resolved</span>
                                        <span class="mockup-status-count">Successfully closed</span>
                                    </div>
                                    <span class="mockup-status-badge resolved-badge" id="rt-resolved">${stats.resolved} done</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Statistics Section (real-time, sourced from LocalStorage) -->
            <section class="stats-section">
                <div class="stats-inner reveal-on-scroll">
                    <div class="stat-item">
                        <div class="stat-number" id="rt-stat-resolved">${stats.resolved}</div>
                        <div class="stat-label">Complaints Resolved</div>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <div class="stat-number" id="rt-stat-rate">${resolutionRate}%</div>
                        <div class="stat-label">Resolution Rate</div>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <div class="stat-number" id="rt-stat-total">${stats.total}</div>
                        <div class="stat-label">Total Complaints</div>
                    </div>
                    <div class="stat-divider"></div>
                    <div class="stat-item">
                        <div class="stat-number" id="rt-stat-students">${studentCount}</div>
                        <div class="stat-label">Registered Students</div>
                    </div>
                </div>
            </section>

            <!-- How It Works -->
            <section class="landing-section" id="how-it-works">
                <div class="section-header reveal-on-scroll">
                    <h2>How It Works</h2>
                    <p>Three simple steps to get your campus issues resolved.</p>
                </div>
                <div class="steps-grid reveal-on-scroll">
                    <div class="step-card">
                        <div class="step-icon-wrap"><i class="fa-solid fa-pen-to-square"></i></div>
                        <div class="step-label">01 — Submit</div>
                        <p>Report your campus issue using a simple complaint form.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-icon-wrap"><i class="fa-solid fa-chart-line"></i></div>
                        <div class="step-label">02 — Track</div>
                        <p>Monitor your complaint status in real time.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-icon-wrap"><i class="fa-solid fa-circle-check"></i></div>
                        <div class="step-label">03 — Resolve</div>
                        <p>Receive updates when your issue is addressed.</p>
                    </div>
                </div>
            </section>

            <!-- Complaint Categories -->
            <section class="landing-section section-light-bg" id="categories">
                <div class="section-header reveal-on-scroll">
                    <h2>Complaint Categories</h2>
                    <p>Report issues across every corner of your campus.</p>
                </div>
                <div class="categories-grid stagger reveal-on-scroll">
                    ${[
                        { name: 'Hostel', emoji: '🏠' },
                        { name: 'Water Supply', emoji: '💧' },
                        { name: 'Wi-Fi', emoji: '📶' },
                        { name: 'Electricity', emoji: '⚡' },
                        { name: 'Cleaning', emoji: '🧹' },
                        { name: 'Canteen', emoji: '🍽️' },
                        { name: 'Classroom', emoji: '🏫' },
                        { name: 'Transport', emoji: '🚌' }
                    ].map(c => `
                        <div class="category-card">
                            <div class="category-emoji">${c.emoji}</div>
                            <h4>${c.name}</h4>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Why CampusCare -->
            <section class="landing-section" id="about">
                <div class="section-header reveal-on-scroll">
                    <h2>Why CampusCare?</h2>
                    <p>Built for students. Designed for impact.</p>
                </div>
                <div class="features-grid stagger reveal-on-scroll">
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fa-solid fa-eye"></i></div>
                        <h4>Transparent Tracking</h4>
                        <p>Students can see exactly where their complaint stands.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fa-solid fa-bolt"></i></div>
                        <h4>Faster Resolution</h4>
                        <p>Complaints are organized and assigned to the appropriate department.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fa-solid fa-file-pen"></i></div>
                        <h4>Easy Reporting</h4>
                        <p>Submit a complaint in just a few simple steps.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon"><i class="fa-solid fa-building-columns"></i></div>
                        <h4>Better Campus</h4>
                        <p>Help the university identify recurring issues and improve student life.</p>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="cta-section">
                <div class="cta-content reveal-on-scroll">
                    <h2>Ready to Make Your Campus Better?</h2>
                    <p>Join the platform that gives every student a voice. Create your account and raise your first complaint today.</p>
                    <div class="cta-buttons">
                        <a href="#/register" class="btn btn-primary"><i class="fa-solid fa-user-plus"></i> Create Free Account</a>
                        <a href="#/login" class="btn btn-outline"><i class="fa-solid fa-right-to-bracket"></i> Sign In</a>
                    </div>
                </div>
            </section>

            <!-- Footer -->
            <footer class="landing-footer">
                <div class="footer-inner">
                    <div class="footer-brand">
                        <div class="footer-logo">
                            <div class="logo-icon"><i class="fa-solid fa-graduation-cap"></i></div>
                            <span class="logo-text">CampusCare</span>
                        </div>
                        <p class="footer-tagline">Your voice. Our responsibility.</p>
                    </div>
                    <div class="footer-links">
                        <div class="footer-col">
                            <h4>Platform</h4>
                            <a href="#/login">Student Login</a>
                            <a href="#/login">Admin Login</a>
                            <a href="#/register">Create Account</a>
                        </div>
                        <div class="footer-col">
                            <h4>Support</h4>
                            <a href="#/login">Help Center</a>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>© ${new Date().getFullYear()} CampusCare. All rights reserved.</p>
                </div>
            </footer>
        </div>`;
    },

    // ════════════════════════════════════════════════════
    //  LOGIN PAGE
    // ════════════════════════════════════════════════════
    login() {
        return `
        <div class="auth-page">
            <a href="#/" class="auth-back-link"><i class="fa-solid fa-arrow-left"></i> Back to Home</a>
            <div class="auth-container">
                ${window.SUPABASE_CONFIG_ERROR ? `
                    <div class="config-error-banner" style="background:#FEF2F2;border:1px solid #FCA5A5;color:#991B1B;padding:12px;border-radius:var(--radius-md);margin-bottom:20px;font-size:0.8125rem;font-weight:600;display:flex;align-items:center;gap:8px;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size:1rem;color:#EF4444;"></i>
                        <span style="text-align:left;">${window.SUPABASE_CONFIG_ERROR}</span>
                    </div>
                ` : ''}
                <div class="auth-logo">
                    <div class="logo-icon"><i class="fa-solid fa-graduation-cap"></i></div>
                    <span class="logo-text">CampusCare</span>
                </div>
                <p class="auth-tagline">"Your voice. Our responsibility."</p>
                <h2 class="auth-title">Welcome Back</h2>

                <form id="login-form" novalidate>
                    <div class="form-group">
                        <label class="form-label" for="login-email">Email / Username <span class="required">*</span></label>
                        <input type="text" id="login-email" class="form-input" placeholder="Enter your email or username" autocomplete="username" required>
                        <div class="form-error" id="login-email-error" style="display:none;"></div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="login-password">Password <span class="required">*</span></label>
                        <div style="position: relative;">
                            <input type="password" id="login-password" class="form-input" placeholder="Enter your password" autocomplete="current-password" required>
                            <button type="button" class="toggle-password" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-tertiary);cursor:pointer;padding:4px;" aria-label="Toggle password visibility">
                                <i class="fa-solid fa-eye"></i>
                            </button>
                        </div>
                        <div class="form-error" id="login-password-error" style="display:none;"></div>
                    </div>

                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                        <div class="form-check">
                            <input type="checkbox" id="remember-me">
                            <label for="remember-me">Remember me</label>
                        </div>
                        <a href="#" style="font-size:0.8125rem;color:var(--primary-600);font-weight:500;">Forgot password?</a>
                    </div>

                    <button type="submit" class="btn btn-primary w-full" style="padding:12px;">
                        <i class="fa-solid fa-right-to-bracket"></i> Login
                    </button>
                </form>

                <div class="auth-footer">
                    Don't have an account? <a href="#/register">Register here</a>
                </div>
            </div>
        </div>`;
    },

    // ════════════════════════════════════════════════════
    //  REGISTER PAGE
    // ════════════════════════════════════════════════════
    register() {
        return `
        <div class="auth-page">
            <a href="#/" class="auth-back-link"><i class="fa-solid fa-arrow-left"></i> Back to Home</a>
            <div class="auth-container register-container">
                ${window.SUPABASE_CONFIG_ERROR ? `
                    <div class="config-error-banner" style="background:#FEF2F2;border:1px solid #FCA5A5;color:#991B1B;padding:12px;border-radius:var(--radius-md);margin-bottom:20px;font-size:0.8125rem;font-weight:600;display:flex;align-items:center;gap:8px;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size:1rem;color:#EF4444;"></i>
                        <span style="text-align:left;">${window.SUPABASE_CONFIG_ERROR}</span>
                    </div>
                ` : ''}
                <div class="auth-logo">
                    <div class="logo-icon"><i class="fa-solid fa-graduation-cap"></i></div>
                    <span class="logo-text">CampusCare</span>
                </div>
                <h2 class="auth-title">Create Your Account</h2>

                <form id="register-form" novalidate>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="reg-name">Full Name <span class="required">*</span></label>
                            <input type="text" id="reg-name" class="form-input" placeholder="Enter your full name" required>
                            <div class="form-error" id="reg-name-error" style="display:none;"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="reg-student-id">Student ID <span class="required">*</span></label>
                            <input type="text" id="reg-student-id" class="form-input" placeholder="e.g., STU004" required>
                            <div class="form-error" id="reg-student-id-error" style="display:none;"></div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="reg-email">University Email <span class="required">*</span></label>
                        <input type="email" id="reg-email" class="form-input" placeholder="yourname@university.edu" required>
                        <div class="form-error" id="reg-email-error" style="display:none;"></div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="reg-phone">Phone Number</label>
                            <input type="tel" id="reg-phone" class="form-input" placeholder="+91 XXXXX XXXXX">
                            <div class="form-error" id="reg-phone-error" style="display:none;"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="reg-course">Course <span class="required">*</span></label>
                            <select id="reg-course" class="form-select" required>
                                <option value="">Select course</option>
                                <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                                <option value="B.Tech Electronics">B.Tech Electronics</option>
                                <option value="B.Tech Mechanical">B.Tech Mechanical</option>
                                <option value="B.Tech Civil">B.Tech Civil</option>
                                <option value="BBA">BBA</option>
                                <option value="BCA">BCA</option>
                                <option value="MBA">MBA</option>
                                <option value="MCA">MCA</option>
                                <option value="M.Tech">M.Tech</option>
                                <option value="B.Sc">B.Sc</option>
                                <option value="M.Sc">M.Sc</option>
                                <option value="BA">BA</option>
                                <option value="MA">MA</option>
                                <option value="PhD">PhD</option>
                            </select>
                            <div class="form-error" id="reg-course-error" style="display:none;"></div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="reg-year">Year <span class="required">*</span></label>
                        <select id="reg-year" class="form-select" required>
                            <option value="">Select year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="5th Year">5th Year</option>
                        </select>
                        <div class="form-error" id="reg-year-error" style="display:none;"></div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="reg-password">Password <span class="required">*</span></label>
                            <input type="password" id="reg-password" class="form-input" placeholder="Min 6 characters" required>
                            <div class="form-error" id="reg-password-error" style="display:none;"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="reg-confirm-password">Confirm Password <span class="required">*</span></label>
                            <input type="password" id="reg-confirm-password" class="form-input" placeholder="Re-enter password" required>
                            <div class="form-error" id="reg-confirm-password-error" style="display:none;"></div>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-full" style="padding:12px;margin-top:8px;">
                        <i class="fa-solid fa-user-plus"></i> Create Account
                    </button>
                </form>

                <div class="auth-footer">
                    Already have an account? <a href="#/login">Login here</a>
                </div>
            </div>
        </div>`;
    },

    // ════════════════════════════════════════════════════
    //  LAYOUT WRAPPER (Sidebar + Header + Content)
    // ════════════════════════════════════════════════════
    layout(content, pageTitle, role) {
        const user = Auth.getCurrentUser();
        if (!user) return this.login();

        const unreadCount = Notifications.getUnreadCount(user.id);

        return `
        <div class="app-layout">
            <div class="sidebar-overlay" id="sidebar-overlay"></div>
            <aside class="sidebar" id="sidebar" role="navigation" aria-label="Main navigation">
                <button class="sidebar-close-btn" id="sidebar-close-btn" aria-label="Close navigation">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="sidebar-logo">
                    <div class="logo-icon"><i class="fa-solid fa-graduation-cap"></i></div>
                    <div>
                        <div class="logo-text">CampusCare</div>
                        <div class="logo-subtitle">${role === 'admin' ? 'Admin Portal' : 'Student Portal'}</div>
                    </div>
                </div>
                <nav class="sidebar-nav">
                    ${role === 'admin' ? this._adminNav(unreadCount) : this._studentNav(unreadCount)}
                </nav>
                <div class="sidebar-footer">
                    <a href="#" class="sidebar-link logout-link" data-action="logout">
                        <i class="fa-solid fa-right-from-bracket"></i> Logout
                    </a>
                </div>
            </aside>

            <div class="main-wrapper">
                <header class="app-header">
                    <div class="header-left">
                        <button class="hamburger-btn" id="hamburger-btn" aria-label="Open navigation">
                            <i class="fa-solid fa-bars"></i>
                        </button>
                        <h1 class="page-title">${pageTitle}</h1>
                    </div>
                    <div class="header-right">
                        <button class="header-icon-btn" id="theme-toggle-btn" aria-label="Toggle theme" title="Toggle dark mode">
                            <i class="fa-solid ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
                        </button>
                        <div style="position:relative;">
                            <button class="header-icon-btn" id="notif-bell-btn" aria-label="Notifications" title="Notifications">
                                <i class="fa-solid fa-bell"></i>
                                ${unreadCount > 0 ? `<span class="notification-badge">${unreadCount > 9 ? '9+' : unreadCount}</span>` : ''}
                            </button>
                            <div id="notif-dropdown" class="notif-dropdown hidden"></div>
                        </div>
                        <a href="#/${role}/profile" class="header-user" ${role === 'admin' ? 'style="pointer-events:none;"' : ''}>
                            <div class="header-avatar">${user.avatar || 'U'}</div>
                            <div class="header-user-info">
                                <span class="header-user-name">${Utils.escapeHtml(user.name)}</span>
                                <span class="header-user-role">${role === 'admin' ? 'Administrator' : user.course || 'Student'}</span>
                            </div>
                        </a>
                    </div>
                </header>

                <main class="main-content page-transition" id="main-content">
                    ${content}
                </main>
            </div>
        </div>`;
    },

    _studentNav(unreadCount) {
        const hash = window.location.hash || '#/student/dashboard';
        const links = [
            { href: '#/student/dashboard', icon: 'fa-house', label: 'Dashboard' },
            { href: '#/student/raise-complaint', icon: 'fa-pen-to-square', label: 'Raise Complaint' },
            { href: '#/student/complaints', icon: 'fa-clipboard-list', label: 'My Complaints' },
            { href: '#/student/notifications', icon: 'fa-bell', label: 'Notifications', badge: unreadCount },
            { href: '#/student/profile', icon: 'fa-user', label: 'Profile' },
            { href: '#/student/help', icon: 'fa-circle-question', label: 'Help & Support' }
        ];
        return `<div class="sidebar-nav-group">
            <div class="sidebar-nav-label">Menu</div>
            ${links.map(l => `
                <a href="${l.href}" class="sidebar-link ${hash === l.href ? 'active' : ''}">
                    <i class="fa-solid ${l.icon}"></i> ${l.label}
                    ${l.badge ? `<span class="badge">${l.badge}</span>` : ''}
                </a>
            `).join('')}
        </div>`;
    },

    _adminNav(unreadCount) {
        const hash = window.location.hash || '#/admin/dashboard';
        const urgentCount = (Complaints.getAll() || []).filter(c => c.priority === 'Urgent' && c.status !== 'Resolved').length;
        const links = [
            { href: '#/admin/dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
            { href: '#/admin/complaints', icon: 'fa-clipboard-list', label: 'All Complaints' },
            { href: '#/admin/urgent', icon: 'fa-circle-exclamation', label: 'Urgent', badge: urgentCount },
            { href: '#/admin/students', icon: 'fa-users', label: 'Students' },
            { href: '#/admin/departments', icon: 'fa-building-columns', label: 'Departments' },
            { href: '#/admin/reports', icon: 'fa-chart-bar', label: 'Reports' },
            { href: '#/admin/notifications', icon: 'fa-bell', label: 'Notifications', badge: unreadCount },
            { href: '#/admin/settings', icon: 'fa-gear', label: 'Settings' }
        ];
        return `<div class="sidebar-nav-group">
            <div class="sidebar-nav-label">Management</div>
            ${links.map(l => `
                <a href="${l.href}" class="sidebar-link ${hash === l.href ? 'active' : ''}">
                    <i class="fa-solid ${l.icon}"></i> ${l.label}
                    ${l.badge ? `<span class="badge">${l.badge}</span>` : ''}
                </a>
            `).join('')}
        </div>`;
    },

    // ════════════════════════════════════════════════════
    //  STUDENT DASHBOARD
    // ════════════════════════════════════════════════════
    studentDashboard(complaints = []) {
        const user = Auth.getCurrentUser();
        const stats = Complaints.getStats(complaints);
        const recent = Complaints.sort('date', 'desc', complaints).slice(0, 5);

        const content = `
        <div class="welcome-banner">
            <h2>Welcome back, ${Utils.escapeHtml(user.name.split(' ')[0])}! 👋</h2>
            <p>Track your complaints and make your campus better.</p>
            <div class="student-id"><i class="fa-solid fa-id-card"></i> ${Utils.escapeHtml(user.id)}</div>
        </div>

        <div class="stat-cards stagger">
            <div class="stat-card total">
                <div class="stat-icon"><i class="fa-solid fa-file-lines"></i></div>
                <div class="stat-info">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">Total Complaints</div>
                </div>
            </div>
            <div class="stat-card pending">
                <div class="stat-icon"><i class="fa-solid fa-clock"></i></div>
                <div class="stat-info">
                    <div class="stat-number">${stats.pending}</div>
                    <div class="stat-label">Pending</div>
                </div>
            </div>
            <div class="stat-card progress">
                <div class="stat-icon"><i class="fa-solid fa-spinner"></i></div>
                <div class="stat-info">
                    <div class="stat-number">${stats.inProgress}</div>
                    <div class="stat-label">In Progress</div>
                </div>
            </div>
            <div class="stat-card resolved">
                <div class="stat-icon"><i class="fa-solid fa-circle-check"></i></div>
                <div class="stat-info">
                    <div class="stat-number">${stats.resolved}</div>
                    <div class="stat-label">Resolved</div>
                </div>
            </div>
        </div>

        <div class="page-header">
            <h2>Recent Complaints</h2>
            <a href="#/student/raise-complaint" class="btn btn-primary btn-sm">
                <i class="fa-solid fa-plus"></i> Raise New Complaint
            </a>
        </div>

        ${recent.length > 0 ? `
        <div class="card">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Complaint ID</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recent.map(c => `
                        <tr>
                            <td data-label="ID"><strong style="color:var(--primary-600);font-size:0.8125rem;">${c.id}</strong></td>
                            <td data-label="Title" class="complaint-title-cell">${Utils.escapeHtml(c.title)}</td>
                            <td data-label="Category"><i class="fa-solid ${Utils.getCategoryIcon(c.category)}" style="color:${Utils.getCategoryColor(c.category)};margin-right:6px;"></i>${c.category}</td>
                            <td data-label="Date">${Utils.formatDate(c.createdAt)}</td>
                            <td data-label="Priority">${Utils.getPriorityBadge(c.priority)}</td>
                            <td data-label="Status">${Utils.getStatusBadge(c.status)}</td>
                            <td data-label="Action"><a href="#/student/complaint/${c.id}" class="btn btn-outline btn-sm">View</a></td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>` : `
        <div class="card">
            <div class="empty-state">
                <i class="fa-solid fa-inbox"></i>
                <h3>No complaints yet</h3>
                <p>You haven't submitted any complaints. Click below to raise your first one.</p>
                <a href="#/student/raise-complaint" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Raise Complaint</a>
            </div>
        </div>`}
        `;

        return this.layout(content, 'Dashboard', 'student');
    },

    // ════════════════════════════════════════════════════
    //  RAISE COMPLAINT
    // ════════════════════════════════════════════════════
    raiseComplaint() {
        const today = new Date().toISOString().split('T')[0];
        const content = `
        <div class="page-header">
            <h2><i class="fa-solid fa-pen-to-square" style="color:var(--primary-500);margin-right:8px;"></i> Raise New Complaint</h2>
        </div>

        <div class="card">
            <div class="card-body">
                <form id="complaint-form" novalidate>
                    <div class="form-group">
                        <label class="form-label" for="comp-title">Complaint Title <span class="required">*</span></label>
                        <input type="text" id="comp-title" class="form-input" placeholder="Briefly describe the issue" required>
                        <div class="form-error" id="comp-title-error" style="display:none;"></div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="comp-category">Category <span class="required">*</span></label>
                            <select id="comp-category" class="form-select" required>
                                <option value="">Select category</option>
                                ${Complaints.CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                            <div class="form-error" id="comp-category-error" style="display:none;"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="comp-location">Location <span class="required">*</span></label>
                            <input type="text" id="comp-location" class="form-input" placeholder="e.g., Hostel Block A, Room 302" required>
                            <div class="form-error" id="comp-location-error" style="display:none;"></div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="comp-description">Description <span class="required">*</span></label>
                        <textarea id="comp-description" class="form-textarea" placeholder="Provide detailed information about the issue..." rows="5" required></textarea>
                        <div class="form-error" id="comp-description-error" style="display:none;"></div>
                        <div class="form-hint">Minimum 20 characters. Include relevant details for faster resolution.</div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="comp-priority">Priority <span class="required">*</span></label>
                            <select id="comp-priority" class="form-select" required>
                                <option value="">Select priority</option>
                                ${Complaints.PRIORITIES.map(p => `<option value="${p}">${p}</option>`).join('')}
                            </select>
                            <div class="form-error" id="comp-priority-error" style="display:none;"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="comp-date">Date</label>
                            <input type="date" id="comp-date" class="form-input" value="${today}" max="${today}">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Upload Evidence (Optional)</label>
                        <div class="file-upload-area" id="file-upload-area">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                            <p>Click or drag & drop to upload</p>
                            <p class="file-types">PNG, JPG, PDF up to 5MB</p>
                            <input type="file" id="comp-file" accept="image/*,.pdf">
                        </div>
                        <div id="file-preview-container"></div>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="comp-contact">Contact Information (Optional)</label>
                        <input type="text" id="comp-contact" class="form-input" placeholder="Alternate phone number or room number">
                    </div>

                    <div class="btn-group" style="margin-top:24px;">
                        <button type="submit" class="btn btn-primary btn-lg">
                            <i class="fa-solid fa-paper-plane"></i> Submit Complaint
                        </button>
                        <a href="#/student/dashboard" class="btn btn-outline btn-lg">Cancel</a>
                    </div>
                </form>
            </div>
        </div>`;

        return this.layout(content, 'Raise Complaint', 'student');
    },

    // ════════════════════════════════════════════════════
    //  MY COMPLAINTS (Student)
    // ════════════════════════════════════════════════════
    myComplaints(complaints = []) {
        const user = Auth.getCurrentUser();

        const content = `
        <div class="page-header">
            <h2>My Complaints</h2>
            <a href="#/student/raise-complaint" class="btn btn-primary btn-sm">
                <i class="fa-solid fa-plus"></i> Raise New
            </a>
        </div>

        <div class="toolbar">
            <div class="search-box">
                <i class="fa-solid fa-search"></i>
                <input type="text" id="search-input" placeholder="Search complaints..." aria-label="Search complaints">
            </div>
            <select class="filter-select" id="filter-category" aria-label="Filter by category">
                <option value="">All Categories</option>
                ${Complaints.CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
            <select class="filter-select" id="filter-status" aria-label="Filter by status">
                <option value="">All Statuses</option>
                ${Complaints.STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <select class="filter-select" id="filter-priority" aria-label="Filter by priority">
                <option value="">All Priorities</option>
                ${Complaints.PRIORITIES.map(p => `<option value="${p}">${p}</option>`).join('')}
            </select>
            <select class="filter-select" id="sort-by" aria-label="Sort by">
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="priority-desc">Highest Priority</option>
                <option value="priority-asc">Lowest Priority</option>
            </select>
        </div>

        <div id="complaints-list">
            ${this._renderComplaintsTable(complaints, 'student')}
        </div>`;

        return this.layout(content, 'My Complaints', 'student');
    },

    // ════════════════════════════════════════════════════
    //  COMPLAINT DETAIL (Student)
    // ════════════════════════════════════════════════════
    complaintDetail(complaint) {
        if (!complaint) {
            return this.layout(`<div class="empty-state"><i class="fa-solid fa-search"></i><h3>Complaint Not Found</h3><p>The complaint you're looking for doesn't exist.</p><a href="#/student/complaints" class="btn btn-primary">Back to Complaints</a></div>`, 'Complaint Details', 'student');
        }

        const content = `
        <div class="page-header">
            <div>
                <a href="#/student/complaints" style="color:var(--primary-600);font-size:0.8125rem;font-weight:500;display:inline-flex;align-items:center;gap:4px;margin-bottom:8px;">
                    <i class="fa-solid fa-arrow-left"></i> Back to My Complaints
                </a>
                <h2>Complaint Details</h2>
            </div>
            <div>${Utils.getStatusBadge(complaint.status)} ${Utils.getPriorityBadge(complaint.priority)}</div>
        </div>

        <div class="detail-grid">
            <div>
                <div class="card" style="margin-bottom:24px;">
                    <div class="card-header">
                        <div class="detail-section-title" style="margin-bottom:0;"><i class="fa-solid fa-info-circle"></i> Complaint Information</div>
                        <span style="font-size:0.8125rem;color:var(--primary-600);font-weight:600;">${complaint.id}</span>
                    </div>
                    <div class="card-body">
                        <h3 style="font-size:1.125rem;margin-bottom:16px;">${Utils.escapeHtml(complaint.title)}</h3>
                        <div class="detail-field">
                            <span class="detail-field-label">Category</span>
                            <span class="detail-field-value"><i class="fa-solid ${Utils.getCategoryIcon(complaint.category)}" style="color:${Utils.getCategoryColor(complaint.category)};margin-right:6px;"></i>${complaint.category}</span>
                        </div>
                        <div class="detail-field">
                            <span class="detail-field-label">Location</span>
                            <span class="detail-field-value">${Utils.escapeHtml(complaint.location || '—')}</span>
                        </div>
                        <div class="detail-field">
                            <span class="detail-field-label">Submitted</span>
                            <span class="detail-field-value">${Utils.formatDateTime(complaint.createdAt)}</span>
                        </div>
                        <div class="detail-field">
                            <span class="detail-field-label">Department</span>
                            <span class="detail-field-value">${complaint.department || 'Not yet assigned'}</span>
                        </div>
                        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-color);">
                            <h4 style="font-size:0.875rem;margin-bottom:8px;">Description</h4>
                            <p style="font-size:0.875rem;line-height:1.7;">${Utils.escapeHtml(complaint.description)}</p>
                        </div>
                        ${complaint.resolution ? `
                        <div style="margin-top:20px;padding:16px;background:var(--success-50);border-radius:var(--radius-md);border:1px solid var(--success-100);">
                            <h4 style="font-size:0.875rem;margin-bottom:8px;color:var(--success-700);"><i class="fa-solid fa-circle-check" style="margin-right:6px;"></i>Resolution</h4>
                            <p style="font-size:0.875rem;color:var(--success-700);line-height:1.6;">${Utils.escapeHtml(complaint.resolution)}</p>
                        </div>` : ''}

                        ${complaint.notes && complaint.notes.length > 0 ? `
                        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-color);">
                            <h4 style="font-size:0.875rem;margin-bottom:12px;">Admin Notes</h4>
                            ${complaint.notes.map(n => `
                                <div class="admin-note">
                                    <div class="admin-note-header">
                                        <span class="admin-note-author">${Utils.escapeHtml(n.author)}</span>
                                        <span class="admin-note-date">${Utils.formatDateTime(n.date)}</span>
                                    </div>
                                    <p>${Utils.escapeHtml(n.text)}</p>
                                </div>
                            `).join('')}
                        </div>` : ''}
                    </div>
                </div>

                ${complaint.status === 'Resolved' && !complaint.feedback ? `
                <div class="card">
                    <div class="card-header">
                        <div class="detail-section-title" style="margin-bottom:0;"><i class="fa-solid fa-star"></i> Leave Feedback</div>
                    </div>
                    <div class="card-body">
                        <form id="feedback-form" data-complaint-id="${complaint.id}">
                            <div class="form-group">
                                <label class="form-label">Rating</label>
                                <div id="star-rating" style="display:flex;gap:8px;font-size:1.5rem;cursor:pointer;" data-rating="0">
                                    ${[1,2,3,4,5].map(i => `<i class="fa-regular fa-star star-btn" data-value="${i}" style="color:var(--warning-500);transition:all 0.15s;"></i>`).join('')}
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="feedback-comment">Your Feedback</label>
                                <textarea id="feedback-comment" class="form-textarea" placeholder="Share your experience..." rows="3"></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-paper-plane"></i> Submit Feedback</button>
                        </form>
                    </div>
                </div>` : ''}

                ${complaint.feedback ? `
                <div class="card">
                    <div class="card-header">
                        <div class="detail-section-title" style="margin-bottom:0;"><i class="fa-solid fa-star"></i> Your Feedback</div>
                    </div>
                    <div class="card-body">
                        <div style="display:flex;gap:4px;font-size:1.25rem;margin-bottom:12px;">
                            ${[1,2,3,4,5].map(i => `<i class="fa-solid fa-star" style="color:${i <= complaint.feedback.rating ? 'var(--warning-500)' : 'var(--gray-300)'};"></i>`).join('')}
                        </div>
                        <p style="font-size:0.875rem;">${Utils.escapeHtml(complaint.feedback.comment)}</p>
                    </div>
                </div>` : ''}
            </div>

            <div>
                <div class="card">
                    <div class="card-header">
                        <div class="detail-section-title" style="margin-bottom:0;"><i class="fa-solid fa-timeline"></i> Timeline</div>
                    </div>
                    <div class="card-body">
                        ${this._renderTimeline(complaint.timeline)}
                    </div>
                </div>
            </div>
        </div>`;

        return this.layout(content, 'Complaint Details', 'student');
    },

    // ════════════════════════════════════════════════════
    //  STUDENT NOTIFICATIONS
    // ════════════════════════════════════════════════════
    studentNotifications() {
        const user = Auth.getCurrentUser();
        const notifs = Notifications.getAll(user.id);

        const content = `
        <div class="page-header">
            <h2>Notifications</h2>
            ${notifs.some(n => !n.read) ? `<button class="btn btn-outline btn-sm" data-action="mark-all-read"><i class="fa-solid fa-check-double"></i> Mark All Read</button>` : ''}
        </div>

        ${notifs.length > 0 ? `
        <div class="card">
            ${notifs.map(n => `
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
            `).join('')}
        </div>` : `
        <div class="card">
            <div class="empty-state">
                <i class="fa-solid fa-bell-slash"></i>
                <h3>No notifications</h3>
                <p>You'll be notified when there are updates to your complaints.</p>
            </div>
        </div>`}`;

        return this.layout(content, 'Notifications', 'student');
    },

    // ════════════════════════════════════════════════════
    //  STUDENT PROFILE
    // ════════════════════════════════════════════════════
    studentProfile() {
        const user = Auth.getCurrentUser();
        const content = `
        <div class="page-header">
            <h2>My Profile</h2>
            <button class="btn btn-primary btn-sm" id="edit-profile-btn"><i class="fa-solid fa-pen"></i> Edit Profile</button>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="profile-header">
                    <div class="profile-avatar-lg">${user.avatar || 'U'}</div>
                    <div class="profile-info">
                        <h2>${Utils.escapeHtml(user.name)}</h2>
                        <p>${Utils.escapeHtml(user.course || 'Student')} • ${Utils.escapeHtml(user.year || '')}</p>
                    </div>
                </div>

                <div id="profile-display">
                    <div class="profile-grid">
                        <div class="profile-field">
                            <div class="profile-field-label">Student ID</div>
                            <div class="profile-field-value">${Utils.escapeHtml(user.id)}</div>
                        </div>
                        <div class="profile-field">
                            <div class="profile-field-label">Email</div>
                            <div class="profile-field-value">${Utils.escapeHtml(user.email)}</div>
                        </div>
                        <div class="profile-field">
                            <div class="profile-field-label">Phone</div>
                            <div class="profile-field-value">${Utils.escapeHtml(user.phone || 'Not provided')}</div>
                        </div>
                        <div class="profile-field">
                            <div class="profile-field-label">Course</div>
                            <div class="profile-field-value">${Utils.escapeHtml(user.course || 'Not provided')}</div>
                        </div>
                        <div class="profile-field">
                            <div class="profile-field-label">Year</div>
                            <div class="profile-field-value">${Utils.escapeHtml(user.year || 'Not provided')}</div>
                        </div>
                        <div class="profile-field">
                            <div class="profile-field-label">Member Since</div>
                            <div class="profile-field-value">${Utils.formatDate(user.createdAt)}</div>
                        </div>
                    </div>
                </div>

                <div id="profile-edit" style="display:none;">
                    <form id="profile-edit-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="edit-name">Full Name</label>
                                <input type="text" id="edit-name" class="form-input" value="${Utils.escapeHtml(user.name)}">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="edit-phone">Phone</label>
                                <input type="tel" id="edit-phone" class="form-input" value="${Utils.escapeHtml(user.phone || '')}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label" for="edit-course">Course</label>
                                <input type="text" id="edit-course" class="form-input" value="${Utils.escapeHtml(user.course || '')}">
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="edit-year">Year</label>
                                <select id="edit-year" class="form-select">
                                    <option value="">Select year</option>
                                    ${['1st Year','2nd Year','3rd Year','4th Year','5th Year'].map(y => `<option value="${y}" ${user.year === y ? 'selected' : ''}>${y}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="btn-group" style="margin-top:16px;">
                            <button type="submit" class="btn btn-primary btn-sm"><i class="fa-solid fa-check"></i> Save Changes</button>
                            <button type="button" class="btn btn-outline btn-sm" id="cancel-edit-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>`;

        return this.layout(content, 'Profile', 'student');
    },

    // ════════════════════════════════════════════════════
    //  HELP & SUPPORT
    // ════════════════════════════════════════════════════
    helpSupport() {
        const faqs = [
            { q: 'What type of complaints can I submit?', a: 'You can submit complaints related to hostel facilities, water supply, electricity, Wi-Fi, classroom issues, cleaning, food/canteen quality, transportation, security, and academic matters. If your issue doesn\'t fit any category, use "Other".' },
            { q: 'How long does complaint resolution take?', a: 'Resolution time varies by category and priority. Urgent complaints are typically addressed within 24 hours. High priority within 2-3 days. Medium and low priority complaints usually take 5-7 business days. You can track progress in real-time through your dashboard.' },
            { q: 'How can I track my complaint?', a: 'After logging in, go to "My Complaints" from the sidebar. You\'ll see all your complaints with their current status. Click on any complaint to view its detailed timeline and progress.' },
            { q: 'What happens after I submit a complaint?', a: 'Your complaint is received and reviewed by the administration. It is then assigned to the relevant department. The assigned team works on resolving the issue. You receive notifications at every step. Once resolved, you can provide feedback.' },
            { q: 'Can I edit or delete a complaint?', a: 'Once submitted, complaints cannot be edited or deleted to maintain transparency and accountability. If you need to add more information, you can contact the administration.' },
            { q: 'How do I provide feedback?', a: 'Once your complaint is resolved, a feedback form will appear on the complaint details page. You can rate the resolution and leave comments about your experience.' }
        ];

        const content = `
        <div class="page-header">
            <h2>Help & Support</h2>
        </div>

        <div class="card" style="margin-bottom:24px;">
            <div class="card-header">
                <div class="detail-section-title" style="margin-bottom:0;"><i class="fa-solid fa-circle-question"></i> Frequently Asked Questions</div>
            </div>
            <div class="card-body">
                ${faqs.map((faq, i) => `
                    <div class="faq-item" data-faq="${i}">
                        <div class="faq-question" data-action="toggle-faq" data-index="${i}">
                            ${faq.q}
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <div class="faq-answer-content">${faq.a}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="card" style="margin-bottom:24px;">
            <div class="card-header">
                <div class="detail-section-title" style="margin-bottom:0;"><i class="fa-solid fa-book"></i> Complaint Guidelines</div>
            </div>
            <div class="card-body">
                <ul style="padding-left:20px;list-style:disc;">
                    <li style="margin-bottom:8px;font-size:0.875rem;color:var(--text-secondary);">Provide clear and specific details about the issue</li>
                    <li style="margin-bottom:8px;font-size:0.875rem;color:var(--text-secondary);">Include the exact location where the problem exists</li>
                    <li style="margin-bottom:8px;font-size:0.875rem;color:var(--text-secondary);">Upload photos or evidence when possible</li>
                    <li style="margin-bottom:8px;font-size:0.875rem;color:var(--text-secondary);">Select the appropriate category and priority level</li>
                    <li style="margin-bottom:8px;font-size:0.875rem;color:var(--text-secondary);">Avoid submitting duplicate complaints for the same issue</li>
                    <li style="font-size:0.875rem;color:var(--text-secondary);">Use respectful and professional language</li>
                </ul>
            </div>
        </div>

        <div class="contact-grid stagger">
            <div class="contact-card card">
                <i class="fa-solid fa-phone"></i>
                <h4>Help Desk</h4>
                <p>+91 11 2345 6789</p>
                <p style="font-size:0.75rem;margin-top:4px;">Mon-Fri, 9AM - 5PM</p>
            </div>
            <div class="contact-card card">
                <i class="fa-solid fa-envelope"></i>
                <h4>Email Support</h4>
                <p>support@university.edu</p>
                <p style="font-size:0.75rem;margin-top:4px;">Response within 24 hours</p>
            </div>
            <div class="contact-card card">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <h4>Emergency</h4>
                <p>+91 11 2345 0000</p>
                <p style="font-size:0.75rem;margin-top:4px;">Available 24/7</p>
            </div>
        </div>`;

        return this.layout(content, 'Help & Support', 'student');
    },

    // ════════════════════════════════════════════════════
    //  ADMIN DASHBOARD
    // ════════════════════════════════════════════════════
    adminDashboard(stats = {}, recent = []) {

        const content = `
        <div class="welcome-banner">
            <h2>Admin Dashboard 📊</h2>
            <p>Manage complaints, track resolutions, and keep your campus running smoothly.</p>
        </div>

        <div class="stat-cards stagger">
            <div class="stat-card total">
                <div class="stat-icon"><i class="fa-solid fa-file-lines"></i></div>
                <div class="stat-info">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">Total Complaints</div>
                    ${Charts.renderMiniStat(stats.total, stats.total, 'var(--primary-500)')}
                </div>
            </div>
            <div class="stat-card pending">
                <div class="stat-icon"><i class="fa-solid fa-clock"></i></div>
                <div class="stat-info">
                    <div class="stat-number">${stats.pending}</div>
                    <div class="stat-label">Pending</div>
                    ${Charts.renderMiniStat(stats.pending, stats.total, 'var(--warning-500)')}
                </div>
            </div>
            <div class="stat-card progress">
                <div class="stat-icon"><i class="fa-solid fa-spinner"></i></div>
                <div class="stat-info">
                    <div class="stat-number">${stats.inProgress}</div>
                    <div class="stat-label">In Progress</div>
                    ${Charts.renderMiniStat(stats.inProgress, stats.total, 'var(--primary-400)')}
                </div>
            </div>
            <div class="stat-card resolved">
                <div class="stat-icon"><i class="fa-solid fa-circle-check"></i></div>
                <div class="stat-info">
                    <div class="stat-number">${stats.resolved}</div>
                    <div class="stat-label">Resolved</div>
                    ${Charts.renderMiniStat(stats.resolved, stats.total, 'var(--success-500)')}
                </div>
            </div>
            <div class="stat-card urgent">
                <div class="stat-icon"><i class="fa-solid fa-circle-exclamation"></i></div>
                <div class="stat-info">
                    <div class="stat-number">${stats.urgent}</div>
                    <div class="stat-label">Urgent</div>
                    ${Charts.renderMiniStat(stats.urgent, stats.total, 'var(--error-500)')}
                </div>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;">
            <div class="card">
                <div class="card-header"><h3 style="font-size:0.9375rem;">Status Distribution</h3></div>
                <div class="chart-container" id="status-chart"></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 style="font-size:0.9375rem;">Monthly Trends</h3></div>
                <div class="chart-container" id="monthly-chart"></div>
            </div>
        </div>

        <div class="page-header">
            <h2>Recent Complaints</h2>
            <a href="#/admin/complaints" class="btn btn-outline btn-sm">View All <i class="fa-solid fa-arrow-right"></i></a>
        </div>

        <div class="card">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Student</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recent.map(c => `
                        <tr>
                            <td data-label="ID"><strong style="color:var(--primary-600);font-size:0.8125rem;">${c.id}</strong></td>
                            <td data-label="Title" class="complaint-title-cell">${Utils.escapeHtml(c.title)}</td>
                            <td data-label="Student">${Utils.escapeHtml(c.studentName)}</td>
                            <td data-label="Category">${c.category}</td>
                            <td data-label="Priority">${Utils.getPriorityBadge(c.priority)}</td>
                            <td data-label="Status">${Utils.getStatusBadge(c.status)}</td>
                            <td data-label="Date">${Utils.formatDate(c.createdAt)}</td>
                            <td data-label="Action"><a href="#/admin/complaint/${c.id}" class="btn btn-outline btn-sm">Manage</a></td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;

        return this.layout(content, 'Dashboard', 'admin');
    },

    // ════════════════════════════════════════════════════
    //  ADMIN ALL COMPLAINTS
    // ════════════════════════════════════════════════════
    adminComplaints(complaints = []) {
        const departments = DataStore.get(DataStore.KEYS.DEPARTMENTS) || [];

        const content = `
        <div class="page-header">
            <h2>All Complaints</h2>
        </div>

        <div class="toolbar">
            <div class="search-box">
                <i class="fa-solid fa-search"></i>
                <input type="text" id="search-input" placeholder="Search by ID, title, student..." aria-label="Search complaints">
            </div>
            <select class="filter-select" id="filter-category" aria-label="Filter by category">
                <option value="">All Categories</option>
                ${Complaints.CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
            <select class="filter-select" id="filter-status" aria-label="Filter by status">
                <option value="">All Statuses</option>
                ${Complaints.STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <select class="filter-select" id="filter-priority" aria-label="Filter by priority">
                <option value="">All Priorities</option>
                ${Complaints.PRIORITIES.map(p => `<option value="${p}">${p}</option>`).join('')}
            </select>
            <select class="filter-select" id="sort-by" aria-label="Sort by">
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="priority-desc">Highest Priority</option>
                <option value="priority-asc">Lowest Priority</option>
            </select>
        </div>

        <div id="complaints-list">
            ${this._renderComplaintsTable(complaints, 'admin')}
        </div>`;

        return this.layout(content, 'All Complaints', 'admin');
    },

    // ════════════════════════════════════════════════════
    //  ADMIN COMPLAINT DETAIL
    // ════════════════════════════════════════════════════
    adminComplaintDetail(complaint, student = null) {
        if (!complaint) {
            return this.layout(`<div class="empty-state"><i class="fa-solid fa-search"></i><h3>Complaint Not Found</h3><p>The complaint you're looking for doesn't exist.</p><a href="#/admin/complaints" class="btn btn-primary">Back to Complaints</a></div>`, 'Complaint Details', 'admin');
        }

        const departments = DataStore.get(DataStore.KEYS.DEPARTMENTS) || [];

        const content = `
        <div class="page-header">
            <div>
                <a href="#/admin/complaints" style="color:var(--primary-600);font-size:0.8125rem;font-weight:500;display:inline-flex;align-items:center;gap:4px;margin-bottom:8px;">
                    <i class="fa-solid fa-arrow-left"></i> Back to All Complaints
                </a>
                <h2>Manage Complaint</h2>
            </div>
            <div>${Utils.getStatusBadge(complaint.status)} ${Utils.getPriorityBadge(complaint.priority)}</div>
        </div>

        <div class="detail-grid">
            <div>
                <!-- Student Info -->
                <div class="card" style="margin-bottom:24px;">
                    <div class="card-header">
                        <div class="detail-section-title" style="margin-bottom:0;"><i class="fa-solid fa-user"></i> Student Information</div>
                    </div>
                    <div class="card-body">
                        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
                            <div class="header-avatar" style="width:44px;height:44px;font-size:0.9375rem;">${student ? student.avatar : '??'}</div>
                            <div>
                                <div style="font-weight:600;font-size:0.9375rem;">${Utils.escapeHtml(complaint.studentName)}</div>
                                <div style="font-size:0.8125rem;color:var(--text-tertiary);">${complaint.studentId} • ${student ? student.email : ''}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Complaint Info -->
                <div class="card" style="margin-bottom:24px;">
                    <div class="card-header">
                        <div class="detail-section-title" style="margin-bottom:0;"><i class="fa-solid fa-info-circle"></i> Complaint Details</div>
                        <span style="font-size:0.8125rem;color:var(--primary-600);font-weight:600;">${complaint.id}</span>
                    </div>
                    <div class="card-body">
                        <h3 style="font-size:1.125rem;margin-bottom:16px;">${Utils.escapeHtml(complaint.title)}</h3>
                        <div class="detail-field">
                            <span class="detail-field-label">Category</span>
                            <span class="detail-field-value"><i class="fa-solid ${Utils.getCategoryIcon(complaint.category)}" style="color:${Utils.getCategoryColor(complaint.category)};margin-right:6px;"></i>${complaint.category}</span>
                        </div>
                        <div class="detail-field">
                            <span class="detail-field-label">Location</span>
                            <span class="detail-field-value">${Utils.escapeHtml(complaint.location || '—')}</span>
                        </div>
                        <div class="detail-field">
                            <span class="detail-field-label">Submitted</span>
                            <span class="detail-field-value">${Utils.formatDateTime(complaint.createdAt)}</span>
                        </div>
                        <div class="detail-field">
                            <span class="detail-field-label">Last Updated</span>
                            <span class="detail-field-value">${Utils.formatDateTime(complaint.updatedAt)}</span>
                        </div>
                        ${complaint.contact ? `<div class="detail-field"><span class="detail-field-label">Contact</span><span class="detail-field-value">${Utils.escapeHtml(complaint.contact)}</span></div>` : ''}
                        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-color);">
                            <h4 style="font-size:0.875rem;margin-bottom:8px;">Description</h4>
                            <p style="font-size:0.875rem;line-height:1.7;">${Utils.escapeHtml(complaint.description)}</p>
                        </div>

                        ${complaint.resolution ? `
                        <div style="margin-top:20px;padding:16px;background:var(--success-50);border-radius:var(--radius-md);border:1px solid var(--success-100);">
                            <h4 style="font-size:0.875rem;margin-bottom:8px;color:var(--success-700);"><i class="fa-solid fa-circle-check" style="margin-right:6px;"></i>Resolution</h4>
                            <p style="font-size:0.875rem;color:var(--success-700);line-height:1.6;">${Utils.escapeHtml(complaint.resolution)}</p>
                        </div>` : ''}

                        ${complaint.notes && complaint.notes.length > 0 ? `
                        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-color);">
                            <h4 style="font-size:0.875rem;margin-bottom:12px;">Admin Notes</h4>
                            ${complaint.notes.map(n => `
                                <div class="admin-note">
                                    <div class="admin-note-header">
                                        <span class="admin-note-author">${Utils.escapeHtml(n.author)}</span>
                                        <span class="admin-note-date">${Utils.formatDateTime(n.date)}</span>
                                    </div>
                                    <p>${Utils.escapeHtml(n.text)}</p>
                                </div>
                            `).join('')}
                        </div>` : ''}

                        ${complaint.feedback ? `
                        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border-color);">
                            <h4 style="font-size:0.875rem;margin-bottom:12px;"><i class="fa-solid fa-star" style="color:var(--warning-500);margin-right:6px;"></i>Student Feedback</h4>
                            <div style="display:flex;gap:4px;font-size:1rem;margin-bottom:8px;">
                                ${[1,2,3,4,5].map(i => `<i class="fa-solid fa-star" style="color:${i <= complaint.feedback.rating ? 'var(--warning-500)' : 'var(--gray-300)'};"></i>`).join('')}
                            </div>
                            <p style="font-size:0.875rem;">${Utils.escapeHtml(complaint.feedback.comment)}</p>
                        </div>` : ''}
                    </div>
                </div>
            </div>

            <div>
                <!-- Admin Actions -->
                <div class="card" style="margin-bottom:24px;">
                    <div class="card-header">
                        <div class="detail-section-title" style="margin-bottom:0;"><i class="fa-solid fa-sliders"></i> Actions</div>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Change Status</label>
                            <select class="form-select" id="admin-status-select" data-complaint-id="${complaint.id}">
                                ${['Pending', 'In Progress', 'Resolved'].map(s => `<option value="${s}" ${complaint.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Assign Department</label>
                            <select class="form-select" id="admin-dept-select" data-complaint-id="${complaint.id}">
                                <option value="">Select Department</option>
                                ${departments.map(d => `<option value="${d.name}" ${complaint.department === d.name ? 'selected' : ''}>${d.name}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Change Priority</label>
                            <select class="form-select" id="admin-priority-select" data-complaint-id="${complaint.id}">
                                ${Complaints.PRIORITIES.map(p => `<option value="${p}" ${complaint.priority === p ? 'selected' : ''}>${p}</option>`).join('')}
                            </select>
                        </div>

                        <button class="btn btn-primary btn-sm w-full" id="save-admin-changes" data-complaint-id="${complaint.id}" style="margin-top:8px;">
                            <i class="fa-solid fa-check"></i> Save Changes
                        </button>
                    </div>
                </div>

                <!-- Add Note -->
                <div class="card" style="margin-bottom:24px;">
                    <div class="card-header">
                        <div class="detail-section-title" style="margin-bottom:0;"><i class="fa-solid fa-note-sticky"></i> Add Note</div>
                    </div>
                    <div class="card-body">
                        <div class="form-group" style="margin-bottom:12px;">
                            <textarea id="admin-note-text" class="form-textarea" placeholder="Add an internal note..." rows="3"></textarea>
                        </div>
                        <button class="btn btn-outline btn-sm w-full" id="add-admin-note-btn" data-complaint-id="${complaint.id}">
                            <i class="fa-solid fa-plus"></i> Add Note
                        </button>
                    </div>
                </div>

                <!-- Resolve -->
                ${complaint.status !== 'Resolved' ? `
                <div class="card" style="margin-bottom:24px;">
                    <div class="card-header">
                        <div class="detail-section-title" style="margin-bottom:0;"><i class="fa-solid fa-circle-check"></i> Resolve Complaint</div>
                    </div>
                    <div class="card-body">
                        <div class="form-group" style="margin-bottom:12px;">
                            <textarea id="resolution-text" class="form-textarea" placeholder="Describe the resolution..." rows="3"></textarea>
                        </div>
                        <button class="btn btn-success btn-sm w-full" id="resolve-complaint-btn" data-complaint-id="${complaint.id}">
                            <i class="fa-solid fa-check-double"></i> Resolve & Close
                        </button>
                    </div>
                </div>` : ''}

                <!-- Timeline -->
                <div class="card">
                    <div class="card-header">
                        <div class="detail-section-title" style="margin-bottom:0;"><i class="fa-solid fa-timeline"></i> Timeline</div>
                    </div>
                    <div class="card-body">
                        ${this._renderTimeline(complaint.timeline)}
                    </div>
                </div>
            </div>
        </div>`;

        return this.layout(content, 'Manage Complaint', 'admin');
    },

    // ════════════════════════════════════════════════════
    //  ADMIN URGENT COMPLAINTS
    // ════════════════════════════════════════════════════
    adminUrgent(urgent = []) {

        const content = `
        <div class="page-header">
            <h2><i class="fa-solid fa-circle-exclamation" style="color:var(--error-500);margin-right:8px;"></i> Urgent Complaints</h2>
        </div>

        ${urgent.length > 0 ? `
        <div class="card">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr><th>ID</th><th>Title</th><th>Student</th><th>Category</th><th>Status</th><th>Date</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        ${urgent.map(c => `
                        <tr>
                            <td data-label="ID"><strong style="color:var(--error-600);">${c.id}</strong></td>
                            <td data-label="Title" class="complaint-title-cell">${Utils.escapeHtml(c.title)}</td>
                            <td data-label="Student">${Utils.escapeHtml(c.studentName)}</td>
                            <td data-label="Category">${c.category}</td>
                            <td data-label="Status">${Utils.getStatusBadge(c.status)}</td>
                            <td data-label="Date">${Utils.formatDate(c.createdAt)}</td>
                            <td data-label="Action"><a href="#/admin/complaint/${c.id}" class="btn btn-danger btn-sm">Manage</a></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>` : `
        <div class="card">
            <div class="empty-state">
                <i class="fa-solid fa-check-circle" style="color:var(--success-500);"></i>
                <h3>No Urgent Complaints</h3>
                <p>All urgent complaints have been resolved. Great job!</p>
            </div>
        </div>`}`;

        return this.layout(content, 'Urgent Complaints', 'admin');
    },

    // ════════════════════════════════════════════════════
    //  ADMIN STUDENTS
    // ════════════════════════════════════════════════════
    adminStudents(students = []) {

        const content = `
        <div class="page-header">
            <h2>Students</h2>
        </div>

        <div class="card">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr><th>Student ID</th><th>Name</th><th>Email</th><th>Course</th><th>Year</th><th>Total</th><th>Pending</th><th>Resolved</th></tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                        <tr>
                            <td data-label="ID"><strong>${Utils.escapeHtml(s.id)}</strong></td>
                            <td data-label="Name">
                                <div style="display:flex;align-items:center;gap:10px;">
                                    <div class="header-avatar" style="width:30px;height:30px;font-size:0.6875rem;">${s.avatar}</div>
                                    ${Utils.escapeHtml(s.name)}
                                </div>
                            </td>
                            <td data-label="Email">${Utils.escapeHtml(s.email)}</td>
                            <td data-label="Course">${Utils.escapeHtml(s.course || '—')}</td>
                            <td data-label="Year">${Utils.escapeHtml(s.year || '—')}</td>
                            <td data-label="Total"><strong>${s.totalComplaints}</strong></td>
                            <td data-label="Pending"><span class="badge-status badge-pending">${s.pendingComplaints}</span></td>
                            <td data-label="Resolved"><span class="badge-status badge-resolved">${s.resolvedComplaints}</span></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;

        return this.layout(content, 'Students', 'admin');
    },

    // ════════════════════════════════════════════════════
    //  ADMIN DEPARTMENTS
    // ════════════════════════════════════════════════════
    adminDepartments(departments = []) {

        const content = `
        <div class="page-header">
            <h2>Departments</h2>
        </div>

        <div class="dept-grid stagger">
            ${departments.map(d => `
                <div class="dept-card card">
                    <div class="dept-card-header">
                        <div class="dept-card-icon"><i class="fa-solid ${d.icon}"></i></div>
                        <div>
                            <h4>${d.name}</h4>
                            <small style="color:var(--text-tertiary);">${d.head}</small>
                        </div>
                    </div>
                    <div class="dept-card-stats">
                        <div class="dept-card-stat">
                            <div class="count">${d.total}</div>
                            <div class="label">Total</div>
                        </div>
                        <div class="dept-card-stat">
                            <div class="count" style="color:var(--warning-600);">${d.pending}</div>
                            <div class="label">Pending</div>
                        </div>
                        <div class="dept-card-stat">
                            <div class="count" style="color:var(--primary-500);">${d.inProgress}</div>
                            <div class="label">Active</div>
                        </div>
                        <div class="dept-card-stat">
                            <div class="count" style="color:var(--success-600);">${d.resolved}</div>
                            <div class="label">Done</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>`;

        return this.layout(content, 'Departments', 'admin');
    },

    // ════════════════════════════════════════════════════
    //  ADMIN REPORTS
    // ════════════════════════════════════════════════════
    adminReports(stats = {}, departments = []) {
        const content = `
        <div class="page-header">
            <h2>Reports & Analytics</h2>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
            <div class="card">
                <div class="card-header"><h3 style="font-size:0.9375rem;">Status Distribution</h3></div>
                <div class="chart-container" id="report-status-chart"></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 style="font-size:0.9375rem;">Monthly Trends</h3></div>
                <div class="chart-container" id="report-monthly-chart"></div>
            </div>
        </div>

        <div class="card" style="margin-bottom:24px;">
            <div class="card-header"><h3 style="font-size:0.9375rem;">Complaints by Category</h3></div>
            <div class="chart-container" id="report-category-chart"></div>
        </div>

        <div class="card">
            <div class="card-header"><h3 style="font-size:0.9375rem;">Department Performance</h3></div>
            <div class="card-body">
                <div class="table-container" style="border:none;">
                    <table class="data-table">
                        <thead>
                            <tr><th>Department</th><th>Total</th><th>Pending</th><th>In Progress</th><th>Resolved</th><th>Resolution Rate</th></tr>
                        </thead>
                        <tbody>
                            ${departments.filter(d => d.total > 0).map(d => {
                                const rate = d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 0;
                                return `
                                <tr>
                                    <td data-label="Department"><strong>${d.name}</strong></td>
                                    <td data-label="Total">${d.total}</td>
                                    <td data-label="Pending">${d.pending}</td>
                                    <td data-label="In Progress">${d.inProgress}</td>
                                    <td data-label="Resolved">${d.resolved}</td>
                                    <td data-label="Rate">
                                        <div style="display:flex;align-items:center;gap:8px;">
                                            <div style="flex:1;max-width:100px;height:6px;background:var(--gray-200);border-radius:3px;overflow:hidden;">
                                                <div style="width:${rate}%;height:100%;background:${rate >= 80 ? 'var(--success-500)' : rate >= 50 ? 'var(--warning-500)' : 'var(--error-500)'};border-radius:3px;"></div>
                                            </div>
                                            <span style="font-size:0.8125rem;font-weight:600;">${rate}%</span>
                                        </div>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;

        return this.layout(content, 'Reports', 'admin');
    },

    // ════════════════════════════════════════════════════
    //  ADMIN NOTIFICATIONS
    // ════════════════════════════════════════════════════
    adminNotifications() {
        const user = Auth.getCurrentUser();
        const notifs = Notifications.getAll(user.id);

        const content = `
        <div class="page-header">
            <h2>Notifications</h2>
            ${notifs.some(n => !n.read) ? `<button class="btn btn-outline btn-sm" data-action="mark-all-read"><i class="fa-solid fa-check-double"></i> Mark All Read</button>` : ''}
        </div>

        ${notifs.length > 0 ? `
        <div class="card">
            ${notifs.map(n => `
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
            `).join('')}
        </div>` : `
        <div class="card">
            <div class="empty-state">
                <i class="fa-solid fa-bell-slash"></i>
                <h3>No notifications</h3>
                <p>You'll be notified when new complaints arrive.</p>
            </div>
        </div>`}`;

        return this.layout(content, 'Notifications', 'admin');
    },

    // ════════════════════════════════════════════════════
    //  ADMIN SETTINGS
    // ════════════════════════════════════════════════════
    adminSettings() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const content = `
        <div class="page-header">
            <h2>Settings</h2>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="settings-section">
                    <h3>Appearance</h3>
                    <div class="setting-row">
                        <div class="setting-info">
                            <h4>Dark Mode</h4>
                            <p>Switch between light and dark themes</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="dark-mode-toggle" ${isDark ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Notifications</h3>
                    <div class="setting-row">
                        <div class="setting-info">
                            <h4>Email Notifications</h4>
                            <p>Receive email alerts for new complaints</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-row">
                        <div class="setting-info">
                            <h4>Urgent Alerts</h4>
                            <p>Get instant notifications for urgent complaints</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                <div class="settings-section">
                    <h3>Data Management</h3>
                    <div class="setting-row">
                        <div class="setting-info">
                            <h4>Reset Data</h4>
                            <p>Clear all data and restore sample complaints</p>
                        </div>
                        <button class="btn btn-danger btn-sm" data-action="reset-data">
                            <i class="fa-solid fa-rotate-left"></i> Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

        return this.layout(content, 'Settings', 'admin');
    },

    // ════════════════════════════════════════════════════
    //  SHARED HELPERS
    // ════════════════════════════════════════════════════
    _renderComplaintsTable(complaints, role) {
        if (complaints.length === 0) {
            return `<div class="card"><div class="empty-state"><i class="fa-solid fa-inbox"></i><h3>No complaints found</h3><p>Try adjusting your search or filter criteria.</p></div></div>`;
        }

        const detailPath = role === 'admin' ? '#/admin/complaint' : '#/student/complaint';
        const showStudent = role === 'admin';

        return `
        <div class="card">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            ${showStudent ? '<th>Student</th>' : ''}
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${complaints.map(c => `
                        <tr>
                            <td data-label="ID"><strong style="color:var(--primary-600);font-size:0.8125rem;">${c.id}</strong></td>
                            <td data-label="Title" class="complaint-title-cell">${Utils.escapeHtml(c.title)}</td>
                            ${showStudent ? `<td data-label="Student">${Utils.escapeHtml(c.studentName)}</td>` : ''}
                            <td data-label="Category"><i class="fa-solid ${Utils.getCategoryIcon(c.category)}" style="color:${Utils.getCategoryColor(c.category)};margin-right:6px;"></i>${c.category}</td>
                            <td data-label="Priority">${Utils.getPriorityBadge(c.priority)}</td>
                            <td data-label="Status">${Utils.getStatusBadge(c.status)}</td>
                            <td data-label="Date">${Utils.formatDate(c.createdAt)}</td>
                            <td data-label="Action"><a href="${detailPath}/${c.id}" class="btn btn-outline btn-sm">${role === 'admin' ? 'Manage' : 'View'}</a></td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
    },

    _renderTimeline(timeline) {
        if (!timeline || timeline.length === 0) return '<p>No timeline data</p>';

        // Determine current step
        let currentIdx = -1;
        for (let i = timeline.length - 1; i >= 0; i--) {
            if (timeline[i].completed) { currentIdx = i; break; }
        }

        return `
        <div class="timeline">
            ${timeline.map((step, i) => {
                let cls = 'upcoming';
                if (step.completed && i < currentIdx) cls = 'completed';
                else if (step.completed && i === currentIdx) cls = timeline.every(s => s.completed) ? 'completed' : 'current';

                return `
                <div class="timeline-item ${cls}">
                    <div class="timeline-dot">
                        <i class="fa-solid ${cls === 'completed' ? 'fa-check' : cls === 'current' ? 'fa-circle' : ''}"></i>
                    </div>
                    <div class="timeline-content">
                        <h4>${step.step}</h4>
                        <p class="timeline-date">${step.date ? Utils.formatDateTime(step.date) : 'Pending'}</p>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    }
};
