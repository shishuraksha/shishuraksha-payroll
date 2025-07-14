/**
 * Security Utilities Module
 * Provides input sanitization and XSS protection while preserving functionality
 */

// HTML sanitization utility
function sanitizeHTML(input) {
    if (typeof input !== 'string') return '';
    
    // Create a temporary div element to leverage browser's built-in HTML parsing
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}

// Advanced HTML sanitization for rich content (if needed)
function sanitizeRichHTML(input) {
    if (typeof input !== 'string') return '';
    
    // Allow specific safe HTML tags and attributes
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br'];
    const allowedAttributes = [];
    
    // Basic implementation - for production, consider using DOMPurify
    const temp = document.createElement('div');
    temp.innerHTML = input;
    
    // Remove script tags and event handlers
    const scripts = temp.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove all event handlers
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(element => {
        // Remove all event handler attributes
        const attributes = [...element.attributes];
        attributes.forEach(attr => {
            if (attr.name.startsWith('on')) {
                element.removeAttribute(attr.name);
            }
        });
        
        // Remove non-allowed tags
        if (!allowedTags.includes(element.tagName.toLowerCase())) {
            element.replaceWith(...element.childNodes);
        }
    });
    
    return temp.innerHTML;
}

// Sanitize form data
function sanitizeFormData(formData) {
    const sanitized = {};
    
    for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeHTML(value);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
}

// Validate and sanitize employee data
function sanitizeEmployeeData(employee) {
    if (!employee || typeof employee !== 'object') return null;
    
    return {
        id: sanitizeHTML(employee.id || ''),
        name: sanitizeHTML(employee.name || ''),
        department: sanitizeHTML(employee.department || ''),
        designation: sanitizeHTML(employee.designation || ''),
        bankAccount: sanitizeHTML(employee.bankAccount || ''),
        ifsc: sanitizeHTML(employee.ifsc || ''),
        basicSalary: parseFloat(employee.basicSalary) || 0,
        hua: sanitizeHTML(employee.hua || ''),
        esicNumber: sanitizeHTML(employee.esicNumber || ''),
        advance: parseFloat(employee.advance) || 0,
        status: sanitizeHTML(employee.status || 'Active')
    };
}

// Validate and sanitize doctor data
function sanitizeDoctorData(doctor) {
    if (!doctor || typeof doctor !== 'object') return null;
    
    return {
        id: sanitizeHTML(doctor.id || ''),
        name: sanitizeHTML(doctor.name || ''),
        specialization: sanitizeHTML(doctor.specialization || ''),
        department: sanitizeHTML(doctor.department || ''),
        registrationNumber: sanitizeHTML(doctor.registrationNumber || ''),
        experience: parseInt(doctor.experience) || 0,
        hourlyRate: parseFloat(doctor.hourlyRate) || 0,
        nightRate: parseFloat(doctor.nightRate) || 0,
        status: sanitizeHTML(doctor.status || 'Active')
    };
}

// Safe DOM element creation with sanitized content
function createSafeElement(tagName, content, attributes = {}) {
    const element = document.createElement(tagName);
    
    // Set sanitized text content
    if (content) {
        element.textContent = content;
    }
    
    // Set safe attributes
    Object.entries(attributes).forEach(([key, value]) => {
        // Skip event handler attributes
        if (key.startsWith('on')) return;
        
        // Sanitize attribute values
        const sanitizedValue = typeof value === 'string' ? sanitizeHTML(value) : value;
        element.setAttribute(key, sanitizedValue);
    });
    
    return element;
}

// Safe innerHTML replacement function
function safeSetInnerHTML(element, htmlString) {
    if (!element) return;
    
    // Clear existing content
    element.innerHTML = '';
    
    // Create sanitized content
    const temp = document.createElement('div');
    temp.innerHTML = sanitizeRichHTML(htmlString);
    
    // Move sanitized content to target element
    while (temp.firstChild) {
        element.appendChild(temp.firstChild);
    }
}

// Input validation utilities
function validateEmployeeInput(data) {
    const errors = [];
    
    if (!data.id || data.id.trim().length === 0) {
        errors.push('Employee ID is required');
    }
    
    if (!data.name || data.name.trim().length === 0) {
        errors.push('Name is required');
    }
    
    if (!data.department || data.department.trim().length === 0) {
        errors.push('Department is required');
    }
    
    if (!data.designation || data.designation.trim().length === 0) {
        errors.push('Designation is required');
    }
    
    if (!data.bankAccount || data.bankAccount.trim().length === 0) {
        errors.push('Bank Account is required');
    }
    
    if (!data.ifsc || data.ifsc.trim().length === 0) {
        errors.push('IFSC Code is required');
    }
    
    if (!data.basicSalary || isNaN(data.basicSalary) || data.basicSalary <= 0) {
        errors.push('Valid Basic Salary is required');
    }
    
    // Additional format validations
    if (data.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifsc)) {
        errors.push('Invalid IFSC Code format');
    }
    
    if (data.bankAccount && !/^\d{9,18}$/.test(data.bankAccount)) {
        errors.push('Invalid Bank Account Number format');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

function validateDoctorInput(data) {
    const errors = [];
    
    if (!data.id || data.id.trim().length === 0) {
        errors.push('Doctor ID is required');
    }
    
    if (!data.name || data.name.trim().length === 0) {
        errors.push('Name is required');
    }
    
    if (!data.specialization || data.specialization.trim().length === 0) {
        errors.push('Specialization is required');
    }
    
    if (!data.department || data.department.trim().length === 0) {
        errors.push('Department is required');
    }
    
    if (!data.registrationNumber || data.registrationNumber.trim().length === 0) {
        errors.push('Registration Number is required');
    }
    
    if (!data.hourlyRate || isNaN(data.hourlyRate) || data.hourlyRate <= 0) {
        errors.push('Valid Hourly Rate is required');
    }
    
    if (!data.nightRate || isNaN(data.nightRate) || data.nightRate <= 0) {
        errors.push('Valid Night Rate is required');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Make functions available globally for browser use
window.sanitizeHTML = sanitizeHTML;
window.sanitizeRichHTML = sanitizeRichHTML;
window.sanitizeFormData = sanitizeFormData;
window.sanitizeEmployeeData = sanitizeEmployeeData;
window.sanitizeDoctorData = sanitizeDoctorData;
window.createSafeElement = createSafeElement;
window.safeSetInnerHTML = safeSetInnerHTML;
window.validateEmployeeInput = validateEmployeeInput;
window.validateDoctorInput = validateDoctorInput;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sanitizeHTML,
        sanitizeRichHTML,
        sanitizeFormData,
        sanitizeEmployeeData,
        sanitizeDoctorData,
        createSafeElement,
        safeSetInnerHTML,
        validateEmployeeInput,
        validateDoctorInput
    };
}