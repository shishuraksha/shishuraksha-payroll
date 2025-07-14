/**
 * Doctors PDF Reports Generation
 * Handles payslip generation and comprehensive reports for doctors
 */

// Generate doctor payslip PDF
function generateDoctorPayslip(doctorId) {
    console.log('generateDoctorPayslip called with doctorId:', doctorId);
    console.log('Current month:', currentMonth);
    console.log('Doctors array:', doctors);
    console.log('Doctor payroll data:', doctorPayroll);
    
    // Validate doctorId parameter
    if (!doctorId || typeof doctorId !== 'string') {
        console.error('Invalid doctorId parameter:', doctorId);
        Swal.fire('Error', 'Invalid doctor ID provided.', 'error');
        return;
    }
    
    const doctor = doctors.find(doc => doc.id === doctorId);
    const payrollData = doctorPayroll[currentMonth]?.[doctorId];
    
    console.log('Found doctor:', doctor);
    console.log('Payroll data for doctor:', payrollData);
    
    if (!doctor || !payrollData) {
        console.error('Missing data - doctor:', doctor, 'payrollData:', payrollData);
        Swal.fire('Error', 'No payroll data available for this doctor.', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); // A4 optimization
    
    // A4 dimensions and professional margins (20mm)
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    
    // Set up document with proper A4 layout
    doc.setFontSize(18);
    doc.setTextColor(25, 64, 175);
    doc.text('SHISHURAKSHA CHILDREN\'S HOSPITAL', pageWidth/2, 25, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Doctor Payslip - Professional Services', pageWidth/2, 35, { align: 'center' });
    
    // Professional horizontal line
    doc.setDrawColor(25, 64, 175);
    doc.setLineWidth(0.8);
    doc.line(margin, 40, pageWidth - margin, 40);
    
    // Period and Generation Date with proper spacing
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Period: ${payrollData.month}`, margin, 50);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin - 30, 50);
    
    // Doctor Information Section - Compact layout
    let yPos = 60;
    doc.setFontSize(11);
    doc.setTextColor(25, 64, 175);
    doc.text('DOCTOR INFORMATION', margin, yPos);
    yPos += 8;
    
    // Create doctor info table for better space utilization
    const doctorInfo = [
        [`Doctor ID:`, doctor.id, `Name:`, doctor.name],
        [`Specialization:`, SPECIALIZATIONS[doctor.specialization]?.name || doctor.specialization, `Department:`, doctor.department || 'N/A'],
        [`Registration No:`, doctor.registrationNo || 'N/A', `Experience:`, `${doctor.experience || 0} years`]
    ];
    
    doc.autoTable({
        startY: yPos,
        body: doctorInfo,
        theme: 'grid',
        bodyStyles: { 
            fontSize: 8,
            cellPadding: 2,
            minCellHeight: 6
        },
        columnStyles: {
            0: { cellWidth: (contentWidth-8)/4, fontStyle: 'bold', halign: 'left' },
            1: { cellWidth: (contentWidth-8)/4, halign: 'left' },
            2: { cellWidth: (contentWidth-8)/4, fontStyle: 'bold', halign: 'left' },
            3: { cellWidth: (contentWidth-8)/4, halign: 'left' }
        },
        margin: { left: margin, right: margin }
    });
    
    yPos = doc.lastAutoTable.finalY + 10;
    
    // Monthly Summary Section - Compact layout
    doc.setFontSize(11);
    doc.setTextColor(25, 64, 175);
    doc.text('MONTHLY SUMMARY', margin, yPos);
    yPos += 8;
    
    // Create summary table for better space utilization
    const summaryInfo = [
        [`Working Days:`, payrollData.workingDays.toString(), `Regular Hours:`, `${payrollData.regularHours}h`],
        [`Night Hours:`, `${payrollData.nightHours}h`, `Total Hours:`, `${payrollData.totalHours}h`],
        [`Regular Rate:`, `Rs. ${payrollData.hourlyRate.toLocaleString('en-IN')}/hr`, `Night Rate:`, `Rs. ${(doctor.nightRate || payrollData.hourlyRate * 1.5).toLocaleString('en-IN')}/hr`]
    ];
    
    doc.autoTable({
        startY: yPos,
        body: summaryInfo,
        theme: 'grid',
        bodyStyles: { 
            fontSize: 8,
            cellPadding: 2,
            minCellHeight: 6
        },
        columnStyles: {
            0: { cellWidth: (contentWidth-8)/4, fontStyle: 'bold', halign: 'left' },
            1: { cellWidth: (contentWidth-8)/4, halign: 'center' },
            2: { cellWidth: (contentWidth-8)/4, fontStyle: 'bold', halign: 'left' },
            3: { cellWidth: (contentWidth-8)/4, halign: 'center' }
        },
        margin: { left: margin, right: margin }
    });
    
    yPos = doc.lastAutoTable.finalY + 10;
    
    // Payment Calculation Section - Compact
    doc.setFontSize(11);
    doc.setTextColor(25, 64, 175);
    doc.text('PAYMENT CALCULATION', margin, yPos);
    yPos += 8;
    
    // Create payment table
    const paymentData = [
        ['Description', 'Hours', 'Rate', 'Amount'],
        ['Regular Hours', payrollData.regularHours.toString(), `Rs. ${payrollData.hourlyRate.toLocaleString('en-IN')}`, `Rs. ${payrollData.regularPay.toLocaleString('en-IN')}`],
        ['Night Hours', payrollData.nightHours.toString(), `Rs. ${(doctor.nightRate || (payrollData.hourlyRate * 1.5)).toLocaleString('en-IN')}`, `Rs. ${payrollData.nightHoursPay.toLocaleString('en-IN')}`],
        ['', '', 'Gross Pay:', `Rs. ${payrollData.grossPay.toLocaleString('en-IN')}`]
    ];
    
    doc.autoTable({
        startY: yPos,
        head: [paymentData[0]],
        body: paymentData.slice(1),
        theme: 'grid',
        headStyles: { 
            fillColor: [25, 64, 175], 
            textColor: 255, 
            fontSize: 8, 
            halign: 'center',
            fontStyle: 'bold',
            cellPadding: 2
        },
        bodyStyles: { 
            fontSize: 8,
            cellPadding: 2,
            minCellHeight: 6
        },
        columnStyles: {
            0: { cellWidth: contentWidth*0.35, halign: 'left', fontStyle: 'normal' },
            1: { cellWidth: contentWidth*0.20, halign: 'center' },
            2: { cellWidth: contentWidth*0.25, halign: 'right' },
            3: { cellWidth: contentWidth*0.20, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin }
    });
    
    yPos = doc.lastAutoTable.finalY + 8;
    
    // Deductions Section - Compact
    doc.setFontSize(11);
    doc.setTextColor(25, 64, 175);
    doc.text('DEDUCTIONS', margin, yPos);
    yPos += 8;
    
    const deductionData = [
        ['Description', 'Rate', 'Amount'],
        ['TDS u/s 194J (Professional Services)', '10%', `Rs. ${payrollData.tdsAmount.toLocaleString('en-IN')}`],
        ['', 'Total Deductions:', `Rs. ${payrollData.tdsAmount.toLocaleString('en-IN')}`]
    ];
    
    doc.autoTable({
        startY: yPos,
        head: [deductionData[0]],
        body: deductionData.slice(1),
        theme: 'grid',
        headStyles: { 
            fillColor: [220, 53, 69], 
            textColor: 255, 
            fontSize: 8, 
            halign: 'center',
            fontStyle: 'bold',
            cellPadding: 2
        },
        bodyStyles: { 
            fontSize: 8,
            cellPadding: 2,
            minCellHeight: 6
        },
        columnStyles: {
            0: { cellWidth: contentWidth*0.60, halign: 'left', fontStyle: 'normal' },
            1: { cellWidth: contentWidth*0.20, halign: 'center' },
            2: { cellWidth: contentWidth*0.20, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin }
    });
    
    yPos = doc.lastAutoTable.finalY + 8;
    
    // Net Pay Section - Perfectly aligned and compact
    doc.setFillColor(25, 64, 175);
    doc.rect(margin, yPos - 2, contentWidth, 12, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('NET PAY', margin + 5, yPos + 6);
    doc.text(`Rs. ${payrollData.netPay.toLocaleString('en-IN')}`, pageWidth - margin - 5, yPos + 6, { align: 'right' });
    
    yPos += 18;
    
    // Payment Details Section - Ultra compact
    doc.setFontSize(11);
    doc.setTextColor(25, 64, 175);
    doc.text('PAYMENT DETAILS', margin, yPos);
    yPos += 8;
    
    // Create compact payment details table
    const paymentDetails = [
        ['Payment Mode:', 'Bank Transfer'],
        ['Account Number:', doctor.bankAccount || 'Not Provided'],
        ['IFSC Code:', doctor.ifsc || 'Not Provided'],
        ['Bank Name:', doctor.bankName || 'Not Provided'],
        ['UPI ID:', doctor.upiId || 'Not Provided']
    ];
    
    doc.autoTable({
        startY: yPos,
        body: paymentDetails,
        theme: 'grid',
        bodyStyles: { 
            fontSize: 8,
            cellPadding: 1.5,
            minCellHeight: 5
        },
        columnStyles: {
            0: { cellWidth: contentWidth*0.35, halign: 'left', fontStyle: 'bold' },
            1: { cellWidth: contentWidth*0.65, halign: 'left', fontStyle: 'normal' }
        },
        margin: { left: margin, right: margin }
    });
    
    yPos = doc.lastAutoTable.finalY + 8;
    
    // TDS Certificate Note - Compact
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Note: TDS Certificate under Section 194J will be issued separately.', margin, yPos);
    doc.text('This is a computer-generated payslip and does not require a signature.', margin, yPos + 4);
    
    // Footer for Page 1 - Professional positioning
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Shishuraksha Children\'s Hospital - Confidential Document', pageWidth/2, pageHeight - 15, { align: 'center' });
    doc.text('Page 1 of 2', pageWidth - margin, pageHeight - 10, { align: 'right' });
    
    // ========== PAGE 2 - ATTENDANCE BREAKDOWN ==========
    doc.addPage();
    
    // Page 2 Header - A4 optimized
    doc.setFontSize(16);
    doc.setTextColor(25, 64, 175);
    doc.text('ATTENDANCE BREAKDOWN', pageWidth/2, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`${doctor.name} - ${payrollData.month}`, pageWidth/2, 33, { align: 'center' });
    
    // Professional horizontal line
    doc.setDrawColor(25, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(margin, 38, pageWidth - margin, 38);
    
    // Day-by-Day Breakdown Section
    let page2YPos = 48;
    
    // Get attendance data for the month
    const attendance = doctorAttendance[payrollData.month]?.[doctorId] || {};
    const dayBreakdownData = [['Day', 'Date', 'Status', 'Shift', 'Shift Hrs', 'Night Hrs', 'Total Hrs', 'Day Pay']];
    
    // Extract year and month from payrollData.month
    const [yearStr, monthStr] = payrollData.month.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    let totalShiftHours = 0;
    let totalNightHours = 0;
    let totalDaysPay = 0;
    let workingDaysCount = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayData = attendance[day];
        if (dayData && dayData.status === 'Present' && dayData.shift) {
            const date = new Date(year, month - 1, day);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            let shiftHours = 0;
            let shiftName = '';
            
            // Handle custom shift - make shift names more compact
            if (dayData.shift === 'custom') {
                shiftHours = parseInt(dayData.customHours) || 8;
                shiftName = `Custom ${shiftHours}h`;
            } else {
                shiftHours = SHIFT_TYPES[dayData.shift]?.hours || 0;
                // Use shorter shift names for better table fit
                const shortShiftNames = {
                    'morning': 'Morning 9-3',
                    'evening': 'Evening 3-9',
                    'night': 'Night 12h',
                    'full24': '24hr Duty'
                };
                shiftName = shortShiftNames[dayData.shift] || dayData.shift;
            }
            
            const nightHours = parseInt(dayData.nightHours) || 0;
            const totalDayHours = shiftHours + nightHours;
            const dayPay = (shiftHours * payrollData.hourlyRate) + (nightHours * (doctor.nightRate || payrollData.hourlyRate * 1.5));
            
            // Add to totals
            totalShiftHours += shiftHours;
            totalNightHours += nightHours;
            totalDaysPay += dayPay;
            workingDaysCount++;
            
            dayBreakdownData.push([
                dayName,
                `${day}/${month}`,
                'Present',
                shiftName,
                shiftHours.toString(),
                nightHours.toString(),
                totalDayHours.toString(),
                `Rs. ${dayPay.toLocaleString('en-IN')}`
            ]);
        }
    }
    
    // Add totals row
    if (dayBreakdownData.length > 1) {
        dayBreakdownData.push([
            'TOTAL',
            `${workingDaysCount} days`,
            '',
            '',
            totalShiftHours.toString(),
            totalNightHours.toString(),
            (totalShiftHours + totalNightHours).toString(),
            `Rs. ${totalDaysPay.toLocaleString('en-IN')}`
        ]);
        
        doc.autoTable({
            startY: page2YPos,
            head: [dayBreakdownData[0]],
            body: dayBreakdownData.slice(1, -1), // All rows except the totals
            foot: [dayBreakdownData[dayBreakdownData.length - 1]], // Only the totals row
            theme: 'striped',
            headStyles: { 
                fillColor: [25, 64, 175], 
                textColor: 255, 
                fontSize: 7, 
                halign: 'center',
                fontStyle: 'bold',
                cellPadding: 2,
                minCellHeight: 8
            },
            bodyStyles: { 
                fontSize: 7,
                cellPadding: 1.5,
                minCellHeight: 6,
                valign: 'middle'
            },
            footStyles: { 
                fillColor: [40, 167, 69], 
                textColor: 255, 
                fontSize: 7, 
                fontStyle: 'bold',
                cellPadding: 2,
                minCellHeight: 8
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' }, // Day
                1: { cellWidth: 18, halign: 'center' }, // Date
                2: { cellWidth: 20, halign: 'center' }, // Status
                3: { cellWidth: 40, halign: 'left' },   // Shift
                4: { cellWidth: 18, halign: 'center' }, // Shift Hrs
                5: { cellWidth: 18, halign: 'center' }, // Night Hrs
                6: { cellWidth: 18, halign: 'center' }, // Total Hrs
                7: { cellWidth: 23, halign: 'right' }   // Day Pay
            },
            margin: { left: margin, right: margin },
            tableWidth: 170,
            styles: {
                overflow: 'linebreak',
                cellWidth: 'wrap'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });
        page2YPos = doc.lastAutoTable.finalY + 15;
    } else {
        // If no attendance data, show message
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('No attendance data available for this period.', pageWidth/2, page2YPos + 20, { align: 'center' });
        page2YPos += 40;
    }
    
    // Add attendance summary section if there's space
    if (page2YPos < 220 && dayBreakdownData.length > 1) {
        doc.setFontSize(11);
        doc.setTextColor(25, 64, 175);
        doc.text('ATTENDANCE SUMMARY', margin, page2YPos);
        page2YPos += 8;
        
        // Create summary info
        const summaryInfo = [
            [`Total Working Days:`, workingDaysCount.toString(), `Attendance Rate:`, `${((workingDaysCount / daysInMonth) * 100).toFixed(1)}%`],
            [`Total Regular Hours:`, `${totalShiftHours} hours`, `Total Night Hours:`, `${totalNightHours} hours`],
            [`Average Hours/Day:`, `${workingDaysCount > 0 ? ((totalShiftHours + totalNightHours) / workingDaysCount).toFixed(1) : '0'} hours`, `Total Earnings:`, `Rs. ${totalDaysPay.toLocaleString('en-IN')}`]
        ];
        
        doc.autoTable({
            startY: page2YPos,
            body: summaryInfo,
            theme: 'plain',
            bodyStyles: { 
                fontSize: 8,
                cellPadding: 2,
                minCellHeight: 6
            },
            columnStyles: {
                0: { cellWidth: 35, fontStyle: 'bold', halign: 'left' },
                1: { cellWidth: 40, halign: 'left' },
                2: { cellWidth: 35, fontStyle: 'bold', halign: 'left' },
                3: { cellWidth: 40, halign: 'left' }
            },
            margin: { left: margin, right: margin }
        });
        
        page2YPos = doc.lastAutoTable.finalY + 10;
    }
    
    // Additional space before footer
    page2YPos += 10;
    
    // Footer for Page 2 - Professional positioning
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('Shishuraksha Children\'s Hospital - Confidential Document', pageWidth/2, pageHeight - 15, { align: 'center' });
    doc.text('Page 2 of 2', pageWidth - margin, pageHeight - 10, { align: 'right' });
    
    // Save the PDF
    const fileName = `Doctor_Payslip_${doctor.name.replace(/\s+/g, '_')}_${payrollData.month.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
    addActivity(`Generated payslip for Dr. ${doctor.name} (${payrollData.month})`);
}

// Generate doctor attendance report PDF
function generateDoctorAttendanceReport(doctorId) {
    console.log('generateDoctorAttendanceReport called with doctorId:', doctorId);
    console.log('Current month:', currentMonth);
    console.log('Doctors array:', doctors);
    console.log('Doctor attendance data:', doctorAttendance);
    
    // Validate doctorId parameter
    if (!doctorId || typeof doctorId !== 'string') {
        console.error('Invalid doctorId parameter:', doctorId);
        Swal.fire('Error', 'Invalid doctor ID provided.', 'error');
        return;
    }
    
    const doctor = doctors.find(doc => doc.id === doctorId);
    const attendance = doctorAttendance[currentMonth]?.[doctorId] || {};
    
    console.log('Found doctor:', doctor);
    console.log('Attendance data for doctor:', attendance);
    
    if (!doctor) {
        console.error('Doctor not found with ID:', doctorId);
        Swal.fire('Error', 'Doctor not found.', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(25, 64, 175);
    doc.text('DOCTOR ATTENDANCE REPORT', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`${doctor.name} - ${currentMonth}`, 105, 30, { align: 'center' });
    
    // Add line
    doc.setDrawColor(25, 64, 175);
    doc.line(20, 35, 190, 35);
    
    // Doctor info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Doctor ID: ${doctor.id}`, 20, 45);
    doc.text(`Specialization: ${SPECIALIZATIONS[doctor.specialization]?.name || doctor.specialization}`, 20, 53);
    doc.text(`Department: ${doctor.department}`, 20, 61);
    
    // Attendance table
    const currentYear = parseInt(currentMonth.split('-')[0]);
    const currentMonthNum = parseInt(currentMonth.split('-')[1]);
    const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
    const attendanceData = [['Date', 'Day', 'Status', 'Shift', 'Hours', 'Night Hours']];
    
    let totalHours = 0;
    let totalOT = 0;
    let workingDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayData = attendance[day] || { status: 'Absent', shift: '', nightHours: 0 };
        const date = new Date(currentYear, currentMonthNum - 1, day);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        let dayHours = 0;
        let dayOT = 0;
        
        if (dayData.status === 'Present' && dayData.shift) {
            // Handle custom shift
            if (dayData.shift === 'custom') {
                dayHours = parseInt(dayData.customHours) || 8;
            } else {
                dayHours = SHIFT_TYPES[dayData.shift]?.hours || 0;
            }
            
            dayOT = parseInt(dayData.nightHours) || 0;
            totalHours += dayHours;
            totalOT += dayOT;
            workingDays++;
        }
        
        let shiftDisplay = '-';
        if (dayData.shift) {
            if (dayData.shift === 'custom') {
                shiftDisplay = `Custom (${dayHours}hr)`;
            } else {
                shiftDisplay = SHIFT_TYPES[dayData.shift]?.name || dayData.shift;
            }
        }
        
        attendanceData.push([
            day.toString(),
            dayName,
            dayData.status,
            shiftDisplay,
            dayHours ? `${dayHours}h` : '-',
            dayOT ? `${dayOT}h` : '-'
        ]);
    }
    
    doc.autoTable({
        startY: 75,
        head: [attendanceData[0]],
        body: attendanceData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [25, 64, 175], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
            0: { cellWidth: 20, halign: 'center' },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 40 },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 25, halign: 'center' }
        },
        pageBreak: 'auto'
    });
    
    // Summary
    const yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(25, 64, 175);
    doc.text('SUMMARY', 20, yPos);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Working Days: ${workingDays}`, 20, yPos + 12);
    doc.text(`Total Hours: ${totalHours}`, 20, yPos + 20);
    doc.text(`Night Hours: ${totalOT}`, 20, yPos + 28);
    doc.text(`Hourly Rate: Rs. ${doctor.hourlyRate.toLocaleString('en-IN')}`, 20, yPos + 36);
    
    const grossEarnings = (totalHours * doctor.hourlyRate) + (totalOT * (doctor.nightRate || doctor.hourlyRate * 1.5));
    doc.text(`Gross Earnings: Rs. ${grossEarnings.toLocaleString('en-IN')}`, 20, yPos + 44);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by Shishuraksha Children\'s Hospital Payroll System', 105, 280, { align: 'center' });
    
    const fileName = `Doctor_Attendance_${doctor.name.replace(/\s+/g, '_')}_${currentMonth.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
    // Close the modal using the correct function from doctors-management.js
    if (typeof closeDoctorModal === 'function') {
        closeDoctorModal();
    }
    addActivity(`Generated attendance report for Dr. ${doctor.name} (${currentMonth})`);
}

// Generate comprehensive doctors summary report
function generateDoctorsSummaryReport() {
    const payrollData = calculateDoctorPayroll();
    
    if (Object.keys(payrollData).length === 0) {
        Swal.fire('Info', 'No doctor payroll data available for this month.', 'info');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(25, 64, 175);
    doc.text('DOCTORS PAYROLL SUMMARY', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`Period: ${currentMonth}`, 105, 30, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 105, 38, { align: 'center' });
    
    // Add line
    doc.setDrawColor(25, 64, 175);
    doc.line(20, 45, 190, 45);
    
    // Summary statistics
    const totalDoctors = Object.keys(payrollData).length;
    const totalGrossPay = Object.values(payrollData).reduce((sum, doc) => sum + doc.grossPay, 0);
    const totalTDS = Object.values(payrollData).reduce((sum, doc) => sum + doc.tdsAmount, 0);
    const totalNetPay = Object.values(payrollData).reduce((sum, doc) => sum + doc.netPay, 0);
    const totalHours = Object.values(payrollData).reduce((sum, doc) => sum + doc.totalHours, 0);
    const totalOTHours = Object.values(payrollData).reduce((sum, doc) => sum + doc.nightHours, 0);
    
    // Summary cards
    doc.setFontSize(12);
    doc.setTextColor(25, 64, 175);
    doc.text('OVERALL SUMMARY', 20, 60);
    
    // Create a well-aligned summary table
    const summaryData = [
        ['Metric', 'Value'],
        ['Total Doctors', totalDoctors.toString()],
        ['Total Hours Worked', `${totalHours} hours`],
        ['Total Night Hours', `${totalOTHours} hours`],
        ['Total Gross Pay', `Rs. ${totalGrossPay.toLocaleString('en-IN')}`],
        ['Total TDS Deducted', `Rs. ${totalTDS.toLocaleString('en-IN')}`],
        ['Total Net Pay', `Rs. ${totalNetPay.toLocaleString('en-IN')}`]
    ];
    
    doc.autoTable({
        startY: 68,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: { 
            fillColor: [245, 245, 245], 
            textColor: [25, 64, 175], 
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left'
        },
        bodyStyles: { 
            fontSize: 10,
            cellPadding: 4
        },
        columnStyles: {
            0: { cellWidth: 80, fontStyle: 'bold' },
            1: { cellWidth: 90, halign: 'left' }
        },
        margin: { left: 20, right: 20 },
        tableWidth: 170
    });
    
    let yPos = doc.lastAutoTable.finalY;
    
    // Detailed table
    yPos += 15;
    doc.setFontSize(12);
    doc.setTextColor(25, 64, 175);
    doc.text('DETAILED BREAKDOWN', 20, yPos);
    yPos += 10;
    
    const tableData = [
        ['Doctor', 'Specialization', 'Hours', 'Night Hrs', 'Gross Pay', 'TDS', 'Net Pay']
    ];
    
    Object.values(payrollData).forEach(doc => {
        tableData.push([
            doc.doctorName.length > 15 ? doc.doctorName.substring(0, 15) + '...' : doc.doctorName,
            SPECIALIZATIONS[doc.specialization]?.name.substring(0, 12) || doc.specialization,
            doc.totalHours.toString(),
            doc.nightHours.toString(),
            `Rs. ${(doc.grossPay / 1000).toFixed(0)}K`,
            `Rs. ${(doc.tdsAmount / 1000).toFixed(0)}K`,
            `Rs. ${(doc.netPay / 1000).toFixed(0)}K`
        ]);
    });
    
    doc.autoTable({
        startY: yPos,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'grid',
        headStyles: { 
            fillColor: [25, 64, 175], 
            textColor: 255, 
            fontSize: 9,
            halign: 'center',
            cellPadding: 3
        },
        bodyStyles: { 
            fontSize: 8,
            cellPadding: 2
        },
        columnStyles: {
            0: { cellWidth: 35, halign: 'left' },
            1: { cellWidth: 28, halign: 'left' },
            2: { cellWidth: 18, halign: 'center' },
            3: { cellWidth: 18, halign: 'center' },
            4: { cellWidth: 28, halign: 'right' },
            5: { cellWidth: 25, halign: 'right' },
            6: { cellWidth: 28, halign: 'right' }
        },
        margin: { left: 15, right: 15 },
        pageBreak: 'auto',
        alternateRowStyles: { fillColor: [250, 250, 250] }
    });
    
    // Specialization wise summary
    const specializationSummary = {};
    Object.values(payrollData).forEach(doc => {
        if (!specializationSummary[doc.specialization]) {
            specializationSummary[doc.specialization] = {
                count: 0,
                totalHours: 0,
                totalPay: 0
            };
        }
        specializationSummary[doc.specialization].count++;
        specializationSummary[doc.specialization].totalHours += doc.totalHours;
        specializationSummary[doc.specialization].totalPay += doc.netPay;
    });
    
    yPos = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.setTextColor(25, 64, 175);
    doc.text('SPECIALIZATION WISE SUMMARY', 20, yPos);
    yPos += 10;
    
    const specTableData = [
        ['Specialization', 'Doctors', 'Total Hours', 'Total Pay']
    ];
    
    Object.entries(specializationSummary).forEach(([spec, data]) => {
        specTableData.push([
            SPECIALIZATIONS[spec]?.name || spec,
            data.count.toString(),
            `${data.totalHours}h`,
            `Rs. ${data.totalPay.toLocaleString('en-IN')}`
        ]);
    });
    
    doc.autoTable({
        startY: yPos,
        head: [specTableData[0]],
        body: specTableData.slice(1),
        theme: 'grid',
        headStyles: { 
            fillColor: [40, 167, 69], 
            textColor: 255, 
            fontSize: 9,
            halign: 'center',
            cellPadding: 3
        },
        bodyStyles: { 
            fontSize: 9,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 60, halign: 'left' },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 40, halign: 'center' },
            3: { cellWidth: 50, halign: 'right' }
        },
        margin: { left: 15, right: 15 },
        alternateRowStyles: { fillColor: [250, 250, 250] }
    });
    
    // TDS Summary
    yPos = doc.lastAutoTable.finalY + 20;
    
    // Check if we need a new page
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(25, 64, 175);
    doc.text('TDS SUMMARY (Section 194J)', 20, yPos);
    
    // Create TDS summary table
    const tdsData = [
        ['Description', 'Amount'],
        ['Total Professional Services Payment', `Rs. ${totalGrossPay.toLocaleString('en-IN')}`],
        ['TDS Rate (Section 194J)', '10%'],
        ['Total TDS Deducted', `Rs. ${totalTDS.toLocaleString('en-IN')}`],
        ['Net Payment to Doctors', `Rs. ${totalNetPay.toLocaleString('en-IN')}`]
    ];
    
    doc.autoTable({
        startY: yPos + 8,
        head: [tdsData[0]],
        body: tdsData.slice(1),
        theme: 'grid',
        headStyles: { 
            fillColor: [245, 245, 245], 
            textColor: [25, 64, 175], 
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'left'
        },
        bodyStyles: { 
            fontSize: 10,
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 100, fontStyle: 'bold' },
            1: { cellWidth: 70, halign: 'right' }
        },
        margin: { left: 20, right: 20 },
        tableWidth: 170
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Shishuraksha Children\'s Hospital - Confidential Payroll Summary', 105, 280, { align: 'center' });
    
    const fileName = `Doctors_Payroll_Summary_${currentMonth.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
    addActivity(`Generated doctors payroll summary for ${currentMonth}`);
}

// Add to reports section - generate all doctor payslips
function generateAllDoctorPayslips() {
    const payrollData = calculateDoctorPayroll();
    const doctorIds = Object.keys(payrollData);
    
    if (doctorIds.length === 0) {
        Swal.fire('Info', 'No doctor payroll data available.', 'info');
        return;
    }
    
    Swal.fire({
        title: 'Generate All Payslips',
        text: `This will generate ${doctorIds.length} payslip PDFs. Continue?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Generate All',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            doctorIds.forEach((doctorId, index) => {
                setTimeout(() => {
                    generateDoctorPayslip(doctorId);
                }, index * 500); // Delay to avoid browser blocking
            });
            
            Swal.fire('Success', `${doctorIds.length} payslips generated successfully!`, 'success');
        }
    });
}

// Export functions
window.generateDoctorPayslip = generateDoctorPayslip;
window.generateDoctorAttendanceReport = generateDoctorAttendanceReport;
window.generateDoctorsSummaryReport = generateDoctorsSummaryReport;
window.generateAllDoctorPayslips = generateAllDoctorPayslips;