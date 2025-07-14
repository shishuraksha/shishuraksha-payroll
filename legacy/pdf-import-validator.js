/**
 * Data Import and Validation Module for PDF Report System
 * Handles various data sources and validates payroll data integrity
 */

class PayrollDataValidator {
    constructor() {
        this.requiredFields = [
            'empId', 'name', 'department', 'designation', 
            'basicSalary', 'grossSalary', 'netPay'
        ];
        
        this.optionalFields = [
            'hra', 'conveyance', 'otherAllowances', 'pf', 'esic', 'pt', 
            'advance', 'bankAccount', 'ifscCode', 'bankName', 
            'workingDays', 'presentDays', 'overtimeHours'
        ];
        
        this.validDepartments = [
            'Medical Staff', 'Information Technology', 'Administration', 'Support Services'
        ];
        
        this.errors = [];
        this.warnings = [];
    }
    
    validateDataset(data) {
        this.errors = [];
        this.warnings = [];
        
        if (!Array.isArray(data)) {
            this.errors.push('Data must be an array of employee records');
            return { isValid: false, errors: this.errors, warnings: this.warnings };
        }
        
        if (data.length === 0) {
            this.errors.push('Dataset cannot be empty');
            return { isValid: false, errors: this.errors, warnings: this.warnings };
        }
        
        // Validate each employee record
        data.forEach((employee, index) => {
            this.validateEmployee(employee, index + 1);
        });
        
        // Check for duplicate employee IDs
        this.checkDuplicateIds(data);
        
        // Validate overall data consistency
        this.validateDataConsistency(data);
        
        return {
            isValid: this.errors.length === 0,
            errors: this.errors,
            warnings: this.warnings,
            totalRecords: data.length,
            validRecords: data.length - this.errors.filter(e => e.includes('Employee')).length
        };
    }
    
    validateEmployee(employee, rowNumber) {
        const prefix = `Row ${rowNumber}`;
        
        // Check required fields
        this.requiredFields.forEach(field => {
            if (!employee[field] || employee[field] === '') {
                this.errors.push(`${prefix}: Missing required field '${field}'`);
            }
        });
        
        // Validate employee ID format
        if (employee.empId && !/^EMP\d{3,}$/.test(employee.empId)) {
            this.warnings.push(`${prefix}: Employee ID '${employee.empId}' doesn't follow standard format (EMP001, EMP002, etc.)`);
        }
        
        // Validate name
        if (employee.name && employee.name.length < 2) {
            this.errors.push(`${prefix}: Employee name too short`);
        }
        
        // Validate department
        if (employee.department && !this.validDepartments.includes(employee.department)) {
            this.warnings.push(`${prefix}: Unknown department '${employee.department}'. Valid departments: ${this.validDepartments.join(', ')}`);
        }
        
        // Validate salary values
        this.validateSalaryFields(employee, prefix);
        
        // Validate bank details
        this.validateBankDetails(employee, prefix);
        
        // Validate attendance data
        this.validateAttendanceData(employee, prefix);
    }
    
    validateSalaryFields(employee, prefix) {
        const numericFields = ['basicSalary', 'hra', 'conveyance', 'otherAllowances', 'grossSalary', 'pf', 'esic', 'pt', 'advance', 'netPay'];
        
        numericFields.forEach(field => {
            if (employee[field] !== undefined) {
                const value = parseFloat(employee[field]);
                if (isNaN(value) || value < 0) {
                    this.errors.push(`${prefix}: Invalid ${field} value '${employee[field]}'. Must be a positive number.`);
                }
            }
        });
        
        // Validate salary calculations
        if (employee.basicSalary && employee.grossSalary && employee.hra && employee.conveyance && employee.otherAllowances) {
            const calculatedGross = parseFloat(employee.basicSalary) + parseFloat(employee.hra || 0) + 
                                  parseFloat(employee.conveyance || 0) + parseFloat(employee.otherAllowances || 0);
            
            if (Math.abs(calculatedGross - parseFloat(employee.grossSalary)) > 1) {
                this.errors.push(`${prefix}: Gross salary calculation mismatch. Expected: ₹${calculatedGross}, Found: ₹${employee.grossSalary}`);
            }
        }
        
        // Validate net pay calculation
        if (employee.grossSalary && employee.netPay && employee.pf && employee.esic && employee.pt) {
            const calculatedNet = parseFloat(employee.grossSalary) - parseFloat(employee.pf || 0) - 
                                parseFloat(employee.esic || 0) - parseFloat(employee.pt || 0) - parseFloat(employee.advance || 0);
            
            if (Math.abs(calculatedNet - parseFloat(employee.netPay)) > 1) {
                this.warnings.push(`${prefix}: Net pay calculation mismatch. Expected: ₹${calculatedNet}, Found: ₹${employee.netPay}`);
            }
        }
        
        // Validate PF calculation (12% of basic salary)
        if (employee.basicSalary && employee.pf) {
            const expectedPF = Math.floor(parseFloat(employee.basicSalary) * 0.12);
            if (Math.abs(expectedPF - parseFloat(employee.pf)) > 10) {
                this.warnings.push(`${prefix}: PF deduction seems incorrect. Expected ~₹${expectedPF}, Found: ₹${employee.pf}`);
            }
        }
        
        // Validate ESIC calculation (0.75% of gross salary, max ₹21,000)
        if (employee.grossSalary && employee.esic) {
            const grossForESIC = Math.min(parseFloat(employee.grossSalary), 21000);
            const expectedESIC = Math.floor(grossForESIC * 0.0075);
            if (Math.abs(expectedESIC - parseFloat(employee.esic)) > 5) {
                this.warnings.push(`${prefix}: ESIC deduction seems incorrect. Expected ~₹${expectedESIC}, Found: ₹${employee.esic}`);
            }
        }
    }
    
    validateBankDetails(employee, prefix) {
        // Validate bank account number
        if (employee.bankAccount) {
            const accountNumber = employee.bankAccount.toString();
            if (accountNumber.length < 9 || accountNumber.length > 18) {
                this.warnings.push(`${prefix}: Bank account number length seems unusual (${accountNumber.length} digits)`);
            }
            
            if (!/^\d+$/.test(accountNumber)) {
                this.errors.push(`${prefix}: Bank account number should contain only digits`);
            }
        }
        
        // Validate IFSC code
        if (employee.ifscCode) {
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(employee.ifscCode)) {
                this.warnings.push(`${prefix}: IFSC code '${employee.ifscCode}' doesn't match standard format (e.g., HDFC0001234)`);
            }
        }
        
        // Validate bank name
        if (employee.bankName && employee.bankName.length < 3) {
            this.warnings.push(`${prefix}: Bank name seems too short`);
        }
    }
    
    validateAttendanceData(employee, prefix) {
        if (employee.workingDays) {
            const workingDays = parseInt(employee.workingDays);
            if (workingDays < 28 || workingDays > 31) {
                this.warnings.push(`${prefix}: Working days (${workingDays}) seems unusual for a month`);
            }
        }
        
        if (employee.presentDays && employee.workingDays) {
            const presentDays = parseInt(employee.presentDays);
            const workingDays = parseInt(employee.workingDays);
            
            if (presentDays > workingDays) {
                this.errors.push(`${prefix}: Present days (${presentDays}) cannot exceed working days (${workingDays})`);
            }
            
            if (presentDays < 0) {
                this.errors.push(`${prefix}: Present days cannot be negative`);
            }
        }
        
        if (employee.overtimeHours) {
            const overtimeHours = parseInt(employee.overtimeHours);
            if (overtimeHours < 0 || overtimeHours > 200) {
                this.warnings.push(`${prefix}: Overtime hours (${overtimeHours}) seems unusual`);
            }
        }
    }
    
    checkDuplicateIds(data) {
        const idCount = {};
        data.forEach(employee => {
            if (employee.empId) {
                idCount[employee.empId] = (idCount[employee.empId] || 0) + 1;
            }
        });
        
        Object.keys(idCount).forEach(id => {
            if (idCount[id] > 1) {
                this.errors.push(`Duplicate Employee ID found: '${id}' appears ${idCount[id]} times`);
            }
        });
    }
    
    validateDataConsistency(data) {
        // Check for reasonable salary ranges
        const salaries = data.map(emp => parseFloat(emp.grossSalary)).filter(sal => !isNaN(sal));
        
        if (salaries.length > 0) {
            const avgSalary = salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length;
            const maxSalary = Math.max(...salaries);
            const minSalary = Math.min(...salaries);
            
            if (maxSalary > avgSalary * 10) {
                this.warnings.push(`Maximum salary (₹${maxSalary.toLocaleString('en-IN')}) is unusually high compared to average (₹${avgSalary.toLocaleString('en-IN')})`);
            }
            
            if (minSalary < 10000) {
                this.warnings.push(`Minimum salary (₹${minSalary.toLocaleString('en-IN')}) seems very low`);
            }
        }
        
        // Check department distribution
        const deptCount = {};
        data.forEach(emp => {
            if (emp.department) {
                deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
            }
        });
        
        const totalEmps = data.length;
        Object.keys(deptCount).forEach(dept => {
            const percentage = (deptCount[dept] / totalEmps) * 100;
            if (percentage > 80) {
                this.warnings.push(`Department '${dept}' has ${percentage.toFixed(1)}% of all employees - check if this is correct`);
            }
        });
    }
    
    // Auto-fix common issues
    autoFixData(data) {
        const fixedData = data.map(employee => {
            const fixed = { ...employee };
            
            // Fix employee ID format
            if (fixed.empId && !/^EMP\d{3,}$/.test(fixed.empId)) {
                const numericPart = fixed.empId.replace(/\D/g, '');
                if (numericPart) {
                    fixed.empId = `EMP${numericPart.padStart(3, '0')}`;
                }
            }
            
            // Auto-calculate missing salary components
            if (fixed.basicSalary && !fixed.hra) {
                fixed.hra = Math.floor(parseFloat(fixed.basicSalary) * 0.4); // 40% HRA
            }
            
            if (fixed.basicSalary && !fixed.conveyance) {
                fixed.conveyance = Math.min(1600, Math.floor(parseFloat(fixed.basicSalary) * 0.1)); // 10% or max 1600
            }
            
            if (fixed.basicSalary && !fixed.otherAllowances) {
                fixed.otherAllowances = Math.floor(parseFloat(fixed.basicSalary) * 0.05); // 5% other allowances
            }
            
            // Auto-calculate gross salary
            if (fixed.basicSalary && fixed.hra && fixed.conveyance && fixed.otherAllowances && !fixed.grossSalary) {
                fixed.grossSalary = parseFloat(fixed.basicSalary) + parseFloat(fixed.hra) + 
                                  parseFloat(fixed.conveyance) + parseFloat(fixed.otherAllowances);
            }
            
            // Auto-calculate deductions
            if (fixed.basicSalary && !fixed.pf) {
                fixed.pf = Math.floor(parseFloat(fixed.basicSalary) * 0.12);
            }
            
            if (fixed.grossSalary && !fixed.esic) {
                const grossForESIC = Math.min(parseFloat(fixed.grossSalary), 21000);
                fixed.esic = Math.floor(grossForESIC * 0.0075);
            }
            
            if (fixed.grossSalary && !fixed.pt) {
                const gross = parseFloat(fixed.grossSalary);
                if (gross > 25000) {
                    fixed.pt = 200;
                } else if (gross > 21000) {
                    fixed.pt = 150;
                } else {
                    fixed.pt = 0;
                }
            }
            
            // Auto-calculate net pay
            if (fixed.grossSalary && fixed.pf && fixed.esic && fixed.pt && !fixed.netPay) {
                fixed.netPay = parseFloat(fixed.grossSalary) - parseFloat(fixed.pf) - 
                             parseFloat(fixed.esic) - parseFloat(fixed.pt) - parseFloat(fixed.advance || 0);
            }
            
            // Set default attendance values
            if (!fixed.workingDays) fixed.workingDays = 30;
            if (!fixed.presentDays) fixed.presentDays = fixed.workingDays;
            if (!fixed.overtimeHours) fixed.overtimeHours = 0;
            
            // Generate bank details if missing
            if (!fixed.bankAccount) {
                fixed.bankAccount = this.generateBankAccount();
            }
            
            if (!fixed.ifscCode) {
                fixed.ifscCode = 'HDFC0001234'; // Default IFSC
            }
            
            if (!fixed.bankName) {
                fixed.bankName = 'HDFC Bank'; // Default bank
            }
            
            return fixed;
        });
        
        return fixedData;
    }
    
    generateBankAccount() {
        return Math.floor(Math.random() * 9000000000000000) + 1000000000000000;
    }
    
    // Generate validation report
    generateReport(validationResult) {
        let report = `Payroll Data Validation Report\n`;
        report += `=====================================\n\n`;
        report += `Total Records: ${validationResult.totalRecords}\n`;
        report += `Valid Records: ${validationResult.validRecords}\n`;
        report += `Status: ${validationResult.isValid ? 'PASSED' : 'FAILED'}\n\n`;
        
        if (validationResult.errors.length > 0) {
            report += `ERRORS (${validationResult.errors.length}):\n`;
            report += `${'-'.repeat(50)}\n`;
            validationResult.errors.forEach(error => {
                report += `❌ ${error}\n`;
            });
            report += `\n`;
        }
        
        if (validationResult.warnings.length > 0) {
            report += `WARNINGS (${validationResult.warnings.length}):\n`;
            report += `${'-'.repeat(50)}\n`;
            validationResult.warnings.forEach(warning => {
                report += `⚠️  ${warning}\n`;
            });
            report += `\n`;
        }
        
        if (validationResult.isValid) {
            report += `✅ Data validation passed! Ready for PDF generation.\n`;
        } else {
            report += `❌ Data validation failed. Please fix the errors before proceeding.\n`;
        }
        
        return report;
    }
}

// Data Import Handlers
class DataImporter {
    constructor() {
        this.validator = new PayrollDataValidator();
    }
    
    async importFromJSON(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            return this.processImportedData(data);
        } catch (error) {
            throw new Error(`JSON parsing error: ${error.message}`);
        }
    }
    
    async importFromCSV(csvText) {
        try {
            const lines = csvText.trim().split('\n');
            if (lines.length < 2) {
                throw new Error('CSV file must have at least a header row and one data row');
            }
            
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const data = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCSVLine(lines[i]);
                const obj = {};
                
                headers.forEach((header, index) => {
                    obj[header] = values[index] || '';
                });
                
                data.push(obj);
            }
            
            return this.processImportedData(data);
        } catch (error) {
            throw new Error(`CSV parsing error: ${error.message}`);
        }
    }
    
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }
    
    async importFromExcel(file) {
        if (typeof XLSX === 'undefined') {
            throw new Error('Excel import requires XLSX library');
        }
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const workbook = XLSX.read(e.target.result, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                    
                    resolve(this.processImportedData(data));
                } catch (error) {
                    reject(new Error(`Excel parsing error: ${error.message}`));
                }
            };
            
            reader.onerror = () => reject(new Error('File reading error'));
            reader.readAsBinaryString(file);
        });
    }
    
    processImportedData(rawData) {
        // Validate the data
        const validationResult = this.validator.validateDataset(rawData);
        
        // Auto-fix data if there are only warnings
        let processedData = rawData;
        if (validationResult.warnings.length > 0 && validationResult.errors.length === 0) {
            processedData = this.validator.autoFixData(rawData);
            
            // Re-validate after fixes
            const revalidationResult = this.validator.validateDataset(processedData);
            return {
                data: processedData,
                validation: revalidationResult,
                autoFixed: true,
                report: this.validator.generateReport(revalidationResult)
            };
        }
        
        return {
            data: processedData,
            validation: validationResult,
            autoFixed: false,
            report: this.validator.generateReport(validationResult)
        };
    }
    
    // API Integration (placeholder for future expansion)
    async importFromAPI(apiEndpoint, authToken = null) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
            
            const response = await fetch(apiEndpoint, {
                method: 'GET',
                headers: headers
            });
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return this.processImportedData(data);
            
        } catch (error) {
            throw new Error(`API import error: ${error.message}`);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PayrollDataValidator,
        DataImporter
    };
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.PayrollDataValidator = PayrollDataValidator;
    window.DataImporter = DataImporter;
}