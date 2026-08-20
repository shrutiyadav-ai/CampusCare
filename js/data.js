/* ============================================================
   CampusCare – Data Layer
   LocalStorage utilities for UI preferences
   ============================================================ */

const DataStore = {
    KEYS: {
        NOTIFICATIONS: 'cc_notifications',
        DEPARTMENTS: 'cc_departments',
        THEME: 'cc_theme',
        COUNTER: 'cc_complaint_counter'
    },

    // ── localStorage helpers ────────────────────────────
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('DataStore.get error:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('DataStore.set error:', e);
        }
    },

    // ── Initialization ──────────────────────────────────
    init() {
        // Clean up legacy auth keys to prevent stale localStorage references
        const legacyKeys = ['cc_users', 'cc_current_user', 'cc_complaints'];
        legacyKeys.forEach(k => localStorage.removeItem(k));

        if (!this.get(this.KEYS.DEPARTMENTS)) {
            this.set(this.KEYS.DEPARTMENTS, this.getDefaultDepartments());
        }
        if (!this.get(this.KEYS.NOTIFICATIONS)) {
            this.set(this.KEYS.NOTIFICATIONS, []);
        }
        if (!this.get(this.KEYS.COUNTER)) {
            this.set(this.KEYS.COUNTER, 100);
        }

        // Theme
        const theme = this.get(this.KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    },

    getNextComplaintId() {
        let counter = this.get(this.KEYS.COUNTER) || 100;
        counter++;
        this.set(this.KEYS.COUNTER, counter);
        const year = new Date().getFullYear();
        return `CMP-${year}-${String(counter).padStart(5, '0')}`;
    },

    // ── Default Departments ─────────────────────────────
    getDefaultDepartments() {
        return [
            { id: 'DEPT01', name: 'Hostel Management', icon: 'fa-building', head: 'Mr. Rajesh Singh', email: 'hostel@university.edu' },
            { id: 'DEPT02', name: 'Maintenance', icon: 'fa-wrench', head: 'Mr. Sunil Yadav', email: 'maintenance@university.edu' },
            { id: 'DEPT03', name: 'IT Department', icon: 'fa-laptop-code', head: 'Ms. Kavita Nair', email: 'it@university.edu' },
            { id: 'DEPT04', name: 'Administration', icon: 'fa-landmark', head: 'Dr. Meera Joshi', email: 'admin-dept@university.edu' },
            { id: 'DEPT05', name: 'Security', icon: 'fa-shield-halved', head: 'Mr. Vikram Rathore', email: 'security@university.edu' },
            { id: 'DEPT06', name: 'Transport', icon: 'fa-bus', head: 'Mr. Prakash Gupta', email: 'transport@university.edu' },
            { id: 'DEPT07', name: 'Canteen', icon: 'fa-utensils', head: 'Mrs. Lakshmi Devi', email: 'canteen@university.edu' },
            { id: 'DEPT08', name: 'Academic Department', icon: 'fa-graduation-cap', head: 'Prof. Anil Mehta', email: 'academic@university.edu' }
        ];
    }
};
