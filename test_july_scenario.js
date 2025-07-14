/**
 * Test the July scenario: 4 offs + 1 absent + 3 P+OT = 32 days
 */

function testJulyScenario() {
    console.log('=== TESTING JULY SCENARIO ===');
    console.log('Expected: 4 offs + 1 absent + 3 P+OT should result in 32 working days');
    
    // Create test attendance data for July (31 days)
    const testAttendance = Array(31).fill('P'); // Start with all present
    
    // Set the specific scenario
    testAttendance[0] = 'Off';   // Day 1: Off
    testAttendance[1] = 'Off';   // Day 2: Off  
    testAttendance[2] = 'Off';   // Day 3: Off
    testAttendance[3] = 'Off';   // Day 4: Off (4 offs total)
    testAttendance[4] = 'A';     // Day 5: Absent (1 absent)
    testAttendance[5] = 'P+OT';  // Day 6: P+OT
    testAttendance[6] = 'P+OT';  // Day 7: P+OT  
    testAttendance[7] = 'P+OT';  // Day 8: P+OT (3 P+OT total)
    
    // Count attendance
    let presentDays = 0;
    let presentWithOTDays = 0;
    let overtimeOnlyDays = 0;
    let absentDays = 0;
    let offDays = 0;
    
    testAttendance.forEach(status => {
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
        }
    });
    
    console.log('Attendance breakdown:');
    console.log(`- Present (P): ${presentDays}`);
    console.log(`- Present with OT (P+OT): ${presentWithOTDays}`);
    console.log(`- OT only: ${overtimeOnlyDays}`);
    console.log(`- Off days: ${offDays}`);
    console.log(`- Absent days: ${absentDays}`);
    
    // Excel formula calculations
    const basePresentDays = presentDays + presentWithOTDays + offDays;
    console.log(`\nBase Present Days = ${presentDays} + ${presentWithOTDays} + ${offDays} = ${basePresentDays}`);
    
    const totalOvertimeDays = overtimeOnlyDays + presentWithOTDays;
    console.log(`Total Overtime Days = ${overtimeOnlyDays} + ${presentWithOTDays} = ${totalOvertimeDays}`);
    
    const adjustedDays = absentDays < 4 ? Math.max(0, 4 - offDays) : 0;
    console.log(`Adjusted Days = ${absentDays} < 4 ? max(0, 4 - ${offDays}) = ${adjustedDays}`);
    
    const workingDays = basePresentDays < 1 ? 0 : (basePresentDays + totalOvertimeDays + adjustedDays - absentDays);
    console.log(`\nWorking Days = ${basePresentDays} + ${totalOvertimeDays} + ${adjustedDays} - ${absentDays} = ${workingDays}`);
    
    console.log(`\n=== RESULT ===`);
    console.log(`Expected: 32 days`);
    console.log(`Calculated: ${workingDays} days`);
    console.log(`Status: ${workingDays === 32 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    
    if (workingDays !== 32) {
        console.log('\n=== DETAILED BREAKDOWN FOR DEBUGGING ===');
        console.log('Expected calculation:');
        console.log('- 4 Off days = 4 working days');
        console.log('- 3 P+OT days = 6 working days (3×2)');
        console.log('- 24 P days = 24 working days');
        console.log('- 1 Absent = -1 working day');
        console.log('- Adjusted days = max(0, 4-4) = 0');
        console.log('- Total = 4 + 6 + 24 + 0 - 1 = 33 days');
        console.log('Wait... let me recalculate...');
        
        console.log('\nActual scenario breakdown:');
        console.log(`Total days in July: 31`);
        console.log(`4 Off + 1 Absent + 3 P+OT = 8 special days`);
        console.log(`Remaining P days: 31 - 8 = 23 P days`);
        console.log('Calculation:');
        console.log(`- Base present: 23 P + 3 P+OT + 4 Off = 30`);
        console.log(`- Overtime: 3 P+OT = 3`);
        console.log(`- Adjusted: max(0, 4-4) = 0`);
        console.log(`- Final: 30 + 3 + 0 - 1 = 32 days ✓`);
    }
    
    return workingDays;
}

// Run the test
testJulyScenario();