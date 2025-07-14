/**
 * Doctors Management System - Simplified and Working Version
 * Handles doctor data, shifts, attendance, and hourly payroll calculations
 */

// Global doctors data
let doctors = [];
let doctorAttendance = {};
let doctorPayroll = {};

// Make doctors data globally accessible
window.doctors = doctors;
window.doctorAttendance = doctorAttendance;
window.doctorPayroll = doctorPayroll;

// Shift types and their configurations
const SHIFT_TYPES = {
    'morning': { name: 'Morning (9AM-3PM)', hours: 6 },
    'evening': { name: 'Evening (3PM-9PM)', hours: 6 },
    'night': { name: 'Night 12hr (9PM-9AM)', hours: 12 },
    'full24': { name: 'Full 24hr', hours: 24 },
    'custom': { name: 'Custom Shift', hours: 0 } // Hours will be stored separately
};

// Specializations and their base hourly rates
const SPECIALIZATIONS = {
    'pediatrics': { name: 'Pediatrics', baseRate: 2500 },
    'cardiology': { name: 'Cardiology', baseRate: 3500 },
    'neurology': { name: 'Neurology', baseRate: 3000 },
    'orthopedics': { name: 'Orthopedics', baseRate: 2800 },
    'oncology': { name: 'Oncology', baseRate: 3200 },
    'dermatology': { name: 'Dermatology', baseRate: 2200 },
    'psychiatry': { name: 'Psychiatry', baseRate: 2400 },
    'radiology': { name: 'Radiology', baseRate: 2600 },
    'anesthesiology': { name: 'Anesthesiology', baseRate: 2900 },
    'emergency': { name: 'Emergency Medicine', baseRate: 2700 },
    'general': { name: 'General Medicine', baseRate: 2000 }
};

// Make SPECIALIZATIONS and SHIFT_TYPES globally accessible
window.SPECIALIZATIONS = SPECIALIZATIONS;
window.SHIFT_TYPES = SHIFT_TYPES;

// Initialize doctors management
function initializeDoctorsManagement() {
    console.log('Initializing doctors management...');
    
    // Load data from localStorage
    loadDoctorsData();
    
    // Generate sample doctors if none exist
    if (doctors.length === 0) {
        console.log('No doctors found, generating sample data...');
        generateSampleDoctors();
        saveDoctorsData();
    }
    
    // Initialize attendance for current month
    const currentMonthKey = currentMonth || '2025-06';
    if (!doctorAttendance[currentMonthKey]) {
        doctorAttendance[currentMonthKey] = {};
        doctors.forEach(doctor => {
            doctorAttendance[currentMonthKey][doctor.id] = {};
        });
    }
    
    console.log('Doctors loaded:', doctors.length);
    populateDoctorsTable();
}

// Generate sample doctors
function generateSampleDoctors() {
    doctors = [
        {
            id: 'DOC001',
            name: 'Dr. Rajesh Kumar',
            specialization: 'pediatrics',
            department: 'Pediatrics',
            registrationNo: 'MH123456',
            experience: 15,
            hourlyRate: 2800,
            nightRate: 4200,
            consultationFee: 800,
            status: 'Active',
            qualification: 'MBBS, MD (Pediatrics)',
            phone: '9876543210',
            email: 'rajesh.kumar@hospital.com',
            bankAccount: '123456789012345',
            ifsc: 'SBIN0001234',
            bankName: 'State Bank of India',
            upiId: 'rajesh.kumar@paytm'
        },
        {
            id: 'DOC002',
            name: 'Dr. Priya Sharma',
            specialization: 'cardiology',
            department: 'Cardiology',
            registrationNo: 'MH654321',
            experience: 12,
            hourlyRate: 3800,
            nightRate: 5700,
            consultationFee: 1200,
            status: 'Active',
            qualification: 'MBBS, DM (Cardiology)',
            phone: '9876543211',
            email: 'priya.sharma@hospital.com',
            bankAccount: '234567890123456',
            ifsc: 'HDFC0002345',
            bankName: 'HDFC Bank',
            upiId: 'priya.sharma@phonepe'
        },
        {
            id: 'DOC003',
            name: 'Dr. Amit Patel',
            specialization: 'neurology',
            department: 'Neurology',
            registrationNo: 'MH789012',
            experience: 10,
            hourlyRate: 3200,
            nightRate: 4800,
            consultationFee: 1000,
            status: 'Active',
            qualification: 'MBBS, DM (Neurology)',
            phone: '9876543212',
            email: 'amit.patel@hospital.com',
            bankAccount: '345678901234567',
            ifsc: 'ICIC0003456',
            bankName: 'ICICI Bank',
            upiId: 'amit.patel@gpay'
        },
        {
            id: 'DOC004',
            name: 'Dr. Sunita Reddy',
            specialization: 'orthopedics',
            department: 'Orthopedics',
            registrationNo: 'MH345678',
            experience: 8,
            hourlyRate: 3000,
            nightRate: 4500,
            consultationFee: 900,
            status: 'Active',
            qualification: 'MBBS, MS (Orthopedics)',
            phone: '9876543213',
            email: 'sunita.reddy@hospital.com',
            bankAccount: '456789012345678',
            ifsc: 'AXIS0004567',
            bankName: 'Axis Bank',
            upiId: 'sunita.reddy@amazonpay'
        },
        {
            id: 'DOC005',
            name: 'Dr. Vikram Singh',
            specialization: 'emergency',
            department: 'Emergency',
            registrationNo: 'MH901234',
            experience: 7,
            hourlyRate: 2900,
            nightRate: 4350,
            consultationFee: 700,
            status: 'Active',
            qualification: 'MBBS, MD (Emergency Medicine)',
            phone: '9876543214',
            email: 'vikram.singh@hospital.com',
            bankAccount: '567890123456789',
            ifsc: 'KOTAK0005678',
            bankName: 'Kotak Mahindra Bank',
            upiId: 'vikram.singh@paytm'
        }
    ];
    
    // Update global reference
    window.doctors = doctors;
}

// Populate doctors table
function populateDoctorsTable() {
    const tableBody = document.getElementById('doctorTableBody');
    if (!tableBody) {
        console.error('doctorTableBody element not found');
        return;
    }
    
    console.log('Populating doctors table with', doctors.length, 'doctors');
    tableBody.innerHTML = '';
    
    doctors.forEach(doctor => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-600';
        row.innerHTML = `
            <td class="px-4 py-2 font-mono">${doctor.id}</td>
            <td class="px-4 py-2 font-semibold">${doctor.name}</td>
            <td class="px-4 py-2">${SPECIALIZATIONS[doctor.specialization]?.name || doctor.specialization}</td>
            <td class="px-4 py-2">${doctor.department}</td>
            <td class="px-4 py-2 font-mono">${doctor.registrationNo}</td>
            <td class="px-4 py-2">${doctor.experience} years</td>
            <td class="px-4 py-2 text-right font-semibold">₹${doctor.hourlyRate.toLocaleString('en-IN')}/hr</td>
            <td class="px-4 py-2 text-right font-semibold">₹${(doctor.nightRate || (doctor.hourlyRate * 1.5)).toLocaleString('en-IN')}/hr</td>
            <td class="px-4 py-2 text-right font-semibold">
                ${doctor.professionalFee ? `₹${doctor.professionalFee.toLocaleString('en-IN')}/month` : '<span class="text-gray-400">-</span>'}
            </td>
            <td class="px-4 py-2">
                <span class="px-2 py-1 rounded text-xs font-semibold ${doctor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${doctor.status}</span>
            </td>
            <td class="px-4 py-2">
                <div class="flex space-x-2">
                    <button onclick="editDoctor('${doctor.id}')" class="text-blue-600 hover:text-blue-800" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="viewDoctorAttendance('${doctor.id}')" class="text-green-600 hover:text-green-800" title="Attendance">
                        <i class="fas fa-calendar-check"></i>
                    </button>
                    <button onclick="viewDoctorPayroll('${doctor.id}')" class="text-purple-600 hover:text-purple-800" title="Payroll">
                        <i class="fas fa-money-bill-wave"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    console.log('Doctors table populated successfully');
}

// View doctor attendance
function viewDoctorAttendance(doctorId) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) {
        alert('Doctor not found!');
        return;
    }
    
    const currentMonthKey = currentMonth || '2025-06';
    const year = parseInt(currentMonthKey.split('-')[0]);
    const month = parseInt(currentMonthKey.split('-')[1]);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Initialize attendance if not exists
    if (!doctorAttendance[currentMonthKey]) {
        doctorAttendance[currentMonthKey] = {};
    }
    if (!doctorAttendance[currentMonthKey][doctorId]) {
        doctorAttendance[currentMonthKey][doctorId] = {};
        // Initialize all days as Present with Morning shift by default
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month-1, day);
            const dayName = date.getDay(); // 0 = Sunday, 6 = Saturday
            
            // Set default status - Sunday as Off, others as Present
            if (dayName === 0) {
                doctorAttendance[currentMonthKey][doctorId][day] = { 
                    status: 'Off', 
                    shift: '', 
                    nightHours: 0 
                };
            } else {
                doctorAttendance[currentMonthKey][doctorId][day] = { 
                    status: 'Present', 
                    shift: 'morning', 
                    nightHours: 0 
                };
            }
        }
        saveDoctorsData();
    }
    
    const attendance = doctorAttendance[currentMonthKey][doctorId];
    
    let attendanceHTML = `
        <div style="max-height: 70vh; overflow-y: auto;">
            <h3 class="text-xl font-bold mb-4">${doctor.name} - Attendance for ${currentMonthKey}</h3>
            
            <div class="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4 text-sm">
                <i class="fas fa-info-circle text-yellow-600"></i>
                <span class="text-yellow-800">
                    <strong>Note:</strong> Doctors can work multiple shifts. For example: Morning (6hr) + Night (12hr) = 18hr total. 
                    Use nightHours hours for additional time beyond the selected shift.
                </span>
            </div>
            
            <!-- Bulk Actions -->
            <div class="bg-blue-50 p-4 rounded mb-4">
                <h4 class="font-semibold mb-2">Quick Actions:</h4>
                <div class="flex flex-wrap gap-2">
                    <button onclick="bulkSetAttendance('${doctorId}', 'Present', 'morning')" class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                        All Morning (9AM-3PM)
                    </button>
                    <button onclick="bulkSetAttendance('${doctorId}', 'Present', 'evening')" class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                        All Evening (3PM-9PM)
                    </button>
                    <button onclick="bulkSetAttendance('${doctorId}', 'Present', 'night')" class="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600">
                        All Night (9PM-9AM)
                    </button>
                    <button onclick="bulkSetAttendance('${doctorId}', 'Off', '')" class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                        Mark All Off
                    </button>
                    <button onclick="setSundaysOff('${doctorId}')" class="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
                        Sundays Off Only
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-1 gap-3">
    `;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayData = attendance[day] || { status: 'Absent', shift: '', nightHours: 0 };
        
        attendanceHTML += `
            <div class="border rounded p-3 bg-gray-50">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold">Day ${day}</span>
                    <span class="text-sm text-gray-600">${new Date(year, month-1, day).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                </div>
                <div class="grid grid-cols-3 gap-2">
                    <div>
                        <label class="block text-xs font-medium">Status:</label>
                        <select onchange="updateAttendance('${doctorId}', ${day}, 'status', this.value)" class="w-full text-sm border rounded px-2 py-1">
                            <option value="Present" ${dayData.status === 'Present' ? 'selected' : ''}>Present</option>
                            <option value="Absent" ${dayData.status === 'Absent' ? 'selected' : ''}>Absent</option>
                            <option value="Off" ${dayData.status === 'Off' ? 'selected' : ''}>Off</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium">Shift:</label>
                        <select id="shift-${day}" onchange="handleShiftChange('${doctorId}', ${day}, this.value)" class="w-full text-sm border rounded px-2 py-1" ${dayData.status !== 'Present' ? 'disabled' : ''}>
                            <option value="">Select Shift</option>
                            ${Object.entries(SHIFT_TYPES).map(([key, shift]) => 
                                `<option value="${key}" ${dayData.shift === key ? 'selected' : ''}>${shift.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-medium">Night Hours:</label>
                        <input type="number" min="0" max="12" value="${dayData.nightHours || 0}" 
                               onchange="updateAttendance('${doctorId}', ${day}, 'nightHours', this.value)"
                               class="w-full text-sm border rounded px-2 py-1" ${dayData.status !== 'Present' ? 'disabled' : ''}>
                    </div>
                </div>
                ${dayData.shift === 'custom' ? `
                <div class="mt-2">
                    <label class="block text-xs font-medium">Custom Hours:</label>
                    <input type="number" min="1" max="24" value="${dayData.customHours || 8}" 
                           onchange="updateAttendance('${doctorId}', ${day}, 'customHours', this.value)"
                           class="w-full text-sm border rounded px-2 py-1">
                </div>
                ` : ''}
                <div class="mt-2 text-xs text-gray-600">
                    Total Hours: ${dayData.status === 'Present' ? ((dayData.shift === 'custom' ? (parseInt(dayData.customHours) || 0) : (SHIFT_TYPES[dayData.shift]?.hours || 0)) + (parseInt(dayData.nightHours) || 0)) : 0}
                </div>
            </div>
        `;
    }
    
    attendanceHTML += `
            </div>
            <div class="mt-4 flex justify-end space-x-2">
                <button onclick="closeAttendanceModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Close</button>
                <button onclick="generateAttendanceReport('${doctorId}')" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Generate Report</button>
            </div>
        </div>
    `;
    
    showModal('Doctor Attendance', attendanceHTML);
}

// Handle shift change
function handleShiftChange(doctorId, day, shiftValue) {
    updateAttendance(doctorId, day, 'shift', shiftValue);
    
    // If custom shift is selected, set default custom hours
    if (shiftValue === 'custom') {
        const currentMonthKey = currentMonth || '2025-06';
        if (!doctorAttendance[currentMonthKey][doctorId][day].customHours) {
            doctorAttendance[currentMonthKey][doctorId][day].customHours = 8;
        }
    }
    
    // Refresh the modal to show/hide custom hours input
    setTimeout(() => viewDoctorAttendance(doctorId), 100);
}

// Update attendance
function updateAttendance(doctorId, day, field, value) {
    const currentMonthKey = currentMonth || '2025-06';
    
    if (!doctorAttendance[currentMonthKey]) {
        doctorAttendance[currentMonthKey] = {};
    }
    if (!doctorAttendance[currentMonthKey][doctorId]) {
        doctorAttendance[currentMonthKey][doctorId] = {};
    }
    if (!doctorAttendance[currentMonthKey][doctorId][day]) {
        doctorAttendance[currentMonthKey][doctorId][day] = { status: 'Absent', shift: '', nightHours: 0 };
    }
    
    // Handle numeric values
    if (field === 'nightHours' || field === 'customHours') {
        value = parseInt(value) || 0;
    }
    
    doctorAttendance[currentMonthKey][doctorId][day][field] = value;
    
    // Reset shift and nightHours if status is not Present
    if (field === 'status' && value !== 'Present') {
        doctorAttendance[currentMonthKey][doctorId][day].shift = '';
        doctorAttendance[currentMonthKey][doctorId][day].nightHours = 0;
        doctorAttendance[currentMonthKey][doctorId][day].customHours = 0;
    }
    
    saveDoctorsData();
    
    // Only refresh for status changes to avoid constant refreshes
    if (field === 'status') {
        setTimeout(() => viewDoctorAttendance(doctorId), 100);
    }
}

// View doctor payroll
function viewDoctorPayroll(doctorId) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) {
        alert('Doctor not found!');
        return;
    }
    
    const currentMonthKey = currentMonth || '2025-06';
    const attendance = doctorAttendance[currentMonthKey]?.[doctorId] || {};
    
    let totalHours = 0;
    let regularHours = 0;
    let nightHours = 0;
    let workingDays = 0;
    
    Object.values(attendance).forEach(dayData => {
        if (dayData.status === 'Present' && dayData.shift) {
            workingDays++;
            let shiftHours = 0;
            
            // Handle custom shift hours
            if (dayData.shift === 'custom') {
                shiftHours = parseInt(dayData.customHours) || 8;
            } else {
                shiftHours = SHIFT_TYPES[dayData.shift]?.hours || 0;
            }
            
            const dayNightHours = parseInt(dayData.nightHours) || 0;
            
            regularHours += shiftHours;
            nightHours += dayNightHours;
            totalHours += shiftHours + dayNightHours;
        }
    });
    
    const regularPay = regularHours * doctor.hourlyRate;
    const nightHoursPay = nightHours * (doctor.nightRate || doctor.hourlyRate * 1.5);
    const professionalFee = doctor.professionalFee || 0;
    const grossPay = regularPay + nightHoursPay + professionalFee;
    const tdsDeduction = grossPay * 0.10; // 10% TDS
    const netPay = grossPay - tdsDeduction;
    
    // Get detailed day-by-day breakdown
    let dayByDayHTML = '';
    const workingDaysDetails = [];
    
    Object.entries(attendance).forEach(([day, dayData]) => {
        if (dayData.status === 'Present' && dayData.shift) {
            let shiftHours = 0;
            let shiftName = '';
            
            // Handle custom shift
            if (dayData.shift === 'custom') {
                shiftHours = parseInt(dayData.customHours) || 8;
                shiftName = `Custom (${shiftHours}hr)`;
            } else {
                shiftHours = SHIFT_TYPES[dayData.shift]?.hours || 0;
                shiftName = SHIFT_TYPES[dayData.shift]?.name || dayData.shift;
            }
            
            const nightHours = parseInt(dayData.nightHours) || 0;
            const totalDayHours = shiftHours + nightHours;
            const dayPay = (shiftHours * doctor.hourlyRate) + (nightHours * (doctor.nightRate || doctor.hourlyRate * 1.5));
            
            workingDaysDetails.push({
                day: parseInt(day),
                shift: shiftName,
                shiftHours,
                nightHours,
                totalDayHours,
                dayPay
            });
        }
    });
    
    // Sort by day
    workingDaysDetails.sort((a, b) => a.day - b.day);
    
    const payrollHTML = `
        <div class="space-y-6">
            <div class="text-center border-b pb-4 mb-6">
                <h3 class="text-2xl font-bold">${doctor.name}</h3>
                <p class="text-gray-600">Payroll Summary for ${currentMonthKey}</p>
            </div>
            
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                    <h4 class="font-bold text-lg mb-2">Doctor Info</h4>
                    <p><strong>ID:</strong> ${doctor.id}</p>
                    <p><strong>Specialization:</strong> ${SPECIALIZATIONS[doctor.specialization]?.name}</p>
                    <p><strong>Hourly Rate:</strong> ₹${doctor.hourlyRate.toLocaleString('en-IN')}/hr</p>
                </div>
                
                <div class="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                    <h4 class="font-bold text-lg mb-2">Attendance</h4>
                    <p><strong>Working Days:</strong> ${workingDays}</p>
                    <p><strong>Regular Hours:</strong> ${regularHours}</p>
                    <p><strong>Night Hours:</strong> ${nightHours}</p>
                    <p><strong>Total Hours:</strong> ${totalHours}</p>
                </div>
            </div>
            
            <!-- Payment Summary -->
            <div class="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg mb-6">
                <h4 class="font-bold text-xl mb-4 text-center">Payment Breakdown</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p class="text-lg"><strong>Regular Pay:</strong></p>
                        <p class="text-2xl font-bold">₹${regularPay.toLocaleString('en-IN')}</p>
                        <p class="text-sm opacity-90">${regularHours} hrs × ₹${doctor.hourlyRate}</p>
                    </div>
                    <div>
                        <p class="text-lg"><strong>Night Hours Pay:</strong></p>
                        <p class="text-2xl font-bold">₹${nightHoursPay.toLocaleString('en-IN')}</p>
                        <p class="text-sm opacity-90">${nightHours} hrs × ₹${doctor.nightRate || (doctor.hourlyRate * 1.5)}</p>
                    </div>
                    ${professionalFee > 0 ? `
                    <div>
                        <p class="text-lg"><strong>Professional Fee:</strong></p>
                        <p class="text-2xl font-bold">₹${professionalFee.toLocaleString('en-IN')}</p>
                        <p class="text-sm opacity-90">Fixed monthly fee</p>
                    </div>
                    ` : ''}
                </div>
                <hr class="my-4 border-purple-300">
                <div class="text-center">
                    <p class="text-lg"><strong>Gross Pay:</strong> ₹${grossPay.toLocaleString('en-IN')}</p>
                    <p class="text-lg"><strong>TDS (10%):</strong> -₹${tdsDeduction.toLocaleString('en-IN')}</p>
                    <hr class="my-2 border-purple-300">
                    <p class="text-3xl font-bold"><strong>Net Pay: ₹${netPay.toLocaleString('en-IN')}</strong></p>
                </div>
            </div>
            
            <!-- Day-by-Day Breakdown -->
            ${workingDaysDetails.length > 0 ? `
            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <h4 class="font-bold text-lg mb-4">Day-by-Day Breakdown</h4>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b">
                                <th class="text-left p-2">Day</th>
                                <th class="text-left p-2">Shift</th>
                                <th class="text-center p-2">Shift Hrs</th>
                                <th class="text-center p-2">Night Hrs</th>
                                <th class="text-center p-2">Total Hrs</th>
                                <th class="text-right p-2">Day Pay</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${workingDaysDetails.map(detail => `
                                <tr class="border-b hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <td class="p-2 font-semibold">${detail.day}</td>
                                    <td class="p-2">${detail.shift}</td>
                                    <td class="p-2 text-center">${detail.shiftHours}</td>
                                    <td class="p-2 text-center">${detail.nightHours}</td>
                                    <td class="p-2 text-center font-semibold">${detail.totalDayHours}</td>
                                    <td class="p-2 text-right font-semibold">₹${detail.dayPay.toLocaleString('en-IN')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ` : ''}
            
            <!-- Action Buttons -->
            <div class="border-t pt-6 mt-6 flex justify-center space-x-4">
                <button onclick="closePayrollModal()" class="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold text-lg">
                    <i class="fas fa-times mr-2"></i>Close
                </button>
                <button onclick="generateDoctorPayslipFromModal('${doctorId}')" class="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-lg">
                    <i class="fas fa-file-pdf mr-2"></i>Download Payslip
                </button>
            </div>
        </div>
    `;
    
    showModal('Doctor Payroll', payrollHTML);
}

// Show modal
function showModal(title, content) {
    // Close existing modal if any
    closeDoctorModal();
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.id = 'doctorModal';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-full overflow-hidden flex flex-col">
            <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                <h2 class="text-xl font-bold">${title}</h2>
                <button onclick="closeDoctorModal()" class="text-gray-500 hover:text-gray-700 text-2xl" title="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto p-6">
                ${content}
            </div>
        </div>
    `;
    
    // Add click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeDoctorModal();
        }
    });
    
    document.body.appendChild(modal);
    
    // Add ESC key listener
    document.addEventListener('keydown', handleEscapeKey);
}

// Handle ESC key
function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeDoctorModal();
    }
}

// Close modal functions
function closeDoctorModal() {
    const modal = document.getElementById('doctorModal');
    if (modal) {
        modal.remove();
    }
    // Remove ESC key listener
    document.removeEventListener('keydown', handleEscapeKey);
}

function closeAttendanceModal() {
    closeDoctorModal();
}

function closePayrollModal() {
    closeDoctorModal();
}

// Bulk attendance functions
function bulkSetAttendance(doctorId, status, shift) {
    const currentMonthKey = currentMonth || '2025-06';
    const year = parseInt(currentMonthKey.split('-')[0]);
    const month = parseInt(currentMonthKey.split('-')[1]);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    if (!doctorAttendance[currentMonthKey]) {
        doctorAttendance[currentMonthKey] = {};
    }
    if (!doctorAttendance[currentMonthKey][doctorId]) {
        doctorAttendance[currentMonthKey][doctorId] = {};
    }
    
    // Set all days to the specified status and shift
    for (let day = 1; day <= daysInMonth; day++) {
        doctorAttendance[currentMonthKey][doctorId][day] = {
            status: status,
            shift: status === 'Present' ? shift : '',
            nightHours: 0
        };
    }
    
    saveDoctorsData();
    
    // Refresh the modal
    setTimeout(() => viewDoctorAttendance(doctorId), 100);
}

function setSundaysOff(doctorId) {
    const currentMonthKey = currentMonth || '2025-06';
    const year = parseInt(currentMonthKey.split('-')[0]);
    const month = parseInt(currentMonthKey.split('-')[1]);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    if (!doctorAttendance[currentMonthKey]) {
        doctorAttendance[currentMonthKey] = {};
    }
    if (!doctorAttendance[currentMonthKey][doctorId]) {
        doctorAttendance[currentMonthKey][doctorId] = {};
    }
    
    // Set all days as Present with Morning shift, except Sundays
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month-1, day);
        const dayName = date.getDay(); // 0 = Sunday
        
        if (dayName === 0) {
            // Sunday - set as Off
            doctorAttendance[currentMonthKey][doctorId][day] = {
                status: 'Off',
                shift: '',
                nightHours: 0
            };
        } else {
            // Other days - set as Present with Morning shift
            doctorAttendance[currentMonthKey][doctorId][day] = {
                status: 'Present',
                shift: 'morning',
                nightHours: 0
            };
        }
    }
    
    saveDoctorsData();
    
    // Refresh the modal
    setTimeout(() => viewDoctorAttendance(doctorId), 100);
}

// Save and load data
function saveDoctorsData() {
    try {
        localStorage.setItem('doctors', JSON.stringify(doctors));
        localStorage.setItem('doctorAttendance', JSON.stringify(doctorAttendance));
        localStorage.setItem('doctorPayroll', JSON.stringify(doctorPayroll));
    } catch (error) {
        console.error('Failed to save doctors data:', error);
    }
}

function loadDoctorsData() {
    try {
        const savedDoctors = localStorage.getItem('doctors');
        const savedAttendance = localStorage.getItem('doctorAttendance');
        const savedPayroll = localStorage.getItem('doctorPayroll');
        
        if (savedDoctors) {
            doctors = JSON.parse(savedDoctors);
            window.doctors = doctors;
        }
        if (savedAttendance) {
            doctorAttendance = JSON.parse(savedAttendance);
            window.doctorAttendance = doctorAttendance;
        }
        if (savedPayroll) {
            doctorPayroll = JSON.parse(savedPayroll);
            window.doctorPayroll = doctorPayroll;
        }
    } catch (error) {
        console.error('Failed to load doctors data:', error);
        doctors = [];
        doctorAttendance = {};
        doctorPayroll = {};
    }
}

// Search doctors
function searchDoctors() {
    populateDoctorsTable();
}

// Placeholder functions
function editDoctor(doctorId) {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) {
        alert('Doctor not found!');
        return;
    }
    
    const modalHTML = `
        <div style="max-height: 80vh; overflow-y: auto;">
            <h3 class="text-xl font-bold mb-4">Edit Doctor - ${doctor.name}</h3>
            <form id="editDoctorForm" onsubmit="updateDoctor(event, '${doctorId}')">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Required Fields -->
                    <div class="md:col-span-2 bg-blue-50 p-3 rounded mb-4">
                        <h4 class="font-semibold text-blue-800 mb-2">Required Information</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Doctor ID *</label>
                                <input type="text" name="id" required readonly value="${doctor.id}" class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed">
                                <p class="text-xs text-gray-500 mt-1">Doctor ID cannot be changed</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Doctor Name *</label>
                                <input type="text" name="name" required value="${doctor.name}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Professional Information -->
                    <div class="md:col-span-2 bg-green-50 p-3 rounded mb-4">
                        <h4 class="font-semibold text-green-800 mb-2">Professional Information (Optional)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                <select name="specialization" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                    <option value="">Select Specialization</option>
                                    ${Object.entries(SPECIALIZATIONS).map(([key, spec]) => 
                                        `<option value="${key}" ${doctor.specialization === key ? 'selected' : ''}>${spec.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input type="text" name="department" value="${doctor.department || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                                <input type="text" name="registrationNo" value="${doctor.registrationNo || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                <input type="number" name="experience" min="0" max="50" value="${doctor.experience || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                                <input type="text" name="qualification" value="${doctor.qualification || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                    <option value="Active" ${doctor.status === 'Active' ? 'selected' : ''}>Active</option>
                                    <option value="Inactive" ${doctor.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Financial Information -->
                    <div class="md:col-span-2 bg-yellow-50 p-3 rounded mb-4">
                        <h4 class="font-semibold text-yellow-800 mb-2">Financial Information (Optional)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
                                <input type="number" name="hourlyRate" min="0" step="100" value="${doctor.hourlyRate || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Night Rate (₹)</label>
                                <input type="number" name="nightRate" min="0" step="100" value="${doctor.nightRate || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
                                <input type="number" name="consultationFee" min="0" step="50" value="${doctor.consultationFee || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Professional Fee (₹)</label>
                                <input type="number" name="professionalFee" min="0" step="1000" value="${doctor.professionalFee || 0}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                <p class="text-xs text-gray-600 mt-1">Fixed monthly fee for specialized services</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Contact Information -->
                    <div class="md:col-span-2 bg-purple-50 p-3 rounded mb-4">
                        <h4 class="font-semibold text-purple-800 mb-2">Contact Information (Optional)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input type="tel" name="phone" value="${doctor.phone || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" value="${doctor.email || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Payment Details -->
                    <div class="md:col-span-2 bg-orange-50 p-3 rounded mb-4">
                        <h4 class="font-semibold text-orange-800 mb-2">Payment Details (Optional)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                                <input type="text" name="bankAccount" value="${doctor.bankAccount || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                                <input type="text" name="ifsc" value="${doctor.ifsc || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input type="text" name="bankName" value="${doctor.bankName || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                                <input type="text" name="upiId" value="${doctor.upiId || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" onclick="closeDoctorModal()" class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                        <i class="fas fa-save mr-2"></i>Update Doctor
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal('Edit Doctor', modalHTML);
}

// Update doctor function
function updateDoctor(event, doctorId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const doctorData = {};
    
    // Get form data
    for (let [key, value] of formData.entries()) {
        if (value.trim() !== '') {
            doctorData[key] = value.trim();
        }
    }
    
    // Find doctor index
    const doctorIndex = doctors.findIndex(d => d.id === doctorId);
    if (doctorIndex === -1) {
        alert('Doctor not found!');
        return;
    }
    
    // Validate required fields
    if (!doctorData.name) {
        alert('Doctor Name is required.');
        return;
    }
    
    // Update doctor data
    const currentDoctor = doctors[doctorIndex];
    doctors[doctorIndex] = {
        ...currentDoctor,
        name: doctorData.name,
        specialization: doctorData.specialization || currentDoctor.specialization,
        department: doctorData.department || currentDoctor.department,
        registrationNo: doctorData.registrationNo || currentDoctor.registrationNo,
        experience: parseInt(doctorData.experience) || currentDoctor.experience,
        hourlyRate: parseInt(doctorData.hourlyRate) || currentDoctor.hourlyRate,
        nightRate: parseInt(doctorData.nightRate) || currentDoctor.nightRate,
        consultationFee: parseInt(doctorData.consultationFee) || currentDoctor.consultationFee,
        professionalFee: parseInt(doctorData.professionalFee) || currentDoctor.professionalFee || 0,
        status: doctorData.status || currentDoctor.status,
        qualification: doctorData.qualification || currentDoctor.qualification,
        phone: doctorData.phone || currentDoctor.phone,
        email: doctorData.email || currentDoctor.email,
        bankAccount: doctorData.bankAccount || currentDoctor.bankAccount,
        ifsc: doctorData.ifsc || currentDoctor.ifsc,
        bankName: doctorData.bankName || currentDoctor.bankName,
        upiId: doctorData.upiId || currentDoctor.upiId
    };
    
    // Save data
    saveDoctorsData();
    
    // Refresh table
    populateDoctorsTable();
    
    // Close modal
    closeDoctorModal();
    
    // Show success message
    alert(`Doctor ${doctorData.name} updated successfully!`);
    addActivity(`Updated doctor: ${doctorData.name} (${doctorId})`);
}

function showAddDoctorModal() {
    const modalHTML = `
        <div style="max-height: 80vh; overflow-y: auto;">
            <h3 class="text-xl font-bold mb-4">Add New Doctor</h3>
            <form id="addDoctorForm" onsubmit="addDoctor(event)">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Required Fields -->
                    <div class="md:col-span-2 bg-blue-50 p-3 rounded mb-4">
                        <h4 class="font-semibold text-blue-800 mb-2">Required Information</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Doctor ID *</label>
                                <input type="text" name="id" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., DOC006">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Doctor Name *</label>
                                <input type="text" name="name" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., Dr. John Doe">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Professional Information -->
                    <div class="md:col-span-2 bg-green-50 p-3 rounded mb-4">
                        <h4 class="font-semibold text-green-800 mb-2">Professional Information (Optional)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                <select name="specialization" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                    <option value="">Select Specialization</option>
                                    ${Object.entries(SPECIALIZATIONS).map(([key, spec]) => 
                                        `<option value="${key}">${spec.name}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input type="text" name="department" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., Cardiology">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                                <input type="text" name="registrationNo" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., MH123456">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                                <input type="number" name="experience" min="0" max="50" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., 5">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                                <input type="text" name="qualification" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., MBBS, MD">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Financial Information -->
                    <div class="md:col-span-2 bg-yellow-50 p-3 rounded mb-4">
                        <h4 class="font-semibold text-yellow-800 mb-2">Financial Information (Optional)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
                                <input type="number" name="hourlyRate" min="0" step="100" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., 2500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Night Rate (₹)</label>
                                <input type="number" name="nightRate" min="0" step="100" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., 3750">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
                                <input type="number" name="consultationFee" min="0" step="50" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., 800">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Professional Fee (₹)</label>
                                <input type="number" name="professionalFee" min="0" step="1000" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., 50000">
                                <p class="text-xs text-gray-600 mt-1">Fixed monthly fee for specialized services</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Contact Information -->
                    <div class="md:col-span-2 bg-purple-50 p-3 rounded mb-4">
                        <h4 class="font-semibold text-purple-800 mb-2">Contact Information (Optional)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input type="tel" name="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., 9876543210">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., doctor@hospital.com">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Payment Details -->
                    <div class="md:col-span-2 bg-orange-50 p-3 rounded mb-4">
                        <h4 class="font-semibold text-orange-800 mb-2">Payment Details (Optional)</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Bank Account Number</label>
                                <input type="text" name="bankAccount" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., 1234567890123456">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                                <input type="text" name="ifsc" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., SBIN0001234">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input type="text" name="bankName" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., State Bank of India">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                                <input type="text" name="upiId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="e.g., doctor@paytm">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" onclick="closeDoctorModal()" class="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        <i class="fas fa-plus mr-2"></i>Add Doctor
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal('Add New Doctor', modalHTML);
}

// Add doctor function
function addDoctor(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const doctorData = {};
    
    // Get form data
    for (let [key, value] of formData.entries()) {
        if (value.trim() !== '') {
            doctorData[key] = value.trim();
        }
    }
    
    // Validate required fields
    if (!doctorData.id || !doctorData.name) {
        alert('Doctor ID and Name are required fields.');
        return;
    }
    
    // Check if ID already exists
    if (doctors.find(doc => doc.id === doctorData.id)) {
        alert('Doctor ID already exists. Please use a different ID.');
        return;
    }
    
    // Set default values for optional fields
    const newDoctor = {
        id: doctorData.id,
        name: doctorData.name,
        specialization: doctorData.specialization || 'general',
        department: doctorData.department || 'General',
        registrationNo: doctorData.registrationNo || '',
        experience: parseInt(doctorData.experience) || 0,
        hourlyRate: parseInt(doctorData.hourlyRate) || (SPECIALIZATIONS[doctorData.specialization]?.baseRate || 2000),
        nightRate: parseInt(doctorData.nightRate) || Math.floor((parseInt(doctorData.hourlyRate) || (SPECIALIZATIONS[doctorData.specialization]?.baseRate || 2000)) * 1.5),
        consultationFee: parseInt(doctorData.consultationFee) || 500,
        professionalFee: parseInt(doctorData.professionalFee) || 0,
        status: doctorData.status || 'Active',
        qualification: doctorData.qualification || '',
        phone: doctorData.phone || '',
        email: doctorData.email || '',
        bankAccount: doctorData.bankAccount || '',
        ifsc: doctorData.ifsc || '',
        bankName: doctorData.bankName || '',
        upiId: doctorData.upiId || ''
    };
    
    // Add to doctors array
    doctors.push(newDoctor);
    
    // Initialize attendance for current month
    const currentMonthKey = currentMonth || '2025-06';
    if (!doctorAttendance[currentMonthKey]) {
        doctorAttendance[currentMonthKey] = {};
    }
    doctorAttendance[currentMonthKey][newDoctor.id] = {};
    
    // Save data
    saveDoctorsData();
    
    // Refresh table
    populateDoctorsTable();
    
    // Close modal
    closeDoctorModal();
    
    // Show success message
    alert(`Doctor ${newDoctor.name} added successfully!`);
    addActivity(`Added new doctor: ${newDoctor.name} (${newDoctor.id})`);
}

function generateAttendanceReport(doctorId) {
    // Call the actual PDF generation function from doctors-pdf-reports.js
    if (typeof generateDoctorAttendanceReport === 'function') {
        generateDoctorAttendanceReport(doctorId);
    } else {
        console.error('generateDoctorAttendanceReport function not found. Make sure doctors-pdf-reports.js is loaded.');
        alert('Error: PDF generation function not available. Please check console for details.');
    }
}

function generateDoctorPayslipFromModal(doctorId) {
    // First calculate the payroll to ensure data is up to date
    calculateDoctorPayroll();
    
    // Call the actual PDF generation function from doctors-pdf-reports.js
    if (typeof generateDoctorPayslip === 'function') {
        generateDoctorPayslip(doctorId);
    } else {
        console.error('generateDoctorPayslip function not found. Make sure doctors-pdf-reports.js is loaded.');
        alert('Error: PDF generation function not available. Please check console for details.');
    }
}

// Initialize when the page loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // Auto-initialize if doctors tab is already active
        if (document.getElementById('content-doctors') && !document.getElementById('content-doctors').classList.contains('hidden')) {
            initializeDoctorsManagement();
        }
    });
}

// Calculate doctor payroll for the current month
function calculateDoctorPayroll() {
    const currentMonthKey = currentMonth || '2025-06';
    console.log('Calculating payroll for month:', currentMonthKey);
    console.log('Available doctors:', doctors.length);
    console.log('Attendance data keys:', Object.keys(doctorAttendance));
    
    const attendance = doctorAttendance[currentMonthKey] || {};
    console.log('Attendance for current month:', attendance);
    
    const payrollData = {};
    
    doctors.forEach(doctor => {
        if (doctor.status === 'Active') {
            const doctorAttendanceData = attendance[doctor.id] || {};
            
            let totalHours = 0;
            let regularHours = 0;
            let nightHours = 0;
            let workingDays = 0;
            
            // Calculate hours from attendance
            Object.values(doctorAttendanceData).forEach(dayData => {
                if (dayData.status === 'Present' && dayData.shift) {
                    workingDays++;
                    let shiftHours = 0;
                    
                    // Handle custom shift hours
                    if (dayData.shift === 'custom') {
                        shiftHours = parseInt(dayData.customHours) || 8;
                    } else {
                        shiftHours = SHIFT_TYPES[dayData.shift]?.hours || 0;
                    }
                    
                    const dayNightHours = parseInt(dayData.nightHours) || 0;
                    
                    regularHours += shiftHours;
                    nightHours += dayNightHours;
                    totalHours += shiftHours + dayNightHours;
                }
            });
            
            // Calculate payments
            const regularPay = regularHours * doctor.hourlyRate;
            const nightHoursPay = nightHours * (doctor.nightRate || doctor.hourlyRate * 1.5);
            const professionalFee = doctor.professionalFee || 0;
            const grossPay = regularPay + nightHoursPay + professionalFee;
            const tdsAmount = grossPay * 0.10; // 10% TDS under section 194J
            const netPay = grossPay - tdsAmount;
            
            // Store in payroll data
            payrollData[doctor.id] = {
                doctorId: doctor.id,
                doctorName: doctor.name,
                specialization: doctor.specialization,
                month: currentMonthKey,
                workingDays: workingDays,
                totalHours: totalHours,
                regularHours: regularHours,
                nightHours: nightHours,
                hourlyRate: doctor.hourlyRate,
                regularPay: regularPay,
                nightHoursPay: nightHoursPay,
                professionalFee: professionalFee,
                nightRate: doctor.nightRate || (doctor.hourlyRate * 1.5),
                grossPay: grossPay,
                tdsAmount: tdsAmount,
                netPay: netPay
            };
        }
    });
    
    // Save doctor payroll data
    if (!doctorPayroll[currentMonthKey]) {
        doctorPayroll[currentMonthKey] = {};
    }
    doctorPayroll[currentMonthKey] = payrollData;
    saveDoctorsData();
    
    return payrollData;
}

// Make functions available globally for browser use
window.initializeDoctorsManagement = initializeDoctorsManagement;
window.generateSampleDoctors = generateSampleDoctors;
window.populateDoctorsTable = populateDoctorsTable;
window.viewDoctorAttendance = viewDoctorAttendance;
window.handleShiftChange = handleShiftChange;
window.updateAttendance = updateAttendance;
window.viewDoctorPayroll = viewDoctorPayroll;
window.showModal = showModal;
window.handleEscapeKey = handleEscapeKey;
window.closeDoctorModal = closeDoctorModal;
window.closeAttendanceModal = closeAttendanceModal;
window.closePayrollModal = closePayrollModal;
window.bulkSetAttendance = bulkSetAttendance;
window.setSundaysOff = setSundaysOff;
window.saveDoctorsData = saveDoctorsData;
window.loadDoctorsData = loadDoctorsData;
window.searchDoctors = searchDoctors;
window.editDoctor = editDoctor;
window.updateDoctor = updateDoctor;
window.showAddDoctorModal = showAddDoctorModal;
window.addDoctor = addDoctor;
window.generateAttendanceReport = generateAttendanceReport;
window.generateDoctorPayslipFromModal = generateDoctorPayslipFromModal;
window.calculateDoctorPayroll = calculateDoctorPayroll;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeDoctorsManagement,
        populateDoctorsTable,
        viewDoctorAttendance,
        viewDoctorPayroll,
        updateAttendance,
        saveDoctorsData,
        loadDoctorsData,
        calculateDoctorPayroll
    };
}