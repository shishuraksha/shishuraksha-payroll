-- Supabase Database Schema for Month-based Payroll System
-- Run these SQL commands in your Supabase SQL editor

-- Table for storing monthly attendance data
CREATE TABLE IF NOT EXISTS attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    employee_id VARCHAR(20) NOT NULL,
    attendance_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(month, employee_id)
);

-- Table for storing monthly payroll records
CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    employee_id VARCHAR(20) NOT NULL,
    payroll_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(month, employee_id)
);

-- Table for storing archived months
CREATE TABLE IF NOT EXISTS archived_months (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    month VARCHAR(7) NOT NULL UNIQUE, -- Format: YYYY-MM
    status VARCHAR(20) DEFAULT 'active', -- active, archived, locked
    archived_at TIMESTAMP WITH TIME ZONE,
    archived_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for employees (if not exists)
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    department VARCHAR(50),
    position VARCHAR(100),
    salary DECIMAL(10,2),
    basic_salary DECIMAL(10,2),
    hra DECIMAL(10,2),
    conveyance DECIMAL(10,2),
    other_allowances DECIMAL(10,2),
    pf_number VARCHAR(50),
    esic_number VARCHAR(50),
    bank_account VARCHAR(50),
    ifsc_code VARCHAR(20),
    joining_date DATE,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for doctors (if not exists)
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    qualification VARCHAR(200),
    experience INTEGER,
    contact_number VARCHAR(20),
    email VARCHAR(100),
    consultation_fee DECIMAL(8,2),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for departments (if not exists)
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    head_of_department VARCHAR(100),
    budget DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_month ON attendance(month);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month ON payroll_records(month);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_archived_months_status ON archived_months(status);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_months ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Note: Adjust these policies based on your security requirements

-- Attendance policies
CREATE POLICY "Users can view attendance data" ON attendance
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert attendance data" ON attendance
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update attendance data" ON attendance
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Payroll policies
CREATE POLICY "Users can view payroll data" ON payroll_records
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert payroll data" ON payroll_records
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update payroll data" ON payroll_records
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Employee policies
CREATE POLICY "Users can view employee data" ON employees
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert employee data" ON employees
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update employee data" ON employees
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Doctor policies
CREATE POLICY "Users can view doctor data" ON doctors
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert doctor data" ON doctors
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update doctor data" ON doctors
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Department policies
CREATE POLICY "Users can view department data" ON departments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert department data" ON departments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update department data" ON departments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Archived months policies
CREATE POLICY "Users can view archived months" ON archived_months
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert archived months" ON archived_months
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update archived months" ON archived_months
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert some sample departments
INSERT INTO departments (name, description) VALUES 
    ('IT', 'Information Technology Department'),
    ('HR', 'Human Resources Department'),
    ('Accounts', 'Accounts and Finance Department'),
    ('Sales', 'Sales and Marketing Department'),
    ('Medical', 'Medical Staff Department')
ON CONFLICT (name) DO NOTHING;