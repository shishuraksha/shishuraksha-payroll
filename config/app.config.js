/**
 * Application Configuration
 * Central configuration file for the Payroll Management System
 */

const AppConfig = {
    // Application metadata
    app: {
        name: 'Shishuraksha Children\'s Hospital - Payroll Management System',
        version: '2.0.0',
        environment: 'production',
        author: 'Professional Payroll Solutions',
        lastUpdated: '2025-06-29'
    },

    // Company details
    company: {
        name: 'Shishuraksha Children\'s Hospital',
        address: '',
        contact: '',
        email: '',
        website: '',
        logo: 'public/images/logo.png'
    },

    // Payroll configuration
    payroll: {
        currency: '₹',
        currencyCode: 'INR',
        locale: 'en-IN',
        
        // Deduction rates
        deductions: {
            pf: {
                employee: 0.12, // 12%
                employer: 0.12, // 12%
                adminCharges: 0.005, // 0.5%
                edliCharges: 0.005 // 0.5%
            },
            esic: {
                employee: 0.0075, // 0.75%
                employer: 0.0325, // 3.25%
                cutoff: 21000 // ESIC applicable if gross <= 21000
            },
            pt: {
                karnataka: [
                    { min: 0, max: 15000, amount: 0 },
                    { min: 15001, max: Infinity, amount: 200 }
                ]
            }
        },

        // Allowances configuration
        allowances: {
            hra: {
                percentage: 0.10, // 10% of basic
                minAmount: 0
            },
            conveyance: {
                percentage: 0.04, // 4% of basic
                maxAmount: 3200,
                minAmount: 0
            },
            other: {
                percentage: 0.05, // 5% of basic
                minAmount: 0
            }
        },

        // Overtime configuration
        overtime: {
            normalRate: 1.5, // 1.5x for overtime
            nightRate: 2.0, // 2x for night hours
            holidayRate: 2.5 // 2.5x for holidays
        }
    },

    // Export configuration
    export: {
        pdf: {
            pageSize: 'A4',
            orientation: 'portrait',
            margins: {
                top: 40,
                right: 40,
                bottom: 40,
                left: 40
            },
            defaultFont: 'Helvetica',
            fontSize: {
                title: 16,
                heading: 14,
                normal: 10,
                small: 8
            }
        },
        excel: {
            defaultSheetName: 'Payroll Data',
            dateFormat: 'DD-MM-YYYY',
            numberFormat: '#,##0.00'
        }
    },

    // Data storage
    storage: {
        type: 'localStorage',
        prefix: 'payroll_',
        encryption: false,
        autoSave: true,
        autoSaveInterval: 30000 // 30 seconds
    },

    // UI configuration
    ui: {
        theme: {
            primary: '#3b82f6',
            secondary: '#8b5cf6',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6'
        },
        animation: {
            duration: 300,
            easing: 'ease-in-out'
        },
        table: {
            rowsPerPage: 50,
            enablePagination: true,
            enableSorting: true,
            enableFiltering: true
        }
    },

    // Validation rules
    validation: {
        employee: {
            id: {
                pattern: /^EMP\d{3,}$/,
                message: 'Employee ID must be in format EMP001'
            },
            name: {
                minLength: 3,
                maxLength: 100,
                pattern: /^[a-zA-Z\s.'-]+$/,
                message: 'Name must contain only letters and spaces'
            },
            bankAccount: {
                minLength: 9,
                maxLength: 18,
                pattern: /^\d+$/,
                message: 'Bank account must contain only numbers'
            },
            ifsc: {
                pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                message: 'Invalid IFSC code format'
            },
            uan: {
                length: 12,
                pattern: /^\d{12}$/,
                message: 'UAN must be 12 digits'
            },
            salary: {
                min: 1,
                max: 10000000,
                message: 'Salary must be between 1 and 10,000,000'
            }
        }
    },

    // API endpoints (if backend is implemented)
    api: {
        baseUrl: '/api/v1',
        endpoints: {
            employees: '/employees',
            attendance: '/attendance',
            payroll: '/payroll',
            reports: '/reports',
            export: '/export'
        },
        timeout: 30000,
        retries: 3
    },

    // Feature flags
    features: {
        enableDoctorsModule: true,
        enableAttendanceTracking: true,
        enableBiometricIntegration: false,
        enableEmailNotifications: false,
        enableSMSNotifications: false,
        enableMultiLanguage: false,
        enableAdvancedReports: true,
        enableDataEncryption: false,
        enableAuditLog: true
    },

    // Departments (default list)
    departments: [
        'Administration',
        'Nursing',
        'Medical',
        'Laboratory',
        'Radiology',
        'Pharmacy',
        'Housekeeping',
        'Security',
        'IT',
        'HR',
        'Accounts',
        'Marketing'
    ]
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
} else {
    window.AppConfig = AppConfig;
}