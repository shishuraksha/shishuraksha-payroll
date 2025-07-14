/**
 * Advance Management Utility
 * Handles employee advance loans and EMI-based recovery
 */

// Store advance loan details
let advanceLoans = {};

// Initialize advance loans from localStorage
function loadAdvanceLoans() {
    const saved = localStorage.getItem('payroll_advanceLoans');
    if (saved) {
        advanceLoans = JSON.parse(saved);
    }
}

// Save advance loans to localStorage
function saveAdvanceLoans() {
    localStorage.setItem('payroll_advanceLoans', JSON.stringify(advanceLoans));
}

// Create a new advance loan
function createAdvanceLoan(employeeId, loanDetails) {
    const loan = {
        id: Date.now().toString(),
        employeeId: employeeId,
        totalAmount: parseFloat(loanDetails.amount) || 0,
        emiMonths: parseInt(loanDetails.months) || 1,
        emiAmount: 0,
        startMonth: loanDetails.startMonth || currentMonth,
        remainingAmount: parseFloat(loanDetails.amount) || 0,
        remainingMonths: parseInt(loanDetails.months) || 1,
        status: 'active',
        createdDate: new Date().toISOString(),
        history: []
    };

    // Calculate EMI amount
    loan.emiAmount = Math.ceil(loan.totalAmount / loan.emiMonths);

    // Initialize or update employee's loans
    if (!advanceLoans[employeeId]) {
        advanceLoans[employeeId] = [];
    }
    advanceLoans[employeeId].push(loan);

    saveAdvanceLoans();
    return loan;
}

// Get active loans for an employee
function getActiveLoans(employeeId) {
    if (!advanceLoans[employeeId]) return [];
    return advanceLoans[employeeId].filter(loan => loan.status === 'active');
}

// DEPRECATED - use calculateMonthlyAdvanceDeduction instead
function calculateMonthlyAdvanceDeductionOld(employeeId, month = currentMonth) {
    const activeLoans = getActiveLoans(employeeId);
    let totalDeduction = 0;

    activeLoans.forEach(loan => {
        if (isLoanActiveForMonth(loan, month)) {
            // Calculate deduction for this loan
            const deduction = Math.min(loan.emiAmount, loan.remainingAmount);
            totalDeduction += deduction;
        }
    });

    return totalDeduction;
}

// Check if loan is active for a specific month
function isLoanActiveForMonth(loan, month) {
    const loanStartDate = new Date(loan.startMonth + '-01');
    const checkDate = new Date(month + '-01');
    
    return checkDate >= loanStartDate && loan.remainingAmount > 0;
}

// Process advance deduction for payroll
function processAdvanceDeduction(employeeId, month = currentMonth) {
    const activeLoans = getActiveLoans(employeeId);
    let totalDeducted = 0;
    const deductionDetails = [];

    activeLoans.forEach(loan => {
        if (isLoanActiveForMonth(loan, month)) {
            const deduction = Math.min(loan.emiAmount, loan.remainingAmount);
            
            // Update loan details
            loan.remainingAmount -= deduction;
            loan.remainingMonths = Math.max(0, loan.remainingMonths - 1);
            
            // Add to history
            loan.history.push({
                month: month,
                amount: deduction,
                date: new Date().toISOString(),
                remainingAfter: loan.remainingAmount
            });

            // Update status if fully paid
            if (loan.remainingAmount <= 0) {
                loan.status = 'completed';
                loan.completedDate = new Date().toISOString();
            }

            totalDeducted += deduction;
            deductionDetails.push({
                loanId: loan.id,
                amount: deduction,
                remaining: loan.remainingAmount
            });
        }
    });

    saveAdvanceLoans();
    return {
        totalDeducted,
        details: deductionDetails
    };
}

// Get advance summary for an employee
function getAdvanceSummary(employeeId) {
    const loans = advanceLoans[employeeId] || [];
    const activeLoans = loans.filter(loan => loan.status === 'active');
    const completedLoans = loans.filter(loan => loan.status === 'completed');

    const totalActive = activeLoans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
    const totalCompleted = completedLoans.reduce((sum, loan) => sum + loan.totalAmount, 0);

    return {
        activeLoans: activeLoans.length,
        completedLoans: completedLoans.length,
        totalActiveAmount: totalActive,
        totalCompletedAmount: totalCompleted,
        currentMonthDeduction: calculateMonthlyAdvanceDeduction(employeeId),
        loans: loans
    };
}

// Cancel or modify an advance loan
function modifyAdvanceLoan(employeeId, loanId, modifications) {
    if (!advanceLoans[employeeId]) return false;

    const loanIndex = advanceLoans[employeeId].findIndex(loan => loan.id === loanId);
    if (loanIndex === -1) return false;

    const loan = advanceLoans[employeeId][loanIndex];

    if (modifications.cancel) {
        loan.status = 'cancelled';
        loan.cancelledDate = new Date().toISOString();
    } else if (modifications.settle) {
        // Early settlement - mark as settled this month
        loan.nextDeductionAmount = loan.remainingAmount; // Deduct full amount next time
        loan.settlementRequested = true;
        loan.settlementMonth = currentMonth;
    } else if (modifications.changeNextEMI) {
        // Change only the next EMI amount
        loan.nextDeductionAmount = parseFloat(modifications.changeNextEMI);
        loan.modifiedEMI = true;
    } else {
        // Update loan details
        if (modifications.emiAmount) {
            loan.emiAmount = parseFloat(modifications.emiAmount);
            loan.remainingMonths = Math.ceil(loan.remainingAmount / loan.emiAmount);
        }
        if (modifications.remainingAmount !== undefined) {
            loan.remainingAmount = parseFloat(modifications.remainingAmount);
        }
    }

    saveAdvanceLoans();
    return true;
}

// Calculate current month's advance deduction with modifications
function calculateMonthlyAdvanceDeduction(employeeId, month = currentMonth) {
    const activeLoans = getActiveLoans(employeeId);
    let totalDeduction = 0;

    activeLoans.forEach(loan => {
        if (isLoanActiveForMonth(loan, month)) {
            // Check for special deduction amounts
            if (loan.settlementRequested && loan.settlementMonth === month) {
                // Full settlement requested
                totalDeduction += loan.remainingAmount;
            } else if (loan.nextDeductionAmount && !loan.settlementRequested) {
                // Modified EMI for this month only
                const deduction = Math.min(loan.nextDeductionAmount, loan.remainingAmount);
                totalDeduction += deduction;
                // Reset after use
                delete loan.nextDeductionAmount;
                delete loan.modifiedEMI;
                saveAdvanceLoans();
            } else {
                // Regular EMI
                const deduction = Math.min(loan.emiAmount, loan.remainingAmount);
                totalDeduction += deduction;
            }
        }
    });

    return totalDeduction;
}

// Process advance deduction for payroll with modifications
function processAdvanceDeduction(employeeId, month = currentMonth) {
    const activeLoans = getActiveLoans(employeeId);
    let totalDeducted = 0;
    const deductionDetails = [];

    activeLoans.forEach(loan => {
        if (isLoanActiveForMonth(loan, month)) {
            let deduction = 0;
            
            // Determine deduction amount based on loan status
            if (loan.settlementRequested && loan.settlementMonth === month) {
                // Full settlement
                deduction = loan.remainingAmount;
                loan.settlementCompleted = true;
            } else if (loan.nextDeductionAmount && !loan.settlementRequested) {
                // Modified EMI for this month
                deduction = Math.min(loan.nextDeductionAmount, loan.remainingAmount);
                delete loan.nextDeductionAmount;
                delete loan.modifiedEMI;
            } else {
                // Regular EMI
                deduction = Math.min(loan.emiAmount, loan.remainingAmount);
            }
            
            // Update loan details
            loan.remainingAmount -= deduction;
            loan.remainingMonths = Math.max(0, Math.ceil(loan.remainingAmount / loan.emiAmount));
            
            // Add to history
            loan.history.push({
                month: month,
                amount: deduction,
                date: new Date().toISOString(),
                remainingAfter: loan.remainingAmount,
                type: loan.settlementRequested ? 'settlement' : (loan.modifiedEMI ? 'modified' : 'regular')
            });

            // Update status if fully paid
            if (loan.remainingAmount <= 0) {
                loan.status = 'completed';
                loan.completedDate = new Date().toISOString();
                if (loan.settlementRequested) {
                    loan.completionType = 'early_settlement';
                }
            }

            // Clear settlement flags
            if (loan.settlementRequested) {
                delete loan.settlementRequested;
                delete loan.settlementMonth;
            }

            totalDeducted += deduction;
            deductionDetails.push({
                loanId: loan.id,
                amount: deduction,
                remaining: loan.remainingAmount,
                type: loan.history[loan.history.length - 1].type
            });
        }
    });

    saveAdvanceLoans();
    return {
        totalDeducted,
        details: deductionDetails
    };
}

// Generate advance report
function generateAdvanceReport() {
    const report = {
        summary: {
            totalEmployeesWithLoans: 0,
            totalActiveLoans: 0,
            totalActiveAmount: 0,
            totalCompletedLoans: 0,
            totalCompletedAmount: 0
        },
        employeeDetails: []
    };

    Object.keys(advanceLoans).forEach(employeeId => {
        const employee = employees.find(emp => emp.id === employeeId);
        if (employee) {
            const summary = getAdvanceSummary(employeeId);
            if (summary.activeLoans > 0 || summary.completedLoans > 0) {
                report.summary.totalEmployeesWithLoans++;
                report.summary.totalActiveLoans += summary.activeLoans;
                report.summary.totalActiveAmount += summary.totalActiveAmount;
                report.summary.totalCompletedLoans += summary.completedLoans;
                report.summary.totalCompletedAmount += summary.totalCompletedAmount;

                report.employeeDetails.push({
                    employeeId: employeeId,
                    employeeName: employee.name,
                    department: employee.department,
                    ...summary
                });
            }
        }
    });

    return report;
}

// Initialize on load
loadAdvanceLoans();

// Export functions
window.advanceManagement = {
    createAdvanceLoan,
    getActiveLoans,
    calculateMonthlyAdvanceDeduction,
    processAdvanceDeduction,
    getAdvanceSummary,
    modifyAdvanceLoan,
    generateAdvanceReport,
    loadAdvanceLoans,
    saveAdvanceLoans
};