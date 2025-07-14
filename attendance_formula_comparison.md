# Attendance Formula Comparison: Excel vs Web Version

## Excel Sheet Analysis (Payroll_June_25.xlsx)

### 1. **Attendance Counting in Excel**

The Excel sheet uses the following formulas in the "Monthly Attendance" sheet:

#### Present Days Calculation (Column AI):
```excel
COUNTIF(D2:AH2, "P") + COUNTIF(D2:AH2, "P+OT") + COUNTIF(D2:AH2, "Off")
```
- Counts "P" (Present), "P+OT" (Present with Overtime), and "Off" as working days
- "Off" is counted as a working day (paid leave)

#### Adjusted Days (Column AJ):
```excel
IF(AK2<4, MAX(0, 4 - COUNTIF(D2:AH2, "Off")), 0)
```
- If absent days < 4, gives bonus days based on Off days
- Maximum 4 days adjustment

#### Absent Days (Column AK):
```excel
COUNTIF(D2:AH2, "A")
```
- Simply counts "A" marks

#### Overtime Days (Column AL):
```excel
COUNTIF(D2:AH2, "OT") + COUNTIF(D2:AH2, "P+OT")
```
- Counts both "OT" and "P+OT" as overtime days

#### Total Working Days (Column AM):
```excel
IF(AI2<1, 0, (AI2+AL2+AJ2-AK2))
```
- If no present days, returns 0
- Otherwise: Present Days + OT Days + Adjusted Days - Absent Days

### 2. **Salary Calculation in Excel**

From the "Payroll Sheet":

#### Basic Salary:
```excel
('Employee Master'!M2/D2)*('Monthly Attendance'!AM2)
```
- (Monthly Basic / Total Days in Month) × Working Days

#### HRA:
```excel
('Employee Master'!N2/D2)*('Monthly Attendance'!AM2)
```
- (Monthly HRA / Total Days in Month) × Working Days

#### Conveyance & Others:
- Same formula pattern as above

## Web Version Analysis

### 1. **Attendance Logic in Web Version**

From `payroll-calculations.js`:

```javascript
monthAttendance.forEach(status => {
    if (status === 'P') workingDays++;
    else if (status === 'POT') { workingDays++; overtimeDays++; }
    else if (status === 'OT') overtimeDays++;
});
```

**Key Differences:**
- Web version uses 'P', 'POT', 'OT' status codes
- Excel uses 'P', 'P+OT', 'OT', 'Off', 'A'
- Web version doesn't count 'Off' as working days
- No adjusted days concept in web version

### 2. **Salary Calculation in Web Version**

```javascript
const dailyRate = employee.basicSalary / totalDays;
const basic = Math.round(dailyRate * workingDays);
const hra = employee.hra > 0 ? Math.round((employee.hra / totalDays) * workingDays) : Math.round(basic * 0.4);
```

**Similarities:**
- Both use daily rate calculation (salary / total days)
- Both multiply by working days

**Differences:**
- Excel includes adjusted days in working days calculation
- Excel counts 'Off' days as paid working days

## Key Discrepancies

### 1. **Attendance Status Codes**
| Excel | Web Version | Description |
|-------|-------------|-------------|
| P | P | Present |
| P+OT | POT | Present + Overtime |
| OT | OT | Overtime only |
| Off/off | - | Paid leave (not in web) |
| A | A | Absent |

### 2. **Working Days Calculation**
- **Excel**: Includes 'Off' days as paid days + bonus adjustment logic
- **Web**: Only counts actual present days (P, POT)

### 3. **Adjusted Days Logic**
- **Excel**: Has complex adjustment based on absence < 4 days
- **Web**: No such adjustment logic

### 4. **Case Sensitivity**
- **Excel**: Mixed case (P, p, Off, off, OFF)
- **Web**: Likely case-sensitive

## Recommendations for Matching Excel Logic

To make the web version match Excel:

1. **Add 'Off' status** to attendance options
2. **Update working days calculation** to include 'Off' days
3. **Implement adjusted days logic** for < 4 absences
4. **Make attendance marking case-insensitive**
5. **Update status codes** to match Excel (P+OT instead of POT)