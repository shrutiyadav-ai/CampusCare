/* ============================================================
   CampusCare – Data Layer
   Sample data, localStorage CRUD, seeding
   ============================================================ */

const DataStore = {
    KEYS: {
        USERS: 'cc_users',
        COMPLAINTS: 'cc_complaints',
        NOTIFICATIONS: 'cc_notifications',
        DEPARTMENTS: 'cc_departments',
        CURRENT_USER: 'cc_current_user',
        COUNTER: 'cc_complaint_counter',
        THEME: 'cc_theme',
        SETTINGS: 'cc_settings',
        DATA_VERSION: 'cc_data_version'
    },

    // Bump this to force re-seed of users on next load
    CURRENT_VERSION: 2,

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
        const storedVersion = this.get(this.KEYS.DATA_VERSION) || 0;

        // Re-seed users when version changes (clears old demo credentials)
        if (storedVersion < this.CURRENT_VERSION) {
            this.set(this.KEYS.USERS, this.getDefaultUsers());
            this.set(this.KEYS.CURRENT_USER, null); // force re-login
            this.set(this.KEYS.DATA_VERSION, this.CURRENT_VERSION);
        }

        if (!this.get(this.KEYS.USERS)) {
            this.set(this.KEYS.USERS, this.getDefaultUsers());
        }
        if (!this.get(this.KEYS.COMPLAINTS)) {
            this.set(this.KEYS.COMPLAINTS, this.getDefaultComplaints());
        }
        if (!this.get(this.KEYS.NOTIFICATIONS)) {
            this.set(this.KEYS.NOTIFICATIONS, this.getDefaultNotifications());
        }
        if (!this.get(this.KEYS.DEPARTMENTS)) {
            this.set(this.KEYS.DEPARTMENTS, this.getDefaultDepartments());
        }
        if (!this.get(this.KEYS.COUNTER)) {
            this.set(this.KEYS.COUNTER, 130);
        }
        // Theme
        const theme = this.get(this.KEYS.THEME) || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    },

    getNextComplaintId() {
        let counter = this.get(this.KEYS.COUNTER) || 130;
        counter++;
        this.set(this.KEYS.COUNTER, counter);
        const year = new Date().getFullYear();
        return `CMP-${year}-${String(counter).padStart(5, '0')}`;
    },

    // ── Default Users ───────────────────────────────────
    getDefaultUsers() {
        return [
            {
                id: 'STU001',
                name: 'Rahul Sharma',
                email: 'rahul@university.edu',
                password: 'Rahul@2026',
                phone: '+91 98765 43210',
                course: 'B.Tech Computer Science',
                year: '3rd Year',
                role: 'student',
                avatar: 'RS',
                createdAt: '2024-07-15T10:00:00'
            },
            {
                id: 'STU002',
                name: 'Priya Patel',
                email: 'priya@university.edu',
                password: 'Priya@2026',
                phone: '+91 98765 43211',
                course: 'B.Tech Electronics',
                year: '2nd Year',
                role: 'student',
                avatar: 'PP',
                createdAt: '2024-08-01T10:00:00'
            },
            {
                id: 'STU003',
                name: 'Amit Kumar',
                email: 'amit@university.edu',
                password: 'Amit@2026',
                phone: '+91 98765 43212',
                course: 'MBA',
                year: '1st Year',
                role: 'student',
                avatar: 'AK',
                createdAt: '2025-01-10T10:00:00'
            },
            {
                id: 'ADM001',
                name: 'Admin',
                email: 'admin',
                password: 'Spsu@2011',
                phone: '',
                course: '',
                year: '',
                role: 'admin',
                avatar: 'AD',
                createdAt: '2023-01-01T10:00:00'
            }
        ];
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
    },

    // ── Default Complaints ──────────────────────────────
    getDefaultComplaints() {
        return [
            {
                id: 'CMP-2026-00121',
                title: 'No Wi-Fi in Hostel Block A',
                category: 'Wi-Fi/Internet',
                location: 'Hostel Block A, Floor 3',
                description: 'The Wi-Fi has been down in the entire Block A for the past 3 days. Students are unable to attend online classes or submit assignments. The router on the 3rd floor seems to be malfunctioning.',
                priority: 'High',
                status: 'In Progress',
                studentId: 'STU001',
                studentName: 'Rahul Sharma',
                department: 'IT Department',
                createdAt: '2026-08-05T09:30:00',
                updatedAt: '2026-08-06T14:00:00',
                image: null,
                contact: '',
                notes: [
                    { author: 'Dr. Anjali Verma', text: 'Assigned to IT Department. Router replacement ordered.', date: '2026-08-06T14:00:00' }
                ],
                feedback: null,
                resolution: null,
                timeline: [
                    { step: 'Complaint Submitted', date: '2026-08-05T09:30:00', completed: true },
                    { step: 'Complaint Reviewed', date: '2026-08-05T11:15:00', completed: true },
                    { step: 'Assigned to IT Department', date: '2026-08-06T14:00:00', completed: true },
                    { step: 'Work in Progress', date: '2026-08-07T10:00:00', completed: true },
                    { step: 'Resolved', date: null, completed: false }
                ]
            },
            {
                id: 'CMP-2026-00122',
                title: 'Irregular Water Supply',
                category: 'Water Supply',
                location: 'Hostel Block C',
                description: 'Water supply is irregular in Block C since last week. Water comes only for 2 hours in the morning. Many students are facing difficulty with basic needs. This is especially problematic during summer.',
                priority: 'Urgent',
                status: 'Pending',
                studentId: 'STU001',
                studentName: 'Rahul Sharma',
                department: null,
                createdAt: '2026-08-07T08:00:00',
                updatedAt: '2026-08-07T08:00:00',
                image: null,
                contact: '+91 98765 43210',
                notes: [],
                feedback: null,
                resolution: null,
                timeline: [
                    { step: 'Complaint Submitted', date: '2026-08-07T08:00:00', completed: true },
                    { step: 'Complaint Reviewed', date: null, completed: false },
                    { step: 'Assigned to Department', date: null, completed: false },
                    { step: 'Work in Progress', date: null, completed: false },
                    { step: 'Resolved', date: null, completed: false }
                ]
            },
            {
                id: 'CMP-2026-00123',
                title: 'Classroom AC Not Working',
                category: 'Classroom',
                location: 'Academic Block B, Room 204',
                description: 'The air conditioning in Room 204 has not been working for the past week. With temperatures exceeding 40°C, it is very difficult for students and faculty to conduct classes. Immediate attention is needed.',
                priority: 'High',
                status: 'Resolved',
                studentId: 'STU002',
                studentName: 'Priya Patel',
                department: 'Maintenance',
                createdAt: '2026-07-28T10:15:00',
                updatedAt: '2026-08-02T16:30:00',
                image: null,
                contact: '',
                notes: [
                    { author: 'Dr. Anjali Verma', text: 'Assigned to Maintenance. High priority repair.', date: '2026-07-28T14:00:00' },
                    { author: 'Dr. Anjali Verma', text: 'Technician visited. Compressor needs replacement.', date: '2026-07-30T10:00:00' }
                ],
                feedback: { rating: 4, comment: 'Issue was resolved but took longer than expected. Thank you for fixing it.' },
                resolution: 'AC compressor has been replaced and the unit is now functioning properly. Tested and verified.',
                timeline: [
                    { step: 'Complaint Submitted', date: '2026-07-28T10:15:00', completed: true },
                    { step: 'Complaint Reviewed', date: '2026-07-28T11:30:00', completed: true },
                    { step: 'Assigned to Maintenance', date: '2026-07-28T14:00:00', completed: true },
                    { step: 'Work in Progress', date: '2026-07-30T10:00:00', completed: true },
                    { step: 'Resolved', date: '2026-08-02T16:30:00', completed: true }
                ]
            },
            {
                id: 'CMP-2026-00124',
                title: 'Hostel Room Cleaning Issue',
                category: 'Cleaning',
                location: 'Hostel Block B, Room 312',
                description: 'The common area and washrooms on the 3rd floor of Block B have not been cleaned properly for the past few days. There is an unhygienic smell and waste is overflowing from dustbins.',
                priority: 'Medium',
                status: 'Pending',
                studentId: 'STU002',
                studentName: 'Priya Patel',
                department: null,
                createdAt: '2026-08-08T07:45:00',
                updatedAt: '2026-08-08T07:45:00',
                image: null,
                contact: '',
                notes: [],
                feedback: null,
                resolution: null,
                timeline: [
                    { step: 'Complaint Submitted', date: '2026-08-08T07:45:00', completed: true },
                    { step: 'Complaint Reviewed', date: null, completed: false },
                    { step: 'Assigned to Department', date: null, completed: false },
                    { step: 'Work in Progress', date: null, completed: false },
                    { step: 'Resolved', date: null, completed: false }
                ]
            },
            {
                id: 'CMP-2026-00125',
                title: 'Canteen Food Quality Issue',
                category: 'Food/Canteen',
                location: 'Main Canteen',
                description: 'The quality of food served in the main canteen has deteriorated significantly. Multiple students have reported finding insects in the food. The hygiene standards are not being maintained properly.',
                priority: 'Medium',
                status: 'In Progress',
                studentId: 'STU001',
                studentName: 'Rahul Sharma',
                department: 'Canteen',
                createdAt: '2026-08-06T12:30:00',
                updatedAt: '2026-08-08T09:00:00',
                image: null,
                contact: '',
                notes: [
                    { author: 'Dr. Anjali Verma', text: 'Canteen management has been notified. Inspection scheduled.', date: '2026-08-07T10:00:00' }
                ],
                feedback: null,
                resolution: null,
                timeline: [
                    { step: 'Complaint Submitted', date: '2026-08-06T12:30:00', completed: true },
                    { step: 'Complaint Reviewed', date: '2026-08-06T15:00:00', completed: true },
                    { step: 'Assigned to Canteen', date: '2026-08-07T10:00:00', completed: true },
                    { step: 'Work in Progress', date: '2026-08-08T09:00:00', completed: true },
                    { step: 'Resolved', date: null, completed: false }
                ]
            },
            {
                id: 'CMP-2026-00126',
                title: 'Broken Window in Library',
                category: 'Classroom',
                location: 'Central Library, Reading Hall 2',
                description: 'One of the large windows in Reading Hall 2 is cracked and poses a safety risk. Glass could potentially fall and injure someone. Please arrange for immediate repair or boarding.',
                priority: 'Low',
                status: 'Pending',
                studentId: 'STU003',
                studentName: 'Amit Kumar',
                department: null,
                createdAt: '2026-08-09T10:00:00',
                updatedAt: '2026-08-09T10:00:00',
                image: null,
                contact: '',
                notes: [],
                feedback: null,
                resolution: null,
                timeline: [
                    { step: 'Complaint Submitted', date: '2026-08-09T10:00:00', completed: true },
                    { step: 'Complaint Reviewed', date: null, completed: false },
                    { step: 'Assigned to Department', date: null, completed: false },
                    { step: 'Work in Progress', date: null, completed: false },
                    { step: 'Resolved', date: null, completed: false }
                ]
            },
            {
                id: 'CMP-2026-00127',
                title: 'Security Gate Not Working',
                category: 'Security',
                location: 'Main Gate Entrance',
                description: 'The automatic security gate at the main entrance has been malfunctioning. The boom barrier gets stuck frequently causing long queues during peak hours. The RFID card reader is also intermittent.',
                priority: 'High',
                status: 'In Progress',
                studentId: 'STU003',
                studentName: 'Amit Kumar',
                department: 'Security',
                createdAt: '2026-08-04T16:00:00',
                updatedAt: '2026-08-07T11:00:00',
                image: null,
                contact: '',
                notes: [
                    { author: 'Dr. Anjali Verma', text: 'Security team investigating. Temporary manual gate operations in place.', date: '2026-08-05T09:00:00' }
                ],
                feedback: null,
                resolution: null,
                timeline: [
                    { step: 'Complaint Submitted', date: '2026-08-04T16:00:00', completed: true },
                    { step: 'Complaint Reviewed', date: '2026-08-04T17:30:00', completed: true },
                    { step: 'Assigned to Security', date: '2026-08-05T09:00:00', completed: true },
                    { step: 'Work in Progress', date: '2026-08-07T11:00:00', completed: true },
                    { step: 'Resolved', date: null, completed: false }
                ]
            },
            {
                id: 'CMP-2026-00128',
                title: 'Bus Timing Irregular',
                category: 'Transportation',
                location: 'Route 5 - City Center to Campus',
                description: 'The college bus on Route 5 has been arriving 30-45 minutes late consistently for the past two weeks. Many students on this route are missing their first lectures. The bus sometimes does not show up at all.',
                priority: 'Medium',
                status: 'Resolved',
                studentId: 'STU001',
                studentName: 'Rahul Sharma',
                department: 'Transport',
                createdAt: '2026-07-20T07:30:00',
                updatedAt: '2026-07-28T14:00:00',
                image: null,
                contact: '+91 98765 43210',
                notes: [
                    { author: 'Dr. Anjali Verma', text: 'Transport department notified. Investigating driver and vehicle issues.', date: '2026-07-21T10:00:00' },
                    { author: 'Dr. Anjali Verma', text: 'Replacement bus assigned to Route 5.', date: '2026-07-25T14:00:00' }
                ],
                feedback: { rating: 5, comment: 'The issue has been resolved perfectly. The bus is now running on time. Thank you!' },
                resolution: 'A replacement bus has been assigned to Route 5 with a new driver. The schedule has been updated and is now running on time.',
                timeline: [
                    { step: 'Complaint Submitted', date: '2026-07-20T07:30:00', completed: true },
                    { step: 'Complaint Reviewed', date: '2026-07-20T11:00:00', completed: true },
                    { step: 'Assigned to Transport', date: '2026-07-21T10:00:00', completed: true },
                    { step: 'Work in Progress', date: '2026-07-25T14:00:00', completed: true },
                    { step: 'Resolved', date: '2026-07-28T14:00:00', completed: true }
                ]
            }
        ];
    },

    // ── Default Notifications ───────────────────────────
    getDefaultNotifications() {
        return [
            {
                id: 'NOTIF001',
                userId: 'STU001',
                type: 'info',
                title: 'Complaint In Progress',
                message: 'Your complaint CMP-2026-00121 (No Wi-Fi in Hostel Block A) is now In Progress.',
                read: false,
                createdAt: '2026-08-07T10:00:00'
            },
            {
                id: 'NOTIF002',
                userId: 'STU001',
                type: 'info',
                title: 'Department Assigned',
                message: 'Your complaint CMP-2026-00121 has been assigned to the IT Department.',
                read: false,
                createdAt: '2026-08-06T14:00:00'
            },
            {
                id: 'NOTIF003',
                userId: 'STU001',
                type: 'success',
                title: 'Complaint Resolved',
                message: 'Your complaint CMP-2026-00128 (Bus Timing Irregular) has been resolved.',
                read: true,
                createdAt: '2026-07-28T14:00:00'
            },
            {
                id: 'NOTIF004',
                userId: 'STU002',
                type: 'success',
                title: 'Complaint Resolved',
                message: 'Your complaint CMP-2026-00123 (Classroom AC Not Working) has been resolved.',
                read: true,
                createdAt: '2026-08-02T16:30:00'
            },
            {
                id: 'NOTIF005',
                userId: 'STU001',
                type: 'warning',
                title: 'Canteen Inspection',
                message: 'Your complaint CMP-2026-00125 regarding canteen food quality is under investigation. An inspection has been scheduled.',
                read: false,
                createdAt: '2026-08-07T10:00:00'
            },
            {
                id: 'NOTIF006',
                userId: 'ADM001',
                type: 'urgent',
                title: 'New Urgent Complaint',
                message: 'A new urgent complaint CMP-2026-00122 (Irregular Water Supply) has been submitted and needs immediate attention.',
                read: false,
                createdAt: '2026-08-07T08:00:00'
            },
            {
                id: 'NOTIF007',
                userId: 'ADM001',
                type: 'info',
                title: 'New Complaint',
                message: 'A new complaint CMP-2026-00126 (Broken Window in Library) has been submitted by Amit Kumar.',
                read: false,
                createdAt: '2026-08-09T10:00:00'
            }
        ];
    }
};
