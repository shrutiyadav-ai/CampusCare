/* ============================================================
   CampusCare – Authentication Module
   Supabase Authentication, Session tracking, Route guards
   ============================================================ */

const Auth = {
    _currentUser: null,
    _initialized: false,
    _initPromise: null,

    // Initialize session listener on startup
    initSessionListener() {
        if (this._initPromise) return this._initPromise;
        this._initPromise = new Promise((resolve) => {
            supabase.auth.onAuthStateChange(async (event, session) => {
                if (session && session.user) {
                    try {
                        const { data: profile, error } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .maybeSingle();

                        if (profile) {
                            Auth._currentUser = {
                                id: profile.student_id || 'STU_UNKNOWN',
                                uid: profile.id,
                                name: profile.full_name,
                                email: profile.email,
                                phone: profile.phone || '',
                                course: profile.course || '',
                                year: profile.year || '',
                                role: profile.role,
                                avatar: profile.avatar || 'U',
                                createdAt: profile.created_at
                            };
                        } else {
                            // Session exists but profile not created yet, or admin user created directly via auth dashboard
                            const isAdmin = session.user.email.includes('admin');
                            Auth._currentUser = {
                                id: isAdmin ? 'ADM001' : 'STU_TEMP',
                                uid: session.user.id,
                                name: isAdmin ? 'System Admin' : session.user.email.split('@')[0],
                                email: session.user.email,
                                phone: '',
                                course: '',
                                year: '',
                                role: isAdmin ? 'admin' : 'student',
                                avatar: isAdmin ? 'AD' : 'US',
                                createdAt: session.user.created_at
                            };
                        }
                    } catch (err) {
                        console.error('Error fetching user profile:', err);
                        Auth._currentUser = null;
                    }
                } else {
                    Auth._currentUser = null;
                }
                Auth._initialized = true;
                resolve();
            });
        });
        return this._initPromise;
    },

    async ensureInitialized() {
        if (!this._initialized) {
            await this.initSessionListener();
        }
    },

    getCurrentUser() {
        return this._currentUser;
    },

    isLoggedIn() {
        return !!this._currentUser;
    },

    isAdmin() {
        return this._currentUser && this._currentUser.role === 'admin';
    },

    isStudent() {
        return this._currentUser && this._currentUser.role === 'student';
    },

    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                return { success: false, message: error.message };
            }

            const { data: profile, error: profError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();

            if (profError) {
                return { success: false, message: 'Login succeeded but failed to fetch profile: ' + profError.message };
            }

            if (profile) {
                this._currentUser = {
                    id: profile.student_id || 'STU_UNKNOWN',
                    uid: profile.id,
                    name: profile.full_name,
                    email: profile.email,
                    phone: profile.phone || '',
                    course: profile.course || '',
                    year: profile.year || '',
                    role: profile.role,
                    avatar: profile.avatar || 'U',
                    createdAt: profile.created_at
                };
            } else {
                // If admin logs in and has no profile, create a default in memory
                const isAdmin = data.user.email.includes('admin') || data.user.email === 'admin@university.edu';
                this._currentUser = {
                    id: isAdmin ? 'ADM001' : 'STU_TEMP',
                    uid: data.user.id,
                    name: isAdmin ? 'System Admin' : data.user.email.split('@')[0],
                    email: data.user.email,
                    phone: '',
                    course: '',
                    year: '',
                    role: isAdmin ? 'admin' : 'student',
                    avatar: isAdmin ? 'AD' : 'US',
                    createdAt: data.user.created_at
                };
            }

            return { success: true, user: this._currentUser };
        } catch (err) {
            return { success: false, message: 'An unexpected authentication error occurred: ' + err.message };
        }
    },

    async register(userData) {
        try {
            // Check student ID uniqueness in profiles table first
            const { data: existingStudent, error: checkError } = await supabase
                .from('profiles')
                .select('student_id')
                .eq('student_id', userData.studentId)
                .maybeSingle();

            if (checkError) {
                return { success: false, message: 'Database check failed: ' + checkError.message };
            }
            if (existingStudent) {
                return { success: false, message: 'Student ID is already registered.' };
            }

            // Create Supabase Auth Account
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password
            });

            if (error) {
                return { success: false, message: error.message };
            }

            const user = data.user;
            if (!user) {
                return { success: false, message: 'Registration failed. No auth user created.' };
            }

            const avatar = userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

            // Insert details into profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: user.id,
                    full_name: userData.name,
                    student_id: userData.studentId,
                    email: userData.email,
                    phone: userData.phone || '',
                    course: userData.course || '',
                    year: userData.year || '',
                    role: 'student',
                    avatar: avatar
                }]);

            if (profileError) {
                return { success: false, message: 'Auth account created, but profile save failed: ' + profileError.message };
            }

            return { success: true, message: 'Registration successful! You can now log in.' };
        } catch (err) {
            return { success: false, message: 'An unexpected error occurred during registration: ' + err.message };
        }
    },

    async logout() {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.error('Sign out error:', e);
        }
        this._currentUser = null;
    },

    async updateProfile(data) {
        if (!this._currentUser) return { success: false, message: 'Not logged in.' };

        const avatar = data.name ? data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : this._currentUser.avatar;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: data.name,
                    phone: data.phone,
                    course: data.course,
                    year: data.year,
                    avatar: avatar,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this._currentUser.uid);

            if (error) {
                return { success: false, message: error.message };
            }

            this._currentUser.name = data.name;
            this._currentUser.phone = data.phone;
            this._currentUser.course = data.course;
            this._currentUser.year = data.year;
            this._currentUser.avatar = avatar;

            return { success: true, message: 'Profile updated successfully.' };
        } catch (err) {
            return { success: false, message: 'Unexpected database error: ' + err.message };
        }
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
