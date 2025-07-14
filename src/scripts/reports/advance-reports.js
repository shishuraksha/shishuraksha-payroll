/**
 * Advance Reports Module
 * Generates comprehensive reports for advance loans and EMI schedules
 */

// Helper function to get employee data safely
function getEmployeeData(employeeId) {
    // Try to get from global employees array
    if (typeof window.employees !== 'undefined' && Array.isArray(window.employees)) {
        const employee = window.employees.find(emp => emp.id === employeeId);
        if (employee) return employee;
    }
    
    // Return minimal employee data
    return {
        id: employeeId,
        name: employeeId,
        department: 'Unknown',
        status: 'Active'
    };
}

// Generate comprehensive advance report
function generateAdvanceReport() {
    try {
        console.log('📊 generateAdvanceReport called');
        
        // Get advance loans from localStorage
        let loansData = {};
        const saved = localStorage.getItem('payroll_advanceLoans');
        if (saved) {
            loansData = JSON.parse(saved);
        } else {
            console.warn('⚠️ No advance loans data found in localStorage');
        }
        
        // Get current month safely
        const currentMonth = window.currentMonth || new Date().toISOString().substring(0, 7);
        console.log('📅 Using current month:', currentMonth);
        
        // Get employees array safely
        let employeesArray = [];
        if (typeof window.employees !== 'undefined' && Array.isArray(window.employees)) {
            employeesArray = window.employees;
        } else {
            console.warn('⚠️ Global employees array not found, creating minimal employee data');
            // Create minimal employee data from loan data
            Object.keys(loansData).forEach(employeeId => {
                employeesArray.push({
                    id: employeeId,
                    name: employeeId, // Use ID as name if no employee data
                    department: 'Unknown',
                    status: 'Active'
                });
            });
        }
        console.log(`👥 Found ${employeesArray.length} employees`);

    // Generate basic report data
    const summary = {
        totalEmployeesWithLoans: 0,
        totalActiveLoans: 0,
        totalActiveAmount: 0,
        totalCompletedLoans: 0,
        totalCompletedAmount: 0
    };

    const employeeDetails = [];

    Object.keys(loansData).forEach(employeeId => {
        const employee = employeesArray.find(emp => emp.id === employeeId);
        if (employee) {
            const loans = loansData[employeeId] || [];
            const activeLoans = loans.filter(loan => loan.status === 'active');
            const completedLoans = loans.filter(loan => loan.status === 'completed');

            if (activeLoans.length > 0 || completedLoans.length > 0) {
                summary.totalEmployeesWithLoans++;
                summary.totalActiveLoans += activeLoans.length;
                summary.totalCompletedLoans += completedLoans.length;

                const totalActiveAmount = activeLoans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
                const totalCompletedAmount = completedLoans.reduce((sum, loan) => sum + loan.totalAmount, 0);
                
                summary.totalActiveAmount += totalActiveAmount;
                summary.totalCompletedAmount += totalCompletedAmount;

                // Calculate current month deduction
                let currentMonthDeduction = 0;
                activeLoans.forEach(loan => {
                    const loanStartDate = new Date(loan.startMonth + '-01');
                    const checkDate = new Date(currentMonth + '-01');
                    if (checkDate >= loanStartDate && loan.remainingAmount > 0) {
                        if (loan.settlementRequested && loan.settlementMonth === currentMonth) {
                            currentMonthDeduction += loan.remainingAmount;
                        } else if (loan.nextDeductionAmount && !loan.settlementRequested) {
                            currentMonthDeduction += Math.min(loan.nextDeductionAmount, loan.remainingAmount);
                        } else {
                            currentMonthDeduction += Math.min(loan.emiAmount, loan.remainingAmount);
                        }
                    }
                });

                employeeDetails.push({
                    employeeId,
                    employeeName: employee.name,
                    department: employee.department,
                    activeLoans: activeLoans.length,
                    completedLoans: completedLoans.length,
                    totalActiveAmount,
                    totalCompletedAmount,
                    currentMonthDeduction,
                    loans: loans
                });
            }
        }
    });

    const report = {
        summary,
        employeeDetails,
        generatedOn: new Date().toISOString(),
        currentMonth: currentMonth,
        upcomingDeductions: calculateUpcomingDeductions(),
        monthlySchedule: generateMonthlySchedule(),
        settlementRequests: getSettlementRequests()
    };

    return report;
    
    } catch (error) {
        console.error('❌ Error in generateAdvanceReport:', error);
        // Return empty report structure
        return {
            summary: {
                totalEmployeesWithLoans: 0,
                totalActiveLoans: 0,
                totalActiveAmount: 0,
                totalCompletedLoans: 0,
                totalCompletedAmount: 0
            },
            employeeDetails: [],
            generatedOn: new Date().toISOString(),
            currentMonth: new Date().toISOString().substring(0, 7),
            upcomingDeductions: [],
            monthlySchedule: [],
            settlementRequests: []
        };
    }
}

// Calculate upcoming deductions for next 6 months
function calculateUpcomingDeductions() {
    try {
        const upcomingMonths = [];
        const currentMonth = window.currentMonth || new Date().toISOString().substring(0, 7);
        const startDate = new Date(currentMonth + '-01');

    for (let i = 0; i < 6; i++) {
        const month = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const monthStr = month.toISOString().substring(0, 7);
        
        let totalDeduction = 0;
        const employeeDeductions = [];

        // Get advance loans from localStorage if not available globally
        let loansData = {};
        if (window.advanceManagement && window.advanceManagement.advanceLoans) {
            loansData = window.advanceManagement.advanceLoans;
        } else {
            // Try to get from localStorage directly
            const saved = localStorage.getItem('payroll_advanceLoans');
            if (saved) {
                loansData = JSON.parse(saved);
            }
        }

        Object.keys(loansData || {}).forEach(employeeId => {
            const employee = getEmployeeData(employeeId);
            if (employee && employee.status === 'Active') {
                let deduction = 0;
                if (window.advanceManagement && window.advanceManagement.calculateMonthlyAdvanceDeduction) {
                    deduction = window.advanceManagement.calculateMonthlyAdvanceDeduction(employeeId, monthStr);
                } else {
                    // Fallback calculation
                    const activeLoans = (loansData[employeeId] || []).filter(loan => loan.status === 'active');
                    activeLoans.forEach(loan => {
                        const loanStartDate = new Date(loan.startMonth + '-01');
                        const checkDate = new Date(monthStr + '-01');
                        if (checkDate >= loanStartDate && loan.remainingAmount > 0) {
                            deduction += Math.min(loan.emiAmount, loan.remainingAmount);
                        }
                    });
                }
                
                if (deduction > 0) {
                    totalDeduction += deduction;
                    employeeDeductions.push({
                        employeeId,
                        employeeName: employee.name,
                        department: employee.department,
                        amount: deduction
                    });
                }
            }
        });

        upcomingMonths.push({
            month: monthStr,
            monthName: month.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
            totalAmount: totalDeduction,
            employeeCount: employeeDeductions.length,
            employees: employeeDeductions
        });
    }

    return upcomingMonths;
    
    } catch (error) {
        console.error('❌ Error in calculateUpcomingDeductions:', error);
        return [];
    }
}

// Generate monthly EMI schedule for all active loans
function generateMonthlySchedule() {
    try {
        const schedule = [];
    
    // Get advance loans from localStorage if not available globally
    let loansData = {};
    if (window.advanceManagement && window.advanceManagement.advanceLoans) {
        loansData = window.advanceManagement.advanceLoans;
    } else {
        const saved = localStorage.getItem('payroll_advanceLoans');
        if (saved) {
            loansData = JSON.parse(saved);
        }
    }
    
    Object.keys(loansData || {}).forEach(employeeId => {
        const employee = getEmployeeData(employeeId);
        if (employee) {
            const employeeLoans = loansData[employeeId] || [];
            
            employeeLoans.forEach(loan => {
                if (loan.status === 'active' || loan.status === 'completed') {
                    const startDate = new Date(loan.startMonth + '-01');
                    
                    for (let i = 0; i < loan.emiMonths; i++) {
                        const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
                        const monthStr = monthDate.toISOString().substring(0, 7);
                        
                        // Calculate expected deduction for this month
                        let expectedDeduction = loan.emiAmount;
                        if (loan.settlementRequested && loan.settlementMonth === monthStr) {
                            expectedDeduction = loan.remainingAmount;
                        } else if (loan.nextDeductionAmount && !loan.settlementRequested) {
                            expectedDeduction = loan.nextDeductionAmount;
                        }
                        
                        // Check if this month is already paid
                        const paidHistory = (loan.history || []).find(h => h.month === monthStr);
                        
                        schedule.push({
                            employeeId,
                            employeeName: employee.name,
                            department: employee.department,
                            loanId: loan.id,
                            totalLoanAmount: loan.totalAmount,
                            month: monthStr,
                            monthName: monthDate.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
                            expectedAmount: expectedDeduction,
                            actualAmount: paidHistory ? paidHistory.amount : 0,
                            status: paidHistory ? 'Paid' : (monthStr <= currentMonth ? 'Overdue' : 'Pending'),
                            remainingAfter: paidHistory ? paidHistory.remainingAfter : loan.remainingAmount,
                            paymentType: paidHistory ? paidHistory.type : 'regular'
                        });
                    }
                }
            });
        }
    });

    return schedule.sort((a, b) => a.month.localeCompare(b.month));
    
    } catch (error) {
        console.error('❌ Error in generateMonthlySchedule:', error);
        return [];
    }
}

// Get settlement requests
function getSettlementRequests() {
    try {
        const settlements = [];
    
    // Get advance loans from localStorage if not available globally
    let loansData = {};
    if (window.advanceManagement && window.advanceManagement.advanceLoans) {
        loansData = window.advanceManagement.advanceLoans;
    } else {
        const saved = localStorage.getItem('payroll_advanceLoans');
        if (saved) {
            loansData = JSON.parse(saved);
        }
    }
    
    Object.keys(loansData || {}).forEach(employeeId => {
        const employee = getEmployeeData(employeeId);
        if (employee) {
            const employeeLoans = loansData[employeeId] || [];
            
            employeeLoans.forEach(loan => {
                if (loan.settlementRequested && loan.status === 'active') {
                    settlements.push({
                        employeeId,
                        employeeName: employee.name,
                        department: employee.department,
                        loanId: loan.id,
                        totalAmount: loan.totalAmount,
                        remainingAmount: loan.remainingAmount,
                        settlementMonth: loan.settlementMonth,
                        requestedOn: new Date().toISOString()
                    });
                }
            });
        }
    });

    return settlements;
    
    } catch (error) {
        console.error('❌ Error in getSettlementRequests:', error);
        return [];
    }
}

// Display advance report in a modal
function showAdvanceReportModal() {
    try {
        console.log('🎯 showAdvanceReportModal called');
        
        // Check dependencies
        if (typeof Swal === 'undefined') {
            console.error('❌ SweetAlert2 not available');
            alert('SweetAlert2 library not loaded. Please refresh the page.');
            return;
        }
        
        // Get current month safely
        const currentMonth = window.currentMonth || new Date().toISOString().substring(0, 7);
        console.log('📅 Using current month:', currentMonth);
        
        const report = generateAdvanceReport();
        console.log('📊 Report generated:', report);
        
        if (!report) {
            console.error('❌ Failed to generate report');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to generate advance report. Please try again.'
            });
            return;
        }
        
        let modalContent = `
            <div class="advance-report-modal">
                <div class="mb-6">
                    <h2 class="text-2xl font-bold mb-2">Advance Loans Report</h2>
                    <p class="text-gray-600">Generated on: ${new Date().toLocaleDateString('en-IN')}</p>
                    <p class="text-gray-600">Current Month: ${new Date(currentMonth + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="text-sm font-medium text-blue-600">Employees with Loans</h3>
                    <p class="text-2xl font-bold text-blue-900">${report.summary.totalEmployeesWithLoans}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="text-sm font-medium text-green-600">Active Loans</h3>
                    <p class="text-2xl font-bold text-green-900">${report.summary.totalActiveLoans}</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <h3 class="text-sm font-medium text-yellow-600">Pending Amount</h3>
                    <p class="text-2xl font-bold text-yellow-900">₹${report.summary.totalActiveAmount.toLocaleString('en-IN')}</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <h3 class="text-sm font-medium text-purple-600">This Month's Deductions</h3>
                    <p class="text-2xl font-bold text-purple-900">₹${(report.upcomingDeductions && report.upcomingDeductions.length > 0) ? report.upcomingDeductions[0].totalAmount.toLocaleString('en-IN') : 0}</p>
                </div>
            </div>

            <!-- Tabs -->
            <div class="border-b border-gray-200 mb-4">
                <nav class="-mb-px flex space-x-8">
                    <button onclick="showReportTab('summary')" class="report-tab active" data-tab="summary">
                        Summary
                    </button>
                    <button onclick="showReportTab('upcoming')" class="report-tab" data-tab="upcoming">
                        Upcoming Deductions
                    </button>
                    <button onclick="showReportTab('schedule')" class="report-tab" data-tab="schedule">
                        EMI Schedule
                    </button>
                    <button onclick="showReportTab('settlements')" class="report-tab" data-tab="settlements">
                        Settlement Requests
                    </button>
                </nav>
            </div>

            <!-- Tab Content -->
            <div id="reportContent">
                ${generateReportTabContent(report, 'summary')}
            </div>

            <!-- Export Buttons -->
            <div class="mt-6 flex gap-2">
                <button onclick="exportAdvanceReportExcel()" class="btn-premium">
                    <i class="fas fa-file-excel mr-2"></i>Export Excel
                </button>
                <button onclick="exportAdvanceReportPDF()" class="btn-premium">
                    <i class="fas fa-file-pdf mr-2"></i>Export PDF
                </button>
            </div>
        </div>
    `;

    Swal.fire({
        title: '',
        html: modalContent,
        width: '90%',
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
            container: 'advance-report-container'
        },
        didOpen: () => {
            // Add CSS for tabs
            const style = document.createElement('style');
            style.textContent = `
                .report-tab {
                    padding: 0.5rem 1rem;
                    border-bottom: 2px solid transparent;
                    color: #6b7280;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .report-tab.active {
                    border-bottom-color: #3b82f6;
                    color: #3b82f6;
                }
                .report-tab:hover {
                    color: #3b82f6;
                }
                .advance-report-container .swal2-popup {
                    max-height: 90vh;
                    overflow-y: auto;
                }
            `;
            document.head.appendChild(style);
        }
    });
    
    } catch (error) {
        console.error('❌ Error in showAdvanceReportModal:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Failed to show advance report: ${error.message}`
        });
    }
}

// Generate report tab content
function generateReportTabContent(report, activeTab) {
    switch (activeTab) {
        case 'summary':
            return generateSummaryTab(report);
        case 'upcoming':
            return generateUpcomingTab(report);
        case 'schedule':
            return generateScheduleTab(report);
        case 'settlements':
            return generateSettlementsTab(report);
        default:
            return '';
    }
}

// Generate summary tab
function generateSummaryTab(report) {
    let content = `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Employee-wise Loan Summary</h3>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Active Loans</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Pending</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">This Month</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
    `;

    report.employeeDetails.forEach(emp => {
        content += `
            <tr>
                <td class="px-4 py-2 text-sm font-medium text-gray-900">${emp.employeeName}</td>
                <td class="px-4 py-2 text-sm text-gray-500">${emp.department}</td>
                <td class="px-4 py-2 text-sm text-gray-500">${emp.activeLoans}</td>
                <td class="px-4 py-2 text-sm text-gray-900">₹${emp.totalActiveAmount.toLocaleString('en-IN')}</td>
                <td class="px-4 py-2 text-sm text-gray-900">₹${emp.currentMonthDeduction.toLocaleString('en-IN')}</td>
            </tr>
        `;
    });

    content += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return content;
}

// Generate upcoming deductions tab
function generateUpcomingTab(report) {
    console.log('📅 generateUpcomingTab called with report:', report);
    console.log('📅 upcomingDeductions:', report.upcomingDeductions);
    
    let content = `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Upcoming 6 Months Deductions</h3>
    `;

    if (!report.upcomingDeductions || report.upcomingDeductions.length === 0) {
        console.log('⚠️ No upcoming deductions data');
        content += `
            <div class="border rounded-lg p-4 text-center">
                <p class="text-gray-500">No upcoming deductions found</p>
                <p class="text-sm text-gray-400 mt-2">This could mean:</p>
                <ul class="text-sm text-gray-400 mt-1">
                    <li>• No active advance loans</li>
                    <li>• All loans are completed</li>
                    <li>• Data loading issue</li>
                </ul>
            </div>
        `;
    } else {
        console.log(`✅ Processing ${report.upcomingDeductions.length} months of deductions`);
        report.upcomingDeductions.forEach(month => {
        content += `
            <div class="border rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-semibold">${month.monthName}</h4>
                    <span class="text-lg font-bold text-green-600">₹${month.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">${month.employeeCount} employees</p>
                
                ${month.employees.length > 0 ? `
                    <div class="space-y-1">
                        ${month.employees.map(emp => `
                            <div class="flex justify-between text-sm">
                                <span>${emp.employeeName} (${emp.department})</span>
                                <span>₹${emp.amount.toLocaleString('en-IN')}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-sm text-gray-500">No deductions scheduled</p>'}
            </div>
        `;
        });
    }

    content += '</div>';
    return content;
}

// Generate EMI schedule tab
function generateScheduleTab(report) {
    console.log('📋 generateScheduleTab called with report:', report);
    console.log('📋 monthlySchedule:', report.monthlySchedule);
    
    let content = `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Complete EMI Schedule</h3>
    `;
    
    if (!report.monthlySchedule || report.monthlySchedule.length === 0) {
        console.log('⚠️ No EMI schedule data');
        content += `
            <div class="border rounded-lg p-4 text-center">
                <p class="text-gray-500">No EMI schedule found</p>
                <p class="text-sm text-gray-400 mt-2">This could mean:</p>
                <ul class="text-sm text-gray-400 mt-1">
                    <li>• No advance loans have been created</li>
                    <li>• All loans are pending start date</li>
                    <li>• Data loading issue</li>
                </ul>
            </div>
        `;
    } else {
        console.log(`✅ Processing ${report.monthlySchedule.length} EMI schedule items`);
        content += `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
        `;

        report.monthlySchedule.forEach(item => {
        const statusClass = item.status === 'Paid' ? 'text-green-600' : item.status === 'Overdue' ? 'text-red-600' : 'text-yellow-600';
        
        content += `
            <tr>
                <td class="px-4 py-2 text-sm font-medium text-gray-900">${item.employeeName}</td>
                <td class="px-4 py-2 text-sm text-gray-500">${item.monthName}</td>
                <td class="px-4 py-2 text-sm text-gray-900">₹${item.expectedAmount.toLocaleString('en-IN')}</td>
                <td class="px-4 py-2 text-sm text-gray-900">₹${item.actualAmount.toLocaleString('en-IN')}</td>
                <td class="px-4 py-2 text-sm ${statusClass}">${item.status}</td>
                <td class="px-4 py-2 text-sm text-gray-900">₹${item.remainingAfter.toLocaleString('en-IN')}</td>
            </tr>
        `;
        });

        content += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    content += '</div>';
    return content;
}

// Generate settlements tab
function generateSettlementsTab(report) {
    console.log('🏦 generateSettlementsTab called with report:', report);
    console.log('🏦 settlementRequests:', report.settlementRequests);
    
    let content = `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Settlement Requests</h3>
    `;

    if (!report.settlementRequests || report.settlementRequests.length === 0) {
        console.log('⚠️ No settlement requests data');
        content += `
            <div class="border rounded-lg p-4 text-center">
                <p class="text-gray-500">No settlement requests pending</p>
                <p class="text-sm text-gray-400 mt-2">This means:</p>
                <ul class="text-sm text-gray-400 mt-1">
                    <li>• No employees have requested early loan settlement</li>
                    <li>• All settlements have been processed</li>
                </ul>
            </div>
        `;
    } else {
        content += `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Loan Amount</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Settlement Amount</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Settlement Month</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
        `;

        report.settlementRequests.forEach(settlement => {
            content += `
                <tr>
                    <td class="px-4 py-2 text-sm font-medium text-gray-900">${settlement.employeeName}</td>
                    <td class="px-4 py-2 text-sm text-gray-500">${settlement.department}</td>
                    <td class="px-4 py-2 text-sm text-gray-900">₹${settlement.totalAmount.toLocaleString('en-IN')}</td>
                    <td class="px-4 py-2 text-sm font-bold text-green-600">₹${settlement.remainingAmount.toLocaleString('en-IN')}</td>
                    <td class="px-4 py-2 text-sm text-gray-900">${new Date(settlement.settlementMonth + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' })}</td>
                </tr>
            `;
        });

        content += `
                    </tbody>
                </table>
            </div>
        `;
    }

    content += '</div>';
    return content;
}

// Switch report tabs
function showReportTab(tabName) {
    try {
        console.log('🎯 showReportTab called for:', tabName);
        
        // Update active tab
        document.querySelectorAll('.report-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        } else {
            console.error('❌ Tab element not found for:', tabName);
        }
        
        // Update content
        console.log('📊 Generating report for tab content...');
        const report = generateAdvanceReport();
        console.log('📊 Report for tab:', report);
        
        if (!report) {
            console.error('❌ Failed to generate report for tab');
            document.getElementById('reportContent').innerHTML = '<p class="text-red-500">Failed to load tab content</p>';
            return;
        }
        
        const content = generateReportTabContent(report, tabName);
        console.log('📋 Generated content for tab:', tabName, content ? 'success' : 'failed');
        
        const contentElement = document.getElementById('reportContent');
        if (contentElement) {
            contentElement.innerHTML = content;
            console.log('✅ Tab content updated successfully');
        } else {
            console.error('❌ reportContent element not found');
        }
        
    } catch (error) {
        console.error('❌ Error in showReportTab:', error);
        const contentElement = document.getElementById('reportContent');
        if (contentElement) {
            contentElement.innerHTML = `<p class="text-red-500">Error loading tab: ${error.message}</p>`;
        }
    }
}

// Export to Excel
function exportAdvanceReportExcel() {
    const report = generateAdvanceReport();
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
        ['Advance Loans Report - Summary'],
        ['Generated on:', new Date().toLocaleDateString('en-IN')],
        ['Current Month:', new Date(currentMonth + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' })],
        [],
        ['Overall Summary'],
        ['Total Employees with Loans:', report.summary.totalEmployeesWithLoans],
        ['Total Active Loans:', report.summary.totalActiveLoans],
        ['Total Pending Amount:', report.summary.totalActiveAmount],
        ['Total Completed Loans:', report.summary.totalCompletedLoans],
        [],
        ['Employee', 'Department', 'Active Loans', 'Pending Amount', 'This Month Deduction'],
    ];
    
    report.employeeDetails.forEach(emp => {
        summaryData.push([
            emp.employeeName,
            emp.department,
            emp.activeLoans,
            emp.totalActiveAmount,
            emp.currentMonthDeduction
        ]);
    });
    
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
    
    // Upcoming Deductions Sheet
    const upcomingData = [
        ['Upcoming Deductions - Next 6 Months'],
        [],
        ['Month', 'Total Amount', 'Employee Count', 'Employee Details'],
    ];
    
    report.upcomingDeductions.forEach(month => {
        const employeeDetails = month.employees.map(emp => 
            `${emp.employeeName} (${emp.department}): ₹${emp.amount.toLocaleString('en-IN')}`
        ).join('; ');
        
        upcomingData.push([
            month.monthName,
            month.totalAmount,
            month.employeeCount,
            employeeDetails
        ]);
    });
    
    const upcomingWS = XLSX.utils.aoa_to_sheet(upcomingData);
    XLSX.utils.book_append_sheet(wb, upcomingWS, 'Upcoming Deductions');
    
    // EMI Schedule Sheet
    const scheduleData = [
        ['Complete EMI Schedule'],
        [],
        ['Employee', 'Department', 'Month', 'Expected Amount', 'Actual Amount', 'Status', 'Remaining Amount', 'Payment Type'],
    ];
    
    report.monthlySchedule.forEach(item => {
        scheduleData.push([
            item.employeeName,
            item.department,
            item.monthName,
            item.expectedAmount,
            item.actualAmount,
            item.status,
            item.remainingAfter,
            item.paymentType
        ]);
    });
    
    const scheduleWS = XLSX.utils.aoa_to_sheet(scheduleData);
    XLSX.utils.book_append_sheet(wb, scheduleWS, 'EMI Schedule');
    
    // Settlement Requests Sheet
    if (report.settlementRequests.length > 0) {
        const settlementData = [
            ['Settlement Requests'],
            [],
            ['Employee', 'Department', 'Loan Amount', 'Settlement Amount', 'Settlement Month'],
        ];
        
        report.settlementRequests.forEach(settlement => {
            settlementData.push([
                settlement.employeeName,
                settlement.department,
                settlement.totalAmount,
                settlement.remainingAmount,
                new Date(settlement.settlementMonth + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' })
            ]);
        });
        
        const settlementWS = XLSX.utils.aoa_to_sheet(settlementData);
        XLSX.utils.book_append_sheet(wb, settlementWS, 'Settlement Requests');
    }
    
    // Download file
    const fileName = `Advance_Report_${currentMonth.replace('-', '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    Swal.fire({
        icon: 'success',
        title: 'Excel Export Complete!',
        text: `Report exported as ${fileName}`,
        timer: 2000,
        showConfirmButton: false
    });
}

// Export to PDF
function exportAdvanceReportPDF() {
    console.log('🎯 exportAdvanceReportPDF called');
    
    try {
        // Check dependencies
        if (typeof window.jspdf === 'undefined') {
            console.error('❌ jsPDF library not available');
            Swal.fire({
                icon: 'error',
                title: 'Library Missing',
                text: 'PDF library not loaded. Please refresh the page.'
            });
            return;
        }
        
        const report = generateAdvanceReport();
        console.log('📊 Report generated for PDF:', report);
        
        if (!report) {
            console.error('❌ Failed to generate report for PDF');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to generate advance report data.'
            });
            return;
        }
        
        // Get current month safely
        const currentMonth = window.currentMonth || new Date().toISOString().substring(0, 7);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Header
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Advance Loans Report', 20, 20);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 30);
        doc.text(`Current Month: ${new Date(currentMonth + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' })}`, 20, 35);
        
        let yPos = 45;
        
        // Summary section
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Summary', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Total Employees with Loans: ${report.summary.totalEmployeesWithLoans}`, 20, yPos);
        yPos += 5;
        doc.text(`Total Active Loans: ${report.summary.totalActiveLoans}`, 20, yPos);
        yPos += 5;
        doc.text(`Total Pending Amount: ₹${report.summary.totalActiveAmount.toLocaleString('en-IN')}`, 20, yPos);
        yPos += 5;
        doc.text(`This Month's Deductions: ₹${(report.upcomingDeductions && report.upcomingDeductions.length > 0) ? report.upcomingDeductions[0].totalAmount.toLocaleString('en-IN') : 0}`, 20, yPos);
        yPos += 15;
        
        // Employee-wise details table
        if (report.employeeDetails.length > 0) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('Employee-wise Loan Details', 20, yPos);
            yPos += 10;
            
            const tableData = report.employeeDetails.map(emp => [
                emp.employeeName,
                emp.department,
                emp.activeLoans.toString(),
                `₹${emp.totalActiveAmount.toLocaleString('en-IN')}`,
                `₹${emp.currentMonthDeduction.toLocaleString('en-IN')}`
            ]);
            
            doc.autoTable({
                head: [['Employee', 'Department', 'Active Loans', 'Pending Amount', 'This Month']],
                body: tableData,
                startY: yPos,
                styles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 30 },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 30 }
                }
            });
            
            yPos = doc.lastAutoTable.finalY + 15;
        }
        
        // Add new page if needed
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        
        // Upcoming deductions
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Upcoming 6 Months Deductions', 20, yPos);
        yPos += 10;
        
        const upcomingData = report.upcomingDeductions.map(month => [
            month.monthName,
            `₹${month.totalAmount.toLocaleString('en-IN')}`,
            month.employeeCount.toString()
        ]);
        
        doc.autoTable({
            head: [['Month', 'Total Amount', 'Employee Count']],
            body: upcomingData,
            startY: yPos,
            styles: { fontSize: 9 }
        });
        
        // Save the PDF
        const fileName = `Advance_Report_${currentMonth.replace('-', '_')}.pdf`;
        doc.save(fileName);
        
        Swal.fire({
            icon: 'success',
            title: 'PDF Export Complete!',
            text: `Report exported as ${fileName}`,
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error('PDF export error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Export Failed',
            text: 'Failed to generate PDF report. Please try again.'
        });
    }
}

// Simple export function without modal (for direct export)
function quickExportAdvanceExcel() {
    console.log('🎯 quickExportAdvanceExcel called');
    
    try {
        // Check if XLSX is available
        if (typeof XLSX === 'undefined') {
            console.error('❌ XLSX library not available');
            Swal.fire({
                icon: 'error',
                title: 'Library Missing',
                text: 'Excel library not loaded. Please refresh the page.'
            });
            return;
        }
        console.log('✅ XLSX library available');

        // Check if employees array is available
        if (typeof employees === 'undefined' || !Array.isArray(employees)) {
            console.warn('⚠️ Global employees array not found, will try to continue');
        } else {
            console.log(`✅ Found ${employees.length} employees`);
        }

        // Check advance loans data
        const advanceData = localStorage.getItem('payroll_advanceLoans');
        if (!advanceData) {
            console.log('❌ No advance loans data in localStorage');
            Swal.fire({
                icon: 'info',
                title: 'No Data',
                text: 'No advance loans found. Create some advance loans first.',
                timer: 3000,
                showConfirmButton: false
            });
            return;
        }
        
        const loansData = JSON.parse(advanceData);
        console.log('✅ Advance loans data found:', Object.keys(loansData).length, 'employees');

        const report = generateAdvanceReport();
        console.log('📊 Report generated:', report);
        
        if (!report || (!report.employeeDetails || report.employeeDetails.length === 0)) {
            console.log('❌ No employee details in report');
            // Try direct export anyway
            directAdvanceExport();
            return;
        }
        
        console.log('🚀 Calling exportAdvanceReportExcel...');
        exportAdvanceReportExcel();
        
    } catch (error) {
        console.error('❌ Quick export error:', error);
        console.error('Error stack:', error.stack);
        
        // Try fallback export
        console.log('🔄 Trying fallback export...');
        try {
            directAdvanceExport();
        } catch (fallbackError) {
            console.error('❌ Fallback export also failed:', fallbackError);
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: `Export error: ${error.message}`
            });
        }
    }
}

// Direct export without depending on employees array
function directAdvanceExport() {
    console.log('🔄 Running direct advance export...');
    
    const advanceData = localStorage.getItem('payroll_advanceLoans');
    if (!advanceData) {
        throw new Error('No advance loans data found');
    }
    
    const loansData = JSON.parse(advanceData);
    const wb = XLSX.utils.book_new();
    
    // Get current month for calculations
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    // Calculate totals
    let totalEmployeesWithLoans = 0;
    let totalActiveLoans = 0;
    let totalActiveAmount = 0;
    let totalCompletedLoans = 0;
    let totalCompletedAmount = 0;
    
    // Summary Sheet
    const summaryData = [
        ['Advance Loans Report - Summary'],
        ['Generated on:', new Date().toLocaleDateString('en-IN')],
        ['Current Month:', new Date(currentMonth + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' })],
        [],
        ['Overall Summary'],
    ];
    
    // Calculate summary statistics
    Object.keys(loansData).forEach(employeeId => {
        const employeeLoans = loansData[employeeId] || [];
        const activeLoans = employeeLoans.filter(loan => loan.status === 'active');
        const completedLoans = employeeLoans.filter(loan => loan.status === 'completed');
        
        if (employeeLoans.length > 0) {
            totalEmployeesWithLoans++;
            totalActiveLoans += activeLoans.length;
            totalCompletedLoans += completedLoans.length;
            totalActiveAmount += activeLoans.reduce((sum, loan) => sum + (loan.remainingAmount || 0), 0);
            totalCompletedAmount += completedLoans.reduce((sum, loan) => sum + (loan.totalAmount || 0), 0);
        }
    });
    
    summaryData.push(
        ['Total Employees with Loans:', totalEmployeesWithLoans],
        ['Total Active Loans:', totalActiveLoans],
        ['Total Pending Amount:', totalActiveAmount],
        ['Total Completed Loans:', totalCompletedLoans],
        ['Total Completed Amount:', totalCompletedAmount],
        [],
        ['Employee-wise Details'],
        ['Employee ID', 'Active Loans', 'Pending Amount', 'Completed Loans', 'This Month Deduction']
    );
    
    // Add employee details
    Object.keys(loansData).forEach(employeeId => {
        const employeeLoans = loansData[employeeId] || [];
        const activeLoans = employeeLoans.filter(loan => loan.status === 'active');
        const completedLoans = employeeLoans.filter(loan => loan.status === 'completed');
        const totalActiveAmount = activeLoans.reduce((sum, loan) => sum + (loan.remainingAmount || 0), 0);
        
        // Calculate this month's deduction
        let currentMonthDeduction = 0;
        activeLoans.forEach(loan => {
            const loanStartDate = new Date(loan.startMonth + '-01');
            const checkDate = new Date(currentMonth + '-01');
            if (checkDate >= loanStartDate && loan.remainingAmount > 0) {
                currentMonthDeduction += Math.min(loan.emiAmount || 0, loan.remainingAmount || 0);
            }
        });
        
        if (employeeLoans.length > 0) {
            summaryData.push([
                employeeId,
                activeLoans.length,
                totalActiveAmount,
                completedLoans.length,
                currentMonthDeduction
            ]);
        }
    });
    
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
    
    // Upcoming Deductions Sheet
    const upcomingData = [
        ['Upcoming Deductions - Next 6 Months'],
        [],
        ['Month', 'Total Amount', 'Employee Count', 'Employee Details']
    ];
    
    // Calculate upcoming 6 months
    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        const monthStr = date.toISOString().substring(0, 7);
        const monthName = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        
        let monthTotal = 0;
        let employeeCount = 0;
        const employeeDetails = [];
        
        Object.keys(loansData).forEach(employeeId => {
            const employeeLoans = loansData[employeeId] || [];
            const activeLoans = employeeLoans.filter(loan => loan.status === 'active');
            
            let employeeDeduction = 0;
            activeLoans.forEach(loan => {
                const loanStartDate = new Date(loan.startMonth + '-01');
                const checkDate = new Date(monthStr + '-01');
                if (checkDate >= loanStartDate && loan.remainingAmount > 0) {
                    employeeDeduction += Math.min(loan.emiAmount || 0, loan.remainingAmount || 0);
                }
            });
            
            if (employeeDeduction > 0) {
                monthTotal += employeeDeduction;
                employeeCount++;
                employeeDetails.push(`${employeeId}: ₹${employeeDeduction.toLocaleString('en-IN')}`);
            }
        });
        
        upcomingData.push([
            monthName,
            monthTotal,
            employeeCount,
            employeeDetails.join(', ')
        ]);
    }
    
    const upcomingWS = XLSX.utils.aoa_to_sheet(upcomingData);
    XLSX.utils.book_append_sheet(wb, upcomingWS, 'Upcoming Deductions');
    
    // Complete EMI Schedule Sheet
    const scheduleData = [
        ['Complete EMI Schedule'],
        [],
        ['Employee ID', 'Loan ID', 'Month', 'Expected Amount', 'Actual Amount', 'Status', 'Remaining Amount', 'Payment Type']
    ];
    
    Object.keys(loansData).forEach(employeeId => {
        const employeeLoans = loansData[employeeId] || [];
        
        employeeLoans.forEach(loan => {
            if (loan.status === 'active' || loan.status === 'completed') {
                const startDate = new Date(loan.startMonth + '-01');
                
                for (let i = 0; i < (loan.emiMonths || 1); i++) {
                    const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
                    const monthStr = monthDate.toISOString().substring(0, 7);
                    const monthName = monthDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
                    
                    // Check if this month is already paid
                    const paidHistory = (loan.history || []).find(h => h.month === monthStr);
                    const expectedAmount = loan.emiAmount || 0;
                    const actualAmount = paidHistory ? paidHistory.amount : 0;
                    const status = paidHistory ? 'Paid' : (monthStr <= currentMonth ? 'Overdue' : 'Pending');
                    const remainingAfter = paidHistory ? paidHistory.remainingAfter : loan.remainingAmount;
                    const paymentType = paidHistory ? (paidHistory.type || 'regular') : 'regular';
                    
                    scheduleData.push([
                        employeeId,
                        loan.id,
                        monthName,
                        expectedAmount,
                        actualAmount,
                        status,
                        remainingAfter,
                        paymentType
                    ]);
                }
            }
        });
    });
    
    const scheduleWS = XLSX.utils.aoa_to_sheet(scheduleData);
    XLSX.utils.book_append_sheet(wb, scheduleWS, 'EMI Schedule');
    
    // Download file
    const fileName = `Advance_Report_${currentMonth.replace('-', '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    console.log(`✅ Direct export successful: ${fileName}`);
    Swal.fire({
        icon: 'success',
        title: 'Excel Export Complete!',
        text: `Report exported as ${fileName}`,
        timer: 2000,
        showConfirmButton: false
    });
}

// Export functions
window.showAdvanceReportModal = showAdvanceReportModal;
window.showReportTab = showReportTab;
window.generateAdvanceReport = generateAdvanceReport;
window.exportAdvanceReportExcel = exportAdvanceReportExcel;
window.exportAdvanceReportPDF = exportAdvanceReportPDF;
window.quickExportAdvanceExcel = quickExportAdvanceExcel;
window.directAdvanceExport = directAdvanceExport;
window.simpleAdvancePDF = simpleAdvancePDF;

// Simple PDF export for payroll tab (fallback)
function simpleAdvancePDF() {
    console.log('🎯 simpleAdvancePDF called');
    
    try {
        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined') {
            console.error('❌ jsPDF library not available');
            alert('PDF library not loaded. Please refresh the page.');
            return;
        }
        
        // Get advance loans data
        const advanceData = localStorage.getItem('payroll_advanceLoans');
        if (!advanceData) {
            Swal.fire({
                icon: 'info',
                title: 'No Data',
                text: 'No advance loans found. Create some advance loans first.',
                timer: 3000,
                showConfirmButton: false
            });
            return;
        }
        
        const loansData = JSON.parse(advanceData);
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Header
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Advance Loans Report', 20, 20);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 30);
        doc.text(`Current Month: ${new Date().toISOString().substring(0, 7)}`, 20, 35);
        
        let yPos = 50;
        
        // Summary
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Summary', 20, yPos);
        yPos += 10;
        
        let totalEmployees = 0;
        let totalActiveAmount = 0;
        let totalActiveLoans = 0;
        
        Object.keys(loansData).forEach(employeeId => {
            const employeeLoans = loansData[employeeId] || [];
            const activeLoans = employeeLoans.filter(loan => loan.status === 'active');
            if (activeLoans.length > 0) {
                totalEmployees++;
                totalActiveLoans += activeLoans.length;
                totalActiveAmount += activeLoans.reduce((sum, loan) => sum + (loan.remainingAmount || 0), 0);
            }
        });
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Total Employees with Active Loans: ${totalEmployees}`, 20, yPos);
        yPos += 5;
        doc.text(`Total Active Loans: ${totalActiveLoans}`, 20, yPos);
        yPos += 5;
        doc.text(`Total Pending Amount: ₹${totalActiveAmount.toLocaleString('en-IN')}`, 20, yPos);
        yPos += 15;
        
        // Employee details
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Employee-wise Details', 20, yPos);
        yPos += 10;
        
        const tableData = [];
        Object.keys(loansData).forEach(employeeId => {
            const employeeLoans = loansData[employeeId] || [];
            const activeLoans = employeeLoans.filter(loan => loan.status === 'active');
            const totalAmount = activeLoans.reduce((sum, loan) => sum + (loan.remainingAmount || 0), 0);
            
            if (activeLoans.length > 0) {
                tableData.push([
                    employeeId,
                    activeLoans.length.toString(),
                    `₹${totalAmount.toLocaleString('en-IN')}`,
                    activeLoans.length > 0 ? 'Active' : 'None'
                ]);
            }
        });
        
        if (tableData.length > 0) {
            doc.autoTable({
                head: [['Employee ID', 'Active Loans', 'Pending Amount', 'Status']],
                body: tableData,
                startY: yPos,
                styles: { fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 35 },
                    3: { cellWidth: 25 }
                }
            });
        }
        
        // Save the PDF
        const fileName = `Advance_Report_${new Date().toISOString().substring(0, 7).replace('-', '_')}.pdf`;
        doc.save(fileName);
        
        console.log(`✅ Simple PDF export successful: ${fileName}`);
        Swal.fire({
            icon: 'success',
            title: 'PDF Export Complete!',
            text: `Report exported as ${fileName}`,
            timer: 2000,
            showConfirmButton: false
        });
        
    } catch (error) {
        console.error('❌ Simple PDF export error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Export Failed',
            text: `PDF export error: ${error.message}`
        });
    }
}