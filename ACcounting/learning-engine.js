/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LEARNING ENGINE - Context-Aware Accounting Education
 * ═══════════════════════════════════════════════════════════════════════════
 * Manages lesson scripts, step-by-step guidance, and deep-dive explanations
 */

class LearningEngine {
    constructor() {
        this.currentLesson = null;
        this.currentStep = 0;
        this.lessonHistory = [];
        this.userProgress = this.loadProgress();
        
        // Subscribe to events
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!window.eventBus) return;
        
        // Listen for view changes
        window.eventBus.on(window.AppEvents.VIEW_CHANGED, (event) => {
            this.onViewChanged(event.data);
        });
        
        // Listen for form events
        window.eventBus.on(window.AppEvents.FORM_OPENED, (event) => {
            this.onFormOpened(event.data);
        });
        
        // Listen for posting events
        window.eventBus.on(window.AppEvents.POSTING_SUCCESS, (event) => {
            this.onPostingSuccess(event.data);
        });
        
        window.eventBus.on(window.AppEvents.POSTING_FAILED, (event) => {
            this.onPostingFailed(event.data);
        });
        
        // Listen for validation events
        window.eventBus.on(window.AppEvents.VALIDATE_FAILED, (event) => {
            this.onValidationFailed(event.data);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // LESSON MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Get lesson by ID
     */
    getLesson(lessonId) {
        return LessonRegistry[lessonId] || null;
    }

    /**
     * Start a lesson
     */
    startLesson(lessonId) {
        const lesson = this.getLesson(lessonId);
        if (!lesson) {
            console.error(`Lesson ${lessonId} not found`);
            return false;
        }

        this.currentLesson = lesson;
        this.currentStep = 0;

        // Emit event
        if (window.eventBus) {
            window.eventBus.emit(window.AppEvents.LESSON_STARTED, {
                lessonId,
                lessonTitle: lesson.title,
                totalSteps: lesson.steps.length
            });
        }

        return true;
    }

    /**
     * Get current step
     */
    getCurrentStep() {
        if (!this.currentLesson) return null;
        return this.currentLesson.steps[this.currentStep] || null;
    }

    /**
     * Move to next step
     */
    nextStep() {
        if (!this.currentLesson) return false;
        
        if (this.currentStep < this.currentLesson.steps.length - 1) {
            this.currentStep++;
            
            if (window.eventBus) {
                window.eventBus.emit(window.AppEvents.LESSON_STEP, {
                    step: this.currentStep,
                    stepData: this.getCurrentStep()
                });
            }
            
            return true;
        }
        
        return this.completeLesson();
    }

    /**
     * Move to previous step
     */
    prevStep() {
        if (!this.currentLesson || this.currentStep <= 0) return false;
        
        this.currentStep--;
        
        if (window.eventBus) {
            window.eventBus.emit(window.AppEvents.LESSON_STEP, {
                step: this.currentStep,
                stepData: this.getCurrentStep()
            });
        }
        
        return true;
    }

    /**
     * Complete current lesson
     */
    completeLesson() {
        if (!this.currentLesson) return false;

        const lessonId = this.currentLesson.id;
        
        // Track completion
        if (!this.userProgress.completedLessons.includes(lessonId)) {
            this.userProgress.completedLessons.push(lessonId);
            this.saveProgress();
        }

        // Add to history
        this.lessonHistory.push({
            lessonId,
            completedAt: new Date().toISOString()
        });

        if (window.eventBus) {
            window.eventBus.emit(window.AppEvents.LESSON_COMPLETED, {
                lessonId,
                lessonTitle: this.currentLesson.title
            });
        }

        this.currentLesson = null;
        this.currentStep = 0;

        return true;
    }

    /**
     * End lesson without completing
     */
    endLesson() {
        this.currentLesson = null;
        this.currentStep = 0;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EVENT HANDLERS - Context-Aware Help
    // ═══════════════════════════════════════════════════════════════════════════

    onViewChanged(data) {
        // Offer contextual help based on current view
        const viewHelp = this.getViewHelp(data.view);
        if (viewHelp && window.accountingBot) {
            // Don't interrupt active lessons
            if (!this.currentLesson) {
                // Could show subtle hint instead of full message
            }
        }
    }

    onFormOpened(data) {
        const formHelp = this.getFormHelp(data.formType);
        if (formHelp) {
            // Store for reference
            this.currentFormHelp = formHelp;
        }
    }

    onPostingSuccess(data) {
        // Generate FS impact analysis
        if (window.fsImpactAnalyzer && data.journalEntry) {
            const impact = window.fsImpactAnalyzer.analyzeImpact(data.journalEntry);
            
            // Emit for assistant to display
            if (window.eventBus) {
                window.eventBus.emit(window.AppEvents.EXPLANATION_SHOWN, {
                    type: 'fs_impact',
                    impact,
                    explanation: window.fsImpactAnalyzer.getTeachingExplanation(impact)
                });
            }
        }
    }

    onPostingFailed(data) {
        // Provide remediation suggestions
        const remediation = this.getRemediationSuggestion(data.error);
        
        if (window.eventBus) {
            window.eventBus.emit(window.AppEvents.HINT_SHOWN, {
                type: 'error_remediation',
                error: data.error,
                suggestion: remediation
            });
        }
    }

    onValidationFailed(data) {
        const hint = this.getValidationHint(data.field, data.error);
        
        if (window.eventBus) {
            window.eventBus.emit(window.AppEvents.HINT_SHOWN, {
                type: 'validation',
                field: data.field,
                hint
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // CONTEXTUAL HELP
    // ═══════════════════════════════════════════════════════════════════════════

    getViewHelp(view) {
        const viewHelps = {
            'cash': {
                title: 'Cash Management',
                description: 'Record cash receipts (money in) and payments (money out).',
                keyActions: ['Cash Receipt - Dr Cash, Cr Revenue/Receivables', 'Cash Payment - Dr Expense/Payables, Cr Cash'],
                commonMistakes: ['Forgetting to select receipt/payment type', 'Wrong account selection'],
                relatedLessons: ['cash_receipt', 'cash_payment']
            },
            'inventory': {
                title: 'Inventory Management',
                description: 'Track stock movements - receipts increase inventory, issues decrease it.',
                keyActions: ['Goods Receipt - Dr Inventory, Cr Payables/GR-IR', 'Goods Issue - Dr COGS/Production, Cr Inventory'],
                commonMistakes: ['Not recording VAT on purchases', 'Wrong cost calculation method'],
                relatedLessons: ['stock_in', 'stock_out']
            },
            'generalLedger': {
                title: 'General Ledger',
                description: 'Direct journal entries for transactions not captured by other modules.',
                keyActions: ['Journal Entry - Must balance (Debit = Credit)'],
                commonMistakes: ['Unbalanced entries', 'Wrong account classification'],
                relatedLessons: ['journal_entry']
            },
            'reportFinancial': {
                title: 'Financial Reports',
                description: 'View summarized financial position and performance.',
                keyActions: ['Trial Balance - Verify all accounts balance', 'Balance Sheet - Assets = Liabilities + Equity', 'Income Statement - Revenue - Expenses = Profit'],
                commonMistakes: ['Reading balances without understanding account nature'],
                relatedLessons: ['trial_balance', 'balance_sheet']
            }
        };
        
        return viewHelps[view] || null;
    }

    getFormHelp(formType) {
        const formHelps = {
            'cashReceipt': {
                title: 'Cash Receipt',
                purpose: 'Record cash received from customers, sales, or other sources.',
                journalEntry: {
                    debit: 'Cash (1111)',
                    credit: 'Depends on source: Revenue (511), Receivables (131), or Other'
                },
                steps: [
                    'Select receipt type (determines the credit account)',
                    'Choose customer if collecting receivables',
                    'Enter amount and description',
                    'Click Post to record'
                ],
                commonMistakes: [
                    'Selecting wrong receipt type',
                    'Forgetting VAT on cash sales'
                ],
                fsImpact: {
                    bs: 'Increases Cash (Asset), may decrease Receivables or increase Revenue-driven Equity',
                    is: 'May recognize Revenue if cash sale',
                    cf: 'Operating cash inflow'
                }
            },
            'cashPayment': {
                title: 'Cash Payment',
                purpose: 'Record cash paid for expenses, vendors, or other purposes.',
                journalEntry: {
                    debit: 'Depends on purpose: Expense (6xx), Payables (331), or Advances (141)',
                    credit: 'Cash (1111)'
                },
                steps: [
                    'Select payment type',
                    'Choose vendor if paying payables',
                    'Select expense account if applicable',
                    'Enter amount and description',
                    'Click Post'
                ],
                commonMistakes: [
                    'Wrong expense account classification',
                    'Paying without matching invoice'
                ],
                fsImpact: {
                    bs: 'Decreases Cash (Asset), may decrease Payables or increase Expense',
                    is: 'May increase Expenses reducing Profit',
                    cf: 'Operating cash outflow'
                }
            },
            'stockIn': {
                title: 'Goods Receipt',
                purpose: 'Record inventory received from purchase, production, or returns.',
                journalEntry: {
                    debit: 'Inventory (152/155/156) + Input VAT (1331)',
                    credit: 'Payables (331) or GR/IR Clearing'
                },
                steps: [
                    'Select receipt type (Purchase/Production/Return)',
                    'Choose warehouse and vendor',
                    'Add item lines with quantity and unit price',
                    'System calculates VAT automatically',
                    'Click Post'
                ],
                commonMistakes: [
                    'Wrong inventory account for item type',
                    'Incorrect VAT rate',
                    'Not matching with purchase order'
                ],
                fsImpact: {
                    bs: 'Increases Inventory (Asset), Increases Payables (Liability), Increases Input VAT (Asset)',
                    is: 'No immediate P&L impact until goods are sold/used',
                    cf: 'No cash impact until payment'
                }
            },
            'journalEntry': {
                title: 'Journal Entry',
                purpose: 'Record general accounting entries not handled by other modules.',
                journalEntry: {
                    debit: 'Must equal Credit total',
                    credit: 'Must equal Debit total'
                },
                steps: [
                    'Enter document date and description',
                    'Add debit account(s) and amount(s)',
                    'Add credit account(s) and amount(s)',
                    'Verify Debit = Credit',
                    'Click Post'
                ],
                commonMistakes: [
                    'Unbalanced entry (Debit ≠ Credit)',
                    'Wrong account selection',
                    'Posting to control accounts directly'
                ],
                fsImpact: {
                    bs: 'Depends on accounts used',
                    is: 'Depends on accounts used',
                    cf: 'Depends on whether cash accounts are involved'
                }
            }
        };
        
        return formHelps[formType] || null;
    }

    getRemediationSuggestion(error) {
        const suggestions = {
            'not balanced': 'Check that total Debit equals total Credit. Add or adjust entries to balance.',
            'period.*locked': 'This period is closed. Choose a date in an open period or contact admin to unlock.',
            'required': 'Fill in all required fields marked with *.',
            'invalid': 'Check the format and value of the highlighted field.'
        };

        for (const [pattern, suggestion] of Object.entries(suggestions)) {
            if (new RegExp(pattern, 'i').test(error)) {
                return suggestion;
            }
        }

        return 'Please check your input and try again.';
    }

    getValidationHint(field, error) {
        const hints = {
            'amount': 'Enter a positive number without currency symbols.',
            'date': 'Use format YYYY-MM-DD or select from calendar.',
            'account': 'Select an account from the dropdown list.',
            'partner': 'Select a business partner or create a new one first.'
        };

        return hints[field] || `Please correct the ${field} field.`;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PROGRESS TRACKING
    // ═══════════════════════════════════════════════════════════════════════════

    loadProgress() {
        const saved = localStorage.getItem('learningProgress');
        return saved ? JSON.parse(saved) : {
            completedLessons: [],
            viewedExplanations: [],
            lastActivity: null
        };
    }

    saveProgress() {
        this.userProgress.lastActivity = new Date().toISOString();
        localStorage.setItem('learningProgress', JSON.stringify(this.userProgress));
    }

    getProgress() {
        const totalLessons = Object.keys(LessonRegistry).length;
        const completed = this.userProgress.completedLessons.length;
        return {
            completed,
            total: totalLessons,
            percentage: totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// LESSON REGISTRY - All available lessons
// ═══════════════════════════════════════════════════════════════════════════

const LessonRegistry = {
    cash_receipt: {
        id: 'cash_receipt',
        title: 'Creating a Cash Receipt',
        description: 'Learn how to record cash received from customers or sales.',
        difficulty: 'beginner',
        duration: '5 min',
        steps: [
            {
                target: '.nav-item[onclick*="cash"]',
                instruction: 'Click **Cash Management** in the sidebar.',
                explanation: 'All cash transactions are managed in this module.',
                action: 'click'
            },
            {
                target: 'button[onclick*="cashReceipt"]',
                instruction: 'Click **Cash Receipt** button.',
                explanation: 'This opens the form to record incoming cash.',
                action: 'click'
            },
            {
                target: '[name="receiptType"]',
                instruction: 'Select the **Receipt Type**.',
                explanation: 'The type determines which account will be credited:\n- Customer Payment → Credits Receivables (131)\n- Sales Receipt → Credits Revenue (511)\n- Bank Withdrawal → Credits Bank (112)',
                action: 'select'
            },
            {
                target: '[name="amount"]',
                instruction: 'Enter the **Amount** received.',
                explanation: 'This is the cash amount in VND.',
                action: 'input'
            },
            {
                target: '[name="description"]',
                instruction: 'Add a **Description**.',
                explanation: 'A clear description helps identify this transaction later.',
                action: 'input'
            },
            {
                target: 'button:contains("Post")',
                instruction: 'Click **Post** to record the transaction.',
                explanation: 'The system will:\n1. Create document number\n2. Generate journal entry\n3. Update account balances\n4. Show FS impact',
                action: 'click'
            }
        ],
        theory: {
            title: 'Understanding Cash Receipts',
            content: `
**Double-Entry Principle:**
Every cash receipt involves TWO accounts:
- DEBIT (↑) Cash account - money coming in
- CREDIT (↓) Source account - where it came from

**Common Journal Entries:**

| Receipt Type | Debit | Credit |
|--------------|-------|--------|
| Customer Payment | 1111 Cash | 131 Receivables |
| Cash Sale | 1111 Cash | 511 Revenue + 33311 VAT |
| Bank Withdrawal | 1111 Cash | 1121 Bank |

**Financial Statement Impact:**
- Balance Sheet: ↑ Cash (Current Asset)
- If from sales: ↑ Revenue → ↑ Equity
- Cash Flow: Operating inflow
            `
        }
    },

    cash_payment: {
        id: 'cash_payment',
        title: 'Creating a Cash Payment',
        description: 'Learn how to record cash paid for expenses or to vendors.',
        difficulty: 'beginner',
        duration: '5 min',
        steps: [
            {
                target: '.nav-item[onclick*="cash"]',
                instruction: 'Go to **Cash Management**.',
                action: 'click'
            },
            {
                target: 'button[onclick*="cashPayment"]',
                instruction: 'Click **Cash Payment** button.',
                explanation: 'Opens the payment recording form.',
                action: 'click'
            },
            {
                target: '[name="paymentType"]',
                instruction: 'Select **Payment Type**.',
                explanation: 'Determines the debit account:\n- Vendor Payment → Debits Payables\n- Expense → Debits Expense account\n- Bank Deposit → Debits Bank',
                action: 'select'
            },
            {
                target: '[name="amount"]',
                instruction: 'Enter the **Amount** paid.',
                action: 'input'
            },
            {
                target: 'button:contains("Post")',
                instruction: 'Click **Post** to record.',
                explanation: 'Creates: Dr Expense/Payables, Cr Cash',
                action: 'click'
            }
        ],
        theory: {
            title: 'Understanding Cash Payments',
            content: `
**Journal Entry Pattern:**
- DEBIT: Expense or Payables (what you paid for)
- CREDIT: Cash (money going out)

**Impact Analysis:**
- ↓ Cash (Asset)
- ↓ Payables (if paying vendor) OR
- ↑ Expenses (if direct expense)

**Control Point:**
In Production mode, ensure payments match approved invoices.
            `
        }
    },

    stock_in: {
        id: 'stock_in',
        title: 'Recording Goods Receipt',
        description: 'Learn to record inventory received from purchases.',
        difficulty: 'intermediate',
        duration: '8 min',
        steps: [
            {
                target: '.nav-item[onclick*="inventory"]',
                instruction: 'Go to **Inventory** module.',
                action: 'click'
            },
            {
                target: 'button[onclick*="stockIn"]',
                instruction: 'Click **Goods Receipt**.',
                action: 'click'
            },
            {
                target: '[name="stockInType"]',
                instruction: 'Select receipt type (Purchase).',
                action: 'select'
            },
            {
                target: '[name="partnerId"]',
                instruction: 'Select the **Vendor**.',
                explanation: 'Links this receipt to vendor account for payables tracking.',
                action: 'select'
            },
            {
                target: '[name="items[0].itemId"]',
                instruction: 'Select **Item** to receive.',
                action: 'select'
            },
            {
                target: '[name="items[0].quantity"]',
                instruction: 'Enter **Quantity**.',
                action: 'input'
            },
            {
                target: '[name="items[0].unitPrice"]',
                instruction: 'Enter **Unit Price** (before VAT).',
                action: 'input'
            },
            {
                target: 'button:contains("Post")',
                instruction: 'Click **Post**.',
                explanation: 'Entry: Dr Inventory + Dr Input VAT / Cr Payables',
                action: 'click'
            }
        ],
        theory: {
            title: 'Inventory Accounting',
            content: `
**Purchase Entry (with VAT):**
- Dr 152/156 Inventory (net amount)
- Dr 1331 Input VAT (10%)
- Cr 331 Payables (gross amount)

**Inventory Valuation:**
System uses weighted average cost method:
New Avg Cost = (Old Value + New Purchase) / (Old Qty + New Qty)

**Three-Way Match (Control):**
In Production: PO → GR → Invoice should match.
            `
        }
    },

    journal_entry: {
        id: 'journal_entry',
        title: 'Manual Journal Entry',
        description: 'Learn to create direct accounting entries.',
        difficulty: 'intermediate',
        duration: '6 min',
        steps: [
            {
                target: '.nav-item[onclick*="generalLedger"]',
                instruction: 'Go to **General Ledger**.',
                action: 'click'
            },
            {
                target: 'button[onclick*="journalEntry"]',
                instruction: 'Click **Journal Entry**.',
                action: 'click'
            },
            {
                target: '[name="description"]',
                instruction: 'Enter a clear **Description**.',
                action: 'input'
            },
            {
                target: '[name="entries[0].debitAccount"]',
                instruction: 'Select **Debit Account**.',
                explanation: 'This account will INCREASE (for assets/expenses) or DECREASE (for liabilities/equity/revenue).',
                action: 'select'
            },
            {
                target: '[name="entries[0].creditAccount"]',
                instruction: 'Select **Credit Account**.',
                action: 'select'
            },
            {
                target: '[name="entries[0].amount"]',
                instruction: 'Enter **Amount**.',
                explanation: 'Same amount for both debit and credit to balance.',
                action: 'input'
            },
            {
                target: 'button:contains("Post")',
                instruction: 'Click **Post**.',
                explanation: 'System validates Debit = Credit before posting.',
                action: 'click'
            }
        ],
        theory: {
            title: 'Double-Entry Bookkeeping',
            content: `
**The Golden Rule:**
\`Total Debits = Total Credits\` ALWAYS

**Account Types & Normal Balances:**
| Type | Normal Balance | Debit Effect | Credit Effect |
|------|----------------|--------------|---------------|
| Asset | Debit | Increase | Decrease |
| Liability | Credit | Decrease | Increase |
| Equity | Credit | Decrease | Increase |
| Revenue | Credit | Decrease | Increase |
| Expense | Debit | Increase | Decrease |

**Why Double-Entry?**
Ensures the accounting equation stays balanced:
**Assets = Liabilities + Equity**
            `
        }
    },

    trial_balance: {
        id: 'trial_balance',
        title: 'Understanding Trial Balance',
        description: 'Learn to read and verify the Trial Balance report.',
        difficulty: 'beginner',
        duration: '4 min',
        steps: [
            {
                target: '.nav-item[onclick*="reportFinancial"]',
                instruction: 'Go to **Financial Reports**.',
                action: 'click'
            },
            {
                target: '.report-card:contains("Trial Balance")',
                instruction: 'Click **Trial Balance**.',
                action: 'click'
            },
            {
                target: '.report-table',
                instruction: 'Review the report.',
                explanation: 'Each row shows an account with its debit and credit balances. Total Debit MUST equal Total Credit.',
                action: 'observe'
            }
        ],
        theory: {
            title: 'Trial Balance Explained',
            content: `
**Purpose:**
Verify that all journal entries are balanced before preparing financial statements.

**Structure:**
- Account Number & Name
- Period Debit/Credit movements
- Closing Debit/Credit balances

**What to Check:**
1. Total Debit = Total Credit (if not, there's an error)
2. Account balances make sense (no negative cash, etc.)
3. Unusual balances that need investigation

**Next Step:**
Trial Balance → Adjusting Entries → Financial Statements
            `
        }
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

window.learningEngine = new LearningEngine();
window.LessonRegistry = LessonRegistry;

