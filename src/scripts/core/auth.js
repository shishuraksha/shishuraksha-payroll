/**
 * Authentication System for Shishuraksha Payroll System
 * Handles login, logout, session management, and role-based access
 */

class AuthSystem {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
        
        // Define user roles and permissions
        this.users = [
            {
                username: 'admin',
                password: 'admin123', // In production, use hashed passwords
                role: 'admin',
                name: 'System Administrator',
                permissions: ['all']
            },
            {
                username: 'hr',
                password: 'hr123',
                role: 'hr',
                name: 'HR Manager',
                permissions: ['employees', 'attendance', 'reports']
            },
            {
                username: 'accounts',
                password: 'acc123',
                role: 'accountant',
                name: 'Accountant',
                permissions: ['payroll', 'reports', 'employees']
            },
            {
                username: 'shishuraksha',
                password: 'hospital@2025',
                role: 'admin',
                name: 'Hospital Admin',
                permissions: ['all']
            }
        ];

        this.init();
    }

    init() {
        // Check if user is already logged in
        this.checkExistingSession();
        
        // Setup login form handler
        this.setupLoginForm();
        
        // Setup session management
        this.setupSessionManagement();
    }

    checkExistingSession() {
        const savedSession = localStorage.getItem('payroll_session') || sessionStorage.getItem('payroll_session');
        const savedUser = localStorage.getItem('payroll_user') || sessionStorage.getItem('payroll_user');
        
        console.log('🔍 Checking session - Current path:', window.location.pathname);
        
        if (savedSession && savedUser) {
            try {
                const sessionData = JSON.parse(savedSession);
                const userData = JSON.parse(savedUser);
                
                // Check if session is still valid
                if (this.isSessionValid(sessionData)) {
                    this.currentUser = userData;
                    this.isLoggedIn = true;
                    
                    console.log('✅ Valid session found for user:', userData.username);
                    
                    // Update UI if we're on the main app
                    if (!this.isOnLoginPage()) {
                        this.updateUserUI();
                        this.startSessionTimer();
                        return;
                    }
                    
                    // If we're on login page with valid session, redirect to main app
                    if (this.isOnLoginPage()) {
                        console.log('🔄 Redirecting from login to main app');
                        this.redirectToApp();
                    }
                    return;
                } else {
                    console.log('⏰ Session expired, clearing');
                    this.clearSession();
                }
            } catch (error) {
                console.error('❌ Error parsing session data:', error);
                this.clearSession();
            }
        }
        
        // If not logged in and not on login page, redirect to login
        if (!this.isLoggedIn && !this.isOnLoginPage()) {
            console.log('🔐 No valid session, redirecting to login');
            this.redirectToLogin();
        }
    }

    isOnLoginPage() {
        const path = window.location.pathname;
        const search = window.location.search;
        const hash = window.location.hash;
        
        // Check for login-related paths and routes
        return path.includes('login.html') || 
               path === '/login.html' || 
               path === '/login' || 
               path === '/' || 
               search.includes('login') ||
               hash.includes('login');
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginBtn = document.getElementById('loginBtn');
        const loginBtnText = document.getElementById('loginBtnText');

        // Validate inputs
        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        loginBtnText.textContent = 'Signing in...';

        try {
            // Simulate network delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Authenticate user
            const user = this.authenticateUser(username, password);
            
            if (user) {
                // Successful login
                this.loginSuccess(user, rememberMe);
            } else {
                // Failed login
                this.loginFailed();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('An error occurred during login. Please try again.');
        } finally {
            // Reset button state
            loginBtn.disabled = false;
            loginBtnText.textContent = 'Sign In';
        }
    }

    authenticateUser(username, password) {
        return this.users.find(user => 
            user.username === username && user.password === password
        );
    }

    loginSuccess(user, rememberMe) {
        this.currentUser = user;
        this.isLoggedIn = true;

        // Create session
        const sessionData = {
            loginTime: Date.now(),
            expiresAt: Date.now() + this.sessionTimeout,
            rememberMe: rememberMe
        };

        // Save session
        if (rememberMe) {
            localStorage.setItem('payroll_session', JSON.stringify(sessionData));
            localStorage.setItem('payroll_user', JSON.stringify({
                username: user.username,
                role: user.role,
                name: user.name,
                permissions: user.permissions
            }));
        } else {
            sessionStorage.setItem('payroll_session', JSON.stringify(sessionData));
            sessionStorage.setItem('payroll_user', JSON.stringify({
                username: user.username,
                role: user.role,
                name: user.name,
                permissions: user.permissions
            }));
        }

        // Log activity
        this.logActivity('user_login', `User ${user.username} logged in successfully`);

        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: `Welcome back, ${user.name}`,
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            this.redirectToApp();
        });
    }

    loginFailed() {
        // Log failed attempt
        this.logActivity('login_failed', 'Failed login attempt');

        this.showError('Invalid username or password. Please try again.');
        
        // Clear password field
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }

    redirectToApp() {
        // Start session timer
        this.startSessionTimer();
        
        // Redirect to main application
        console.log('🚀 Redirecting to main application');
        if (this.isOnLoginPage()) {
            // Use the /app route which maps to index.html in vercel.json
            window.location.href = '/app';
        }
    }

    redirectToLogin() {
        console.log('🔐 Redirecting to login page');
        if (!this.isOnLoginPage()) {
            // Use the root route which maps to login.html in vercel.json
            window.location.href = '/';
        }
    }

    logout(showMessage = true) {
        // Log activity
        if (this.currentUser) {
            this.logActivity('user_logout', `User ${this.currentUser.username} logged out`);
        }

        // Clear session
        this.clearSession();
        
        // Clear timers
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }

        // Reset state
        this.isLoggedIn = false;
        this.currentUser = null;

        if (showMessage) {
            Swal.fire({
                icon: 'info',
                title: 'Logged Out',
                text: 'You have been successfully logged out.',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                this.redirectToLogin();
            });
        } else {
            this.redirectToLogin();
        }
    }

    clearSession() {
        localStorage.removeItem('payroll_session');
        localStorage.removeItem('payroll_user');
        sessionStorage.removeItem('payroll_session');
        sessionStorage.removeItem('payroll_user');
    }

    isSessionValid(sessionData) {
        return Date.now() < sessionData.expiresAt;
    }

    startSessionTimer() {
        // Clear existing timer
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }

        // Set new timer
        this.sessionTimer = setTimeout(() => {
            this.sessionExpired();
        }, this.sessionTimeout);
    }

    sessionExpired() {
        Swal.fire({
            icon: 'warning',
            title: 'Session Expired',
            text: 'Your session has expired. Please log in again.',
            confirmButtonText: 'Login Again',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then(() => {
            this.logout(false);
        });
    }

    refreshSession() {
        if (!this.isLoggedIn) return;

        const sessionData = {
            loginTime: Date.now(),
            expiresAt: Date.now() + this.sessionTimeout,
            rememberMe: true
        };

        localStorage.setItem('payroll_session', JSON.stringify(sessionData));
        this.startSessionTimer();
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        if (this.currentUser.permissions.includes('all')) return true;
        return this.currentUser.permissions.includes(permission);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    updateUserUI() {
        if (!this.currentUser) return;
        
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');
        const userRole = document.getElementById('userRole');
        
        if (userInfo && userName && userRole) {
            userName.textContent = this.currentUser.name || this.currentUser.username;
            userRole.textContent = this.currentUser.role.toUpperCase();
            userInfo.classList.remove('hidden');
            
            console.log('✅ User UI updated for:', this.currentUser.username);
        }
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Login Error',
            text: message,
            confirmButtonColor: '#ef4444'
        });
    }

    logActivity(action, message) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            action: action,
            message: message,
            user: this.currentUser?.username || 'anonymous',
            ip: 'client-side' // In production, get from server
        };

        // Store in localStorage for now (in production, send to server)
        const logs = JSON.parse(localStorage.getItem('payroll_activity_logs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('payroll_activity_logs', JSON.stringify(logs));
        console.log('Activity Log:', logEntry);
    }

    setupSessionManagement() {
        // Extend session on user activity
        let activityTimer;
        const resetActivityTimer = () => {
            clearTimeout(activityTimer);
            activityTimer = setTimeout(() => {
                if (this.isLoggedIn) {
                    this.refreshSession();
                }
            }, 5 * 60 * 1000); // 5 minutes
        };

        // Listen for user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetActivityTimer, true);
        });
    }
}

// Initialize authentication system
const authSystem = new AuthSystem();

// Export for global access
window.AuthSystem = authSystem;

// Helper functions for templates
window.logout = () => authSystem.logout();
window.getCurrentUser = () => authSystem.getCurrentUser();
window.hasPermission = (permission) => authSystem.hasPermission(permission);