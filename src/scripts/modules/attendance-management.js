/**
 * Attendance Management Module
 * Handles attendance tracking, marking, and monthly attendance generation
 */

// Attendance Management Functions
function displayAttendance() {
    const tbody = document.getElementById('attendanceTableBody');
    const thead = tbody.parentElement.querySelector('thead');
    tbody.innerHTML = '';
    
    // Set up event delegation for attendance buttons (only once)
    if (!tbody.hasAttribute('data-event-listener-added')) {
        tbody.addEventListener('click', function(e) {
            if (e.target.classList.contains('attendance-cell')) {
                e.preventDefault();
                e.stopPropagation();
                const empId = e.target.getAttribute('data-emp-id');
                const dayIndex = parseInt(e.target.getAttribute('data-day-index'));
                if (empId && !isNaN(dayIndex)) {
                    toggleAttendance(empId, dayIndex);
                }
            }
        });
        tbody.setAttribute('data-event-listener-added', 'true');
    }
    
    // Get the correct number of days in the month
    const year = parseInt(currentMonth.split('-')[0]);
    const month = parseInt(currentMonth.split('-')[1]);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Create the header row with day numbers
    thead.innerHTML = `
        <tr>
            <th class="sticky left-0 bg-gradient-to-r from-purple-600 to-blue-600 z-10">Employee</th>
            ${Array.from({length: daysInMonth}, (_, i) => 
                `<th class="min-w-[40px] text-center">${i + 1}</th>`
            ).join('')}
            <th class="sticky right-0 bg-gradient-to-r from-purple-600 to-blue-600 z-10">Total</th>
        </tr>
    `;
    
    employees.forEach(emp => {
        if (emp.status === 'Active') {
            const row = document.createElement('tr');
            row.setAttribute('data-employee-id', emp.id);
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors';
            
            // Employee name cell
            const nameCell = document.createElement('td');
            nameCell.className = 'font-semibold text-left sticky left-0 bg-white dark:bg-gray-700 z-10 border-r border-gray-300';
            nameCell.style.minWidth = '150px';
            nameCell.innerHTML = `
                <div class="flex flex-col">
                    <span class="font-bold">${emp.name}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">${emp.id} - ${emp.department}</span>
                </div>
            `;
            row.appendChild(nameCell);
            
            const monthAttendance = attendance[currentMonth]?.[emp.id] || [];
            
            // Count attendance types for consistent calculation
            let presentDays = 0;
            let presentWithOTDays = 0;
            let overtimeOnlyDays = 0;
            let absentDays = 0;
            let offDays = 0;
            
            // Create attendance cells for each day
            for (let day = 1; day <= daysInMonth; day++) {
                const status = monthAttendance[day - 1] || '';
                const cell = document.createElement('td');
                cell.className = 'p-1 text-center';
                
                const button = document.createElement('button');
                button.className = `attendance-cell ${status ? 'attendance-' + status : 'bg-gray-100 dark:bg-gray-600 text-gray-400'}`;
                button.textContent = status || '-';
                button.title = `Day ${day} - Click to change`;
                button.setAttribute('data-emp-id', emp.id);
                button.setAttribute('data-day-index', day - 1);
                button.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleAttendance(emp.id, day - 1);
                };
                
                // Count attendance types using same logic as payroll
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
                
                cell.appendChild(button);
                row.appendChild(cell);
            }
            
            // Calculate total working days using CORRECTED logic (same as payroll)
            const paidOffDays = Math.min(offDays, 4);
            const unusedPaidOffs = Math.max(0, 4 - offDays);
            const baseWorkingDays = presentDays + presentWithOTDays + paidOffDays + unusedPaidOffs;
            const totalOvertimeDays = overtimeOnlyDays + presentWithOTDays;
            const totalPresent = baseWorkingDays + totalOvertimeDays;
            
            // Count offs for warning
            const offCount = monthAttendance.filter(status => 
                status && (status.toString().toUpperCase() === 'OFF' || status.toString().toUpperCase() === 'O')
            ).length;
            
            // Total cell with off warning indicator
            const totalCell = document.createElement('td');
            totalCell.className = 'font-bold text-center sticky right-0 bg-white dark:bg-gray-700 z-10 border-l border-gray-300';
            if (offCount > 4) {
                totalCell.innerHTML = `
                    <div class="flex items-center justify-center gap-1">
                        <span>${totalPresent}</span>
                        <i class="fas fa-exclamation-triangle text-red-500 text-xs" title="${offCount} offs (exceeds 4 limit)"></i>
                    </div>
                `;
            } else {
                totalCell.textContent = totalPresent;
            }
            row.appendChild(totalCell);
            
            tbody.appendChild(row);
        }
    });
}

function toggleAttendance(empId, dayIndex) {
    console.log('toggleAttendance called:', empId, dayIndex);
    const statuses = ['P', 'A', 'Off', 'OT', 'P+OT'];
    
    // Ensure attendance structure exists
    if (!attendance[currentMonth]) {
        attendance[currentMonth] = {};
    }
    if (!attendance[currentMonth][empId]) {
        attendance[currentMonth][empId] = generateMonthlyAttendance();
    }
    
    const currentStatus = attendance[currentMonth][empId][dayIndex] || '';
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];
    
    // Check if employee is exceeding 4 offs
    if (newStatus === 'Off') {
        const monthAttendance = attendance[currentMonth][empId];
        const currentOffs = monthAttendance.filter(status => status === 'Off').length;
        const newOffCount = currentStatus === 'Off' ? currentOffs : currentOffs + 1;
        
        if (newOffCount > 4) {
            Swal.fire({
                icon: 'warning',
                title: 'Exceeded Off Limit!',
                html: `<div class="text-left">
                    <p class="mb-2"><strong>${employees.find(e => e.id === empId)?.name}</strong> is exceeding the maximum allowed offs.</p>
                    <p class="mb-2">Hospital policy allows <strong>maximum 4 offs per month</strong>.</p>
                    <p class="mb-2">Current offs: <strong>${currentOffs}</strong></p>
                    <p class="text-sm text-gray-600">Marking this as Off will make it ${newOffCount} offs.</p>
                </div>`,
                showCancelButton: true,
                confirmButtonText: 'Mark as Off anyway',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#ef4444'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Allow marking as off but show in red
                    attendance[currentMonth][empId][dayIndex] = newStatus;
                    console.log('Updated attendance (exceeded limit):', empId, dayIndex, newStatus);
                    updateAttendanceButton(empId, dayIndex, newStatus);
                    updateEmployeeTotal(empId);
                    saveToLocalStorage();
                    showQuickToast(`⚠️ ${employees.find(e => e.id === empId)?.name}: ${newOffCount} offs (exceeded limit)`);
                }
            });
            return;
        }
    }
    
    attendance[currentMonth][empId][dayIndex] = newStatus;
    console.log('Updated attendance:', empId, dayIndex, newStatus);
    
    // Provide visual feedback
    const employee = employees.find(emp => emp.id === empId);
    const statusNames = {
        'P': 'Present',
        'A': 'Absent', 
        'Off': 'Holiday',
        'OT': 'Overtime',
        'POT': 'Present + Overtime'
    };
    
    // Show a quick toast notification
    showQuickToast(`${employee?.name || empId}: Day ${dayIndex + 1} marked as ${statusNames[newStatus] || newStatus}`);
    
    // Update only the specific button instead of reloading entire table
    updateAttendanceButton(empId, dayIndex, newStatus);
    
    // Update the total for this employee
    updateEmployeeTotal(empId);
    
    saveToLocalStorage();
}

function updateAttendanceButton(empId, dayIndex, newStatus) {
    // Find the specific button and update it
    const button = document.querySelector(`button[data-emp-id="${empId}"][data-day-index="${dayIndex}"]`);
    if (button) {
        // Update button text
        button.textContent = newStatus || '-';
        
        // Update button classes
        button.className = `attendance-cell ${newStatus ? 'attendance-' + newStatus : 'bg-gray-100 dark:bg-gray-600 text-gray-400'}`;
    }
}

function updateEmployeeTotal(empId) {
    // Find the employee row and update the total
    const row = document.querySelector(`tr[data-employee-id="${empId}"]`);
    if (row && attendance[currentMonth] && attendance[currentMonth][empId]) {
        const monthAttendance = attendance[currentMonth][empId];
        
        // Count attendance types using same logic as payroll
        let presentDays = 0;
        let presentWithOTDays = 0;
        let overtimeOnlyDays = 0;
        let absentDays = 0;
        let offDays = 0;
        
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
        
        // Calculate total working days using CORRECTED logic (same as payroll)
        const paidOffDays = Math.min(offDays, 4);
        const unusedPaidOffs = Math.max(0, 4 - offDays);
        const baseWorkingDays = presentDays + presentWithOTDays + paidOffDays + unusedPaidOffs;
        const totalOvertimeDays = overtimeOnlyDays + presentWithOTDays;
        const totalPresent = baseWorkingDays + totalOvertimeDays;
        
        // Find and update the total cell
        const totalCell = row.querySelector('td:last-child');
        if (totalCell) {
            if (offDays > 4) {
                totalCell.innerHTML = `
                    <div class="flex items-center justify-center gap-1">
                        <span>${totalPresent}</span>
                        <i class="fas fa-exclamation-triangle text-red-500 text-xs" title="${offDays} offs (exceeds 4 limit)"></i>
                    </div>
                `;
            } else {
                totalCell.textContent = totalPresent;
            }
        }
    }
}

function showQuickToast(message) {
    // Create a quick toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Remove after 2 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

function generateMonthlyAttendance() {
    // Get the correct number of days in the month
    const year = parseInt(currentMonth.split('-')[0]);
    const month = parseInt(currentMonth.split('-')[1]);
    const days = new Date(year, month, 0).getDate();
    const monthAttendance = [];
    
    for (let day = 1; day <= days; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        
        if (dayOfWeek === 0) { // Sunday
            monthAttendance.push('Off');
        } else {
            const rand = Math.random();
            if (rand < 0.85) monthAttendance.push('P');
            else if (rand < 0.90) monthAttendance.push('A');
            else if (rand < 0.95) monthAttendance.push('OT');
            else monthAttendance.push('POT');
        }
    }
    
    return monthAttendance;
}

function bulkMarkAttendance(status) {
    Swal.fire({
        title: 'Mark All as ' + status + '?',
        text: "This will update all active employees' attendance for the current month.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, update all!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            const year = parseInt(currentMonth.split('-')[0]);
            const month = parseInt(currentMonth.split('-')[1]);
            const daysInMonth = new Date(year, month, 0).getDate();
            
            if (!attendance[currentMonth]) {
                attendance[currentMonth] = {};
            }
            
            employees.forEach(emp => {
                if (emp.status === 'Active') {
                    if (!attendance[currentMonth][emp.id]) {
                        attendance[currentMonth][emp.id] = [];
                    }
                    
                    // Fill entire month with the selected status
                    for (let day = 0; day < daysInMonth; day++) {
                        attendance[currentMonth][emp.id][day] = status;
                    }
                }
            });
            
            displayAttendance();
            saveToLocalStorage();
            
            Swal.fire({
                icon: 'success',
                title: 'Bulk Update Complete!',
                text: `All employees marked as ${status} for ${currentMonth}`,
                timer: 2000,
                showConfirmButton: false
            });
            
            addActivity(`Bulk marked all employees as ${status} for ${currentMonth}`);
        }
    });
}

function markTodayAttendance() {
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    const monthPrefix = currentDate.substring(0, 7);
    
    if (monthPrefix !== currentMonth) {
        Swal.fire({
            icon: 'warning',
            title: 'Different Month Selected',
            text: `Today is ${today.toLocaleDateString('en-IN')} but you have ${currentMonth} selected.`
        });
        return;
    }
    
    const dayOfMonth = today.getDate();
    const dayIndex = dayOfMonth - 1;
    
    Swal.fire({
        title: 'Mark Today\'s Attendance',
        text: `Mark attendance for ${today.toLocaleDateString('en-IN')} (Day ${dayOfMonth})`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Mark All Present',
        cancelButtonText: 'Cancel',
        showDenyButton: true,
        denyButtonText: 'Choose Status'
    }).then((result) => {
        if (result.isConfirmed) {
            markDayAttendance(dayIndex, 'P');
        } else if (result.isDenied) {
            showDayStatusSelector(dayIndex, dayOfMonth);
        }
    });
}

function markDayAttendance(dayIndex, status) {
    if (!attendance[currentMonth]) {
        attendance[currentMonth] = {};
    }
    
    employees.forEach(emp => {
        if (emp.status === 'Active') {
            if (!attendance[currentMonth][emp.id]) {
                attendance[currentMonth][emp.id] = generateMonthlyAttendance();
            }
            attendance[currentMonth][emp.id][dayIndex] = status;
        }
    });
    
    displayAttendance();
    saveToLocalStorage();
    
    Swal.fire({
        icon: 'success',
        title: 'Today\'s Attendance Marked!',
        text: `All employees marked as ${status}`,
        timer: 2000,
        showConfirmButton: false
    });
    
    addActivity(`Marked day ${dayIndex + 1} as ${status} for all employees`);
}

function showDayStatusSelector(dayIndex, dayOfMonth) {
    Swal.fire({
        title: `Choose Status for Day ${dayOfMonth}`,
        showCancelButton: true,
        showDenyButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Present',
        denyButtonText: 'Absent',
        cancelButtonText: 'Overtime',
        footer: '<button class="swal2-styled swal2-neutral" onclick="markDayAttendance(' + dayIndex + ', \'Off\')">Holiday</button>'
    }).then((result) => {
        if (result.isConfirmed) {
            markDayAttendance(dayIndex, 'P');
        } else if (result.isDenied) {
            markDayAttendance(dayIndex, 'A');
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            markDayAttendance(dayIndex, 'OT');
        }
    });
}

function searchAttendance() {
    const searchTerm = document.getElementById('attendanceSearch').value.toLowerCase();
    const attendanceRows = document.querySelectorAll('#attendanceTableBody tr');
    
    attendanceRows.forEach(row => {
        const employeeId = row.getAttribute('data-employee-id');
        const employee = employees.find(emp => emp.id === employeeId);
        
        if (employee) {
            const employeeName = employee.name.toLowerCase();
            const empId = employee.id.toLowerCase();
            const department = employee.department.toLowerCase();
            
            if (employeeName.includes(searchTerm) || 
                empId.includes(searchTerm) || 
                department.includes(searchTerm)) {
                row.style.display = '';
                row.style.backgroundColor = searchTerm ? 'rgba(59, 130, 246, 0.1)' : '';
                row.style.border = searchTerm ? '1px solid rgba(59, 130, 246, 0.3)' : '';
                // Ensure buttons remain clickable
                const buttons = row.querySelectorAll('.attendance-cell');
                buttons.forEach(btn => {
                    btn.style.pointerEvents = 'auto';
                    btn.style.cursor = 'pointer';
                });
            } else {
                row.style.display = 'none';
            }
        }
    });

    const visibleRows = Array.from(attendanceRows).filter(row => row.style.display !== 'none').length;
    showSearchResults(visibleRows, 'attendance');
}

function highlightEmployee() {
    const searchTerm = document.getElementById('attendanceSearch').value.toLowerCase();
    if (!searchTerm) {
        Swal.fire({
            icon: 'warning',
            title: 'No Search Term',
            text: 'Please enter an employee name, ID, or department to search.'
        });
        return;
    }

    const attendanceRows = document.querySelectorAll('#attendanceTableBody tr');
    let foundEmployee = null;

    attendanceRows.forEach(row => {
        const employeeId = row.getAttribute('data-employee-id');
        const employee = employees.find(emp => emp.id === employeeId);
        
        if (employee && (employee.name.toLowerCase().includes(searchTerm) || 
            employee.id.toLowerCase().includes(searchTerm) || 
            employee.department.toLowerCase().includes(searchTerm))) {
            
            row.style.backgroundColor = '#fef3c7';
            row.style.border = '3px solid #f59e0b';
            row.style.borderRadius = '8px';
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            foundEmployee = employee;
        } else {
            row.style.backgroundColor = '';
            row.style.border = '';
            row.style.borderRadius = '';
        }
    });

    if (foundEmployee) {
        const monthAttendance = attendance[currentMonth]?.[foundEmployee.id] || [];
        const presentDays = monthAttendance.filter(s => s === 'P' || s === 'POT').length;
        const absentDays = monthAttendance.filter(s => s === 'A').length;
        const overtimeDays = monthAttendance.filter(s => s === 'OT' || s === 'POT').length;

        Swal.fire({
            icon: 'success',
            title: 'Employee Found & Highlighted!',
            html: `
                <div class="text-left">
                    <p><strong>Name:</strong> ${foundEmployee.name}</p>
                    <p><strong>ID:</strong> ${foundEmployee.id}</p>
                    <p><strong>Department:</strong> ${foundEmployee.department}</p>
                    <hr class="my-2">
                    <p><strong>This Month:</strong></p>
                    <p>Present: ${presentDays} days</p>
                    <p>Absent: ${absentDays} days</p>
                    <p>Overtime: ${overtimeDays} days</p>
                </div>
            `
        });
    }
}

// Make functions available globally for browser use
window.displayAttendance = displayAttendance;
window.toggleAttendance = toggleAttendance;
window.generateMonthlyAttendance = generateMonthlyAttendance;
window.bulkMarkAttendance = bulkMarkAttendance;
window.markTodayAttendance = markTodayAttendance;
window.markDayAttendance = markDayAttendance;
window.showDayStatusSelector = showDayStatusSelector;
window.searchAttendance = searchAttendance;
window.highlightEmployee = highlightEmployee;
window.showQuickToast = showQuickToast;
window.updateAttendanceButton = updateAttendanceButton;
window.updateEmployeeTotal = updateEmployeeTotal;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        displayAttendance,
        toggleAttendance,
        generateMonthlyAttendance,
        bulkMarkAttendance,
        markTodayAttendance,
        markDayAttendance,
        showDayStatusSelector,
        searchAttendance,
        highlightEmployee
    };
}