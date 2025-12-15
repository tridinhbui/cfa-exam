/**
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPANY CONTEXT - Hybrid Training/Production Data Management
 * ═══════════════════════════════════════════════════════════════════════════
 * Manages company profiles, data segregation, and workspace switching
 */

class CompanyContext {
    constructor() {
        this.companies = {
            training: {
                id: 'training',
                name: 'Training Company',
                description: 'Sandbox environment for learning - can be reset anytime',
                type: 'training',
                icon: '📚',
                color: '#4CAF50'
            },
            production: {
                id: 'production', 
                name: 'My Company',
                description: 'Real operations with audit trail and controls',
                type: 'production',
                icon: '🏢',
                color: '#0a6ed1'
            }
        };
        
        this.currentCompanyId = this.loadCurrentCompany() || 'training';
        this.storagePrefix = 'AccountingSim';
    }

    /**
     * Get storage key for current company
     */
    getStorageKey(module) {
        return `${this.storagePrefix}:${this.currentCompanyId}:${module}`;
    }

    /**
     * Get current company profile
     */
    getCurrentCompany() {
        return this.companies[this.currentCompanyId];
    }

    /**
     * Check if current company is training mode
     */
    isTraining() {
        return this.currentCompanyId === 'training';
    }

    /**
     * Check if current company is production mode
     */
    isProduction() {
        return this.currentCompanyId === 'production';
    }

    /**
     * Switch to a different company
     */
    switchCompany(companyId) {
        if (!this.companies[companyId]) {
            console.error(`Company ${companyId} not found`);
            return false;
        }

        const previousCompany = this.currentCompanyId;
        this.currentCompanyId = companyId;
        this.saveCurrentCompany();

        // Emit event
        if (window.eventBus) {
            window.eventBus.emit(AppEvents.COMPANY_CHANGED, {
                previousCompany,
                currentCompany: companyId,
                companyInfo: this.getCurrentCompany()
            });
        }

        return true;
    }

    /**
     * Save current company selection
     */
    saveCurrentCompany() {
        localStorage.setItem(`${this.storagePrefix}:currentCompany`, this.currentCompanyId);
    }

    /**
     * Load current company selection
     */
    loadCurrentCompany() {
        return localStorage.getItem(`${this.storagePrefix}:currentCompany`);
    }

    /**
     * Get data for current company
     */
    getData(module) {
        const key = this.getStorageKey(module);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Save data for current company
     */
    saveData(module, data) {
        const key = this.getStorageKey(module);
        localStorage.setItem(key, JSON.stringify(data));
        
        // Emit event
        if (window.eventBus) {
            window.eventBus.emit(AppEvents.DATA_SAVED, {
                company: this.currentCompanyId,
                module
            });
        }
    }

    /**
     * Reset training data to defaults
     */
    resetTrainingData() {
        if (!this.isTraining()) {
            console.warn('Can only reset training data in training mode');
            return false;
        }

        // Clear all training data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`${this.storagePrefix}:training:`)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Emit event
        if (window.eventBus) {
            window.eventBus.emit(AppEvents.DATA_RESET, {
                company: 'training'
            });
        }

        return true;
    }

    /**
     * Get all companies
     */
    getAllCompanies() {
        return Object.values(this.companies);
    }

    /**
     * Check if data exists for company
     */
    hasData(companyId, module) {
        const key = `${this.storagePrefix}:${companyId}:${module}`;
        return localStorage.getItem(key) !== null;
    }

    /**
     * Get storage stats
     */
    getStorageStats() {
        const stats = {
            training: { modules: [], totalSize: 0 },
            production: { modules: [], totalSize: 0 }
        };

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith(this.storagePrefix)) continue;

            const parts = key.split(':');
            if (parts.length >= 3) {
                const companyId = parts[1];
                const module = parts[2];
                const size = (localStorage.getItem(key) || '').length;

                if (stats[companyId]) {
                    stats[companyId].modules.push(module);
                    stats[companyId].totalSize += size;
                }
            }
        }

        return stats;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRAINING DATA SEEDS
// ═══════════════════════════════════════════════════════════════════════════

const TrainingDataSeeds = {
    partners: [
        { id: 'KH001', name: 'ABC Trading Co.', type: 'customer', address: '123 Le Loi St, D1, HCMC', taxId: '0123456789', balance: 0 },
        { id: 'KH002', name: 'XYZ Services Ltd.', type: 'customer', address: '456 Nguyen Hue St, D1, HCMC', taxId: '0987654321', balance: 0 },
        { id: 'KH003', name: 'Global Retail JSC', type: 'customer', address: '789 Dong Khoi St, D1, HCMC', taxId: '1122334455', balance: 50000000 },
        { id: 'NCC001', name: 'Material Supplier A', type: 'vendor', address: '321 Tran Hung Dao St, D5, HCMC', taxId: '5544332211', balance: 0 },
        { id: 'NCC002', name: 'Equipment Vendor B', type: 'vendor', address: '654 Vo Van Tan St, D3, HCMC', taxId: '6677889900', balance: 0 },
        { id: 'NCC003', name: 'Office Supplies Inc.', type: 'vendor', address: '987 CMT8 St, D10, HCMC', taxId: '9988776655', balance: 25000000 },
    ],
    
    items: [
        { id: 'VL001', name: 'Raw Material X', unit: 'kg', group: 'Raw Materials', account: '152', quantity: 500, value: 25000000 },
        { id: 'VL002', name: 'Raw Material Y', unit: 'liter', group: 'Raw Materials', account: '152', quantity: 200, value: 16000000 },
        { id: 'HH001', name: 'Product Alpha', unit: 'unit', group: 'Trading Goods', account: '156', quantity: 100, value: 30000000 },
        { id: 'HH002', name: 'Product Beta', unit: 'set', group: 'Trading Goods', account: '156', quantity: 50, value: 25000000 },
        { id: 'TP001', name: 'Finished Good M', unit: 'unit', group: 'Finished Goods', account: '155', quantity: 80, value: 48000000 },
    ],

    initialBalances: {
        '1111': { debit: 100000000, credit: 0, balance: 100000000 },  // Cash
        '1121': { debit: 500000000, credit: 0, balance: 500000000 },  // Bank
        '131':  { debit: 50000000, credit: 0, balance: 50000000 },    // Receivables
        '152':  { debit: 41000000, credit: 0, balance: 41000000 },    // Raw Materials
        '155':  { debit: 48000000, credit: 0, balance: 48000000 },    // Finished Goods
        '156':  { debit: 55000000, credit: 0, balance: 55000000 },    // Trading Goods
        '211':  { debit: 200000000, credit: 0, balance: 200000000 },  // Fixed Assets
        '2141': { debit: 0, credit: 40000000, balance: 40000000 },    // Accum Depreciation
        '331':  { debit: 0, credit: 25000000, balance: 25000000 },    // Payables
        '4111': { debit: 0, credit: 929000000, balance: 929000000 },  // Share Capital
    },

    trainingScenarios: [
        {
            id: 'scenario_1',
            name: 'Daily Cash Operations',
            description: 'Practice recording cash receipts and payments',
            tasks: ['Create cash receipt from customer', 'Create cash payment for expenses', 'View cash book']
        },
        {
            id: 'scenario_2', 
            name: 'Purchase Cycle',
            description: 'Learn the full purchase-to-pay process',
            tasks: ['Receive goods into warehouse', 'Record vendor invoice', 'Make vendor payment']
        },
        {
            id: 'scenario_3',
            name: 'Month-End Closing',
            description: 'Understand period-end procedures',
            tasks: ['Review trial balance', 'Check account reconciliation', 'Generate financial statements']
        }
    ]
};

// ═══════════════════════════════════════════════════════════════════════════
// UI COMPONENT - Company Switcher
// ═══════════════════════════════════════════════════════════════════════════

function createCompanySwitcherUI() {
    const container = document.createElement('div');
    container.id = 'company-switcher-container';
    container.className = 'company-switcher';
    
    container.innerHTML = `
        <div class="company-switcher-btn" id="companySwitcherBtn">
            <span class="company-icon" id="currentCompanyIcon"></span>
            <span class="company-name" id="currentCompanyName"></span>
            <span class="dropdown-arrow">▼</span>
        </div>
        <div class="company-dropdown hidden" id="companyDropdown">
            <div class="company-option" data-company="training">
                <span class="option-icon">📚</span>
                <div class="option-info">
                    <span class="option-name">Training Company</span>
                    <span class="option-desc">Sandbox - Learn safely</span>
                </div>
            </div>
            <div class="company-option" data-company="production">
                <span class="option-icon">🏢</span>
                <div class="option-info">
                    <span class="option-name">My Company</span>
                    <span class="option-desc">Real operations</span>
                </div>
            </div>
            <div class="company-divider"></div>
            <div class="company-action" id="resetTrainingBtn">
                <span class="action-icon">🔄</span>
                <span class="action-text">Reset Training Data</span>
            </div>
        </div>
    `;

    return container;
}

function initCompanySwitcher() {
    // Update UI with current company
    const company = companyContext.getCurrentCompany();
    const iconEl = document.getElementById('currentCompanyIcon');
    const nameEl = document.getElementById('currentCompanyName');
    
    if (iconEl) iconEl.textContent = company.icon;
    if (nameEl) nameEl.textContent = company.name;

    // Toggle dropdown
    const btn = document.getElementById('companySwitcherBtn');
    const dropdown = document.getElementById('companyDropdown');
    
    if (btn && dropdown) {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdown.classList.add('hidden');
        });

        // Company options
        dropdown.querySelectorAll('.company-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const companyId = option.dataset.company;
                if (companyId !== companyContext.currentCompanyId) {
                    companyContext.switchCompany(companyId);
                    updateCompanySwitcherUI();
                    // Reload data for new company
                    if (typeof reloadAccountingData === 'function') {
                        reloadAccountingData();
                    }
                }
                dropdown.classList.add('hidden');
            });
        });

        // Reset training button
        const resetBtn = document.getElementById('resetTrainingBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (companyContext.isTraining()) {
                    if (confirm('Are you sure you want to reset all training data? This cannot be undone.')) {
                        companyContext.resetTrainingData();
                        if (typeof reloadAccountingData === 'function') {
                            reloadAccountingData();
                        }
                        alert('Training data has been reset!');
                    }
                } else {
                    alert('Please switch to Training Company first.');
                }
                dropdown.classList.add('hidden');
            });
        }
    }

    // Mark active company
    updateCompanySwitcherUI();
}

function updateCompanySwitcherUI() {
    const company = companyContext.getCurrentCompany();
    
    const iconEl = document.getElementById('currentCompanyIcon');
    const nameEl = document.getElementById('currentCompanyName');
    
    if (iconEl) iconEl.textContent = company.icon;
    if (nameEl) nameEl.textContent = company.name;

    // Update active state in dropdown
    document.querySelectorAll('.company-option').forEach(option => {
        option.classList.toggle('active', option.dataset.company === companyContext.currentCompanyId);
    });

    // Update body class for styling
    document.body.classList.toggle('training-mode', companyContext.isTraining());
    document.body.classList.toggle('production-mode', companyContext.isProduction());
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

window.companyContext = new CompanyContext();
window.TrainingDataSeeds = TrainingDataSeeds;
window.createCompanySwitcherUI = createCompanySwitcherUI;
window.initCompanySwitcher = initCompanySwitcher;
window.updateCompanySwitcherUI = updateCompanySwitcherUI;

