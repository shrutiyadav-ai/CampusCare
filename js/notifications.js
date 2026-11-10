/* ============================================================
   CampusCare – Notifications Module
   Notification CRUD, badge counts, Supabase persistence & LocalStorage fallback
   ============================================================ */

const Notifications = {
    // Synchronous read from local cache
    getAll(userId) {
        const all = DataStore.get(DataStore.KEYS.NOTIFICATIONS) || [];
        if (!userId) return all;
        return all.filter(n => n.userId === userId || n.user_id === userId).sort((a, b) =>
            new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
        );
    },

    getUnreadCount(userId) {
        const notifications = this.getAll(userId);
        return notifications.filter(n => !n.read).length;
    },

    // Fetch live notifications from Supabase and sync local cache
    async fetch(userId) {
        if (!userId || !window.supabase) return this.getAll(userId);

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (!error && data) {
                const mapped = data.map(n => ({
                    id: n.id,
                    userId: n.user_id,
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    read: n.read,
                    createdAt: n.created_at
                }));

                // Update cache
                const currentCache = DataStore.get(DataStore.KEYS.NOTIFICATIONS) || [];
                const otherUsersNotifs = currentCache.filter(n => n.userId !== userId && n.user_id !== userId);
                DataStore.set(DataStore.KEYS.NOTIFICATIONS, [...mapped, ...otherUsersNotifs]);
                return mapped;
            }
        } catch (err) {
            console.warn('Notifications.fetch fallback to cache:', err.message);
        }

        return this.getAll(userId);
    },

    async add(notification) {
        const notifId = 'NOTIF_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        const newNotif = {
            id: notifId,
            userId: notification.userId,
            type: notification.type || 'info',
            title: notification.title,
            message: notification.message,
            read: false,
            createdAt: new Date().toISOString()
        };

        // Cache locally first for instant UI response
        const all = DataStore.get(DataStore.KEYS.NOTIFICATIONS) || [];
        all.unshift(newNotif);
        DataStore.set(DataStore.KEYS.NOTIFICATIONS, all);

        // Persist to Supabase if available
        if (window.supabase && notification.userId) {
            try {
                await supabase.from('notifications').insert([{
                    user_id: notification.userId,
                    type: newNotif.type,
                    title: newNotif.title,
                    message: newNotif.message,
                    read: false,
                    created_at: newNotif.createdAt
                }]);
            } catch (err) {
                console.warn('Could not persist notification to Supabase:', err.message);
            }
        }

        return newNotif;
    },

    async markAsRead(notifId) {
        const all = DataStore.get(DataStore.KEYS.NOTIFICATIONS) || [];
        const idx = all.findIndex(n => n.id === notifId);
        if (idx !== -1) {
            all[idx].read = true;
            DataStore.set(DataStore.KEYS.NOTIFICATIONS, all);
        }

        if (window.supabase) {
            try {
                await supabase.from('notifications').update({ read: true }).eq('id', notifId);
            } catch (err) {
                console.warn('Could not update notification read status in Supabase:', err.message);
            }
        }
    },

    async markAllAsRead(userId) {
        const all = DataStore.get(DataStore.KEYS.NOTIFICATIONS) || [];
        all.forEach(n => {
            if (n.userId === userId || n.user_id === userId) n.read = true;
        });
        DataStore.set(DataStore.KEYS.NOTIFICATIONS, all);

        if (window.supabase && userId) {
            try {
                await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
            } catch (err) {
                console.warn('Could not mark all notifications read in Supabase:', err.message);
            }
        }
    },

    // Auto-generate notifications on complaint events
    async notifyStatusChange(complaint, newStatus, oldStatus) {
        if (!complaint || !complaint.studentId) return;

        await this.add({
            userId: complaint.studentId,
            type: newStatus === 'Resolved' ? 'success' : (newStatus === 'Urgent' ? 'urgent' : 'info'),
            title: `Complaint ${newStatus}`,
            message: `Your complaint ${complaint.id} (${complaint.title}) is now marked as ${newStatus}.`
        });
    },

    async notifyDepartmentAssigned(complaint, department) {
        if (!complaint || !complaint.studentId) return;

        await this.add({
            userId: complaint.studentId,
            type: 'info',
            title: 'Department Assigned',
            message: `Your complaint ${complaint.id} has been assigned to the ${department}.`
        });
    },

    async notifyNewComplaint(complaint) {
        if (!window.supabase) return;

        try {
            const { data: admins } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'admin');

            if (admins && admins.length > 0) {
                for (const admin of admins) {
                    await this.add({
                        userId: admin.id,
                        type: complaint.priority === 'Urgent' ? 'urgent' : 'info',
                        title: complaint.priority === 'Urgent' ? 'New Urgent Complaint' : 'New Complaint',
                        message: `A new ${complaint.priority === 'Urgent' ? 'urgent ' : ''}complaint ${complaint.id} (${complaint.title}) has been submitted by ${complaint.studentName}.`
                    });
                }
            }
        } catch (err) {
            console.error('notifyNewComplaint error:', err);
        }
    },

    async notifyResolution(complaint, message) {
        if (!complaint || !complaint.studentId) return;

        await this.add({
            userId: complaint.studentId,
            type: 'success',
            title: 'Complaint Resolved',
            message: `Your complaint ${complaint.id} (${complaint.title}) has been resolved. ${message ? 'Resolution details: ' + message : ''}`
        });
    }
};
