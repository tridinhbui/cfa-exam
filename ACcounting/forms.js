/**
 * ==============================================
 * FORM TEMPLATES - Input Forms for Transactions
 * ==============================================
 */

// ==========================================
// MISA FORMS
// ==========================================

function getCashReceiptForm() {
    const partners = accountingEngine.partners.filter(p => p.type === 'customer');
    const partnerOptions = partners.map(p => `<option value="${p.id}">${p.id} - ${p.name}</option>`).join('');
    
    return `
        <div class="modal-header">
            <h3>Cash Receipt</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
            <form id="cashReceiptForm" onsubmit="submitCashReceipt(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Document Date <span class="required">*</span></label>
                        <input type="date" class="form-control" name="date" value="${accountingEngine.getCurrentDate()}" required>
                    </div>
                    <div class="form-group">
                        <label>Receipt Type <span class="required">*</span></label>
                        <select class="form-control" name="receiptType" required onchange="togglePartnerField(this)">
                            <option value="">-- Select type --</option>
                            <option value="CUSTOMER">Customer Payment</option>
                            <option value="SALES">Sales Receipt</option>
                            <option value="BANK_WITHDRAW">Bank Withdrawal</option>
                            <option value="OTHER">Other Receipt</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group" id="partnerGroup">
                    <label>Customer</label>
                    <select class="form-control" name="partnerId" onchange="updatePartnerName(this)">
                        <option value="">-- Select customer --</option>
                        ${partnerOptions}
                    </select>
                    <input type="hidden" name="partnerName">
                </div>
                
                <div class="form-group">
                    <label>Description <span class="required">*</span></label>
                    <input type="text" class="form-control" name="description" placeholder="Receipt description" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Amount <span class="required">*</span></label>
                        <input type="number" class="form-control mono" name="amount" placeholder="0" min="1" required>
                    </div>
                    <div class="form-group" id="vatRateGroup" style="display:none">
                        <label>VAT Rate</label>
                        <select class="form-control" name="vatRate">
                            <option value="0.1">10%</option>
                            <option value="0.08">8%</option>
                            <option value="0.05">5%</option>
                            <option value="0">0%</option>
                        </select>
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="document.getElementById('cashReceiptForm').requestSubmit()">Post</button>
        </div>
    `;
}

function submitCashReceipt(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const data = {
        date: formData.get('date'),
        receiptType: formData.get('receiptType'),
        partnerId: formData.get('partnerId'),
        partnerName: formData.get('partnerName'),
        description: formData.get('description'),
        amount: parseFloat(formData.get('amount')),
        vatRate: parseFloat(formData.get('vatRate') || 0.1)
    };
    
    const result = MISAModule.createCashReceipt(data);
    closeModal();
    showResult(result);
}

function getCashPaymentForm() {
    const vendors = accountingEngine.partners.filter(p => p.type === 'vendor');
    const vendorOptions = vendors.map(p => `<option value="${p.id}">${p.id} - ${p.name}</option>`).join('');
    
    const expenseAccounts = [
        { code: '6421', name: 'Admin Staff Expense' },
        { code: '6422', name: 'Admin Material Expense' },
        { code: '6427', name: 'Outside Services' },
        { code: '6428', name: 'Other Cash Expenses' },
        { code: '6417', name: 'Sales Services' },
        { code: '6418', name: 'Other Sales Expenses' },
    ];
    const expenseOptions = expenseAccounts.map(a => `<option value="${a.code}">${a.code} - ${a.name}</option>`).join('');
    
    return `
        <div class="modal-header">
            <h3>Cash Payment</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
            <form id="cashPaymentForm" onsubmit="submitCashPayment(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Document Date <span class="required">*</span></label>
                        <input type="date" class="form-control" name="date" value="${accountingEngine.getCurrentDate()}" required>
                    </div>
                    <div class="form-group">
                        <label>Payment Type <span class="required">*</span></label>
                        <select class="form-control" name="paymentType" required onchange="togglePaymentFields(this)">
                            <option value="">-- Select type --</option>
                            <option value="VENDOR">Vendor Payment</option>
                            <option value="EXPENSE">Operating Expense</option>
                            <option value="SALARY">Salary Payment</option>
                            <option value="ADVANCE">Cash Advance</option>
                            <option value="BANK_DEPOSIT">Bank Deposit</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group" id="vendorGroup" style="display:none">
                    <label>Vendor</label>
                    <select class="form-control" name="partnerId" onchange="updatePartnerName(this)">
                        <option value="">-- Select vendor --</option>
                        ${vendorOptions}
                    </select>
                    <input type="hidden" name="partnerName">
                </div>
                
                <div class="form-group" id="expenseGroup" style="display:none">
                    <label>Expense Account</label>
                    <select class="form-control" name="expenseAccount" onchange="updateExpenseAccountName(this)">
                        ${expenseOptions}
                    </select>
                    <input type="hidden" name="expenseAccountName">
                </div>
                
                <div class="form-group">
                    <label>Description <span class="required">*</span></label>
                    <input type="text" class="form-control" name="description" placeholder="Payment description" required>
                </div>
                
                <div class="form-group">
                    <label>Amount <span class="required">*</span></label>
                    <input type="number" class="form-control mono" name="amount" placeholder="0" min="1" required>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="document.getElementById('cashPaymentForm').requestSubmit()">Post</button>
        </div>
    `;
}

function submitCashPayment(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const data = {
        date: formData.get('date'),
        paymentType: formData.get('paymentType'),
        partnerId: formData.get('partnerId'),
        partnerName: formData.get('partnerName'),
        expenseAccount: formData.get('expenseAccount'),
        expenseAccountName: formData.get('expenseAccountName'),
        description: formData.get('description'),
        amount: parseFloat(formData.get('amount'))
    };
    
    const result = MISAModule.createCashPayment(data);
    closeModal();
    showResult(result);
}

function getStockInForm() {
    const vendors = accountingEngine.partners.filter(p => p.type === 'vendor');
    const vendorOptions = vendors.map(p => `<option value="${p.id}">${p.id} - ${p.name}</option>`).join('');
    const items = accountingEngine.items;
    const itemOptions = items.map(i => `<option value="${i.id}" data-account="${i.account}">${i.id} - ${i.name} (${i.unit})</option>`).join('');
    
    return `
        <div class="modal-header">
            <h3>Goods Receipt</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
            <form id="stockInForm" onsubmit="submitStockIn(event)">
                <div class="form-row-3">
                    <div class="form-group">
                        <label>Document Date <span class="required">*</span></label>
                        <input type="date" class="form-control" name="date" value="${accountingEngine.getCurrentDate()}" required>
                    </div>
                    <div class="form-group">
                        <label>Receipt Type <span class="required">*</span></label>
                        <select class="form-control" name="stockInType" required onchange="toggleStockInFields(this)">
                            <option value="PURCHASE">Purchase Receipt</option>
                            <option value="PRODUCTION">Production Output</option>
                            <option value="RETURN">Sales Return</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Warehouse <span class="required">*</span></label>
                        <select class="form-control" name="warehouse" required>
                            <option value="WH01">WH01 - Main Warehouse</option>
                            <option value="WH02">WH02 - Secondary Warehouse</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group" id="vendorStockGroup">
                    <label>Vendor <span class="required">*</span></label>
                    <select class="form-control" name="partnerId" onchange="updatePartnerName(this)">
                        <option value="">-- Select vendor --</option>
                        ${vendorOptions}
                    </select>
                    <input type="hidden" name="partnerName">
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" class="form-control" name="description" placeholder="Goods receipt description">
                </div>
                
                <div class="item-entry-section">
                    <h4>Item Details</h4>
                    <table class="item-entry-table">
                        <thead>
                            <tr>
                                <th style="width:40px">#</th>
                                <th>Material / Product</th>
                                <th style="width:100px">Quantity</th>
                                <th style="width:150px">Unit Price</th>
                                <th style="width:80px">VAT %</th>
                                <th style="width:150px">Amount</th>
                            </tr>
                        </thead>
                        <tbody id="stockInItems">
                            <tr>
                                <td class="row-number">1</td>
                                <td><select class="form-control" name="items[0].itemId" onchange="updateItemAccount(this, 0)">
                                    <option value="">-- Select --</option>
                                    ${itemOptions}
                                </select></td>
                                <td><input type="number" name="items[0].quantity" min="1" onchange="calculateStockInLine(0)"></td>
                                <td class="amount-cell"><input type="number" name="items[0].unitPrice" min="0" onchange="calculateStockInLine(0)"></td>
                                <td><select name="items[0].vatRate" onchange="calculateStockInLine(0)">
                                    <option value="0.1">10%</option>
                                    <option value="0.08">8%</option>
                                    <option value="0">0%</option>
                                </select></td>
                                <td class="amount-cell"><input type="text" name="items[0].amount" readonly></td>
                            </tr>
                        </tbody>
                    </table>
                    <button type="button" class="btn btn-secondary mt-2" onclick="addStockInLine()">+ Add Line</button>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="document.getElementById('stockInForm').requestSubmit()">Post</button>
        </div>
    `;
}

let stockInLineCount = 1;

function addStockInLine() {
    const items = accountingEngine.items;
    const itemOptions = items.map(i => `<option value="${i.id}" data-account="${i.account}">${i.id} - ${i.name} (${i.unit})</option>`).join('');
    
    const tbody = document.getElementById('stockInItems');
    const row = document.createElement('tr');
    const idx = stockInLineCount++;
    
    row.innerHTML = `
        <td class="row-number">${idx + 1}</td>
        <td><select class="form-control" name="items[${idx}].itemId" onchange="updateItemAccount(this, ${idx})">
            <option value="">-- Select --</option>
            ${itemOptions}
        </select></td>
        <td><input type="number" name="items[${idx}].quantity" min="1" onchange="calculateStockInLine(${idx})"></td>
        <td class="amount-cell"><input type="number" name="items[${idx}].unitPrice" min="0" onchange="calculateStockInLine(${idx})"></td>
        <td><select name="items[${idx}].vatRate" onchange="calculateStockInLine(${idx})">
            <option value="0.1">10%</option>
            <option value="0.08">8%</option>
            <option value="0">0%</option>
        </select></td>
        <td class="amount-cell"><input type="text" name="items[${idx}].amount" readonly></td>
    `;
    tbody.appendChild(row);
}

function calculateStockInLine(idx) {
    const form = document.getElementById('stockInForm');
    const qty = parseFloat(form.querySelector(`[name="items[${idx}].quantity"]`)?.value) || 0;
    const price = parseFloat(form.querySelector(`[name="items[${idx}].unitPrice"]`)?.value) || 0;
    const vatRate = parseFloat(form.querySelector(`[name="items[${idx}].vatRate"]`)?.value) || 0;
    const amount = qty * price * (1 + vatRate);
    
    const amountField = form.querySelector(`[name="items[${idx}].amount"]`);
    if (amountField) {
        amountField.value = accountingEngine.formatCurrency(amount);
    }
}

function submitStockIn(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Collect items
    const items = [];
    let idx = 0;
    while (formData.get(`items[${idx}].itemId`)) {
        const itemId = formData.get(`items[${idx}].itemId`);
        if (itemId) {
            const item = accountingEngine.getItem(itemId);
            items.push({
                itemId,
                itemName: item?.name || '',
                quantity: parseFloat(formData.get(`items[${idx}].quantity`)) || 0,
                unitPrice: parseFloat(formData.get(`items[${idx}].unitPrice`)) || 0,
                vatRate: parseFloat(formData.get(`items[${idx}].vatRate`)) || 0.1,
                inventoryAccount: item?.account || '152'
            });
        }
        idx++;
    }
    
    const data = {
        date: formData.get('date'),
        stockInType: formData.get('stockInType'),
        warehouse: formData.get('warehouse'),
        partnerId: formData.get('partnerId'),
        partnerName: formData.get('partnerName'),
        description: formData.get('description'),
        items
    };
    
    const result = MISAModule.createStockIn(data);
    closeModal();
    showResult(result);
    stockInLineCount = 1;
}

function getStockOutForm() {
    const items = accountingEngine.items;
    const itemOptions = items.map(i => `<option value="${i.id}">${i.id} - ${i.name} (${i.unit})</option>`).join('');
    
    return `
        <div class="modal-header">
            <h3>Goods Issue</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
            <form id="stockOutForm" onsubmit="submitStockOut(event)">
                <div class="form-row-3">
                    <div class="form-group">
                        <label>Document Date <span class="required">*</span></label>
                        <input type="date" class="form-control" name="date" value="${accountingEngine.getCurrentDate()}" required>
                    </div>
                    <div class="form-group">
                        <label>Issue Type <span class="required">*</span></label>
                        <select class="form-control" name="stockOutType" required>
                            <option value="SALES">Sales Issue</option>
                            <option value="PRODUCTION">Production Issue</option>
                            <option value="INTERNAL">Internal Transfer</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Warehouse <span class="required">*</span></label>
                        <select class="form-control" name="warehouse" required>
                            <option value="WH01">WH01 - Main Warehouse</option>
                            <option value="WH02">WH02 - Secondary Warehouse</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" class="form-control" name="description" placeholder="Goods issue description">
                </div>
                
                <div class="item-entry-section">
                    <h4>Item Details</h4>
                    <table class="item-entry-table">
                        <thead>
                            <tr>
                                <th style="width:40px">#</th>
                                <th>Material / Product</th>
                                <th style="width:100px">Quantity</th>
                            </tr>
                        </thead>
                        <tbody id="stockOutItems">
                            <tr>
                                <td class="row-number">1</td>
                                <td><select class="form-control" name="items[0].itemId">
                                    <option value="">-- Select --</option>
                                    ${itemOptions}
                                </select></td>
                                <td><input type="number" name="items[0].quantity" min="1"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="document.getElementById('stockOutForm').requestSubmit()">Post</button>
        </div>
    `;
}

function submitStockOut(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const items = [];
    let idx = 0;
    while (formData.get(`items[${idx}].itemId`) !== null) {
        const itemId = formData.get(`items[${idx}].itemId`);
        if (itemId) {
            items.push({
                itemId,
                quantity: parseFloat(formData.get(`items[${idx}].quantity`)) || 0
            });
        }
        idx++;
        if (idx > 100) break;
    }
    
    const data = {
        date: formData.get('date'),
        stockOutType: formData.get('stockOutType'),
        warehouse: formData.get('warehouse'),
        description: formData.get('description'),
        items
    };
    
    const result = MISAModule.createStockOut(data);
    closeModal();
    showResult(result);
}

function getJournalEntryForm() {
    const accounts = Object.keys(accountingEngine.chartOfAccounts).sort();
    const accountOptions = accounts.map(acc => {
        const info = accountingEngine.chartOfAccounts[acc];
        return `<option value="${acc}">${acc} - ${info.name}</option>`;
    }).join('');
    
    return `
        <div class="modal-header">
            <h3>Journal Entry</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
            <form id="journalEntryForm" onsubmit="submitJournalEntry(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Document Date <span class="required">*</span></label>
                        <input type="date" class="form-control" name="date" value="${accountingEngine.getCurrentDate()}" required>
                    </div>
                    <div class="form-group">
                        <label>Description <span class="required">*</span></label>
                        <input type="text" class="form-control" name="description" placeholder="Transaction description" required>
                    </div>
                </div>
                
                <div class="item-entry-section">
                    <h4>Entry Details</h4>
                    <table class="item-entry-table">
                        <thead>
                            <tr>
                                <th>Debit Account</th>
                                <th>Credit Account</th>
                                <th style="width:200px">Amount</th>
                            </tr>
                        </thead>
                        <tbody id="journalEntryItems">
                            <tr>
                                <td><select class="form-control" name="entries[0].debitAccount">
                                    <option value="">-- Select --</option>
                                    ${accountOptions}
                                </select></td>
                                <td><select class="form-control" name="entries[0].creditAccount">
                                    <option value="">-- Select --</option>
                                    ${accountOptions}
                                </select></td>
                                <td class="amount-cell"><input type="number" name="entries[0].amount" min="0"></td>
                            </tr>
                        </tbody>
                    </table>
                    <button type="button" class="btn btn-secondary mt-2" onclick="addJournalEntryLine()">+ Add Line</button>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="document.getElementById('journalEntryForm').requestSubmit()">Post</button>
        </div>
    `;
}

let journalEntryLineCount = 1;

function addJournalEntryLine() {
    const accounts = Object.keys(accountingEngine.chartOfAccounts).sort();
    const accountOptions = accounts.map(acc => {
        const info = accountingEngine.chartOfAccounts[acc];
        return `<option value="${acc}">${acc} - ${info.name}</option>`;
    }).join('');
    
    const tbody = document.getElementById('journalEntryItems');
    const row = document.createElement('tr');
    const idx = journalEntryLineCount++;
    
    row.innerHTML = `
        <td><select class="form-control" name="entries[${idx}].debitAccount">
            <option value="">-- Select --</option>
            ${accountOptions}
        </select></td>
        <td><select class="form-control" name="entries[${idx}].creditAccount">
            <option value="">-- Select --</option>
            ${accountOptions}
        </select></td>
        <td class="amount-cell"><input type="number" name="entries[${idx}].amount" min="0"></td>
    `;
    tbody.appendChild(row);
}

function submitJournalEntry(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const entries = [];
    let idx = 0;
    while (true) {
        const debitAcc = formData.get(`entries[${idx}].debitAccount`);
        const creditAcc = formData.get(`entries[${idx}].creditAccount`);
        const amount = parseFloat(formData.get(`entries[${idx}].amount`)) || 0;
        
        if (!debitAcc && !creditAcc) break;
        
        if (debitAcc && amount > 0) {
            entries.push({
                account: debitAcc,
                name: accountingEngine.chartOfAccounts[debitAcc]?.name || '',
                debit: amount,
                credit: 0
            });
        }
        if (creditAcc && amount > 0) {
            entries.push({
                account: creditAcc,
                name: accountingEngine.chartOfAccounts[creditAcc]?.name || '',
                debit: 0,
                credit: amount
            });
        }
        idx++;
        if (idx > 100) break;
    }
    
    const data = {
        date: formData.get('date'),
        description: formData.get('description'),
        entries
    };
    
    const result = MISAModule.createJournalEntry(data);
    closeModal();
    showResult(result);
    journalEntryLineCount = 1;
}

// Helper functions
function togglePartnerField(select) {
    const type = select.value;
    const partnerGroup = document.getElementById('partnerGroup');
    const vatGroup = document.getElementById('vatRateGroup');
    
    if (partnerGroup) {
        partnerGroup.style.display = ['CUSTOMER'].includes(type) ? 'block' : 'none';
    }
    if (vatGroup) {
        vatGroup.style.display = type === 'SALES' ? 'block' : 'none';
    }
}

function togglePaymentFields(select) {
    const type = select.value;
    const vendorGroup = document.getElementById('vendorGroup');
    const expenseGroup = document.getElementById('expenseGroup');
    
    if (vendorGroup) {
        vendorGroup.style.display = type === 'VENDOR' ? 'block' : 'none';
    }
    if (expenseGroup) {
        expenseGroup.style.display = type === 'EXPENSE' ? 'block' : 'none';
    }
}

function toggleStockInFields(select) {
    const type = select.value;
    const vendorGroup = document.getElementById('vendorStockGroup');
    
    if (vendorGroup) {
        vendorGroup.style.display = type === 'PURCHASE' ? 'block' : 'none';
    }
}

function updatePartnerName(select) {
    const partner = accountingEngine.getPartner(select.value);
    const nameField = select.form.querySelector('[name="partnerName"]');
    if (nameField && partner) {
        nameField.value = partner.name;
    }
}

function updateExpenseAccountName(select) {
    const acc = select.value;
    const info = accountingEngine.chartOfAccounts[acc];
    const nameField = select.form.querySelector('[name="expenseAccountName"]');
    if (nameField && info) {
        nameField.value = info.name;
    }
}

function updateItemAccount(select, idx) {
    const option = select.options[select.selectedIndex];
    // Store account for later use if needed
}
