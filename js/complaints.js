/* ============================================================
   CampusCare – Complaints Module
   Complaint CRUD, search, filter, sort
   ============================================================ */

const Complaints = {
    CATEGORIES: [
        'Hostel', 'Water Supply', 'Electricity', 'Wi-Fi/Internet',
        'Classroom', 'Cleaning', 'Food/Canteen', 'Transportation',
        'Security', 'Academic', 'Other'
    ],

    PRIORITIES: ['Low', 'Medium', 'High', 'Urgent'],

    STATUSES: ['Pending', 'In Progress', 'Resolved'],

    create(data) {
        const complaints = DataStore.get(DataStore.KEYS.COMPLAINTS) || [];
        const user = Auth.getCurrentUser();
        if (!user) return { success: false, message: 'Not logged in.' };

        const id = DataStore.getNextComplaintId();
        const now = new Date().toISOString();

        const newComplaint = {
            id: id,
            title: data.title,
            category: data.category,
            location: data.location || '',
            description: data.description,
            priority: data.priority || 'Medium',
            status: data.priority === 'Urgent' ? 'Pending' : 'Pending',
            studentId: user.id,
            studentName: user.name,
            department: null,
            createdAt: data.date ? new Date(data.date).toISOString() : now,
            updatedAt: now,
            image: data.image || null,
            contact: data.contact || '',
            notes: [],
            feedback: null,
            resolution: null,
            timeline: [
                { step: 'Complaint Submitted', date: now, completed: true },
                { step: 'Complaint Reviewed', date: null, completed: false },
                { step: 'Assigned to Department', date: null, completed: false },
                { step: 'Work in Progress', date: null, completed: false },
                { step: 'Resolved', date: null, completed: false }
            ]
        };

        complaints.unshift(newComplaint);
        DataStore.set(DataStore.KEYS.COMPLAINTS, complaints);

        // Notify admins
        Notifications.notifyNewComplaint(newComplaint);

        return { success: true, complaint: newComplaint };
    },

    getAll() {
        return DataStore.get(DataStore.KEYS.COMPLAINTS) || [];
    },

    getById(id) {
        const complaints = this.getAll();
        return complaints.find(c => c.id === id) || null;
    },

    getByStudent(studentId) {
        const complaints = this.getAll();
        return complaints.filter(c => c.studentId === studentId);
    },

    update(id, data) {
        const complaints = this.getAll();
        const idx = complaints.findIndex(c => c.id === id);
        if (idx === -1) return { success: false, message: 'Complaint not found.' };

        Object.assign(complaints[idx], data, { updatedAt: new Date().toISOString() });
        DataStore.set(DataStore.KEYS.COMPLAINTS, complaints);
        return { success: true, complaint: complaints[idx] };
    },

    updateStatus(id, newStatus) {
        const complaint = this.getById(id);
        if (!complaint) return { success: false };

        const oldStatus = complaint.status;
        const now = new Date().toISOString();

        // Update timeline
        const timeline = complaint.timeline || [];
        const statusToStep = {
            'Pending': 1,
            'In Progress': 3,
            'Resolved': 4
        };

        // Mark reviewed
        if (newStatus !== 'Pending' && timeline[1] && !timeline[1].completed) {
            timeline[1].completed = true;
            timeline[1].date = now;
        }

        // Mark work in progress
        if (newStatus === 'In Progress') {
            if (timeline[3] && !timeline[3].completed) {
                timeline[3].completed = true;
                timeline[3].date = now;
            }
        }

        // Mark resolved
        if (newStatus === 'Resolved') {
            timeline.forEach((step, i) => {
                if (!step.completed) {
                    step.completed = true;
                    step.date = now;
                }
            });
        }

        this.update(id, { status: newStatus, timeline: timeline });

        // Notify student
        Notifications.notifyStatusChange(complaint, newStatus, oldStatus);

        return { success: true };
    },

    assignDepartment(id, department) {
        const complaint = this.getById(id);
        if (!complaint) return { success: false };

        const now = new Date().toISOString();
        const timeline = complaint.timeline || [];

        // Mark reviewed if not already
        if (timeline[1] && !timeline[1].completed) {
            timeline[1].completed = true;
            timeline[1].date = now;
        }

        // Mark assigned
        if (timeline[2]) {
            timeline[2].completed = true;
            timeline[2].date = now;
            timeline[2].step = `Assigned to ${department}`;
        }

        this.update(id, { department: department, timeline: timeline });

        // Notify student
        Notifications.notifyDepartmentAssigned(complaint, department);

        return { success: true };
    },

    changePriority(id, priority) {
        return this.update(id, { priority: priority });
    },

    addNote(id, noteText) {
        const complaint = this.getById(id);
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

    addFeedback(id, feedback) {
        return this.update(id, { feedback: feedback });
    },

    addResolution(id, message) {
        const complaint = this.getById(id);
        if (!complaint) return { success: false };

        this.update(id, { resolution: message });
        this.updateStatus(id, 'Resolved');
        Notifications.notifyResolution(complaint, message);

        return { success: true };
    },

    // ── Search, Filter, Sort ────────────────────────────
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

    getStats(complaints) {
        const all = complaints || this.getAll();
        return {
            total: all.length,
            pending: all.filter(c => c.status === 'Pending').length,
            inProgress: all.filter(c => c.status === 'In Progress').length,
            resolved: all.filter(c => c.status === 'Resolved').length,
            urgent: all.filter(c => c.priority === 'Urgent').length
        };
    }
};
