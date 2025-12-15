/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ACCOUNTING CHATBOT ASSISTANT
 * ═══════════════════════════════════════════════════════════════════════════
 * Interactive floating assistant that guides users through the accounting software
 * Features: Move around screen, highlight elements, step-by-step tutorials
 */

class AccountingChatbot {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.isDragging = false;
        this.currentMode = 'guided'; // 'guided', 'assisted', 'explain'
        this.currentTutorial = null;
        this.currentStep = 0;
        this.position = { x: window.innerWidth - 400, y: window.innerHeight - 600 };
        this.dragOffset = { x: 0, y: 0 };
        this.highlightedElement = null;
        this.messageHistory = [];
        
        this.init();
    }

    init() {
        this.createChatbotUI();
        this.bindEvents();
        this.setupEventSubscriptions();
        this.showWelcomeMessage();
    }

    setupEventSubscriptions() {
        if (!window.eventBus) return;

        // Listen for posting success to show FS impact
        window.eventBus.on(window.AppEvents.POSTING_SUCCESS, (event) => {
            this.handlePostingSuccess(event.data);
        });

        // Listen for validation failures to offer help
        window.eventBus.on(window.AppEvents.VALIDATE_FAILED, (event) => {
            this.handleValidationFailed(event.data);
        });

        // Listen for explanation events from learning engine
        window.eventBus.on(window.AppEvents.EXPLANATION_SHOWN, (event) => {
            this.showFSImpactExplanation(event.data);
        });

        // Listen for hints
        window.eventBus.on(window.AppEvents.HINT_SHOWN, (event) => {
            this.showHint(event.data);
        });

        // Listen for view changes to offer contextual help
        window.eventBus.on(window.AppEvents.VIEW_CHANGED, (event) => {
            if (this.currentMode === 'assisted' && this.isOpen) {
                this.offerContextualHelp(event.data.view);
            }
        });
    }

    handlePostingSuccess(data) {
        if (!this.isOpen) return;
        
        // Show success message with FS impact
        if (window.fsImpactAnalyzer && data.journalEntry) {
            const impact = window.fsImpactAnalyzer.analyzeImpact(data.journalEntry);
            this.showFSImpactMessage(impact, data.journalEntry);
        }
    }

    handleValidationFailed(data) {
        if (!this.isOpen) return;
        
        this.addMessage('bot', 
            `⚠️ **Validation Error**\n\n${data.error}\n\nWould you like help fixing this?`,
            {
                actions: [
                    { id: 'explain-error', label: 'Explain Error' },
                    { id: 'dismiss', label: 'Dismiss' }
                ]
            }
        );
    }

    showFSImpactMessage(impact, journalEntry) {
        let message = '✅ **Transaction Posted Successfully!**\n\n';
        message += '**Journal Entry:**\n';
        
        journalEntry.entries.forEach(entry => {
            const drCr = entry.debit > 0 ? 'Dr' : 'Cr';
            const amount = entry.debit > 0 ? entry.debit : entry.credit;
            message += `• ${drCr} ${entry.account} ${entry.name}: ${this.formatCurrency(amount)}\n`;
        });
        
        message += '\n**Financial Statement Impact:**\n';
        message += impact.summary;
        
        this.addMessage('bot', message, {
            actions: [
                { id: 'show-detail-impact', label: 'Show Details' },
                { id: 'explain-entry', label: 'Why This Entry?' }
            ]
        });
    }

    showFSImpactExplanation(data) {
        if (!this.isOpen || !data.explanation) return;
        
        let message = '📊 **Deep Dive: Financial Impact**\n\n';
        message += data.explanation.bsImpact + '\n\n';
        message += data.explanation.isImpact + '\n\n';
        message += data.explanation.cfImpact;
        
        this.addMessage('bot', message);
    }

    showHint(data) {
        if (!this.isOpen) return;
        
        this.addMessage('bot', `💡 **Hint:** ${data.hint || data.suggestion}`);
    }

    offerContextualHelp(view) {
        if (window.learningEngine) {
            const viewHelp = window.learningEngine.getViewHelp(view);
            if (viewHelp) {
                this.addMessage('bot', 
                    `📍 **${viewHelp.title}**\n\n${viewHelp.description}\n\n` +
                    `Would you like a guided tutorial for this module?`,
                    {
                        actions: viewHelp.relatedLessons?.map(lesson => ({
                            id: `lesson-${lesson}`,
                            label: `Start ${lesson.replace('_', ' ')} tutorial`
                        })) || []
                    }
                );
            }
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
    }

    createChatbotUI() {
        // Create main container
        const container = document.createElement('div');
        container.id = 'chatbot-container';
        container.className = 'chatbot-container';
        container.innerHTML = `
            <div class="chatbot-bubble" id="chatbot-bubble">
                <div class="bubble-icon">?</div>
                <div class="bubble-pulse"></div>
            </div>
            
            <div class="chatbot-window" id="chatbot-window">
                <div class="chatbot-header" id="chatbot-header">
                    <div class="chatbot-title">
                        <span class="chatbot-avatar">AI</span>
                        <div class="chatbot-info">
                            <span class="chatbot-name">Accounting Assistant</span>
                            <span class="chatbot-status">Online • Ready to help</span>
                        </div>
                    </div>
                    <div class="chatbot-controls">
                        <button class="chatbot-btn" id="chatbot-minimize" title="Minimize">−</button>
                        <button class="chatbot-btn" id="chatbot-close" title="Close">×</button>
                    </div>
                </div>
                
                <div class="chatbot-mode-selector">
                    <button class="mode-btn active" data-mode="guided">Training</button>
                    <button class="mode-btn" data-mode="assisted">Assisted</button>
                    <button class="mode-btn" data-mode="explain">Explain</button>
                </div>
                
                <div class="chatbot-body" id="chatbot-body">
                    <div class="chatbot-messages" id="chatbot-messages">
                        <!-- Messages will be inserted here -->
                    </div>
                </div>
                
                <div class="chatbot-quick-actions" id="chatbot-quick-actions">
                    <div class="quick-actions-label">Quick Start:</div>
                    <div class="quick-actions-grid">
                        <button class="quick-action" data-action="tour">Full Tour</button>
                        <button class="quick-action" data-action="cash">Cash Receipt</button>
                        <button class="quick-action" data-action="journal">Journal Entry</button>
                        <button class="quick-action" data-action="report">Reports</button>
                    </div>
                </div>
                
                <div class="chatbot-input-area">
                    <input type="text" id="chatbot-input" placeholder="Ask me anything about accounting..." />
                    <button id="chatbot-send">Send</button>
                </div>
            </div>
            
            <div class="chatbot-pointer" id="chatbot-pointer">
                <div class="pointer-arrow"></div>
                <div class="pointer-label" id="pointer-label"></div>
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Create highlight overlay
        const highlight = document.createElement('div');
        highlight.id = 'chatbot-highlight';
        highlight.className = 'chatbot-highlight';
        document.body.appendChild(highlight);
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'chatbot-tooltip';
        tooltip.className = 'chatbot-tooltip';
        document.body.appendChild(tooltip);
    }

    bindEvents() {
        // Bubble click
        document.getElementById('chatbot-bubble').addEventListener('click', () => this.toggle());
        
        // Close/Minimize
        document.getElementById('chatbot-close').addEventListener('click', () => this.close());
        document.getElementById('chatbot-minimize').addEventListener('click', () => this.minimize());
        
        // Dragging
        const header = document.getElementById('chatbot-header');
        header.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
        
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setMode(e.target.dataset.mode));
        });
        
        // Quick actions
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e.target.dataset.action));
        });
        
        // Send message
        document.getElementById('chatbot-send').addEventListener('click', () => this.sendUserMessage());
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendUserMessage();
        });
        
        // Window resize
        window.addEventListener('resize', () => this.adjustPosition());
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbot-window');
        const bubble = document.getElementById('chatbot-bubble');
        
        if (this.isOpen) {
            window.classList.add('open');
            bubble.classList.add('hidden');
            this.isMinimized = false;
        } else {
            window.classList.remove('open');
            bubble.classList.remove('hidden');
        }
    }

    close() {
        this.isOpen = false;
        document.getElementById('chatbot-window').classList.remove('open');
        document.getElementById('chatbot-bubble').classList.remove('hidden');
        this.clearHighlight();
    }

    minimize() {
        this.isMinimized = !this.isMinimized;
        const window = document.getElementById('chatbot-window');
        window.classList.toggle('minimized', this.isMinimized);
    }

    startDrag(e) {
        if (e.target.closest('.chatbot-controls')) return;
        this.isDragging = true;
        const window = document.getElementById('chatbot-window');
        const rect = window.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        window.style.transition = 'none';
    }

    drag(e) {
        if (!this.isDragging) return;
        const window = document.getElementById('chatbot-window');
        const x = Math.max(0, Math.min(e.clientX - this.dragOffset.x, innerWidth - 380));
        const y = Math.max(0, Math.min(e.clientY - this.dragOffset.y, innerHeight - 100));
        window.style.left = x + 'px';
        window.style.top = y + 'px';
        window.style.right = 'auto';
        window.style.bottom = 'auto';
        this.position = { x, y };
    }

    stopDrag() {
        this.isDragging = false;
        document.getElementById('chatbot-window').style.transition = '';
    }

    adjustPosition() {
        const window = document.getElementById('chatbot-window');
        this.position.x = Math.min(this.position.x, innerWidth - 380);
        this.position.y = Math.min(this.position.y, innerHeight - 100);
        window.style.left = this.position.x + 'px';
        window.style.top = this.position.y + 'px';
    }

    setMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        const modeMessages = {
            'guided': "📚 **Training Mode** activated! I'll guide you step-by-step through each feature. Perfect for learning!",
            'assisted': "🤝 **Assisted Mode** activated! Work normally and I'll provide hints when you need them.",
            'explain': "🎓 **Explain Mode** activated! I'll explain the accounting theory behind every action you take."
        };
        
        this.addMessage('bot', modeMessages[mode]);
    }

    handleQuickAction(action) {
        const tutorials = {
            'tour': this.getFullTourTutorial(),
            'cash': this.getCashReceiptTutorial(),
            'journal': this.getJournalEntryTutorial(),
            'report': this.getReportsTutorial()
        };
        
        if (tutorials[action]) {
            this.startTutorial(tutorials[action]);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MESSAGE HANDLING
    // ═══════════════════════════════════════════════════════════════════════════

    addMessage(type, content, options = {}) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${type}`;
        
        let html = `<div class="message-content">${this.formatMessage(content)}</div>`;
        
        if (options.actions) {
            html += '<div class="message-actions">';
            options.actions.forEach(action => {
                html += `<button class="action-btn" data-action="${action.id}">${action.label}</button>`;
            });
            html += '</div>';
        }
        
        messageDiv.innerHTML = html;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Bind action buttons
        messageDiv.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleMessageAction(e.target.dataset.action));
        });
        
        this.messageHistory.push({ type, content, timestamp: Date.now() });
    }

    formatMessage(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    sendUserMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        if (!message) return;
        
        this.addMessage('user', message);
        input.value = '';
        
        // Process and respond
        setTimeout(() => this.processUserMessage(message), 500);
    }

    processUserMessage(message) {
        const lowerMsg = message.toLowerCase();
        
        // Keyword matching for common questions
        if (lowerMsg.includes('cash') || lowerMsg.includes('receipt') || lowerMsg.includes('payment')) {
            this.addMessage('bot', "Let me show you how to work with **cash transactions**!", {
                actions: [
                    { id: 'tutorial-cash', label: 'Start Cash Tutorial' },
                    { id: 'goto-cash', label: 'Go to Cash Module' }
                ]
            });
        } else if (lowerMsg.includes('journal') || lowerMsg.includes('entry')) {
            this.addMessage('bot', "**Journal entries** are the foundation of accounting! Would you like to learn how to create one?", {
                actions: [
                    { id: 'tutorial-journal', label: 'Start Journal Tutorial' },
                    { id: 'explain-journal', label: 'Explain Debits & Credits' }
                ]
            });
        } else if (lowerMsg.includes('report') || lowerMsg.includes('balance') || lowerMsg.includes('statement')) {
            this.addMessage('bot', "I can help you understand **financial reports**! Which report interests you?", {
                actions: [
                    { id: 'tutorial-report', label: 'Reports Overview' },
                    { id: 'explain-bs', label: 'Balance Sheet' },
                    { id: 'explain-is', label: 'Income Statement' }
                ]
            });
        } else if (lowerMsg.includes('help') || lowerMsg.includes('start') || lowerMsg.includes('begin')) {
            this.showWelcomeMessage();
        } else if (lowerMsg.includes('debit') || lowerMsg.includes('credit')) {
            this.explainDebitCredit();
        } else {
            this.addMessage('bot', "I understand you're asking about: **" + message + "**\n\nHere are some things I can help with:", {
                actions: [
                    { id: 'tour', label: 'Full Software Tour' },
                    { id: 'tutorial-cash', label: 'Cash Transactions' },
                    { id: 'tutorial-journal', label: 'Journal Entries' },
                    { id: 'tutorial-report', label: 'Financial Reports' }
                ]
            });
        }
    }

    handleMessageAction(action) {
        // Handle lesson actions from learning engine
        if (action.startsWith('lesson-')) {
            const lessonId = action.replace('lesson-', '');
            this.startLessonFromEngine(lessonId);
            return;
        }
        
        switch(action) {
            case 'tour':
            case 'tutorial-tour':
                this.startTutorial(this.getFullTourTutorial());
                break;
            case 'tutorial-cash':
                this.startLessonFromEngine('cash_receipt') || this.startTutorial(this.getCashReceiptTutorial());
                break;
            case 'goto-cash':
                navigate('cash');
                this.addMessage('bot', "Welcome to the **Cash Management** module! Here you can:\n• Create cash receipts\n• Record cash payments\n• View cash book reports");
                break;
            case 'tutorial-journal':
                this.startLessonFromEngine('journal_entry') || this.startTutorial(this.getJournalEntryTutorial());
                break;
            case 'explain-journal':
                this.explainDebitCredit();
                break;
            case 'tutorial-report':
                this.startLessonFromEngine('trial_balance') || this.startTutorial(this.getReportsTutorial());
                break;
            case 'explain-bs':
                this.explainBalanceSheet();
                break;
            case 'explain-is':
                this.explainIncomeStatement();
                break;
            case 'next-step':
                this.nextTutorialStep();
                break;
            case 'end-tutorial':
                this.endTutorial();
                break;
            case 'show-detail-impact':
                this.showDetailedFSImpact();
                break;
            case 'explain-entry':
                this.explainLastEntry();
                break;
            case 'dismiss':
                // Just dismiss, no action needed
                break;
        }
    }

    startLessonFromEngine(lessonId) {
        if (window.learningEngine && window.LessonRegistry && window.LessonRegistry[lessonId]) {
            window.learningEngine.startLesson(lessonId);
            const lesson = window.LessonRegistry[lessonId];
            
            // Convert learning engine lesson to chatbot tutorial format
            const tutorial = {
                title: lesson.title,
                description: lesson.description,
                steps: lesson.steps.map(step => ({
                    target: step.target,
                    message: `**${step.instruction}**\n\n${step.explanation || ''}`,
                    action: step.action
                }))
            };
            
            // Show theory if available
            if (lesson.theory) {
                this.addMessage('bot', `📖 **${lesson.theory.title}**\n\n${lesson.theory.content}`);
            }
            
            this.startTutorial(tutorial);
            return true;
        }
        return false;
    }

    showDetailedFSImpact() {
        // Get last journal entry and show detailed impact
        if (accountingEngine && accountingEngine.journalEntries.length > 0) {
            const lastEntry = accountingEngine.journalEntries[accountingEngine.journalEntries.length - 1];
            if (window.fsImpactAnalyzer) {
                const impact = window.fsImpactAnalyzer.analyzeImpact(lastEntry);
                const explanation = window.fsImpactAnalyzer.getTeachingExplanation(impact);
                
                let message = '📊 **Detailed Financial Impact:**\n\n';
                message += explanation.bsImpact + '\n\n';
                message += explanation.isImpact + '\n\n';
                message += explanation.cfImpact + '\n\n';
                message += explanation.accountingEquation;
                
                this.addMessage('bot', message);
            }
        }
    }

    explainLastEntry() {
        if (accountingEngine && accountingEngine.journalEntries.length > 0) {
            const lastEntry = accountingEngine.journalEntries[accountingEngine.journalEntries.length - 1];
            
            let message = '🎓 **Understanding This Entry:**\n\n';
            message += `**Description:** ${lastEntry.description}\n\n`;
            message += '**The Double-Entry Principle:**\n';
            message += 'Every transaction affects at least TWO accounts.\n\n';
            
            const debits = lastEntry.entries.filter(e => e.debit > 0);
            const credits = lastEntry.entries.filter(e => e.credit > 0);
            
            if (debits.length > 0) {
                message += '**DEBIT accounts** (what increases or what you spend):\n';
                debits.forEach(d => {
                    message += `• ${d.account} ${d.name}: ${this.formatCurrency(d.debit)}\n`;
                });
            }
            
            if (credits.length > 0) {
                message += '\n**CREDIT accounts** (what decreases or where money comes from):\n';
                credits.forEach(c => {
                    message += `• ${c.account} ${c.name}: ${this.formatCurrency(c.credit)}\n`;
                });
            }
            
            message += '\n**Key Insight:** Debits and Credits must always balance!';
            
            this.addMessage('bot', message);
        }
    }

    showWelcomeMessage() {
        this.addMessage('bot', 
            "👋 **Welcome to Accounting Assistant!**\n\n" +
            "I'm here to help you master this accounting software. I can:\n\n" +
            "• Guide you through features **step-by-step**\n" +
            "• Explain **accounting concepts** in simple terms\n" +
            "• Move around the screen to **show you exactly where to click**\n" +
            "• Answer your questions about **debits, credits, and financial reports**\n\n" +
            "What would you like to learn today?",
            {
                actions: [
                    { id: 'tour', label: '🎯 Full Tour' },
                    { id: 'tutorial-cash', label: '💵 Cash Transactions' },
                    { id: 'tutorial-journal', label: '📝 Journal Entry' }
                ]
            }
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TUTORIAL SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════

    startTutorial(tutorial) {
        this.currentTutorial = tutorial;
        this.currentStep = 0;
        this.addMessage('bot', `🎓 **Starting Tutorial: ${tutorial.title}**\n\n${tutorial.description}`);
        setTimeout(() => this.showTutorialStep(), 1000);
    }

    showTutorialStep() {
        if (!this.currentTutorial) return;
        
        const step = this.currentTutorial.steps[this.currentStep];
        if (!step) {
            this.completeTutorial();
            return;
        }
        
        // Clear previous highlight
        this.clearHighlight();
        
        // Add step message
        this.addMessage('bot', 
            `**Step ${this.currentStep + 1}/${this.currentTutorial.steps.length}**: ${step.instruction}` +
            (step.explanation ? `\n\n💡 *${step.explanation}*` : ''),
            {
                actions: [
                    { id: 'next-step', label: 'Next Step →' },
                    { id: 'end-tutorial', label: 'End Tutorial' }
                ]
            }
        );
        
        // Highlight target element
        if (step.target) {
            setTimeout(() => {
                this.highlightElement(step.target, step.instruction);
                if (step.action === 'navigate') {
                    navigate(step.navigateTo);
                }
            }, 500);
        }
        
        // Move chatbot to optimal position
        if (step.chatPosition) {
            this.moveTo(step.chatPosition);
        }
    }

    nextTutorialStep() {
        this.currentStep++;
        this.showTutorialStep();
    }

    completeTutorial() {
        this.clearHighlight();
        this.addMessage('bot', 
            `🎉 **Congratulations!** You've completed the "${this.currentTutorial.title}" tutorial!\n\n` +
            "You now know the basics. Practice makes perfect!\n\n" +
            "What would you like to learn next?",
            {
                actions: [
                    { id: 'tour', label: 'More Tutorials' },
                    { id: 'explain-journal', label: 'Accounting Concepts' }
                ]
            }
        );
        this.currentTutorial = null;
        this.currentStep = 0;
    }

    endTutorial() {
        this.clearHighlight();
        this.addMessage('bot', "Tutorial ended. Feel free to explore or ask me anything!");
        this.currentTutorial = null;
        this.currentStep = 0;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HIGHLIGHT & POINTER SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════

    highlightElement(selector, label) {
        const element = document.querySelector(selector);
        if (!element) {
            console.log('Element not found:', selector);
            return;
        }
        
        const rect = element.getBoundingClientRect();
        const highlight = document.getElementById('chatbot-highlight');
        const tooltip = document.getElementById('chatbot-tooltip');
        
        // Position highlight
        highlight.style.top = (rect.top - 8) + 'px';
        highlight.style.left = (rect.left - 8) + 'px';
        highlight.style.width = (rect.width + 16) + 'px';
        highlight.style.height = (rect.height + 16) + 'px';
        highlight.classList.add('active');
        
        // Position tooltip
        if (label) {
            tooltip.textContent = label;
            tooltip.style.top = (rect.bottom + 12) + 'px';
            tooltip.style.left = rect.left + 'px';
            tooltip.classList.add('active');
        }
        
        // Scroll into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        this.highlightedElement = element;
    }

    clearHighlight() {
        document.getElementById('chatbot-highlight').classList.remove('active');
        document.getElementById('chatbot-tooltip').classList.remove('active');
        this.highlightedElement = null;
    }

    moveTo(position) {
        const window = document.getElementById('chatbot-window');
        const positions = {
            'top-left': { x: 20, y: 80 },
            'top-right': { x: innerWidth - 400, y: 80 },
            'bottom-left': { x: 20, y: innerHeight - 550 },
            'bottom-right': { x: innerWidth - 400, y: innerHeight - 550 },
            'center': { x: (innerWidth - 380) / 2, y: (innerHeight - 500) / 2 }
        };
        
        const pos = positions[position] || positions['bottom-right'];
        window.style.left = pos.x + 'px';
        window.style.top = pos.y + 'px';
        window.style.right = 'auto';
        window.style.bottom = 'auto';
        this.position = pos;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // TUTORIALS DATA
    // ═══════════════════════════════════════════════════════════════════════════

    getFullTourTutorial() {
        return {
            title: 'Software Overview Tour',
            description: "Let me show you around the accounting software! This tour covers the main features.",
            steps: [
                {
                    instruction: "This is the **Dashboard** - your home screen showing key financial metrics at a glance.",
                    target: '.dashboard-grid',
                    explanation: "The cards show Cash, Bank balance, Receivables (money owed to you), and Payables (money you owe).",
                    chatPosition: 'top-right'
                },
                {
                    instruction: "The **sidebar** contains all modules organized by category: Transactions, Reports, and Master Data.",
                    target: '.sidebar',
                    explanation: "Click any menu item to access that module.",
                    chatPosition: 'top-right'
                },
                {
                    instruction: "**Quick Actions** let you jump directly to common tasks without navigating menus.",
                    target: '.quick-actions',
                    explanation: "These buttons open forms for the most frequently used transactions.",
                    chatPosition: 'top-left'
                },
                {
                    instruction: "**Recent Documents** shows your latest posted transactions for easy reference.",
                    target: '.recent-transactions',
                    explanation: "Click any row to view the full document details and journal entry.",
                    chatPosition: 'top-left'
                },
                {
                    instruction: "The **header** shows company info, current period, and mode switch.",
                    target: '.app-header',
                    explanation: "You can switch between MISA and SAP modes using the Switch Mode button.",
                    chatPosition: 'bottom-right'
                }
            ]
        };
    }

    getCashReceiptTutorial() {
        return {
            title: 'Creating a Cash Receipt',
            description: "Learn how to record money received from customers or other sources.",
            steps: [
                {
                    instruction: "First, click **Cash Management** in the sidebar to go to the cash module.",
                    target: '.nav-item',
                    action: 'navigate',
                    navigateTo: 'cash',
                    explanation: "All cash-related transactions are managed in this module.",
                    chatPosition: 'top-right'
                },
                {
                    instruction: "Now click **Cash Receipt** button to create a new receipt document.",
                    target: '.btn-primary',
                    explanation: "This opens a form to record incoming cash.",
                    chatPosition: 'top-right'
                },
                {
                    instruction: "Select the **Receipt Type** to specify the source of cash.",
                    target: null,
                    explanation: "Options include: Customer Payment (from AR), Sales Receipt (direct sale), Bank Withdrawal, etc.",
                    chatPosition: 'top-left'
                },
                {
                    instruction: "Enter the **Amount** received and add a **Description**.",
                    target: null,
                    explanation: "The description helps identify this transaction in reports later.",
                    chatPosition: 'top-left'
                },
                {
                    instruction: "Click **Post** to record the transaction and create the journal entry automatically.",
                    target: null,
                    explanation: "The system will debit Cash (increase) and credit the appropriate account based on receipt type.",
                    chatPosition: 'top-left'
                }
            ]
        };
    }

    getJournalEntryTutorial() {
        return {
            title: 'Creating a Journal Entry',
            description: "Learn how to record general accounting entries using debits and credits.",
            steps: [
                {
                    instruction: "Click **General Ledger** in the sidebar.",
                    target: '.nav-item',
                    action: 'navigate',
                    navigateTo: 'generalLedger',
                    explanation: "The General Ledger module handles all direct accounting entries.",
                    chatPosition: 'top-right'
                },
                {
                    instruction: "Click **Journal Entry** to create a new manual entry.",
                    target: '.btn-primary',
                    explanation: "Journal entries are the foundation of double-entry bookkeeping.",
                    chatPosition: 'top-right'
                },
                {
                    instruction: "Select a **Debit Account** - this is where value increases.",
                    target: null,
                    explanation: "Remember: Assets & Expenses increase with DEBIT. Liabilities, Equity & Revenue increase with CREDIT.",
                    chatPosition: 'top-left'
                },
                {
                    instruction: "Select a **Credit Account** - this is where value decreases or liability increases.",
                    target: null,
                    explanation: "Every transaction must have equal debits and credits - this is the golden rule!",
                    chatPosition: 'top-left'
                },
                {
                    instruction: "Enter the **Amount** (same for both debit and credit) and click **Post**.",
                    target: null,
                    explanation: "The system validates that debits equal credits before posting.",
                    chatPosition: 'top-left'
                }
            ]
        };
    }

    getReportsTutorial() {
        return {
            title: 'Viewing Financial Reports',
            description: "Learn how to generate and understand financial statements.",
            steps: [
                {
                    instruction: "Click **Financial Reports** in the sidebar.",
                    target: '.nav-item',
                    action: 'navigate',
                    navigateTo: 'reportFinancial',
                    explanation: "This section contains all standard financial statements.",
                    chatPosition: 'top-right'
                },
                {
                    instruction: "Choose a report type. Let's start with **Trial Balance**.",
                    target: '.report-card',
                    explanation: "The Trial Balance shows all account balances to verify debits equal credits.",
                    chatPosition: 'top-right'
                },
                {
                    instruction: "Review the report data. **Debit balances** are on the left, **Credit balances** on the right.",
                    target: null,
                    explanation: "If total debits don't equal total credits, there's an error in your books!",
                    chatPosition: 'top-left'
                },
                {
                    instruction: "Use **Print** or **Export Excel** buttons to save or share the report.",
                    target: '.report-toolbar',
                    explanation: "Reports can be printed for audit purposes or exported for further analysis.",
                    chatPosition: 'top-left'
                }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ACCOUNTING EXPLANATIONS
    // ═══════════════════════════════════════════════════════════════════════════

    explainDebitCredit() {
        this.addMessage('bot', 
            "📚 **Understanding Debits and Credits**\n\n" +
            "The **Golden Rule** of accounting:\n" +
            "`Debits = Credits` always!\n\n" +
            "**DEBIT increases:**\n" +
            "• Assets (Cash, Equipment, Inventory)\n" +
            "• Expenses (Rent, Salaries, Utilities)\n\n" +
            "**CREDIT increases:**\n" +
            "• Liabilities (Loans, Payables)\n" +
            "• Equity (Owner's Capital)\n" +
            "• Revenue (Sales, Service Income)\n\n" +
            "💡 **Tip:** Think of it as: DEBIT = Left side, CREDIT = Right side of the T-account.",
            {
                actions: [
                    { id: 'tutorial-journal', label: 'Practice with Journal Entry' }
                ]
            }
        );
    }

    explainBalanceSheet() {
        this.addMessage('bot',
            "📊 **Balance Sheet Explained**\n\n" +
            "The Balance Sheet shows your company's **financial position** at a specific date.\n\n" +
            "**Formula:** `Assets = Liabilities + Equity`\n\n" +
            "**Assets** - What you OWN:\n" +
            "• Cash, Bank accounts\n" +
            "• Accounts Receivable\n" +
            "• Inventory\n" +
            "• Equipment, Buildings\n\n" +
            "**Liabilities** - What you OWE:\n" +
            "• Accounts Payable\n" +
            "• Loans\n" +
            "• Taxes Payable\n\n" +
            "**Equity** - Owner's stake:\n" +
            "• Share Capital\n" +
            "• Retained Earnings"
        );
    }

    explainIncomeStatement() {
        this.addMessage('bot',
            "📈 **Income Statement Explained**\n\n" +
            "Also called **Profit & Loss Statement**. Shows profitability over a period.\n\n" +
            "**Formula:** `Net Profit = Revenue - Expenses`\n\n" +
            "**Revenue** - Money earned:\n" +
            "• Sales Revenue\n" +
            "• Service Income\n" +
            "• Interest Income\n\n" +
            "**Expenses** - Costs incurred:\n" +
            "• Cost of Goods Sold\n" +
            "• Salaries & Wages\n" +
            "• Rent & Utilities\n" +
            "• Depreciation\n\n" +
            "💡 **Tip:** Gross Profit = Revenue - COGS. Operating Profit = Gross Profit - Operating Expenses."
        );
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT-AWARE ASSISTANCE
// ═══════════════════════════════════════════════════════════════════════════

// Auto-detect screen changes and offer help
function setupContextualHelp() {
    // Monitor for view changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('content-view') && target.classList.contains('active')) {
                    offerContextualHelp(target.id);
                }
            }
        });
    });
    
    document.querySelectorAll('.content-view').forEach(view => {
        observer.observe(view, { attributes: true });
    });
}

function offerContextualHelp(viewId) {
    if (!window.accountingBot || window.accountingBot.currentTutorial) return;
    
    const helpMessages = {
        'cashView': "💡 **Tip:** In Cash Management, you can record receipts (money in) and payments (money out). Need a walkthrough?",
        'inventoryView': "💡 **Tip:** Here you can track stock movements. Goods Receipt increases inventory, Goods Issue decreases it.",
        'generalLedgerView': "💡 **Tip:** The General Ledger shows all journal entries. You can create manual entries here.",
        'chartOfAccountsView': "💡 **Tip:** The Chart of Accounts lists all accounts used for recording transactions.",
        'reportFinancialView': "💡 **Tip:** Financial reports summarize your company's performance. Try the Trial Balance first!"
    };
    
    if (helpMessages[viewId] && window.accountingBot.currentMode === 'assisted') {
        window.accountingBot.addMessage('bot', helpMessages[viewId]);
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.accountingBot = new AccountingChatbot();
        setupContextualHelp();
    }, 1000);
});


