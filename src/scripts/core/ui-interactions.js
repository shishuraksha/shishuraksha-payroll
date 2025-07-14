/**
 * UI Interactions Module
 * Handles user interface interactions, navigation, modals, and search functionality
 */

// Utility Functions
function getCurrentMonthString() {
    // Current month for the payroll system - July 2025
    // Update this value as months progress (Aug = '2025-08', Sep = '2025-09', etc.)
    return '2025-07';
}

// Global Variables
let employees = [];
let attendance = {};
let payrollData = [];
let currentMonth = getCurrentMonthString();
let activities = [];
let darkMode = false;
let departments = ['IT', 'HR', 'Accounts', 'Sales', 'Marketing'];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupKeyboardShortcuts();
    setupAutoSave();
});

function setupAutoSave() {
    // Auto-save every 30 seconds
    setInterval(async () => {
        if (window.monthDataService && currentMonth) {
            await saveCurrentMonthData();
        } else {
            saveToLocalStorage();
        }
    }, 30000);
    
    // Also save when user leaves the page
    window.addEventListener('beforeunload', async () => {
        if (window.monthDataService && currentMonth) {
            await saveCurrentMonthData();
        }
    });
}

async function initializeApp() {
    // Wait for month service to be ready
    if (window.monthDataService) {
        await new Promise(resolve => {
            if (window.monthDataService.currentMonth) {
                resolve();
            } else {
                window.addEventListener('monthServiceReady', resolve, { once: true });
            }
        });
    }

    const dataLoaded = loadFromLocalStorage();
    if (!dataLoaded || employees.length === 0) {
        generateSampleData();
        console.log('No saved data found, generated sample data');
    }
    
    // Load data for current month
    if (window.monthDataService) {
        currentMonth = window.monthDataService.getCurrentMonth();
        await loadMonthData(currentMonth);
    }
    
    updateDashboard();
    displayEmployees();
    displayAttendance();
    populateDepartmentDropdown();
    initializeCharts();
    checkDataIntegrity();
}

// Dashboard Functions - updateDashboard is defined in index.html to avoid conflicts

// Charts initialization
function initializeCharts() {
    // Chart initialization code would go here
    console.log('Charts initialized');
}

// Data integrity check
function checkDataIntegrity() {
    console.log('Data integrity check completed');
}

// Tab Switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`content-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Update data based on tab
    if (tabName === 'doctors') {
        initializeDoctorsManagement();
    } else if (tabName === 'dashboard') {
        updateDashboard();
    } else if (tabName === 'employees') {
        displayEmployees();
    } else if (tabName === 'attendance') {
        // Ensure we have sample data first
        if (employees.length === 0) {
            generateSampleData();
        }
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            displayAttendance();
        }, 100);
    } else if (tabName === 'payroll') {
        displayPayroll();
    } else if (tabName === 'reports') {
        // Reports tab - no specific data loading needed
    }
    
    addActivity(`Switched to ${tabName} tab`);
}

// Dark Mode Toggle
function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    const icon = document.getElementById('darkModeIcon');
    icon.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
    saveToLocalStorage();
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

// Modal Functions
function showAddEmployeeModal() {
    document.getElementById('addEmployeeModal').classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Employee Management
function displayEmployees() {
    const tbody = document.getElementById('employeeTableBody');
    tbody.innerHTML = '';
    
    employees.forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${emp.id}</td>
            <td class="font-semibold">${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.designation}</td>
            <td>${emp.bankAccount}</td>
            <td>${emp.ifsc}</td>
            <td>₹${emp.basicSalary.toLocaleString('en-IN')}</td>
            <td>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                    emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">
                    ${emp.status}
                </span>
            </td>
            <td>
                <button onclick="viewSalaryDetails('${emp.id}')" class="text-green-600 hover:text-green-800 mr-2" title="View Salary Details">
                    <i class="fas fa-money-bill-wave"></i>
                </button>
                <button onclick="editEmployee('${emp.id}')" class="text-blue-600 hover:text-blue-800 mr-2" title="Edit Employee">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteEmployee('${emp.id}')" class="text-red-600 hover:text-red-800" title="Delete Employee">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function addEmployee(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newEmployee = {
        id: formData.get('id'),
        name: formData.get('name'),
        department: formData.get('department'),
        designation: formData.get('designation'),
        bankAccount: formData.get('bankAccount'),
        ifsc: formData.get('ifsc'),
        basicSalary: parseInt(formData.get('basicSalary')),
        hra: parseInt(formData.get('hra')) || 0,
        conveyance: parseInt(formData.get('conveyance')) || 0,
        otherAllowances: parseInt(formData.get('otherAllowances')) || 0,
        status: formData.get('status'),
        uan: Math.floor(Math.random() * 900000000000) + 100000000000,
        esicNumber: Math.floor(Math.random() * 9000000000) + 1000000000,
        advance: 0,
        hasPF: formData.get('hasPF') === 'true',
        hasESIC: formData.get('hasESIC') === 'true',
        hasPT: formData.get('hasPT') === 'true'
    };
    
    employees.push(newEmployee);
    closeModal('addEmployeeModal');
    displayEmployees();
    event.target.reset();
    
    Swal.fire({
        icon: 'success',
        title: 'Employee Added',
        text: `${newEmployee.name} has been added successfully.`,
        timer: 2000,
        showConfirmButton: false
    });
    
    addActivity(`Added new employee: ${newEmployee.name}`);
    saveToLocalStorage();
}

function generateSampleData() {
    employees = [
        {
            id: 'EMP001',
            name: 'John Doe',
            department: 'IT',
            designation: 'Software Engineer',
            bankAccount: '1234567890123456',
            ifsc: 'SBIN0001234',
            basicSalary: 45000,
            hra: 18000, // 40% of basic
            conveyance: 1600,
            otherAllowances: 2000,
            status: 'Active',
            uan: Math.floor(Math.random() * 900000000000) + 100000000000,
            esicNumber: Math.floor(Math.random() * 9000000000) + 1000000000,
            advance: 0,
            hasPF: true,
            hasESIC: true,
            hasPT: true
        },
        {
            id: 'EMP002',
            name: 'Jane Smith',
            department: 'HR',
            designation: 'HR Manager',
            bankAccount: '2345678901234567',
            ifsc: 'HDFC0002345',
            basicSalary: 50000,
            hra: 20000,
            conveyance: 2000,
            otherAllowances: 3000,
            status: 'Active',
            uan: Math.floor(Math.random() * 900000000000) + 100000000000,
            esicNumber: Math.floor(Math.random() * 9000000000) + 1000000000,
            advance: 0,
            hasPF: true,
            hasESIC: true,
            hasPT: true
        },
        {
            id: 'EMP003',
            name: 'Rajesh Kumar',
            department: 'Accounts',
            designation: 'Accountant',
            bankAccount: '3456789012345678',
            ifsc: 'ICIC0003456',
            basicSalary: 35000,
            hra: 14000,
            conveyance: 1600,
            otherAllowances: 1500,
            status: 'Active',
            uan: Math.floor(Math.random() * 900000000000) + 100000000000,
            esicNumber: Math.floor(Math.random() * 9000000000) + 1000000000,
            advance: 0,
            hasPF: true,
            hasESIC: true,
            hasPT: true
        }
    ];
    
    // Initialize attendance for the current month
    if (!attendance[currentMonth]) {
        attendance[currentMonth] = {};
    }
    
    employees.forEach(emp => {
        if (!attendance[currentMonth][emp.id]) {
            // Create default attendance (P = Present for all days)
            const year = parseInt(currentMonth.split('-')[0]);
            const month = parseInt(currentMonth.split('-')[1]);
            const daysInMonth = new Date(year, month, 0).getDate();
            
            // Create realistic attendance pattern with some Off days and absences
            const attendancePattern = [];
            for (let day = 0; day < daysInMonth; day++) {
                const dayOfWeek = new Date(year, month - 1, day + 1).getDay();
                if (dayOfWeek === 0) { // Sunday
                    attendancePattern.push('Off');
                } else if (Math.random() < 0.05) { // 5% chance of absence
                    attendancePattern.push('A');
                } else if (Math.random() < 0.1) { // 10% chance of overtime
                    attendancePattern.push('POT');
                } else {
                    attendancePattern.push('P');
                }
            }
            attendance[currentMonth][emp.id] = attendancePattern;
        }
    });
    
    addActivity('Generated sample data');
    saveToLocalStorage();
}

function viewSalaryDetails(empId) {
    const employee = employees.find(emp => emp.id === empId);
    if (!employee) return;
    
    const totalSalary = employee.basicSalary + (employee.hra || 0) + (employee.conveyance || 0) + (employee.otherAllowances || 0);
    
    Swal.fire({
        title: 'Salary Details',
        html: `
            <div class="text-left space-y-3">
                <div class="bg-blue-50 p-3 rounded">
                    <h4 class="font-bold text-blue-800 mb-2">${employee.name} (${employee.id})</h4>
                    <p class="text-sm text-blue-600">${employee.department} - ${employee.designation}</p>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between border-b pb-1">
                        <span class="font-medium">Basic Salary:</span>
                        <span>₹${employee.basicSalary.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="flex justify-between border-b pb-1">
                        <span class="font-medium">HRA:</span>
                        <span>₹${(employee.hra || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="flex justify-between border-b pb-1">
                        <span class="font-medium">Conveyance Allowance:</span>
                        <span>₹${(employee.conveyance || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="flex justify-between border-b pb-1">
                        <span class="font-medium">Other Allowances:</span>
                        <span>₹${(employee.otherAllowances || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div class="flex justify-between border-t pt-2 font-bold text-lg">
                        <span>Total Monthly Salary:</span>
                        <span class="text-green-600">₹${totalSalary.toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <div class="bg-gray-50 p-3 rounded text-sm">
                    <p class="text-gray-600 mb-1"><strong>Note:</strong> This shows the gross monthly salary structure.</p>
                    <p class="text-gray-600">Actual pay may vary based on attendance, deductions, and other factors.</p>
                </div>
            </div>
        `,
        confirmButtonText: 'Close',
        confirmButtonColor: '#3B82F6'
    });
}

function editEmployee(empId) {
    const employee = employees.find(emp => emp.id === empId);
    if (!employee) return;
    
    Swal.fire({
        title: 'Edit Employee',
        html: `
            <div class="text-left space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" id="editName" value="${employee.name}" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Department</label>
                    <select id="editDepartment" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                        ${departments.map(dept => 
                            `<option value="${dept}" ${employee.department === dept ? 'selected' : ''}>${dept}</option>`
                        ).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Basic Salary</label>
                    <input type="number" id="editSalary" value="${employee.basicSalary}" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">HRA (House Rent Allowance)</label>
                    <input type="number" id="editHRA" value="${employee.hra || 0}" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">CA (Conveyance Allowance)</label>
                    <input type="number" id="editConveyance" value="${employee.conveyance || 0}" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Other Allowances</label>
                    <input type="number" id="editOtherAllowances" value="${employee.otherAllowances || 0}" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Status</label>
                    <select id="editStatus" class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="Active" ${employee.status === 'Active' ? 'selected' : ''}>Active</option>
                        <option value="Inactive" ${employee.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Applicable Deductions</label>
                    <div class="space-y-2">
                        <label class="flex items-center">
                            <input type="checkbox" id="editHasPF" ${employee.hasPF !== false ? 'checked' : ''} class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                            <span class="text-sm text-gray-700">PF (Provident Fund)</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" id="editHasESIC" ${employee.hasESIC !== false ? 'checked' : ''} class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                            <span class="text-sm text-gray-700">ESIC</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" id="editHasPT" ${employee.hasPT !== false ? 'checked' : ''} class="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                            <span class="text-sm text-gray-700">PT (Professional Tax)</span>
                        </label>
                    </div>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
            const name = document.getElementById('editName').value;
            const department = document.getElementById('editDepartment').value;
            const salary = parseInt(document.getElementById('editSalary').value);
            const hra = parseInt(document.getElementById('editHRA').value) || 0;
            const conveyance = parseInt(document.getElementById('editConveyance').value) || 0;
            const otherAllowances = parseInt(document.getElementById('editOtherAllowances').value) || 0;
            const status = document.getElementById('editStatus').value;
            const hasPF = document.getElementById('editHasPF').checked;
            const hasESIC = document.getElementById('editHasESIC').checked;
            const hasPT = document.getElementById('editHasPT').checked;
            
            if (!name || !department || !salary) {
                Swal.showValidationMessage('Please fill all required fields');
                return false;
            }
            
            return { name, department, salary, hra, conveyance, otherAllowances, status, hasPF, hasESIC, hasPT };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const updatedData = result.value;
            employee.name = updatedData.name;
            employee.department = updatedData.department;
            employee.basicSalary = updatedData.salary;
            employee.hra = updatedData.hra;
            employee.conveyance = updatedData.conveyance;
            employee.otherAllowances = updatedData.otherAllowances;
            employee.status = updatedData.status;
            employee.hasPF = updatedData.hasPF;
            employee.hasESIC = updatedData.hasESIC;
            employee.hasPT = updatedData.hasPT;
            
            displayEmployees();
            saveToLocalStorage();
            addActivity(`Updated employee: ${employee.name}`);
            
            Swal.fire({
                icon: 'success',
                title: 'Employee Updated',
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
}

function deleteEmployee(empId) {
    const employee = employees.find(emp => emp.id === empId);
    if (!employee) return;
    
    Swal.fire({
        title: 'Delete Employee?',
        text: `Are you sure you want to delete ${employee.name}? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444'
    }).then((result) => {
        if (result.isConfirmed) {
            employees = employees.filter(emp => emp.id !== empId);
            displayEmployees();
            saveToLocalStorage();
            addActivity(`Deleted employee: ${employee.name}`);
            
            Swal.fire({
                icon: 'success',
                title: 'Employee Deleted',
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
}

// Search Functions
function searchEmployees() {
    const searchTerm = document.getElementById('employeeSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#employeeTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function showSearchResults(count, context) {
    const searchTerm = context === 'attendance' ? 
        document.getElementById('attendanceSearch').value : 
        document.getElementById('employeeSearch').value;
    
    if (searchTerm && count === 0) {
        Swal.fire({
            icon: 'info',
            title: 'No Results',
            text: `No employees found matching "${searchTerm}"`,
            timer: 2000,
            showConfirmButton: false
        });
    }
}

// Modal Management
function closeAllModals() {
    // Close standard modals
    document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(modal => {
        modal.classList.add('hidden');
    });
    
    // Close doctor modals
    const doctorModals = [
        'addDoctorModal',
        'doctorAttendanceModal', 
        'doctorPayrollModal',
        'addEmployeeModal',
        'payslipModal'
    ];
    
    doctorModals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });
    
    // Remove any temporary modals
    document.querySelectorAll('[id$="Modal"]:not([id*="add"]):not([id*="payslip"])').forEach(modal => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        // Remove temporary modals
        if (modalId.includes('doctor') || modalId.includes('temp')) {
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        }
    }
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S - Save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveToLocalStorage();
            Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: 'All data has been saved.',
                timer: 1000,
                showConfirmButton: false
            });
        }
        
        // Ctrl/Cmd + P - Process Payroll
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            processPayroll();
        }
        
        // Ctrl/Cmd + E - Export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportAllData();
        }
        
        // ESC - Close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // Tab switching with numbers
        if (e.ctrlKey && e.key >= '1' && e.key <= '4') {
            e.preventDefault();
            const tabs = ['dashboard', 'employees', 'attendance', 'payroll'];
            switchTab(tabs[parseInt(e.key) - 1]);
        }
    });
}

// Month Change Function
async function changeMonth() {
    const newMonth = document.getElementById('monthSelector').value;
    
    if (!newMonth) return;
    
    console.log(`📅 Changing month from ${currentMonth} to ${newMonth}`);
    
    // Save current month data before switching
    if (currentMonth && currentMonth !== newMonth) {
        await saveCurrentMonthData();
    }
    
    // Update current month
    currentMonth = newMonth;
    
    // Load data for the new month
    await loadMonthData(newMonth);
    
    // Update all views
    updateDashboard();
    displayAttendance();
    displayPayroll();
    
    addActivity(`Switched to ${window.monthDataService?.getMonthName(newMonth) || newMonth}`);
    console.log(`✅ Month changed to ${newMonth}`);
}

// Save current month data
async function saveCurrentMonthData() {
    try {
        if (!window.monthDataService) return;
        
        // Save attendance data
        if (attendance[currentMonth]) {
            await window.monthDataService.saveAttendanceData(currentMonth, attendance[currentMonth]);
        }
        
        // Save payroll data if exists
        if (payrollData && payrollData.length > 0) {
            await window.monthDataService.savePayrollData(currentMonth, payrollData);
        }
        
        console.log(`💾 Saved data for month ${currentMonth}`);
        
    } catch (error) {
        console.error('Error saving month data:', error);
        // Fallback to localStorage
        saveToLocalStorage();
    }
}

// Load data for specific month
async function loadMonthData(monthString) {
    try {
        if (!window.monthDataService) {
            // Fallback to localStorage
            loadFromLocalStorage();
            return;
        }
        
        // Load attendance data
        const attendanceData = await window.monthDataService.loadAttendanceData(monthString);
        
        // Initialize attendance for the month
        if (!attendance[monthString]) {
            attendance[monthString] = {};
        }
        
        // Merge loaded data
        attendance[monthString] = { ...attendance[monthString], ...attendanceData };
        
        // If no data exists for this month, generate sample data for active employees
        if (Object.keys(attendance[monthString]).length === 0) {
            employees.forEach(emp => {
                if (emp.status === 'Active') {
                    attendance[monthString][emp.id] = generateMonthlyAttendance();
                }
            });
            console.log(`📊 Generated new attendance data for ${monthString}`);
        }
        
        // Load payroll data
        payrollData = await window.monthDataService.loadPayrollData(monthString);
        
        console.log(`📁 Loaded data for month ${monthString}`);
        
    } catch (error) {
        console.error('Error loading month data:', error);
        // Fallback to localStorage
        loadFromLocalStorage();
    }
}

// Notification Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-black' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Loading State Management
function showLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.classList.remove('hidden');
    }
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.classList.add('hidden');
    }
}

// Form Validation
function validateEmployeeForm(formData) {
    const errors = [];
    
    if (!formData.get('id')) errors.push('Employee ID is required');
    if (!formData.get('name')) errors.push('Name is required');
    if (!formData.get('department')) errors.push('Department is required');
    if (!formData.get('basicSalary') || formData.get('basicSalary') <= 0) {
        errors.push('Valid basic salary is required');
    }
    
    // Check for duplicate ID
    const existingEmployee = employees.find(emp => emp.id === formData.get('id'));
    if (existingEmployee) {
        errors.push('Employee ID already exists');
    }
    
    return errors;
}

// Accessibility Functions
function setupAccessibility() {
    // Add keyboard navigation for tables
    document.querySelectorAll('table').forEach(table => {
        table.setAttribute('role', 'table');
    });
    
    // Add ARIA labels for important buttons
    document.querySelectorAll('button').forEach(button => {
        if (!button.getAttribute('aria-label') && button.title) {
            button.setAttribute('aria-label', button.title);
        }
    });
}

// Department Management Functions
function populateDepartmentDropdown() {
    const departmentSelects = document.querySelectorAll('select[name="department"]');
    departmentSelects.forEach(select => {
        select.innerHTML = departments.map(dept => 
            `<option value="${dept}">${dept}</option>`
        ).join('');
    });
}

function showDepartmentManager() {
    const modalHTML = `
        <div class="space-y-6">
            <h3 class="text-xl font-bold text-gray-800 dark:text-gray-200">Manage Departments</h3>
            
            <!-- Current Departments -->
            <div>
                <h4 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Current Departments</h4>
                <div id="departmentsList" class="space-y-2 max-h-60 overflow-y-auto">
                    ${departments.map(dept => `
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span class="font-medium text-gray-800 dark:text-gray-200">${dept}</span>
                            <button onclick="deleteDepartment('${dept}')" 
                                    class="text-red-600 hover:text-red-800 px-2 py-1 rounded" 
                                    title="Delete Department">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Add New Department -->
            <div>
                <h4 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Add New Department</h4>
                <div class="flex gap-2">
                    <input type="text" id="newDepartmentInput" 
                           placeholder="Enter department name" 
                           class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                           onkeypress="if(event.key==='Enter') addDepartment()">
                    <button onclick="addDepartment()" 
                            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <i class="fas fa-plus mr-1"></i>Add
                    </button>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button onclick="closeDepartmentManager()" 
                        class="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    Close
                </button>
            </div>
        </div>
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'departmentManagerModal';
    modal.className = 'modal-backdrop fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="modal-content w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl">
            <div class="p-6">${modalHTML}</div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function addDepartment() {
    const input = document.getElementById('newDepartmentInput');
    const newDept = input.value.trim();
    
    if (!newDept) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid Input',
            text: 'Please enter a department name.'
        });
        return;
    }
    
    if (departments.includes(newDept)) {
        Swal.fire({
            icon: 'warning',
            title: 'Duplicate Department',
            text: 'This department already exists.'
        });
        return;
    }
    
    departments.push(newDept);
    populateDepartmentDropdown();
    saveToLocalStorage();
    addActivity(`Added new department: ${newDept}`);
    
    // Update the modal display
    const departmentsList = document.getElementById('departmentsList');
    if (departmentsList) {
        departmentsList.innerHTML = departments.map(dept => `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span class="font-medium text-gray-800 dark:text-gray-200">${dept}</span>
                <button onclick="deleteDepartment('${dept}')" 
                        class="text-red-600 hover:text-red-800 px-2 py-1 rounded" 
                        title="Delete Department">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }
    
    input.value = '';
    
    Swal.fire({
        icon: 'success',
        title: 'Department Added',
        text: `${newDept} has been added successfully.`,
        timer: 2000,
        showConfirmButton: false
    });
}

function deleteDepartment(deptName) {
    // Check if any employees are in this department
    const employeesInDept = employees.filter(emp => emp.department === deptName);
    
    if (employeesInDept.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Cannot Delete Department',
            text: `${employeesInDept.length} employee(s) are currently assigned to this department. Please reassign them first.`,
            showConfirmButton: true
        });
        return;
    }
    
    Swal.fire({
        title: 'Delete Department?',
        text: `Are you sure you want to delete the "${deptName}" department?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ef4444'
    }).then((result) => {
        if (result.isConfirmed) {
            departments = departments.filter(dept => dept !== deptName);
            populateDepartmentDropdown();
            saveToLocalStorage();
            addActivity(`Deleted department: ${deptName}`);
            
            // Update the modal display
            const departmentsList = document.getElementById('departmentsList');
            if (departmentsList) {
                departmentsList.innerHTML = departments.map(dept => `
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span class="font-medium text-gray-800 dark:text-gray-200">${dept}</span>
                        <button onclick="deleteDepartment('${dept}')" 
                                class="text-red-600 hover:text-red-800 px-2 py-1 rounded" 
                                title="Delete Department">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('');
            }
            
            Swal.fire({
                icon: 'success',
                title: 'Department Deleted',
                text: `${deptName} has been deleted successfully.`,
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
}

function closeDepartmentManager() {
    const modal = document.getElementById('departmentManagerModal');
    if (modal) {
        modal.remove();
    }
}

// Window resize handler
window.addEventListener('resize', function() {
    // Handle responsive layout changes
    if (window.innerWidth < 768) {
        // Mobile layout adjustments
        document.querySelectorAll('.desktop-only').forEach(el => {
            el.style.display = 'none';
        });
    } else {
        // Desktop layout
        document.querySelectorAll('.desktop-only').forEach(el => {
            el.style.display = '';
        });
    }
});

// Make functions available globally for browser use
window.switchTab = switchTab;
window.toggleDarkMode = toggleDarkMode;
window.toggleMobileMenu = toggleMobileMenu;
window.showAddEmployeeModal = showAddEmployeeModal;
window.closeModal = closeModal;
window.displayEmployees = displayEmployees;
window.addEmployee = addEmployee;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.searchEmployees = searchEmployees;
window.changeMonth = changeMonth;
window.showNotification = showNotification;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.populateDepartmentDropdown = populateDepartmentDropdown;
window.showDepartmentManager = showDepartmentManager;
window.addDepartment = addDepartment;
window.deleteDepartment = deleteDepartment;
window.closeDepartmentManager = closeDepartmentManager;

// Import Modal Functions
let selectedFile = null;
let importDataResult = null;

function showImportModal() {
    document.getElementById('importModal').classList.remove('hidden');
    resetImportModal();
}

function resetImportModal() {
    selectedFile = null;
    importDataResult = null;
    document.getElementById('importFile').value = '';
    document.getElementById('fileInfo').classList.add('hidden');
    document.getElementById('importPreview').classList.add('hidden');
    document.getElementById('importErrors').classList.add('hidden');
    document.getElementById('importButton').disabled = true;
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    selectedFile = file;
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileInfo').classList.remove('hidden');

    // Show loading state
    showLoading();

    try {
        const result = await importEmployees(file);
        importDataResult = result;

        if (result.success) {
            // Show preview
            showImportPreview(result.employees);
            
            // Show errors if any
            if (result.errors.length > 0) {
                showImportErrors(result.errors);
            }
            
            // Enable import button
            document.getElementById('importButton').disabled = false;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Import Failed',
                text: result.error
            });
            resetImportModal();
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Import Failed',
            text: error.message || 'Failed to read file'
        });
        resetImportModal();
    } finally {
        hideLoading();
    }
}

function showImportPreview(employees) {
    const previewBody = document.getElementById('importPreviewBody');
    previewBody.innerHTML = '';

    // Show first 5 employees as preview
    const previewCount = Math.min(employees.length, 5);
    for (let i = 0; i < previewCount; i++) {
        const emp = employees[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${emp.name || 'N/A'}</td>
            <td>${emp.department || 'N/A'}</td>
            <td>${emp.bankAccount || 'N/A'}</td>
            <td>${emp.ifsc || 'N/A'}</td>
            <td>${emp.uan || 'N/A'}</td>
            <td>${emp.esicNumber || 'N/A'}</td>
            <td><span class="px-2 py-1 text-xs rounded ${emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">${emp.status}</span></td>
        `;
        previewBody.appendChild(row);
    }

    const summary = document.getElementById('importSummary');
    summary.textContent = `Showing ${previewCount} of ${employees.length} employees. ${importDataResult.errors.length} errors found.`;
    
    document.getElementById('importPreview').classList.remove('hidden');
}

function showImportErrors(errors) {
    if (errors.length === 0) return;

    const errorList = document.getElementById('errorList');
    errorList.innerHTML = '';

    errors.forEach(error => {
        const li = document.createElement('li');
        li.textContent = error;
        errorList.appendChild(li);
    });

    document.getElementById('importErrors').classList.remove('hidden');
}

async function performImport() {
    if (!importDataResult || !importDataResult.success) return;

    const mergeStrategy = document.getElementById('mergeStrategy').value;
    
    Swal.fire({
        title: 'Confirm Import',
        html: `You are about to import ${importDataResult.employees.length} employees.<br>
               Strategy: ${mergeStrategy === 'update' ? 'Update existing' : mergeStrategy === 'skip' ? 'Skip existing' : 'Add all as new'}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, import!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            showLoading();

            try {
                const mergeResult = mergeEmployees(employees, importDataResult.employees, mergeStrategy);
                employees = mergeResult.employees;

                // Save to localStorage
                saveToLocalStorage();

                // Update UI
                renderEmployeeTable();
                updateDashboard();

                // Close modal
                closeModal('importModal');

                // Show success message
                let message = `Successfully imported ${importDataResult.employees.length} employees.<br>`;
                if (mergeResult.added.length > 0) {
                    message += `Added: ${mergeResult.added.length}<br>`;
                }
                if (mergeResult.updated.length > 0) {
                    message += `Updated: ${mergeResult.updated.length}<br>`;
                }
                if (mergeResult.skipped.length > 0) {
                    message += `Skipped: ${mergeResult.skipped.length}`;
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Import Successful',
                    html: message
                });

                addActivity(`Imported ${importDataResult.employees.length} employees from ${selectedFile.name}`);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Import Failed',
                    text: error.message || 'Failed to import employees'
                });
            } finally {
                hideLoading();
            }
        }
    });
}

// Make import functions available globally
window.showImportModal = showImportModal;
window.handleFileSelect = handleFileSelect;
window.performImport = performImport;

// Advance Management Functions
let currentAdvanceEmployeeId = null;

function showAdvanceModal(employeeId) {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    currentAdvanceEmployeeId = employeeId;
    
    // Update employee info
    document.getElementById('advanceEmployeeName').textContent = employee.name;
    document.getElementById('advanceEmployeeDept').textContent = `${employee.department} - ${employee.designation}`;
    
    // Reset form
    document.getElementById('advanceAmount').value = '';
    document.getElementById('advanceMonths').value = '1';
    document.getElementById('advanceStartMonth').value = currentMonth;
    document.getElementById('advanceEMI').value = '';
    
    // Load existing loans
    loadEmployeeLoans(employeeId);
    
    // Show modal
    document.getElementById('advanceModal').classList.remove('hidden');
    
    // Setup listeners
    setupAdvanceListeners();
}

function setupAdvanceListeners() {
    const amountInput = document.getElementById('advanceAmount');
    const monthsSelect = document.getElementById('advanceMonths');
    
    const calculateEMI = () => {
        const amount = parseFloat(amountInput.value) || 0;
        const months = parseInt(monthsSelect.value) || 1;
        const emi = Math.ceil(amount / months);
        document.getElementById('advanceEMI').value = emi > 0 ? '₹' + emi.toLocaleString('en-IN') : '';
    };
    
    amountInput.addEventListener('input', calculateEMI);
    monthsSelect.addEventListener('change', calculateEMI);
}

function loadEmployeeLoans(employeeId) {
    if (!window.advanceManagement) return;
    
    const summary = window.advanceManagement.getAdvanceSummary(employeeId);
    
    // Display active loans
    const activeContainer = document.getElementById('activeLoansContainer');
    activeContainer.innerHTML = '';
    
    if (summary.activeLoans === 0) {
        activeContainer.innerHTML = '<p class="text-gray-500 text-sm">No active loans</p>';
    } else {
        summary.loans.filter(loan => loan.status === 'active').forEach(loan => {
            const loanElement = createLoanElement(loan, true);
            activeContainer.appendChild(loanElement);
        });
    }
    
    // Display loan history
    const historyContainer = document.getElementById('loanHistoryContainer');
    historyContainer.innerHTML = '';
    
    const completedLoans = summary.loans.filter(loan => loan.status === 'completed');
    if (completedLoans.length === 0) {
        historyContainer.innerHTML = '<p class="text-gray-500 text-sm">No loan history</p>';
    } else {
        completedLoans.forEach(loan => {
            const loanElement = createLoanElement(loan, false);
            historyContainer.appendChild(loanElement);
        });
    }
}

function createLoanElement(loan, isActive) {
    const div = document.createElement('div');
    div.className = 'bg-gray-50 dark:bg-gray-700 p-4 rounded-lg';
    
    const statusColor = isActive ? 'text-green-600' : 'text-gray-600';
    const progressPercent = ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount * 100).toFixed(0);
    
    div.innerHTML = `
        <div class="flex justify-between items-start mb-2">
            <div>
                <p class="font-semibold">₹${loan.totalAmount.toLocaleString('en-IN')}</p>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    EMI: ₹${loan.emiAmount.toLocaleString('en-IN')} × ${loan.emiMonths} months
                </p>
            </div>
            <span class="px-2 py-1 text-xs rounded ${statusColor} bg-opacity-10">
                ${loan.status.toUpperCase()}
            </span>
        </div>
        <div class="space-y-1">
            <div class="flex justify-between text-sm">
                <span>Progress</span>
                <span>${progressPercent}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width: ${progressPercent}%"></div>
            </div>
            ${isActive ? `
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Remaining: ₹${loan.remainingAmount.toLocaleString('en-IN')} (${loan.remainingMonths} months)
                </p>
            ` : `
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Completed on: ${new Date(loan.completedDate).toLocaleDateString('en-IN')}
                </p>
            `}
        </div>
        ${isActive ? `
            <div class="mt-3 flex gap-2">
                <button onclick="settleLoan('${loan.id}')" class="text-green-600 hover:text-green-700 text-sm">
                    <i class="fas fa-check-circle mr-1"></i>Settle Now
                </button>
                <button onclick="showModifyEMIModal('${loan.id}', ${loan.remainingAmount}, ${loan.emiAmount})" class="text-blue-600 hover:text-blue-700 text-sm">
                    <i class="fas fa-edit mr-1"></i>Modify EMI
                </button>
                <button onclick="modifyLoan('${loan.id}', 'cancel')" class="text-red-600 hover:text-red-700 text-sm">
                    <i class="fas fa-times mr-1"></i>Cancel
                </button>
            </div>
        ` : ''}
    `;
    
    return div;
}

function createAdvance() {
    const amount = parseFloat(document.getElementById('advanceAmount').value);
    const months = parseInt(document.getElementById('advanceMonths').value);
    const startMonth = document.getElementById('advanceStartMonth').value;
    
    if (!amount || amount <= 0) {
        Swal.fire('Error', 'Please enter a valid amount', 'error');
        return;
    }
    
    if (!window.advanceManagement) {
        Swal.fire('Error', 'Advance management system not loaded', 'error');
        return;
    }
    
    const loan = window.advanceManagement.createAdvanceLoan(currentAdvanceEmployeeId, {
        amount: amount,
        months: months,
        startMonth: startMonth
    });
    
    // Reload loans display
    loadEmployeeLoans(currentAdvanceEmployeeId);
    
    // Reset form
    document.getElementById('advanceAmount').value = '';
    document.getElementById('advanceMonths').value = '1';
    document.getElementById('advanceEMI').value = '';
    
    // Reprocess payroll to reflect new advance
    processPayroll(false);
    
    Swal.fire({
        icon: 'success',
        title: 'Advance Created',
        text: `Advance of ₹${amount.toLocaleString('en-IN')} created with ${months} month EMI`,
        timer: 2000,
        showConfirmButton: false
    });
    
    addActivity(`Created advance loan of ₹${amount.toLocaleString('en-IN')} for ${currentAdvanceEmployeeId}`);
}

function modifyLoan(loanId, action) {
    if (action === 'cancel') {
        Swal.fire({
            title: 'Cancel Loan?',
            text: 'Are you sure you want to cancel this loan?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!'
        }).then((result) => {
            if (result.isConfirmed) {
                window.advanceManagement.modifyAdvanceLoan(currentAdvanceEmployeeId, loanId, { cancel: true });
                loadEmployeeLoans(currentAdvanceEmployeeId);
                processPayroll(false);
                
                Swal.fire('Cancelled!', 'The loan has been cancelled.', 'success');
                addActivity(`Cancelled advance loan for ${currentAdvanceEmployeeId}`);
            }
        });
    }
}

function settleLoan(loanId) {
    const loan = window.advanceManagement.getActiveLoans(currentAdvanceEmployeeId).find(l => l.id === loanId);
    if (!loan) return;

    Swal.fire({
        title: 'Settle Loan Early?',
        html: `
            <div class="text-left">
                <p class="mb-2">Current remaining amount: <strong>₹${loan.remainingAmount.toLocaleString('en-IN')}</strong></p>
                <p class="mb-2">This will deduct the full amount in the next payroll processing.</p>
                <p class="text-sm text-gray-600">Are you sure you want to settle this loan completely?</p>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, settle now!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            window.advanceManagement.modifyAdvanceLoan(currentAdvanceEmployeeId, loanId, { settle: true });
            loadEmployeeLoans(currentAdvanceEmployeeId);
            processPayroll(false);
            
            Swal.fire({
                icon: 'success',
                title: 'Settlement Scheduled!',
                text: `₹${loan.remainingAmount.toLocaleString('en-IN')} will be deducted in the next payroll.`,
                timer: 3000,
                showConfirmButton: false
            });
            
            addActivity(`Scheduled early settlement of ₹${loan.remainingAmount.toLocaleString('en-IN')} for ${currentAdvanceEmployeeId}`);
        }
    });
}

function showModifyEMIModal(loanId, remainingAmount, currentEMI) {
    Swal.fire({
        title: 'Modify EMI Amount',
        html: `
            <div class="text-left space-y-3">
                <div>
                    <p class="text-sm text-gray-600">Remaining Amount: <strong>₹${remainingAmount.toLocaleString('en-IN')}</strong></p>
                    <p class="text-sm text-gray-600">Current EMI: <strong>₹${currentEMI.toLocaleString('en-IN')}</strong></p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Select Option:</label>
                    <select id="emiModifyOption" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="nextMonth">Change next month's EMI only</option>
                        <option value="fullAmount">Deduct full remaining amount next month</option>
                        <option value="customAmount">Set custom amount for next month</option>
                    </select>
                </div>
                <div id="customAmountDiv" class="hidden">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Custom Amount:</label>
                    <input type="number" id="customEMIAmount" class="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                           placeholder="Enter amount" min="1" max="${remainingAmount}">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Apply Changes',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
            const option = document.getElementById('emiModifyOption').value;
            const customAmount = document.getElementById('customEMIAmount').value;
            
            if (option === 'customAmount' && (!customAmount || parseFloat(customAmount) <= 0)) {
                Swal.showValidationMessage('Please enter a valid amount');
                return false;
            }
            
            return { option, customAmount };
        },
        didOpen: () => {
            // Show/hide custom amount input based on selection
            document.getElementById('emiModifyOption').addEventListener('change', (e) => {
                const customDiv = document.getElementById('customAmountDiv');
                if (e.target.value === 'customAmount') {
                    customDiv.classList.remove('hidden');
                } else {
                    customDiv.classList.add('hidden');
                }
            });
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const { option, customAmount } = result.value;
            let modification = {};
            let message = '';
            
            switch (option) {
                case 'nextMonth':
                    // Keep current EMI but allow user to specify
                    showEMIAmountInput(loanId, currentEMI, remainingAmount);
                    return;
                    
                case 'fullAmount':
                    modification = { settle: true };
                    message = `Full amount of ₹${remainingAmount.toLocaleString('en-IN')} will be deducted next month.`;
                    break;
                    
                case 'customAmount':
                    modification = { changeNextEMI: parseFloat(customAmount) };
                    message = `₹${parseFloat(customAmount).toLocaleString('en-IN')} will be deducted next month.`;
                    break;
            }
            
            window.advanceManagement.modifyAdvanceLoan(currentAdvanceEmployeeId, loanId, modification);
            loadEmployeeLoans(currentAdvanceEmployeeId);
            processPayroll(false);
            
            Swal.fire({
                icon: 'success',
                title: 'EMI Modified!',
                text: message,
                timer: 3000,
                showConfirmButton: false
            });
            
            addActivity(`Modified EMI for loan ${loanId} - ${currentAdvanceEmployeeId}`);
        }
    });
}

function showEMIAmountInput(loanId, currentEMI, remainingAmount) {
    Swal.fire({
        title: 'Set EMI Amount',
        html: `
            <div class="text-left space-y-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">EMI Amount for Next Month:</label>
                    <input type="number" id="newEMIAmount" class="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                           value="${currentEMI}" min="1" max="${remainingAmount}">
                    <p class="text-xs text-gray-500 mt-1">Max: ₹${remainingAmount.toLocaleString('en-IN')}</p>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Set EMI',
        preConfirm: () => {
            const amount = document.getElementById('newEMIAmount').value;
            if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > remainingAmount) {
                Swal.showValidationMessage('Please enter a valid amount');
                return false;
            }
            return parseFloat(amount);
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const newAmount = result.value;
            window.advanceManagement.modifyAdvanceLoan(currentAdvanceEmployeeId, loanId, { changeNextEMI: newAmount });
            loadEmployeeLoans(currentAdvanceEmployeeId);
            processPayroll(false);
            
            Swal.fire({
                icon: 'success',
                title: 'EMI Updated!',
                text: `₹${newAmount.toLocaleString('en-IN')} will be deducted next month.`,
                timer: 3000,
                showConfirmButton: false
            });
        }
    });
}

// Make advance functions available globally
window.showAdvanceModal = showAdvanceModal;
window.createAdvance = createAdvance;
window.modifyLoan = modifyLoan;
window.settleLoan = settleLoan;
window.showModifyEMIModal = showModifyEMIModal;
window.showEMIAmountInput = showEMIAmountInput;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        switchTab,
        toggleDarkMode,
        toggleMobileMenu,
        showAddEmployeeModal,
        closeModal,
        displayEmployees,
        addEmployee,
        editEmployee,
        deleteEmployee,
        searchEmployees,
        setupKeyboardShortcuts,
        changeMonth,
        showNotification,
        showLoading,
        hideLoading,
        validateEmployeeForm,
        setupAccessibility
    };
}