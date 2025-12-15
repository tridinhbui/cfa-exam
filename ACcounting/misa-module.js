/**
 * ==============================================
 * MISA MODULE - Vietnamese Accounting Operations
 * ==============================================
 * Handles MISA-style accounting transactions
 */

const MISAModule = {
    // Document counters
    counters: {
        PT: 0, // Cash Receipt
        PC: 0, // Cash Payment
        PN: 0, // Stock In
        PX: 0, // Stock Out
        PKT: 0 // Journal Entry
    },

    // Generate document number
    generateDocNumber(type) {
        this.counters[type]++;
        return `${type}${String(this.counters[type]).padStart(4, '0')}`;
    },

    // ==========================================
    // CASH RECEIPT - Phiếu thu
    // ==========================================
    createCashReceipt(data) {
        const errors = this.validateCashReceipt(data);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const docNumber = this.generateDocNumber('PT');
        const entries = [];
        let explanation = '';

        switch (data.receiptType) {
            case 'CUSTOMER':
                // Dr 1111 - Cash / Cr 131 - Receivables
                entries.push({
                    account: '1111',
                    name: 'Cash on Hand',
                    debit: data.amount,
                    credit: 0
                });
                entries.push({
                    account: '131',
                    name: 'Accounts Receivable',
                    debit: 0,
                    credit: data.amount
                });
                explanation = `Customer payment received from ${data.partnerName || 'customer'}.\nThis reduces receivables and increases cash.`;
                break;

            case 'SALES':
                const netAmount = data.amount / (1 + data.vatRate);
                const vatAmount = data.amount - netAmount;
                // Dr 1111 - Cash
                entries.push({
                    account: '1111',
                    name: 'Cash on Hand',
                    debit: data.amount,
                    credit: 0
                });
                // Cr 5111 - Revenue
                entries.push({
                    account: '5111',
                    name: 'Sales Revenue',
                    debit: 0,
                    credit: netAmount
                });
                // Cr 33311 - VAT Output
                if (vatAmount > 0) {
                    entries.push({
                        account: '33311',
                        name: 'VAT Output',
                        debit: 0,
                        credit: vatAmount
                    });
                }
                explanation = `Cash sales recorded.\nRevenue: ${accountingEngine.formatCurrency(netAmount)}\nVAT (${data.vatRate * 100}%): ${accountingEngine.formatCurrency(vatAmount)}`;
                break;

            case 'BANK_WITHDRAW':
                // Dr 1111 - Cash / Cr 1121 - Bank
                entries.push({
                    account: '1111',
                    name: 'Cash on Hand',
                    debit: data.amount,
                    credit: 0
                });
                entries.push({
                    account: '1121',
                    name: 'Bank Deposits',
                    debit: 0,
                    credit: data.amount
                });
                explanation = 'Bank withdrawal - transferring from bank account to cash on hand.';
                break;

            case 'OTHER':
            default:
                // Dr 1111 - Cash / Cr 711 - Other Income
                entries.push({
                    account: '1111',
                    name: 'Cash on Hand',
                    debit: data.amount,
                    credit: 0
                });
                entries.push({
                    account: '711',
                    name: 'Other Income',
                    debit: 0,
                    credit: data.amount
                });
                explanation = 'Other cash receipt recorded as miscellaneous income.';
                break;
        }

        // Create document
        const document = {
            id: 'DOC' + Date.now(),
            docNumber,
            docType: 'PT',
            date: data.date,
            description: data.description,
            partnerId: data.partnerId,
            partnerName: data.partnerName,
            amount: data.amount,
            status: 'POSTED'
        };

        // Post to accounting engine
        const jeId = accountingEngine.postJournalEntry({
            date: data.date,
            documentId: docNumber,
            description: data.description,
            entries
        });

        document.journalEntryId = jeId;
        accountingEngine.addDocument(document);

        return {
            success: true,
            document,
            entries,
            explanation,
            impact: [
                { type: 'cash', text: `Cash increased by ${accountingEngine.formatCurrency(data.amount)}` }
            ]
        };
    },

    validateCashReceipt(data) {
        const errors = [];
        if (!data.date) errors.push('Document date is required');
        if (!data.receiptType) errors.push('Receipt type is required');
        if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');
        if (!data.description) errors.push('Description is required');
        if (data.receiptType === 'CUSTOMER' && !data.partnerId) {
            errors.push('Customer is required for customer payment');
        }
        return errors;
    },

    // ==========================================
    // CASH PAYMENT - Phiếu chi
    // ==========================================
    createCashPayment(data) {
        const errors = this.validateCashPayment(data);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const docNumber = this.generateDocNumber('PC');
        const entries = [];
        let explanation = '';

        switch (data.paymentType) {
            case 'VENDOR':
                // Dr 331 - Payables / Cr 1111 - Cash
                entries.push({
                    account: '331',
                    name: 'Accounts Payable',
                    debit: data.amount,
                    credit: 0
                });
                entries.push({
                    account: '1111',
                    name: 'Cash on Hand',
                    debit: 0,
                    credit: data.amount
                });
                explanation = `Payment to vendor ${data.partnerName || ''}.\nThis reduces payables and decreases cash.`;
                break;

            case 'EXPENSE':
                // Dr Expense Account / Cr 1111 - Cash
                entries.push({
                    account: data.expenseAccount || '6428',
                    name: data.expenseAccountName || 'Other Cash Expenses',
                    debit: data.amount,
                    credit: 0
                });
                entries.push({
                    account: '1111',
                    name: 'Cash on Hand',
                    debit: 0,
                    credit: data.amount
                });
                explanation = 'Operating expense paid in cash. This increases expenses and decreases cash.';
                break;

            case 'SALARY':
                // Dr 334 - Payroll Payable / Cr 1111 - Cash
                entries.push({
                    account: '334',
                    name: 'Payroll Payable',
                    debit: data.amount,
                    credit: 0
                });
                entries.push({
                    account: '1111',
                    name: 'Cash on Hand',
                    debit: 0,
                    credit: data.amount
                });
                explanation = 'Salary payment to employees. This clears payroll liability.';
                break;

            case 'ADVANCE':
                // Dr 141 - Advances / Cr 1111 - Cash
                entries.push({
                    account: '141',
                    name: 'Advances to Employees',
                    debit: data.amount,
                    credit: 0
                });
                entries.push({
                    account: '1111',
                    name: 'Cash on Hand',
                    debit: 0,
                    credit: data.amount
                });
                explanation = 'Cash advance given. This is recorded as a receivable from the employee.';
                break;

            case 'BANK_DEPOSIT':
                // Dr 1121 - Bank / Cr 1111 - Cash
                entries.push({
                    account: '1121',
                    name: 'Bank Deposits',
                    debit: data.amount,
                    credit: 0
                });
                entries.push({
                    account: '1111',
                    name: 'Cash on Hand',
                    debit: 0,
                    credit: data.amount
                });
                explanation = 'Cash deposited to bank account.';
                break;

            default:
                return { success: false, errors: ['Invalid payment type'] };
        }

        const document = {
            id: 'DOC' + Date.now(),
            docNumber,
            docType: 'PC',
            date: data.date,
            description: data.description,
            partnerId: data.partnerId,
            partnerName: data.partnerName,
            amount: data.amount,
            status: 'POSTED'
        };

        const jeId = accountingEngine.postJournalEntry({
            date: data.date,
            documentId: docNumber,
            description: data.description,
            entries
        });

        document.journalEntryId = jeId;
        accountingEngine.addDocument(document);

        return {
            success: true,
            document,
            entries,
            explanation,
            impact: [
                { type: 'cash', text: `Cash decreased by ${accountingEngine.formatCurrency(data.amount)}` }
            ]
        };
    },

    validateCashPayment(data) {
        const errors = [];
        if (!data.date) errors.push('Document date is required');
        if (!data.paymentType) errors.push('Payment type is required');
        if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');
        if (!data.description) errors.push('Description is required');
        return errors;
    },

    // ==========================================
    // STOCK IN - Phiếu nhập kho
    // ==========================================
    createStockIn(data) {
        const errors = this.validateStockIn(data);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const docNumber = this.generateDocNumber('PN');
        const entries = [];
        let totalAmount = 0;
        let totalVAT = 0;

        // Process each item
        data.items.forEach(item => {
            const lineAmount = item.quantity * item.unitPrice;
            const vatAmount = lineAmount * item.vatRate;
            totalAmount += lineAmount;
            totalVAT += vatAmount;

            // Update inventory
            accountingEngine.updateInventory(item.itemId, item.quantity, item.unitPrice);
        });

        const grossAmount = totalAmount + totalVAT;

        switch (data.stockInType) {
            case 'PURCHASE':
                // Dr 152/156 - Inventory
                entries.push({
                    account: data.items[0]?.inventoryAccount || '152',
                    name: 'Raw Materials / Goods',
                    debit: totalAmount,
                    credit: 0
                });
                // Dr 1331 - Input VAT
                if (totalVAT > 0) {
                    entries.push({
                        account: '1331',
                        name: 'Input VAT',
                        debit: totalVAT,
                        credit: 0
                    });
                }
                // Cr 331 - Payables
                entries.push({
                    account: '331',
                    name: 'Accounts Payable',
                    debit: 0,
                    credit: grossAmount
                });
                break;

            case 'PRODUCTION':
                // Dr 155 - Finished Goods / Cr 154 - WIP
                entries.push({
                    account: '155',
                    name: 'Finished Goods',
                    debit: totalAmount,
                    credit: 0
                });
                entries.push({
                    account: '154',
                    name: 'Work in Progress',
                    debit: 0,
                    credit: totalAmount
                });
                break;

            case 'RETURN':
                // Dr 156 - Goods / Cr 632 - COGS
                entries.push({
                    account: '156',
                    name: 'Goods',
                    debit: totalAmount,
                    credit: 0
                });
                entries.push({
                    account: '632',
                    name: 'Cost of Goods Sold',
                    debit: 0,
                    credit: totalAmount
                });
                break;
        }

        const document = {
            id: 'DOC' + Date.now(),
            docNumber,
            docType: 'PN',
            date: data.date,
            description: data.description || `Stock receipt - ${data.stockInType}`,
            warehouse: data.warehouse,
            partnerId: data.partnerId,
            partnerName: data.partnerName,
            items: data.items,
            totalAmount: grossAmount,
            status: 'POSTED'
        };

        const jeId = accountingEngine.postJournalEntry({
            date: data.date,
            documentId: docNumber,
            description: document.description,
            entries
        });

        document.journalEntryId = jeId;
        accountingEngine.addDocument(document);

        return {
            success: true,
            document,
            entries,
            explanation: `Stock receipt recorded.\nNet amount: ${accountingEngine.formatCurrency(totalAmount)}\nVAT: ${accountingEngine.formatCurrency(totalVAT)}\nTotal: ${accountingEngine.formatCurrency(grossAmount)}`,
            impact: [
                { type: 'inventory', text: `Inventory increased by ${accountingEngine.formatCurrency(totalAmount)}` },
                { type: 'payable', text: `Payables increased by ${accountingEngine.formatCurrency(grossAmount)}` }
            ]
        };
    },

    validateStockIn(data) {
        const errors = [];
        if (!data.date) errors.push('Document date is required');
        if (!data.stockInType) errors.push('Stock-in type is required');
        if (!data.warehouse) errors.push('Warehouse is required');
        if (!data.items || data.items.length === 0) errors.push('At least one item is required');
        if (data.stockInType === 'PURCHASE' && !data.partnerId) {
            errors.push('Vendor is required for purchase receipt');
        }
        return errors;
    },

    // ==========================================
    // STOCK OUT - Phiếu xuất kho
    // ==========================================
    createStockOut(data) {
        const errors = this.validateStockOut(data);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const docNumber = this.generateDocNumber('PX');
        const entries = [];
        let totalAmount = 0;

        // Process each item - using average cost
        data.items.forEach(item => {
            const itemInfo = accountingEngine.getItem(item.itemId);
            if (itemInfo && itemInfo.quantity > 0) {
                const avgCost = itemInfo.value / itemInfo.quantity;
                const lineAmount = item.quantity * avgCost;
                totalAmount += lineAmount;
                
                // Update inventory (decrease)
                accountingEngine.updateInventory(item.itemId, -item.quantity, avgCost);
            }
        });

        switch (data.stockOutType) {
            case 'SALES':
                // Dr 632 - COGS / Cr 156 - Goods
                entries.push({
                    account: '632',
                    name: 'Cost of Goods Sold',
                    debit: totalAmount,
                    credit: 0
                });
                entries.push({
                    account: '156',
                    name: 'Goods',
                    debit: 0,
                    credit: totalAmount
                });
                break;

            case 'PRODUCTION':
                // Dr 621 - Direct Materials / Cr 152 - Raw Materials
                entries.push({
                    account: '621',
                    name: 'Direct Materials',
                    debit: totalAmount,
                    credit: 0
                });
                entries.push({
                    account: '152',
                    name: 'Raw Materials',
                    debit: 0,
                    credit: totalAmount
                });
                break;

            case 'INTERNAL':
                // Dr 642 - Admin Expense / Cr 153 - Tools
                entries.push({
                    account: '6422',
                    name: 'Admin Material Expense',
                    debit: totalAmount,
                    credit: 0
                });
                entries.push({
                    account: '153',
                    name: 'Tools & Supplies',
                    debit: 0,
                    credit: totalAmount
                });
                break;
        }

        const document = {
            id: 'DOC' + Date.now(),
            docNumber,
            docType: 'PX',
            date: data.date,
            description: data.description || `Stock issue - ${data.stockOutType}`,
            warehouse: data.warehouse,
            items: data.items,
            totalAmount,
            status: 'POSTED'
        };

        const jeId = accountingEngine.postJournalEntry({
            date: data.date,
            documentId: docNumber,
            description: document.description,
            entries
        });

        document.journalEntryId = jeId;
        accountingEngine.addDocument(document);

        return {
            success: true,
            document,
            entries,
            explanation: `Stock issue recorded at average cost.\nTotal cost: ${accountingEngine.formatCurrency(totalAmount)}`,
            impact: [
                { type: 'inventory', text: `Inventory decreased by ${accountingEngine.formatCurrency(totalAmount)}` }
            ]
        };
    },

    validateStockOut(data) {
        const errors = [];
        if (!data.date) errors.push('Document date is required');
        if (!data.stockOutType) errors.push('Stock-out type is required');
        if (!data.warehouse) errors.push('Warehouse is required');
        if (!data.items || data.items.length === 0) errors.push('At least one item is required');
        return errors;
    },

    // ==========================================
    // JOURNAL ENTRY - Phiếu kế toán
    // ==========================================
    createJournalEntry(data) {
        const errors = this.validateJournalEntry(data);
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const docNumber = this.generateDocNumber('PKT');
        
        // Validate debit = credit
        const totalDebit = data.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
        const totalCredit = data.entries.reduce((sum, e) => sum + (e.credit || 0), 0);
        
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            return { success: false, errors: ['Debit and Credit must be equal'] };
        }

        const document = {
            id: 'DOC' + Date.now(),
            docNumber,
            docType: 'PKT',
            date: data.date,
            description: data.description,
            amount: totalDebit,
            status: 'POSTED'
        };

        const jeId = accountingEngine.postJournalEntry({
            date: data.date,
            documentId: docNumber,
            description: data.description,
            entries: data.entries
        });

        document.journalEntryId = jeId;
        accountingEngine.addDocument(document);

        return {
            success: true,
            document,
            entries: data.entries,
            explanation: `Manual journal entry posted.\nTotal: ${accountingEngine.formatCurrency(totalDebit)}`,
            impact: []
        };
    },

    validateJournalEntry(data) {
        const errors = [];
        if (!data.date) errors.push('Document date is required');
        if (!data.description) errors.push('Description is required');
        if (!data.entries || data.entries.length === 0) errors.push('At least one entry is required');
        return errors;
    }
};

// Export for use
window.MISAModule = MISAModule;


