/**
 * Performance Utilities Module
 * Provides optimized DOM manipulation, event delegation, and performance monitoring
 */

class PerformanceUtils {
    constructor() {
        this.eventDelegators = new Map();
        this.debounceTimers = new Map();
        this.performanceMarks = new Map();
    }
    
    // Event delegation utility
    setupEventDelegation(container, eventType, selector, handler) {
        const containerId = container.id || `container_${Date.now()}`;
        const delegationKey = `${containerId}_${eventType}_${selector}`;
        
        // Remove existing delegation if any
        if (this.eventDelegators.has(delegationKey)) {
            container.removeEventListener(eventType, this.eventDelegators.get(delegationKey));
        }
        
        // Create new delegated handler
        const delegatedHandler = (event) => {
            const target = event.target.closest(selector);
            if (target && container.contains(target)) {
                try {
                    handler.call(target, event, target);
                } catch (error) {
                    if (typeof handleError === 'function') {
                        handleError(error, `Event Delegation: ${eventType} on ${selector}`);
                    } else {
                        console.error('Event delegation error:', error);
                    }
                }
            }
        };
        
        // Add event listener and store reference
        container.addEventListener(eventType, delegatedHandler);
        this.eventDelegators.set(delegationKey, delegatedHandler);
        
        return delegationKey;
    }
    
    // Remove event delegation
    removeEventDelegation(delegationKey) {
        if (this.eventDelegators.has(delegationKey)) {
            // Note: This is a simplified version. In practice, you'd need to store container reference too
            console.warn('Event delegation removal requires container reference - implement cleanup in component lifecycle');
            this.eventDelegators.delete(delegationKey);
        }
    }
    
    // Debounce utility
    debounce(func, delay, key = null) {
        const debounceKey = key || func.name || `debounce_${Date.now()}`;
        
        return (...args) => {
            // Clear existing timer
            if (this.debounceTimers.has(debounceKey)) {
                clearTimeout(this.debounceTimers.get(debounceKey));
            }
            
            // Set new timer
            const timerId = setTimeout(() => {
                this.debounceTimers.delete(debounceKey);
                try {
                    func.apply(this, args);
                } catch (error) {
                    if (typeof handleError === 'function') {
                        handleError(error, `Debounced Function: ${func.name}`);
                    } else {
                        console.error('Debounced function error:', error);
                    }
                }
            }, delay);
            
            this.debounceTimers.set(debounceKey, timerId);
        };
    }
    
    // Throttle utility
    throttle(func, delay) {
        let lastCall = 0;
        
        return (...args) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                try {
                    return func.apply(this, args);
                } catch (error) {
                    if (typeof handleError === 'function') {
                        handleError(error, `Throttled Function: ${func.name}`);
                    } else {
                        console.error('Throttled function error:', error);
                    }
                }
            }
        };
    }
    
    // Virtual scrolling utility for large tables
    createVirtualTable(container, options = {}) {
        const {
            itemHeight = 50,
            visibleCount = 20,
            bufferSize = 5,
            renderItem = () => {}
        } = options;
        
        const virtualContainer = {
            container,
            itemHeight,
            visibleCount,
            bufferSize,
            renderItem,
            data: [],
            scrollTop: 0,
            startIndex: 0,
            endIndex: 0
        };
        
        // Create virtual scrolling container
        container.style.overflow = 'auto';
        container.style.height = `${itemHeight * visibleCount}px`;
        
        const viewport = document.createElement('div');
        viewport.style.position = 'relative';
        container.appendChild(viewport);
        
        const renderVisibleItems = () => {
            const startIndex = Math.floor(virtualContainer.scrollTop / itemHeight);
            const endIndex = Math.min(
                startIndex + visibleCount + bufferSize * 2,
                virtualContainer.data.length
            );
            
            virtualContainer.startIndex = Math.max(0, startIndex - bufferSize);
            virtualContainer.endIndex = endIndex;
            
            // Clear viewport
            viewport.innerHTML = '';
            
            // Set viewport height
            viewport.style.height = `${virtualContainer.data.length * itemHeight}px`;
            
            // Render visible items
            for (let i = virtualContainer.startIndex; i < virtualContainer.endIndex; i++) {
                if (virtualContainer.data[i]) {
                    const item = renderItem(virtualContainer.data[i], i);
                    item.style.position = 'absolute';
                    item.style.top = `${i * itemHeight}px`;
                    item.style.height = `${itemHeight}px`;
                    item.style.width = '100%';
                    viewport.appendChild(item);
                }
            }
        };
        
        // Add scroll handler
        const scrollHandler = this.throttle(() => {
            virtualContainer.scrollTop = container.scrollTop;
            renderVisibleItems();
        }, 16); // ~60fps
        
        container.addEventListener('scroll', scrollHandler);
        
        // API for the virtual table
        return {
            setData(newData) {
                virtualContainer.data = newData;
                renderVisibleItems();
            },
            
            refresh() {
                renderVisibleItems();
            },
            
            scrollToIndex(index) {
                const scrollTop = index * itemHeight;
                container.scrollTop = scrollTop;
                virtualContainer.scrollTop = scrollTop;
                renderVisibleItems();
            },
            
            destroy() {
                container.removeEventListener('scroll', scrollHandler);
                viewport.remove();
            }
        };
    }
    
    // Efficient DOM updates using DocumentFragment
    batchDOMUpdates(container, updateFunction) {
        const fragment = document.createDocumentFragment();
        
        try {
            updateFunction(fragment);
            
            // Clear container and append all at once
            container.innerHTML = '';
            container.appendChild(fragment);
        } catch (error) {
            if (typeof handleError === 'function') {
                handleError(error, 'Batch DOM Updates');
            } else {
                console.error('Batch DOM update error:', error);
            }
        }
    }
    
    // Performance measurement utilities
    startMeasure(name) {
        this.performanceMarks.set(`${name}_start`, performance.now());
    }
    
    endMeasure(name, logResult = true) {
        const startTime = this.performanceMarks.get(`${name}_start`);
        if (startTime) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            this.performanceMarks.delete(`${name}_start`);
            
            if (logResult) {
                console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
            }
            
            return duration;
        }
        return null;
    }
    
    // Optimized table row creation
    createTableRow(data, columns, rowIndex = 0) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors';
        row.setAttribute('data-row-index', rowIndex);
        
        columns.forEach(column => {
            const cell = document.createElement('td');
            cell.className = column.className || '';
            
            // Safe content insertion
            if (column.html && typeof safeSetInnerHTML === 'function') {
                safeSetInnerHTML(cell, column.render ? column.render(data) : data[column.key]);
            } else {
                cell.textContent = column.render ? column.render(data) : data[column.key] || '';
            }
            
            row.appendChild(cell);
        });
        
        return row;
    }
    
    // Optimized search with highlighting
    highlightSearchResults(container, searchTerm) {
        if (!searchTerm.trim()) {
            // Remove existing highlights
            container.querySelectorAll('.search-highlight').forEach(el => {
                el.outerHTML = el.innerHTML;
            });
            return;
        }
        
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            
            if (regex.test(text)) {
                const highlightedHTML = text.replace(regex, '<span class="search-highlight bg-yellow-200 dark:bg-yellow-600">$1</span>');
                const wrapper = document.createElement('span');
                wrapper.innerHTML = highlightedHTML;
                textNode.parentNode.replaceChild(wrapper, textNode);
            }
        });
    }
    
    // Memory usage monitoring
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }
    
    // Cleanup utility for memory leaks prevention
    cleanup() {
        // Clear all debounce timers
        this.debounceTimers.forEach(timerId => clearTimeout(timerId));
        this.debounceTimers.clear();
        
        // Clear event delegators
        this.eventDelegators.clear();
        
        // Clear performance marks
        this.performanceMarks.clear();
    }
}

// Create global instance
const performanceUtils = new PerformanceUtils();

// Utility functions for easy access
function setupEventDelegation(container, eventType, selector, handler) {
    return performanceUtils.setupEventDelegation(container, eventType, selector, handler);
}

function debounce(func, delay, key = null) {
    return performanceUtils.debounce(func, delay, key);
}

function throttle(func, delay) {
    return performanceUtils.throttle(func, delay);
}

function createVirtualTable(container, options = {}) {
    return performanceUtils.createVirtualTable(container, options);
}

function batchDOMUpdates(container, updateFunction) {
    return performanceUtils.batchDOMUpdates(container, updateFunction);
}

function startMeasure(name) {
    return performanceUtils.startMeasure(name);
}

function endMeasure(name, logResult = true) {
    return performanceUtils.endMeasure(name, logResult);
}

function createTableRow(data, columns, rowIndex = 0) {
    return performanceUtils.createTableRow(data, columns, rowIndex);
}

function highlightSearchResults(container, searchTerm) {
    return performanceUtils.highlightSearchResults(container, searchTerm);
}

function getMemoryUsage() {
    return performanceUtils.getMemoryUsage();
}

// Make functions available globally for browser use
window.PerformanceUtils = PerformanceUtils;
window.performanceUtils = performanceUtils;
window.setupEventDelegation = setupEventDelegation;
window.debounce = debounce;
window.throttle = throttle;
window.createVirtualTable = createVirtualTable;
window.batchDOMUpdates = batchDOMUpdates;
window.startMeasure = startMeasure;
window.endMeasure = endMeasure;
window.createTableRow = createTableRow;
window.highlightSearchResults = highlightSearchResults;
window.getMemoryUsage = getMemoryUsage;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PerformanceUtils,
        performanceUtils,
        setupEventDelegation,
        debounce,
        throttle,
        createVirtualTable,
        batchDOMUpdates,
        startMeasure,
        endMeasure,
        createTableRow,
        highlightSearchResults,
        getMemoryUsage
    };
}