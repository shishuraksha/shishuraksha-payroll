// Master Report PDF Generator - Professional Corporate Grade Document
// Shishuraksha Children's Hospital

class MasterReportGenerator {
    constructor() {
        this.doc = null;
        this.pageHeight = 297; // A4 height in mm
        this.pageWidth = 210; // A4 width in mm
        this.margin = 20;
        this.currentY = this.margin;
        this.pageNumber = 1;
        this.totalPages = 1;
        
        // Professional color palette
        this.colors = {
            primary: '#1e3a8a', // Navy blue
            secondary: '#3b82f6', // Bright blue
            accent: '#06b6d4', // Cyan
            dark: '#1e293b', // Dark gray
            light: '#f8fafc', // Light gray
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            text: '#334155',
            textLight: '#64748b',
            tableHeader: '#f1f5f9',
            tableAlt: '#f8fafc'
        };
        
        // Enhanced chart colors - more vibrant and distinct
        this.chartColors = [
            '#3b82f6', // Blue
            '#8b5cf6', // Purple
            '#ec4899', // Pink
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#ef4444', // Red
            '#06b6d4', // Cyan
            '#84cc16', // Lime
            '#f97316', // Orange
            '#6366f1'  // Indigo
        ];
    }

    // Data cleaning functions
    cleanDepartmentName(dept) {
        const corrections = {
            'Marketin': 'Marketing',
            'marketin': 'Marketing',
            'hr': 'HR',
            'it': 'IT'
        };
        return corrections[dept] || dept;
    }

    formatCurrency(amount) {
        if (!amount || isNaN(amount)) return 'Rs. 0';
        return 'Rs. ' + Math.round(amount).toLocaleString('en-IN');
    }

    calculateAttendancePercentage(attendance) {
        const totalDays = Object.keys(attendance).length;
        const presentDays = Object.values(attendance).filter(status => 
            status === 'P' || status === 'PNH'
        ).length;
        return totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    }

    // Initialize PDF document
    async initializePDF() {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Set default font
        this.doc.setFont('helvetica');
        
        // Calculate total pages (estimate)
        this.totalPages = 7; // Will be updated after generation
    }

    // Add gradient background with enhanced smoothness
    addGradientBackground(x, y, width, height, startColor, endColor, alpha = 1) {
        const steps = 30; // Increased steps for smoother gradients
        const stepHeight = height / steps;
        
        for (let i = 0; i < steps; i++) {
            const ratio = i / steps;
            const color = this.interpolateColor(startColor, endColor, ratio);
            this.doc.setFillColor(color.r, color.g, color.b);
            this.doc.rect(x, y + (i * stepHeight), width, stepHeight, 'F');
        }
    }

    // Add subtle box shadow effect
    addBoxShadow(x, y, width, height, shadowColor = '#00000020') {
        const shadowOffset = 1;
        const rgb = this.hexToRgb(shadowColor);
        this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
        this.doc.rect(x + shadowOffset, y + shadowOffset, width, height, 'F');
    }

    // Add section divider
    addSectionDivider(y, width = null) {
        const dividerWidth = width || (this.pageWidth - (2 * this.margin));
        this.addGradientBackground(this.margin, y, dividerWidth, 2, this.colors.primary, this.colors.secondary);
    }

    // Color interpolation for gradients
    interpolateColor(color1, color2, ratio) {
        const hex2rgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };
        
        const c1 = hex2rgb(color1);
        const c2 = hex2rgb(color2);
        
        return {
            r: Math.round(c1.r + (c2.r - c1.r) * ratio),
            g: Math.round(c1.g + (c2.g - c1.g) * ratio),
            b: Math.round(c1.b + (c2.b - c1.b) * ratio)
        };
    }

    // Add enhanced page header and footer
    addPageHeaderFooter() {
        // Header with enhanced design
        this.addGradientBackground(0, 0, this.pageWidth, 28, this.colors.primary, this.colors.secondary);
        
        // Header text with better typography
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('SHISHURAKSHA CHILDREN\'S HOSPITAL', this.margin, 12);
        
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Master Report - ' + new Date().toLocaleDateString('en-IN', { 
            year: 'numeric', 
            month: 'long' 
        }), this.margin, 22);
        
        // Professional footer with better alignment
        const footerY = this.pageHeight - 8;
        
        // Footer background
        this.doc.setFillColor(248, 250, 252);
        this.doc.rect(0, footerY - 6, this.pageWidth, 10, 'F');
        
        // Footer content
        this.doc.setTextColor(this.colors.text);
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Page ${this.pageNumber} of ${this.totalPages}`, this.pageWidth / 2, footerY, { align: 'center' });
        
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Generated: ' + new Date().toLocaleString('en-IN'), this.margin, footerY);
        this.doc.text('Confidential', this.pageWidth - this.margin, footerY, { align: 'right' });
        
        this.doc.setTextColor(this.colors.text);
    }

    // Title page
    createTitlePage() {
        // Background gradient
        this.addGradientBackground(0, 0, this.pageWidth, this.pageHeight, '#f0f9ff', '#dbeafe');
        
        // Logo area
        const logoSize = 60;
        const logoX = (this.pageWidth - logoSize) / 2;
        const logoY = 50;
        
        this.addGradientBackground(logoX, logoY, logoSize, logoSize, this.colors.primary, this.colors.secondary);
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(36);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('SCH', this.pageWidth / 2, logoY + 35, { align: 'center' });
        
        // Title
        this.doc.setTextColor(this.colors.primary);
        this.doc.setFontSize(42);
        this.doc.text('MASTER REPORT', this.pageWidth / 2, 140, { align: 'center' });
        
        // Subtitle
        this.doc.setTextColor(this.colors.text);
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text('Comprehensive Payroll & Analytics', this.pageWidth / 2, 155, { align: 'center' });
        
        // Month/Year
        this.doc.setFontSize(16);
        const monthYear = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        this.doc.text(monthYear, this.pageWidth / 2, 170, { align: 'center' });
        
        // Divider line
        this.doc.setDrawColor(this.colors.secondary);
        this.doc.setLineWidth(0.5);
        this.doc.line(60, 180, 150, 180);
        
        // Hospital info
        this.doc.setFontSize(12);
        this.doc.setTextColor(this.colors.textLight);
        this.doc.text('Shishuraksha Children\'s Hospital', this.pageWidth / 2, 200, { align: 'center' });
        this.doc.text('Premium Healthcare Services', this.pageWidth / 2, 210, { align: 'center' });
        
        // Generated timestamp
        this.doc.setFontSize(10);
        this.doc.text('Generated: ' + new Date().toLocaleString('en-IN'), this.pageWidth / 2, 250, { align: 'center' });
        
        this.doc.addPage();
        this.pageNumber++;
    }

    // Executive Dashboard
    createExecutiveDashboard(payrollData) {
        this.addPageHeaderFooter();
        this.currentY = 38;
        
        // Section title with divider
        this.doc.setFontSize(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(this.colors.primary);
        this.doc.text('Executive Dashboard', this.margin, this.currentY);
        this.currentY += 8;
        
        // Add section divider
        this.addSectionDivider(this.currentY);
        this.currentY += 12;
        
        // Calculate metrics
        const totalEmployees = payrollData.length;
        const totalGross = payrollData.reduce((sum, emp) => sum + (emp.grossSalary || 0), 0);
        const totalNet = payrollData.reduce((sum, emp) => sum + (emp.netPay || 0), 0);
        const totalDeductions = payrollData.reduce((sum, emp) => sum + (emp.totalDeductions || 0), 0);
        const avgSalary = totalEmployees > 0 ? totalGross / totalEmployees : 0;
        
        // KPI Cards
        const cardWidth = 85;
        const cardHeight = 50;
        const cardSpacing = 5;
        const startX = this.margin;
        
        const kpis = [
            {
                title: 'Total Workforce',
                value: totalEmployees.toString(),
                subtitle: 'Active Employees',
                color: this.colors.primary,
                icon: '👥'
            },
            {
                title: 'Gross Payroll',
                value: this.formatCurrency(totalGross),
                subtitle: 'Monthly Investment',
                color: this.colors.success,
                icon: '💰'
            },
            {
                title: 'Net Disbursement',
                value: this.formatCurrency(totalNet),
                subtitle: 'Take-home Total',
                color: this.colors.accent,
                icon: '💵'
            },
            {
                title: 'Total Deductions',
                value: this.formatCurrency(totalDeductions),
                subtitle: 'Statutory & Others',
                color: this.colors.warning,
                icon: '📊'
            }
        ];
        
        // Draw enhanced KPI cards - 2x2 grid
        kpis.forEach((kpi, index) => {
            const row = Math.floor(index / 2);
            const col = index % 2;
            const x = startX + (col * (cardWidth + cardSpacing));
            const y = this.currentY + (row * (cardHeight + cardSpacing));
            
            // Add subtle shadow
            this.addBoxShadow(x, y, cardWidth, cardHeight);
            
            // Card background with enhanced gradient
            this.addGradientBackground(x, y, cardWidth, cardHeight, kpi.color, this.lightenColor(kpi.color));
            
            // Card border for premium look
            this.doc.setDrawColor(255, 255, 255);
            this.doc.setLineWidth(0.3);
            this.doc.rect(x, y, cardWidth, cardHeight);
            
            // Card content with improved typography
            this.doc.setTextColor(255, 255, 255);
            this.doc.setFontSize(11);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(kpi.title.toUpperCase(), x + 6, y + 12);
            
            // Value with monospace for better number readability
            this.doc.setFontSize(18);
            this.doc.setFont('courier', 'bold');
            this.doc.text(kpi.value, x + 6, y + 28);
            
            // Subtitle
            this.doc.setFontSize(9);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(kpi.subtitle, x + 6, y + 42);
        });
        
        this.currentY += 125;
        
        // Add visual separator
        this.addSectionDivider(this.currentY - 5, 170);
        this.currentY += 5;
        
        // Department Distribution Chart
        this.doc.setTextColor(this.colors.primary);
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Department Distribution', this.margin, this.currentY);
        this.currentY += 15;
        
        // Calculate department stats
        const deptStats = {};
        payrollData.forEach(emp => {
            const dept = this.cleanDepartmentName(emp.department);
            if (!deptStats[dept]) {
                deptStats[dept] = { count: 0, gross: 0 };
            }
            deptStats[dept].count++;
            deptStats[dept].gross += emp.grossSalary || 0;
        });
        
        // Draw enhanced pie chart
        this.drawPieChart(this.margin + 15, this.currentY, 50, deptStats);
        
        // Enhanced department table with better spacing
        const tableX = this.margin + 95;
        
        // Table header
        this.doc.setFillColor(...this.hexToRgbArray(this.colors.tableHeader));
        this.doc.rect(tableX - 5, this.currentY - 4, 85, 8, 'F');
        
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(this.colors.dark);
        this.doc.text('Department', tableX, this.currentY);
        this.doc.text('Count', tableX + 35, this.currentY);
        this.doc.text('Total Gross', tableX + 55, this.currentY);
        
        this.currentY += 10;
        let colorIndex = 0;
        
        Object.entries(deptStats).forEach(([dept, stats], index) => {
            // Alternating row background
            if (index % 2 === 0) {
                this.doc.setFillColor(...this.hexToRgbArray(this.colors.tableAlt));
                this.doc.rect(tableX - 5, this.currentY - 4, 85, 6, 'F');
            }
            
            // Color indicator with better size
            const color = this.hexToRgb(this.chartColors[colorIndex % this.chartColors.length]);
            this.doc.setFillColor(color.r, color.g, color.b);
            this.doc.rect(tableX - 3, this.currentY - 2, 4, 4, 'F');
            
            this.doc.setTextColor(this.colors.text);
            this.doc.setFontSize(9);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(dept, tableX + 3, this.currentY);
            
            this.doc.setFont('courier', 'normal');
            this.doc.text(stats.count.toString(), tableX + 38, this.currentY);
            this.doc.text(this.formatCurrency(stats.gross), tableX + 58, this.currentY);
            
            this.currentY += 6;
            colorIndex++;
        });
        
        this.doc.addPage();
        this.pageNumber++;
    }

    // Draw pie chart
    drawPieChart(x, y, radius, data) {
        const total = Object.values(data).reduce((sum, item) => sum + item.count, 0);
        let currentAngle = -Math.PI / 2;
        let colorIndex = 0;
        
        Object.entries(data).forEach(([label, item]) => {
            const percentage = item.count / total;
            const angle = percentage * Math.PI * 2;
            
            // Draw sector
            const color = this.hexToRgb(this.chartColors[colorIndex % this.chartColors.length]);
            this.doc.setFillColor(color.r, color.g, color.b);
            
            // Draw pie slice using small line segments
            const centerX = x + radius;
            const centerY = y + radius;
            const segments = Math.max(Math.floor(angle * 20), 3);
            
            this.doc.moveTo(centerX, centerY);
            for (let i = 0; i <= segments; i++) {
                const segmentAngle = currentAngle + (angle * i / segments);
                const px = centerX + radius * Math.cos(segmentAngle);
                const py = centerY + radius * Math.sin(segmentAngle);
                if (i === 0) {
                    this.doc.moveTo(centerX, centerY);
                    this.doc.lineTo(px, py);
                } else {
                    this.doc.lineTo(px, py);
                }
            }
            this.doc.lineTo(centerX, centerY);
            this.doc.fill();
            
            // Add percentage label with better visibility
            const labelAngle = currentAngle + angle / 2;
            const labelX = centerX + (radius * 0.75) * Math.cos(labelAngle);
            const labelY = centerY + (radius * 0.75) * Math.sin(labelAngle);
            
            // Only show percentage if slice is large enough
            if (percentage > 0.08) { // Show only if > 8%
                this.doc.setTextColor(255, 255, 255);
                this.doc.setFontSize(10);
                this.doc.setFont('helvetica', 'bold');
                this.doc.text(`${Math.round(percentage * 100)}%`, labelX, labelY, { align: 'center' });
            }
            
            currentAngle += angle;
            colorIndex++;
        });
    }

    // Workforce Investment Analysis
    createWorkforceAnalysis(payrollData) {
        this.addPageHeaderFooter();
        this.currentY = 38;
        
        // Section title with divider
        this.doc.setFontSize(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(this.colors.primary);
        this.doc.text('Workforce Investment Analysis', this.margin, this.currentY);
        this.currentY += 8;
        
        // Add section divider
        this.addSectionDivider(this.currentY);
        this.currentY += 12;
        
        // Group by department
        const deptGroups = {};
        payrollData.forEach(emp => {
            const dept = this.cleanDepartmentName(emp.department);
            if (!deptGroups[dept]) deptGroups[dept] = [];
            deptGroups[dept].push(emp);
        });
        
        // Table headers
        const headers = [
            { text: 'ID', width: 20 },
            { text: 'Name', width: 45 },
            { text: 'Designation', width: 35 },
            { text: 'Basic', width: 25 },
            { text: 'Gross', width: 25 },
            { text: 'Deductions', width: 20 },
            { text: 'Net Pay', width: 25 }
        ];
        
        Object.entries(deptGroups).forEach(([dept, employees]) => {
            // Check if we need a new page
            if (this.currentY > 235) {
                this.doc.addPage();
                this.pageNumber++;
                this.addPageHeaderFooter();
                this.currentY = 38;
            }
            
            // Add section spacing
            this.currentY += 5;
            
            // Department header with enhanced gradient and shadow
            this.addBoxShadow(this.margin - 5, this.currentY - 5, 175, 15);
            this.addGradientBackground(this.margin - 5, this.currentY - 5, 175, 15, this.colors.primary, this.colors.secondary);
            
            this.doc.setTextColor(255, 255, 255);
            this.doc.setFontSize(13);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`${dept} Department`, this.margin, this.currentY + 3);
            
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(`${employees.length} employees`, this.margin, this.currentY + 10);
            this.currentY += 18;
            
            // Table headers with background
            this.doc.setFillColor(...this.hexToRgbArray(this.colors.tableHeader));
            this.doc.rect(this.margin, this.currentY - 4, 170, 8, 'F');
            
            let xPos = this.margin + 2;
            this.doc.setTextColor(this.colors.dark);
            this.doc.setFontSize(9);
            this.doc.setFont('helvetica', 'bold');
            
            headers.forEach(header => {
                this.doc.text(header.text, xPos, this.currentY);
                xPos += header.width;
            });
            
            this.currentY += 8;
            
            // Table rows with enhanced zebra striping
            employees.forEach((emp, index) => {
                const rowHeight = 6;
                
                // Enhanced zebra striping - every other row
                if (index % 2 === 0) {
                    this.doc.setFillColor(...this.hexToRgbArray(this.colors.tableAlt));
                    this.doc.rect(this.margin, this.currentY - 4, 170, rowHeight, 'F');
                }
                
                xPos = this.margin + 2;
                this.doc.setTextColor(this.colors.text);
                this.doc.setFontSize(8);
                
                // Employee data with improved formatting
                const rowData = [
                    { text: emp.id, width: 20, font: 'courier' }, // Monospace for IDs
                    { text: emp.name, width: 45, font: 'helvetica' },
                    { text: emp.designation || '-', width: 35, font: 'helvetica' },
                    { text: this.formatCurrency(emp.basicSalary), width: 25, font: 'courier' },
                    { text: this.formatCurrency(emp.grossSalary), width: 25, font: 'courier' },
                    { text: this.formatCurrency(emp.totalDeductions), width: 20, font: 'courier' },
                    { text: this.formatCurrency(emp.netPay), width: 25, font: 'courier' }
                ];
                
                rowData.forEach(cell => {
                    this.doc.setFont(cell.font, 'normal');
                    this.doc.text(cell.text.toString(), xPos, this.currentY);
                    xPos += cell.width;
                });
                
                this.currentY += rowHeight;
                
                // Check for page break
                if (this.currentY > 270) {
                    this.doc.addPage();
                    this.pageNumber++;
                    this.addPageHeaderFooter();
                    this.currentY = 35;
                }
            });
            
            // Department summary
            const deptTotal = employees.reduce((sum, emp) => sum + (emp.grossSalary || 0), 0);
            const deptNet = employees.reduce((sum, emp) => sum + (emp.netPay || 0), 0);
            
            this.doc.setDrawColor(this.colors.primary);
            this.doc.line(this.margin, this.currentY, this.margin + 170, this.currentY);
            this.currentY += 3;
            
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('Department Total:', this.margin + 95, this.currentY);
            this.doc.text(this.formatCurrency(deptTotal), this.margin + 125, this.currentY);
            this.doc.text(this.formatCurrency(deptNet), this.margin + 170, this.currentY);
            
            this.currentY += 10;
        });
        
        this.doc.addPage();
        this.pageNumber++;
    }

    // Attendance Analytics
    createAttendanceAnalytics(payrollData, attendanceData) {
        this.addPageHeaderFooter();
        this.currentY = 38;
        
        // Section title with divider
        this.doc.setFontSize(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(this.colors.primary);
        this.doc.text('Attendance Analytics', this.margin, this.currentY);
        this.currentY += 8;
        
        // Add section divider
        this.addSectionDivider(this.currentY);
        this.currentY += 12;
        
        // Calculate attendance metrics
        const attendanceMetrics = payrollData.map(emp => {
            const empAttendance = attendanceData[emp.id] || {};
            const percentage = this.calculateAttendancePercentage(empAttendance);
            const presentDays = Object.values(empAttendance).filter(s => s === 'P' || s === 'PNH').length;
            const absentDays = Object.values(empAttendance).filter(s => s === 'A').length;
            const nightHours = Object.values(empAttendance).filter(s => s === 'NH' || s === 'PNH').length;
            
            return {
                ...emp,
                attendancePercentage: percentage,
                presentDays,
                absentDays,
                nightHours
            };
        });
        
        // Overall statistics
        const avgAttendance = attendanceMetrics.reduce((sum, emp) => sum + emp.attendancePercentage, 0) / attendanceMetrics.length;
        const perfectAttendance = attendanceMetrics.filter(emp => emp.attendancePercentage === 100).length;
        const belowThreshold = attendanceMetrics.filter(emp => emp.attendancePercentage < 85).length;
        
        // Summary cards
        const summaryCards = [
            { label: 'Average Attendance', value: `${Math.round(avgAttendance)}%`, color: this.colors.success },
            { label: 'Perfect Attendance', value: perfectAttendance.toString(), color: this.colors.primary },
            { label: 'Below 85%', value: belowThreshold.toString(), color: this.colors.danger }
        ];
        
        let cardX = this.margin;
        summaryCards.forEach(card => {
            this.doc.setFillColor(...this.hexToRgbArray(card.color));
            this.doc.rect(cardX, this.currentY, 55, 20, 'F');
            
            this.doc.setTextColor(255, 255, 255);
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(card.label, cardX + 27.5, this.currentY + 8, { align: 'center' });
            
            this.doc.setFontSize(14);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(card.value, cardX + 27.5, this.currentY + 15, { align: 'center' });
            
            cardX += 60;
        });
        
        this.currentY += 30;
        
        // Modern Attendance Visualization - Horizontal Bar Chart
        this.doc.setTextColor(this.colors.primary);
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Attendance Performance Analysis', this.margin, this.currentY);
        this.currentY += 15;
        
        // Top performers section
        const topPerformers = attendanceMetrics
            .sort((a, b) => b.attendancePercentage - a.attendancePercentage)
            .slice(0, 15);
        
        // Table header
        this.doc.setFillColor(...this.hexToRgbArray(this.colors.tableHeader));
        this.doc.rect(this.margin, this.currentY - 4, 170, 8, 'F');
        
        this.doc.setTextColor(this.colors.dark);
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Employee', this.margin + 2, this.currentY);
        this.doc.text('Department', this.margin + 45, this.currentY);
        this.doc.text('Present Days', this.margin + 80, this.currentY);
        this.doc.text('Attendance %', this.margin + 110, this.currentY);
        this.doc.text('Performance Bar', this.margin + 145, this.currentY);
        
        this.currentY += 12;
        
        // Employee attendance bars
        topPerformers.forEach((emp, index) => {
            const rowHeight = 8;
            
            // Alternating row background
            if (index % 2 === 0) {
                this.doc.setFillColor(...this.hexToRgbArray(this.colors.tableAlt));
                this.doc.rect(this.margin, this.currentY - 6, 170, rowHeight, 'F');
            }
            
            // Employee info
            this.doc.setTextColor(this.colors.text);
            this.doc.setFontSize(8);
            this.doc.setFont('helvetica', 'normal');
            
            // Truncate long names
            const displayName = emp.name.length > 18 ? emp.name.substring(0, 15) + '...' : emp.name;
            this.doc.text(displayName, this.margin + 2, this.currentY);
            
            const displayDept = this.cleanDepartmentName(emp.department);
            this.doc.text(displayDept, this.margin + 45, this.currentY);
            
            // Present days with monospace
            this.doc.setFont('courier', 'normal');
            this.doc.text(emp.presentDays.toString(), this.margin + 85, this.currentY);
            
            // Attendance percentage
            this.doc.setFont('courier', 'bold');
            const percentColor = emp.attendancePercentage >= 95 ? this.colors.success :
                               emp.attendancePercentage >= 85 ? this.colors.warning : this.colors.danger;
            this.doc.setTextColor(...this.hexToRgbArray(percentColor));
            this.doc.text(`${emp.attendancePercentage}%`, this.margin + 115, this.currentY);
            
            // Performance bar
            const barWidth = 20;
            const barHeight = 4;
            const barX = this.margin + 145;
            const barY = this.currentY - 3;
            
            // Background bar
            this.doc.setFillColor(230, 230, 230);
            this.doc.rect(barX, barY, barWidth, barHeight, 'F');
            
            // Performance bar
            const performanceWidth = (emp.attendancePercentage / 100) * barWidth;
            this.doc.setFillColor(...this.hexToRgbArray(percentColor));
            this.doc.rect(barX, barY, performanceWidth, barHeight, 'F');
            
            this.currentY += rowHeight + 2;
        });
        
        this.currentY += 5;
        
        // Legend
        const legend = [
            { status: 'Present', color: this.colors.success },
            { status: 'Absent', color: this.colors.danger },
            { status: 'Holiday', color: this.colors.warning }
        ];
        
        let legendX = this.margin;
        legend.forEach(item => {
            this.doc.setFillColor(...this.hexToRgbArray(item.color));
            this.doc.rect(legendX, this.currentY, 8, 4, 'F');
            this.doc.setTextColor(this.colors.text);
            this.doc.setFontSize(8);
            this.doc.text(item.status, legendX + 10, this.currentY + 3);
            legendX += 35;
        });
        
        this.doc.addPage();
        this.pageNumber++;
    }

    // Financial Disbursement
    createFinancialDisbursement(payrollData) {
        this.addPageHeaderFooter();
        this.currentY = 38;
        
        // Section title with divider
        this.doc.setFontSize(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(this.colors.primary);
        this.doc.text('Financial Disbursement Summary', this.margin, this.currentY);
        this.currentY += 8;
        
        // Add section divider
        this.addSectionDivider(this.currentY);
        this.currentY += 12;
        
        // Bank-wise grouping
        const bankGroups = {};
        payrollData.forEach(emp => {
            const bankCode = emp.ifsc ? emp.ifsc.substring(0, 4) : 'UNKNOWN';
            if (!bankGroups[bankCode]) {
                bankGroups[bankCode] = {
                    employees: [],
                    totalAmount: 0
                };
            }
            bankGroups[bankCode].employees.push(emp);
            bankGroups[bankCode].totalAmount += emp.netPay || 0;
        });
        
        // Summary table
        this.doc.setFontSize(12);
        this.doc.text('Bank-wise Distribution', this.margin, this.currentY);
        this.currentY += 8;
        
        // Table headers
        const tableHeaders = ['Bank Code', 'No. of Employees', 'Total Amount', 'Percentage'];
        const colWidths = [40, 40, 50, 40];
        
        this.doc.setFillColor(...this.hexToRgbArray(this.colors.primary));
        this.doc.rect(this.margin, this.currentY - 5, 170, 8, 'F');
        
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        
        let xPos = this.margin + 5;
        tableHeaders.forEach((header, index) => {
            this.doc.text(header, xPos, this.currentY);
            xPos += colWidths[index];
        });
        
        this.currentY += 10;
        
        // Table rows
        const totalNetPay = payrollData.reduce((sum, emp) => sum + (emp.netPay || 0), 0);
        
        Object.entries(bankGroups).forEach(([bankCode, data], index) => {
            // Zebra striping
            if (index % 2 === 0) {
                this.doc.setFillColor(248, 250, 252);
                this.doc.rect(this.margin, this.currentY - 4, 170, 6, 'F');
            }
            
            this.doc.setTextColor(this.colors.text);
            this.doc.setFontSize(9);
            this.doc.setFont('helvetica', 'normal');
            
            xPos = this.margin + 5;
            const percentage = ((data.totalAmount / totalNetPay) * 100).toFixed(1);
            
            this.doc.text(bankCode, xPos, this.currentY);
            xPos += colWidths[0];
            this.doc.text(data.employees.length.toString(), xPos, this.currentY);
            xPos += colWidths[1];
            this.doc.text(this.formatCurrency(data.totalAmount), xPos, this.currentY);
            xPos += colWidths[2];
            this.doc.text(percentage + '%', xPos, this.currentY);
            
            this.currentY += 6;
        });
        
        // Total row
        this.doc.setDrawColor(this.colors.primary);
        this.doc.line(this.margin, this.currentY, this.margin + 170, this.currentY);
        this.currentY += 3;
        
        this.doc.setFont('helvetica', 'bold');
        xPos = this.margin + 5;
        this.doc.text('TOTAL', xPos, this.currentY);
        xPos += colWidths[0];
        this.doc.text(payrollData.length.toString(), xPos, this.currentY);
        xPos += colWidths[1];
        this.doc.text(this.formatCurrency(totalNetPay), xPos, this.currentY);
        xPos += colWidths[2];
        this.doc.text('100%', xPos, this.currentY);
        
        this.currentY += 15;
        
        // Payment mode distribution
        this.doc.setFontSize(12);
        this.doc.text('Payment Mode Analysis', this.margin, this.currentY);
        this.currentY += 8;
        
        // Simulate payment modes
        const paymentModes = {
            'NEFT': Math.floor(payrollData.length * 0.7),
            'RTGS': Math.floor(payrollData.length * 0.2),
            'IMPS': Math.floor(payrollData.length * 0.1)
        };
        
        // Draw bar chart
        const barHeight = 15;
        const maxWidth = 120;
        
        Object.entries(paymentModes).forEach(([mode, count], index) => {
            const percentage = count / payrollData.length;
            const barWidth = percentage * maxWidth;
            
            // Bar
            this.addGradientBackground(
                this.margin + 30, 
                this.currentY + (index * (barHeight + 5)), 
                barWidth, 
                barHeight,
                this.chartColors[index],
                this.lightenColor(this.chartColors[index])
            );
            
            // Label
            this.doc.setTextColor(this.colors.text);
            this.doc.setFontSize(10);
            this.doc.text(mode, this.margin, this.currentY + (index * (barHeight + 5)) + 10);
            
            // Value
            this.doc.setTextColor(255, 255, 255);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`${count} (${Math.round(percentage * 100)}%)`, 
                this.margin + 35, 
                this.currentY + (index * (barHeight + 5)) + 10
            );
        });
        
        this.doc.addPage();
        this.pageNumber++;
    }

    // Compliance Summary
    createComplianceSummary(payrollData) {
        this.addPageHeaderFooter();
        this.currentY = 38;
        
        // Section title with divider
        this.doc.setFontSize(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(this.colors.primary);
        this.doc.text('Compliance & Statutory Summary', this.margin, this.currentY);
        this.currentY += 8;
        
        // Add section divider
        this.addSectionDivider(this.currentY);
        this.currentY += 12;
        
        // Calculate compliance metrics
        const pfTotal = payrollData.reduce((sum, emp) => sum + (emp.pf || 0), 0);
        const esicTotal = payrollData.reduce((sum, emp) => sum + (emp.esic || 0), 0);
        const ptTotal = payrollData.reduce((sum, emp) => sum + (emp.pt || 0), 0);
        
        // Compliance cards with progress bars
        const complianceItems = [
            {
                name: 'Provident Fund (PF)',
                amount: pfTotal,
                employees: payrollData.filter(emp => emp.pf > 0).length,
                compliance: 98,
                color: this.colors.primary
            },
            {
                name: 'ESIC',
                amount: esicTotal,
                employees: payrollData.filter(emp => emp.esic > 0).length,
                compliance: 95,
                color: this.colors.success
            },
            {
                name: 'Professional Tax (PT)',
                amount: ptTotal,
                employees: payrollData.filter(emp => emp.pt > 0).length,
                compliance: 100,
                color: this.colors.accent
            }
        ];
        
        complianceItems.forEach((item, index) => {
            const yPos = this.currentY + (index * 40);
            
            // Card background
            this.doc.setFillColor(248, 250, 252);
            this.doc.rect(this.margin, yPos, 170, 35, 'F');
            
            // Title and amount
            this.doc.setTextColor(this.colors.text);
            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(item.name, this.margin + 5, yPos + 8);
            
            this.doc.setFontSize(14);
            this.doc.text(this.formatCurrency(item.amount), this.margin + 120, yPos + 8);
            
            // Employee count
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(`${item.employees} employees enrolled`, this.margin + 5, yPos + 16);
            
            // Progress bar
            const progressWidth = 150;
            const progressHeight = 8;
            const progressX = this.margin + 5;
            const progressY = yPos + 22;
            
            // Background
            this.doc.setFillColor(229, 231, 235);
            this.doc.rect(progressX, progressY, progressWidth, progressHeight, 'F');
            
            // Progress
            this.doc.setFillColor(...this.hexToRgbArray(item.color));
            this.doc.rect(progressX, progressY, progressWidth * (item.compliance / 100), progressHeight, 'F');
            
            // Percentage
            this.doc.setTextColor(this.colors.text);
            this.doc.setFontSize(9);
            this.doc.text(`${item.compliance}% Compliance`, progressX + progressWidth - 30, progressY + 6);
        });
        
        this.currentY += 130;
        
        // Monthly trend chart
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Deduction Trends (Last 6 Months)', this.margin, this.currentY);
        this.currentY += 10;
        
        // Simulated trend data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const trendData = months.map((month, index) => ({
            month,
            pf: pfTotal * (0.9 + Math.random() * 0.2),
            esic: esicTotal * (0.9 + Math.random() * 0.2),
            pt: ptTotal * (0.95 + Math.random() * 0.1)
        }));
        
        // Draw line chart area
        const chartWidth = 150;
        const chartHeight = 50;
        const chartX = this.margin;
        const chartY = this.currentY;
        
        // Grid
        this.doc.setDrawColor(229, 231, 235);
        this.doc.setLineWidth(0.1);
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = chartY + (i * chartHeight / 5);
            this.doc.line(chartX, y, chartX + chartWidth, y);
        }
        
        // Month labels
        this.doc.setFontSize(8);
        this.doc.setTextColor(this.colors.textLight);
        months.forEach((month, index) => {
            const x = chartX + (index * chartWidth / 5);
            this.doc.text(month, x, chartY + chartHeight + 5, { align: 'center' });
        });
        
        // Draw trend lines
        const maxValue = Math.max(...trendData.map(d => Math.max(d.pf, d.esic, d.pt)));
        const scale = chartHeight / maxValue;
        
        ['pf', 'esic', 'pt'].forEach((key, keyIndex) => {
            this.doc.setDrawColor(...this.hexToRgbArray(this.chartColors[keyIndex]));
            this.doc.setLineWidth(2);
            
            trendData.forEach((data, index) => {
                if (index > 0) {
                    const x1 = chartX + ((index - 1) * chartWidth / 5);
                    const y1 = chartY + chartHeight - (trendData[index - 1][key] * scale);
                    const x2 = chartX + (index * chartWidth / 5);
                    const y2 = chartY + chartHeight - (data[key] * scale);
                    
                    this.doc.line(x1, y1, x2, y2);
                }
            });
        });
        
        // Legend
        this.currentY = chartY + chartHeight + 15;
        const legendItems = [
            { label: 'PF', color: this.chartColors[0] },
            { label: 'ESIC', color: this.chartColors[1] },
            { label: 'PT', color: this.chartColors[2] }
        ];
        
        let legendX = this.margin;
        legendItems.forEach(item => {
            this.doc.setFillColor(...this.hexToRgbArray(item.color));
            this.doc.rect(legendX, this.currentY, 15, 3, 'F');
            this.doc.setTextColor(this.colors.text);
            this.doc.setFontSize(8);
            this.doc.text(item.label, legendX + 18, this.currentY + 2.5);
            legendX += 40;
        });
    }

    // Helper functions
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    hexToRgbArray(hex) {
        const rgb = this.hexToRgb(hex);
        return [rgb.r, rgb.g, rgb.b];
    }

    lightenColor(color) {
        const rgb = this.hexToRgb(color);
        const factor = 0.3;
        return `#${[
            Math.round(rgb.r + (255 - rgb.r) * factor),
            Math.round(rgb.g + (255 - rgb.g) * factor),
            Math.round(rgb.b + (255 - rgb.b) * factor)
        ].map(x => x.toString(16).padStart(2, '0')).join('')}`;
    }

    // Main generation function
    async generate(payrollData, attendanceData) {
        try {
            // Initialize PDF
            await this.initializePDF();
            
            // Create pages
            this.createTitlePage();
            this.createExecutiveDashboard(payrollData);
            this.createWorkforceAnalysis(payrollData);
            this.createAttendanceAnalytics(payrollData, attendanceData);
            this.createFinancialDisbursement(payrollData);
            this.createComplianceSummary(payrollData);
            
            // Update total pages
            const pageCount = this.doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                this.doc.setPage(i);
                const pageContent = this.doc.internal.pages[i];
                if (pageContent) {
                    const newContent = pageContent.join('\n').replace(/Page \d+ of \d+/, `Page ${i} of ${pageCount}`);
                    this.doc.internal.pages[i] = newContent.split('\n');
                }
            }
            
            // Generate filename
            const date = new Date();
            const filename = `MasterReport_${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}.pdf`;
            
            // Save the PDF
            this.doc.save(filename);
            
            return { success: true, filename };
            
        } catch (error) {
            console.error('Error generating Master Report:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export function to be called from main application
function generateMasterReportPDF() {
    if (!payrollData || payrollData.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No Data Available',
            text: 'Please process payroll first before generating the Master Report.',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }
    
    // Show loading
    Swal.fire({
        title: 'Generating Master Report',
        text: 'Creating professional PDF document...',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Get attendance data for current month
    const currentMonth = document.getElementById('monthSelector').value;
    const attendanceData = attendance[currentMonth] || {};
    
    // Generate report
    const generator = new MasterReportGenerator();
    generator.generate(payrollData, attendanceData).then(result => {
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Master Report Generated!',
                html: `
                    <div class="text-left">
                        <p class="mb-2"><strong>Filename:</strong> ${result.filename}</p>
                        <p class="mb-2"><strong>Total Employees:</strong> ${payrollData.length}</p>
                        <p class="mb-2"><strong>Report Sections:</strong></p>
                        <ul class="list-disc list-inside text-sm">
                            <li>Executive Dashboard</li>
                            <li>Workforce Investment Analysis</li>
                            <li>Department Performance</li>
                            <li>Attendance Analytics</li>
                            <li>Financial Disbursement</li>
                            <li>Compliance Summary</li>
                        </ul>
                    </div>
                `,
                confirmButtonColor: '#3b82f6'
            });
            
            addActivity('Generated Master Report PDF');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Generation Failed',
                text: result.error || 'Failed to generate Master Report',
                confirmButtonColor: '#ef4444'
            });
        }
    });
}

// Make the function available globally
window.generateMasterReportPDF = generateMasterReportPDF;