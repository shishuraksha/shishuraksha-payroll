/**
 * Data Import Utility
 * Handles importing employee data from CSV/Excel files
 */

// Parse CSV content
function parseCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const record = {};
        headers.forEach((header, index) => {
            record[header] = values[index] || '';
        });
        records.push(record);
    }

    return records;
}

// Map imported data to employee structure
function mapImportedData(records) {
    const mappedEmployees = [];
    const errors = [];

    records.forEach((record, index) => {
        try {
            // Map fields from various possible column names
            const employee = {
                id: record.id || record.employeeid || record.empid || record.employee_id || `EMP${String(index + 1).padStart(3, '0')}`,
                name: record.name || record.employeename || record.employee_name || '',
                department: record.department || record.dept || '',
                designation: record.designation || record.position || record.role || '',
                bankAccount: record.bankaccount || record.bank_account || record.accountno || record.account_no || '',
                ifsc: record.ifsc || record.ifsccode || record.ifsc_code || '',
                basicSalary: parseFloat(record.basicsalary || record.basic_salary || record.salary || record.basic || '0') || 0,
                hra: parseFloat(record.hra || record.house_rent_allowance || '0') || 0,
                conveyance: parseFloat(record.conveyance || record.conveyance_allowance || '0') || 0,
                otherAllowances: parseFloat(record.otherallowances || record.other_allowances || record.other || '0') || 0,
                status: record.status || 'Active',
                uan: record.uan || record.pf || record.pfnumber || record.pf_number || '',
                esicNumber: record.esic || record.esicnumber || record.esic_number || '',
                advance: parseFloat(record.advance || '0') || 0,
                hasPF: record.haspf !== 'false' && record.haspf !== '0' && record.haspf !== 'no',
                hasESIC: record.hasesic !== 'false' && record.hasesic !== '0' && record.hasesic !== 'no',
                hasPT: record.haspt !== 'false' && record.haspt !== '0' && record.haspt !== 'no'
            };

            // Validate required fields
            if (!employee.name) {
                errors.push(`Row ${index + 2}: Employee name is required`);
            }
            if (!employee.bankAccount) {
                errors.push(`Row ${index + 2}: Bank account is required`);
            }
            if (!employee.ifsc) {
                errors.push(`Row ${index + 2}: IFSC code is required`);
            }
            if (employee.basicSalary <= 0) {
                errors.push(`Row ${index + 2}: Basic salary must be greater than 0`);
            }

            // If employee has PF/ESIC numbers but flags are not explicitly set, enable them
            if (employee.uan && employee.hasPF === undefined) {
                employee.hasPF = true;
            }
            if (employee.esicNumber && employee.hasESIC === undefined) {
                employee.hasESIC = true;
            }

            mappedEmployees.push(employee);
        } catch (error) {
            errors.push(`Row ${index + 2}: ${error.message}`);
        }
    });

    return { employees: mappedEmployees, errors };
}

// Import employees from file
async function importEmployees(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                let records = [];
                const content = e.target.result;
                
                if (file.name.endsWith('.csv')) {
                    records = parseCSV(content);
                } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    // Parse Excel using SheetJS
                    const workbook = XLSX.read(content, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    records = XLSX.utils.sheet_to_json(worksheet, { raw: false });
                    
                    // Convert keys to lowercase
                    records = records.map(record => {
                        const lowercaseRecord = {};
                        Object.keys(record).forEach(key => {
                            lowercaseRecord[key.toLowerCase()] = record[key];
                        });
                        return lowercaseRecord;
                    });
                } else {
                    throw new Error('Unsupported file format. Please use CSV or Excel files.');
                }

                const { employees: mappedEmployees, errors } = mapImportedData(records);
                
                resolve({
                    success: true,
                    employees: mappedEmployees,
                    errors: errors,
                    totalRecords: records.length,
                    successfulRecords: mappedEmployees.length
                });
            } catch (error) {
                reject({
                    success: false,
                    error: error.message
                });
            }
        };
        
        reader.onerror = () => {
            reject({
                success: false,
                error: 'Failed to read file'
            });
        };
        
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            reader.readAsBinaryString(file);
        } else {
            reader.readAsText(file);
        }
    });
}

// Merge imported employees with existing ones
function mergeEmployees(existingEmployees, importedEmployees, mergeStrategy = 'update') {
    const mergedEmployees = [...existingEmployees];
    const addedEmployees = [];
    const updatedEmployees = [];
    const skippedEmployees = [];

    importedEmployees.forEach(importedEmp => {
        const existingIndex = mergedEmployees.findIndex(emp => 
            emp.id === importedEmp.id || 
            (emp.name === importedEmp.name && emp.department === importedEmp.department)
        );

        if (existingIndex !== -1) {
            if (mergeStrategy === 'update') {
                // Update existing employee with imported data
                mergedEmployees[existingIndex] = {
                    ...mergedEmployees[existingIndex],
                    ...importedEmp,
                    // Preserve some fields that might not be in import
                    id: mergedEmployees[existingIndex].id // Keep original ID
                };
                updatedEmployees.push(importedEmp.name);
            } else if (mergeStrategy === 'skip') {
                skippedEmployees.push(importedEmp.name);
            }
        } else {
            // Add new employee
            mergedEmployees.push(importedEmp);
            addedEmployees.push(importedEmp.name);
        }
    });

    return {
        employees: mergedEmployees,
        added: addedEmployees,
        updated: updatedEmployees,
        skipped: skippedEmployees
    };
}

// Export sample CSV template
function downloadSampleTemplate() {
    const headers = [
        'ID',
        'Name',
        'Department',
        'Designation',
        'BankAccount',
        'IFSC',
        'BasicSalary',
        'HRA',
        'Conveyance',
        'OtherAllowances',
        'UAN',
        'ESICNumber',
        'Status',
        'Advance',
        'HasPF',
        'HasESIC',
        'HasPT'
    ];

    const sampleData = [
        [
            'EMP001',
            'John Doe',
            'IT',
            'Software Engineer',
            '1234567890',
            'SBIN0001234',
            '50000',
            '5000',
            '2000',
            '3000',
            '100123456789',
            '1234567890',
            'Active',
            '0',
            'true',
            'true',
            'true'
        ],
        [
            'EMP002',
            'Jane Smith',
            'HR',
            'HR Manager',
            '0987654321',
            'HDFC0001234',
            '60000',
            '6000',
            '2000',
            '4000',
            '100987654321',
            '0987654321',
            'Active',
            '0',
            'true',
            'true',
            'true'
        ]
    ];

    let csvContent = headers.join(',') + '\n';
    sampleData.forEach(row => {
        csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}