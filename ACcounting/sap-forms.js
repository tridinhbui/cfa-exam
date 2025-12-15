/**
 * ==============================================
 * SAP FORM TEMPLATES - T-Code Transaction Forms
 * ==============================================
 */

// ==========================================
// SAP FORMS
// ==========================================

function getSAPGLPostingForm() {
    const accounts = Object.keys(SAPGLAccounts).sort();
    const accountOptions = accounts.map(acc => {
        const info = SAPGLAccounts[acc];
        return `<option value="${acc}">${acc} - ${info.name}</option>`;
    }).join('');
    
    return `
        <div class="modal-header" style="background: var(--sap-secondary)">
            <h3>FB50 - G/L Account Document</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body sap-form">
            <div class="sap-form-header">
                <span class="tcode-display">FB50</span>
                Enter G/L Account Document
            </div>
            
            <form id="sapGLForm" onsubmit="submitSAPGLPosting(event)">
                <div class="sap-field-group">
                    <label>Company Code</label>
                    <input type="text" name="companyCode" value="1000" readonly>
                </div>
                <div class="sap-field-group">
                    <label>Document Date</label>
                    <input type="date" name="documentDate" value="${accountingEngine.getCurrentDate()}" required>
                </div>
                <div class="sap-field-group">
                    <label>Posting Date</label>
                    <input type="date" name="postingDate" value="${accountingEngine.getCurrentDate()}" required>
                </div>
                <div class="sap-field-group">
                    <label>Reference</label>
                    <input type="text" name="reference" placeholder="Reference number">
                </div>
                <div class="sap-field-group">
                    <label>Header Text</label>
                    <input type="text" name="headerText" placeholder="Document header text">
                </div>
                
                <div class="item-entry-section">
                    <h4>Line Items</h4>
                    <table class="item-entry-table">
                        <thead>
                            <tr>
                                <th>PK</th>
                                <th>G/L Account</th>
                                <th>Amount</th>
                                <th>Cost Center</th>
                                <th>Text</th>
                            </tr>
                        </thead>
                        <tbody id="sapGLItems">
                            <tr>
                                <td><select name="items[0].postingKey">
                                    <option value="40">40 - Debit</option>
                                    <option value="50">50 - Credit</option>
                                </select></td>
                                <td><select name="items[0].glAccount" required>
                                    <option value="">Select...</option>
                                    ${accountOptions}
                                </select></td>
                                <td class="amount-cell"><input type="number" name="items[0].amount" min="0" required></td>
                                <td><input type="text" name="items[0].costCenter" placeholder="Cost Ctr"></td>
                                <td><input type="text" name="items[0].text" placeholder="Line text"></td>
                            </tr>
                            <tr>
                                <td><select name="items[1].postingKey">
                                    <option value="40">40 - Debit</option>
                                    <option value="50" selected>50 - Credit</option>
                                </select></td>
                                <td><select name="items[1].glAccount" required>
                                    <option value="">Select...</option>
                                    ${accountOptions}
                                </select></td>
                                <td class="amount-cell"><input type="number" name="items[1].amount" min="0" required></td>
                                <td><input type="text" name="items[1].costCenter" placeholder="Cost Ctr"></td>
                                <td><input type="text" name="items[1].text" placeholder="Line text"></td>
                            </tr>
                        </tbody>
                    </table>
                    <button type="button" class="btn btn-secondary mt-2" onclick="addSAPGLLine()">+ Add Line</button>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-sap" onclick="document.getElementById('sapGLForm').requestSubmit()">
                Post Document
            </button>
        </div>
    `;
}

let sapGLLineCount = 2;

function addSAPGLLine() {
    const accounts = Object.keys(SAPGLAccounts).sort();
    const accountOptions = accounts.map(acc => {
        const info = SAPGLAccounts[acc];
        return `<option value="${acc}">${acc} - ${info.name}</option>`;
    }).join('');
    
    const tbody = document.getElementById('sapGLItems');
    const row = document.createElement('tr');
    const idx = sapGLLineCount++;
    
    row.innerHTML = `
        <td><select name="items[${idx}].postingKey">
            <option value="40">40 - Debit</option>
            <option value="50">50 - Credit</option>
        </select></td>
        <td><select name="items[${idx}].glAccount">
            <option value="">Select...</option>
            ${accountOptions}
        </select></td>
        <td class="amount-cell"><input type="number" name="items[${idx}].amount" min="0"></td>
        <td><input type="text" name="items[${idx}].costCenter" placeholder="Cost Ctr"></td>
        <td><input type="text" name="items[${idx}].text" placeholder="Line text"></td>
    `;
    tbody.appendChild(row);
}

function submitSAPGLPosting(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const items = [];
    let idx = 0;
    while (true) {
        const glAccount = formData.get(`items[${idx}].glAccount`);
        if (glAccount === null) break;
        
        if (glAccount) {
            items.push({
                postingKey: formData.get(`items[${idx}].postingKey`),
                glAccount,
                amount: parseFloat(formData.get(`items[${idx}].amount`)) || 0,
                costCenter: formData.get(`items[${idx}].costCenter`),
                text: formData.get(`items[${idx}].text`)
            });
        }
        idx++;
        if (idx > 100) break;
    }
    
    const data = {
        companyCode: formData.get('companyCode'),
        documentDate: formData.get('documentDate'),
        postingDate: formData.get('postingDate'),
        reference: formData.get('reference'),
        headerText: formData.get('headerText'),
        items
    };
    
    const result = SAPModule.postGLDocument(data);
    closeModal();
    showResult(result);
    sapGLLineCount = 2;
}

function getSAPVendorInvoiceForm() {
    const vendors = accountingEngine.partners.filter(p => p.type === 'vendor');
    const vendorOptions = vendors.map(v => `<option value="${v.id}">${v.id} - ${v.name}</option>`).join('');
    
    const expenseAccounts = Object.entries(SAPGLAccounts)
        .filter(([_, info]) => info.type === 'expense')
        .map(([acc, info]) => `<option value="${acc}">${acc} - ${info.name}</option>`)
        .join('');
    
    return `
        <div class="modal-header" style="background: var(--sap-secondary)">
            <h3>FB60 - Enter Vendor Invoice</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body sap-form">
            <div class="sap-form-header">
                <span class="tcode-display">FB60</span>
                Enter Incoming Invoice
            </div>
            
            <form id="sapVendorInvoiceForm" onsubmit="submitSAPVendorInvoice(event)">
                <div class="sap-field-group">
                    <label>Company Code</label>
                    <input type="text" name="companyCode" value="1000" readonly>
                </div>
                <div class="sap-field-group">
                    <label>Vendor *</label>
                    <select name="vendorId" required onchange="updateVendorName(this)">
                        <option value="">Select Vendor...</option>
                        ${vendorOptions}
                    </select>
                    <input type="hidden" name="vendorName">
                </div>
                <div class="sap-field-group">
                    <label>Invoice Date *</label>
                    <input type="date" name="invoiceDate" value="${accountingEngine.getCurrentDate()}" required>
                </div>
                <div class="sap-field-group">
                    <label>Posting Date</label>
                    <input type="date" name="postingDate" value="${accountingEngine.getCurrentDate()}">
                </div>
                <div class="sap-field-group">
                    <label>Invoice Reference</label>
                    <input type="text" name="invoiceRef" placeholder="Vendor invoice number">
                </div>
                <div class="sap-field-group">
                    <label>Amount (excl. Tax) *</label>
                    <input type="number" name="amount" min="0" required placeholder="Base amount">
                </div>
                <div class="sap-field-group">
                    <label>Tax Rate</label>
                    <select name="taxRate">
                        <option value="0.1">10% VAT</option>
                        <option value="0.08">8% VAT</option>
                        <option value="0.05">5% VAT</option>
                        <option value="0">0% (No Tax)</option>
                    </select>
                </div>
                <div class="sap-field-group">
                    <label>Expense Account</label>
                    <select name="expenseAccount">
                        ${expenseAccounts}
                    </select>
                </div>
                <div class="sap-field-group">
                    <label>Cost Center</label>
                    <input type="text" name="costCenter" placeholder="Cost Center">
                </div>
                <div class="sap-field-group">
                    <label>Header Text</label>
                    <input type="text" name="headerText" placeholder="Document text">
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-sap" onclick="document.getElementById('sapVendorInvoiceForm').requestSubmit()">
                Post Invoice
            </button>
        </div>
    `;
}

function submitSAPVendorInvoice(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const data = {
        companyCode: formData.get('companyCode'),
        vendorId: formData.get('vendorId'),
        vendorName: formData.get('vendorName'),
        invoiceDate: formData.get('invoiceDate'),
        postingDate: formData.get('postingDate'),
        invoiceRef: formData.get('invoiceRef'),
        amount: parseFloat(formData.get('amount')) || 0,
        taxRate: parseFloat(formData.get('taxRate')) || 0.1,
        expenseAccount: formData.get('expenseAccount'),
        costCenter: formData.get('costCenter'),
        headerText: formData.get('headerText')
    };
    
    const result = SAPModule.enterVendorInvoice(data);
    closeModal();
    showResult(result);
}

function getSAPCustomerInvoiceForm() {
    const customers = accountingEngine.partners.filter(p => p.type === 'customer');
    const customerOptions = customers.map(c => `<option value="${c.id}">${c.id} - ${c.name}</option>`).join('');
    
    return `
        <div class="modal-header" style="background: var(--sap-secondary)">
            <h3>FB70 - Enter Customer Invoice</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body sap-form">
            <div class="sap-form-header">
                <span class="tcode-display">FB70</span>
                Enter Outgoing Invoice
            </div>
            
            <form id="sapCustomerInvoiceForm" onsubmit="submitSAPCustomerInvoice(event)">
                <div class="sap-field-group">
                    <label>Company Code</label>
                    <input type="text" name="companyCode" value="1000" readonly>
                </div>
                <div class="sap-field-group">
                    <label>Customer *</label>
                    <select name="customerId" required onchange="updateCustomerName(this)">
                        <option value="">Select Customer...</option>
                        ${customerOptions}
                    </select>
                    <input type="hidden" name="customerName">
                </div>
                <div class="sap-field-group">
                    <label>Invoice Date *</label>
                    <input type="date" name="invoiceDate" value="${accountingEngine.getCurrentDate()}" required>
                </div>
                <div class="sap-field-group">
                    <label>Posting Date</label>
                    <input type="date" name="postingDate" value="${accountingEngine.getCurrentDate()}">
                </div>
                <div class="sap-field-group">
                    <label>Amount (excl. Tax) *</label>
                    <input type="number" name="amount" min="0" required placeholder="Net amount">
                </div>
                <div class="sap-field-group">
                    <label>Tax Rate</label>
                    <select name="taxRate">
                        <option value="0.1">10% VAT</option>
                        <option value="0.08">8% VAT</option>
                        <option value="0.05">5% VAT</option>
                        <option value="0">0% (No Tax)</option>
                    </select>
                </div>
                <div class="sap-field-group">
                    <label>Header Text</label>
                    <input type="text" name="headerText" placeholder="Document text">
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-sap" onclick="document.getElementById('sapCustomerInvoiceForm').requestSubmit()">
                Post Invoice
            </button>
        </div>
    `;
}

function submitSAPCustomerInvoice(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const data = {
        companyCode: formData.get('companyCode'),
        customerId: formData.get('customerId'),
        customerName: formData.get('customerName'),
        invoiceDate: formData.get('invoiceDate'),
        postingDate: formData.get('postingDate'),
        amount: parseFloat(formData.get('amount')) || 0,
        taxRate: parseFloat(formData.get('taxRate')) || 0.1,
        headerText: formData.get('headerText')
    };
    
    const result = SAPModule.enterCustomerInvoice(data);
    closeModal();
    showResult(result);
}

function getSAPVendorPaymentForm() {
    const vendors = accountingEngine.partners.filter(p => p.type === 'vendor');
    const vendorOptions = vendors.map(v => `<option value="${v.id}">${v.id} - ${v.name} (${accountingEngine.formatCurrency(Math.abs(v.balance))})</option>`).join('');
    
    return `
        <div class="modal-header" style="background: var(--sap-secondary)">
            <h3>F-53 - Post Outgoing Payment</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body sap-form">
            <div class="sap-form-header">
                <span class="tcode-display">F-53</span>
                Post Vendor Payment
            </div>
            
            <form id="sapVendorPaymentForm" onsubmit="submitSAPVendorPayment(event)">
                <div class="sap-field-group">
                    <label>Company Code</label>
                    <input type="text" name="companyCode" value="1000" readonly>
                </div>
                <div class="sap-field-group">
                    <label>Vendor *</label>
                    <select name="vendorId" required onchange="updateVendorName(this)">
                        <option value="">Select Vendor...</option>
                        ${vendorOptions}
                    </select>
                    <input type="hidden" name="vendorName">
                </div>
                <div class="sap-field-group">
                    <label>Posting Date</label>
                    <input type="date" name="postingDate" value="${accountingEngine.getCurrentDate()}">
                </div>
                <div class="sap-field-group">
                    <label>Payment Amount *</label>
                    <input type="number" name="amount" min="0" required placeholder="Amount to pay">
                </div>
                <div class="sap-field-group">
                    <label>Bank Account</label>
                    <select name="bankAccount">
                        <option value="110000">110000 - Bank - Checking</option>
                    </select>
                </div>
                <div class="sap-field-group">
                    <label>Header Text</label>
                    <input type="text" name="headerText" placeholder="Payment reference">
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-sap" onclick="document.getElementById('sapVendorPaymentForm').requestSubmit()">
                Post Payment
            </button>
        </div>
    `;
}

function submitSAPVendorPayment(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const data = {
        vendorId: formData.get('vendorId'),
        vendorName: formData.get('vendorName'),
        postingDate: formData.get('postingDate'),
        amount: parseFloat(formData.get('amount')) || 0,
        bankAccount: formData.get('bankAccount'),
        headerText: formData.get('headerText')
    };
    
    const result = SAPModule.postVendorPayment(data);
    closeModal();
    showResult(result);
}

function getSAPCustomerPaymentForm() {
    const customers = accountingEngine.partners.filter(p => p.type === 'customer');
    const customerOptions = customers.map(c => `<option value="${c.id}">${c.id} - ${c.name} (${accountingEngine.formatCurrency(Math.abs(c.balance))})</option>`).join('');
    
    return `
        <div class="modal-header" style="background: var(--sap-secondary)">
            <h3>F-28 - Post Incoming Payment</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body sap-form">
            <div class="sap-form-header">
                <span class="tcode-display">F-28</span>
                Post Customer Payment
            </div>
            
            <form id="sapCustomerPaymentForm" onsubmit="submitSAPCustomerPayment(event)">
                <div class="sap-field-group">
                    <label>Company Code</label>
                    <input type="text" name="companyCode" value="1000" readonly>
                </div>
                <div class="sap-field-group">
                    <label>Customer *</label>
                    <select name="customerId" required onchange="updateCustomerName(this)">
                        <option value="">Select Customer...</option>
                        ${customerOptions}
                    </select>
                    <input type="hidden" name="customerName">
                </div>
                <div class="sap-field-group">
                    <label>Posting Date</label>
                    <input type="date" name="postingDate" value="${accountingEngine.getCurrentDate()}">
                </div>
                <div class="sap-field-group">
                    <label>Payment Amount *</label>
                    <input type="number" name="amount" min="0" required placeholder="Amount received">
                </div>
                <div class="sap-field-group">
                    <label>Bank Account</label>
                    <select name="bankAccount">
                        <option value="110000">110000 - Bank - Checking</option>
                    </select>
                </div>
                <div class="sap-field-group">
                    <label>Header Text</label>
                    <input type="text" name="headerText" placeholder="Payment reference">
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-sap" onclick="document.getElementById('sapCustomerPaymentForm').requestSubmit()">
                Post Payment
            </button>
        </div>
    `;
}

function submitSAPCustomerPayment(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const data = {
        customerId: formData.get('customerId'),
        customerName: formData.get('customerName'),
        postingDate: formData.get('postingDate'),
        amount: parseFloat(formData.get('amount')) || 0,
        bankAccount: formData.get('bankAccount'),
        headerText: formData.get('headerText')
    };
    
    const result = SAPModule.postCustomerPayment(data);
    closeModal();
    showResult(result);
}

function getSAPGoodsMovementForm() {
    const items = accountingEngine.items;
    const itemOptions = items.map(i => `<option value="${i.id}">${i.id} - ${i.name}</option>`).join('');
    
    return `
        <div class="modal-header" style="background: var(--sap-secondary)">
            <h3>MIGO - Goods Movement</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body sap-form">
            <div class="sap-form-header">
                <span class="tcode-display">MIGO</span>
                Goods Movement
            </div>
            
            <form id="sapGoodsMovementForm" onsubmit="submitSAPGoodsMovement(event)">
                <div class="sap-field-group">
                    <label>Movement Type *</label>
                    <select name="movementType" required>
                        <option value="101">101 - GR for Purchase Order</option>
                        <option value="201">201 - GI for Cost Center</option>
                        <option value="261">261 - GI for Production Order</option>
                    </select>
                </div>
                <div class="sap-field-group">
                    <label>Posting Date</label>
                    <input type="date" name="postingDate" value="${accountingEngine.getCurrentDate()}">
                </div>
                <div class="sap-field-group">
                    <label>Plant</label>
                    <input type="text" name="plant" value="PLANT01" readonly>
                </div>
                <div class="sap-field-group">
                    <label>Storage Location</label>
                    <select name="storageLocation">
                        <option value="0001">0001 - Main Storage</option>
                        <option value="0002">0002 - Secondary Storage</option>
                    </select>
                </div>
                
                <div class="item-entry-section">
                    <h4>Material Items</h4>
                    <table class="item-entry-table">
                        <thead>
                            <tr>
                                <th>Material</th>
                                <th style="width:100px">Quantity</th>
                                <th style="width:120px">Unit Price</th>
                            </tr>
                        </thead>
                        <tbody id="sapMIGOItems">
                            <tr>
                                <td><select name="items[0].materialId" required>
                                    <option value="">Select Material...</option>
                                    ${itemOptions}
                                </select></td>
                                <td><input type="number" name="items[0].quantity" min="1" required></td>
                                <td class="amount-cell"><input type="number" name="items[0].unitPrice" min="0" required></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-sap" onclick="document.getElementById('sapGoodsMovementForm').requestSubmit()">
                Post Goods Movement
            </button>
        </div>
    `;
}

function submitSAPGoodsMovement(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const items = [];
    let idx = 0;
    while (true) {
        const materialId = formData.get(`items[${idx}].materialId`);
        if (materialId === null) break;
        
        if (materialId) {
            items.push({
                materialId,
                quantity: parseFloat(formData.get(`items[${idx}].quantity`)) || 0,
                unitPrice: parseFloat(formData.get(`items[${idx}].unitPrice`)) || 0
            });
        }
        idx++;
        if (idx > 100) break;
    }
    
    const data = {
        movementType: formData.get('movementType'),
        postingDate: formData.get('postingDate'),
        plant: formData.get('plant'),
        storageLocation: formData.get('storageLocation'),
        items
    };
    
    const result = SAPModule.goodsMovement(data);
    closeModal();
    showResult(result);
}

function getSAPInvoiceVerificationForm() {
    const vendors = accountingEngine.partners.filter(p => p.type === 'vendor');
    const vendorOptions = vendors.map(v => `<option value="${v.id}">${v.id} - ${v.name}</option>`).join('');
    
    return `
        <div class="modal-header" style="background: var(--sap-secondary)">
            <h3>MIRO - Invoice Verification</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body sap-form">
            <div class="sap-form-header">
                <span class="tcode-display">MIRO</span>
                Enter Incoming Invoice (MM)
            </div>
            
            <form id="sapMIROForm" onsubmit="submitSAPInvoiceVerification(event)">
                <div class="sap-field-group">
                    <label>Company Code</label>
                    <input type="text" name="companyCode" value="1000" readonly>
                </div>
                <div class="sap-field-group">
                    <label>Vendor *</label>
                    <select name="vendorId" required onchange="updateVendorName(this)">
                        <option value="">Select Vendor...</option>
                        ${vendorOptions}
                    </select>
                    <input type="hidden" name="vendorName">
                </div>
                <div class="sap-field-group">
                    <label>Invoice Date *</label>
                    <input type="date" name="invoiceDate" value="${accountingEngine.getCurrentDate()}" required>
                </div>
                <div class="sap-field-group">
                    <label>Posting Date</label>
                    <input type="date" name="postingDate" value="${accountingEngine.getCurrentDate()}">
                </div>
                <div class="sap-field-group">
                    <label>Invoice Reference</label>
                    <input type="text" name="invoiceRef" placeholder="Vendor invoice number">
                </div>
                <div class="sap-field-group">
                    <label>Amount (excl. Tax) *</label>
                    <input type="number" name="amount" min="0" required placeholder="Invoice net amount">
                </div>
                <div class="sap-field-group">
                    <label>Tax Rate</label>
                    <select name="taxRate">
                        <option value="0.1">10% VAT</option>
                        <option value="0.08">8% VAT</option>
                        <option value="0">0% (No Tax)</option>
                    </select>
                </div>
                <div class="sap-field-group">
                    <label>Purchase Order</label>
                    <input type="text" name="purchaseOrder" placeholder="PO Reference">
                </div>
            </form>
            
            <div class="explanation-box mt-3">
                <h5>MM-FI Integration</h5>
                <p>This transaction clears the GR/IR clearing account from the Goods Receipt (MIGO) and creates the final vendor liability. This completes the 3-way matching process (PO → GR → IR).</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-sap" onclick="document.getElementById('sapMIROForm').requestSubmit()">
                Post Invoice
            </button>
        </div>
    `;
}

function submitSAPInvoiceVerification(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const data = {
        companyCode: formData.get('companyCode'),
        vendorId: formData.get('vendorId'),
        vendorName: formData.get('vendorName'),
        invoiceDate: formData.get('invoiceDate'),
        postingDate: formData.get('postingDate'),
        invoiceRef: formData.get('invoiceRef'),
        amount: parseFloat(formData.get('amount')) || 0,
        taxRate: parseFloat(formData.get('taxRate')) || 0.1,
        purchaseOrder: formData.get('purchaseOrder')
    };
    
    const result = SAPModule.invoiceVerification(data);
    closeModal();
    showResult(result);
}

function getSAPDepreciationForm() {
    return `
        <div class="modal-header" style="background: var(--sap-secondary)">
            <h3>AFAB - Depreciation Run</h3>
            <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body sap-form">
            <div class="sap-form-header">
                <span class="tcode-display">AFAB</span>
                Execute Depreciation Run
            </div>
            
            <form id="sapAFABForm" onsubmit="submitSAPDepreciation(event)">
                <div class="sap-field-group">
                    <label>Company Code</label>
                    <input type="text" name="companyCode" value="1000" readonly>
                </div>
                <div class="sap-field-group">
                    <label>Fiscal Year *</label>
                    <input type="number" name="fiscalYear" value="${new Date().getFullYear()}" required>
                </div>
                <div class="sap-field-group">
                    <label>Period *</label>
                    <select name="period" required>
                        ${Array.from({length: 12}, (_, i) => `<option value="${i+1}" ${i+1 === new Date().getMonth()+1 ? 'selected' : ''}>${String(i+1).padStart(2, '0')}</option>`).join('')}
                    </select>
                </div>
                <div class="sap-field-group">
                    <label>Depreciation Amount *</label>
                    <input type="number" name="amount" value="5000000" min="0" required placeholder="Enter amount">
                </div>
                <div class="sap-field-group">
                    <label>Cost Center</label>
                    <input type="text" name="costCenter" placeholder="Cost Center for posting">
                </div>
                <div class="sap-field-group">
                    <label>Run Mode</label>
                    <select name="runMode">
                        <option value="TEST">Test Run (No Posting)</option>
                        <option value="PRODUCTION" selected>Production Run (Post)</option>
                    </select>
                </div>
            </form>
            
            <div class="explanation-box mt-3">
                <h5>Asset Accounting</h5>
                <p>The depreciation run (AFAB) calculates and posts depreciation for all assets in the specified period. It debits depreciation expense and credits accumulated depreciation.</p>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button class="btn btn-sap" onclick="document.getElementById('sapAFABForm').requestSubmit()">
                Execute Run
            </button>
        </div>
    `;
}

function submitSAPDepreciation(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const data = {
        companyCode: formData.get('companyCode'),
        fiscalYear: formData.get('fiscalYear'),
        period: formData.get('period'),
        amount: parseFloat(formData.get('amount')) || 0,
        costCenter: formData.get('costCenter'),
        runMode: formData.get('runMode')
    };
    
    const result = SAPModule.depreciationRun(data);
    closeModal();
    showResult(result);
}

// Helper functions for SAP forms
function updateVendorName(select) {
    const vendor = accountingEngine.getPartner(select.value);
    const nameField = select.form.querySelector('[name="vendorName"]');
    if (nameField && vendor) {
        nameField.value = vendor.name;
    }
}

function updateCustomerName(select) {
    const customer = accountingEngine.getPartner(select.value);
    const nameField = select.form.querySelector('[name="customerName"]');
    if (nameField && customer) {
        nameField.value = customer.name;
    }
}

