# Shishuraksha Children's Hospital - Payroll Management System

A comprehensive, professional-grade payroll management system designed specifically for healthcare institutions with advanced features for employee management, attendance tracking, payroll processing, and compliance reporting.

## 🏥 Features

### Core Modules
- **Employee Management**: Complete CRUD operations with salary components, deductions, and benefits
- **Attendance Management**: 24-hour hospital attendance tracking with off limits and overtime support
- **Payroll Processing**: Automated calculations with PF, ESIC, PT, and advance deductions
- **Doctor Management**: Specialized module for medical staff with consultation fees and schedules
- **Reports & Analytics**: Comprehensive reporting with PDF and Excel export capabilities

### Hospital-Specific Features
- **4-Off Rule**: Maximum 4 paid offs per month with automatic warnings
- **P+OT System**: Present + Overtime counting as 2 days payment
- **Unused Off Payment**: Automatic payment for unused offs
- **24-Hour Operations**: Support for continuous hospital operations

### Advanced Capabilities
- **Government Compliance**: PF, ESIC, and Professional Tax calculations
- **Advance Management**: Loan processing with EMI scheduling
- **Bulk Operations**: Excel import/export for mass data operations
- **Professional PDFs**: High-quality payslips and reports generation

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Supabase account (for production deployment)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd payroll

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development
```bash
# Start local development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
payroll/
├── src/                    # Source code
│   ├── scripts/           # Application logic
│   │   ├── core/         # Core functionality
│   │   ├── modules/      # Feature modules
│   │   ├── reports/      # Report generation
│   │   └── utils/        # Utility functions
│   ├── services/         # API and data services
│   ├── styles/           # CSS stylesheets
│   └── assets/           # Static assets
├── config/               # Configuration files
│   ├── environments/     # Environment-specific configs
│   └── database/         # Database configurations
├── docs/                 # Documentation
├── scripts/              # Build and deployment scripts
├── supabase/            # Database schema and migrations
├── tests/               # Test files
└── public/              # Public assets
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for development:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_NAME=Shishuraksha Payroll System
VITE_APP_VERSION=2.0.0
VITE_ENVIRONMENT=development
```

### Application Settings
Configure the system in `config/app.config.js`:
- Payroll rules and rates
- Deduction percentages
- Company information
- Feature flags

## 📚 Documentation

- [User Guide](./user-guide/README.md) - Complete user manual
- [API Documentation](./api/README.md) - API reference
- [Development Guide](./development/README.md) - Developer documentation
- [Deployment Guide](./deployment/README.md) - Production deployment

## 🔒 Security

- Row Level Security (RLS) enabled on all database tables
- Content Security Policy (CSP) headers
- Input validation and sanitization
- Secure environment variable management

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npm run deploy

# Preview deployment
npm run deploy:preview
```

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting service
```

## 📊 Tech Stack

- **Frontend**: Vanilla JavaScript, Tailwind CSS, Chart.js
- **Backend**: Supabase (PostgreSQL, Row Level Security)
- **Hosting**: Vercel (recommended)
- **PDF Generation**: jsPDF with autotable
- **Excel Processing**: SheetJS
- **Build Tool**: Custom Node.js scripts

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software developed for Shishuraksha Children's Hospital.

## 📞 Support

For technical support or feature requests, please contact the development team.

---

**Version**: 2.0.0  
**Last Updated**: January 2025  
**Developed by**: Professional Payroll Solutions