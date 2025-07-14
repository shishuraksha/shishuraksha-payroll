/**
 * PDF Generator for Shishuraksha Children's Hospital Payroll Reports
 * Handles data processing, formatting, and PDF generation
 */

// Global variables
let currentEmployeeData = [];
let currentDepartmentData = {};
let currentAttendanceData = {};
let currentComplianceData = {};
let currentReportMetadata = {};

// Initialize the PDF generator
document.addEventListener('DOMContentLoaded', function() {
    initializePDFGenerator();
});

function initializePDFGenerator() {
    // Load sample data
    loadSampleData();
    
    // Populate the template with data
    populateTemplate();
    
    // Initialize charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }
    
    console.log('PDF Generator initialized successfully');
}

function loadSampleData() {
    // Use the sample data from pdf-data.js
    if (typeof sampleEmployeeData !== 'undefined') {
        currentEmployeeData = sampleEmployeeData;
        currentDepartmentData = departmentSummary;
        currentAttendanceData = attendanceSummary;
        currentComplianceData = complianceData;
        currentReportMetadata = reportMetadata;
    } else {
        console.error('Sample data not loaded. Please ensure pdf-data.js is included.');
        // Fallback to minimal data
        createFallbackData();
    }
}

function createFallbackData() {
    currentEmployeeData = [
        {
            empId: "EMP001",
            name: "Dr. Rajesh Kumar",
            department: "Medical Staff",
            designation: "Senior Pediatrician",
            basicSalary: 95000,
            hra: 38000,
            conveyance: 2500,
            otherAllowances: 5000,
            grossSalary: 140500,
            pf: 11400,
            esic: 1053,
            pt: 200,
            advance: 0,
            netPay: 127847,
            bankAccount: "1234567890123456",
            ifscCode: "HDFC0001234",
            bankName: "HDFC Bank",
            workingDays: 30,
            presentDays: 30,
            overtimeHours: 8
        }
    ];
    
    currentReportMetadata = {
        reportPeriod: "June 2025",
        generationDate: new Date().toLocaleDateString('en-IN'),
        reportId: "SCH-PR-2025-06-001",
        totalEmployees: 1,
        totalGrossPayroll: 140500,
        totalNetPayroll: 127847,
        averageSalary: 140500
    };
}

function populateTemplate() {
    try {
        // Update header information
        updateHeaderInformation();
        
        // Update KPI cards
        updateKPICards();
        
        // Populate employee payroll table
        populateEmployeeTable();
        
        // Update department analysis
        updateDepartmentAnalysis();
        
        // Update attendance summary
        updateAttendanceSummary();
        
        // Update bank transfer details
        updateBankTransferDetails();
        
        // Update compliance report
        updateComplianceReport();
        
        // Update footer
        updateFooter();
        
        console.log('Template populated successfully');
    } catch (error) {
        console.error('Error populating template:', error);
    }
}

function updateHeaderInformation() {
    // Update report metadata in header
    const reportPeriodEl = document.getElementById('reportPeriod');
    const generationDateEl = document.getElementById('generationDate');
    const reportIdEl = document.getElementById('reportId');
    
    if (reportPeriodEl) reportPeriodEl.textContent = currentReportMetadata.reportPeriod;
    if (generationDateEl) generationDateEl.textContent = currentReportMetadata.generationDate;
    if (reportIdEl) reportIdEl.textContent = currentReportMetadata.reportId;
}

function updateKPICards() {
    // Update KPI values
    const totalEmployeesEl = document.getElementById('totalEmployees');
    const grossPayrollEl = document.getElementById('grossPayroll');
    const netPayrollEl = document.getElementById('netPayroll');
    const averageSalaryEl = document.getElementById('averageSalary');
    
    if (totalEmployeesEl) {
        totalEmployeesEl.textContent = currentReportMetadata.totalEmployees.toString();
    }
    
    if (grossPayrollEl) {
        grossPayrollEl.textContent = formatCurrency(currentReportMetadata.totalGrossPayroll);
    }
    
    if (netPayrollEl) {
        netPayrollEl.textContent = formatCurrency(currentReportMetadata.totalNetPayroll);
    }
    
    if (averageSalaryEl) {
        averageSalaryEl.textContent = formatCurrency(currentReportMetadata.averageSalary);
    }
}

function populateEmployeeTable() {
    const tableBody = document.getElementById('employeePayrollData');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    currentEmployeeData.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.empId}</td>
            <td class="font-semibold">${employee.name}</td>
            <td>${employee.department}</td>
            <td>${employee.designation}</td>
            <td class="text-right">${formatCurrency(employee.basicSalary)}</td>
            <td class="text-right">${formatCurrency(employee.hra + employee.conveyance + employee.otherAllowances)}</td>
            <td class="text-right font-semibold">${formatCurrency(employee.grossSalary)}</td>
            <td class="text-right">${formatCurrency(employee.pf)}</td>
            <td class="text-right">${formatCurrency(employee.esic)}</td>
            <td class="text-right">${formatCurrency(employee.pt)}</td>
            <td class="text-right">${formatCurrency(employee.advance)}</td>
            <td class="text-right font-semibold text-success">${formatCurrency(employee.netPay)}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateDepartmentAnalysis() {
    // Update department cards with calculated data
    const departmentCards = document.querySelectorAll('.department-card');
    const departments = Object.keys(currentDepartmentData);
    
    departmentCards.forEach((card, index) => {
        if (index < departments.length) {
            const deptName = departments[index];
            const deptData = currentDepartmentData[deptName];
            
            const h3 = card.querySelector('h3');
            const statValues = card.querySelectorAll('.stat-value');
            
            if (h3) h3.textContent = deptName;
            
            if (statValues.length >= 3) {
                statValues[0].textContent = deptData.totalEmployees.toString();
                statValues[1].textContent = formatCurrency(deptData.totalGross);
                statValues[2].textContent = formatCurrency(deptData.avgSalary);
            }
        }
    });
}

function updateAttendanceSummary() {
    const attendanceTableBody = document.getElementById('attendanceData');
    if (!attendanceTableBody) return;
    
    attendanceTableBody.innerHTML = '';
    
    Object.keys(currentAttendanceData.departmentWiseAttendance).forEach(dept => {
        const deptAttendance = currentAttendanceData.departmentWiseAttendance[dept];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="font-semibold">${dept}</td>
            <td class="text-center">${deptAttendance.totalEmployees}</td>
            <td class="text-center">${deptAttendance.totalPresentDays}</td>
            <td class="text-center">${deptAttendance.totalAbsentDays}</td>
            <td class="text-center">${deptAttendance.overtimeHours}</td>
            <td class="text-center">
                <span class="status-success">${deptAttendance.attendanceRate}%</span>
            </td>
        `;
        
        attendanceTableBody.appendChild(row);
    });
}

function updateBankTransferDetails() {
    const bankTableBody = document.getElementById('bankTransferData');
    if (!bankTableBody) return;
    
    bankTableBody.innerHTML = '';
    
    currentEmployeeData.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.empId}</td>
            <td class="font-semibold">${employee.name}</td>
            <td>${maskBankAccount(employee.bankAccount)}</td>
            <td>${employee.ifscCode}</td>
            <td>${employee.bankName}</td>
            <td class="text-right font-semibold">${formatCurrency(employee.netPay)}</td>
            <td class="text-center">
                <span class="status-success">Ready</span>
            </td>
        `;
        bankTableBody.appendChild(row);
    });
}

function updateComplianceReport() {
    // Update compliance summary in the template
    if (currentComplianceData.pf) {
        updateComplianceCard('pf', currentComplianceData.pf);
    }
    
    if (currentComplianceData.esic) {
        updateComplianceCard('esic', currentComplianceData.esic);
    }
    
    if (currentComplianceData.pt) {
        updateComplianceCard('pt', currentComplianceData.pt);
    }
}

function updateComplianceCard(type, data) {
    const card = document.querySelector(`.compliance-card.${type}`);
    if (!card) return;
    
    const details = card.querySelector('.compliance-details');
    if (!details) return;
    
    let html = '';
    
    if (type === 'pf') {
        html = `
            <p><strong>Total PF Deduction:</strong> ${formatCurrency(data.totalEmployeeContribution)}</p>
            <p><strong>Employer Contribution:</strong> ${formatCurrency(data.totalEmployerContribution)}</p>
            <p><strong>Employees Covered:</strong> ${data.employeesCovered}/${currentReportMetadata.totalEmployees}</p>
            <p><strong>Status:</strong> <span class="status-success">${data.status}</span></p>
        `;
    } else if (type === 'esic') {
        html = `
            <p><strong>Employee Contribution:</strong> ${formatCurrency(data.totalEmployeeContribution)}</p>
            <p><strong>Employer Contribution:</strong> ${formatCurrency(data.totalEmployerContribution)}</p>
            <p><strong>Employees Covered:</strong> ${data.employeesCovered}/${currentReportMetadata.totalEmployees}</p>
            <p><strong>Status:</strong> <span class="status-success">${data.status}</span></p>
        `;
    } else if (type === 'pt') {
        html = `
            <p><strong>Total PT Deduction:</strong> ${formatCurrency(data.totalDeduction)}</p>
            <p><strong>Employees Liable:</strong> ${data.employeesLiable}/${currentReportMetadata.totalEmployees}</p>
            <p><strong>Exempted:</strong> ${data.exempted} (Below threshold)</p>
            <p><strong>Status:</strong> <span class="status-success">${data.status}</span></p>
        `;
    }
    
    details.innerHTML = html;
}

function updateFooter() {
    const footerDateEl = document.getElementById('footerDate');
    if (footerDateEl) {
        footerDateEl.textContent = `Generated: ${currentReportMetadata.generationDate}`;
    }
}

function initializeCharts() {
    // Initialize department distribution chart
    const chartCanvas = document.getElementById('departmentChart');
    if (!chartCanvas) return;
    
    const ctx = chartCanvas.getContext('2d');
    
    const departmentNames = Object.keys(currentDepartmentData);
    const departmentCounts = departmentNames.map(dept => currentDepartmentData[dept].totalEmployees);
    const colors = ['#1e40af', '#059669', '#d97706', '#dc2626'];
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: departmentNames,
            datasets: [{
                data: departmentCounts,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        fontSize: 10,
                        padding: 10
                    }
                }
            }
        }
    });
}

// Utility Functions

function formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return "₹0";
    }
    
    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Format with Indian number system
    return `₹${numAmount.toLocaleString('en-IN')}`;
}

function maskBankAccount(accountNumber) {
    if (!accountNumber) return 'N/A';
    
    const str = accountNumber.toString();
    if (str.length <= 4) return str;
    
    const start = str.substring(0, 4);
    const end = str.substring(str.length - 4);
    const masked = 'X'.repeat(str.length - 8);
    
    return `${start}${masked}${end}`;
}

function validateData(data) {
    const errors = [];
    
    if (!Array.isArray(data)) {
        errors.push('Data must be an array of employee records');
        return errors;
    }
    
    if (data.length === 0) {
        errors.push('No employee data provided');
        return errors;
    }
    
    data.forEach((employee, index) => {
        const requiredFields = ['empId', 'name', 'department', 'basicSalary', 'grossSalary', 'netPay'];
        
        requiredFields.forEach(field => {
            if (!employee[field]) {
                errors.push(`Employee ${index + 1}: Missing required field '${field}'`);
            }
        });
        
        // Validate salary calculations
        if (employee.grossSalary && employee.netPay && employee.pf && employee.esic && employee.pt) {
            const calculatedNet = employee.grossSalary - employee.pf - employee.esic - employee.pt - (employee.advance || 0);
            if (Math.abs(calculatedNet - employee.netPay) > 1) {
                errors.push(`Employee ${index + 1}: Net pay calculation mismatch`);
            }
        }
    });
    
    return errors;
}

function processEmployeeData(rawData) {
    if (!rawData || !Array.isArray(rawData)) {
        console.error('Invalid employee data provided');
        return [];
    }
    
    return rawData.map(employee => {
        // Ensure all required fields exist with defaults
        return {
            empId: employee.empId || 'N/A',
            name: employee.name || 'Unknown',
            department: employee.department || 'Unassigned',
            designation: employee.designation || 'Staff',
            basicSalary: parseFloat(employee.basicSalary) || 0,
            hra: parseFloat(employee.hra) || 0,
            conveyance: parseFloat(employee.conveyance) || 0,
            otherAllowances: parseFloat(employee.otherAllowances) || 0,
            grossSalary: parseFloat(employee.grossSalary) || 0,
            pf: parseFloat(employee.pf) || 0,
            esic: parseFloat(employee.esic) || 0,
            pt: parseFloat(employee.pt) || 0,
            advance: parseFloat(employee.advance) || 0,
            netPay: parseFloat(employee.netPay) || 0,
            bankAccount: employee.bankAccount || 'N/A',
            ifscCode: employee.ifscCode || 'N/A',
            bankName: employee.bankName || 'N/A',
            workingDays: parseInt(employee.workingDays) || 30,
            presentDays: parseInt(employee.presentDays) || 0,
            overtimeHours: parseInt(employee.overtimeHours) || 0
        };
    });
}

function calculateDepartmentSummary(employeeData) {
    const departments = {};
    
    employeeData.forEach(employee => {
        const dept = employee.department;
        
        if (!departments[dept]) {
            departments[dept] = {
                totalEmployees: 0,
                totalGross: 0,
                totalNet: 0,
                avgSalary: 0,
                presentDays: 0,
                overtimeHours: 0
            };
        }
        
        departments[dept].totalEmployees++;
        departments[dept].totalGross += employee.grossSalary;
        departments[dept].totalNet += employee.netPay;
        departments[dept].presentDays += employee.presentDays;
        departments[dept].overtimeHours += employee.overtimeHours;
    });
    
    // Calculate averages
    Object.keys(departments).forEach(dept => {
        departments[dept].avgSalary = Math.floor(departments[dept].totalGross / departments[dept].totalEmployees);
    });
    
    return departments;
}

function generatePDFReport() {
    // Use browser's print functionality for PDF generation
    window.print();
}

function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('Excel export functionality not available. Please include the XLSX library.');
        return;
    }
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Employee data sheet
    const employeeWS = XLSX.utils.json_to_sheet(currentEmployeeData);
    XLSX.utils.book_append_sheet(wb, employeeWS, 'Employee Payroll');
    
    // Department summary sheet
    const deptSummary = Object.keys(currentDepartmentData).map(dept => ({
        Department: dept,
        'Total Employees': currentDepartmentData[dept].totalEmployees,
        'Total Gross': currentDepartmentData[dept].totalGross,
        'Total Net': currentDepartmentData[dept].totalNet,
        'Average Salary': currentDepartmentData[dept].avgSalary
    }));
    
    const deptWS = XLSX.utils.json_to_sheet(deptSummary);
    XLSX.utils.book_append_sheet(wb, deptWS, 'Department Summary');
    
    // Save file
    const fileName = `Payroll_Report_${currentReportMetadata.reportPeriod.replace(' ', '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// Data Import Functions

function importFromJSON(jsonData) {
    try {
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        const validationErrors = validateData(data);
        
        if (validationErrors.length > 0) {
            console.error('Data validation errors:', validationErrors);
            alert('Data validation failed:\n' + validationErrors.join('\n'));
            return false;
        }
        
        currentEmployeeData = processEmployeeData(data);
        currentDepartmentData = calculateDepartmentSummary(currentEmployeeData);
        
        // Recalculate metadata
        updateReportMetadata();
        
        // Refresh template
        populateTemplate();
        
        console.log('Data imported successfully');
        return true;
    } catch (error) {
        console.error('Error importing JSON data:', error);
        alert('Error importing data: ' + error.message);
        return false;
    }
}

function importFromCSV(csvText) {
    try {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj = {};
            
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });
            
            return obj;
        });
        
        return importFromJSON(data);
    } catch (error) {
        console.error('Error importing CSV data:', error);
        alert('Error importing CSV data: ' + error.message);
        return false;
    }
}

function updateReportMetadata() {
    currentReportMetadata = {
        reportPeriod: currentReportMetadata.reportPeriod || "June 2025",
        generationDate: new Date().toLocaleDateString('en-IN'),
        reportId: `SCH-PR-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
        totalEmployees: currentEmployeeData.length,
        totalGrossPayroll: currentEmployeeData.reduce((sum, emp) => sum + emp.grossSalary, 0),
        totalNetPayroll: currentEmployeeData.reduce((sum, emp) => sum + emp.netPay, 0),
        totalDeductions: currentEmployeeData.reduce((sum, emp) => sum + emp.pf + emp.esic + emp.pt, 0),
        totalAdvances: currentEmployeeData.reduce((sum, emp) => sum + emp.advance, 0),
        averageSalary: 0
    };
    
    currentReportMetadata.averageSalary = Math.floor(currentReportMetadata.totalGrossPayroll / currentReportMetadata.totalEmployees);
}

// Export functions for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializePDFGenerator,
        loadSampleData,
        populateTemplate,
        generatePDFReport,
        exportToExcel,
        importFromJSON,
        importFromCSV,
        formatCurrency,
        validateData,
        processEmployeeData
    };
}