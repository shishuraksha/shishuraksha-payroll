/**
 * Data Persistence Module
 * Handles localStorage operations, data integrity, and auto-save functionality
 */

// Data Persistence Functions
function saveToLocalStorage() {
    try {
        const data = {
            employees: employees,
            attendance: attendance,
            payrollData: payrollData,
            activities: activities,
            darkMode: darkMode,
            departments: departments,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('payrollSystemData', JSON.stringify(data));
        addActivity('Data auto-saved');
        return true;
    } catch (error) {
        console.error('Failed to save data to localStorage:', error);
        if (error.name === 'QuotaExceededError') {
            Swal.fire({
                icon: 'error',
                title: 'Storage Full',
                text: 'Unable to save data - browser storage is full. Please clear some data or export your records.',
                showConfirmButton: true
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Save Error',
                text: 'Unable to save your data. Please try again or export your records as backup.',
                timer: 3000,
                showConfirmButton: false
            });
        }
        return false;
    }
}

function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('payrollSystemData');
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data && typeof data === 'object') {
                employees = Array.isArray(data.employees) ? data.employees : [];
                attendance = (data.attendance && typeof data.attendance === 'object') ? data.attendance : {};
                payrollData = Array.isArray(data.payrollData) ? data.payrollData : [];
                activities = Array.isArray(data.activities) ? data.activities : [];
                darkMode = data.darkMode || false;
                departments = Array.isArray(data.departments) ? data.departments : ['IT', 'HR', 'Accounts', 'Sales', 'Marketing'];
                if (darkMode) {
                    document.body.classList.add('dark-mode');
                    const darkModeIcon = document.getElementById('darkModeIcon');
                    if (darkModeIcon) {
                        darkModeIcon.className = 'fas fa-sun';
                    }
                }
                console.log('Data loaded successfully from localStorage');
                return true;
            }
        }
    } catch (error) {
        console.error('Failed to load data from localStorage:', error);
        Swal.fire({
            icon: 'warning',
            title: 'Data Load Error',
            text: 'There was an issue loading your saved data. Starting with default settings.',
            timer: 3000,
            showConfirmButton: false
        });
    }
    return false;
}

// Auto-save every 30 seconds
function setupAutoSave() {
    setInterval(() => {
        saveToLocalStorage();
    }, 30000);
}

function saveMonthlyPayroll() {
    if (payrollData.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No Payroll Data',
            text: 'Please process payroll first before saving.'
        });
        return;
    }
    
    const monthlyData = {
        month: currentMonth,
        employees: employees.slice(),
        attendance: JSON.parse(JSON.stringify(attendance[currentMonth])),
        payroll: payrollData.slice(),
        savedAt: new Date().toISOString()
    };
    
    // Save to localStorage with month key
    localStorage.setItem(`payroll_${currentMonth}`, JSON.stringify(monthlyData));
    
    Swal.fire({
        icon: 'success',
        title: 'Month Saved!',
        text: `Payroll data for ${currentMonth} has been saved.`,
        timer: 2000,
        showConfirmButton: false
    });
    
    addActivity(`Saved payroll data for ${currentMonth}`);
}

function loadMonthlyPayroll(month) {
    try {
        const savedMonthData = localStorage.getItem(`payroll_${month}`);
        if (savedMonthData) {
            const data = JSON.parse(savedMonthData);
            return data;
        }
    } catch (error) {
        console.error('Failed to load monthly payroll data:', error);
    }
    return null;
}

// Data Integrity Check
function checkDataIntegrity() {
    let issues = [];
    
    // Check for duplicate employee IDs
    const ids = employees.map(emp => emp.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
        issues.push(`Duplicate employee IDs found: ${duplicates.join(', ')}`);
    }
    
    // Check for missing attendance data
    const activeEmployees = employees.filter(emp => emp.status === 'Active');
    activeEmployees.forEach(emp => {
        if (!attendance[currentMonth]?.[emp.id]) {
            issues.push(`Missing attendance data for ${emp.name}`);
        }
    });
    
    // Check for invalid salary data
    employees.forEach(emp => {
        if (emp.basicSalary <= 0) {
            issues.push(`Invalid salary for ${emp.name}`);
        }
    });
    
    // Check for missing required fields
    employees.forEach(emp => {
        if (!emp.name || !emp.id || !emp.department) {
            issues.push(`Missing required fields for employee ${emp.id || 'Unknown'}`);
        }
    });
    
    if (issues.length > 0) {
        console.warn('Data integrity issues found:', issues);
        addActivity('Data integrity check: ' + issues.length + ' issues found');
        
        // Show warning to user if issues are critical
        if (issues.length > 5) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Issues Detected',
                text: `Found ${issues.length} data integrity issues. Check console for details.`,
                timer: 3000,
                showConfirmButton: false
            });
        }
    } else {
        console.log('Data integrity check passed');
    }
    
    return issues;
}

// Data Export Functions
function exportAllData() {
    const exportData = {
        employees: employees,
        attendance: attendance,
        payrollData: payrollData,
        activities: activities,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addActivity('Exported complete data backup');
    
    Swal.fire({
        icon: 'success',
        title: 'Data Exported!',
        text: 'Complete backup file has been downloaded.',
        timer: 2000,
        showConfirmButton: false
    });
}

function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate imported data structure
            if (!importedData.employees || !Array.isArray(importedData.employees)) {
                throw new Error('Invalid data format: missing or invalid employees array');
            }
            
            // Confirm import
            Swal.fire({
                title: 'Import Data?',
                text: `This will replace all current data with ${importedData.employees.length} employees. This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, import!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Import data
                    employees = importedData.employees || [];
                    attendance = importedData.attendance || {};
                    payrollData = importedData.payrollData || [];
                    activities = importedData.activities || [];
                    
                    // Update displays
                    displayEmployees();
                    displayAttendance();
                    displayPayroll();
                    updateDashboard();
                    
                    // Save imported data
                    saveToLocalStorage();
                    
                    addActivity('Imported data from backup file');
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Data Imported!',
                        text: 'All data has been successfully imported.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            });
            
        } catch (error) {
            console.error('Failed to import data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Import Failed',
                text: 'Invalid file format or corrupted data. Please check the file and try again.',
                showConfirmButton: true
            });
        }
    };
    reader.readAsText(file);
}

// Data Cleanup Functions
function clearAllData() {
    Swal.fire({
        title: 'Clear All Data?',
        text: 'This will permanently delete all employees, attendance, and payroll data. This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, clear all!',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444'
    }).then((result) => {
        if (result.isConfirmed) {
            // Clear all data
            employees = [];
            attendance = {};
            payrollData = [];
            activities = [];
            
            // Clear localStorage
            localStorage.removeItem('payrollSystemData');
            
            // Reset displays
            displayEmployees();
            displayAttendance();
            displayPayroll();
            updateDashboard();
            
            Swal.fire({
                icon: 'success',
                title: 'Data Cleared!',
                text: 'All data has been permanently deleted.',
                timer: 2000,
                showConfirmButton: false
            });
            
            addActivity('Cleared all system data');
        }
    });
}

function clearOldData() {
    const monthsToKeep = 6; // Keep last 6 months
    const currentDate = new Date();
    const cutoffDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthsToKeep, 1);
    
    let deletedMonths = 0;
    Object.keys(attendance).forEach(month => {
        const monthDate = new Date(month + '-01');
        if (monthDate < cutoffDate) {
            delete attendance[month];
            localStorage.removeItem(`payroll_${month}`);
            deletedMonths++;
        }
    });
    
    if (deletedMonths > 0) {
        saveToLocalStorage();
        addActivity(`Cleaned old data: removed ${deletedMonths} months`);
        
        Swal.fire({
            icon: 'info',
            title: 'Old Data Cleaned',
            text: `Removed data for ${deletedMonths} old months to free up space.`,
            timer: 2000,
            showConfirmButton: false
        });
    }
}

// Storage Usage Monitoring
function getStorageUsage() {
    try {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage.getItem(key).length;
            }
        }
        
        // Convert to KB/MB
        const sizeKB = (totalSize / 1024).toFixed(2);
        const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        
        return {
            bytes: totalSize,
            kb: sizeKB,
            mb: sizeMB,
            percentage: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(1) // Assume 5MB limit
        };
    } catch (error) {
        console.error('Error calculating storage usage:', error);
        return null;
    }
}

function showStorageInfo() {
    const usage = getStorageUsage();
    if (usage) {
        Swal.fire({
            title: 'Storage Usage',
            html: `
                <div class="text-left">
                    <p><strong>Total Size:</strong> ${usage.kb} KB (${usage.mb} MB)</p>
                    <p><strong>Estimated Usage:</strong> ${usage.percentage}% of browser limit</p>
                    <hr class="my-2">
                    <p class="text-sm text-gray-600">
                        Tip: Export data regularly and clear old records to maintain performance.
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Clear Old Data',
            cancelButtonText: 'Close'
        }).then((result) => {
            if (result.isConfirmed) {
                clearOldData();
            }
        });
    }
}

// Make functions available globally for browser use
window.saveToLocalStorage = saveToLocalStorage;
window.loadFromLocalStorage = loadFromLocalStorage;
window.setupAutoSave = setupAutoSave;
window.saveMonthlyPayroll = saveMonthlyPayroll;
window.loadMonthlyPayroll = loadMonthlyPayroll;
window.checkDataIntegrity = checkDataIntegrity;
window.exportAllData = exportAllData;
window.importData = importData;
window.clearAllData = clearAllData;
window.clearOldData = clearOldData;
window.getStorageUsage = getStorageUsage;
window.showStorageInfo = showStorageInfo;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveToLocalStorage,
        loadFromLocalStorage,
        setupAutoSave,
        saveMonthlyPayroll,
        loadMonthlyPayroll,
        checkDataIntegrity,
        exportAllData,
        importData,
        clearAllData,
        clearOldData,
        getStorageUsage,
        showStorageInfo
    };
}