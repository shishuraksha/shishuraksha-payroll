/**
 * Attendance Service - Supabase Integration
 * Handles all attendance-related database operations
 */

class AttendanceService {
    constructor() {
        this.cache = new Map();
    }

    // Get attendance for a specific month
    async getAttendance(monthYear) {
        try {
            const attendanceRecords = await db.select('attendance', {
                eq: { month_year: monthYear },
                order: { column: 'day_number', ascending: true }
            });

            // Transform to application format: { employeeId: [day1, day2, ...] }
            const attendanceMap = {};
            
            attendanceRecords.forEach(record => {
                const empId = await this.getEmployeeIdFromUUID(record.employee_id);
                if (!attendanceMap[empId]) {
                    attendanceMap[empId] = [];
                }
                // Ensure array is sized for the month
                while (attendanceMap[empId].length < record.day_number) {
                    attendanceMap[empId].push('');
                }
                attendanceMap[empId][record.day_number - 1] = record.status;
            });

            return attendanceMap;
        } catch (error) {
            console.error('Error fetching attendance:', error);
            throw new Error('Failed to fetch attendance data');
        }
    }

    // Save attendance for a specific employee and day
    async saveAttendance(employeeId, monthYear, dayNumber, status) {
        try {
            const empUUID = await this.getEmployeeUUIDFromId(employeeId);
            
            const attendanceData = {
                employee_id: empUUID,
                month_year: monthYear,
                day_number: dayNumber,
                status: status
            };

            await db.upsert('attendance', attendanceData);
            
            return true;
        } catch (error) {
            console.error('Error saving attendance:', error);
            throw new Error('Failed to save attendance');
        }
    }

    // Bulk save attendance for multiple employees/days
    async bulkSaveAttendance(attendanceData, monthYear) {
        try {
            const records = [];
            
            for (const [employeeId, monthAttendance] of Object.entries(attendanceData)) {
                const empUUID = await this.getEmployeeUUIDFromId(employeeId);
                
                monthAttendance.forEach((status, dayIndex) => {
                    if (status && status.trim()) {
                        records.push({
                            employee_id: empUUID,
                            month_year: monthYear,
                            day_number: dayIndex + 1,
                            status: status
                        });
                    }
                });
            }

            if (records.length > 0) {
                await db.upsert('attendance', records);
            }
            
            return true;
        } catch (error) {
            console.error('Error bulk saving attendance:', error);
            throw new Error('Failed to save attendance data');
        }
    }

    // Get attendance summary for an employee
    async getEmployeeAttendanceSummary(employeeId, monthYear) {
        try {
            const empUUID = await this.getEmployeeUUIDFromId(employeeId);
            
            const client = await db.getClient();
            const { data, error } = await client
                .from('attendance')
                .select('status')
                .eq('employee_id', empUUID)
                .eq('month_year', monthYear);

            if (error) {
                throw error;
            }

            const summary = {
                present: 0,
                absent: 0,
                off: 0,
                overtime: 0,
                presentWithOT: 0
            };

            data.forEach(record => {
                switch (record.status.toUpperCase()) {
                    case 'P':
                        summary.present++;
                        break;
                    case 'A':
                        summary.absent++;
                        break;
                    case 'OFF':
                        summary.off++;
                        break;
                    case 'OT':
                        summary.overtime++;
                        break;
                    case 'P+OT':
                        summary.presentWithOT++;
                        break;
                }
            });

            return summary;
        } catch (error) {
            console.error('Error fetching attendance summary:', error);
            throw new Error('Failed to fetch attendance summary');
        }
    }

    // Generate monthly attendance with default values
    async generateMonthlyAttendance(employeeId, monthYear) {
        try {
            const year = parseInt(monthYear.split('-')[0]);
            const month = parseInt(monthYear.split('-')[1]);
            const daysInMonth = new Date(year, month, 0).getDate();
            
            const empUUID = await this.getEmployeeUUIDFromId(employeeId);
            const records = [];
            
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month - 1, day);
                const dayOfWeek = date.getDay();
                
                let status = 'P'; // Default to Present
                
                if (dayOfWeek === 0) { // Sunday
                    status = 'Off';
                } else if (Math.random() < 0.05) { // 5% chance of absence
                    status = 'A';
                } else if (Math.random() < 0.1) { // 10% chance of overtime
                    status = Math.random() < 0.5 ? 'OT' : 'P+OT';
                }
                
                records.push({
                    employee_id: empUUID,
                    month_year: monthYear,
                    day_number: day,
                    status: status
                });
            }

            await db.upsert('attendance', records);
            
            return records.map(r => r.status);
        } catch (error) {
            console.error('Error generating monthly attendance:', error);
            throw new Error('Failed to generate attendance');
        }
    }

    // Delete attendance for a specific month
    async deleteMonthlyAttendance(monthYear) {
        try {
            await db.delete('attendance', { month_year: monthYear });
            return true;
        } catch (error) {
            console.error('Error deleting attendance:', error);
            throw new Error('Failed to delete attendance');
        }
    }

    // Get attendance statistics for dashboard
    async getAttendanceStats(monthYear) {
        try {
            const client = await db.getClient();
            const { data, error } = await client
                .from('attendance')
                .select('status')
                .eq('month_year', monthYear);

            if (error) {
                throw error;
            }

            const stats = {
                totalDays: data.length,
                present: 0,
                absent: 0,
                off: 0,
                overtime: 0,
                presentWithOT: 0
            };

            data.forEach(record => {
                switch (record.status.toUpperCase()) {
                    case 'P':
                        stats.present++;
                        break;
                    case 'A':
                        stats.absent++;
                        break;
                    case 'OFF':
                        stats.off++;
                        break;
                    case 'OT':
                        stats.overtime++;
                        break;
                    case 'P+OT':
                        stats.presentWithOT++;
                        break;
                }
            });

            return stats;
        } catch (error) {
            console.error('Error fetching attendance stats:', error);
            return {
                totalDays: 0,
                present: 0,
                absent: 0,
                off: 0,
                overtime: 0,
                presentWithOT: 0
            };
        }
    }

    // Helper function to get employee UUID from employee ID
    async getEmployeeUUIDFromId(employeeId) {
        try {
            const employees = await db.select('employees', {
                select: 'id',
                eq: { employee_id: employeeId },
                limit: 1
            });

            if (employees.length === 0) {
                throw new Error(`Employee ${employeeId} not found`);
            }

            return employees[0].id;
        } catch (error) {
            console.error('Error getting employee UUID:', error);
            throw error;
        }
    }

    // Helper function to get employee ID from UUID
    async getEmployeeIdFromUUID(uuid) {
        try {
            const employees = await db.select('employees', {
                select: 'employee_id',
                eq: { id: uuid },
                limit: 1
            });

            if (employees.length === 0) {
                throw new Error(`Employee with UUID ${uuid} not found`);
            }

            return employees[0].employee_id;
        } catch (error) {
            console.error('Error getting employee ID:', error);
            throw error;
        }
    }

    // Validate attendance data
    validateAttendanceStatus(status) {
        const validStatuses = ['P', 'A', 'Off', 'OT', 'P+OT'];
        return validStatuses.includes(status);
    }

    // Check if employee has exceeded off limit
    async checkOffLimit(employeeId, monthYear) {
        try {
            const summary = await this.getEmployeeAttendanceSummary(employeeId, monthYear);
            return {
                currentOffs: summary.off,
                exceededLimit: summary.off > 4,
                remainingOffs: Math.max(0, 4 - summary.off)
            };
        } catch (error) {
            console.error('Error checking off limit:', error);
            return {
                currentOffs: 0,
                exceededLimit: false,
                remainingOffs: 4
            };
        }
    }
}

// Create global instance
const attendanceService = new AttendanceService();

// Export for use in other modules
window.attendanceService = attendanceService;

export default attendanceService;