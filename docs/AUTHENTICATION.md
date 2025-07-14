# 🔐 Authentication System

## Overview

The Shishuraksha Payroll System now includes a comprehensive authentication system with role-based access control, session management, and security features.

## 🔑 User Credentials

### Default User Accounts

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `admin` | `admin123` | Admin | Full system access |
| `hr` | `hr123` | HR Manager | Employees, Attendance, Reports |
| `accounts` | `acc123` | Accountant | Payroll, Reports, Employees |
| `shishuraksha` | `hospital@2025` | Hospital Admin | Full system access |

### Role Permissions

- **Admin**: Complete access to all features
- **HR Manager**: Employee management, attendance tracking, reports
- **Accountant**: Payroll processing, financial reports, employee data

## 🛡️ Security Features

### Session Management
- **Session Timeout**: 30 minutes of inactivity
- **Remember Me**: Optional extended sessions
- **Auto-logout**: Automatic logout on session expiry
- **Activity Tracking**: User actions are logged

### Password Security
- Client-side validation
- Failed attempt logging
- Password visibility toggle
- Secure session storage

### Access Control
- Role-based permissions
- Protected routes
- Automatic redirects for unauthorized access

## 🚀 How It Works

### Login Process
1. User enters credentials on `/login.html`
2. System validates against user database
3. Session created with expiration time
4. User redirected to main application
5. Session monitored for activity

### Session Flow
```
Login → Validate → Create Session → Access App → Monitor Activity → Auto-logout/Manual Logout
```

### Auto-Protection
- Unauthenticated users are redirected to login
- Session validation on page load
- Automatic session extension on activity

## 📱 User Interface

### Login Page Features
- Professional hospital-themed design
- Responsive mobile layout
- Password visibility toggle
- "Remember Me" option
- Demo credentials display
- Forgot password helper

### Main App Security
- User info display in header
- Role badge showing current permissions
- One-click logout button
- Session status monitoring

## 🔧 Technical Implementation

### Files Structure
```
src/scripts/core/auth.js     # Main authentication system
login.html                   # Login page
docs/AUTHENTICATION.md       # This documentation
```

### Key Functions
- `AuthSystem.handleLogin()` - Process login attempts
- `AuthSystem.logout()` - Secure logout process
- `AuthSystem.hasPermission()` - Check user permissions
- `AuthSystem.refreshSession()` - Extend session on activity

## 🔒 Production Security Notes

### For Production Deployment
1. **Change Default Passwords**: Update all default passwords
2. **Use HTTPS**: Ensure SSL/TLS encryption
3. **Server-Side Validation**: Implement backend authentication
4. **Password Hashing**: Use bcrypt or similar for password storage
5. **Rate Limiting**: Implement login attempt limits
6. **Audit Logging**: Enhanced server-side activity tracking

### Environment Variables
Add these for enhanced security:
```env
VITE_SESSION_TIMEOUT=1800000  # 30 minutes
VITE_ENABLE_REMEMBER_ME=true
VITE_MAX_LOGIN_ATTEMPTS=5
```

## 📊 Activity Logging

The system logs:
- Login attempts (successful/failed)
- User sessions (start/end)
- Page access attempts
- System actions by user

Logs are stored locally and can be extended to send to a server.

## 🆘 Troubleshooting

### Common Issues

**"Session Expired" Messages**
- Check system time accuracy
- Verify session timeout settings
- Clear browser storage if needed

**Login Not Working**
- Verify credentials from table above
- Check browser console for errors
- Ensure JavaScript is enabled

**Redirecting to Login Repeatedly**
- Clear browser cache and cookies
- Check localStorage permissions
- Verify auth.js is loading properly

### Reset Authentication
```javascript
// Clear all sessions (run in browser console)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## 🔄 Future Enhancements

Planned security improvements:
- Two-factor authentication (2FA)
- Password complexity requirements
- Account lockout after failed attempts
- Integration with LDAP/Active Directory
- Audit trail with detailed reporting
- API token authentication for integrations

## 📞 Support

For authentication issues:
1. Check this documentation
2. Verify user credentials
3. Test in different browser
4. Contact system administrator

---

**Security Note**: This implementation provides client-side authentication suitable for controlled environments. For high-security requirements, implement server-side authentication with proper password hashing and validation.