/**
 * Month Data Service
 * Handles month-based data storage, retrieval, and month selector management
 */

class MonthDataService {
    constructor() {
        this.currentMonth = null;
        this.availableMonths = [];
        this.organizationStartDate = new Date('2024-01-01'); // When the organization started using this system
    }

    /**
     * Initialize the month service
     */
    async init() {
        this.currentMonth = this.getCurrentMonthString();
        await this.populateMonthSelector();
        await this.loadAvailableMonths();
        console.log('✅ Month Data Service initialized');
    }

    /**
     * Get current month in YYYY-MM format
     */
    getCurrentMonthString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    /**
     * Get month name from YYYY-MM format
     */
    getMonthName(monthString) {
        const [year, month] = monthString.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    /**
     * Populate the month selector with past months and current month
     */
    async populateMonthSelector() {
        const selector = document.getElementById('monthSelector');
        if (!selector) return;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonthNum = now.getMonth() + 1;

        // Clear existing options
        selector.innerHTML = '';

        // Get available months from database
        const dbMonths = await this.getMonthsWithData();
        
        // Generate months from organization start to current month
        const months = [];
        let startDate = new Date(this.organizationStartDate);
        const endDate = new Date(currentYear, currentMonthNum - 1); // Current month

        while (startDate <= endDate) {
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, '0');
            const monthString = `${year}-${month}`;
            
            months.push({
                value: monthString,
                name: this.getMonthName(monthString),
                hasData: dbMonths.includes(monthString)
            });

            // Move to next month
            startDate.setMonth(startDate.getMonth() + 1);
        }

        // Sort months in descending order (newest first)
        months.reverse();

        // Populate selector
        months.forEach(month => {
            const option = document.createElement('option');
            option.value = month.value;
            option.textContent = month.hasData ? 
                `${month.name} ✓` : 
                month.name;
            
            // Select current month by default
            if (month.value === this.currentMonth) {
                option.selected = true;
            }

            selector.appendChild(option);
        });

        console.log(`📅 Populated ${months.length} months in selector`);
    }

    /**
     * Get months that have data in the database
     */
    async getMonthsWithData() {
        try {
            if (!window.db) return [];

            const client = await window.db.getClient();
            
            // Check for attendance data by month
            const { data: attendanceData } = await client
                .from('attendance')
                .select('month')
                .not('month', 'is', null);

            // Check for payroll data by month  
            const { data: payrollData } = await client
                .from('payroll_records')
                .select('month')
                .not('month', 'is', null);

            const months = new Set();
            
            if (attendanceData) {
                attendanceData.forEach(record => {
                    if (record.month) months.add(record.month);
                });
            }

            if (payrollData) {
                payrollData.forEach(record => {
                    if (record.month) months.add(record.month);
                });
            }

            return Array.from(months).sort();

        } catch (error) {
            console.warn('Could not fetch months with data:', error);
            return [];
        }
    }

    /**
     * Load available months from database
     */
    async loadAvailableMonths() {
        this.availableMonths = await this.getMonthsWithData();
    }

    /**
     * Check if a month has data
     */
    hasDataForMonth(monthString) {
        return this.availableMonths.includes(monthString);
    }

    /**
     * Save attendance data for a specific month
     */
    async saveAttendanceData(monthString, attendanceData) {
        try {
            if (!window.db) {
                console.warn('Database not available, saving to localStorage');
                this.saveToLocalStorage('attendance', monthString, attendanceData);
                return;
            }

            const client = await window.db.getClient();
            
            // Prepare data for storage
            const dataToSave = Object.entries(attendanceData).map(([employeeId, data]) => ({
                month: monthString,
                employee_id: employeeId,
                attendance_data: data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }));

            // Delete existing data for this month
            await client
                .from('attendance')
                .delete()
                .eq('month', monthString);

            // Insert new data
            const { error } = await client
                .from('attendance')
                .insert(dataToSave);

            if (error) throw error;

            console.log(`✅ Saved attendance data for ${monthString}`);
            
            // Update available months
            if (!this.availableMonths.includes(monthString)) {
                this.availableMonths.push(monthString);
                this.availableMonths.sort();
            }

        } catch (error) {
            console.error('Error saving attendance data:', error);
            // Fallback to localStorage
            this.saveToLocalStorage('attendance', monthString, attendanceData);
        }
    }

    /**
     * Load attendance data for a specific month
     */
    async loadAttendanceData(monthString) {
        try {
            if (!window.db) {
                console.warn('Database not available, loading from localStorage');
                return this.loadFromLocalStorage('attendance', monthString);
            }

            const client = await window.db.getClient();
            
            const { data, error } = await client
                .from('attendance')
                .select('employee_id, attendance_data')
                .eq('month', monthString);

            if (error) throw error;

            // Convert to expected format
            const attendanceData = {};
            if (data) {
                data.forEach(record => {
                    attendanceData[record.employee_id] = record.attendance_data;
                });
            }

            console.log(`📊 Loaded attendance data for ${monthString}`);
            return attendanceData;

        } catch (error) {
            console.error('Error loading attendance data:', error);
            return this.loadFromLocalStorage('attendance', monthString);
        }
    }

    /**
     * Save payroll data for a specific month
     */
    async savePayrollData(monthString, payrollData) {
        try {
            if (!window.db) {
                this.saveToLocalStorage('payroll', monthString, payrollData);
                return;
            }

            const client = await window.db.getClient();
            
            // Prepare data for storage
            const dataToSave = payrollData.map(record => ({
                month: monthString,
                employee_id: record.employeeId || record.id,
                payroll_data: record,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }));

            // Delete existing data for this month
            await client
                .from('payroll_records')
                .delete()
                .eq('month', monthString);

            // Insert new data
            const { error } = await client
                .from('payroll_records')
                .insert(dataToSave);

            if (error) throw error;

            console.log(`✅ Saved payroll data for ${monthString}`);

            // Update available months
            if (!this.availableMonths.includes(monthString)) {
                this.availableMonths.push(monthString);
                this.availableMonths.sort();
            }

        } catch (error) {
            console.error('Error saving payroll data:', error);
            this.saveToLocalStorage('payroll', monthString, payrollData);
        }
    }

    /**
     * Load payroll data for a specific month
     */
    async loadPayrollData(monthString) {
        try {
            if (!window.db) {
                return this.loadFromLocalStorage('payroll', monthString);
            }

            const client = await window.db.getClient();
            
            const { data, error } = await client
                .from('payroll_records')
                .select('payroll_data')
                .eq('month', monthString);

            if (error) throw error;

            const payrollData = data ? data.map(record => record.payroll_data) : [];
            
            console.log(`💰 Loaded payroll data for ${monthString}`);
            return payrollData;

        } catch (error) {
            console.error('Error loading payroll data:', error);
            return this.loadFromLocalStorage('payroll', monthString);
        }
    }

    /**
     * LocalStorage fallback methods
     */
    saveToLocalStorage(type, monthString, data) {
        const key = `payroll_${type}_${monthString}`;
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`💾 Saved ${type} data for ${monthString} to localStorage`);
    }

    loadFromLocalStorage(type, monthString) {
        const key = `payroll_${type}_${monthString}`;
        const data = localStorage.getItem(key);
        if (data) {
            console.log(`📁 Loaded ${type} data for ${monthString} from localStorage`);
            return JSON.parse(data);
        }
        return type === 'payroll' ? [] : {};
    }

    /**
     * Archive data for completed months
     */
    async archiveMonth(monthString) {
        try {
            console.log(`📦 Archiving data for ${monthString}`);
            
            // Mark month as archived in database
            if (window.db) {
                const client = await window.db.getClient();
                
                await client
                    .from('archived_months')
                    .upsert({
                        month: monthString,
                        archived_at: new Date().toISOString(),
                        status: 'archived'
                    });
            }

            console.log(`✅ Month ${monthString} archived successfully`);

        } catch (error) {
            console.error('Error archiving month:', error);
        }
    }

    /**
     * Get summary statistics for a month
     */
    async getMonthSummary(monthString) {
        try {
            const attendanceData = await this.loadAttendanceData(monthString);
            const payrollData = await this.loadPayrollData(monthString);

            return {
                month: monthString,
                monthName: this.getMonthName(monthString),
                employeeCount: Object.keys(attendanceData).length,
                payrollRecords: payrollData.length,
                hasData: Object.keys(attendanceData).length > 0 || payrollData.length > 0,
                lastUpdated: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error getting month summary:', error);
            return {
                month: monthString,
                monthName: this.getMonthName(monthString),
                employeeCount: 0,
                payrollRecords: 0,
                hasData: false,
                lastUpdated: null
            };
        }
    }

    /**
     * Get the current selected month
     */
    getCurrentMonth() {
        const selector = document.getElementById('monthSelector');
        return selector ? selector.value : this.currentMonth;
    }

    /**
     * Set the current month
     */
    setCurrentMonth(monthString) {
        this.currentMonth = monthString;
        const selector = document.getElementById('monthSelector');
        if (selector) {
            selector.value = monthString;
        }
    }
}

// Create global instance
const monthDataService = new MonthDataService();

// Export for use in other modules
window.monthDataService = monthDataService;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Wait for database service if available
        if (window.db) {
            await new Promise(resolve => {
                if (window.db.initialized) {
                    resolve();
                } else {
                    window.addEventListener('databaseReady', resolve, { once: true });
                }
            });
        }

        await monthDataService.init();
        console.log('✅ Month Data Service ready');
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('monthServiceReady'));

    } catch (error) {
        console.error('❌ Failed to initialize Month Data Service:', error);
    }
});

export default monthDataService;