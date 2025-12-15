/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVENT BUS - Pub/Sub System for Learn-Do Architecture
 * ═══════════════════════════════════════════════════════════════════════════
 * Central event hub connecting UI, AccountingEngine, and LearningEngine
 */

class EventBus {
    constructor() {
        this.listeners = new Map();
        this.history = [];
        this.maxHistory = 100;
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Handler function
     * @param {Object} options - { once: boolean, priority: number }
     * @returns {Function} Unsubscribe function
     */
    on(event, callback, options = {}) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        
        const listener = {
            callback,
            once: options.once || false,
            priority: options.priority || 0
        };
        
        this.listeners.get(event).push(listener);
        
        // Sort by priority (higher first)
        this.listeners.get(event).sort((a, b) => b.priority - a.priority);
        
        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event (fires once)
     */
    once(event, callback) {
        return this.on(event, callback, { once: true });
    }

    /**
     * Unsubscribe from an event
     */
    off(event, callback) {
        if (!this.listeners.has(event)) return;
        
        const listeners = this.listeners.get(event);
        const index = listeners.findIndex(l => l.callback === callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {Object} data - Event payload
     */
    emit(event, data = {}) {
        const eventData = {
            type: event,
            timestamp: Date.now(),
            data
        };
        
        // Store in history
        this.history.push(eventData);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
        
        // Console log for debugging (can be toggled)
        if (window.DEBUG_EVENTS) {
            console.log(`[EventBus] ${event}`, data);
        }
        
        if (!this.listeners.has(event)) return;
        
        const listeners = this.listeners.get(event);
        const toRemove = [];
        
        listeners.forEach((listener, index) => {
            try {
                listener.callback(eventData);
            } catch (error) {
                console.error(`[EventBus] Error in handler for ${event}:`, error);
            }
            
            if (listener.once) {
                toRemove.push(index);
            }
        });
        
        // Remove one-time listeners
        toRemove.reverse().forEach(index => listeners.splice(index, 1));
    }

    /**
     * Get event history
     */
    getHistory(eventType = null, limit = 20) {
        let events = this.history;
        if (eventType) {
            events = events.filter(e => e.type === eventType);
        }
        return events.slice(-limit);
    }

    /**
     * Clear all listeners
     */
    clear() {
        this.listeners.clear();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT TYPES - Semantic events for the application
// ═══════════════════════════════════════════════════════════════════════════

const AppEvents = {
    // Company/Mode Events
    COMPANY_CHANGED: 'company_changed',
    MODE_CHANGED: 'mode_changed',
    
    // Navigation Events
    VIEW_CHANGED: 'view_changed',
    MENU_CLICKED: 'menu_clicked',
    
    // Form Events
    FORM_OPENED: 'form_opened',
    FORM_CLOSED: 'form_closed',
    FIELD_CHANGED: 'field_changed',
    FIELD_FOCUSED: 'field_focused',
    FIELD_BLURRED: 'field_blurred',
    
    // Validation Events
    VALIDATE_START: 'validate_start',
    VALIDATE_PASSED: 'validate_passed',
    VALIDATE_FAILED: 'validate_failed',
    
    // Posting Events
    POSTING_START: 'posting_start',
    POSTING_SUCCESS: 'posting_success',
    POSTING_FAILED: 'posting_failed',
    
    // Report Events
    REPORT_OPENED: 'report_opened',
    REPORT_GENERATED: 'report_generated',
    
    // Learning Events
    LESSON_STARTED: 'lesson_started',
    LESSON_STEP: 'lesson_step',
    LESSON_COMPLETED: 'lesson_completed',
    HINT_SHOWN: 'hint_shown',
    EXPLANATION_SHOWN: 'explanation_shown',
    
    // Assistant Events
    ASSISTANT_OPENED: 'assistant_opened',
    ASSISTANT_CLOSED: 'assistant_closed',
    ASSISTANT_MESSAGE: 'assistant_message',
    
    // Data Events
    DATA_LOADED: 'data_loaded',
    DATA_SAVED: 'data_saved',
    DATA_RESET: 'data_reset'
};

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

window.eventBus = new EventBus();
window.AppEvents = AppEvents;

// Enable debug mode via console: window.DEBUG_EVENTS = true
window.DEBUG_EVENTS = false;

