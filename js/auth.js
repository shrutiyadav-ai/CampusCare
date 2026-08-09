/* ============================================================
   CampusCare – Authentication Module
   Mock login/register, session management, route guards
   ============================================================ */

const Auth = {
    login(email, password) {
        const users = DataStore.get(DataStore.KEYS.USERS) || [];
        const user = users.find(u =>
            u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!user) {
            return { success: false, message: 'Invalid email or password. Please try again.' };
        }

        // Save session (exclude password)
        const session = { ...user };
        delete session.password;
        DataStore.set(DataStore.KEYS.CURRENT_USER, session);

        return { success: true, user: session };
    },

    register(userData) {
        const users = DataStore.get(DataStore.KEYS.USERS) || [];

        // Check if email exists
        if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        // Check if student ID exists
        if (users.find(u => u.id === userData.studentId)) {
            return { success: false, message: 'This Student ID is already registered.' };
        }

        const newUser = {
            id: userData.studentId,
            name: userData.name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone || '',
            course: userData.course || '',
            year: userData.year || '',
            role: 'student',
            avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        DataStore.set(DataStore.KEYS.USERS, users);

        return { success: true, message: 'Registration successful! Please login to continue.' };
    },

    logout() {
        DataStore.set(DataStore.KEYS.CURRENT_USER, null);
    },

    getCurrentUser() {
        return DataStore.get(DataStore.KEYS.CURRENT_USER);
    },

    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    },

    isStudent() {
        const user = this.getCurrentUser();
        return user && user.role === 'student';
    },

    updateProfile(data) {
        const user = this.getCurrentUser();
        if (!user) return { success: false, message: 'Not logged in.' };

        const users = DataStore.get(DataStore.KEYS.USERS) || [];
        const idx = users.findIndex(u => u.id === user.id);
        if (idx === -1) return { success: false, message: 'User not found.' };

        // Update fields
        const updatable = ['name', 'phone', 'course', 'year'];
        updatable.forEach(field => {
            if (data[field] !== undefined) {
                users[idx][field] = data[field];
            }
        });

        // Update avatar
        if (data.name) {
            users[idx].avatar = data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }

        // Handle password change
        if (data.newPassword) {
            if (data.currentPassword !== users[idx].password) {
                return { success: false, message: 'Current password is incorrect.' };
            }
            users[idx].password = data.newPassword;
        }

        DataStore.set(DataStore.KEYS.USERS, users);

        // Update session
        const session = { ...users[idx] };
        delete session.password;
        DataStore.set(DataStore.KEYS.CURRENT_USER, session);

        return { success: true, message: 'Profile updated successfully.' };
    },

    // Route guard - checks if user has access to route
    checkAccess(route) {
        const publicRoutes = ['/', '#/', '#/login', '#/register', ''];
        const hash = route || window.location.hash || '#/';

        if (publicRoutes.includes(hash)) return true;

        if (!this.isLoggedIn()) return false;

        if (hash.startsWith('#/admin') && !this.isAdmin()) return false;
        if (hash.startsWith('#/student') && !this.isStudent()) return false;

        return true;
    }
};
