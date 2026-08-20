/* ============================================================
   CampusCare – Complaints Module
   Database interaction with Supabase, Search, Filter, Sort
   ============================================================ */

const Complaints = {
    CATEGORIES: [
        'Hostel', 'Water Supply', 'Electricity', 'Wi-Fi/Internet',
        'Classroom', 'Cleaning', 'Food/Canteen', 'Transportation',
        'Security', 'Academic', 'Other'
    ],

    PRIORITIES: ['Low', 'Medium', 'High', 'Urgent'],

    STATUSES: ['Pending', 'In Progress', 'Resolved'],

    // Helper: Map Supabase database row to the frontend JS schema format
    mapToJS(c) {
        if (!c) return null;
        return {
            id: c.complaint_id,
            db_id: c.id,
            title: c.title,
            category: c.category,
            location: c.location || '',
            description: c.description,
            priority: c.priority || 'Medium',
            status: c.status || 'Pending',
            studentId: c.user_id, // UUID of auth user
            studentName: c.student_name || 'Anonymous Student',
            department: c.assigned_department || null,
            createdAt: c.created_at,
            updatedAt: c.updated_at,
            image: null,
            contact: c.contact || '',
            notes: c.notes || [],
            feedback: c.feedback || null,
            resolution: c.resolution_message || null,
            timeline: c.timeline || []
        };
    },

    async create(data) {
        if (!window.supabase) {
            return { success: false, message: window.SUPABASE_CONFIG_ERROR || 'Database connection is not configured.' };
        }

        const user = Auth.getCurrentUser();
        if (!user) return { success: false, message: 'Not logged in.' };

        const complaintId = DataStore.getNextComplaintId();
        const now = new Date().toISOString();

        const timeline = [
            { step: 'Complaint Submitted', date: now, completed: true },
            { step: 'Complaint Reviewed', date: null, completed: false },
            { step: 'Assigned to Department', date: null, completed: false },
            { step: 'Work in Progress', date: null, completed: false },
            { step: 'Resolved', date: null, completed: false }
        ];

        try {
            const { data: insertedRow, error } = await supabase
                .from('complaints')
                .insert([{
                    complaint_id: complaintId,
                    user_id: user.uid,
                    student_name: user.name,
                    title: data.title,
                    category: data.category,
                    location: data.location || '',
                    description: data.description,
                    priority: data.priority || 'Medium',
                    status: 'Pending',
                    assigned_department: null,
                    resolution_message: null,
                    notes: [],
                    timeline: timeline,
                    feedback: null,
                    contact: data.contact || '',
                    created_at: now,
                    updated_at: now
                }])
                .select()
                .single();

            if (error) {
                return { success: false, message: error.message };
            }

            try {
                Notifications.notifyNewComplaint(this.mapToJS(insertedRow));
            } catch (e) {
                console.error('Notification trigger error:', e);
            }

            return { success: true, complaint: this.mapToJS(insertedRow) };
        } catch (err) {
            return { success: false, message: 'An unexpected database error occurred: ' + err.message };
        }
    },

    async getAll() {
        if (!window.supabase) return [];
        try {
            const { data, error } = await supabase
                .from('complaints')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching complaints:', error.message);
                return [];
            }

            return (data || []).map(row => this.mapToJS(row));
        } catch (err) {
            console.error('Unexpected error in getAll:', err);
            return [];
        }
    },

    async getById(id) {
        if (!window.supabase) return null;
        try {
            const { data, error } = await supabase
                .from('complaints')
                .select('*')
                .eq('complaint_id', id)
                .maybeSingle();

            if (error) {
                console.error('Error fetching complaint by ID:', error.message);
                return null;
            }

            return this.mapToJS(data);
        } catch (err) {
            console.error('Unexpected error in getById:', err);
            return null;
        }
    },

    async getByStudent(userId) {
        if (!window.supabase) return [];
        try {
            const { data, error } = await supabase
                .from('complaints')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching complaints by student:', error.message);
                return [];
            }

            return (data || []).map(row => this.mapToJS(row));
        } catch (err) {
            console.error('Unexpected error in getByStudent:', err);
            return [];
        }
    },

    async update(id, fields) {
        if (!window.supabase) {
            return { success: false, message: window.SUPABASE_CONFIG_ERROR || 'Database connection is not configured.' };
        }

        try {
            const { data, error } = await supabase
                .from('complaints')
                .update({
                    ...fields,
                    updated_at: new Date().toISOString()
                })
                .eq('complaint_id', id)
                .select()
                .single();

            if (error) {
                return { success: false, message: error.message };
            }

            return { success: true, complaint: this.mapToJS(data) };
        } catch (err) {
            return { success: false, message: err.message };
        }
    },

    async updateStatus(id, newStatus) {
        const complaint = await this.getById(id);
        if (!complaint) return { success: false };

        const oldStatus = complaint.status;
        const now = new Date().toISOString();
        const timeline = complaint.timeline || [];

        if (newStatus !== 'Pending' && timeline[1] && !timeline[1].completed) {
            timeline[1].completed = true;
            timeline[1].date = now;
        }

        if (newStatus === 'In Progress') {
            if (timeline[3] && !timeline[3].completed) {
                timeline[3].completed = true;
                timeline[3].date = now;
            }
        }

        if (newStatus === 'Resolved') {
            timeline.forEach((step) => {
                if (!step.completed) {
                    step.completed = true;
                    step.date = now;
                }
            });
        }

        const res = await this.update(id, {
            status: newStatus,
            timeline: timeline
        });

        if (res.success) {
            try {
                Notifications.notifyStatusChange(complaint, newStatus, oldStatus);
            } catch (e) {
                console.error('Notification error:', e);
            }
        }

        return res;
    },

    async assignDepartment(id, department) {
        const complaint = await this.getById(id);
        if (!complaint) return { success: false };

        const now = new Date().toISOString();
        const timeline = complaint.timeline || [];

        if (timeline[1] && !timeline[1].completed) {
            timeline[1].completed = true;
            timeline[1].date = now;
        }

        if (timeline[2]) {
            timeline[2].completed = true;
            timeline[2].date = now;
            timeline[2].step = `Assigned to ${department}`;
        }

        const res = await this.update(id, {
            assigned_department: department,
            timeline: timeline
        });

        if (res.success) {
            try {
                Notifications.notifyDepartmentAssigned(complaint, department);
            } catch (e) {
                console.error('Notification error:', e);
            }
        }

        return res;
    },

    async changePriority(id, priority) {
        return this.update(id, { priority: priority });
    },

    async addNote(id, noteText) {
        const complaint = await this.getById(id);
        if (!complaint) return { success: false };

        const user = Auth.getCurrentUser();
        const notes = complaint.notes || [];
        notes.push({
            author: user ? user.name : 'System',
            text: noteText,
            date: new Date().toISOString()
        });

        return this.update(id, { notes: notes });
    },

    async addFeedback(id, feedback) {
        return this.update(id, { feedback: feedback });
    },

    async addResolution(id, message) {
        const complaint = await this.getById(id);
        if (!complaint) return { success: false };

        const now = new Date().toISOString();
        const timeline = complaint.timeline || [];
        timeline.forEach((step) => {
            if (!step.completed) {
                step.completed = true;
                step.date = now;
            }
        });

        const res = await this.update(id, {
            resolution_message: message,
            status: 'Resolved',
            timeline: timeline
        });

        if (res.success) {
            try {
                Notifications.notifyResolution(complaint, message);
            } catch (e) {
                console.error('Notification error:', e);
            }
        }

        return res;
    },

    search(query, complaints) {
        if (!query) return complaints;
        const q = query.toLowerCase();
        return complaints.filter(c =>
            c.title.toLowerCase().includes(q) ||
            c.id.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            c.location.toLowerCase().includes(q) ||
            (c.description && c.description.toLowerCase().includes(q)) ||
            (c.studentName && c.studentName.toLowerCase().includes(q))
        );
    },

    filter(filters, complaints) {
        let result = complaints;

        if (filters.category) {
            result = result.filter(c => c.category === filters.category);
        }
        if (filters.status) {
            result = result.filter(c => c.status === filters.status);
        }
        if (filters.priority) {
            result = result.filter(c => c.priority === filters.priority);
        }
        if (filters.department) {
            result = result.filter(c => c.department === filters.department);
        }

        return result;
    },

    sort(field, order = 'desc', complaints) {
        return [...complaints].sort((a, b) => {
            let valA, valB;

            switch (field) {
                case 'date':
                    valA = new Date(a.createdAt);
                    valB = new Date(b.createdAt);
                    break;
                case 'priority':
                    const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
                    valA = priorityOrder[a.priority] || 0;
                    valB = priorityOrder[b.priority] || 0;
                    break;
                case 'status':
                    const statusOrder = { 'Pending': 1, 'In Progress': 2, 'Resolved': 3 };
                    valA = statusOrder[a.status] || 0;
                    valB = statusOrder[b.status] || 0;
                    break;
                default:
                    valA = a[field];
                    valB = b[field];
            }

            if (order === 'asc') return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });
    },

    getStats(complaintsList) {
        const all = complaintsList || [];
        return {
            total: all.length,
            pending: all.filter(c => c.status === 'Pending').length,
            inProgress: all.filter(c => c.status === 'In Progress').length,
            resolved: all.filter(c => c.status === 'Resolved').length,
            urgent: all.filter(c => c.priority === 'Urgent').length
        };
    }
};
