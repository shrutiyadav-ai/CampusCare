/* ============================================================
   CampusCare – Notifications Module
   Notification CRUD, badge counts, auto-generation
   ============================================================ */

const Notifications = {
    getAll(userId) {
        const all = DataStore.get(DataStore.KEYS.NOTIFICATIONS) || [];
        if (!userId) return all;
        return all.filter(n => n.userId === userId).sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    },

    getUnreadCount(userId) {
        const notifications = this.getAll(userId);
        return notifications.filter(n => !n.read).length;
    },

    add(notification) {
        const all = DataStore.get(DataStore.KEYS.NOTIFICATIONS) || [];
        const newNotif = {
            id: 'NOTIF' + Date.now(),
            read: false,
            createdAt: new Date().toISOString(),
            ...notification
        };
        all.unshift(newNotif);
        DataStore.set(DataStore.KEYS.NOTIFICATIONS, all);
        return newNotif;
    },

    markAsRead(notifId) {
        const all = DataStore.get(DataStore.KEYS.NOTIFICATIONS) || [];
        const idx = all.findIndex(n => n.id === notifId);
        if (idx !== -1) {
            all[idx].read = true;
            DataStore.set(DataStore.KEYS.NOTIFICATIONS, all);
        }
    },

    markAllAsRead(userId) {
        const all = DataStore.get(DataStore.KEYS.NOTIFICATIONS) || [];
        all.forEach(n => {
            if (n.userId === userId) n.read = true;
        });
        DataStore.set(DataStore.KEYS.NOTIFICATIONS, all);
    },

    // Auto-generate notifications on complaint events
    notifyStatusChange(complaint, newStatus, oldStatus) {
        // Notify student
        this.add({
            userId: complaint.studentId,
            type: newStatus === 'Resolved' ? 'success' : (newStatus === 'Urgent' ? 'urgent' : 'info'),
            title: `Complaint ${newStatus}`,
            message: `Your complaint ${complaint.id} (${complaint.title}) is now ${newStatus}.`
        });
    },

    notifyDepartmentAssigned(complaint, department) {
        this.add({
            userId: complaint.studentId,
            type: 'info',
            title: 'Department Assigned',
            message: `Your complaint ${complaint.id} has been assigned to the ${department}.`
        });
    },

    async notifyNewComplaint(complaint) {
        try {
            const { data: admins } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'admin');

            (admins || []).forEach(admin => {
                this.add({
                    userId: admin.id,
                    type: complaint.priority === 'Urgent' ? 'urgent' : 'info',
                    title: complaint.priority === 'Urgent' ? 'New Urgent Complaint' : 'New Complaint',
                    message: `A new ${complaint.priority === 'Urgent' ? 'urgent ' : ''}complaint ${complaint.id} (${complaint.title}) has been submitted by ${complaint.studentName}.`
                });
            });
        } catch (err) {
            console.error('notifyNewComplaint error:', err);
        }
    },

    notifyResolution(complaint, message) {
        this.add({
            userId: complaint.studentId,
            type: 'success',
            title: 'Complaint Resolved',
            message: `Your complaint ${complaint.id} (${complaint.title}) has been resolved. ${message ? 'Resolution: ' + message : ''}`
        });
    }
};
