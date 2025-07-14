# Doctors Attendance & Payroll System Guide

## 🏥 Overview

This comprehensive doctors management system has been added to your Shishuraksha Children's Hospital payroll application. It handles shift-based attendance, hourly payments, and TDS calculations specifically for medical professionals.

## ✨ Key Features

### 1. **Shift Management System**
- **Morning Shift**: 8:00 AM - 4:00 PM (8 hours)
- **Evening Shift**: 4:00 PM - 12:00 AM (8 hours) 
- **Night Shift**: 12:00 AM - 8:00 AM (8 hours)
- **Day 12hr**: 8:00 AM - 8:00 PM (12 hours)
- **Night 12hr**: 8:00 PM - 8:00 AM (12 hours)
- **Full 24hr**: Complete 24-hour shift

### 2. **Specializations & Base Rates**
- **Pediatrics**: ₹2,500/hour
- **Cardiology**: ₹3,500/hour
- **Neurology**: ₹3,000/hour
- **Orthopedics**: ₹2,800/hour
- **Oncology**: ₹3,200/hour
- **Dermatology**: ₹2,200/hour
- **Psychiatry**: ₹2,400/hour
- **Radiology**: ₹2,600/hour
- **Anesthesiology**: ₹2,900/hour
- **Emergency Medicine**: ₹2,700/hour
- **General Medicine**: ₹2,000/hour

### 3. **Payment Calculation**
- **Regular Hours**: Standard hourly rate
- **Overtime**: 1.5x hourly rate
- **TDS Deduction**: 10% under Section 194J (Professional Services)
- **Net Pay**: Gross Pay - TDS

## 🚀 How to Use

### Step 1: Access Doctors Section
1. Open your payroll application (`index.html`)
2. Click on the **"Doctors"** button in the navigation menu (next to "Employees")

### Step 2: Add Doctors
1. Click **"Add Doctor"** button
2. Fill in doctor details:
   - Doctor ID (e.g., DOC001)
   - Full Name
   - Specialization (dropdown)
   - Department
   - Registration Number
   - Experience (years)
   - Hourly Rate (₹)
   - Consultation Fee (₹)
   - Qualification
   - Phone & Email
   - Status (Active/Inactive)

### Step 3: Manage Attendance
1. Click the **calendar icon** next to any doctor
2. For each day:
   - Select **Status**: Present/Absent/Off
   - Choose **Shift**: Select from available shifts
   - Enter **Overtime Hours**: Additional hours beyond shift
3. System automatically calculates total hours

### Step 4: View Payroll
1. Click the **money icon** next to any doctor
2. View detailed breakdown:
   - Working days and total hours
   - Regular pay and overtime pay
   - Gross pay calculation
   - TDS deduction (10%)
   - Final net pay

### Step 5: Generate Reports
1. **Individual Payslip**: Click "Generate Payslip" in payroll view
2. **Attendance Report**: Click "Download Report" in attendance view
3. **All Payslips**: Go to Reports → "Generate All" doctor payslips
4. **Summary Report**: Go to Reports → "Generate Report" for comprehensive summary

## 📊 Sample Data Included

The system comes with 5 sample doctors:
- **Dr. Rajesh Kumar** - Pediatrics (₹2,800/hr)
- **Dr. Priya Sharma** - Cardiology (₹3,800/hr) 
- **Dr. Amit Patel** - Neurology (₹3,200/hr)
- **Dr. Sunita Reddy** - Orthopedics (₹3,000/hr)
- **Dr. Vikram Singh** - Emergency Medicine (₹2,900/hr)

## 📄 PDF Reports Generated

### 1. **Doctor Payslip**
- Professional format with hospital header
- Doctor information and qualifications
- Attendance summary with shifts worked
- Payment calculation table (regular + overtime)
- TDS deduction details under Section 194J
- Net pay amount prominently displayed
- Payment details and TDS certificate note

### 2. **Attendance Report**
- Month-wise attendance grid
- Daily shift details and hours worked
- Summary statistics (working days, total hours, overtime)
- Gross earnings calculation

### 3. **Comprehensive Summary**
- Overall statistics for all doctors
- Individual doctor breakdown table
- Specialization-wise analysis
- TDS summary under Section 194J
- Total payments and deductions

## 💡 Key Benefits

1. **Shift-Based Tracking**: Accurate hours based on shift selection
2. **Automatic Calculations**: No manual computation errors
3. **TDS Compliance**: Built-in 194J tax deduction
4. **Professional Reports**: Ready-to-use payslips and summaries
5. **Overtime Management**: 1.5x rate for extra hours
6. **Specialization Rates**: Different rates for different specialties

## 🔧 Technical Features

- **Local Storage**: All data saved in browser
- **Responsive Design**: Works on desktop and mobile
- **Dark Mode Support**: Follows system theme
- **Search & Filter**: Easy doctor lookup
- **Data Validation**: Prevents incorrect entries
- **Activity Logging**: Tracks all system activities

## 📱 Mobile Friendly

The doctors system is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔒 Data Security

- All data stored locally in browser
- No external server communication
- Bank account numbers masked in displays
- Confidentiality notices in reports
- Secure PDF generation

## 📞 Quick Start

1. **Open** `index.html` in your browser
2. **Click** "Doctors" tab
3. **Explore** sample doctors already loaded
4. **Click** attendance/payroll icons to see features
5. **Generate** sample reports to see PDF output
6. **Add** your own doctors using "Add Doctor"

---

**Ready for Production Use** ✅
- Hospital-grade security
- Professional PDF reports
- Complete audit trail
- TDS compliance built-in