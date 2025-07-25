# Shishuraksha Children's Hospital - Payroll Management System

🚀 **Professional Payroll System with Cloud Database**

## Overview

A comprehensive web-based payroll management system designed specifically for healthcare institutions. This system handles employee management, attendance tracking, payroll processing, and report generation with special modules for managing doctor payments and professional fees.

## Features

### Core Modules
- **Employee Management**: Complete CRUD operations for employee records
- **Attendance Tracking**: Monthly attendance management with support for overtime and night hours
- **Payroll Processing**: Automated salary calculations with statutory deductions
- **Report Generation**: Multiple report formats including PDF and Excel exports

### Special Features
- **Doctors Module**: Separate management for visiting doctors with hourly rates
- **Import/Export**: Bulk import employee data from CSV/Excel files
- **Multi-format Reports**: Professional PDF reports with charts and summaries
- **Dark Mode**: Eye-friendly dark theme support
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **PDF Generation**: jsPDF with autoTable plugin
- **Excel Processing**: SheetJS (XLSX)
- **Icons**: Font Awesome
- **Notifications**: SweetAlert2
- **Storage**: Browser LocalStorage for data persistence

## Project Structure

```
payroll/
   config/                 # Configuration files
      app.config.js      # Central application configuration
   data/                  # Data files
      samples/           # Sample data files
      exports/           # Generated export files
   docs/                  # Documentation
      README.md
      guides/            # User guides and technical docs
   public/                # Public assets
      css/              # Stylesheets
      js/               # JavaScript files
      images/           # Images and icons
   src/                   # Source code
      assets/           # Raw assets
      scripts/          # JavaScript modules
         core/         # Core functionality
         modules/      # Feature modules
         reports/      # Report generators
         utils/        # Utility functions
      styles/           # CSS source files
   tests/                 # Test files
      unit/             # Unit tests
      integration/      # Integration tests
   index.html            # Main application entry point
   package.json          # Project metadata
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd payroll
```

2. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)

3. The application is ready to use!

## Usage

### First Time Setup
1. The system will generate sample data on first load
2. Navigate to Settings to configure company details
3. Import existing employee data using the Import feature

### Daily Operations
1. **Attendance**: Mark daily attendance in the Attendance tab
2. **Payroll**: Process monthly payroll from the Payroll tab
3. **Reports**: Generate various reports from the Reports section

### Data Import
1. Go to Employees tab
2. Click "Import Data" button
3. Upload CSV/Excel file with employee details
4. Review and confirm import

### Backup
- Data is automatically saved to browser storage
- Export data regularly using the Reports section
- Use "Export All Data" for complete backup

## Security Considerations

- All data is stored locally in the browser
- No data is transmitted to external servers
- Sensitive information should be handled according to your organization's policies
- Regular backups are recommended

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Support

For issues, feature requests, or questions:
- Check the documentation in the `docs/` folder
- Review sample data formats in `data/samples/`

## License

This software is proprietary to Shishuraksha Children's Hospital. All rights reserved.

## Version History

- v2.0.0 (2025-06-29): Major update with import/export features
- v1.0.0 (2025-01-01): Initial release

---

**Note**: This is a client-side application. All data processing happens in your browser, ensuring data privacy and security.