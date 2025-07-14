# Development Guide

This guide covers the technical aspects of developing and maintaining the Shishuraksha Payroll System.

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   External      │
│   (Vanilla JS)  │◄──►│   (PostgreSQL)  │◄──►│   Services      │
│   Tailwind CSS  │    │   Row Level     │    │   (Optional)    │
│   Chart.js      │    │   Security      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Folder Structure
```
src/
├── scripts/
│   ├── core/           # Core business logic
│   │   ├── data-persistence.js    # Data storage layer
│   │   ├── payroll-calculations.js # Payroll engine
│   │   └── ui-interactions.js     # UI event handlers
│   ├── modules/        # Feature modules
│   │   ├── attendance-management.js
│   │   ├── doctors-management.js
│   │   └── pdf-reports.js
│   ├── reports/        # Report generation
│   │   ├── advance-reports.js
│   │   ├── doctors-pdf-reports.js
│   │   └── master-report-pdf.js
│   └── utils/          # Utility functions
│       ├── data-import.js
│       ├── error-handler.js
│       └── ui-enhancements.js
├── services/           # External service integrations
│   ├── employee-service.js
│   ├── attendance-service.js
│   └── supabase-config.js
├── styles/             # Stylesheets
│   ├── main.css
│   ├── enhanced-ui.css
│   └── responsive.css
└── assets/             # Static assets
    ├── images/
    ├── icons/
    └── fonts/
```

## 🔧 Development Setup

### Prerequisites
- Node.js (v14+)
- Git
- Code editor (VS Code recommended)
- Modern browser with developer tools

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Format code
npm run format
```

### Environment Configuration
Create `.env.local`:
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-key
VITE_ENVIRONMENT=development
VITE_DEBUG=true
```

## 📚 Core Modules

### Data Persistence Layer
**File**: `src/scripts/core/data-persistence.js`

Handles all data storage operations:
```javascript
// Save data to localStorage/Supabase
saveData(key, data)

// Load data from storage
loadData(key)

// Sync with remote database
syncToSupabase()
```

### Payroll Calculation Engine
**File**: `src/scripts/core/payroll-calculations.js`

Core payroll processing logic:
```javascript
// Main payroll processing function
processPayroll(employees, attendance)

// Calculate individual employee salary
calculateSalary(employee, attendanceData)

// Apply hospital-specific rules
applyHospitalRules(workingDays, attendanceRecord)
```

### Attendance Management
**File**: `src/scripts/modules/attendance-management.js`

Hospital-specific attendance rules:
```javascript
// Validate off limits (max 4 per month)
validateOffLimits(employeeId, month, newOffCount)

// Calculate P+OT as 2 days
calculatePlusOTDays(attendanceRecord)

// Handle unused off payments
calculateUnusedOffs(totalDays, presentDays, offDays)
```

## 🔐 Security Considerations

### Data Validation
- Input sanitization for all user inputs
- Type checking for numerical calculations
- Date validation for attendance records
- File type validation for uploads

### Authentication & Authorization
- Supabase Row Level Security (RLS)
- Environment-based access controls
- Secure API key management

### Security Headers
```javascript
// Content Security Policy
"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' cdn.jsdelivr.net cdnjs.cloudflare.com;"

// XSS Protection
"X-XSS-Protection": "1; mode=block"

// Frame Protection
"X-Frame-Options": "DENY"
```

## 🧪 Testing Strategy

### Test Structure
```
tests/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for modules
├── e2e/           # End-to-end tests
└── fixtures/      # Test data and mocks
```

### Testing Guidelines
1. **Unit Tests**: Test individual functions in isolation
2. **Integration Tests**: Test module interactions
3. **E2E Tests**: Test complete user workflows
4. **Manual Testing**: Test UI/UX and edge cases

### Test Data
Use the sample data generation functions:
```javascript
// Generate test employees
generateSampleEmployees(count)

// Generate test attendance
generateMonthlyAttendance()

// Generate test payroll data
generateSamplePayrollData()
```

## 🚀 Build Process

### Development Build
```bash
npm run dev
# - No minification
# - Source maps enabled
# - Hot reloading
# - Debug logging
```

### Production Build
```bash
npm run build
# - Minification enabled
# - Source maps disabled
# - Environment optimization
# - Asset optimization
```

### Build Configuration
**File**: `scripts/build-production.js`

The build process:
1. Clean output directory
2. Copy and process HTML files
3. Minify JavaScript files
4. Optimize CSS files
5. Generate environment configuration
6. Create deployment package

## 📊 Performance Optimization

### Code Splitting
- Lazy load report modules
- Dynamic imports for large libraries
- Module-based code organization

### Caching Strategy
- Browser caching for static assets
- localStorage for user preferences
- Supabase query caching

### Bundle Optimization
```javascript
// Remove console.log in production
compress: {
    drop_console: true,
    drop_debugger: true
}

// Optimize for size
mangle: true,
format: { comments: false }
```

## 🔄 Data Flow

### Employee Management Flow
```
User Input → Validation → Storage → UI Update → Database Sync
```

### Payroll Processing Flow
```
Attendance Data → Rule Engine → Calculations → Validation → Report Generation
```

### Report Generation Flow
```
Data Query → Processing → Template Application → PDF/Excel Generation → Download
```

## 🐛 Debugging

### Development Tools
- Browser Developer Tools
- Console logging with levels
- Performance monitoring
- Network request inspection

### Common Debug Patterns
```javascript
// Conditional logging
if (window.AppConfig?.features?.enableDebugMode) {
    console.log('Debug info:', data);
}

// Error boundaries
try {
    // risky operation
} catch (error) {
    ErrorHandler.log(error);
    // fallback behavior
}

// Performance monitoring
const start = performance.now();
// operation
console.log('Operation took:', performance.now() - start);
```

## 📝 Code Style Guidelines

### JavaScript Standards
- ES6+ features preferred
- Consistent naming conventions
- JSDoc comments for functions
- Error handling for async operations

### CSS Guidelines
- Tailwind CSS utility classes
- Custom CSS in separate files
- Responsive design principles
- Dark mode support

### File Naming
- kebab-case for file names
- camelCase for JavaScript variables
- PascalCase for constructor functions
- UPPER_CASE for constants

## 🔌 API Integration

### Supabase Integration
```javascript
// Initialize client
const supabase = createClient(url, key);

// Query data
const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('status', 'Active');

// Insert data
const { data, error } = await supabase
    .from('employees')
    .insert([newEmployee]);
```

### Error Handling
```javascript
// Standardized error handling
if (error) {
    ErrorHandler.handle(error);
    return { success: false, error: error.message };
}
```

## 📋 Contributing Guidelines

### Development Workflow
1. Create feature branch from main
2. Implement changes with tests
3. Run quality checks (lint, format, test)
4. Create pull request with description
5. Code review and approval
6. Merge to main

### Commit Messages
```
feat: add employee bulk import functionality
fix: resolve payroll calculation error for overtime
docs: update API documentation
refactor: improve attendance validation logic
test: add unit tests for payroll engine
```

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Performance impact is considered

## 🚀 Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
npm run deploy

# Deploy preview
npm run deploy:preview
```

### Environment Variables (Production)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENVIRONMENT=production
VITE_APP_VERSION=2.0.0
```

### Monitoring
- Vercel Analytics for performance
- Supabase metrics for database
- Error tracking (optional)
- User feedback collection

## 📞 Support

For development support:
- Check existing documentation
- Review code comments and JSDoc
- Consult the API reference
- Contact the development team

---

**Happy Coding!** 🚀