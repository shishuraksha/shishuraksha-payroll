const XLSX = require('xlsx');
const fs = require('fs');

function analyzeAllSheets(filepath) {
    console.log('=== COMPREHENSIVE PAYROLL EXCEL ANALYSIS ===\n');
    
    try {
        const workbook = XLSX.readFile(filepath);
        console.log(`Total sheets: ${workbook.SheetNames.length}`);
        console.log('Sheet names:', workbook.SheetNames.join(', '));
        
        workbook.SheetNames.forEach((sheetName, sheetIndex) => {
            console.log(`\n${'='.repeat(50)}`);
            console.log(`SHEET ${sheetIndex + 1}: ${sheetName}`);
            console.log('='.repeat(50));
            
            const worksheet = workbook.Sheets[sheetName];
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            
            // Get data as array of arrays
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Print first few rows to understand structure
            console.log('\nFirst 5 rows:');
            data.slice(0, 5).forEach((row, index) => {
                console.log(`Row ${index + 1}: [${row.slice(0, 10).join(' | ')}${row.length > 10 ? '...' : ''}]`);
            });
            
            // Look for attendance patterns
            console.log('\n--- ATTENDANCE PATTERN ANALYSIS ---');
            
            // Check if this looks like an attendance sheet
            const firstRow = data[0] || [];
            const hasDateColumns = firstRow.some(cell => 
                cell && (cell.toString().match(/^\d+$/) || cell.toString().match(/\d{1,2}\/\d{1,2}/))
            );
            
            if (hasDateColumns) {
                console.log('✓ This appears to be an attendance sheet with date columns');
                
                // Count P, A, L, etc.
                const attendanceMarks = {};
                for (let row = 1; row < Math.min(data.length, 10); row++) {
                    for (let col = 0; col < data[row].length; col++) {
                        const value = data[row][col];
                        if (value && typeof value === 'string' && value.length <= 3) {
                            attendanceMarks[value] = (attendanceMarks[value] || 0) + 1;
                        }
                    }
                }
                
                console.log('\nAttendance marks found:');
                Object.entries(attendanceMarks).sort((a, b) => b[1] - a[1]).forEach(([mark, count]) => {
                    console.log(`  ${mark}: ${count} occurrences`);
                });
            }
            
            // Look for formulas in this sheet
            console.log('\n--- FORMULA ANALYSIS ---');
            let formulaCount = 0;
            const sampleFormulas = [];
            
            for (let R = range.s.r; R <= range.e.r && sampleFormulas.length < 10; ++R) {
                for (let C = range.s.c; C <= range.e.c && sampleFormulas.length < 10; ++C) {
                    const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
                    const cell = worksheet[cellAddress];
                    
                    if (cell && cell.f) {
                        formulaCount++;
                        sampleFormulas.push({
                            cell: cellAddress,
                            formula: cell.f,
                            value: cell.v
                        });
                    }
                }
            }
            
            console.log(`Total formulas: ${formulaCount}`);
            if (sampleFormulas.length > 0) {
                console.log('\nSample formulas:');
                sampleFormulas.forEach(({cell, formula}) => {
                    console.log(`  ${cell}: ${formula}`);
                });
            }
            
            // Look for summary calculations
            const lastFewRows = data.slice(-5);
            console.log('\n--- SUMMARY/TOTAL ROWS ---');
            lastFewRows.forEach((row, index) => {
                if (row.some(cell => cell && cell.toString().toLowerCase().includes('total'))) {
                    console.log(`Row ${data.length - 5 + index + 1}: [${row.slice(0, 10).join(' | ')}]`);
                }
            });
        });
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run analysis
analyzeAllSheets('/mnt/c/Users/bhara/Downloads/Payroll_June_25.xlsx');