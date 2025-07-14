/**
 * Sample Data for Shishuraksha Children's Hospital Payroll Report
 * This file contains realistic sample data with proper formatting and calculations
 */

// Sample Employee Data with Fixed Issues
const sampleEmployeeData = [
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
    },
    {
        empId: "EMP002",
        name: "Dr. Priya Sharma",
        department: "Medical Staff",
        designation: "Pediatric Surgeon",
        basicSalary: 120000,
        hra: 48000,
        conveyance: 2500,
        otherAllowances: 8000,
        grossSalary: 178500,
        pf: 14400,
        esic: 1338,
        pt: 200,
        advance: 5000,
        netPay: 157562,
        bankAccount: "2345678901234567",
        ifscCode: "ICICI0002345",
        bankName: "ICICI Bank",
        workingDays: 30,
        presentDays: 28,
        overtimeHours: 12
    },
    {
        empId: "EMP003",
        name: "Nurse Meera Patel",
        department: "Medical Staff",
        designation: "Staff Nurse",
        basicSalary: 32000,
        hra: 12800,
        conveyance: 1500,
        otherAllowances: 2000,
        grossSalary: 48300,
        pf: 3840,
        esic: 362,
        pt: 150,
        advance: 0,
        netPay: 43948,
        bankAccount: "3456789012345678",
        ifscCode: "SBI0003456",
        bankName: "State Bank of India",
        workingDays: 30,
        presentDays: 29,
        overtimeHours: 6
    },
    {
        empId: "EMP004",
        name: "Rajesh Gupta",
        department: "Information Technology",
        designation: "IT Manager",
        basicSalary: 75000,
        hra: 30000,
        conveyance: 2000,
        otherAllowances: 5000,
        grossSalary: 112000,
        pf: 9000,
        esic: 840,
        pt: 200,
        advance: 0,
        netPay: 101960,
        bankAccount: "4567890123456789",
        ifscCode: "AXIS0004567",
        bankName: "Axis Bank",
        workingDays: 30,
        presentDays: 30,
        overtimeHours: 10
    },
    {
        empId: "EMP005",
        name: "Suresh Reddy",
        department: "Information Technology",
        designation: "Software Developer",
        basicSalary: 55000,
        hra: 22000,
        conveyance: 1800,
        otherAllowances: 3000,
        grossSalary: 81800,
        pf: 6600,
        esic: 613,
        pt: 200,
        advance: 2000,
        netPay: 72387,
        bankAccount: "5678901234567890",
        ifscCode: "KOTAK0005678",
        bankName: "Kotak Mahindra Bank",
        workingDays: 30,
        presentDays: 28,
        overtimeHours: 4
    },
    {
        empId: "EMP006",
        name: "Anita Singh",
        department: "Administration",
        designation: "HR Manager",
        basicSalary: 65000,
        hra: 26000,
        conveyance: 2000,
        otherAllowances: 4000,
        grossSalary: 97000,
        pf: 7800,
        esic: 727,
        pt: 200,
        advance: 0,
        netPay: 88273,
        bankAccount: "6789012345678901",
        ifscCode: "UNION0006789",
        bankName: "Union Bank of India",
        workingDays: 30,
        presentDays: 30,
        overtimeHours: 0
    },
    {
        empId: "EMP007",
        name: "Vijay Kumar",
        department: "Administration",
        designation: "Accountant",
        basicSalary: 42000,
        hra: 16800,
        conveyance: 1500,
        otherAllowances: 2500,
        grossSalary: 62800,
        pf: 5040,
        esic: 470,
        pt: 150,
        advance: 1000,
        netPay: 56140,
        bankAccount: "7890123456789012",
        ifscCode: "PNB0007890",
        bankName: "Punjab National Bank",
        workingDays: 30,
        presentDays: 29,
        overtimeHours: 2
    },
    {
        empId: "EMP008",
        name: "Sunita Joshi",
        department: "Administration",
        designation: "Receptionist",
        basicSalary: 25000,
        hra: 10000,
        conveyance: 1200,
        otherAllowances: 1500,
        grossSalary: 37700,
        pf: 3000,
        esic: 282,
        pt: 100,
        advance: 0,
        netPay: 34318,
        bankAccount: "8901234567890123",
        ifscCode: "BOI0008901",
        bankName: "Bank of India",
        workingDays: 30,
        presentDays: 27,
        overtimeHours: 0
    },
    {
        empId: "EMP009",
        name: "Ramesh Yadav",
        department: "Support Services",
        designation: "Security Guard",
        basicSalary: 20000,
        hra: 8000,
        conveyance: 1000,
        otherAllowances: 1000,
        grossSalary: 30000,
        pf: 2400,
        esic: 225,
        pt: 0,
        advance: 0,
        netPay: 27375,
        bankAccount: "9012345678901234",
        ifscCode: "CANARA0009012",
        bankName: "Canara Bank",
        workingDays: 30,
        presentDays: 30,
        overtimeHours: 15
    },
    {
        empId: "EMP010",
        name: "Lakshmi Devi",
        department: "Support Services",
        designation: "Cleaning Staff",
        basicSalary: 18000,
        hra: 7200,
        conveyance: 800,
        otherAllowances: 800,
        grossSalary: 26800,
        pf: 2160,
        esic: 201,
        pt: 0,
        advance: 500,
        netPay: 23939,
        bankAccount: "0123456789012345",
        ifscCode: "IOB0000123",
        bankName: "Indian Overseas Bank",
        workingDays: 30,
        presentDays: 26,
        overtimeHours: 0
    },
    // Adding more employees to reach 68 total
    {
        empId: "EMP011",
        name: "Dr. Arun Jain",
        department: "Medical Staff",
        designation: "Anesthesiologist",
        basicSalary: 110000,
        hra: 44000,
        conveyance: 2500,
        otherAllowances: 7500,
        grossSalary: 164000,
        pf: 13200,
        esic: 1230,
        pt: 200,
        advance: 0,
        netPay: 149370,
        bankAccount: "1122334455667788",
        ifscCode: "HDFC0001122",
        bankName: "HDFC Bank",
        workingDays: 30,
        presentDays: 30,
        overtimeHours: 6
    },
    {
        empId: "EMP012",
        name: "Dr. Kavita Nair",
        department: "Medical Staff",
        designation: "Radiologist",
        basicSalary: 95000,
        hra: 38000,
        conveyance: 2500,
        otherAllowances: 6000,
        grossSalary: 141500,
        pf: 11400,
        esic: 1061,
        pt: 200,
        advance: 3000,
        netPay: 125839,
        bankAccount: "2233445566778899",
        ifscCode: "ICICI0002233",
        bankName: "ICICI Bank",
        workingDays: 30,
        presentDays: 29,
        overtimeHours: 4
    }
    // Add more employees as needed to reach 68 total...
];

// Generate additional employees to reach 68 total
function generateAdditionalEmployees() {
    const departments = ["Medical Staff", "Information Technology", "Administration", "Support Services"];
    const designations = {
        "Medical Staff": ["Junior Doctor", "Staff Nurse", "Ward Boy", "Lab Technician", "Pharmacist"],
        "Information Technology": ["System Admin", "Network Engineer", "Database Admin", "Support Engineer"],
        "Administration": ["Assistant", "Clerk", "Manager", "Supervisor"],
        "Support Services": ["Housekeeping", "Maintenance", "Driver", "Helper", "Cook"]
    };
    
    const names = [
        "Amit Sharma", "Ravi Kumar", "Sita Devi", "Mohan Lal", "Geeta Rani",
        "Suresh Babu", "Radha Krishna", "Manoj Tiwari", "Sushma Gupta", "Rakesh Singh",
        "Pooja Agarwal", "Vinod Yadav", "Neha Joshi", "Ashok Verma", "Priyanka Mehta",
        "Rohit Pandey", "Savita Singh", "Kiran Patel", "Dinesh Kumar", "Meera Sharma",
        "Ajay Mishra", "Sangeeta Devi", "Raju Rao", "Kavita Kumari", "Sunil Gupta",
        "Asha Rani", "Mukesh Jain", "Ritu Agarwal", "Deepak Singh", "Sunita Kumari",
        "Mahesh Yadav", "Rekha Devi", "Naresh Kumar", "Shanti Bai", "Girish Sharma",
        "Pushpa Devi", "Ramesh Singh", "Kamala Devi", "Bharat Kumar", "Usha Rani",
        "Sanjay Tiwari", "Parvati Devi", "Jagdish Rao", "Lata Sharma", "Pramod Kumar",
        "Sarita Gupta", "Raj Kumar", "Manju Devi", "Pankaj Singh", "Shobha Rani",
        "Anil Yadav", "Sudha Devi", "Raman Sharma", "Nirmala Kumari", "Vikash Singh",
        "Anita Devi", "Brijesh Kumar", "Seema Agarwal", "Govind Rao", "Kalpana Sharma"
    ];
    
    const banks = [
        { name: "State Bank of India", code: "SBI" },
        { name: "HDFC Bank", code: "HDFC" },
        { name: "ICICI Bank", code: "ICICI" },
        { name: "Axis Bank", code: "AXIS" },
        { name: "Kotak Mahindra Bank", code: "KOTAK" },
        { name: "Punjab National Bank", code: "PNB" },
        { name: "Bank of Baroda", code: "BOB" },
        { name: "Canara Bank", code: "CANARA" },
        { name: "Union Bank of India", code: "UNION" },
        { name: "Bank of India", code: "BOI" }
    ];
    
    let currentEmpNum = 13;
    
    while (sampleEmployeeData.length < 68 && currentEmpNum <= 100) {
        const department = departments[Math.floor(Math.random() * departments.length)];
        const designation = designations[department][Math.floor(Math.random() * designations[department].length)];
        const name = names[Math.floor(Math.random() * names.length)];
        const bank = banks[Math.floor(Math.random() * banks.length)];
        
        // Salary ranges based on department and designation
        let basicSalary;
        if (department === "Medical Staff") {
            basicSalary = Math.floor(Math.random() * 40000) + 30000; // 30k-70k
        } else if (department === "Information Technology") {
            basicSalary = Math.floor(Math.random() * 35000) + 35000; // 35k-70k
        } else if (department === "Administration") {
            basicSalary = Math.floor(Math.random() * 30000) + 25000; // 25k-55k
        } else {
            basicSalary = Math.floor(Math.random() * 15000) + 18000; // 18k-33k
        }
        
        const hra = Math.floor(basicSalary * 0.4);
        const conveyance = Math.floor(Math.random() * 1000) + 1000;
        const otherAllowances = Math.floor(Math.random() * 3000) + 1000;
        const grossSalary = basicSalary + hra + conveyance + otherAllowances;
        
        const pf = Math.floor(basicSalary * 0.12);
        const esic = Math.floor(grossSalary * 0.0075);
        const pt = grossSalary > 21000 ? (grossSalary > 25000 ? 200 : 150) : 0;
        const advance = Math.random() > 0.8 ? Math.floor(Math.random() * 5000) : 0;
        
        const netPay = grossSalary - pf - esic - pt - advance;
        
        sampleEmployeeData.push({
            empId: `EMP${String(currentEmpNum).padStart(3, '0')}`,
            name: name,
            department: department,
            designation: designation,
            basicSalary: basicSalary,
            hra: hra,
            conveyance: conveyance,
            otherAllowances: otherAllowances,
            grossSalary: grossSalary,
            pf: pf,
            esic: esic,
            pt: pt,
            advance: advance,
            netPay: netPay,
            bankAccount: `${Math.floor(Math.random() * 9000000000000000) + 1000000000000000}`,
            ifscCode: `${bank.code}000${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
            bankName: bank.name,
            workingDays: 30,
            presentDays: Math.floor(Math.random() * 5) + 26, // 26-30 days
            overtimeHours: Math.floor(Math.random() * 15)
        });
        
        currentEmpNum++;
    }
}

// Generate additional employees
generateAdditionalEmployees();

// Department Summary Data
const departmentSummary = {
    "Medical Staff": {
        totalEmployees: sampleEmployeeData.filter(emp => emp.department === "Medical Staff").length,
        totalGross: sampleEmployeeData.filter(emp => emp.department === "Medical Staff").reduce((sum, emp) => sum + emp.grossSalary, 0),
        totalNet: sampleEmployeeData.filter(emp => emp.department === "Medical Staff").reduce((sum, emp) => sum + emp.netPay, 0),
        avgSalary: 0,
        presentDays: 0,
        overtimeHours: 0
    },
    "Information Technology": {
        totalEmployees: sampleEmployeeData.filter(emp => emp.department === "Information Technology").length,
        totalGross: sampleEmployeeData.filter(emp => emp.department === "Information Technology").reduce((sum, emp) => sum + emp.grossSalary, 0),
        totalNet: sampleEmployeeData.filter(emp => emp.department === "Information Technology").reduce((sum, emp) => sum + emp.netPay, 0),
        avgSalary: 0,
        presentDays: 0,
        overtimeHours: 0
    },
    "Administration": {
        totalEmployees: sampleEmployeeData.filter(emp => emp.department === "Administration").length,
        totalGross: sampleEmployeeData.filter(emp => emp.department === "Administration").reduce((sum, emp) => sum + emp.grossSalary, 0),
        totalNet: sampleEmployeeData.filter(emp => emp.department === "Administration").reduce((sum, emp) => sum + emp.netPay, 0),
        avgSalary: 0,
        presentDays: 0,
        overtimeHours: 0
    },
    "Support Services": {
        totalEmployees: sampleEmployeeData.filter(emp => emp.department === "Support Services").length,
        totalGross: sampleEmployeeData.filter(emp => emp.department === "Support Services").reduce((sum, emp) => sum + emp.grossSalary, 0),
        totalNet: sampleEmployeeData.filter(emp => emp.department === "Support Services").reduce((sum, emp) => sum + emp.netPay, 0),
        avgSalary: 0,
        presentDays: 0,
        overtimeHours: 0
    }
};

// Calculate averages and totals
Object.keys(departmentSummary).forEach(dept => {
    const deptData = departmentSummary[dept];
    deptData.avgSalary = Math.floor(deptData.totalGross / deptData.totalEmployees);
    
    const deptEmployees = sampleEmployeeData.filter(emp => emp.department === dept);
    deptData.presentDays = deptEmployees.reduce((sum, emp) => sum + emp.presentDays, 0);
    deptData.overtimeHours = deptEmployees.reduce((sum, emp) => sum + emp.overtimeHours, 0);
});

// Attendance Summary Data
const attendanceSummary = {
    totalWorkingDays: 30,
    totalHolidays: 4,
    overallAttendanceRate: 96.5,
    totalOvertimeHours: sampleEmployeeData.reduce((sum, emp) => sum + emp.overtimeHours, 0),
    departmentWiseAttendance: {}
};

// Calculate department-wise attendance
Object.keys(departmentSummary).forEach(dept => {
    const deptEmployees = sampleEmployeeData.filter(emp => emp.department === dept);
    const totalPossibleDays = deptEmployees.length * 30;
    const totalPresentDays = deptEmployees.reduce((sum, emp) => sum + emp.presentDays, 0);
    const attendanceRate = ((totalPresentDays / totalPossibleDays) * 100).toFixed(1);
    
    attendanceSummary.departmentWiseAttendance[dept] = {
        totalEmployees: deptEmployees.length,
        totalPresentDays: totalPresentDays,
        totalAbsentDays: totalPossibleDays - totalPresentDays,
        overtimeHours: deptEmployees.reduce((sum, emp) => sum + emp.overtimeHours, 0),
        attendanceRate: parseFloat(attendanceRate)
    };
});

// Compliance Data
const complianceData = {
    pf: {
        totalEmployeeContribution: sampleEmployeeData.reduce((sum, emp) => sum + emp.pf, 0),
        totalEmployerContribution: sampleEmployeeData.reduce((sum, emp) => sum + emp.pf, 0),
        employeesCovered: sampleEmployeeData.filter(emp => emp.pf > 0).length,
        status: "Compliant"
    },
    esic: {
        totalEmployeeContribution: sampleEmployeeData.reduce((sum, emp) => sum + emp.esic, 0),
        totalEmployerContribution: Math.floor(sampleEmployeeData.reduce((sum, emp) => sum + emp.esic, 0) * 3.5),
        employeesCovered: sampleEmployeeData.length,
        status: "Compliant"
    },
    pt: {
        totalDeduction: sampleEmployeeData.reduce((sum, emp) => sum + emp.pt, 0),
        employeesLiable: sampleEmployeeData.filter(emp => emp.pt > 0).length,
        exempted: sampleEmployeeData.filter(emp => emp.pt === 0).length,
        status: "Compliant"
    }
};

// Report Metadata
const reportMetadata = {
    reportPeriod: "June 2025",
    generationDate: new Date().toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    }),
    reportId: `SCH-PR-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
    totalEmployees: sampleEmployeeData.length,
    totalGrossPayroll: sampleEmployeeData.reduce((sum, emp) => sum + emp.grossSalary, 0),
    totalNetPayroll: sampleEmployeeData.reduce((sum, emp) => sum + emp.netPay, 0),
    totalDeductions: sampleEmployeeData.reduce((sum, emp) => sum + emp.pf + emp.esic + emp.pt, 0),
    totalAdvances: sampleEmployeeData.reduce((sum, emp) => sum + emp.advance, 0),
    averageSalary: 0
};

// Calculate average salary
reportMetadata.averageSalary = Math.floor(reportMetadata.totalGrossPayroll / reportMetadata.totalEmployees);

// Export all data
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sampleEmployeeData,
        departmentSummary,
        attendanceSummary,
        complianceData,
        reportMetadata
    };
}