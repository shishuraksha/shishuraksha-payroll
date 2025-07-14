/**
 * Supabase Authentication Service
 * Handles login, logout, session management with Supabase Auth
 */

class SupabaseAuthService {
    constructor() {
        this.client = null;
        this.user = null;
        this.session = null;
        this.initialized = false;
        
        // Default user roles - can be extended with Supabase RLS policies
        this.defaultUsers = [
            { email: 'admin@shishuraksha.com', password: 'admin123', role: 'admin', name: 'System Administrator' },
            { email: 'hr@shishuraksha.com', password: 'hr123', role: 'hr', name: 'HR Manager' },
            { email: 'accounts@shishuraksha.com', password: 'acc123', role: 'accountant', name: 'Accountant' },
            { email: 'hospital@shishuraksha.com', password: 'hospital@2025', role: 'admin', name: 'Hospital Admin' }
        ];
    }

    async init() {
        if (this.initialized) return;
        
        try {
            // Wait for database service to be ready
            if (!window.db) {
                await new Promise(resolve => {
                    window.addEventListener('databaseReady', resolve, { once: true });
                });
            }
            
            this.client = await window.db.getClient();
            
            // Listen for auth state changes
            this.client.auth.onAuthStateChange((event, session) => {
                console.log('🔐 Auth state changed:', event, session?.user?.email);
                this.session = session;
                this.user = session?.user || null;
                
                if (event === 'SIGNED_IN') {
                    this.handleSignIn(session);
                } else if (event === 'SIGNED_OUT') {
                    this.handleSignOut();
                } else if (event === 'TOKEN_REFRESHED') {
                    console.log('🔄 Token refreshed');
                }
            });
            
            // Check for existing session
            const { data: { session } } = await this.client.auth.getSession();
            if (session) {
                this.session = session;
                this.user = session.user;
                console.log('✅ Existing session found:', session.user.email);
            }
            
            this.initialized = true;
            console.log('✅ Supabase Auth Service initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Supabase Auth:', error);
            throw error;
        }
    }

    async signUp(email, password, userData = {}) {
        try {
            await this.init();
            
            const { data, error } = await this.client.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: userData.name || email.split('@')[0],
                        role: userData.role || 'employee',
                        ...userData
                    }
                }
            });

            if (error) throw error;
            
            console.log('✅ User signed up:', data.user?.email);
            return { user: data.user, session: data.session };
            
        } catch (error) {
            console.error('❌ Sign up error:', error);
            throw new Error(error.message || 'Failed to create account');
        }
    }

    async signIn(email, password) {
        try {
            await this.init();
            
            const { data, error } = await this.client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            
            console.log('✅ User signed in:', data.user.email);
            return { user: data.user, session: data.session };
            
        } catch (error) {
            console.error('❌ Sign in error:', error);
            throw new Error(error.message || 'Invalid login credentials');
        }
    }

    async signOut() {
        try {
            await this.init();
            
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            
            console.log('✅ User signed out');
            
        } catch (error) {
            console.error('❌ Sign out error:', error);
            throw new Error(error.message || 'Failed to sign out');
        }
    }

    async resetPassword(email) {
        try {
            await this.init();
            
            const { error } = await this.client.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            
            if (error) throw error;
            
            console.log('✅ Password reset email sent to:', email);
            
        } catch (error) {
            console.error('❌ Password reset error:', error);
            throw new Error(error.message || 'Failed to send reset email');
        }
    }

    async updatePassword(newPassword) {
        try {
            await this.init();
            
            const { error } = await this.client.auth.updateUser({
                password: newPassword
            });
            
            if (error) throw error;
            
            console.log('✅ Password updated successfully');
            
        } catch (error) {
            console.error('❌ Password update error:', error);
            throw new Error(error.message || 'Failed to update password');
        }
    }

    async getUser() {
        try {
            await this.init();
            
            const { data: { user }, error } = await this.client.auth.getUser();
            if (error) throw error;
            
            return user;
            
        } catch (error) {
            console.error('❌ Get user error:', error);
            return null;
        }
    }

    async getSession() {
        try {
            await this.init();
            
            const { data: { session }, error } = await this.client.auth.getSession();
            if (error) throw error;
            
            return session;
            
        } catch (error) {
            console.error('❌ Get session error:', error);
            return null;
        }
    }

    isAuthenticated() {
        return !!(this.session && this.user);
    }

    getCurrentUser() {
        if (!this.user) return null;
        
        return {
            id: this.user.id,
            email: this.user.email,
            name: this.user.user_metadata?.name || this.user.email.split('@')[0],
            role: this.user.user_metadata?.role || 'employee',
            permissions: this.getPermissions(this.user.user_metadata?.role || 'employee')
        };
    }

    getPermissions(role) {
        const permissions = {
            admin: ['all'],
            hr: ['employees', 'attendance', 'reports'],
            accountant: ['payroll', 'reports', 'employees'],
            employee: ['profile']
        };
        
        return permissions[role] || permissions.employee;
    }

    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        if (user.permissions.includes('all')) return true;
        return user.permissions.includes(permission);
    }

    handleSignIn(session) {
        // Update UI
        this.updateUserUI();
        
        // Redirect from login page to main app
        if (this.isOnLoginPage()) {
            this.redirectToApp();
        }
    }

    handleSignOut() {
        // Clear any local data
        this.clearLocalData();
        
        // Redirect to login page
        if (!this.isOnLoginPage()) {
            this.redirectToLogin();
        }
    }

    updateUserUI() {
        const user = this.getCurrentUser();
        if (!user) return;
        
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        
        if (userInfo && userName && userRole) {
            userName.textContent = user.name;
            userRole.textContent = user.role.toUpperCase();
            userInfo.classList.remove('hidden');
            
            console.log('✅ User UI updated for:', user.email);
        }
    }

    clearLocalData() {
        // Clear any app-specific local storage
        const keysToRemove = ['payroll_session', 'payroll_user', 'payroll_activity_logs'];
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
    }

    isOnLoginPage() {
        const path = window.location.pathname;
        return path.includes('login.html') || 
               path === '/login.html' || 
               path === '/login' || 
               path === '/';
    }

    redirectToApp() {
        console.log('🚀 Redirecting to main application');
        if (this.isOnLoginPage()) {
            window.location.href = '/app';
        }
    }

    redirectToLogin() {
        console.log('🔐 Redirecting to login page');
        if (!this.isOnLoginPage()) {
            window.location.href = '/';
        }
    }

    // Initialize default users in Supabase (run once)
    async initializeDefaultUsers() {
        console.log('🔧 Setting up default users...');
        
        for (const userData of this.defaultUsers) {
            try {
                await this.signUp(userData.email, userData.password, {
                    name: userData.name,
                    role: userData.role
                });
                console.log(`✅ Created user: ${userData.email}`);
            } catch (error) {
                // User might already exist
                if (error.message.includes('already registered')) {
                    console.log(`ℹ️ User already exists: ${userData.email}`);
                } else {
                    console.warn(`⚠️ Failed to create user ${userData.email}:`, error.message);
                }
            }
        }
    }

    // Auto-protect routes
    async protectRoute() {
        await this.init();
        
        // If not on login page and not authenticated, redirect to login
        if (!this.isOnLoginPage() && !this.isAuthenticated()) {
            console.log('🔒 Route protected: redirecting to login');
            this.redirectToLogin();
            return false;
        }
        
        // If on login page and authenticated, redirect to app
        if (this.isOnLoginPage() && this.isAuthenticated()) {
            console.log('🔓 Already authenticated: redirecting to app');
            this.redirectToApp();
            return false;
        }
        
        return true;
    }
}

// Create global auth service instance
const authService = new SupabaseAuthService();

// Export for use in other modules
window.authService = authService;
window.SupabaseAuthService = SupabaseAuthService;

// Global helper functions for templates
window.logout = () => authService.signOut();
window.getCurrentUser = () => authService.getCurrentUser();
window.hasPermission = (permission) => authService.hasPermission(permission);

// Auto-initialize and protect routes
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await authService.init();
        await authService.protectRoute();
        
        console.log('✅ Supabase Auth Service ready');
        
        // Trigger custom event when auth is ready
        window.dispatchEvent(new CustomEvent('authReady'));
        
    } catch (error) {
        console.error('❌ Failed to initialize auth service:', error);
        
        // Show user-friendly error message
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Authentication Service Failed',
                text: 'Unable to initialize authentication. Please refresh the page.',
                confirmButtonText: 'Refresh',
                allowOutsideClick: false
            }).then(() => {
                window.location.reload();
            });
        }
    }
});

export default authService;