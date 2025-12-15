/**
 * ==============================================
 * SAP FI/CO MODULE - Enterprise ERP Simulator
 * ==============================================
 * Mô phỏng SAP Financial Accounting (FI) và Controlling (CO)
 * Bao gồm: FI-GL, FI-AP, FI-AR, FI-Asset, CO-CCA, CO-PA
 */

const SAPModule = {
    // T-Code mappings
    tCodes: {
        // General Ledger
        'FB50': { name: 'G/L Account Posting', module: 'FI-GL', handler: 'postGLDocument' },
        'FB01': { name: 'Post Document', module: 'FI-GL', handler: 'postDocument' },
        'FB02': { name: 'Change Document', module: 'FI-GL', handler: 'changeDocument' },
        'FB03': { name: 'Display Document', module: 'FI-GL', handler: 'displayDocument' },
        'FS10N': { name: 'G/L Account Balance Display', module: 'FI-GL', handler: 'displayGLBalance' },
        'FAGLL03': { name: 'G/L Account Line Item Display', module: 'FI-GL', handler: 'displayGLLineItems' },
        
        // Accounts Payable
        'FB60': { name: 'Enter Vendor Invoice', module: 'FI-AP', handler: 'enterVendorInvoice' },
        'FB65': { name: 'Enter Vendor Credit Memo', module: 'FI-AP', handler: 'enterVendorCreditMemo' },
        'F-53': { name: 'Post Outgoing Payment', module: 'FI-AP', handler: 'postVendorPayment' },
        'F110': { name: 'Automatic Payment Program', module: 'FI-AP', handler: 'autoPaymentRun' },
        'FBL1N': { name: 'Vendor Line Items', module: 'FI-AP', handler: 'displayVendorLineItems' },
        'FK10N': { name: 'Vendor Balance Display', module: 'FI-AP', handler: 'displayVendorBalance' },
        
        // Accounts Receivable
        'FB70': { name: 'Enter Customer Invoice', module: 'FI-AR', handler: 'enterCustomerInvoice' },
        'FB75': { name: 'Enter Customer Credit Memo', module: 'FI-AR', handler: 'enterCustomerCreditMemo' },
        'F-28': { name: 'Post Incoming Payment', module: 'FI-AR', handler: 'postCustomerPayment' },
        'FBL5N': { name: 'Customer Line Items', module: 'FI-AR', handler: 'displayCustomerLineItems' },
        'FD10N': { name: 'Customer Balance Display', module: 'FI-AR', handler: 'displayCustomerBalance' },
        
        // Asset Accounting
        'AS01': { name: 'Create Asset Master', module: 'FI-AA', handler: 'createAsset' },
        'AS02': { name: 'Change Asset Master', module: 'FI-AA', handler: 'changeAsset' },
        'AS03': { name: 'Display Asset Master', module: 'FI-AA', handler: 'displayAsset' },
        'F-90': { name: 'Acquisition from Purchase', module: 'FI-AA', handler: 'assetAcquisition' },
        'AFAB': { name: 'Depreciation Run', module: 'FI-AA', handler: 'depreciationRun' },
        'AW01N': { name: 'Asset Explorer', module: 'FI-AA', handler: 'assetExplorer' },
        
        // MM Integration
        'MIGO': { name: 'Goods Movement', module: 'MM', handler: 'goodsMovement' },
        'MIRO': { name: 'Enter Invoice', module: 'MM', handler: 'invoiceVerification' },
        'MR11': { name: 'GR/IR Account Maintenance', module: 'MM', handler: 'grirMaintenance' },
        
        // SD Integration
        'VF01': { name: 'Create Billing Document', module: 'SD', handler: 'createBilling' },
        
        // Controlling
        'KS01': { name: 'Create Cost Center', module: 'CO-CCA', handler: 'createCostCenter' },
        'KSB1': { name: 'Cost Centers: Actual Line Items', module: 'CO-CCA', handler: 'costCenterLineItems' },
    },
    
    // Company code settings
    companyCode: {
        code: '1000',
        name: 'Demo Company Ltd.',
        currency: 'VND',
        country: 'VN',
        chartOfAccounts: 'CAVN',
        fiscalYearVariant: 'K4'
    },
    
    // Document types
    documentTypes: {
        'SA': { name: 'G/L Account Document', numberRange: '19' },
        'KR': { name: 'Vendor Invoice', numberRange: '51' },
        'KG': { name: 'Vendor Credit Memo', numberRange: '52' },
        'KZ': { name: 'Vendor Payment', numberRange: '53' },
        'DR': { name: 'Customer Invoice', numberRange: '11' },
        'DG': { name: 'Customer Credit Memo', numberRange: '12' },
        'DZ': { name: 'Customer Payment', numberRange: '13' },
        'AA': { name: 'Asset Posting', numberRange: '01' },
        'AF': { name: 'Depreciation Posting', numberRange: '02' },
        'WE': { name: 'Goods Receipt', numberRange: '49' },
        'RE': { name: 'Invoice Verification', numberRange: '51' },
    },
    
    // Posting keys
    postingKeys: {
        '40': { description: 'Debit G/L Account', type: 'debit' },
        '50': { description: 'Credit G/L Account', type: 'credit' },
        '21': { description: 'Credit Vendor', type: 'credit' },
        '31': { description: 'Debit Vendor', type: 'debit' },
        '01': { description: 'Debit Customer', type: 'debit' },
        '11': { description: 'Credit Customer', type: 'credit' },
        '70': { description: 'Debit Asset', type: 'debit' },
        '75': { description: 'Credit Asset', type: 'credit' },
    },
    
    // Generate SAP document number
    generateDocNumber(docType) {
        const year = new Date().getFullYear();
        const counter = Math.floor(Math.random() * 9000000) + 1000000;
        return `${counter}`;
    },
    
    // ==========================================
    // FB50 - G/L Account Posting
    // ==========================================
    postGLDocument(data) {
        const docNumber = this.generateDocNumber('SA');
        const date = data.postingDate || accountingEngine.getCurrentDate();
        
        // Validate
        const errors = this.validateGLPosting(data);
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        // Build line items
        const entries = data.items.map(item => ({
            account: item.glAccount,
            name: SAPGLAccounts[item.glAccount]?.name || item.glAccount,
            debit: item.postingKey === '40' ? item.amount : 0,
            credit: item.postingKey === '50' ? item.amount : 0,
            costCenter: item.costCenter,
            text: item.text
        }));
        
        const journalEntry = accountingEngine.postJournalEntry(
            docNumber,
            date,
            data.headerText || 'G/L Account Posting',
            entries,
            { 
                type: 'SAP_GL',
                docType: 'SA',
                companyCode: this.companyCode.code,
                fiscalYear: new Date().getFullYear()
            }
        );
        
        const document = accountingEngine.createDocument({
            docNumber,
            docType: 'SA',
            date,
            description: data.headerText,
            companyCode: this.companyCode.code,
            items: data.items,
            journalEntryId: journalEntry.id,
            sapModule: 'FI-GL',
            tCode: 'FB50'
        });
        
        return {
            success: true,
            message: `Document ${docNumber} was posted in company code ${this.companyCode.code}`,
            document,
            journalEntry,
            entries,
            explanation: this.getExplanation('GL_POSTING', data),
            sapOutput: this.formatSAPOutput('FB50', docNumber, entries)
        };
    },
    
    validateGLPosting(data) {
        const errors = [];
        if (!data.items || data.items.length < 2) {
            errors.push('At least 2 line items required');
        }
        
        let totalDebit = 0;
        let totalCredit = 0;
        
        data.items?.forEach((item, idx) => {
            if (!item.glAccount) errors.push(`Line ${idx + 1}: G/L Account is required`);
            if (!item.amount || item.amount <= 0) errors.push(`Line ${idx + 1}: Amount must be greater than 0`);
            if (!item.postingKey) errors.push(`Line ${idx + 1}: Posting Key is required`);
            
            if (item.postingKey === '40') totalDebit += item.amount || 0;
            if (item.postingKey === '50') totalCredit += item.amount || 0;
        });
        
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            errors.push(`Document does not balance. Debit: ${totalDebit}, Credit: ${totalCredit}`);
        }
        
        return errors;
    },
    
    // ==========================================
    // FB60 - Enter Vendor Invoice
    // ==========================================
    enterVendorInvoice(data) {
        const docNumber = this.generateDocNumber('KR');
        const date = data.postingDate || accountingEngine.getCurrentDate();
        
        const errors = this.validateVendorInvoice(data);
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        // Calculate amounts
        const baseAmount = data.amount;
        const taxAmount = baseAmount * (data.taxRate || 0.1);
        const grossAmount = baseAmount + taxAmount;
        
        const entries = [
            { 
                account: data.expenseAccount || '660000', 
                name: SAPGLAccounts[data.expenseAccount]?.name || 'Expense', 
                debit: baseAmount, 
                credit: 0,
                postingKey: '40',
                costCenter: data.costCenter
            },
            { 
                account: '130000', 
                name: 'Input Tax', 
                debit: taxAmount, 
                credit: 0,
                postingKey: '40'
            },
            { 
                account: '300000', 
                name: 'Accounts Payable', 
                debit: 0, 
                credit: grossAmount,
                postingKey: '21',
                vendor: data.vendorId
            }
        ];
        
        // Update vendor balance
        accountingEngine.updatePartnerBalance(data.vendorId, grossAmount, 'CREDIT');
        
        const journalEntry = accountingEngine.postJournalEntry(
            docNumber,
            date,
            data.headerText || `Vendor Invoice ${data.invoiceRef || ''}`,
            entries,
            { 
                type: 'SAP_VENDOR_INVOICE',
                docType: 'KR',
                vendor: data.vendorId,
                invoiceRef: data.invoiceRef
            }
        );
        
        const document = accountingEngine.createDocument({
            docNumber,
            docType: 'KR',
            date,
            partnerId: data.vendorId,
            partnerName: data.vendorName,
            description: data.headerText,
            amount: grossAmount,
            baseAmount,
            taxAmount,
            journalEntryId: journalEntry.id,
            sapModule: 'FI-AP',
            tCode: 'FB60'
        });
        
        return {
            success: true,
            message: `Vendor Invoice ${docNumber} posted. Amount: ${accountingEngine.formatCurrency(grossAmount)}`,
            document,
            journalEntry,
            entries,
            explanation: this.getExplanation('VENDOR_INVOICE', { ...data, baseAmount, taxAmount, grossAmount }),
            sapOutput: this.formatSAPOutput('FB60', docNumber, entries)
        };
    },
    
    validateVendorInvoice(data) {
        const errors = [];
        if (!data.vendorId) errors.push('Vendor is required');
        if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');
        if (!data.invoiceDate) errors.push('Invoice date is required');
        return errors;
    },
    
    // ==========================================
    // FB70 - Enter Customer Invoice
    // ==========================================
    enterCustomerInvoice(data) {
        const docNumber = this.generateDocNumber('DR');
        const date = data.postingDate || accountingEngine.getCurrentDate();
        
        const errors = this.validateCustomerInvoice(data);
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        const baseAmount = data.amount;
        const taxAmount = baseAmount * (data.taxRate || 0.1);
        const grossAmount = baseAmount + taxAmount;
        
        const entries = [
            { 
                account: '120000', 
                name: 'Accounts Receivable', 
                debit: grossAmount, 
                credit: 0,
                postingKey: '01',
                customer: data.customerId
            },
            { 
                account: '500000', 
                name: 'Sales Revenue', 
                debit: 0, 
                credit: baseAmount,
                postingKey: '50'
            },
            { 
                account: '310000', 
                name: 'Output Tax', 
                debit: 0, 
                credit: taxAmount,
                postingKey: '50'
            }
        ];
        
        // Update customer balance
        accountingEngine.updatePartnerBalance(data.customerId, grossAmount, 'DEBIT');
        
        const journalEntry = accountingEngine.postJournalEntry(
            docNumber,
            date,
            data.headerText || `Customer Invoice ${data.invoiceRef || ''}`,
            entries,
            { 
                type: 'SAP_CUSTOMER_INVOICE',
                docType: 'DR',
                customer: data.customerId
            }
        );
        
        const document = accountingEngine.createDocument({
            docNumber,
            docType: 'DR',
            date,
            partnerId: data.customerId,
            partnerName: data.customerName,
            description: data.headerText,
            amount: grossAmount,
            baseAmount,
            taxAmount,
            journalEntryId: journalEntry.id,
            sapModule: 'FI-AR',
            tCode: 'FB70'
        });
        
        return {
            success: true,
            message: `Customer Invoice ${docNumber} posted. Amount: ${accountingEngine.formatCurrency(grossAmount)}`,
            document,
            journalEntry,
            entries,
            explanation: this.getExplanation('CUSTOMER_INVOICE', { ...data, baseAmount, taxAmount, grossAmount }),
            sapOutput: this.formatSAPOutput('FB70', docNumber, entries)
        };
    },
    
    validateCustomerInvoice(data) {
        const errors = [];
        if (!data.customerId) errors.push('Customer is required');
        if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');
        return errors;
    },
    
    // ==========================================
    // F-53 - Vendor Payment
    // ==========================================
    postVendorPayment(data) {
        const docNumber = this.generateDocNumber('KZ');
        const date = data.postingDate || accountingEngine.getCurrentDate();
        
        const errors = [];
        if (!data.vendorId) errors.push('Vendor is required');
        if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');
        
        // Check bank balance
        const bankBalance = accountingEngine.getAccountBalance('1121').balance;
        if (data.amount > bankBalance) {
            errors.push(`Insufficient bank balance. Available: ${accountingEngine.formatCurrency(bankBalance)}`);
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        const entries = [
            { 
                account: '300000', 
                name: 'Accounts Payable', 
                debit: data.amount, 
                credit: 0,
                postingKey: '31',
                vendor: data.vendorId
            },
            { 
                account: '110000', 
                name: 'Bank - Checking', 
                debit: 0, 
                credit: data.amount,
                postingKey: '50'
            }
        ];
        
        // Update vendor balance
        accountingEngine.updatePartnerBalance(data.vendorId, data.amount, 'DEBIT');
        
        const journalEntry = accountingEngine.postJournalEntry(
            docNumber,
            date,
            data.headerText || `Payment to Vendor ${data.vendorId}`,
            entries,
            { 
                type: 'SAP_VENDOR_PAYMENT',
                docType: 'KZ',
                vendor: data.vendorId
            }
        );
        
        const document = accountingEngine.createDocument({
            docNumber,
            docType: 'KZ',
            date,
            partnerId: data.vendorId,
            partnerName: data.vendorName,
            description: data.headerText,
            amount: data.amount,
            journalEntryId: journalEntry.id,
            sapModule: 'FI-AP',
            tCode: 'F-53'
        });
        
        return {
            success: true,
            message: `Payment document ${docNumber} posted. Amount: ${accountingEngine.formatCurrency(data.amount)}`,
            document,
            journalEntry,
            entries,
            explanation: this.getExplanation('VENDOR_PAYMENT', data),
            sapOutput: this.formatSAPOutput('F-53', docNumber, entries)
        };
    },
    
    // ==========================================
    // F-28 - Customer Payment
    // ==========================================
    postCustomerPayment(data) {
        const docNumber = this.generateDocNumber('DZ');
        const date = data.postingDate || accountingEngine.getCurrentDate();
        
        const errors = [];
        if (!data.customerId) errors.push('Customer is required');
        if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        const entries = [
            { 
                account: '110000', 
                name: 'Bank - Checking', 
                debit: data.amount, 
                credit: 0,
                postingKey: '40'
            },
            { 
                account: '120000', 
                name: 'Accounts Receivable', 
                debit: 0, 
                credit: data.amount,
                postingKey: '11',
                customer: data.customerId
            }
        ];
        
        // Update customer balance
        accountingEngine.updatePartnerBalance(data.customerId, data.amount, 'CREDIT');
        
        const journalEntry = accountingEngine.postJournalEntry(
            docNumber,
            date,
            data.headerText || `Payment from Customer ${data.customerId}`,
            entries,
            { 
                type: 'SAP_CUSTOMER_PAYMENT',
                docType: 'DZ',
                customer: data.customerId
            }
        );
        
        const document = accountingEngine.createDocument({
            docNumber,
            docType: 'DZ',
            date,
            partnerId: data.customerId,
            partnerName: data.customerName,
            description: data.headerText,
            amount: data.amount,
            journalEntryId: journalEntry.id,
            sapModule: 'FI-AR',
            tCode: 'F-28'
        });
        
        return {
            success: true,
            message: `Payment document ${docNumber} posted. Amount: ${accountingEngine.formatCurrency(data.amount)}`,
            document,
            journalEntry,
            entries,
            explanation: this.getExplanation('CUSTOMER_PAYMENT', data),
            sapOutput: this.formatSAPOutput('F-28', docNumber, entries)
        };
    },
    
    // ==========================================
    // MIGO - Goods Receipt
    // ==========================================
    goodsMovement(data) {
        const docNumber = this.generateDocNumber('WE');
        const date = data.postingDate || accountingEngine.getCurrentDate();
        
        const errors = [];
        if (!data.items || data.items.length === 0) {
            errors.push('At least one material line is required');
        }
        if (!data.movementType) {
            errors.push('Movement type is required');
        }
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        let entries = [];
        let totalAmount = 0;
        
        data.items.forEach(item => {
            totalAmount += item.quantity * item.unitPrice;
        });
        
        switch (data.movementType) {
            case '101': // GR for Purchase Order
                entries = [
                    { 
                        account: '140000', 
                        name: 'Raw Materials', 
                        debit: totalAmount, 
                        credit: 0
                    },
                    { 
                        account: '170000', 
                        name: 'GR/IR Clearing', 
                        debit: 0, 
                        credit: totalAmount
                    }
                ];
                break;
                
            case '201': // Goods Issue for Cost Center
                entries = [
                    { 
                        account: '630000', 
                        name: 'Manufacturing Overhead', 
                        debit: totalAmount, 
                        credit: 0,
                        costCenter: data.costCenter
                    },
                    { 
                        account: '140000', 
                        name: 'Raw Materials', 
                        debit: 0, 
                        credit: totalAmount
                    }
                ];
                break;
                
            case '261': // Goods Issue for Production Order
                entries = [
                    { 
                        account: '610000', 
                        name: 'Raw Material Consumption', 
                        debit: totalAmount, 
                        credit: 0
                    },
                    { 
                        account: '140000', 
                        name: 'Raw Materials', 
                        debit: 0, 
                        credit: totalAmount
                    }
                ];
                break;
        }
        
        // Update inventory
        data.items.forEach(item => {
            const type = ['101', '501'].includes(data.movementType) ? 'IN' : 'OUT';
            accountingEngine.updateInventory(
                item.materialId,
                data.plant || 'PLANT01',
                item.quantity,
                item.unitPrice,
                type
            );
        });
        
        const journalEntry = accountingEngine.postJournalEntry(
            docNumber,
            date,
            `Goods Movement ${data.movementType}`,
            entries,
            { 
                type: 'SAP_GOODS_MOVEMENT',
                docType: 'WE',
                movementType: data.movementType,
                purchaseOrder: data.purchaseOrder
            }
        );
        
        const document = accountingEngine.createDocument({
            docNumber,
            docType: 'WE',
            date,
            description: `Goods Movement ${data.movementType}`,
            items: data.items,
            totalAmount,
            movementType: data.movementType,
            journalEntryId: journalEntry.id,
            sapModule: 'MM',
            tCode: 'MIGO'
        });
        
        return {
            success: true,
            message: `Material document ${docNumber} posted`,
            document,
            journalEntry,
            entries,
            explanation: this.getExplanation('GOODS_MOVEMENT', { ...data, totalAmount }),
            sapOutput: this.formatSAPOutput('MIGO', docNumber, entries)
        };
    },
    
    // ==========================================
    // MIRO - Invoice Verification
    // ==========================================
    invoiceVerification(data) {
        const docNumber = this.generateDocNumber('RE');
        const date = data.postingDate || accountingEngine.getCurrentDate();
        
        const errors = [];
        if (!data.vendorId) errors.push('Vendor is required');
        if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        const baseAmount = data.amount;
        const taxAmount = baseAmount * (data.taxRate || 0.1);
        const grossAmount = baseAmount + taxAmount;
        
        // Clear GR/IR and create vendor liability
        const entries = [
            { 
                account: '170000', 
                name: 'GR/IR Clearing', 
                debit: baseAmount, 
                credit: 0
            },
            { 
                account: '130000', 
                name: 'Input Tax', 
                debit: taxAmount, 
                credit: 0
            },
            { 
                account: '300000', 
                name: 'Accounts Payable', 
                debit: 0, 
                credit: grossAmount,
                vendor: data.vendorId
            }
        ];
        
        // Update vendor balance
        accountingEngine.updatePartnerBalance(data.vendorId, grossAmount, 'CREDIT');
        
        const journalEntry = accountingEngine.postJournalEntry(
            docNumber,
            date,
            `Invoice Verification - ${data.invoiceRef || ''}`,
            entries,
            { 
                type: 'SAP_INVOICE_VERIFICATION',
                docType: 'RE',
                vendor: data.vendorId,
                purchaseOrder: data.purchaseOrder
            }
        );
        
        const document = accountingEngine.createDocument({
            docNumber,
            docType: 'RE',
            date,
            partnerId: data.vendorId,
            partnerName: data.vendorName,
            description: `Invoice Verification`,
            amount: grossAmount,
            baseAmount,
            taxAmount,
            journalEntryId: journalEntry.id,
            sapModule: 'MM',
            tCode: 'MIRO'
        });
        
        return {
            success: true,
            message: `Invoice document ${docNumber} posted`,
            document,
            journalEntry,
            entries,
            explanation: this.getExplanation('INVOICE_VERIFICATION', { ...data, baseAmount, taxAmount, grossAmount }),
            sapOutput: this.formatSAPOutput('MIRO', docNumber, entries)
        };
    },
    
    // ==========================================
    // AFAB - Depreciation Run
    // ==========================================
    depreciationRun(data) {
        const docNumber = this.generateDocNumber('AF');
        const date = data.postingDate || accountingEngine.getCurrentDate();
        
        const errors = [];
        if (!data.fiscalYear) errors.push('Fiscal year is required');
        if (!data.period) errors.push('Period is required');
        
        if (errors.length > 0) {
            return { success: false, errors };
        }
        
        // For demo, using provided amount
        const depAmount = data.amount || 5000000;
        
        const entries = [
            { 
                account: '640000', 
                name: 'Depreciation Expense', 
                debit: depAmount, 
                credit: 0,
                costCenter: data.costCenter
            },
            { 
                account: '230000', 
                name: 'Accumulated Depreciation', 
                debit: 0, 
                credit: depAmount
            }
        ];
        
        const journalEntry = accountingEngine.postJournalEntry(
            docNumber,
            date,
            `Depreciation Run Period ${data.period}/${data.fiscalYear}`,
            entries,
            { 
                type: 'SAP_DEPRECIATION',
                docType: 'AF',
                fiscalYear: data.fiscalYear,
                period: data.period
            }
        );
        
        const document = accountingEngine.createDocument({
            docNumber,
            docType: 'AF',
            date,
            description: `Depreciation Run`,
            amount: depAmount,
            fiscalYear: data.fiscalYear,
            period: data.period,
            journalEntryId: journalEntry.id,
            sapModule: 'FI-AA',
            tCode: 'AFAB'
        });
        
        return {
            success: true,
            message: `Depreciation posting document ${docNumber} created`,
            document,
            journalEntry,
            entries,
            explanation: this.getExplanation('DEPRECIATION', { ...data, amount: depAmount }),
            sapOutput: this.formatSAPOutput('AFAB', docNumber, entries)
        };
    },
    
    // ==========================================
    // Balance Display Functions
    // ==========================================
    displayGLBalance(glAccount) {
        const balance = accountingEngine.getAccountBalance(glAccount);
        const accountInfo = SAPGLAccounts[glAccount] || { name: 'Unknown' };
        
        return {
            account: glAccount,
            name: accountInfo.name,
            companyCode: this.companyCode.code,
            fiscalYear: new Date().getFullYear(),
            debitTotal: balance.debit,
            creditTotal: balance.credit,
            balance: balance.balance,
            currency: this.companyCode.currency
        };
    },
    
    displayVendorBalance(vendorId) {
        const vendor = accountingEngine.getPartner(vendorId);
        if (!vendor) return { error: 'Vendor not found' };
        
        return {
            vendor: vendorId,
            name: vendor.name,
            companyCode: this.companyCode.code,
            balance: vendor.balance,
            currency: this.companyCode.currency
        };
    },
    
    displayCustomerBalance(customerId) {
        const customer = accountingEngine.getPartner(customerId);
        if (!customer) return { error: 'Customer not found' };
        
        return {
            customer: customerId,
            name: customer.name,
            companyCode: this.companyCode.code,
            balance: customer.balance,
            currency: this.companyCode.currency
        };
    },
    
    // ==========================================
    // Explanation Generator
    // ==========================================
    getExplanation(type, data) {
        const explanations = {
            'GL_POSTING': `
                G/L Account Document posted successfully.
                
                This is a standard FI posting that directly affects G/L accounts.
                The document is balanced (total debits = total credits) as required by double-entry bookkeeping.
            `,
            'VENDOR_INVOICE': `
                Vendor Invoice (FB60) Processing:
                
                1. Expense account debited: ${accountingEngine.formatCurrency(data.baseAmount)}
                   - Records the cost/expense in the appropriate account
                
                2. Input Tax recorded: ${accountingEngine.formatCurrency(data.taxAmount)}
                   - VAT/GST that can be reclaimed from tax authorities
                
                3. Vendor liability created: ${accountingEngine.formatCurrency(data.grossAmount)}
                   - Amount owed to vendor, will appear in Accounts Payable aging
                
                Integration: This posting updates the vendor subledger and G/L simultaneously.
            `,
            'CUSTOMER_INVOICE': `
                Customer Invoice (FB70) Processing:
                
                1. Accounts Receivable debited: ${accountingEngine.formatCurrency(data.grossAmount)}
                   - Creates receivable from customer
                
                2. Revenue recognized: ${accountingEngine.formatCurrency(data.baseAmount)}
                   - Sales/service revenue posted to P&L
                
                3. Output Tax liability: ${accountingEngine.formatCurrency(data.taxAmount)}
                   - VAT/GST to be remitted to tax authorities
                
                Integration: Updates customer subledger for credit management and collections.
            `,
            'VENDOR_PAYMENT': `
                Vendor Payment (F-53) Processing:
                
                1. Accounts Payable cleared: ${accountingEngine.formatCurrency(data.amount)}
                   - Reduces liability to vendor
                
                2. Bank account reduced: ${accountingEngine.formatCurrency(data.amount)}
                   - Cash outflow recorded
                
                This payment can be used to clear specific open invoices (partial or full clearing).
            `,
            'CUSTOMER_PAYMENT': `
                Customer Payment (F-28) Processing:
                
                1. Bank account increased: ${accountingEngine.formatCurrency(data.amount)}
                   - Cash inflow recorded
                
                2. Accounts Receivable cleared: ${accountingEngine.formatCurrency(data.amount)}
                   - Reduces customer's outstanding balance
                
                Payment can be allocated to specific invoices for proper aging analysis.
            `,
            'GOODS_MOVEMENT': `
                Goods Movement (MIGO) - Movement Type ${data.movementType}:
                
                ${data.movementType === '101' ? `
                Goods Receipt for Purchase Order:
                - Inventory (Stock) increased by: ${accountingEngine.formatCurrency(data.totalAmount)}
                - GR/IR Clearing account credited
                
                Note: GR/IR is an interim account that will be cleared when invoice is verified (MIRO).
                This is the MM-FI integration point for 3-way matching.
                ` : ''}
                
                ${data.movementType === '201' || data.movementType === '261' ? `
                Goods Issue:
                - Inventory reduced
                - Consumption/expense recorded
                
                Cost is posted to the relevant cost center or production order.
                ` : ''}
            `,
            'INVOICE_VERIFICATION': `
                Invoice Verification (MIRO) Processing:
                
                1. GR/IR Clearing account cleared: ${accountingEngine.formatCurrency(data.baseAmount)}
                   - Matches with goods receipt posting
                
                2. Input Tax recorded: ${accountingEngine.formatCurrency(data.taxAmount)}
                   - Reclaimable VAT from vendor invoice
                
                3. Vendor liability created: ${accountingEngine.formatCurrency(data.grossAmount)}
                   - Final payable amount due to vendor
                
                MM-FI Integration: Completes the procurement cycle (PO → GR → IR)
            `,
            'DEPRECIATION': `
                Depreciation Run (AFAB) Processing:
                
                Period: ${data.period}/${data.fiscalYear}
                Amount: ${accountingEngine.formatCurrency(data.amount)}
                
                1. Depreciation Expense recorded
                   - Posted to cost center for cost allocation
                
                2. Accumulated Depreciation increased
                   - Contra-asset account reducing net book value
                
                Asset Management: This run processes all assets due for depreciation in the period.
            `
        };
        
        return explanations[type] || 'Document processed successfully.';
    },
    
    // ==========================================
    // SAP-style Output Formatter
    // ==========================================
    formatSAPOutput(tCode, docNumber, entries) {
        const tCodeInfo = this.tCodes[tCode];
        
        let output = `
╔══════════════════════════════════════════════════════════════════╗
║  SAP Easy Access - ${tCodeInfo?.name || tCode}
╠══════════════════════════════════════════════════════════════════╣
║  T-Code: ${tCode}
║  Document: ${docNumber}
║  Company Code: ${this.companyCode.code}
║  Fiscal Year: ${new Date().getFullYear()}
╠══════════════════════════════════════════════════════════════════╣
║  ACCOUNTING DOCUMENT LINE ITEMS
╠══════════════════════════════════════════════════════════════════╣
`;
        
        let line = 1;
        let totalDebit = 0;
        let totalCredit = 0;
        
        entries.forEach(entry => {
            const debitStr = entry.debit > 0 ? accountingEngine.formatCurrency(entry.debit).padStart(18) : ''.padStart(18);
            const creditStr = entry.credit > 0 ? accountingEngine.formatCurrency(entry.credit).padStart(18) : ''.padStart(18);
            
            output += `║  ${line.toString().padStart(3)}  ${entry.account.padEnd(10)}  ${entry.name.substring(0, 25).padEnd(25)}  ${debitStr}  ${creditStr}\n`;
            
            totalDebit += entry.debit || 0;
            totalCredit += entry.credit || 0;
            line++;
        });
        
        output += `╠══════════════════════════════════════════════════════════════════╣
║  TOTAL                                             ${accountingEngine.formatCurrency(totalDebit).padStart(18)}  ${accountingEngine.formatCurrency(totalCredit).padStart(18)}
╠══════════════════════════════════════════════════════════════════╣
║  ✓ Document ${docNumber} posted successfully
╚══════════════════════════════════════════════════════════════════╝`;
        
        return output;
    },
    
    // Execute T-Code
    executeTCode(tCode, data) {
        const tCodeInfo = this.tCodes[tCode.toUpperCase()];
        if (!tCodeInfo) {
            return { success: false, errors: [`Transaction ${tCode} not found`] };
        }
        
        const handler = this[tCodeInfo.handler];
        if (typeof handler === 'function') {
            return handler.call(this, data);
        }
        
        return { success: false, errors: [`Handler for ${tCode} not implemented`] };
    }
};


