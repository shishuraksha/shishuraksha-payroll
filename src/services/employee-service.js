/**
 * Employee Service - Supabase Integration
 * Handles all employee-related database operations
 */

class EmployeeService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Get all employees
    async getEmployees() {
        try {
            const employees = await db.select('employees', {
                order: { column: 'name', ascending: true }
            });

            // Transform database format to application format
            return employees.map(emp => ({
                id: emp.employee_id,
                name: emp.name,
                department: emp.department,
                designation: emp.designation,
                bankAccount: emp.bank_account,
                ifsc: emp.ifsc,
                basicSalary: parseFloat(emp.basic_salary),
                hra: parseFloat(emp.hra || 0),
                conveyance: parseFloat(emp.conveyance || 0),
                otherAllowances: parseFloat(emp.other_allowances || 0),
                uan: emp.uan,
                esicNumber: emp.esic_number,
                hasPF: emp.has_pf,
                hasESIC: emp.has_esic,
                hasPT: emp.has_pt,
                status: emp.status,
                createdAt: emp.created_at,
                updatedAt: emp.updated_at
            }));
        } catch (error) {
            console.error('Error fetching employees:', error);
            throw new Error('Failed to fetch employees');
        }
    }

    // Add new employee
    async addEmployee(employee) {
        try {
            // Transform application format to database format
            const dbEmployee = {
                employee_id: employee.id,
                name: employee.name,
                department: employee.department,
                designation: employee.designation,
                bank_account: employee.bankAccount,
                ifsc: employee.ifsc,
                basic_salary: parseFloat(employee.basicSalary),
                hra: parseFloat(employee.hra || 0),
                conveyance: parseFloat(employee.conveyance || 0),
                other_allowances: parseFloat(employee.otherAllowances || 0),
                uan: employee.uan || null,
                esic_number: employee.esicNumber || null,
                has_pf: employee.hasPF !== false,
                has_esic: employee.hasESIC !== false,
                has_pt: employee.hasPT !== false,
                status: employee.status || 'Active'
            };

            const result = await db.insert('employees', dbEmployee);
            
            // Log activity
            await this.logActivity(`Added new employee: ${employee.name} (${employee.id})`);
            
            return result[0];
        } catch (error) {
            console.error('Error adding employee:', error);
            if (error.message.includes('Duplicate entry')) {
                throw new Error(`Employee ID ${employee.id} already exists`);
            }
            throw new Error('Failed to add employee');
        }
    }

    // Update employee
    async updateEmployee(employeeId, updates) {
        try {
            // Transform application format to database format
            const dbUpdates = {};
            
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.department) dbUpdates.department = updates.department;
            if (updates.designation) dbUpdates.designation = updates.designation;
            if (updates.bankAccount) dbUpdates.bank_account = updates.bankAccount;
            if (updates.ifsc) dbUpdates.ifsc = updates.ifsc;
            if (updates.basicSalary) dbUpdates.basic_salary = parseFloat(updates.basicSalary);
            if (updates.hra !== undefined) dbUpdates.hra = parseFloat(updates.hra);
            if (updates.conveyance !== undefined) dbUpdates.conveyance = parseFloat(updates.conveyance);
            if (updates.otherAllowances !== undefined) dbUpdates.other_allowances = parseFloat(updates.otherAllowances);
            if (updates.uan !== undefined) dbUpdates.uan = updates.uan;
            if (updates.esicNumber !== undefined) dbUpdates.esic_number = updates.esicNumber;
            if (updates.hasPF !== undefined) dbUpdates.has_pf = updates.hasPF;
            if (updates.hasESIC !== undefined) dbUpdates.has_esic = updates.hasESIC;
            if (updates.hasPT !== undefined) dbUpdates.has_pt = updates.hasPT;
            if (updates.status) dbUpdates.status = updates.status;

            const result = await db.update('employees', dbUpdates, { employee_id: employeeId });
            
            // Log activity
            await this.logActivity(`Updated employee: ${employeeId}`);
            
            return result[0];
        } catch (error) {
            console.error('Error updating employee:', error);
            throw new Error('Failed to update employee');
        }
    }

    // Delete employee
    async deleteEmployee(employeeId) {
        try {
            await db.delete('employees', { employee_id: employeeId });
            
            // Log activity
            await this.logActivity(`Deleted employee: ${employeeId}`);
            
            return true;
        } catch (error) {
            console.error('Error deleting employee:', error);
            throw new Error('Failed to delete employee');
        }
    }

    // Get single employee
    async getEmployee(employeeId) {
        try {
            const employees = await db.select('employees', {
                eq: { employee_id: employeeId },
                limit: 1
            });

            if (employees.length === 0) {
                throw new Error(`Employee ${employeeId} not found`);
            }

            const emp = employees[0];
            return {
                id: emp.employee_id,
                name: emp.name,
                department: emp.department,
                designation: emp.designation,
                bankAccount: emp.bank_account,
                ifsc: emp.ifsc,
                basicSalary: parseFloat(emp.basic_salary),
                hra: parseFloat(emp.hra || 0),
                conveyance: parseFloat(emp.conveyance || 0),
                otherAllowances: parseFloat(emp.other_allowances || 0),
                uan: emp.uan,
                esicNumber: emp.esic_number,
                hasPF: emp.has_pf,
                hasESIC: emp.has_esic,
                hasPT: emp.has_pt,
                status: emp.status,
                createdAt: emp.created_at,
                updatedAt: emp.updated_at
            };
        } catch (error) {
            console.error('Error fetching employee:', error);
            throw new Error('Failed to fetch employee');
        }
    }

    // Bulk import employees
    async importEmployees(employees) {
        try {
            const dbEmployees = employees.map(emp => ({
                employee_id: emp.id,
                name: emp.name,
                department: emp.department,
                designation: emp.designation,
                bank_account: emp.bankAccount,
                ifsc: emp.ifsc,
                basic_salary: parseFloat(emp.basicSalary),
                hra: parseFloat(emp.hra || 0),
                conveyance: parseFloat(emp.conveyance || 0),
                other_allowances: parseFloat(emp.otherAllowances || 0),
                uan: emp.uan || null,
                esic_number: emp.esicNumber || null,
                has_pf: emp.hasPF !== false,
                has_esic: emp.hasESIC !== false,
                has_pt: emp.hasPT !== false,
                status: emp.status || 'Active'
            }));

            const result = await db.upsert('employees', dbEmployees);
            
            // Log activity
            await this.logActivity(`Bulk imported ${employees.length} employees`);
            
            return result;
        } catch (error) {
            console.error('Error importing employees:', error);
            throw new Error('Failed to import employees');
        }
    }

    // Get departments
    async getDepartments() {
        try {
            const departments = await db.select('departments', {
                eq: { is_active: true },
                order: { column: 'name', ascending: true }
            });

            return departments.map(dept => dept.name);
        } catch (error) {
            console.error('Error fetching departments:', error);
            // Return default departments if database fails
            return ['IT', 'HR', 'Accounts', 'Sales', 'Marketing', 'Medical', 'Nursing', 'Administration'];
        }
    }

    // Log activity
    async logActivity(message) {
        try {
            await db.insert('activities', {
                message: message,
                user_id: null // TODO: Add user authentication
            });
        } catch (error) {
            console.error('Error logging activity:', error);
            // Don't throw error for activity logging failures
        }
    }

    // Get activities
    async getActivities(limit = 50) {
        try {
            const activities = await db.select('activities', {
                order: { column: 'created_at', ascending: false },
                limit: limit
            });

            return activities.map(activity => ({
                message: activity.message,
                timestamp: activity.created_at
            }));
        } catch (error) {
            console.error('Error fetching activities:', error);
            return [];
        }
    }

    // Search employees
    async searchEmployees(searchTerm) {
        try {
            const client = await db.getClient();
            const { data, error } = await client
                .from('employees')
                .select('*')
                .or(`name.ilike.%${searchTerm}%,employee_id.ilike.%${searchTerm}%,department.ilike.%${searchTerm}%`)
                .order('name');

            if (error) {
                throw error;
            }

            return data.map(emp => ({
                id: emp.employee_id,
                name: emp.name,
                department: emp.department,
                designation: emp.designation,
                bankAccount: emp.bank_account,
                ifsc: emp.ifsc,
                basicSalary: parseFloat(emp.basic_salary),
                status: emp.status
            }));
        } catch (error) {
            console.error('Error searching employees:', error);
            throw new Error('Failed to search employees');
        }
    }
}

// Create global instance
const employeeService = new EmployeeService();

// Export for use in other modules
window.employeeService = employeeService;

export default employeeService;