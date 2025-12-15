/**
 * ==============================================
 * MAIN APPLICATION - Accounting System Simulator
 * ==============================================
 */

// Current application state
let currentMode = null;
let currentView = 'dashboard';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Initialize company switcher
    initializeCompanySwitcher();
    
    // Setup event bus subscriptions
    setupEventSubscriptions();
});

// Initialize company switcher in header
function initializeCompanySwitcher() {
    const placeholder = document.getElementById('companySwitcherPlaceholder');
    if (placeholder && typeof createCompanySwitcherUI === 'function') {
        const switcher = createCompanySwitcherUI();
        placeholder.appendChild(switcher);
        initCompanySwitcher();
    }
}

// Setup event bus subscriptions
function setupEventSubscriptions() {
    if (!window.eventBus) return;
    
    // Listen for company changes
    window.eventBus.on(window.AppEvents.COMPANY_CHANGED, (event) => {
        console.log('Company changed:', event.data);
        reloadAccountingData();
        updateDashboard();
        updateRecentDocuments();
        setStatus(`Switched to ${event.data.companyInfo.name}`);
    });
    
    // Listen for data resets
    window.eventBus.on(window.AppEvents.DATA_RESET, (event) => {
        console.log('Data reset:', event.data);
        reloadAccountingData();
        updateDashboard();
        updateRecentDocuments();
    });
    
    // Listen for posting events to show FS impact
    window.eventBus.on(window.AppEvents.POSTING_SUCCESS, (event) => {
        if (window.fsImpactAnalyzer && event.data.journalEntry) {
            const impact = window.fsImpactAnalyzer.analyzeImpact(event.data.journalEntry);
            console.log('FS Impact:', impact);
        }
    });
}

// Reload accounting data (called when switching companies)
function reloadAccountingData() {
    if (accountingEngine) {
        accountingEngine.reloadData();
    }
}

// Update date/time display
function updateDateTime() {
    const now = new Date();
    const formatted = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('currentDateTime').textContent = formatted;
}

// Mode Selection
function selectMode(mode) {
    const previousMode = currentMode;
    currentMode = mode;
    accountingEngine.setMode(mode);
    
    // Hide mode selector, show main app
    document.getElementById('modeSelector').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // Apply mode styling
    if (mode === 'SAP') {
        document.body.classList.add('sap-mode');
        document.getElementById('logoDisplay').innerHTML = '<span class="logo-text">SAP Simulator</span>';
        document.getElementById('modeBadge').textContent = 'SAP FI/CO';
        document.getElementById('misaNav').classList.add('hidden');
        document.getElementById('sapNav').classList.remove('hidden');
    } else {
        document.body.classList.remove('sap-mode');
        document.getElementById('logoDisplay').innerHTML = '<span class="logo-text">MISA Simulator</span>';
        document.getElementById('modeBadge').textContent = 'MISA';
        document.getElementById('misaNav').classList.remove('hidden');
        document.getElementById('sapNav').classList.add('hidden');
    }
    
    // Emit mode changed event
    if (window.eventBus) {
        window.eventBus.emit(window.AppEvents.MODE_CHANGED, {
            mode,
            previousMode,
            company: window.companyContext?.getCurrentCompany()
        });
    }
    
    // Initialize dashboard
    updateDashboard();
    updateQuickActions();
    updateRecentDocuments();
    
    setStatus(`Switched to ${mode} mode`);
}

function showModeSelector() {
    document.getElementById('modeSelector').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

// Navigation
function navigate(view) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.currentTarget?.classList.add('active');
    
    // Hide all views
    document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active'));
    
    // Show target view
    const viewMap = {
        'dashboard': 'dashboardView',
        'cash': 'cashView',
        'bank': 'bankView',
        'purchase': 'purchaseView',
        'sales': 'salesView',
        'inventory': 'inventoryView',
        'fixedAssets': 'fixedAssetsView',
        'tools': 'toolsView',
        'salary': 'salaryView',
        'generalLedger': 'generalLedgerView',
        'chartOfAccounts': 'chartOfAccountsView',
        'partners': 'partnersView',
        'items': 'itemsView',
        'reportFinancial': 'reportFinancialView',
        'reportTax': 'reportTaxView',
        'reportManagement': 'reportManagementView',
        // Administration views
        'periodControl': 'periodControlView',
        'auditTrail': 'auditTrailView',
        // SAP views
        'fi-gl': 'fi-glView',
        'fi-ap': 'fi-apView',
        'fi-ar': 'fi-arView',
        'fi-asset': 'fi-assetView',
        'fi-bank': 'fi-bankView',
        'co-om': 'co-omView',
        'co-cca': 'co-ccaView',
        'co-pa': 'co-paView',
        'co-pc': 'co-pcView',
        'mm-fi': 'mm-fiView',
        'sd-fi': 'sd-fiView',
        'tcode': 'tcodeView',
        'sapReports': 'sapReportsView'
    };
    
    const targetView = viewMap[view] || 'dashboardView';
    const viewElement = document.getElementById(targetView);
    
    if (viewElement) {
        viewElement.classList.add('active');
        const previousView = currentView;
        currentView = view;
        
        // Emit view changed event
        if (window.eventBus) {
            window.eventBus.emit(window.AppEvents.VIEW_CHANGED, {
                view,
                previousView,
                mode: currentMode
            });
        }
        
        // Load view-specific data
        loadViewData(view);
    } else {
        document.getElementById('dashboardView').classList.add('active');
    }
}

// Load data for specific views
function loadViewData(view) {
    switch(view) {
        case 'cash':
            updateCashDocuments();
            break;
        case 'inventory':
            updateInventoryDocuments();
            break;
        case 'generalLedger':
            updateJournalTable();
            break;
        case 'chartOfAccounts':
            updateChartOfAccounts();
            break;
        case 'partners':
            updatePartnersTable();
            break;
        case 'items':
            updateItemsTable();
            break;
        case 'periodControl':
            updatePeriodControlView();
            break;
        case 'auditTrail':
            updateAuditTrailView();
            break;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// PERIOD CONTROL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function updatePeriodControlView() {
    const tbody = document.getElementById('periodsTableBody');
    if (!tbody) return;
    
    // Generate periods for last 12 months
    const periods = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const period = date.toISOString().substring(0, 7); // YYYY-MM
        periods.push(period);
    }
    
    const isProduction = window.companyContext?.isProduction();
    
    tbody.innerHTML = periods.map(period => {
        const isLocked = accountingEngine.lockedPeriods?.includes(period);
        const docCount = accountingEngine.documents?.filter(d => d.date?.startsWith(period)).length || 0;
        const lastDoc = accountingEngine.documents
            ?.filter(d => d.date?.startsWith(period))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        
        return `
            <tr>
                <td><strong>${period}</strong></td>
                <td>
                    <span class="period-status ${isLocked ? 'locked' : 'open'}">
                        ${isLocked ? '🔒 Locked' : '🔓 Open'}
                    </span>
                </td>
                <td>${docCount} document${docCount !== 1 ? 's' : ''}</td>
                <td>${lastDoc ? new Date(lastDoc.createdAt).toLocaleDateString() : '-'}</td>
                <td class="period-actions">
                    ${isProduction ? `
                        ${isLocked 
                            ? `<button class="btn btn-sm btn-secondary" onclick="unlockPeriod('${period}')">Unlock</button>`
                            : `<button class="btn btn-sm btn-warning" onclick="lockPeriod('${period}')">Lock</button>`
                        }
                    ` : '<span class="text-muted">-</span>'}
                </td>
            </tr>
        `;
    }).join('');
}

function lockPeriod(period) {
    if (!window.companyContext?.isProduction()) {
        alert('Period lock is only available in Production mode.');
        return;
    }
    
    if (confirm(`Are you sure you want to lock period ${period}? No new postings can be made to this period.`)) {
        accountingEngine.lockPeriod(period);
        updatePeriodControlView();
        setStatus(`Period ${period} has been locked`);
    }
}

function unlockPeriod(period) {
    if (!window.companyContext?.isProduction()) {
        alert('Period unlock is only available in Production mode.');
        return;
    }
    
    if (confirm(`Are you sure you want to unlock period ${period}?`)) {
        accountingEngine.unlockPeriod(period);
        updatePeriodControlView();
        setStatus(`Period ${period} has been unlocked`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT TRAIL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function updateAuditTrailView() {
    const tbody = document.getElementById('auditLogTableBody');
    if (!tbody) return;
    
    const auditLog = accountingEngine.auditLog || [];
    
    if (auditLog.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No audit entries</td></tr>';
        return;
    }
    
    // Sort by timestamp descending
    const sortedLog = [...auditLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    tbody.innerHTML = sortedLog.map(entry => `
        <tr>
            <td>${new Date(entry.timestamp).toLocaleString()}</td>
            <td><span class="audit-action ${entry.action}">${entry.action}</span></td>
            <td>${entry.documentId || '-'}</td>
            <td>${entry.user}</td>
            <td class="audit-details" title="${JSON.stringify(entry.details)}">${JSON.stringify(entry.details)}</td>
        </tr>
    `).join('');
}

function refreshAuditLog() {
    updateAuditTrailView();
    setStatus('Audit log refreshed');
}

function exportAuditLog() {
    const auditLog = accountingEngine.auditLog || [];
    if (auditLog.length === 0) {
        alert('No audit entries to export.');
        return;
    }
    
    const csv = [
        ['Timestamp', 'Action', 'Document', 'User', 'Details'],
        ...auditLog.map(e => [
            e.timestamp,
            e.action,
            e.documentId || '',
            e.user,
            JSON.stringify(e.details)
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    setStatus('Audit log exported');
}

// Update Dashboard
function updateDashboard() {
    const data = accountingEngine.getDashboardData();
    
    document.getElementById('cashBalance').textContent = accountingEngine.formatCurrency(data.cash);
    document.getElementById('bankBalance').textContent = accountingEngine.formatCurrency(data.bank);
    document.getElementById('receivableBalance').textContent = accountingEngine.formatCurrency(data.receivable);
    document.getElementById('payableBalance').textContent = accountingEngine.formatCurrency(data.payable);
}

// Update Quick Actions based on mode
function updateQuickActions() {
    const grid = document.getElementById('quickActionsGrid');
    
    if (currentMode === 'MISA') {
        grid.innerHTML = `
            <div class="action-btn" onclick="openForm('cashReceipt')">
                <span>Receipt</span>
            </div>
            <div class="action-btn" onclick="openForm('cashPayment')">
                <span>Payment</span>
            </div>
            <div class="action-btn" onclick="openForm('stockIn')">
                <span>Stock In</span>
            </div>
            <div class="action-btn" onclick="openForm('stockOut')">
                <span>Stock Out</span>
            </div>
            <div class="action-btn" onclick="openForm('journalEntry')">
                <span>Journal</span>
            </div>
            <div class="action-btn" onclick="generateReport('trialBalance')">
                <span>Trial Bal.</span>
            </div>
        `;
    } else {
        grid.innerHTML = `
            <div class="action-btn" onclick="runTCode('FB50')">
                <span>FB50</span>
            </div>
            <div class="action-btn" onclick="runTCode('FB60')">
                <span>FB60</span>
            </div>
            <div class="action-btn" onclick="runTCode('FB70')">
                <span>FB70</span>
            </div>
            <div class="action-btn" onclick="runTCode('MIGO')">
                <span>MIGO</span>
            </div>
            <div class="action-btn" onclick="runTCode('MIRO')">
                <span>MIRO</span>
            </div>
            <div class="action-btn" onclick="runTCode('AFAB')">
                <span>AFAB</span>
            </div>
        `;
    }
}

// Update Recent Documents
function updateRecentDocuments() {
    const docs = accountingEngine.getRecentDocuments(10);
    const tbody = document.getElementById('recentDocsTable');
    
    if (docs.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No documents yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = docs.map(doc => `
        <tr onclick="viewDocument('${doc.id}')">
            <td><strong>${doc.docNumber}</strong></td>
            <td>${doc.date}</td>
            <td>${getDocTypeName(doc.docType)}</td>
            <td>${doc.description || ''}</td>
            <td class="amount">${accountingEngine.formatCurrency(doc.amount || 0)}</td>
            <td><span class="status posted">Posted</span></td>
        </tr>
    `).join('');
}

function getDocTypeName(type) {
    const names = {
        'PT': 'Cash Receipt',
        'PC': 'Cash Payment',
        'PN': 'Goods Receipt',
        'PX': 'Goods Issue',
        'PKT': 'Journal Entry',
        'SA': 'G/L Document',
        'KR': 'Vendor Invoice',
        'DR': 'Customer Invoice',
        'KZ': 'Vendor Payment',
        'DZ': 'Customer Payment',
        'WE': 'Goods Receipt',
        'RE': 'Invoice Verification',
        'AF': 'Depreciation'
    };
    return names[type] || type;
}

// Update specific tables
function updateCashDocuments() {
    const docs = accountingEngine.documents.filter(d => ['PT', 'PC'].includes(d.docType));
    const tbody = document.getElementById('cashDocsTable');
    
    if (!docs.length) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No documents</td></tr>';
        return;
    }
    
    tbody.innerHTML = docs.map(doc => `
        <tr>
            <td><strong>${doc.docNumber}</strong></td>
            <td>${doc.date}</td>
            <td>${doc.docType === 'PT' ? 'Receipt' : 'Payment'}</td>
            <td>${doc.partnerName || '-'}</td>
            <td>${doc.description || ''}</td>
            <td class="amount">${accountingEngine.formatCurrency(doc.amount)}</td>
            <td><button class="btn btn-secondary" onclick="viewDocument('${doc.id}')">View</button></td>
        </tr>
    `).join('');
}

function updateInventoryDocuments() {
    const docs = accountingEngine.documents.filter(d => ['PN', 'PX', 'WE'].includes(d.docType));
    const tbody = document.getElementById('inventoryDocsTable');
    
    if (!docs.length) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No documents</td></tr>';
        return;
    }
    
    tbody.innerHTML = docs.map(doc => `
        <tr>
            <td><strong>${doc.docNumber}</strong></td>
            <td>${doc.date}</td>
            <td>${doc.docType === 'PN' ? 'In' : (doc.docType === 'PX' ? 'Out' : 'GR')}</td>
            <td>${doc.warehouse || '-'}</td>
            <td>${doc.description || ''}</td>
            <td class="amount">${accountingEngine.formatCurrency(doc.totalAmount || doc.amount || 0)}</td>
            <td><button class="btn btn-secondary" onclick="viewDocument('${doc.id}')">View</button></td>
        </tr>
    `).join('');
}

function updateJournalTable() {
    const entries = accountingEngine.journalEntries.slice(-50);
    const tbody = document.getElementById('journalTable');
    
    if (!entries.length) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No entries</td></tr>';
        return;
    }
    
    let rows = [];
    entries.forEach(je => {
        je.entries.forEach((entry, idx) => {
            rows.push(`
                <tr>
                    ${idx === 0 ? `<td rowspan="${je.entries.length}">${je.date}</td>` : ''}
                    ${idx === 0 ? `<td rowspan="${je.entries.length}"><strong>${je.documentId}</strong></td>` : ''}
                    ${idx === 0 ? `<td rowspan="${je.entries.length}">${je.description}</td>` : ''}
                    <td>${entry.debit > 0 ? entry.account : ''}</td>
                    <td>${entry.credit > 0 ? entry.account : ''}</td>
                    <td class="amount">${accountingEngine.formatCurrency(entry.debit || entry.credit)}</td>
                </tr>
            `);
        });
    });
    
    tbody.innerHTML = rows.join('');
}

function updateChartOfAccounts() {
    const coa = accountingEngine.chartOfAccounts;
    const tbody = document.getElementById('coaTableBody');
    
    const rows = Object.keys(coa).sort().map(acc => {
        const info = coa[acc];
        const balance = accountingEngine.getAccountBalance(acc);
        return `
            <tr>
                <td><strong>${acc}</strong></td>
                <td>${info.name}</td>
                <td>${info.type}</td>
                <td>${info.nature === 'debit' ? 'Debit' : 'Credit'}</td>
                <td class="amount">${balance.debit > 0 ? accountingEngine.formatCurrency(balance.debit) : '-'}</td>
                <td class="amount">${balance.credit > 0 ? accountingEngine.formatCurrency(balance.credit) : '-'}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = rows.join('');
}

function updatePartnersTable() {
    const partners = accountingEngine.partners;
    const tbody = document.getElementById('partnersTableBody');
    
    tbody.innerHTML = partners.map(p => `
        <tr>
            <td><strong>${p.id}</strong></td>
            <td>${p.name}</td>
            <td>${p.type === 'customer' ? 'Customer' : 'Vendor'}</td>
            <td>${p.address || '-'}</td>
            <td>${p.taxId || '-'}</td>
            <td class="amount ${p.balance > 0 ? 'text-danger' : 'text-success'}">${accountingEngine.formatCurrency(Math.abs(p.balance))}</td>
        </tr>
    `).join('');
}

function updateItemsTable() {
    const items = accountingEngine.items;
    const tbody = document.getElementById('itemsTableBody');
    
    tbody.innerHTML = items.map(i => `
        <tr>
            <td><strong>${i.id}</strong></td>
            <td>${i.name}</td>
            <td>${i.unit}</td>
            <td>${i.group}</td>
            <td>${i.account}</td>
            <td class="amount">${i.quantity}</td>
            <td class="amount">${accountingEngine.formatCurrency(i.value)}</td>
        </tr>
    `).join('');
}

// Form handling
function openForm(formType) {
    const modal = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = getFormHTML(formType);
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
}

function getFormHTML(formType) {
    switch(formType) {
        case 'cashReceipt':
            return getCashReceiptForm();
        case 'cashPayment':
            return getCashPaymentForm();
        case 'stockIn':
            return getStockInForm();
        case 'stockOut':
            return getStockOutForm();
        case 'journalEntry':
            return getJournalEntryForm();
        case 'FB50':
            return getSAPGLPostingForm();
        case 'FB60':
            return getSAPVendorInvoiceForm();
        case 'FB70':
            return getSAPCustomerInvoiceForm();
        case 'F-53':
            return getSAPVendorPaymentForm();
        case 'F-28':
            return getSAPCustomerPaymentForm();
        case 'MIGO':
            return getSAPGoodsMovementForm();
        case 'MIRO':
            return getSAPInvoiceVerificationForm();
        case 'AFAB':
            return getSAPDepreciationForm();
        default:
            return '<div class="modal-body"><p>Form not implemented</p></div>';
    }
}

// Status messages
function setStatus(message) {
    document.getElementById('statusMessage').textContent = message;
}

// SAP T-Code handling
function runTCode(tCode) {
    openForm(tCode);
}

function handleTCode(event) {
    if (event.key === 'Enter') {
        executeTCode();
    }
}

function executeTCode() {
    const tCode = document.getElementById('tcodeInput').value.toUpperCase();
    if (tCode) {
        runTCode(tCode);
    }
}

// Report generation
function generateReport(reportType) {
    const view = document.getElementById('reportOutputView');
    const container = document.getElementById('reportContainer');
    const title = document.getElementById('reportTitle');
    
    // Hide all views, show report view
    document.querySelectorAll('.content-view').forEach(v => v.classList.remove('active'));
    view.classList.add('active');
    
    switch(reportType) {
        case 'trialBalance':
            title.textContent = 'Trial Balance';
            container.innerHTML = generateTrialBalanceReport();
            break;
        case 'balanceSheet':
            title.textContent = 'Balance Sheet';
            container.innerHTML = generateBalanceSheetReport();
            break;
        case 'incomeStatement':
            title.textContent = 'Income Statement';
            container.innerHTML = generateIncomeStatementReport();
            break;
        default:
            container.innerHTML = '<p>Report not implemented</p>';
    }
}

function generateTrialBalanceReport() {
    const data = accountingEngine.generateTrialBalance();
    let totalDebit = 0, totalCredit = 0;
    
    const rows = data.map(row => {
        totalDebit += row.closingDebit;
        totalCredit += row.closingCredit;
        return `
            <tr>
                <td><strong>${row.account}</strong></td>
                <td>${row.name}</td>
                <td class="amount-col">${row.periodDebit ? accountingEngine.formatCurrency(row.periodDebit) : '-'}</td>
                <td class="amount-col">${row.periodCredit ? accountingEngine.formatCurrency(row.periodCredit) : '-'}</td>
                <td class="amount-col">${row.closingDebit ? accountingEngine.formatCurrency(row.closingDebit) : '-'}</td>
                <td class="amount-col">${row.closingCredit ? accountingEngine.formatCurrency(row.closingCredit) : '-'}</td>
            </tr>
        `;
    }).join('');
    
    return `
        <div class="report-title-block">
            <div class="company-name">Demo Company Ltd.</div>
            <h2>TRIAL BALANCE</h2>
            <div class="report-period">Period: December 2024</div>
        </div>
        <table class="report-table">
            <thead>
                <tr>
                    <th rowspan="2">Account</th>
                    <th rowspan="2">Account Name</th>
                    <th colspan="2">Period Activity</th>
                    <th colspan="2">Closing Balance</th>
                </tr>
                <tr>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Debit</th>
                    <th>Credit</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
            <tfoot>
                <tr class="grand-total">
                    <td colspan="2"><strong>TOTAL</strong></td>
                    <td class="amount-col" colspan="2"></td>
                    <td class="amount-col"><strong>${accountingEngine.formatCurrency(totalDebit)}</strong></td>
                    <td class="amount-col"><strong>${accountingEngine.formatCurrency(totalCredit)}</strong></td>
                </tr>
            </tfoot>
        </table>
    `;
}

function generateBalanceSheetReport() {
    const getBalance = (acc) => accountingEngine.getAccountBalance(acc).balance;
    
    // Assets
    const cash = getBalance('1111') + getBalance('1112');
    const bank = getBalance('1121') + getBalance('1122');
    const receivables = getBalance('131');
    const inventory = getBalance('152') + getBalance('155') + getBalance('156');
    const fixedAssets = getBalance('211') - getBalance('2141');
    const totalAssets = cash + bank + receivables + inventory + fixedAssets;
    
    // Liabilities & Equity
    const payables = getBalance('331');
    const taxPayable = getBalance('3331');
    const equity = getBalance('4111');
    const retainedEarnings = getBalance('421');
    const totalLiabEquity = payables + taxPayable + equity + retainedEarnings;
    
    return `
        <div class="report-title-block">
            <div class="company-name">Demo Company Ltd.</div>
            <h2>BALANCE SHEET</h2>
            <div class="report-period">As of December 31, 2024</div>
        </div>
        <table class="report-table">
            <thead>
                <tr><th colspan="3">ASSETS</th></tr>
            </thead>
            <tbody>
                <tr class="sub-header"><td colspan="2">A. Current Assets</td><td class="amount-col">${accountingEngine.formatCurrency(cash + bank + receivables + inventory)}</td></tr>
                <tr><td></td><td>I. Cash and Cash Equivalents</td><td class="amount-col">${accountingEngine.formatCurrency(cash + bank)}</td></tr>
                <tr><td></td><td>II. Short-term Receivables</td><td class="amount-col">${accountingEngine.formatCurrency(receivables)}</td></tr>
                <tr><td></td><td>III. Inventories</td><td class="amount-col">${accountingEngine.formatCurrency(inventory)}</td></tr>
                <tr class="sub-header"><td colspan="2">B. Non-current Assets</td><td class="amount-col">${accountingEngine.formatCurrency(fixedAssets)}</td></tr>
                <tr><td></td><td>I. Property, Plant and Equipment</td><td class="amount-col">${accountingEngine.formatCurrency(fixedAssets)}</td></tr>
                <tr class="grand-total"><td colspan="2">TOTAL ASSETS</td><td class="amount-col">${accountingEngine.formatCurrency(totalAssets)}</td></tr>
            </tbody>
        </table>
        <table class="report-table mt-3">
            <thead>
                <tr><th colspan="3">LIABILITIES AND EQUITY</th></tr>
            </thead>
            <tbody>
                <tr class="sub-header"><td colspan="2">A. Liabilities</td><td class="amount-col">${accountingEngine.formatCurrency(payables + taxPayable)}</td></tr>
                <tr><td></td><td>I. Current Liabilities</td><td class="amount-col">${accountingEngine.formatCurrency(payables + taxPayable)}</td></tr>
                <tr class="sub-header"><td colspan="2">B. Shareholders' Equity</td><td class="amount-col">${accountingEngine.formatCurrency(equity + retainedEarnings)}</td></tr>
                <tr><td></td><td>I. Share Capital</td><td class="amount-col">${accountingEngine.formatCurrency(equity)}</td></tr>
                <tr><td></td><td>II. Retained Earnings</td><td class="amount-col">${accountingEngine.formatCurrency(retainedEarnings)}</td></tr>
                <tr class="grand-total"><td colspan="2">TOTAL LIABILITIES AND EQUITY</td><td class="amount-col">${accountingEngine.formatCurrency(totalLiabEquity)}</td></tr>
            </tbody>
        </table>
    `;
}

function generateIncomeStatementReport() {
    const getBalance = (acc) => accountingEngine.getAccountBalance(acc).balance;
    
    const revenue = getBalance('5111') + getBalance('5112') + getBalance('5113');
    const cogs = getBalance('632');
    const grossProfit = revenue - cogs;
    const sellingExp = getBalance('641');
    const adminExp = getBalance('642');
    const operatingProfit = grossProfit - sellingExp - adminExp;
    const financialIncome = getBalance('515');
    const financialExp = getBalance('635');
    const profitBeforeTax = operatingProfit + financialIncome - financialExp;
    const taxExp = getBalance('821');
    const netProfit = profitBeforeTax - taxExp;
    
    return `
        <div class="report-title-block">
            <div class="company-name">Demo Company Ltd.</div>
            <h2>INCOME STATEMENT</h2>
            <div class="report-period">Year 2024</div>
        </div>
        <table class="report-table">
            <thead>
                <tr><th>Item</th><th>Amount</th></tr>
            </thead>
            <tbody>
                <tr><td>1. Revenue from Sales and Services</td><td class="amount-col">${accountingEngine.formatCurrency(revenue)}</td></tr>
                <tr><td>2. Cost of Goods Sold</td><td class="amount-col">${accountingEngine.formatCurrency(cogs)}</td></tr>
                <tr class="total-row"><td>3. Gross Profit (1-2)</td><td class="amount-col">${accountingEngine.formatCurrency(grossProfit)}</td></tr>
                <tr><td>4. Selling Expenses</td><td class="amount-col">${accountingEngine.formatCurrency(sellingExp)}</td></tr>
                <tr><td>5. General & Administrative Expenses</td><td class="amount-col">${accountingEngine.formatCurrency(adminExp)}</td></tr>
                <tr class="total-row"><td>6. Operating Profit</td><td class="amount-col">${accountingEngine.formatCurrency(operatingProfit)}</td></tr>
                <tr><td>7. Financial Income</td><td class="amount-col">${accountingEngine.formatCurrency(financialIncome)}</td></tr>
                <tr><td>8. Financial Expenses</td><td class="amount-col">${accountingEngine.formatCurrency(financialExp)}</td></tr>
                <tr class="total-row"><td>9. Profit Before Tax</td><td class="amount-col">${accountingEngine.formatCurrency(profitBeforeTax)}</td></tr>
                <tr><td>10. Income Tax Expense</td><td class="amount-col">${accountingEngine.formatCurrency(taxExp)}</td></tr>
                <tr class="grand-total"><td>11. NET PROFIT</td><td class="amount-col">${accountingEngine.formatCurrency(netProfit)}</td></tr>
            </tbody>
        </table>
    `;
}

// Result modal
function showResult(result) {
    const modal = document.getElementById('resultModal');
    const content = document.getElementById('resultContent');
    const title = document.getElementById('resultTitle');
    
    if (result.success) {
        title.textContent = 'Document Posted Successfully';
        
        let html = '';
        
        // Document info
        if (result.document) {
            html += `
                <div class="document-display">
                    <div class="document-header">
                        <h4>${currentMode === 'SAP' ? 'ACCOUNTING DOCUMENT' : getDocTypeName(result.document.docType)}</h4>
                        <div class="doc-number">No: ${result.document.docNumber}</div>
                    </div>
                    <div class="document-body">
                        <div class="document-info">
                            <div class="info-row"><span class="info-label">Date:</span><span class="info-value">${result.document.date}</span></div>
                            ${result.document.partnerName ? `<div class="info-row"><span class="info-label">Partner:</span><span class="info-value">${result.document.partnerName}</span></div>` : ''}
                            <div class="info-row"><span class="info-label">Description:</span><span class="info-value">${result.document.description || '-'}</span></div>
                            <div class="info-row"><span class="info-label">Amount:</span><span class="info-value"><strong>${accountingEngine.formatCurrency(result.document.amount || result.document.totalAmount || 0)}</strong></span></div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Journal entries
        if (result.entries && result.entries.length > 0) {
            let totalDebit = 0, totalCredit = 0;
            
            html += `
                <div class="journal-display">
                    <h4>Journal Entry</h4>
                    <table class="journal-entry-table">
                        <thead>
                            <tr>
                                <th>Account</th>
                                <th>Description</th>
                                <th>Debit</th>
                                <th>Credit</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            result.entries.forEach(entry => {
                totalDebit += entry.debit || 0;
                totalCredit += entry.credit || 0;
                html += `
                    <tr>
                        <td class="account-code">${entry.account}</td>
                        <td>${entry.name}</td>
                        <td class="amount-debit">${entry.debit > 0 ? accountingEngine.formatCurrency(entry.debit) : ''}</td>
                        <td class="amount-credit">${entry.credit > 0 ? accountingEngine.formatCurrency(entry.credit) : ''}</td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2"><strong>TOTAL</strong></td>
                                <td class="amount-debit"><strong>${accountingEngine.formatCurrency(totalDebit)}</strong></td>
                                <td class="amount-credit"><strong>${accountingEngine.formatCurrency(totalCredit)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;
        }
        
        // Explanation
        if (result.explanation) {
            html += `
                <div class="explanation-box">
                    <h5>Explanation</h5>
                    <p>${result.explanation.replace(/\n/g, '<br>')}</p>
                </div>
            `;
        }
        
        // Impact
        if (result.impact && result.impact.length > 0) {
            html += `
                <div class="impact-box">
                    <h5>Impact</h5>
                    <ul class="impact-list">
                        ${result.impact.map(i => `<li>${i.text}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // SAP Output
        if (result.sapOutput) {
            html += `
                <div style="margin-top: 20px; background: #1d2939; color: #fff; padding: 15px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px; white-space: pre; overflow-x: auto;">
${result.sapOutput}
                </div>
            `;
        }
        
        content.innerHTML = html;
    } else {
        title.textContent = 'Error';
        content.innerHTML = `
            <div class="validation-error">
                <strong>Cannot process transaction:</strong>
                <ul style="margin: 10px 0 0 20px;">
                    ${result.errors.map(e => `<li>${e}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
    
    // Refresh data
    if (result.success) {
        updateDashboard();
        updateRecentDocuments();
    }
}

function closeResultModal() {
    document.getElementById('resultModal').classList.add('hidden');
}

// View document details
function viewDocument(docId) {
    const doc = accountingEngine.documents.find(d => d.id === docId);
    if (!doc) return;
    
    const je = accountingEngine.journalEntries.find(j => j.id === doc.journalEntryId);
    
    showResult({
        success: true,
        document: doc,
        entries: je?.entries || [],
        explanation: 'Viewing posted document details.'
    });
}

// Console toggle
function toggleConsole() {
    document.getElementById('consolePanel').classList.toggle('hidden');
}

// Print and export
function printReport() {
    window.print();
}

function exportExcel() {
    alert('Export to Excel feature is under development');
}

// Show report
function showReport(reportType) {
    generateReport(reportType);
}
