/**
 * UI Enhancements Module
 * Handles loading states, keyboard navigation, user feedback, and modern interactions
 */

class UIEnhancements {
    constructor() {
        this.loadingStates = new Map();
        this.notifications = [];
        this.setupGlobalKeyboardNavigation();
        this.setupFocusManagement();
        this.setupLoadingIndicators();
    }

    // Keyboard Navigation Enhancement
    setupGlobalKeyboardNavigation() {
        // Tab navigation for main tabs
        document.addEventListener('keydown', (event) => {
            if (event.target.closest('[role="tablist"]')) {
                this.handleTabKeyNavigation(event);
            }
            
            // Global keyboard shortcuts
            if (event.altKey || event.ctrlKey) {
                this.handleGlobalKeyboardShortcuts(event);
            }
            
            // Escape key handling
            if (event.key === 'Escape') {
                this.handleEscapeKey(event);
            }
        });
    }

    handleTabKeyNavigation(event) {
        const tablist = event.target.closest('[role="tablist"]');
        const tabs = tablist.querySelectorAll('[role="tab"]');
        const currentIndex = Array.from(tabs).indexOf(event.target);
        
        let newIndex = currentIndex;
        
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'Home':
                event.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                event.preventDefault();
                newIndex = tabs.length - 1;
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                event.target.click();
                return;
        }
        
        if (newIndex !== currentIndex) {
            tabs[newIndex].focus();
            this.updateTabSelection(tabs, newIndex);
        }
    }

    updateTabSelection(tabs, selectedIndex) {
        tabs.forEach((tab, index) => {
            const isSelected = index === selectedIndex;
            tab.setAttribute('aria-selected', isSelected);
            tab.setAttribute('tabindex', isSelected ? '0' : '-1');
            
            if (isSelected) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    handleGlobalKeyboardShortcuts(event) {
        // Ctrl/Cmd + K for search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            this.focusSearch();
        }
        
        // Alt + number keys for tab navigation
        if (event.altKey && event.key >= '1' && event.key <= '6') {
            event.preventDefault();
            const tabIndex = parseInt(event.key) - 1;
            this.switchToTab(tabIndex);
        }
        
        // Ctrl/Cmd + Shift + D for dark mode
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            if (typeof toggleDarkMode === 'function') {
                toggleDarkMode();
            }
        }
    }

    focusSearch() {
        const searchInputs = [
            document.getElementById('employeeSearch'),
            document.getElementById('doctorSearch'),
            document.getElementById('attendanceSearch')
        ];
        
        const visibleSearch = searchInputs.find(input => 
            input && input.offsetParent !== null
        );
        
        if (visibleSearch) {
            visibleSearch.focus();
            visibleSearch.select();
        }
    }

    switchToTab(tabIndex) {
        const tabs = ['dashboard', 'employees', 'doctors', 'attendance', 'payroll', 'reports'];
        if (tabIndex >= 0 && tabIndex < tabs.length) {
            if (typeof switchTab === 'function') {
                switchTab(tabs[tabIndex]);
            }
        }
    }

    handleEscapeKey(event) {
        // Close modals
        const visibleModal = document.querySelector('.modal-backdrop:not(.hidden)');
        if (visibleModal) {
            event.preventDefault();
            const modalId = visibleModal.querySelector('.modal-content')?.closest('[id]')?.id;
            if (modalId && typeof closeModal === 'function') {
                closeModal(modalId);
            }
        }
        
        // Close mobile menu
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            event.preventDefault();
            if (typeof toggleMobileMenu === 'function') {
                toggleMobileMenu();
            }
        }
        
        // Clear search
        if (event.target.matches('input[type="search"], input[id*="Search"]')) {
            event.target.value = '';
            event.target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    // Focus Management
    setupFocusManagement() {
        // Focus trap for modals
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                const modal = event.target.closest('.modal:not([aria-hidden="true"])');
                if (modal) {
                    this.trapFocus(event, modal);
                }
            }
        });

        // Focus restoration
        this.previousFocus = null;
    }

    trapFocus(event, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    saveFocus() {
        this.previousFocus = document.activeElement;
    }

    restoreFocus() {
        if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
            this.previousFocus.focus();
            this.previousFocus = null;
        }
    }

    // Loading States
    setupLoadingIndicators() {
        this.createLoadingOverlay();
    }

    createLoadingOverlay() {
        if (!document.getElementById('globalLoadingOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'globalLoadingOverlay';
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
            overlay.setAttribute('aria-hidden', 'true');
            
            overlay.innerHTML = `
                <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                    <div class="flex items-center space-x-4">
                        <div class="loading-spinner"></div>
                        <div>
                            <h3 class="font-semibold text-gray-900 dark:text-white" id="loading-title">Loading...</h3>
                            <p class="text-sm text-gray-600 dark:text-gray-400" id="loading-message">Please wait</p>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="progress-bar">
                            <div class="progress-fill" id="loading-progress" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
        }
    }

    showLoading(title = 'Loading...', message = 'Please wait', progress = 0) {
        const overlay = document.getElementById('globalLoadingOverlay');
        const titleEl = document.getElementById('loading-title');
        const messageEl = document.getElementById('loading-message');
        const progressEl = document.getElementById('loading-progress');
        
        if (overlay) {
            titleEl.textContent = title;
            messageEl.textContent = message;
            progressEl.style.width = `${progress}%`;
            
            overlay.classList.remove('hidden');
            overlay.setAttribute('aria-hidden', 'false');
            
            // Announce to screen readers
            this.announceToScreenReader(`${title}. ${message}`);
        }
    }

    updateLoadingProgress(progress, message) {
        const messageEl = document.getElementById('loading-message');
        const progressEl = document.getElementById('loading-progress');
        
        if (messageEl && progressEl) {
            if (message) messageEl.textContent = message;
            progressEl.style.width = `${progress}%`;
        }
    }

    hideLoading() {
        const overlay = document.getElementById('globalLoadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    // Button Loading States
    setButtonLoading(button, isLoading = true) {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            
            // Store original content
            if (!button.dataset.originalContent) {
                button.dataset.originalContent = button.innerHTML;
            }
            
            button.innerHTML = `
                <div class="loading-spinner"></div>
                <span class="ml-2">Loading...</span>
            `;
        } else {
            button.disabled = false;
            button.setAttribute('aria-busy', 'false');
            
            if (button.dataset.originalContent) {
                button.innerHTML = button.dataset.originalContent;
                delete button.dataset.originalContent;
            }
        }
    }

    // Toast Notifications
    showToast(message, type = 'info', duration = 5000) {
        const toastContainer = this.getOrCreateToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${iconMap[type]} mr-3" aria-hidden="true"></i>
                <span class="flex-1">${message}</span>
                <button class="ml-3 text-gray-500 hover:text-gray-700" onclick="this.parentElement.parentElement.remove()" aria-label="Close notification">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, duration);
        }
        
        // Announce to screen readers
        this.announceToScreenReader(message);
        
        return toast;
    }

    getOrCreateToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'false');
            document.body.appendChild(container);
        }
        return container;
    }

    // Screen Reader Announcements
    announceToScreenReader(message) {
        const announcements = document.getElementById('status-announcements');
        if (announcements) {
            announcements.textContent = message;
            
            // Clear after a short delay
            setTimeout(() => {
                announcements.textContent = '';
            }, 1000);
        }
    }

    // Form Enhancement
    enhanceForm(formElement) {
        if (!formElement) return;
        
        // Add floating labels
        const inputs = formElement.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            this.addFloatingLabel(input);
        });
        
        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    addFloatingLabel(input) {
        const wrapper = input.closest('.form-group, .form-floating');
        if (wrapper && !wrapper.classList.contains('form-floating')) {
            wrapper.classList.add('form-floating');
            
            const label = wrapper.querySelector('label');
            if (label && !input.placeholder) {
                input.placeholder = ' '; // Needed for CSS :placeholder-shown
            }
        }
    }

    validateField(field) {
        const isValid = field.checkValidity();
        field.setAttribute('aria-invalid', !isValid);
        
        if (!isValid) {
            this.showFieldError(field, field.validationMessage);
        } else {
            this.clearFieldError(field);
        }
        
        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const wrapper = field.closest('.form-group, .form-floating');
        if (wrapper) {
            const errorId = `${field.id || 'field'}-error`;
            const errorElement = document.createElement('div');
            errorElement.id = errorId;
            errorElement.className = 'form-feedback invalid';
            errorElement.textContent = message;
            
            wrapper.appendChild(errorElement);
            field.setAttribute('aria-describedby', errorId);
        }
    }

    clearFieldError(field) {
        const wrapper = field.closest('.form-group, .form-floating');
        if (wrapper) {
            const existingError = wrapper.querySelector('.form-feedback');
            if (existingError) {
                existingError.remove();
                field.removeAttribute('aria-describedby');
            }
        }
        field.setAttribute('aria-invalid', 'false');
    }

    // Responsive Table Utilities
    makeTableResponsive(table) {
        if (!table) return;
        
        const wrapper = table.closest('.table-responsive');
        if (!wrapper) return;
        
        // Add mobile card view
        this.createMobileTableView(table);
        
        // Add horizontal scroll indicators
        this.addScrollIndicators(wrapper);
    }

    createMobileTableView(table) {
        const mobileView = document.createElement('div');
        mobileView.className = 'table-mobile-cards';
        
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        
        rows.forEach(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            const card = document.createElement('div');
            card.className = 'mobile-card';
            
            const cardHeader = document.createElement('div');
            cardHeader.className = 'mobile-card-header';
            cardHeader.innerHTML = `
                <div class="mobile-card-title">${cells[1]?.textContent || 'Item'}</div>
                <div class="mobile-card-status">${cells[cells.length - 2]?.textContent || ''}</div>
            `;
            
            const cardContent = document.createElement('div');
            cardContent.className = 'mobile-card-content';
            
            cells.forEach((cell, index) => {
                if (index === 0 || index === cells.length - 1) return; // Skip ID and actions
                
                const cardRow = document.createElement('div');
                cardRow.className = 'mobile-card-row';
                cardRow.innerHTML = `
                    <span class="mobile-card-label">${headers[index] || ''}</span>
                    <span class="mobile-card-value">${cell.textContent}</span>
                `;
                cardContent.appendChild(cardRow);
            });
            
            // Add actions if present
            const actionsCell = cells[cells.length - 1];
            if (actionsCell) {
                const cardActions = document.createElement('div');
                cardActions.className = 'mobile-card-actions';
                cardActions.innerHTML = actionsCell.innerHTML;
                card.appendChild(cardHeader);
                card.appendChild(cardContent);
                card.appendChild(cardActions);
            } else {
                card.appendChild(cardHeader);
                card.appendChild(cardContent);
            }
            
            mobileView.appendChild(card);
        });
        
        table.parentNode.insertBefore(mobileView, table.nextSibling);
    }

    addScrollIndicators(wrapper) {
        const indicator = document.createElement('div');
        indicator.className = 'scroll-indicator';
        indicator.innerHTML = '← Scroll to see more →';
        wrapper.appendChild(indicator);
        
        wrapper.addEventListener('scroll', () => {
            const isScrollable = wrapper.scrollWidth > wrapper.clientWidth;
            const isAtStart = wrapper.scrollLeft === 0;
            const isAtEnd = wrapper.scrollLeft >= wrapper.scrollWidth - wrapper.clientWidth - 1;
            
            indicator.style.display = isScrollable ? 'block' : 'none';
            
            if (isAtStart) {
                indicator.textContent = 'Scroll right to see more →';
            } else if (isAtEnd) {
                indicator.textContent = '← Scroll left to see more';
            } else {
                indicator.textContent = '← Scroll to see more →';
            }
        });
    }
}

// Create global instance
const uiEnhancements = new UIEnhancements();

// Utility functions for easy access
function showLoading(title, message, progress) {
    return uiEnhancements.showLoading(title, message, progress);
}

function hideLoading() {
    return uiEnhancements.hideLoading();
}

function updateLoadingProgress(progress, message) {
    return uiEnhancements.updateLoadingProgress(progress, message);
}

function showToast(message, type, duration) {
    return uiEnhancements.showToast(message, type, duration);
}

function setButtonLoading(button, isLoading) {
    return uiEnhancements.setButtonLoading(button, isLoading);
}

function announceToScreenReader(message) {
    return uiEnhancements.announceToScreenReader(message);
}

function enhanceForm(formElement) {
    return uiEnhancements.enhanceForm(formElement);
}

function makeTableResponsive(table) {
    return uiEnhancements.makeTableResponsive(table);
}

// Make functions available globally for browser use
window.UIEnhancements = UIEnhancements;
window.uiEnhancements = uiEnhancements;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.updateLoadingProgress = updateLoadingProgress;
window.showToast = showToast;
window.setButtonLoading = setButtonLoading;
window.announceToScreenReader = announceToScreenReader;
window.enhanceForm = enhanceForm;
window.makeTableResponsive = makeTableResponsive;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UIEnhancements,
        uiEnhancements,
        showLoading,
        hideLoading,
        updateLoadingProgress,
        showToast,
        setButtonLoading,
        announceToScreenReader,
        enhanceForm,
        makeTableResponsive
    };
}