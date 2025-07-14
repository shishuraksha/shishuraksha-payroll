/**
 * Core Payroll Calculation Module
 * Handles all salary calculations, deductions, and payroll processing
 */

// Core Payroll Calculation Functions
function processPayroll(showNotification = true) {
    payrollData = [];
    
    employees.forEach(emp => {
        if (emp.status === 'Active') {
            const payroll = calculateEmployeePayroll(emp);
            payrollData.push(payroll);
        }
    });
    
    displayPayroll();
    updateDashboard();
    
    if (showNotification) {
        Swal.fire({
            icon: 'success',
            title: 'Payroll Processed!',
            text: `Payroll calculated for ${payrollData.length} employees.`,
            timer: 2000,
            showConfirmButton: false
        });
        
        addActivity('Processed payroll for ' + currentMonth);
    }
    
    saveToLocalStorage();
}

function calculateEmployeePayroll(employee) {
    const monthAttendance = attendance[currentMonth]?.[employee.id] || [];
    let presentDays = 0;
    let presentWithOTDays = 0;
    let overtimeOnlyDays = 0;
    let absentDays = 0;
    let offDays = 0;
    
    // Count attendance with case-insensitive matching to match Excel
    monthAttendance.forEach(status => {
        const normalizedStatus = status ? status.toString().toUpperCase() : '';
        
        if (normalizedStatus === 'P') {
            presentDays++;
        } else if (normalizedStatus === 'P+OT' || normalizedStatus === 'POT') {
            presentWithOTDays++;
        } else if (normalizedStatus === 'OT') {
            overtimeOnlyDays++;
        } else if (normalizedStatus === 'OFF' || normalizedStatus === 'O') {
            offDays++;
        } else if (normalizedStatus === 'A') {
            absentDays++;
        } else if (!normalizedStatus || normalizedStatus === '') {
            // Empty cells count as present days in the original logic
            presentDays++;
        }
    });
    
    // Hospital 24-hour attendance rules:
    // 1. Employees are eligible for 4 paid offs per month
    // 2. P+OT counts as 2 days payment (regular + overtime)
    // 3. Unused offs are paid (if employee takes < 4 offs)
    
    // CORRECTED CALCULATION - Separate base working days from total working days
    
    // Base working days (for basic salary calculation) = Present + P+OT(1x) + Off (up to 4) + Unused offs
    const paidOffDays = Math.min(offDays, 4); // Only first 4 offs are paid
    const unusedPaidOffs = Math.max(0, 4 - offDays);
    const baseWorkingDays = presentDays + presentWithOTDays + paidOffDays + unusedPaidOffs;
    
    // Overtime Days (for separate OT payment) = OT days + P+OT days (overtime portion)
    const totalOvertimeDays = overtimeOnlyDays + presentWithOTDays;
    
    // Total working days (for display) = Base days + Overtime days
    const workingDays = baseWorkingDays + totalOvertimeDays;
    
    // Keep adjustedDays for compatibility (same as unusedPaidOffs)
    const adjustedDays = unusedPaidOffs;
    
    // Get the correct number of days in the month
    const year = parseInt(currentMonth.split('-')[0]);
    const month = parseInt(currentMonth.split('-')[1]);
    const totalDays = new Date(year, month, 0).getDate();
    const dailyRate = employee.basicSalary / totalDays;
    
    // Calculate basic salary components (based on base working days only, NOT including OT)
    const basic = Math.round(dailyRate * baseWorkingDays);
    
    // Calculate allowances based on basic salary or base working days (not including OT)
    const hra = employee.hra > 0 ? Math.round((employee.hra / totalDays) * baseWorkingDays) : Math.round(basic * 0.4);
    const conveyance = employee.conveyance > 0 ? Math.round((employee.conveyance / totalDays) * baseWorkingDays) : (baseWorkingDays > 0 ? 1600 : 0);
    const otherAllowances = employee.otherAllowances > 0 ? Math.round((employee.otherAllowances / totalDays) * baseWorkingDays) : (baseWorkingDays > 0 ? 2000 : 0);
    
    // Calculate OT amount separately (this is ADDITIONAL to basic salary)
    const overtimeAmount = Math.round(totalOvertimeDays * dailyRate * 1.5);
    
    const grossSalary = basic + hra + conveyance + otherAllowances + overtimeAmount;
    
    // Calculate deductions based on basic salary components ONLY (excluding OT amount)
    const basicSalaryComponents = basic + hra + conveyance + otherAllowances;
    
    const pfBase = Math.min(basic, 15000); // PF on basic salary only
    const pf = (employee.hasPF !== false) ? Math.round(pfBase * 0.12) : 0;
    
    // ESIC on basic components only (not including OT)
    const esicBase = basicSalaryComponents <= 21000 ? basicSalaryComponents : 0;
    const esic = (employee.hasESIC !== false && esicBase > 0) ? Math.round(esicBase * 0.0075) : 0;
    
    // PT based on gross salary (including OT)
    const pt = (employee.hasPT !== false && grossSalary > 10000) ? 200 : 0;
    
    // Calculate advance deduction - use EMI system if available, otherwise one-time deduction
    let advance = 0;
    if (window.advanceManagement && typeof window.advanceManagement.calculateMonthlyAdvanceDeduction === 'function') {
        advance = window.advanceManagement.calculateMonthlyAdvanceDeduction(employee.id, currentMonth);
    } else {
        advance = employee.advance || 0;
    }
    
    const totalDeductions = pf + esic + pt + advance;
    const netPay = grossSalary - totalDeductions;
    
    return {
        ...employee,
        presentDays,
        presentWithOTDays,
        overtimeOnlyDays,
        offDays,
        absentDays,
        adjustedDays,
        baseWorkingDays,
        totalOvertimeDays,
        workingDays,
        paidOffDays,
        unusedPaidOffs,
        basicSalaryComponents,
        basic,
        hra,
        conveyance,
        otherAllowances,
        overtimeAmount,
        grossSalary,
        pf,
        esic,
        pt,
        advance,
        totalDeductions,
        netPay
    };
}

function updateAdvance(empId, newAdvance) {
    const advanceAmount = parseFloat(newAdvance) || 0;
    
    // Find and update the employee in the employees array
    const employee = employees.find(emp => emp.id === empId);
    if (employee) {
        employee.advance = advanceAmount;
        
        // Recalculate payroll for this employee
        const updatedPayrollEntry = calculateEmployeePayroll(employee);
        
        // Update the payrollData array
        const payrollIndex = payrollData.findIndex(emp => emp.id === empId);
        if (payrollIndex !== -1) {
            payrollData[payrollIndex] = updatedPayrollEntry;
        }
        
        // Update only the affected row for better performance
        updatePayrollRow(empId, updatedPayrollEntry);
        
        // Update dashboard totals
        updateDashboard();
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Add activity log
        addActivity(`Updated advance for ${employee.name}: ₹${advanceAmount.toLocaleString('en-IN')}`);
    }
}

function updatePayrollRow(empId, payrollData) {
    const row = document.querySelector(`#payrollTableBody tr[data-emp-id="${empId}"]`);
    if (row) {
        row.innerHTML = `
            <td>${payrollData.id}</td>
            <td class="text-left">${payrollData.name}</td>
            <td>${payrollData.department}</td>
            <td>${payrollData.workingDays}</td>
            <td>₹${payrollData.basic.toLocaleString('en-IN')}</td>
            <td>₹${payrollData.hra.toLocaleString('en-IN')}</td>
            <td>₹${payrollData.conveyance.toLocaleString('en-IN')}</td>
            <td>₹${payrollData.otherAllowances.toLocaleString('en-IN')}</td>
            <td>₹${payrollData.overtimeAmount.toLocaleString('en-IN')}</td>
            <td class="font-bold">₹${payrollData.grossSalary.toLocaleString('en-IN')}</td>
            <td>${payrollData.hasPF !== false ? '₹' + payrollData.pf.toLocaleString('en-IN') : '<span class="text-gray-400">-</span>'}</td>
            <td>${payrollData.hasESIC !== false ? '₹' + payrollData.esic.toLocaleString('en-IN') : '<span class="text-gray-400">-</span>'}</td>
            <td>${payrollData.hasPT !== false ? '₹' + payrollData.pt.toLocaleString('en-IN') : '<span class="text-gray-400">-</span>'}</td>
            <td><input type="number" class="advance-input w-full px-2 py-1 text-center border border-gray-300 rounded" value="${payrollData.advance}" min="0" onchange="updateAdvance('${payrollData.id}', this.value)" /></td>
            <td class="font-bold">₹${payrollData.totalDeductions.toLocaleString('en-IN')}</td>
            <td class="font-bold text-green-600">₹${payrollData.netPay.toLocaleString('en-IN')}</td>
        `;
    }
}

function displayPayroll() {
    const tbody = document.getElementById('payrollTableBody');
    if (!tbody) {
        console.error('payrollTableBody element not found');
        return;
    }
    tbody.innerHTML = '';
    
    payrollData.forEach(emp => {
        const row = document.createElement('tr');
        row.setAttribute('data-emp-id', emp.id);
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors';
        
        row.innerHTML = `
            <td>${emp.id}</td>
            <td class="text-left">${emp.name}</td>
            <td>${emp.department}</td>
            <td>
                <div class="text-sm">
                    <div class="font-semibold">${emp.workingDays} <span class="text-xs text-gray-500">(${emp.baseWorkingDays}+${emp.totalOvertimeDays}OT)</span></div>
                    <div class="text-xs text-gray-500">P:${emp.presentDays} P+OT:${emp.presentWithOTDays} O:${emp.offDays} A:${emp.absentDays}</div>
                    ${emp.unusedPaidOffs > 0 ? `<div class="text-xs text-green-600">+${emp.unusedPaidOffs} unused offs</div>` : ''}
                    ${emp.offDays > 4 ? `<div class="text-xs text-red-600">${emp.offDays - 4} unpaid offs</div>` : ''}
                </div>
            </td>
            <td>₹${emp.basic.toLocaleString('en-IN')}</td>
            <td>₹${emp.hra.toLocaleString('en-IN')}</td>
            <td>₹${emp.conveyance.toLocaleString('en-IN')}</td>
            <td>₹${emp.otherAllowances.toLocaleString('en-IN')}</td>
            <td>₹${emp.overtimeAmount.toLocaleString('en-IN')}</td>
            <td class="font-bold">₹${emp.grossSalary.toLocaleString('en-IN')}</td>
            <td>${emp.hasPF !== false ? '₹' + emp.pf.toLocaleString('en-IN') : '<span class="text-gray-400">-</span>'}</td>
            <td>${emp.hasESIC !== false ? '₹' + emp.esic.toLocaleString('en-IN') : '<span class="text-gray-400">-</span>'}</td>
            <td>${emp.hasPT !== false ? '₹' + emp.pt.toLocaleString('en-IN') : '<span class="text-gray-400">-</span>'}</td>
            <td>
                <div class="flex items-center gap-1">
                    <input type="number" class="advance-input flex-1 px-2 py-1 text-center border border-gray-300 rounded" value="${emp.advance}" min="0" onchange="updateAdvance('${emp.id}', this.value)" />
                    <button onclick="showAdvanceModal('${emp.id}')" class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs" title="Manage EMI">
                        <i class="fas fa-calculator"></i>
                    </button>
                </div>
            </td>
            <td class="font-bold">₹${emp.totalDeductions.toLocaleString('en-IN')}</td>
            <td class="font-bold text-green-600">₹${emp.netPay.toLocaleString('en-IN')}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Make functions available globally for browser use
window.processPayroll = processPayroll;
window.calculateEmployeePayroll = calculateEmployeePayroll;
window.updateAdvance = updateAdvance;
window.updatePayrollRow = updatePayrollRow;
window.displayPayroll = displayPayroll;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        processPayroll,
        calculateEmployeePayroll,
        updateAdvance,
        updatePayrollRow,
        displayPayroll
    };
}