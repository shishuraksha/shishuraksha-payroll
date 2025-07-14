/**
 * PDF Reports and Export Module
 * Handles all report generation including payslips, bank statements, and comprehensive reports
 */

// Helper function to ensure payroll data is available
function ensurePayrollData() {
    console.log('ensurePayrollData called');
    console.log('Current payrollData length:', payrollData ? payrollData.length : 'undefined');
    console.log('Current employees length:', employees ? employees.length : 'undefined');
    
    if (!payrollData || payrollData.length === 0) {
        console.log('No payroll data, attempting to process...');
        // Try to process payroll automatically
        if (employees && employees.length > 0 && typeof processPayroll === 'function') {
            console.log('Calling processPayroll...');
            try {
                processPayroll(false);
                console.log('processPayroll completed. New payrollData length:', payrollData ? payrollData.length : 'undefined');
                if (payrollData && payrollData.length > 0) {
                    console.log('Payroll processing successful');
                    return true;
                } else {
                    console.log('Payroll processing failed - no data generated');
                }
            } catch (error) {
                console.error('Error calling processPayroll:', error);
            }
        } else {
            console.log('Cannot process payroll:', {
                employees: employees ? employees.length : 'undefined',
                processPayroll: typeof processPayroll
            });
        }
        return false;
    }
    console.log('Payroll data already exists');
    return true;
}

// Report Generation Functions

function showPayslipSelector() {
    console.log('showPayslipSelector called');
    console.log('payrollData:', payrollData);
    console.log('employees:', employees);
    console.log('currentMonth:', currentMonth);
    
    // Check if we have either employee payroll data or doctor payroll data
    const currentMonthKey = currentMonth || '2025-06';
    const hasDoctorData = (typeof doctorPayroll !== 'undefined') && doctorPayroll && doctorPayroll[currentMonthKey] && Object.keys(doctorPayroll[currentMonthKey]).length > 0;
    const hasEmployeeData = payrollData && payrollData.length > 0;
    
    console.log('hasDoctorData:', hasDoctorData);
    console.log('hasEmployeeData:', hasEmployeeData);
    
    // If no payroll data, try to process it automatically
    if (!hasEmployeeData && !hasDoctorData) {
        // Try to process payroll automatically
        if (employees && employees.length > 0 && typeof processPayroll === 'function') {
            processPayroll(false);
            // Check again after processing
            const hasEmployeeDataAfterProcess = payrollData && payrollData.length > 0;
            if (!hasEmployeeDataAfterProcess) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Payroll Data',
                    text: 'Unable to process payroll. Please go to Payroll tab and click "Process Payroll" first.',
                    showCancelButton: true,
                    confirmButtonText: 'Go to Payroll Tab',
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed && typeof switchTab === 'function') {
                        switchTab('payroll');
                    }
                });
                return;
            }
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'No Employee Data',
                text: 'No employee data found. Please add employees first.',
                showCancelButton: true,
                confirmButtonText: 'Go to Employees Tab',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed && typeof switchTab === 'function') {
                    switchTab('employees');
                }
            });
            return;
        }
    }
    
    // If we only have doctor data but no employee data, calculate doctor payroll first
    if (!hasEmployeeData && hasDoctorData) {
        // Make sure doctor payroll is up to date
        if (typeof calculateDoctorPayroll === 'function') {
            calculateDoctorPayroll();
        }
    }
    
    const modal = document.getElementById('payslipModal');
    const employeeList = document.getElementById('payslipEmployeeList');
    
    if (!modal || !employeeList) {
        console.error('Modal elements not found:', { modal: !!modal, employeeList: !!employeeList });
        Swal.fire({
            icon: 'error',
            title: 'Interface Error',
            text: 'Payslip modal elements not found. Please refresh the page.'
        });
        return;
    }
    
    // Populate employee list
    employeeList.innerHTML = '';
    
    // Add regular employees
    console.log('Adding employees to list, count:', payrollData.length);
    payrollData.forEach(emp => {
        const div = document.createElement('div');
        div.className = 'flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg';
        div.innerHTML = `
            <input type="checkbox" id="emp-${emp.id}" value="${emp.id}" data-type="employee" checked 
                   class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            <label for="emp-${emp.id}" class="flex-1 cursor-pointer">
                <div class="font-medium text-gray-900 dark:text-gray-100">${emp.name}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">${emp.id} - ${emp.department} - Rs. ${emp.netPay.toLocaleString('en-IN')}</div>
            </label>
        `;
        employeeList.appendChild(div);
    });
    
    // Add doctors if we have doctor payroll data
    if (typeof doctorPayroll !== 'undefined' && doctorPayroll && doctorPayroll[currentMonthKey]) {
        Object.values(doctorPayroll[currentMonthKey]).forEach(doctorData => {
            const div = document.createElement('div');
            div.className = 'flex items-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg';
            const specializationName = (typeof SPECIALIZATIONS !== 'undefined' && SPECIALIZATIONS[doctorData.specialization]) 
                ? SPECIALIZATIONS[doctorData.specialization].name 
                : doctorData.specialization || 'General';
            div.innerHTML = `
                <input type="checkbox" id="doc-${doctorData.doctorId}" value="${doctorData.doctorId}" data-type="doctor" checked 
                       class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                <label for="doc-${doctorData.doctorId}" class="flex-1 cursor-pointer">
                    <div class="font-medium text-gray-900 dark:text-gray-100">Dr. ${doctorData.doctorName}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">${doctorData.doctorId} - ${specializationName} - Rs. ${doctorData.netPay.toLocaleString('en-IN')}</div>
                </label>
            `;
            employeeList.appendChild(div);
        });
    }
    
    console.log('Showing modal with', employeeList.children.length, 'items');
    modal.classList.remove('hidden');
}

function filterPayslipEmployees() {
    const searchTerm = document.getElementById('payslipSearch').value.toLowerCase();
    const employeeItems = document.querySelectorAll('#payslipEmployeeList > div');
    
    employeeItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function selectAllPayslips(select) {
    const checkboxes = document.querySelectorAll('#payslipEmployeeList input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = select;
    });
}

function generateSelectedPayslips() {
    const selectedCheckboxes = document.querySelectorAll('#payslipEmployeeList input[type="checkbox"]:checked');
    
    if (selectedCheckboxes.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No Selection',
            text: 'Please select at least one employee or doctor to generate payslips.'
        });
        return;
    }
    
    let employeeCount = 0;
    let doctorCount = 0;
    
    // Process each selected checkbox
    Array.from(selectedCheckboxes).forEach((cb, index) => {
        const id = cb.value;
        const type = cb.getAttribute('data-type');
        
        setTimeout(() => {
            if (type === 'employee') {
                // Find employee and generate employee payslip
                const employee = payrollData.find(emp => emp.id === id);
                if (employee) {
                    generatePayslip(employee);
                    employeeCount++;
                }
            } else if (type === 'doctor') {
                // Generate doctor payslip
                generateDoctorPayslip(id);
                doctorCount++;
            }
        }, index * 500); // Delay to prevent browser freezing
    });
    
    closeModal('payslipModal');
    
    const totalCount = employeeCount + doctorCount;
    let message = `Generated ${totalCount} payslips`;
    if (employeeCount > 0 && doctorCount > 0) {
        message += ` (${employeeCount} employees, ${doctorCount} doctors)`;
    } else if (employeeCount > 0) {
        message += ` for employees`;
    } else if (doctorCount > 0) {
        message += ` for doctors`;
    }
    
    Swal.fire({
        icon: 'success',
        title: 'Payslips Generated!',
        text: message,
        timer: 2000,
        showConfirmButton: false
    });
    
    addActivity(message);
}

function generatePayslip(employee) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Hospital logo and header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SHISHURAKSHA CHILDREN\'S HOSPITAL', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Payslip for ' + new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), 105, 30, { align: 'center' });

    // Employee details
    let yPos = 60;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Employee Name: ' + employee.name, 20, yPos);
    doc.text('Employee ID: ' + employee.id, 20, yPos + 10);
    doc.text('Department: ' + employee.department, 20, yPos + 20);
    doc.text('Working Days: ' + employee.workingDays, 120, yPos);
    doc.text('Generated: ' + new Date().toLocaleDateString('en-IN'), 120, yPos + 10);
    
    // Earnings and Deductions table
    yPos += 40;
    doc.autoTable({
        head: [['Earnings', 'Amount (Rs.)', 'Deductions', 'Amount (Rs.)']],
        body: [
            ['Basic Salary', formatCurrency(employee.basic), 'PF', employee.hasPF !== false ? formatCurrency(employee.pf) : 'N/A'],
            ['HRA', formatCurrency(employee.hra), 'ESIC', employee.hasESIC !== false ? formatCurrency(employee.esic) : 'N/A'],
            ['Conveyance', formatCurrency(employee.conveyance), 'Professional Tax', employee.hasPT !== false ? formatCurrency(employee.pt) : 'N/A'],
            ['Other Allowances', formatCurrency(employee.otherAllowances), 'Advance', formatCurrency(employee.advance)],
            ['Overtime', formatCurrency(employee.overtimeAmount), '', ''],
            ['', '', '', ''],
            ['Gross Salary', formatCurrency(employee.grossSalary), 'Total Deductions', formatCurrency(employee.totalDeductions)]
        ],
        startY: yPos,
        theme: 'striped',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
    });

    // Net salary
    yPos = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Net Salary: ' + formatCurrency(employee.netPay), 20, yPos);
    
    // Amount in words
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Amount in words: ' + numberToWords(Math.floor(employee.netPay)) + ' Rupees Only', 20, yPos + 15);
    
    // Footer
    doc.setFontSize(8);
    doc.text('This is a computer-generated payslip and does not require a signature.', 20, yPos + 30);
    
    const monthYear = currentMonth.replace('-', '_');
    doc.save(`Payslip_${employee.name.replace(/\s+/g, '_')}_${monthYear}.pdf`);
}

function generateBankStatement() {
    console.log('generateBankStatement called');
    console.log('payrollData:', payrollData);
    
    if (!ensurePayrollData()) {
        Swal.fire({
            icon: 'warning',
            title: 'No Payroll Data',
            text: 'Unable to process payroll. Please go to Payroll tab and click "Process Payroll" first.',
            showCancelButton: true,
            confirmButtonText: 'Go to Payroll Tab',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                switchTab('payroll');
            }
        });
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Professional styling
    const primaryColor = [41, 128, 185];
    const secondaryColor = [52, 73, 94];
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('BANK PAYMENT STATEMENT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Shishuraksha Children\'s Hospital', 105, 30, { align: 'center' });
    
    // Document info
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(11);
    const monthName = new Date(currentMonth + '-01').toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    doc.text(`Pay Period: ${monthName}`, 20, 55);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 190, 55, { align: 'right' });
    
    // Table data with professional formatting
    const tableData = payrollData.map((emp, index) => [
        String(index + 1),
        emp.name,
        emp.bankAccount,
        emp.ifsc || 'SBIN0001234',
        `Rs. ${(emp.netPay || 0).toLocaleString('en-IN')}`,
        'NEFT'
    ]);
    
    const totalAmount = payrollData.reduce((sum, emp) => sum + emp.netPay, 0);
    
    doc.autoTable({
        head: [['S.No', 'Employee Name', 'Account Number', 'IFSC Code', 'Amount', 'Mode']],
        body: tableData,
        startY: 65,
        styles: { 
            fontSize: 9,
            cellPadding: 3
        },
        headStyles: { 
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        foot: [['', '', '', 'Total Amount:', `Rs. ${totalAmount.toLocaleString('en-IN')}`, '']]
    });
    
    doc.save(`Bank_Payment_Statement_${currentMonth.replace('-', '_')}.pdf`);
    addActivity('Generated bank payment statement');
    
    Swal.fire({
        icon: 'success',
        title: 'Bank Statement Generated!',
        text: 'Bank payment statement has been downloaded.',
        timer: 2000,
        showConfirmButton: false
    });
}

function generateGovernmentFiles() {
    Swal.fire({
        title: 'Generate Government Files',
        text: 'Select which government compliance files to generate:',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'PF Returns',
        denyButtonText: 'ESIC Returns',
        cancelButtonText: 'PT Returns'
    }).then((result) => {
        if (result.isConfirmed) {
            generatePFReturns();
        } else if (result.isDenied) {
            generateESICReturns();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            generatePTReturns();
        }
    });
}

function generatePFReturns() {
    if (!ensurePayrollData()) {
        Swal.fire({
            icon: 'warning',
            title: 'No Payroll Data',
            text: 'Unable to process payroll. Please go to Payroll tab and click "Process Payroll" first.'
        });
        return;
    }
    
    // Generate PF returns CSV - only for employees with PF applicable
    const pfData = payrollData
        .filter(emp => emp.hasPF !== false && emp.pf > 0)
        .map(emp => [
            emp.uan || `${Math.floor(Math.random() * 900000000000) + 100000000000}`,
            emp.name,
            emp.basic,
            emp.pf,
            emp.pf // Employer contribution
        ]);
    
    const csvContent = [
        ['UAN', 'Name', 'Basic Wages', 'Employee PF', 'Employer PF'],
        ...pfData
    ].map(row => row.join(',')).join('\n');
    
    downloadCSV(csvContent, `PF_Returns_${currentMonth.replace('-', '_')}.csv`);
    
    addActivity('Generated PF returns file');
    Swal.fire({
        icon: 'success',
        title: 'PF Returns Generated!',
        timer: 2000,
        showConfirmButton: false
    });
}

function generateESICReturns() {
    if (!ensurePayrollData()) {
        Swal.fire({
            icon: 'warning',
            title: 'No Payroll Data',
            text: 'Unable to process payroll. Please go to Payroll tab and click "Process Payroll" first.'
        });
        return;
    }
    
    // Generate ESIC returns CSV - only for employees with ESIC applicable
    const esicData = payrollData.filter(emp => emp.hasESIC !== false && emp.esic > 0).map(emp => [
        emp.esicNumber || `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        emp.name,
        emp.grossSalary,
        emp.esic,
        Math.round(emp.esic * 3.25 / 0.75) // Employer contribution (3.25%)
    ]);
    
    const csvContent = [
        ['ESIC Number', 'Name', 'Gross Wages', 'Employee ESIC', 'Employer ESIC'],
        ...esicData
    ].map(row => row.join(',')).join('\n');
    
    downloadCSV(csvContent, `ESIC_Returns_${currentMonth.replace('-', '_')}.csv`);
    
    addActivity('Generated ESIC returns file');
    Swal.fire({
        icon: 'success',
        title: 'ESIC Returns Generated!',
        timer: 2000,
        showConfirmButton: false
    });
}

function generatePTReturns() {
    if (!ensurePayrollData()) {
        Swal.fire({
            icon: 'warning',
            title: 'No Payroll Data',
            text: 'Unable to process payroll. Please go to Payroll tab and click "Process Payroll" first.'
        });
        return;
    }
    
    // Generate PT returns CSV - only for employees with PT applicable
    const ptData = payrollData.filter(emp => emp.hasPT !== false && emp.pt > 0).map(emp => [
        emp.id,
        emp.name,
        emp.grossSalary,
        emp.pt
    ]);
    
    const csvContent = [
        ['Employee ID', 'Name', 'Gross Salary', 'Professional Tax'],
        ...ptData
    ].map(row => row.join(',')).join('\n');
    
    downloadCSV(csvContent, `PT_Returns_${currentMonth.replace('-', '_')}.csv`);
    
    addActivity('Generated PT returns file');
    Swal.fire({
        icon: 'success',
        title: 'PT Returns Generated!',
        timer: 2000,
        showConfirmButton: false
    });
}

function generateDepartmentSummary() {
    if (!ensurePayrollData()) {
        Swal.fire({
            icon: 'warning',
            title: 'No Payroll Data',
            text: 'Unable to process payroll. Please go to Payroll tab and click "Process Payroll" first.'
        });
        return;
    }
    
    // Group employees by department
    const deptData = {};
    payrollData.forEach(emp => {
        if (!deptData[emp.department]) {
            deptData[emp.department] = [];
        }
        deptData[emp.department].push(emp);
    });
    
    // Create workbook with XLSX
    const wb = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
        ['Department', 'Employee Count', 'Total Basic', 'Total Gross', 'Total Deductions', 'Total Net', 'Average Salary']
    ];
    
    Object.entries(deptData).forEach(([dept, employees]) => {
        const totalBasic = employees.reduce((sum, emp) => sum + emp.basicSalary, 0);
        const totalGross = employees.reduce((sum, emp) => sum + emp.grossSalary, 0);
        const totalDeductions = employees.reduce((sum, emp) => sum + emp.totalDeductions, 0);
        const totalNet = employees.reduce((sum, emp) => sum + emp.netPay, 0);
        const avgSalary = Math.round(totalNet / employees.length);
        
        summaryData.push([
            dept,
            employees.length,
            totalBasic,
            totalGross,
            totalDeductions,
            totalNet,
            avgSalary
        ]);
    });
    
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
    
    // Create individual sheets for each department
    Object.entries(deptData).forEach(([dept, employees]) => {
        const deptSheetData = [
            ['Employee ID', 'Name', 'Designation', 'Basic Salary', 'HRA', 'Conveyance', 'Other Allowances', 'Overtime', 'Gross Salary', 'PF', 'ESIC', 'PT', 'Advance', 'Total Deductions', 'Net Pay', 'Working Days']
        ];
        
        employees.forEach(emp => {
            deptSheetData.push([
                emp.id,
                emp.name,
                emp.designation || 'N/A',
                emp.basicSalary,
                emp.hra,
                emp.conveyance,
                emp.otherAllowances,
                emp.overtimeAmount,
                emp.grossSalary,
                emp.pf,
                emp.esic,
                emp.pt,
                emp.advance,
                emp.totalDeductions,
                emp.netPay,
                emp.workingDays
            ]);
        });
        
        // Add summary row for department
        const totalBasic = employees.reduce((sum, emp) => sum + emp.basicSalary, 0);
        const totalHRA = employees.reduce((sum, emp) => sum + emp.hra, 0);
        const totalConveyance = employees.reduce((sum, emp) => sum + emp.conveyance, 0);
        const totalOther = employees.reduce((sum, emp) => sum + emp.otherAllowances, 0);
        const totalOT = employees.reduce((sum, emp) => sum + emp.overtimeAmount, 0);
        const totalGross = employees.reduce((sum, emp) => sum + emp.grossSalary, 0);
        const totalPF = employees.reduce((sum, emp) => sum + emp.pf, 0);
        const totalESIC = employees.reduce((sum, emp) => sum + emp.esic, 0);
        const totalPT = employees.reduce((sum, emp) => sum + emp.pt, 0);
        const totalAdvance = employees.reduce((sum, emp) => sum + emp.advance, 0);
        const totalDeductions = employees.reduce((sum, emp) => sum + emp.totalDeductions, 0);
        const totalNet = employees.reduce((sum, emp) => sum + emp.netPay, 0);
        const avgWorkingDays = Math.round(employees.reduce((sum, emp) => sum + emp.workingDays, 0) / employees.length);
        
        deptSheetData.push([
            'TOTAL',
            `${employees.length} Employees`,
            '-',
            totalBasic,
            totalHRA,
            totalConveyance,
            totalOther,
            totalOT,
            totalGross,
            totalPF,
            totalESIC,
            totalPT,
            totalAdvance,
            totalDeductions,
            totalNet,
            avgWorkingDays
        ]);
        
        const deptWS = XLSX.utils.aoa_to_sheet(deptSheetData);
        
        // Set column widths
        deptWS['!cols'] = [
            { width: 12 }, // ID
            { width: 20 }, // Name
            { width: 15 }, // Designation
            { width: 12 }, // Basic
            { width: 10 }, // HRA
            { width: 12 }, // Conveyance
            { width: 15 }, // Other
            { width: 10 }, // OT
            { width: 12 }, // Gross
            { width: 8 },  // PF
            { width: 8 },  // ESIC
            { width: 8 },  // PT
            { width: 10 }, // Advance
            { width: 12 }, // Total Ded
            { width: 12 }, // Net
            { width: 10 }  // Days
        ];
        
        XLSX.utils.book_append_sheet(wb, deptWS, dept.substring(0, 31)); // Excel sheet name limit
    });
    
    // Save the workbook
    XLSX.writeFile(wb, `Department_Summary_${currentMonth.replace('-', '_')}.xlsx`);
    
    addActivity('Generated department summary Excel with separate sheets');
    Swal.fire({
        icon: 'success',
        title: 'Department Summary Generated!',
        text: `Excel file with ${Object.keys(deptData).length + 1} sheets has been downloaded.`,
        timer: 2000,
        showConfirmButton: false
    });
}

function generateAttendanceReport() {
    // Generate attendance summary Excel
    const attendanceData = [];
    
    employees.filter(emp => emp.status === 'Active').forEach(emp => {
        const monthAttendance = attendance[currentMonth]?.[emp.id] || [];
        const presentDays = monthAttendance.filter(s => s === 'P' || s === 'POT').length;
        const absentDays = monthAttendance.filter(s => s === 'A').length;
        const overtimeDays = monthAttendance.filter(s => s === 'OT' || s === 'POT').length;
        const holidays = monthAttendance.filter(s => s === 'Off').length;
        
        attendanceData.push([
            emp.id,
            emp.name,
            emp.department,
            presentDays,
            absentDays,
            overtimeDays,
            holidays,
            ((presentDays / (presentDays + absentDays)) * 100).toFixed(1) + '%'
        ]);
    });
    
    const csvContent = [
        ['Employee ID', 'Name', 'Department', 'Present Days', 'Absent Days', 'Overtime Days', 'Holidays', 'Attendance %'],
        ...attendanceData
    ].map(row => row.join(',')).join('\n');
    
    downloadCSV(csvContent, `Attendance_Report_${currentMonth.replace('-', '_')}.csv`);
    
    addActivity('Generated attendance report Excel');
    Swal.fire({
        icon: 'success',
        title: 'Attendance Report Generated!',
        timer: 2000,
        showConfirmButton: false
    });
}

// Helper Functions
function formatCurrency(amount) {
    return `Rs. ${(amount || 0).toLocaleString('en-IN')}`;
}

function numberToWords(amount) {
    // Simplified number to words conversion
    if (amount === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (amount < 10) return ones[amount];
    if (amount < 20) return teens[amount - 10];
    if (amount < 100) return tens[Math.floor(amount / 10)] + (amount % 10 ? ' ' + ones[amount % 10] : '');
    if (amount < 1000) return ones[Math.floor(amount / 100)] + ' Hundred' + (amount % 100 ? ' ' + numberToWords(amount % 100) : '');
    if (amount < 100000) return numberToWords(Math.floor(amount / 1000)) + ' Thousand' + (amount % 1000 ? ' ' + numberToWords(amount % 1000) : '');
    if (amount < 10000000) return numberToWords(Math.floor(amount / 100000)) + ' Lakh' + (amount % 100000 ? ' ' + numberToWords(amount % 100000) : '');
    
    return 'Amount too large';
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// Department Report PDF Generation
function generateDepartmentReport() {
    if (!ensurePayrollData()) {
        Swal.fire({
            icon: 'warning',
            title: 'No Payroll Data',
            text: 'Unable to process payroll. Please go to Payroll tab and click "Process Payroll" first.'
        });
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Professional styling
    const primaryColor = [139, 92, 246];
    const secondaryColor = [52, 73, 94];
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('DEPARTMENT ANALYSIS REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Shishuraksha Children\'s Hospital', 105, 30, { align: 'center' });
    
    // Document info
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(11);
    const monthName = new Date(currentMonth + '-01').toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    doc.text(`Pay Period: ${monthName}`, 20, 55);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 190, 55, { align: 'right' });
    
    // Calculate department summaries
    const deptAnalysis = {};
    payrollData.forEach(emp => {
        if (!deptAnalysis[emp.department]) {
            deptAnalysis[emp.department] = {
                count: 0,
                totalBasic: 0,
                totalGross: 0,
                totalDeductions: 0,
                totalNet: 0,
                employees: []
            };
        }
        deptAnalysis[emp.department].count++;
        deptAnalysis[emp.department].totalBasic += emp.basicSalary;
        deptAnalysis[emp.department].totalGross += emp.grossSalary;
        deptAnalysis[emp.department].totalDeductions += emp.totalDeductions;
        deptAnalysis[emp.department].totalNet += emp.netPay;
        deptAnalysis[emp.department].employees.push(emp);
    });
    
    // Calculate averages
    Object.values(deptAnalysis).forEach(dept => {
        dept.avgSalary = dept.count > 0 ? Math.round(dept.totalNet / dept.count) : 0;
    });
    
    // Department summary table
    const deptTableData = Object.entries(deptAnalysis).map(([dept, stats]) => [
        dept,
        String(stats.count),
        `Rs. ${(stats.totalGross || 0).toLocaleString('en-IN')}`,
        `Rs. ${(stats.totalDeductions || 0).toLocaleString('en-IN')}`,
        `Rs. ${(stats.totalNet || 0).toLocaleString('en-IN')}`,
        `Rs. ${(stats.avgSalary || 0).toLocaleString('en-IN')}`
    ]);
    
    doc.autoTable({
        head: [['Department', 'Employees', 'Total Gross', 'Deductions', 'Net Pay', 'Avg Salary']],
        body: deptTableData,
        startY: 65,
        styles: { 
            fontSize: 10,
            cellPadding: 4
        },
        headStyles: { 
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 30, halign: 'left' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' },
            5: { cellWidth: 30, halign: 'right' }
        }
    });
    
    doc.save(`Department_Analysis_Report_${currentMonth.replace('-', '_')}.pdf`);
    
    addActivity('Generated department analysis PDF report');
    Swal.fire({
        icon: 'success',
        title: 'Department Report Generated!',
        text: 'Department analysis PDF has been downloaded.',
        timer: 2000,
        showConfirmButton: false
    });
}

// Attendance Report PDF Generation
function generateAttendanceReportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Professional styling
    const primaryColor = [220, 38, 38];
    const secondaryColor = [52, 73, 94];
    
    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTENDANCE SUMMARY REPORT', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Shishuraksha Children\'s Hospital', 105, 30, { align: 'center' });
    
    // Document info
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(11);
    const monthName = new Date(currentMonth + '-01').toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    doc.text(`Pay Period: ${monthName}`, 20, 55);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 190, 55, { align: 'right' });
    
    // Generate attendance data
    const attendanceData = employees.filter(emp => emp.status === 'Active').map(emp => {
        const monthAttendance = attendance[currentMonth]?.[emp.id] || [];
        const presentDays = monthAttendance.filter(s => s === 'P' || s === 'POT').length;
        const absentDays = monthAttendance.filter(s => s === 'A').length;
        const overtimeDays = monthAttendance.filter(s => s === 'OT' || s === 'POT').length;
        const holidays = monthAttendance.filter(s => s === 'Off').length;
        const totalDays = monthAttendance.length || 30;
        const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0.0';
        
        return [
            emp.id,
            emp.name.substring(0, 18),
            emp.department,
            String(presentDays),
            String(absentDays),
            String(overtimeDays),
            String(holidays),
            `${attendancePercentage}%`
        ];
    });
    
    doc.autoTable({
        head: [['Employee ID', 'Name', 'Department', 'Present', 'Absent', 'Overtime', 'Holidays', 'Attendance %']],
        body: attendanceData,
        startY: 65,
        styles: { 
            fontSize: 9,
            cellPadding: 3
        },
        headStyles: { 
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        columnStyles: {
            0: { cellWidth: 20, halign: 'center' },
            1: { cellWidth: 35, halign: 'left' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 18, halign: 'center' },
            4: { cellWidth: 18, halign: 'center' },
            5: { cellWidth: 20, halign: 'center' },
            6: { cellWidth: 20, halign: 'center' },
            7: { cellWidth: 25, halign: 'center' }
        }
    });
    
    doc.save(`Attendance_Report_${currentMonth.replace('-', '_')}.pdf`);
    
    addActivity('Generated attendance summary PDF report');
    Swal.fire({
        icon: 'success',
        title: 'Attendance Report Generated!',
        text: 'Attendance summary PDF has been downloaded.',
        timer: 2000,
        showConfirmButton: false
    });
}

function generateComprehensiveReport() {
    if (!ensurePayrollData()) {
        Swal.fire({
            icon: 'warning',
            title: 'No Payroll Data',
            text: 'Unable to process payroll. Please go to Payroll tab and click "Process Payroll" first.'
        });
        return;
    }
    
    // Create comprehensive Excel workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // 1. Summary Sheet
    const summaryData = [
        ['SHISHURAKSHA CHILDREN\'S HOSPITAL'],
        ['COMPREHENSIVE PAYROLL REPORT'],
        [''],
        ['Report Period:', new Date(currentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })],
        ['Generated:', new Date().toLocaleDateString('en-IN')],
        [''],
        ['EXECUTIVE SUMMARY'],
        ['Total Employees:', payrollData.length],
        ['Total Gross Payroll:', payrollData.reduce((sum, emp) => sum + (emp.grossSalary || 0), 0)],
        ['Total Net Payroll:', payrollData.reduce((sum, emp) => sum + (emp.netPay || 0), 0)],
        ['Total Deductions:', payrollData.reduce((sum, emp) => sum + (emp.totalDeductions || 0), 0)],
        ['']
    ];
    
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
    
    // 2. Employee Payroll Sheet
    const payrollSheetData = [
        ['Employee ID', 'Name', 'Department', 'Designation', 'Working Days', 'Basic Salary', 'HRA', 'Conveyance', 'Other Allowances', 'Overtime Amount', 'Gross Salary', 'PF', 'ESIC', 'Professional Tax', 'Advance', 'Total Deductions', 'Net Pay']
    ];
    
    payrollData.forEach(emp => {
        payrollSheetData.push([
            emp.id,
            emp.name,
            emp.department,
            emp.designation || 'N/A',
            emp.workingDays,
            emp.basicSalary,
            emp.hra,
            emp.conveyance,
            emp.otherAllowances,
            emp.overtimeAmount,
            emp.grossSalary,
            emp.pf,
            emp.esic,
            emp.pt,
            emp.advance,
            emp.totalDeductions,
            emp.netPay
        ]);
    });
    
    const payrollWS = XLSX.utils.aoa_to_sheet(payrollSheetData);
    XLSX.utils.book_append_sheet(wb, payrollWS, 'Employee Payroll');
    
    // 3. Department Analysis Sheet
    const deptAnalysis = {};
    payrollData.forEach(emp => {
        if (!deptAnalysis[emp.department]) {
            deptAnalysis[emp.department] = {
                count: 0,
                totalBasic: 0,
                totalGross: 0,
                totalDeductions: 0,
                totalNet: 0
            };
        }
        deptAnalysis[emp.department].count++;
        deptAnalysis[emp.department].totalBasic += emp.basicSalary;
        deptAnalysis[emp.department].totalGross += emp.grossSalary;
        deptAnalysis[emp.department].totalDeductions += emp.totalDeductions;
        deptAnalysis[emp.department].totalNet += emp.netPay;
    });
    
    const deptSheetData = [
        ['Department', 'Employee Count', 'Total Basic', 'Total Gross', 'Total Deductions', 'Total Net', 'Average Salary']
    ];
    
    Object.entries(deptAnalysis).forEach(([dept, stats]) => {
        deptSheetData.push([
            dept,
            stats.count,
            stats.totalBasic,
            stats.totalGross,
            stats.totalDeductions,
            stats.totalNet,
            Math.round(stats.totalNet / stats.count)
        ]);
    });
    
    const deptWS = XLSX.utils.aoa_to_sheet(deptSheetData);
    XLSX.utils.book_append_sheet(wb, deptWS, 'Department Analysis');
    
    // 4. Attendance Summary Sheet
    const attendanceSheetData = [
        ['Employee ID', 'Name', 'Department', 'Present Days', 'Absent Days', 'Overtime Days', 'Working Days', 'Attendance Percentage']
    ];
    
    employees.filter(emp => emp.status === 'Active').forEach(emp => {
        const monthAttendance = attendance[currentMonth]?.[emp.id] || [];
        const presentDays = monthAttendance.filter(s => s === 'P' || s === 'POT').length;
        const absentDays = monthAttendance.filter(s => s === 'A').length;
        const overtimeDays = monthAttendance.filter(s => s === 'OT' || s === 'POT').length;
        const totalDays = monthAttendance.length || 30;
        const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0.0';
        
        attendanceSheetData.push([
            emp.id,
            emp.name,
            emp.department,
            presentDays,
            absentDays,
            overtimeDays,
            presentDays,
            attendancePercentage + '%'
        ]);
    });
    
    const attendanceWS = XLSX.utils.aoa_to_sheet(attendanceSheetData);
    XLSX.utils.book_append_sheet(wb, attendanceWS, 'Attendance Summary');
    
    // 5. Bank Transfer Sheet
    const bankSheetData = [
        ['Employee ID', 'Employee Name', 'Bank Account', 'IFSC Code', 'Transfer Amount', 'Transfer Mode']
    ];
    
    payrollData.forEach(emp => {
        bankSheetData.push([
            emp.id,
            emp.name,
            emp.bankAccount || 'N/A',
            emp.ifsc || 'N/A',
            emp.netPay,
            'NEFT'
        ]);
    });
    
    const bankWS = XLSX.utils.aoa_to_sheet(bankSheetData);
    XLSX.utils.book_append_sheet(wb, bankWS, 'Bank Transfers');
    
    // 6. Compliance Sheet (PF, ESIC, PT)
    const complianceSheetData = [
        ['Employee ID', 'Name', 'PF Amount', 'ESIC Amount', 'Professional Tax', 'Total Statutory']
    ];
    
    payrollData.forEach(emp => {
        complianceSheetData.push([
            emp.id,
            emp.name,
            emp.hasPF !== false ? emp.pf : 'N/A',
            emp.hasESIC !== false ? emp.esic : 'N/A',
            emp.hasPT !== false ? emp.pt : 'N/A',
            emp.pf + emp.esic + emp.pt
        ]);
    });
    
    const complianceWS = XLSX.utils.aoa_to_sheet(complianceSheetData);
    XLSX.utils.book_append_sheet(wb, complianceWS, 'Compliance Report');
    
    // Save the comprehensive workbook
    const monthYear = currentMonth.replace('-', '_');
    XLSX.writeFile(wb, `Comprehensive_Payroll_Report_${monthYear}.xlsx`);
    
    addActivity('Generated comprehensive Excel report with 6 detailed sheets');
    Swal.fire({
        icon: 'success',
        title: 'Comprehensive Report Generated!',
        text: 'Excel file with 6 detailed sheets has been downloaded.',
        timer: 2000,
        showConfirmButton: false
    });
}

async function generateComprehensiveReportPDF() {
    try {
        // Ensure payroll data is available
        if (!ensurePayrollData()) {
            Swal.fire({
                icon: 'warning',
                title: 'No Payroll Data',
                text: 'Unable to process payroll. Please go to Payroll tab and click "Process Payroll" first.'
            });
            return;
        }
        
        // Validate required data before proceeding
        if (!payrollData || !Array.isArray(payrollData) || payrollData.length === 0) {
            throw new Error('No payroll data available for report generation');
        }
        if (!employees || !Array.isArray(employees)) {
            throw new Error('Employee data not available');
        }
        if (!attendance || typeof attendance !== 'object') {
            throw new Error('Attendance data not available');
        }
        if (!currentMonth) {
            throw new Error('Current month not specified');
        }

        // Show loading indicator
        Swal.fire({
            title: 'Generating Comprehensive Report',
            text: 'Please wait while we prepare your PDF...',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // Check if we have a large dataset
        if (payrollData.length > 100) {
            const result = await Swal.fire({
                title: 'Large Dataset Detected',
                text: `You have ${payrollData.length} employees. This may take some time to process. Continue?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, Continue',
                cancelButtonText: 'Cancel'
            });
            
            if (!result.isConfirmed) {
                return;
            }
            
            // Show progress for large datasets
            Swal.fire({
                title: 'Processing Large Dataset',
                text: 'Generating comprehensive report...',
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Helper function to add decorative line
        function addDecorativeLine(y, color = [40, 116, 240]) {
            doc.setDrawColor(color[0], color[1], color[2]);
            doc.setLineWidth(0.5);
            doc.line(20, y, 190, y);
        }

        // Helper function to add colored box background
        function addColoredBox(x, y, width, height, color, opacity = 0.1) {
            doc.setFillColor(color[0], color[1], color[2]);
            doc.rect(x, y, width, height, 'F');
        }

        // Helper function for consistent date formatting
        function formatDate(date, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
            try {
                if (!date || isNaN(new Date(date))) {
                    return 'Invalid Date';
                }
                return new Date(date).toLocaleDateString('en-IN', options);
            } catch (error) {
                return 'Invalid Date';
            }
        }

        // Professional section header function
        function addSectionHeader(title, sectionNumber, themeColor, description = '') {
            // Section background with better visibility
            addColoredBox(15, 20, 180, 30, [245, 247, 250], 1);
            
            // Section number circle
            doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
            doc.circle(30, 35, 10, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(255, 255, 255);
            doc.text(sectionNumber.toString(), 30, 38, { align: 'center' });
            
            // Section title with better contrast
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.setTextColor(31, 41, 55); // Dark gray for better readability
            doc.text(title, 50, 32);
            
            // Section description
            if (description) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(75, 85, 99);
                doc.text(description, 50, 42);
            }
            
            // Professional divider line
            doc.setDrawColor(themeColor[0], themeColor[1], themeColor[2]);
            doc.setLineWidth(1);
            doc.line(15, 55, 195, 55);
            
            // Page header for continuation pages
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            const reportPeriod = new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            doc.text(`Shishuraksha Hospital | Payroll Report | ${reportPeriod} | Page ${doc.getCurrentPageInfo().pageNumber}`, 190, 12, { align: 'right' });
            
            return 65; // Return Y position for content start
        }

        // Page break with section continuation
        function addPageBreakWithHeader(sectionTitle, sectionNumber, themeColor) {
            doc.addPage();
            
            // Continuation header
            addColoredBox(10, 10, 190, 15, themeColor, 0.05);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
            doc.text(`${sectionNumber}. ${sectionTitle} (Continued)`, 15, 20);
            
            // Page info
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            const reportPeriod = new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            doc.text(`Shishuraksha Hospital | Payroll Report | ${reportPeriod} | Page ${doc.getCurrentPageInfo().pageNumber}`, 200, 8, { align: 'right' });
            
            addDecorativeLine(30, themeColor);
            return 40; // Return Y position for content start
        }

        // Enterprise-Level Professional Cover Page - Clean & Minimalist
        
        // Clean header with hospital name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(31, 41, 55);
        doc.text('SHISHURAKSHA CHILDREN\'S HOSPITAL', 105, 30, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('Excellence in Pediatric Healthcare & Human Resource Management', 105, 40, { align: 'center' });
        
        // Clean separator line
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.line(30, 50, 180, 50);
        
        // Main report title - clean and professional
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(31, 41, 55);
        doc.text('WORKFORCE ANALYTICS', 105, 80, { align: 'center' });
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(31, 41, 55);
        doc.text('& FINANCIAL REPORT', 105, 95, { align: 'center' });
        
        // Professional subtitle
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text('Strategic Human Capital Management Analysis', 105, 110, { align: 'center' });
        
        // Report period
        const reportDate = new Date(currentMonth);
        const monthYear = reportDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text(`REPORTING PERIOD: ${monthYear.toUpperCase()}`, 105, 125, { align: 'center' });
        
        // Clean separator line
        doc.setDrawColor(31, 41, 55);
        doc.setLineWidth(1);
        doc.line(50, 135, 160, 135);

        // Professional Key Metrics Section - Standardized Calculations
        const totalGross = payrollData.reduce((sum, emp) => sum + (emp.grossSalary || 0), 0);
        const totalNet = payrollData.reduce((sum, emp) => sum + (emp.netPay || 0), 0);
        const totalDeductions = payrollData.reduce((sum, emp) => sum + (emp.totalDeductions || 0), 0);
        const avgSalaryAmount = payrollData.length > 0 ? Math.round(totalNet / payrollData.length) : 0;
        
        // Professional metrics section header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text('EXECUTIVE SUMMARY', 105, 150, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('Key Performance Indicators & Financial Overview', 105, 160, { align: 'center' });
        
        // Clean, professional metrics cards
        const cardWidth = 85;
        const cardHeight = 35;
        
        // Card 1: Total Workforce - Clean design
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(1);
        doc.rect(20, 170, cardWidth, cardHeight);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('TOTAL WORKFORCE', 62.5, 180, { align: 'center' });
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(31, 41, 55);
        doc.text(`${payrollData.length}`, 62.5, 192, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Active Employees', 62.5, 200, { align: 'center' });
        
        // Card 2: Gross Payroll - Clean design
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(1);
        doc.rect(115, 170, cardWidth, cardHeight);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('GROSS PAYROLL', 157.5, 180, { align: 'center' });
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text(`Rs. ${totalGross.toLocaleString('en-IN')}`, 157.5, 192, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Total Compensation', 157.5, 200, { align: 'center' });
        
        // Card 3: Net Payroll - Clean design
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(1);
        doc.rect(20, 210, cardWidth, cardHeight);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('NET PAYROLL', 62.5, 220, { align: 'center' });
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text(`Rs. ${totalNet.toLocaleString('en-IN')}`, 62.5, 232, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Final Disbursement', 62.5, 240, { align: 'center' });
        
        // Card 4: Average Salary - Clean design
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(1);
        doc.rect(115, 210, cardWidth, cardHeight);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('AVERAGE SALARY', 157.5, 220, { align: 'center' });
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.text(`Rs. ${avgSalaryAmount.toLocaleString('en-IN')}`, 157.5, 232, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Per Employee', 157.5, 240, { align: 'center' });

        // Professional footer section
        doc.setDrawColor(203, 213, 225);
        doc.setLineWidth(0.5);
        doc.line(20, 255, 190, 255);
        
        // Generation details - clean and professional
        const generationDate = new Date();
        const dateStr = formatDate(generationDate);
        const timeStr = generationDate.toLocaleTimeString('en-IN', {hour12: false});
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Report Generated: ${dateStr} at ${timeStr} IST`, 105, 265, { align: 'center' });
        
        // Professional confidentiality notice
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(220, 38, 38);
        doc.text('CONFIDENTIAL', 105, 275, { align: 'center' });
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text('This document contains proprietary and confidential information', 105, 282, { align: 'center' });
        
        // Professional system branding
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text('Powered by Shishuraksha Hospital Management System', 105, 290, { align: 'center' });
        

        // Professional Table of Contents
        doc.addPage();
        
        // Page header background
        addColoredBox(15, 20, 180, 25, [245, 247, 250], 1);
        doc.setDrawColor(40, 116, 240);
        doc.setLineWidth(1);
        doc.rect(15, 20, 180, 25);
        
        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(31, 41, 55);
        doc.text('TABLE OF CONTENTS', 105, 35, { align: 'center' });
        
        doc.setDrawColor(40, 116, 240);
        doc.setLineWidth(1);
        doc.line(15, 50, 195, 50);
        
        // TOC Items
        const tocItems = [
            { title: '1. Executive Dashboard', page: 'Page 3' },
            { title: '2. Workforce Investment Analysis', page: 'Page 4+' },
            { title: '3. Business Unit Performance', page: 'Page N+' },
            { title: '4. Productivity & Engagement Metrics', page: 'Page N+' },
            { title: '5. Financial Disbursement Report', page: 'Page N+' },
            { title: '6. Regulatory Compliance Status', page: 'Page N+' }
        ];
        
        tocItems.forEach((item, index) => {
            const y = 70 + (index * 15);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(31, 41, 55);
            doc.text(item.title, 25, y);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99);
            doc.text(item.page, 175, y);
        });

        // Executive Summary Section
        doc.addPage();
        const executiveSummaryY = addSectionHeader(
            'EXECUTIVE DASHBOARD', 
            1, 
            [51, 51, 51], 
            'Strategic workforce metrics and business intelligence for leadership decisions'
        );
        
        // Key metrics boxes with better visibility
        addColoredBox(25, executiveSummaryY + 10, 80, 35, [59, 130, 246], 0.1);
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(1);
        doc.rect(25, executiveSummaryY + 10, 80, 35);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(31, 41, 55);
        doc.text('GROSS PAYROLL', 65, executiveSummaryY + 22, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(59, 130, 246);
        doc.text(`Rs. ${totalGross.toLocaleString('en-IN')}`, 65, executiveSummaryY + 35, { align: 'center' });
        
        addColoredBox(115, executiveSummaryY + 10, 80, 35, [16, 185, 129], 0.1);
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(1);
        doc.rect(115, executiveSummaryY + 10, 80, 35);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(31, 41, 55);
        doc.text('NET PAYROLL', 155, executiveSummaryY + 22, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129);
        doc.text(`Rs. ${totalNet.toLocaleString('en-IN')}`, 155, executiveSummaryY + 35, { align: 'center' });

        // Payroll Details Section
        doc.addPage();
        const payrollSummaryY = addSectionHeader(
            'WORKFORCE INVESTMENT ANALYSIS', 
            2, 
            [37, 99, 235], 
            'Detailed human capital allocation and compensation structure'
        );

        const payrollTableData = payrollData.map(emp => [
            emp.id,
            emp.name.substring(0, 15),
            emp.department.substring(0, 8),
            String(emp.workingDays),
            `Rs. ${(emp.basicSalary || 0).toLocaleString('en-IN')}`,
            `Rs. ${(emp.grossSalary || 0).toLocaleString('en-IN')}`,
            `Rs. ${(emp.totalDeductions || 0).toLocaleString('en-IN')}`,
            `Rs. ${(emp.netPay || 0).toLocaleString('en-IN')}`
        ]);

        doc.autoTable({
            head: [['ID', 'Name', 'Dept', 'Days', 'Basic', 'Gross', 'Ded.', 'Net']],
            body: payrollTableData,
            startY: payrollSummaryY,
            showHead: 'everyPage',
            theme: 'grid',
            styles: { 
                fontSize: 8,
                cellPadding: 4,
                halign: 'center',
                valign: 'middle',
                lineColor: [220, 220, 220],
                lineWidth: 0.1
            },
            headStyles: { 
                fillColor: [37, 99, 235],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9,
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 35, halign: 'left' },
                2: { cellWidth: 20, halign: 'center' },
                3: { cellWidth: 15, halign: 'center' },
                4: { cellWidth: 25, halign: 'right' },
                5: { cellWidth: 25, halign: 'right' },
                6: { cellWidth: 25, halign: 'right' },
                7: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 15, right: 15 }
        });

        // Department Analysis Section
        doc.addPage();
        const departmentAnalysisY = addSectionHeader(
            'BUSINESS UNIT PERFORMANCE', 
            3, 
            [139, 92, 246], 
            'Departmental ROI analysis and strategic resource allocation insights'
        );

        const deptAnalysis = {};
        payrollData.forEach(emp => {
            if (!deptAnalysis[emp.department]) {
                deptAnalysis[emp.department] = {
                    count: 0,
                    totalGross: 0,
                    totalDeductions: 0,
                    totalNet: 0
                };
            }
            deptAnalysis[emp.department].count++;
            deptAnalysis[emp.department].totalGross += emp.grossSalary;
            deptAnalysis[emp.department].totalDeductions += emp.totalDeductions;
            deptAnalysis[emp.department].totalNet += emp.netPay;
        });

        const deptTableData = Object.entries(deptAnalysis).map(([dept, stats]) => [
            dept,
            String(stats.count),
            `Rs. ${(stats.totalGross || 0).toLocaleString('en-IN')}`,
            `Rs. ${(stats.totalDeductions || 0).toLocaleString('en-IN')}`,
            `Rs. ${(stats.totalNet || 0).toLocaleString('en-IN')}`,
            `Rs. ${Math.round((stats.totalNet || 0) / (stats.count || 1)).toLocaleString('en-IN')}`
        ]);

        doc.autoTable({
            head: [['Department', 'Employees', 'Total Gross', 'Deductions', 'Net Pay', 'Avg Salary']],
            body: deptTableData,
            startY: departmentAnalysisY,
            theme: 'grid',
            styles: { 
                fontSize: 9,
                cellPadding: 4,
                halign: 'center',
                valign: 'middle',
                lineColor: [220, 220, 220],
                lineWidth: 0.1
            },
            headStyles: { 
                fillColor: [139, 92, 246],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 10,
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            columnStyles: {
                0: { cellWidth: 30, halign: 'left' },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 30, halign: 'right' },
                3: { cellWidth: 30, halign: 'right' },
                4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
                5: { cellWidth: 30, halign: 'right' }
            },
            margin: { left: 15, right: 15 }
        });

        // Attendance Summary Section
        doc.addPage();
        const attendanceSummaryY = addSectionHeader(
            'PRODUCTIVITY & ENGAGEMENT METRICS', 
            4, 
            [15, 118, 110], 
            'Workforce utilization and operational efficiency indicators'
        );

        const attendanceSummaryData = employees.filter(emp => emp.status === 'Active').map(emp => {
            const monthAttendance = attendance[currentMonth]?.[emp.id] || [];
            const presentDays = monthAttendance.filter(s => s === 'P').length;
            const absentDays = monthAttendance.filter(s => s === 'A').length;
            const overtimeDays = monthAttendance.filter(s => s === 'OT' || s === 'POT').length;
            const totalDays = monthAttendance.length || 30;
            const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

            return [
                emp.id,
                emp.name.substring(0, 20),
                emp.department.substring(0, 10),
                String(presentDays),
                String(absentDays),
                String(overtimeDays),
                `${attendancePercentage}%`
            ];
        });

        doc.autoTable({
            head: [['ID', 'Name', 'Dept', 'Present', 'Absent', 'OT', 'Att %']],
            body: attendanceSummaryData,
            startY: attendanceSummaryY,
            theme: 'grid',
            styles: { 
                fontSize: 8,
                cellPadding: 4,
                halign: 'center',
                valign: 'middle',
                lineColor: [220, 220, 220],
                lineWidth: 0.1
            },
            headStyles: { 
                fillColor: [15, 118, 110],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9,
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            columnStyles: {
                0: { cellWidth: 18, halign: 'center' },
                1: { cellWidth: 40, halign: 'left' },
                2: { cellWidth: 25, halign: 'center' },
                3: { cellWidth: 20, halign: 'center' },
                4: { cellWidth: 20, halign: 'center' },
                5: { cellWidth: 18, halign: 'center' },
                6: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
            },
            margin: { left: 15, right: 15 }
        });

        // Bank Transfer Details Section
        doc.addPage();
        const bankTransferY = addSectionHeader(
            'FINANCIAL DISBURSEMENT REPORT', 
            5, 
            [16, 185, 129], 
            'Secure payment processing and cash flow management details'
        );

        const bankTableData = payrollData.map(emp => [
            emp.id,
            emp.name.substring(0, 18),
            emp.bankAccount || 'N/A',
            emp.ifsc || 'N/A',
            `Rs. ${(emp.netPay || 0).toLocaleString('en-IN')}`
        ]);

        doc.autoTable({
            head: [['Emp ID', 'Employee Name', 'Account Number', 'IFSC Code', 'Transfer Amount']],
            body: bankTableData,
            startY: bankTransferY,
            theme: 'grid',
            styles: { 
                fontSize: 8,
                cellPadding: 4,
                halign: 'center',
                valign: 'middle',
                lineColor: [220, 220, 220],
                lineWidth: 0.1
            },
            headStyles: { 
                fillColor: [16, 185, 129],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9,
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            columnStyles: {
                0: { cellWidth: 20, halign: 'center' },
                1: { cellWidth: 45, halign: 'left' },
                2: { cellWidth: 40, halign: 'center' },
                3: { cellWidth: 30, halign: 'center' },
                4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 15, right: 15 }
        });

        // Compliance Report Section
        doc.addPage();
        const complianceReportY = addSectionHeader(
            'REGULATORY COMPLIANCE STATUS', 
            6, 
            [168, 85, 247], 
            'Statutory adherence and risk management documentation'
        );

        const totalPF = payrollData.reduce((sum, emp) => sum + (emp.pf || 0), 0);
        const totalESIC = payrollData.reduce((sum, emp) => sum + (emp.esic || 0), 0);
        const totalPT = payrollData.reduce((sum, emp) => sum + (emp.pt || 0), 0);

        // Compliance summary with better formatting
        addColoredBox(20, complianceReportY + 10, 170, 50, [245, 247, 250], 1);
        doc.setDrawColor(168, 85, 247);
        doc.setLineWidth(0.5);
        doc.rect(20, complianceReportY + 10, 170, 50);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55);
        doc.text(`Total PF: Rs. ${totalPF.toLocaleString('en-IN')}`, 30, complianceReportY + 25);
        doc.text(`Total ESIC: Rs. ${totalESIC.toLocaleString('en-IN')}`, 30, complianceReportY + 38);
        doc.text(`Total PT: Rs. ${totalPT.toLocaleString('en-IN')}`, 30, complianceReportY + 51);

        const complianceTableData = payrollData.map(emp => [
            emp.id,
            emp.name.substring(0, 18),
            `Rs. ${(emp.pf || 0).toLocaleString('en-IN')}`,
            `Rs. ${(emp.esic || 0).toLocaleString('en-IN')}`,
            `Rs. ${(emp.pt || 0).toLocaleString('en-IN')}`,
            `Rs. ${((emp.pf || 0) + (emp.esic || 0) + (emp.pt || 0)).toLocaleString('en-IN')}`
        ]);

        doc.autoTable({
            head: [['Emp ID', 'Name', 'PF Amount', 'ESIC Amount', 'PT Amount', 'Total Statutory']],
            body: complianceTableData,
            startY: complianceReportY + 70,
            theme: 'grid',
            styles: { 
                fontSize: 8,
                cellPadding: 4,
                halign: 'center',
                valign: 'middle',
                lineColor: [220, 220, 220],
                lineWidth: 0.1
            },
            headStyles: { 
                fillColor: [168, 85, 247],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9,
                halign: 'center'
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            columnStyles: {
                0: { cellWidth: 20, halign: 'center' },
                1: { cellWidth: 35, halign: 'left' },
                2: { cellWidth: 25, halign: 'right' },
                3: { cellWidth: 25, halign: 'right' },
                4: { cellWidth: 25, halign: 'right' },
                5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
            },
            margin: { left: 15, right: 15 }
        });

        // Create professional filename with enhanced naming
        const filenameDate = new Date(currentMonth);
        const year = filenameDate.getFullYear();
        const month = filenameDate.toLocaleDateString('en-US', { month: 'long' });
        const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
        const filename = `Shishuraksha_Comprehensive_Payroll_Report_${month}_${year}_${timestamp}.pdf`;
        
        doc.save(filename);
        
        Swal.fire({
            icon: 'success',
            title: 'Professional Report Generated Successfully!',
            html: `
                <div style="text-align: center;">
                    <p style="margin: 10px 0; color: #374151;">Your comprehensive payroll report has been generated with enhanced formatting and professional design.</p>
                    <div style="background: #f3f4f6; padding: 10px; border-radius: 8px; margin: 10px 0;">
                        <strong style="color: #1f2937;">Report Features:</strong><br>
                        <span style="color: #6b7280;">✓ Enhanced visual design</span><br>
                        <span style="color: #6b7280;">✓ Professional formatting</span><br>
                        <span style="color: #6b7280;">✓ Comprehensive data analysis</span><br>
                        <span style="color: #6b7280;">✓ Modern layout & typography</span>
                    </div>
                </div>
            `,
            timer: 4000,
            showConfirmButton: false,
            background: '#ffffff',
            customClass: {
                popup: 'animated fadeInUp'
            }
        });

        addActivity('Generated comprehensive PDF report');
        
    } catch (error) {
        console.error('Error generating comprehensive report PDF:', error);
        
        // Hide loading indicator and show error
        Swal.fire({
            icon: 'error',
            title: 'PDF Generation Failed',
            text: 'An error occurred while generating the comprehensive report. Please try again with a smaller dataset or contact support.',
            footer: `Error: ${error.message}`,
            showConfirmButton: true
        });
        
        // Log the error activity
        addActivity('Failed to generate comprehensive PDF report');
    }
}

// Make functions available globally for browser use
window.showPayslipSelector = showPayslipSelector;
window.filterPayslipEmployees = filterPayslipEmployees;
window.selectAllPayslips = selectAllPayslips;
window.generateSelectedPayslips = generateSelectedPayslips;
window.generatePayslip = generatePayslip;
window.generateBankStatement = generateBankStatement;
window.generateGovernmentFiles = generateGovernmentFiles;
window.generatePFReturns = generatePFReturns;
window.generateESICReturns = generateESICReturns;
window.generatePTReturns = generatePTReturns;
window.generateDepartmentSummary = generateDepartmentSummary;
window.generateDepartmentReport = generateDepartmentReport;
window.generateAttendanceReport = generateAttendanceReport;
window.generateAttendanceReportPDF = generateAttendanceReportPDF;
window.generateComprehensiveReport = generateComprehensiveReport;
window.generateComprehensiveReportPDF = generateComprehensiveReportPDF;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showPayslipSelector,
        filterPayslipEmployees,
        selectAllPayslips,
        generateSelectedPayslips,
        generatePayslip,
        generateBankStatement,
        generateGovernmentFiles,
        generateDepartmentSummary,
        generateAttendanceReport,
        generateComprehensiveReport,
        generateComprehensiveReportPDF,
        formatCurrency,
        numberToWords,
        downloadCSV
    };
}