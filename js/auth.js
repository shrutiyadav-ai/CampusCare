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
        this._initPromise = (async () => {
            // First wait for Supabase config fetch to complete
            await window.supabaseInitPromise;

            return new Promise((resolve) => {
                if (!window.supabase) {
                    Auth._currentUser = null;
                    Auth._initialized = true;
                    resolve();
                    return;
                }

                // Initial session check
                supabase.auth.getSession().then(({ data: { session } }) => {
                    this._syncUserSession(session).then(() => {
                        Auth._initialized = true;
                        resolve();
                    });
                }).catch(() => {
                    Auth._currentUser = null;
                    Auth._initialized = true;
                    resolve();
                });

                // Listen for subsequent auth state changes
                supabase.auth.onAuthStateChange(async (event, session) => {
                    await this._syncUserSession(session);
                    Auth._initialized = true;
                    // Trigger a re-render if user logged out or session changed
                    if (event === 'SIGNED_OUT') {
                        Auth._currentUser = null;
                        if (!['#/', '', '#/login', '#/register'].includes(window.location.hash)) {
                            window.location.hash = '#/login';
                        }
                    }
                });
            });
        })();
        return this._initPromise;
    },

    // Helper: Safely resolve and map user profile from database
    async _syncUserSession(session) {
        if (!session || !session.user) {
            this._currentUser = null;
            return;
        }

        const user = session.user;

        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (profile) {
                this._currentUser = {
                    id: profile.student_id || user.user_metadata?.student_id || 'STU_' + user.id.slice(0, 6).toUpperCase(),
                    uid: profile.id,
                    name: profile.full_name || user.user_metadata?.full_name || user.email.split('@')[0],
                    email: profile.email || user.email,
                    phone: profile.phone || '',
                    course: profile.course || '',
                    year: profile.year || '',
                    role: profile.role === 'admin' ? 'admin' : 'student',
                    avatar: profile.avatar || (profile.full_name ? profile.full_name.slice(0, 2).toUpperCase() : 'U'),
                    createdAt: profile.created_at || user.created_at
                };
            } else {
                // Profile not created yet (e.g. email confirmation pending or direct Auth signup)
                // Default to 'student' role. Admin role MUST be explicitly granted in database profiles table.
                const fallbackName = user.user_metadata?.full_name || user.email.split('@')[0];
                const fallbackStudentId = user.user_metadata?.student_id || 'STU_' + user.id.slice(0, 6).toUpperCase();
                const avatar = fallbackName.slice(0, 2).toUpperCase();

                this._currentUser = {
                    id: fallbackStudentId,
                    uid: user.id,
                    name: fallbackName,
                    email: user.email,
                    phone: user.user_metadata?.phone || '',
                    course: user.user_metadata?.course || '',
                    year: user.user_metadata?.year || '',
                    role: 'student',
                    avatar: avatar,
                    createdAt: user.created_at
                };

                // Attempt to lazily populate missing profile row
                try {
                    await supabase.from('profiles').insert([{
                        id: user.id,
                        full_name: fallbackName,
                        student_id: fallbackStudentId,
                        email: user.email,
                        phone: user.user_metadata?.phone || '',
                        course: user.user_metadata?.course || '',
                        year: user.user_metadata?.year || '',
                        role: 'student',
                        avatar: avatar
                    }]);
                } catch (insertErr) {
                    // Ignored if handled by database trigger
                }
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
            // Default to safe student session if basic auth user exists
            this._currentUser = {
                id: 'STU_' + user.id.slice(0, 6).toUpperCase(),
                uid: user.id,
                name: user.email.split('@')[0],
                email: user.email,
                phone: '',
                course: '',
                year: '',
                role: 'student',
                avatar: 'U',
                createdAt: user.created_at
            };
        }
    },

    async ensureInitialized() {
        await window.supabaseInitPromise;
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
        if (!window.supabase) {
            return { success: false, message: window.SUPABASE_CONFIG_ERROR || 'Supabase authentication service is currently unavailable.' };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (error) {
                return { success: false, message: error.message };
            }

            if (!data.user) {
                return { success: false, message: 'Authentication failed. Please check your credentials.' };
            }

            // Sync user session and profile from database
            await this._syncUserSession(data.session);

            if (!this._currentUser) {
                return { success: false, message: 'Login succeeded, but profile could not be loaded.' };
            }

            return { success: true, user: this._currentUser };
        } catch (err) {
            return { success: false, message: 'An unexpected authentication error occurred: ' + err.message };
        }
    },

    async register(userData) {
        if (!window.supabase) {
            return { success: false, message: window.SUPABASE_CONFIG_ERROR || 'Supabase authentication service is currently unavailable.' };
        }

        try {
            // Check student ID uniqueness safely via RPC (or query fallback)
            try {
                const { data: idTaken } = await supabase.rpc('check_student_id_exists', {
                    check_id: userData.studentId.trim()
                });
                if (idTaken) {
                    return { success: false, message: 'Student ID is already registered.' };
                }
            } catch (rpcErr) {
                // Fallback to select check if RPC not yet created
                const { data: existingStudent } = await supabase
                    .from('profiles')
                    .select('student_id')
                    .eq('student_id', userData.studentId.trim())
                    .maybeSingle();

                if (existingStudent) {
                    return { success: false, message: 'Student ID is already registered.' };
                }
            }

            // Create Supabase Auth Account
            const { data, error } = await supabase.auth.signUp({
                email: userData.email.trim(),
                password: userData.password,
                options: {
                    data: {
                        full_name: userData.name.trim(),
                        student_id: userData.studentId.trim(),
                        phone: userData.phone ? userData.phone.trim() : '',
                        course: userData.course || '',
                        year: userData.year || ''
                    }
                }
            });

            if (error) {
                return { success: false, message: error.message };
            }

            const user = data.user;
            if (!user) {
                return { success: false, message: 'Registration failed. No account created.' };
            }

            // In Supabase, if email is already registered and email confirmations are active,
            // an empty identities array is returned to prevent email enumeration.
            if (user.identities && user.identities.length === 0) {
                return { success: false, message: 'An account with this email already exists. Please log in.' };
            }

            const avatar = userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

            // Attempt to ensure profile row exists (if DB trigger didn't already create it)
            if (data.session) {
                await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        full_name: userData.name.trim(),
                        student_id: userData.studentId.trim(),
                        email: userData.email.trim(),
                        phone: userData.phone ? userData.phone.trim() : '',
                        course: userData.course || '',
                        year: userData.year || '',
                        role: 'student',
                        avatar: avatar
                    });
            }

            const msg = data.session 
                ? 'Registration successful! You can now log in.' 
                : 'Registration successful! Please check your email to confirm your account before logging in.';
            return { success: true, message: msg };
        } catch (err) {
            return { success: false, message: 'An unexpected error occurred during registration: ' + err.message };
        }
    },

    async logout() {
        if (window.supabase) {
            try {
                await supabase.auth.signOut();
            } catch (e) {
                console.error('Sign out error:', e);
            }
        }
        this._currentUser = null;
    },

    async updateProfile(data) {
        if (!this._currentUser) return { success: false, message: 'Not logged in.' };
        if (!window.supabase) {
            return { success: false, message: window.SUPABASE_CONFIG_ERROR || 'Supabase service is currently unavailable.' };
        }

        const avatar = data.name ? data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : this._currentUser.avatar;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: data.name.trim(),
                    phone: data.phone ? data.phone.trim() : '',
                    course: data.course || '',
                    year: data.year || '',
                    avatar: avatar,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this._currentUser.uid);

            if (error) {
                return { success: false, message: error.message };
            }

            this._currentUser.name = data.name.trim();
            this._currentUser.phone = data.phone ? data.phone.trim() : '';
            this._currentUser.course = data.course || '';
            this._currentUser.year = data.year || '';
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
