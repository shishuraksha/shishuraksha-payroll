const XLSX = require('xlsx');
const fs = require('fs');

function analyzePayrollExcel(filepath) {
    console.log('=== ANALYZING PAYROLL EXCEL SHEET ===\n');
    
    try {
        // Read the workbook
        const workbook = XLSX.readFile(filepath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        console.log(`Sheet Name: ${sheetName}`);
        
        // Get the range of the sheet
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        
        // Extract headers
        const headers = [];
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({r: 0, c: C});
            const cell = worksheet[cellAddress];
            headers.push(cell ? cell.v : `Column ${C + 1}`);
        }
        
        console.log(`\nColumn Headers (${headers.length} columns):`);
        headers.forEach((header, index) => {
            console.log(`  ${index + 1}. ${header}`);
        });
        
        // Look for formulas
        console.log('\n=== FORMULA ANALYSIS ===\n');
        
        const formulasByColumn = {};
        let totalFormulas = 0;
        
        for (let R = range.s.r; R <= Math.min(range.e.r, 10); ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
                const cell = worksheet[cellAddress];
                
                if (cell && cell.f) {
                    const columnName = headers[C] || `Column ${C + 1}`;
                    if (!formulasByColumn[columnName]) {
                        formulasByColumn[columnName] = [];
                    }
                    formulasByColumn[columnName].push({
                        cell: cellAddress,
                        formula: cell.f,
                        value: cell.v
                    });
                    totalFormulas++;
                }
            }
        }
        
        console.log(`Total formulas found: ${totalFormulas}`);
        
        // Analyze attendance-related formulas
        console.log('\n=== ATTENDANCE-RELATED FORMULAS ===');
        const attendanceKeywords = ['attendance', 'present', 'absent', 'working', 'days', 'p', 'a', 'l'];
        
        Object.entries(formulasByColumn).forEach(([column, formulas]) => {
            if (attendanceKeywords.some(keyword => column.toLowerCase().includes(keyword))) {
                console.log(`\n${column}:`);
                formulas.slice(0, 3).forEach(({cell, formula}) => {
                    console.log(`  Cell ${cell}: ${formula}`);
                });
            }
        });
        
        // Analyze salary calculation formulas
        console.log('\n=== SALARY CALCULATION FORMULAS ===');
        const salaryKeywords = ['salary', 'basic', 'hra', 'allowance', 'gross', 'net', 'deduction', 'pf', 'esic', 'pt'];
        
        Object.entries(formulasByColumn).forEach(([column, formulas]) => {
            if (salaryKeywords.some(keyword => column.toLowerCase().includes(keyword))) {
                console.log(`\n${column}:`);
                if (formulas.length > 0) {
                    console.log(`  Example: ${formulas[0].formula}`);
                }
            }
        });
        
        // Extract specific attendance counting logic
        console.log('\n=== ATTENDANCE COUNTING LOGIC ===');
        
        // Look for COUNTIF formulas
        const countifFormulas = [];
        Object.entries(formulasByColumn).forEach(([column, formulas]) => {
            formulas.forEach(({formula, cell}) => {
                if (formula.includes('COUNTIF')) {
                    countifFormulas.push({column, formula, cell});
                }
            });
        });
        
        if (countifFormulas.length > 0) {
            console.log('\nCOUNTIF formulas found:');
            countifFormulas.forEach(({column, formula, cell}) => {
                console.log(`  ${column} (${cell}): ${formula}`);
            });
        }
        
        // Look for specific patterns in formulas
        console.log('\n=== FORMULA PATTERNS ===');
        
        // Check for daily rate calculations
        const dailyRateFormulas = [];
        Object.entries(formulasByColumn).forEach(([column, formulas]) => {
            formulas.forEach(({formula}) => {
                if (formula.includes('/30') || formula.includes('/31') || formula.includes('/28')) {
                    dailyRateFormulas.push({column, formula});
                }
            });
        });
        
        if (dailyRateFormulas.length > 0) {
            console.log('\nDaily rate calculations:');
            dailyRateFormulas.slice(0, 3).forEach(({column, formula}) => {
                console.log(`  ${column}: ${formula}`);
            });
        }
        
        // Save detailed analysis
        const analysis = {
            sheetName,
            headers,
            formulasByColumn,
            attendanceFormulas: countifFormulas,
            dailyRateCalculations: dailyRateFormulas
        };
        
        fs.writeFileSync('/home/bhara/payroll/excel_analysis.json', JSON.stringify(analysis, null, 2));
        console.log('\n✅ Detailed analysis saved to excel_analysis.json');
        
    } catch (error) {
        console.error('Error analyzing Excel file:', error);
    }
}

// Run the analysis
analyzePayrollExcel('/mnt/c/Users/bhara/Downloads/Payroll_June_25.xlsx');