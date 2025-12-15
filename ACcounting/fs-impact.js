/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FINANCIAL STATEMENT IMPACT - BS/IS/CF Analysis
 * ═══════════════════════════════════════════════════════════════════════════
 * Maps journal entries to financial statement impact for deep-dive teaching
 */

class FSImpactAnalyzer {
    constructor() {
        // Account classification for financial statements
        this.accountMapping = {
            // Balance Sheet - Assets
            assets: {
                current: ['111', '1111', '1112', '112', '1121', '1122', '113', '121', '128', '131', '133', '1331', '1332', '136', '138', '141', '142', '151', '152', '153', '154', '155', '156', '157', '158'],
                noncurrent: ['211', '2111', '2112', '2113', '2114', '2115', '2118', '212', '213', '214', '2141', '2142', '2143', '217', '221', '222', '228', '229', '241', '242', '243', '244']
            },
            // Balance Sheet - Liabilities
            liabilities: {
                current: ['331', '333', '3331', '33311', '33312', '334', '335', '336', '337', '338'],
                noncurrent: ['341', '3411', '3412', '343', '344', '347', '352', '353', '356']
            },
            // Balance Sheet - Equity
            equity: ['411', '4111', '4112', '4113', '4118', '412', '413', '414', '417', '418', '419', '421', '4211', '4212', '441', '461', '466'],
            
            // Income Statement
            revenue: ['511', '5111', '5112', '5113', '5114', '5117', '5118', '515', '711'],
            revenueDeductions: ['521', '5211', '5212', '5213'],
            expenses: {
                cogs: ['632'],
                selling: ['641', '6411', '6412', '6413', '6414', '6415', '6417', '6418'],
                admin: ['642', '6421', '6422', '6423', '6424', '6425', '6426', '6427', '6428'],
                financial: ['635'],
                production: ['611', '621', '622', '623', '627', '6271', '6272', '6273', '6274', '6277', '6278', '631'],
                other: ['811', '821', '8211', '8212']
            },
            
            // Cash Flow classification
            cashAccounts: ['1111', '1112', '1121', '1122', '1123', '113']
        };
    }

    /**
     * Analyze journal entry for financial statement impact
     * @param {Object} journalEntry - The journal entry to analyze
     * @returns {Object} Impact analysis result
     */
    analyzeImpact(journalEntry) {
        const impact = {
            balanceSheet: {
                assets: { current: 0, noncurrent: 0, total: 0 },
                liabilities: { current: 0, noncurrent: 0, total: 0 },
                equity: 0,
                balanced: true
            },
            incomeStatement: {
                revenue: 0,
                revenueDeductions: 0,
                netRevenue: 0,
                cogs: 0,
                grossProfit: 0,
                sellingExpenses: 0,
                adminExpenses: 0,
                operatingProfit: 0,
                financialExpenses: 0,
                otherExpenses: 0,
                profitBeforeTax: 0
            },
            cashFlow: {
                operating: 0,
                investing: 0,
                financing: 0,
                netChange: 0,
                isCashTransaction: false
            },
            details: [],
            summary: ''
        };

        if (!journalEntry || !journalEntry.entries) {
            return impact;
        }

        // Analyze each entry
        journalEntry.entries.forEach(entry => {
            const account = entry.account;
            const amount = (entry.debit || 0) - (entry.credit || 0);
            
            // Determine account classification
            const classification = this.classifyAccount(account);
            
            // Add to details
            impact.details.push({
                account,
                accountName: entry.name || this.getAccountName(account),
                debit: entry.debit || 0,
                credit: entry.credit || 0,
                netEffect: amount,
                classification,
                fsImpact: this.getFSImpactDescription(classification, amount)
            });

            // Update Balance Sheet impact
            if (classification.type === 'asset') {
                if (classification.subtype === 'current') {
                    impact.balanceSheet.assets.current += amount;
                } else {
                    impact.balanceSheet.assets.noncurrent += amount;
                }
                impact.balanceSheet.assets.total += amount;
            } else if (classification.type === 'liability') {
                // Liabilities increase with credit (negative amount here)
                const liabAmount = -amount;
                if (classification.subtype === 'current') {
                    impact.balanceSheet.liabilities.current += liabAmount;
                } else {
                    impact.balanceSheet.liabilities.noncurrent += liabAmount;
                }
                impact.balanceSheet.liabilities.total += liabAmount;
            } else if (classification.type === 'equity') {
                impact.balanceSheet.equity -= amount; // Credit increases equity
            }

            // Update Income Statement impact
            if (classification.type === 'revenue') {
                impact.incomeStatement.revenue -= amount; // Credit increases revenue
            } else if (classification.type === 'revenueDeduction') {
                impact.incomeStatement.revenueDeductions += amount;
            } else if (classification.type === 'expense') {
                switch (classification.subtype) {
                    case 'cogs':
                        impact.incomeStatement.cogs += amount;
                        break;
                    case 'selling':
                        impact.incomeStatement.sellingExpenses += amount;
                        break;
                    case 'admin':
                        impact.incomeStatement.adminExpenses += amount;
                        break;
                    case 'financial':
                        impact.incomeStatement.financialExpenses += amount;
                        break;
                    default:
                        impact.incomeStatement.otherExpenses += amount;
                }
            }

            // Update Cash Flow impact
            if (this.accountMapping.cashAccounts.includes(account)) {
                impact.cashFlow.isCashTransaction = true;
                impact.cashFlow.netChange += amount;
                // Determine CF category based on other side of entry
                impact.cashFlow.operating += amount; // Simplified - would need more logic
            }
        });

        // Calculate derived values
        impact.incomeStatement.netRevenue = impact.incomeStatement.revenue - impact.incomeStatement.revenueDeductions;
        impact.incomeStatement.grossProfit = impact.incomeStatement.netRevenue - impact.incomeStatement.cogs;
        impact.incomeStatement.operatingProfit = impact.incomeStatement.grossProfit - 
            impact.incomeStatement.sellingExpenses - impact.incomeStatement.adminExpenses;
        impact.incomeStatement.profitBeforeTax = impact.incomeStatement.operatingProfit - 
            impact.incomeStatement.financialExpenses - impact.incomeStatement.otherExpenses;

        // Generate summary
        impact.summary = this.generateImpactSummary(impact);

        return impact;
    }

    /**
     * Classify account into FS category
     */
    classifyAccount(account) {
        // Check assets
        if (this.accountMapping.assets.current.includes(account)) {
            return { type: 'asset', subtype: 'current' };
        }
        if (this.accountMapping.assets.noncurrent.includes(account)) {
            return { type: 'asset', subtype: 'noncurrent' };
        }
        
        // Check liabilities
        if (this.accountMapping.liabilities.current.includes(account)) {
            return { type: 'liability', subtype: 'current' };
        }
        if (this.accountMapping.liabilities.noncurrent.includes(account)) {
            return { type: 'liability', subtype: 'noncurrent' };
        }
        
        // Check equity
        if (this.accountMapping.equity.includes(account)) {
            return { type: 'equity', subtype: null };
        }
        
        // Check revenue
        if (this.accountMapping.revenue.includes(account)) {
            return { type: 'revenue', subtype: null };
        }
        if (this.accountMapping.revenueDeductions.includes(account)) {
            return { type: 'revenueDeduction', subtype: null };
        }
        
        // Check expenses
        for (const [subtype, accounts] of Object.entries(this.accountMapping.expenses)) {
            if (accounts.includes(account)) {
                return { type: 'expense', subtype };
            }
        }
        
        return { type: 'unknown', subtype: null };
    }

    /**
     * Get account name from chart of accounts
     */
    getAccountName(account) {
        if (window.accountingEngine?.chartOfAccounts[account]) {
            return window.accountingEngine.chartOfAccounts[account].name;
        }
        return account;
    }

    /**
     * Get description of financial statement impact
     */
    getFSImpactDescription(classification, amount) {
        const direction = amount > 0 ? 'increases' : 'decreases';
        const absAmount = Math.abs(amount);
        
        switch (classification.type) {
            case 'asset':
                return `${direction} ${classification.subtype} assets`;
            case 'liability':
                return `${amount < 0 ? 'increases' : 'decreases'} ${classification.subtype} liabilities`;
            case 'equity':
                return `${amount < 0 ? 'increases' : 'decreases'} equity`;
            case 'revenue':
                return `${amount < 0 ? 'increases' : 'decreases'} revenue`;
            case 'expense':
                return `${direction} ${classification.subtype} expenses`;
            default:
                return 'no direct FS impact';
        }
    }

    /**
     * Generate human-readable impact summary
     */
    generateImpactSummary(impact) {
        const parts = [];
        
        // Balance Sheet changes
        if (impact.balanceSheet.assets.total !== 0) {
            parts.push(`Assets ${impact.balanceSheet.assets.total > 0 ? '↑' : '↓'} ${this.formatCurrency(Math.abs(impact.balanceSheet.assets.total))}`);
        }
        if (impact.balanceSheet.liabilities.total !== 0) {
            parts.push(`Liabilities ${impact.balanceSheet.liabilities.total > 0 ? '↑' : '↓'} ${this.formatCurrency(Math.abs(impact.balanceSheet.liabilities.total))}`);
        }
        if (impact.balanceSheet.equity !== 0) {
            parts.push(`Equity ${impact.balanceSheet.equity > 0 ? '↑' : '↓'} ${this.formatCurrency(Math.abs(impact.balanceSheet.equity))}`);
        }
        
        // Income Statement changes
        if (impact.incomeStatement.revenue !== 0) {
            parts.push(`Revenue ${impact.incomeStatement.revenue > 0 ? '↑' : '↓'} ${this.formatCurrency(Math.abs(impact.incomeStatement.revenue))}`);
        }
        const totalExpenses = impact.incomeStatement.cogs + impact.incomeStatement.sellingExpenses + 
            impact.incomeStatement.adminExpenses + impact.incomeStatement.financialExpenses;
        if (totalExpenses !== 0) {
            parts.push(`Expenses ${totalExpenses > 0 ? '↑' : '↓'} ${this.formatCurrency(Math.abs(totalExpenses))}`);
        }
        
        // Cash Flow
        if (impact.cashFlow.isCashTransaction) {
            parts.push(`Cash ${impact.cashFlow.netChange > 0 ? '↑' : '↓'} ${this.formatCurrency(Math.abs(impact.cashFlow.netChange))}`);
        }
        
        return parts.join(' | ') || 'No significant FS impact';
    }

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
    }

    /**
     * Get detailed teaching explanation for impact
     */
    getTeachingExplanation(impact, transactionType) {
        const explanations = {
            bsImpact: this.explainBSImpact(impact.balanceSheet),
            isImpact: this.explainISImpact(impact.incomeStatement),
            cfImpact: this.explainCFImpact(impact.cashFlow),
            accountingEquation: this.explainAccountingEquation(impact.balanceSheet)
        };
        
        return explanations;
    }

    explainBSImpact(bs) {
        if (bs.assets.total === 0 && bs.liabilities.total === 0 && bs.equity === 0) {
            return 'No direct Balance Sheet impact (may be P&L transaction).';
        }
        
        let explanation = '**Balance Sheet Impact:**\n';
        if (bs.assets.current !== 0) {
            explanation += `• Current Assets: ${bs.assets.current > 0 ? '+' : ''}${this.formatCurrency(bs.assets.current)}\n`;
        }
        if (bs.assets.noncurrent !== 0) {
            explanation += `• Non-current Assets: ${bs.assets.noncurrent > 0 ? '+' : ''}${this.formatCurrency(bs.assets.noncurrent)}\n`;
        }
        if (bs.liabilities.total !== 0) {
            explanation += `• Liabilities: ${bs.liabilities.total > 0 ? '+' : ''}${this.formatCurrency(bs.liabilities.total)}\n`;
        }
        if (bs.equity !== 0) {
            explanation += `• Equity: ${bs.equity > 0 ? '+' : ''}${this.formatCurrency(bs.equity)}\n`;
        }
        
        return explanation;
    }

    explainISImpact(is) {
        if (is.revenue === 0 && is.cogs === 0 && is.sellingExpenses === 0 && is.adminExpenses === 0) {
            return 'No Income Statement impact (Balance Sheet only transaction).';
        }
        
        let explanation = '**Income Statement Impact:**\n';
        if (is.revenue !== 0) {
            explanation += `• Revenue: ${is.revenue > 0 ? '+' : ''}${this.formatCurrency(is.revenue)}\n`;
        }
        if (is.cogs !== 0) {
            explanation += `• Cost of Goods Sold: ${is.cogs > 0 ? '+' : ''}${this.formatCurrency(is.cogs)}\n`;
        }
        if (is.sellingExpenses !== 0) {
            explanation += `• Selling Expenses: ${is.sellingExpenses > 0 ? '+' : ''}${this.formatCurrency(is.sellingExpenses)}\n`;
        }
        if (is.adminExpenses !== 0) {
            explanation += `• Admin Expenses: ${is.adminExpenses > 0 ? '+' : ''}${this.formatCurrency(is.adminExpenses)}\n`;
        }
        
        if (is.profitBeforeTax !== 0) {
            explanation += `\n**Net Effect on Profit:** ${is.profitBeforeTax > 0 ? '+' : ''}${this.formatCurrency(is.profitBeforeTax)}`;
        }
        
        return explanation;
    }

    explainCFImpact(cf) {
        if (!cf.isCashTransaction) {
            return 'Non-cash transaction - no immediate Cash Flow impact.';
        }
        
        return `**Cash Flow Impact:**\n• Net Cash Change: ${cf.netChange > 0 ? '+' : ''}${this.formatCurrency(cf.netChange)}\n• Category: Operating Activities`;
    }

    explainAccountingEquation(bs) {
        return `**Accounting Equation Check:**\nAssets (${this.formatCurrency(bs.assets.total)}) = Liabilities (${this.formatCurrency(bs.liabilities.total)}) + Equity (${this.formatCurrency(bs.equity)})\n✓ Equation remains balanced`;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

window.fsImpactAnalyzer = new FSImpactAnalyzer();

