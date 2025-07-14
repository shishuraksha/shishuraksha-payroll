/**
 * Centralized Error Handler Module
 * Provides consistent error handling and user communication across the application
 */

class ErrorHandler {
    constructor() {
        this.setupGlobalErrorHandlers();
    }
    
    // Setup global error handlers for uncaught errors
    setupGlobalErrorHandlers() {
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('Global JavaScript error:', event.error);
            this.handleError(event.error, 'Global JavaScript Error');
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason, 'Unhandled Promise Rejection');
            event.preventDefault(); // Prevent the default browser behavior
        });
    }
    
    // Main error handling method
    handleError(error, context = '', showToUser = true) {
        // Log technical details for debugging
        const errorDetails = {
            message: error?.message || 'Unknown error',
            stack: error?.stack,
            context: context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error('Error Details:', errorDetails);
        
        // Track error activity if available
        if (typeof addActivity === 'function') {
            try {
                addActivity(`Error in ${context}: ${errorDetails.message}`);
            } catch (activityError) {
                console.error('Failed to log activity:', activityError);
            }
        }
        
        // Show user-friendly message if requested
        if (showToUser) {
            this.showUserError(error, context);
        }
        
        return errorDetails;
    }
    
    // Show user-friendly error messages
    showUserError(error, context) {
        let userMessage = 'An unexpected error occurred. Please try again.';
        let title = 'Error';
        
        // Customize messages based on error type or context
        if (context.includes('Storage') || context.includes('localStorage')) {
            title = 'Storage Error';
            userMessage = 'Unable to save your changes. Please check your browser storage settings.';
        } else if (context.includes('Validation')) {
            title = 'Validation Error';
            userMessage = 'Please check your input and try again.';
        } else if (context.includes('Calculation')) {
            title = 'Calculation Error';
            userMessage = 'There was an error processing the calculations. Please check your data.';
        } else if (context.includes('PDF')) {
            title = 'PDF Generation Error';
            userMessage = 'Unable to generate PDF. Please try again or contact support.';
        } else if (context.includes('Network')) {
            title = 'Connection Error';
            userMessage = 'Unable to connect. Please check your internet connection.';
        }
        
        // Use SweetAlert2 for consistent UI
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: title,
                text: userMessage,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
        } else {
            // Fallback to browser alert if SweetAlert2 is not available
            alert(`${title}: ${userMessage}`);
        }
    }
    
    // Handle validation errors specifically
    handleValidationError(errors, context = 'Input Validation') {
        const errorMessage = Array.isArray(errors) ? errors.join('\n') : errors;
        
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                html: Array.isArray(errors) ? errors.join('<br>') : errors,
                confirmButtonText: 'OK',
                confirmButtonColor: '#f39c12'
            });
        } else {
            alert(`Validation Error: ${errorMessage}`);
        }
        
        // Log validation errors
        console.warn('Validation Error:', { errors, context });
        
        if (typeof addActivity === 'function') {
            try {
                addActivity(`Validation error in ${context}: ${errorMessage}`);
            } catch (activityError) {
                console.error('Failed to log validation activity:', activityError);
            }
        }
    }
    
    // Handle success messages consistently
    showSuccess(message, title = 'Success', timer = 2000) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: title,
                text: message,
                timer: timer,
                showConfirmButton: timer === 0,
                timerProgressBar: timer > 0
            });
        } else {
            alert(`${title}: ${message}`);
        }
    }
    
    // Handle warning messages
    showWarning(message, title = 'Warning') {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: title,
                text: message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#f39c12'
            });
        } else {
            alert(`${title}: ${message}`);
        }
    }
    
    // Handle info messages
    showInfo(message, title = 'Information') {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'info',
                title: title,
                text: message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            });
        } else {
            alert(`${title}: ${message}`);
        }
    }
    
    // Create a safe wrapper for async functions
    wrapAsync(asyncFunction, context = '') {
        return async (...args) => {
            try {
                return await asyncFunction.apply(this, args);
            } catch (error) {
                this.handleError(error, context || asyncFunction.name);
                throw error; // Re-throw so calling code can handle if needed
            }
        };
    }
    
    // Create a safe wrapper for sync functions
    wrapSync(syncFunction, context = '') {
        return (...args) => {
            try {
                return syncFunction.apply(this, args);
            } catch (error) {
                this.handleError(error, context || syncFunction.name);
                throw error; // Re-throw so calling code can handle if needed
            }
        };
    }
    
    // Confirm dangerous actions
    async confirmAction(message, title = 'Confirm Action', confirmText = 'Yes', cancelText = 'Cancel') {
        if (typeof Swal !== 'undefined') {
            const result = await Swal.fire({
                title: title,
                text: message,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: confirmText,
                cancelButtonText: cancelText,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6'
            });
            
            return result.isConfirmed;
        } else {
            return confirm(`${title}: ${message}`);
        }
    }
}

// Create global instance
const errorHandler = new ErrorHandler();

// Utility functions for easy access
function handleError(error, context = '', showToUser = true) {
    return errorHandler.handleError(error, context, showToUser);
}

function showValidationError(errors, context = 'Input Validation') {
    return errorHandler.handleValidationError(errors, context);
}

function showSuccess(message, title = 'Success', timer = 2000) {
    return errorHandler.showSuccess(message, title, timer);
}

function showWarning(message, title = 'Warning') {
    return errorHandler.showWarning(message, title);
}

function showInfo(message, title = 'Information') {
    return errorHandler.showInfo(message, title);
}

function confirmAction(message, title = 'Confirm Action', confirmText = 'Yes', cancelText = 'Cancel') {
    return errorHandler.confirmAction(message, title, confirmText, cancelText);
}

function wrapAsync(asyncFunction, context = '') {
    return errorHandler.wrapAsync(asyncFunction, context);
}

function wrapSync(syncFunction, context = '') {
    return errorHandler.wrapSync(syncFunction, context);
}

// Make functions available globally for browser use
window.ErrorHandler = ErrorHandler;
window.errorHandler = errorHandler;
window.handleError = handleError;
window.showValidationError = showValidationError;
window.showSuccess = showSuccess;
window.showWarning = showWarning;
window.showInfo = showInfo;
window.confirmAction = confirmAction;
window.wrapAsync = wrapAsync;
window.wrapSync = wrapSync;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ErrorHandler,
        errorHandler,
        handleError,
        showValidationError,
        showSuccess,
        showWarning,
        showInfo,
        confirmAction,
        wrapAsync,
        wrapSync
    };
}