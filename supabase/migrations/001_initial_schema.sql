-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE employee_status AS ENUM ('Active', 'Inactive');
CREATE TYPE attendance_status AS ENUM ('P', 'A', 'Off', 'OT', 'P+OT');

-- Employees table
CREATE TABLE employees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    bank_account VARCHAR(50) NOT NULL,
    ifsc VARCHAR(20) NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL,
    hra DECIMAL(10,2) DEFAULT 0,
    conveyance DECIMAL(10,2) DEFAULT 0,
    other_allowances DECIMAL(10,2) DEFAULT 0,
    uan VARCHAR(50),
    esic_number VARCHAR(50),
    has_pf BOOLEAN DEFAULT true,
    has_esic BOOLEAN DEFAULT true,
    has_pt BOOLEAN DEFAULT true,
    status employee_status DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Attendance table
CREATE TABLE attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: 2025-06
    day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 31),
    status attendance_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    UNIQUE(employee_id, month_year, day_number)
);

-- Payroll data table
CREATE TABLE payroll_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: 2025-06
    present_days INTEGER DEFAULT 0,
    present_with_ot_days INTEGER DEFAULT 0,
    overtime_only_days INTEGER DEFAULT 0,
    off_days INTEGER DEFAULT 0,
    absent_days INTEGER DEFAULT 0,
    base_working_days INTEGER DEFAULT 0,
    total_overtime_days INTEGER DEFAULT 0,
    working_days INTEGER DEFAULT 0,
    basic_amount DECIMAL(10,2) DEFAULT 0,
    hra_amount DECIMAL(10,2) DEFAULT 0,
    conveyance_amount DECIMAL(10,2) DEFAULT 0,
    other_allowances_amount DECIMAL(10,2) DEFAULT 0,
    overtime_amount DECIMAL(10,2) DEFAULT 0,
    gross_salary DECIMAL(10,2) DEFAULT 0,
    pf_amount DECIMAL(10,2) DEFAULT 0,
    esic_amount DECIMAL(10,2) DEFAULT 0,
    pt_amount DECIMAL(10,2) DEFAULT 0,
    advance_amount DECIMAL(10,2) DEFAULT 0,
    total_deductions DECIMAL(10,2) DEFAULT 0,
    net_pay DECIMAL(10,2) DEFAULT 0,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    UNIQUE(employee_id, month_year)
);

-- Advance loans table
CREATE TABLE advance_loans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    emi_amount DECIMAL(10,2) NOT NULL,
    emi_months INTEGER NOT NULL,
    start_month VARCHAR(7) NOT NULL, -- Format: 2025-06
    remaining_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- Advance loan payments table
CREATE TABLE advance_loan_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    loan_id UUID REFERENCES advance_loans(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- Departments table
CREATE TABLE departments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctors table
CREATE TABLE doctors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    doctor_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    registration_number VARCHAR(100),
    experience_years INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    night_rate DECIMAL(10,2) DEFAULT 0,
    professional_fee DECIMAL(10,2) DEFAULT 0,
    status employee_status DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Doctor attendance table
CREATE TABLE doctor_attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL,
    day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 31),
    hours_worked DECIMAL(4,2) DEFAULT 0,
    night_hours DECIMAL(4,2) DEFAULT 0,
    professional_hours DECIMAL(4,2) DEFAULT 0,
    status attendance_status DEFAULT 'P',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    UNIQUE(doctor_id, month_year, day_number)
);

-- System activities log
CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message TEXT NOT NULL,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_attendance_employee_month ON attendance(employee_id, month_year);
CREATE INDEX idx_payroll_employee_month ON payroll_data(employee_id, month_year);
CREATE INDEX idx_advance_loans_employee ON advance_loans(employee_id);
CREATE INDEX idx_advance_loans_status ON advance_loans(status);
CREATE INDEX idx_doctors_doctor_id ON doctors(doctor_id);
CREATE INDEX idx_doctor_attendance_doctor_month ON doctor_attendance(doctor_id, month_year);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_advance_loans_updated_at BEFORE UPDATE ON advance_loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_attendance_updated_at BEFORE UPDATE ON doctor_attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default departments
INSERT INTO departments (name, description) VALUES
('IT', 'Information Technology'),
('HR', 'Human Resources'),
('Accounts', 'Accounting and Finance'),
('Sales', 'Sales and Marketing'),
('Marketing', 'Marketing and Communications'),
('Medical', 'Medical Department'),
('Nursing', 'Nursing Staff'),
('Administration', 'Administrative Staff'),
('Maintenance', 'Maintenance and Support'),
('Security', 'Security Services');

-- Create RLS (Row Level Security) policies
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations for authenticated users)
-- In production, you should implement more granular permissions
CREATE POLICY "Enable all operations for authenticated users" ON employees
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON attendance
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON payroll_data
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON advance_loans
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON advance_loan_payments
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON doctors
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON doctor_attendance
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON activities
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow read access to departments for all authenticated users
CREATE POLICY "Enable read access for authenticated users" ON departments
    FOR SELECT USING (auth.role() = 'authenticated');