/* ============================================================
   CampusCare – Admin Module
   Admin-specific dashboard stats, department metrics & actions
   ============================================================ */

const Admin = {
    async getDashboardStats(complaintsList = null) {
        if (!window.supabase) {
            return { total: 0, pending: 0, inProgress: 0, resolved: 0, urgent: 0 };
        }
        const all = complaintsList || await Complaints.getAll();
        return Complaints.getStats(all);
    },

    async getRecentComplaints(limit = 5, complaintsList = null) {
        if (!window.supabase) return [];
        const all = complaintsList || await Complaints.getAll();
        return Complaints.sort('date', 'desc', all).slice(0, limit);
    },

    async getUrgentComplaints(complaintsList = null) {
        if (!window.supabase) return [];
        const all = complaintsList || await Complaints.getAll();
        // Truly urgent or high-priority unresolved complaints
        return all.filter(c => (c.priority === 'Urgent' || c.priority === 'High') && c.status !== 'Resolved');
    },

    async getComplaintsByCategory(complaintsList = null) {
        if (!window.supabase) return [];
        const all = complaintsList || await Complaints.getAll();
        const counts = {};
        all.forEach(c => {
            counts[c.category] = (counts[c.category] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    },

    async getDepartments() {
        if (window.supabase) {
            try {
                const { data, error } = await supabase
                    .from('departments')
                    .select('*')
                    .order('name');
                if (!error && data && data.length > 0) {
                    return data;
                }
            } catch (e) {
                // Fall back to DataStore
            }
        }
        return DataStore.get(DataStore.KEYS.DEPARTMENTS) || DataStore.getDefaultDepartments();
    },

    async getComplaintsByDepartment(complaintsList = null) {
        if (!window.supabase) return [];
        const all = complaintsList || await Complaints.getAll();
        const departments = await this.getDepartments();
        return departments.map(dept => {
            const deptComplaints = all.filter(c => c.department === dept.name);
            return {
                ...dept,
                total: deptComplaints.length,
                pending: deptComplaints.filter(c => c.status === 'Pending').length,
                inProgress: deptComplaints.filter(c => c.status === 'In Progress').length,
                resolved: deptComplaints.filter(c => c.status === 'Resolved').length
            };
        });
    },

    async getComplaintsByMonth(complaintsList = null) {
        if (!window.supabase) return [];
        const all = complaintsList || await Complaints.getAll();
        const months = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        all.forEach(c => {
            const date = new Date(c.createdAt);
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            months[key] = (months[key] || 0) + 1;
        });

        const result = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            result.push({ month: monthNames[d.getMonth()], count: months[key] || 0 });
        }
        return result;
    },

    async getStatusDistribution(complaintsList = null) {
        const stats = await this.getDashboardStats(complaintsList);
        return [
            { label: 'Pending', count: stats.pending, color: '#f59e0b' },
            { label: 'In Progress', count: stats.inProgress, color: '#3b82f6' },
            { label: 'Resolved', count: stats.resolved, color: '#22c55e' }
        ];
    },

    async getAllStudents() {
        if (!window.supabase) return [];
        try {
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'student')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching student profiles:', error.message);
                return [];
            }

            const allComplaints = await Complaints.getAll();

            return (profiles || []).map(s => {
                const studentComplaints = allComplaints.filter(c => c.studentId === s.id);
                return {
                    id: s.student_id || 'UNKNOWN',
                    uid: s.id,
                    name: s.full_name,
                    email: s.email,
                    phone: s.phone || 'Not provided',
                    course: s.course || 'Not provided',
                    year: s.year || 'Not provided',
                    avatar: s.avatar || (s.full_name ? s.full_name.slice(0, 2).toUpperCase() : 'U'),
                    createdAt: s.created_at,
                    totalComplaints: studentComplaints.length,
                    pendingComplaints: studentComplaints.filter(c => c.status === 'Pending').length,
                    resolvedComplaints: studentComplaints.filter(c => c.status === 'Resolved').length
                };
            });
        } catch (err) {
            console.error('Unexpected error in getAllStudents:', err);
            return [];
        }
    },

    // Admin actions
    async updateComplaintStatus(id, status) {
        if (!window.supabase) return { success: false, message: 'Supabase is not configured.' };
        return Complaints.updateStatus(id, status);
    },

    async assignDepartment(id, department) {
        if (!window.supabase) return { success: false, message: 'Supabase is not configured.' };
        return Complaints.assignDepartment(id, department);
    },

    async changePriority(id, priority) {
        if (!window.supabase) return { success: false, message: 'Supabase is not configured.' };
        return Complaints.changePriority(id, priority);
    },

    async addAdminNote(id, note) {
        if (!window.supabase) return { success: false, message: 'Supabase is not configured.' };
        return Complaints.addNote(id, note);
    },

    async resolveComplaint(id, resolution) {
        if (!window.supabase) return { success: false, message: 'Supabase is not configured.' };
        return Complaints.addResolution(id, resolution);
    }
};
