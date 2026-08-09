/* ============================================================
   CampusCare – Admin Module
   Admin-specific dashboard stats and actions
   ============================================================ */

const Admin = {
    getDashboardStats() {
        return Complaints.getStats();
    },

    getRecentComplaints(limit = 5) {
        const all = Complaints.getAll();
        return Complaints.sort('date', 'desc', all).slice(0, limit);
    },

    getUrgentComplaints() {
        const all = Complaints.getAll();
        return all.filter(c => c.priority === 'Urgent' || c.status === 'Pending');
    },

    getComplaintsByCategory() {
        const all = Complaints.getAll();
        const counts = {};
        all.forEach(c => {
            counts[c.category] = (counts[c.category] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    },

    getComplaintsByDepartment() {
        const all = Complaints.getAll();
        const departments = DataStore.get(DataStore.KEYS.DEPARTMENTS) || [];
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

    getComplaintsByMonth() {
        const all = Complaints.getAll();
        const months = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        all.forEach(c => {
            const date = new Date(c.createdAt);
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            months[key] = (months[key] || 0) + 1;
        });

        // Return last 6 months
        const result = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            result.push({ month: monthNames[d.getMonth()], count: months[key] || 0 });
        }
        return result;
    },

    getStatusDistribution() {
        const stats = this.getDashboardStats();
        return [
            { label: 'Pending', count: stats.pending, color: '#f59e0b' },
            { label: 'In Progress', count: stats.inProgress, color: '#3b82f6' },
            { label: 'Resolved', count: stats.resolved, color: '#22c55e' }
        ];
    },

    getAllStudents() {
        const users = DataStore.get(DataStore.KEYS.USERS) || [];
        const students = users.filter(u => u.role === 'student');
        return students.map(s => {
            const studentComplaints = Complaints.getByStudent(s.id);
            return {
                ...s,
                totalComplaints: studentComplaints.length,
                pendingComplaints: studentComplaints.filter(c => c.status === 'Pending').length,
                resolvedComplaints: studentComplaints.filter(c => c.status === 'Resolved').length
            };
        });
    },

    // Admin actions
    updateComplaintStatus(id, status) {
        return Complaints.updateStatus(id, status);
    },

    assignDepartment(id, department) {
        return Complaints.assignDepartment(id, department);
    },

    changePriority(id, priority) {
        return Complaints.changePriority(id, priority);
    },

    addAdminNote(id, note) {
        return Complaints.addNote(id, note);
    },

    resolveComplaint(id, resolution) {
        return Complaints.addResolution(id, resolution);
    }
};
