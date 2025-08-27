// Main Alpine.js Application for Analogy Game Facilitator

// Configure LocalForage
localforage.config({
    name: 'analogyGame',
    storeName: 'sessions'
});

// Sample company pairs data
const sampleCompanyPairs = [
    {
        id: 1,
        category: "Platform vs Integrated Product",
        companyA: {
            name: "Android",
            description: "Open platform ecosystem with multiple hardware partners",
            characteristics: ["Open platform", "Multiple partners", "Customizable", "Wide reach"]
        },
        companyB: {
            name: "Apple iOS",
            description: "Closed, integrated hardware-software ecosystem",
            characteristics: ["Closed ecosystem", "Integrated design", "Premium experience", "Controlled quality"]
        }
    },
    {
        id: 2,
        category: "Disruptive Innovation vs Operational Excellence",
        companyA: {
            name: "Tesla",
            description: "Revolutionary electric vehicle and energy company",
            characteristics: ["Disruptive innovation", "Electric first", "Software-defined", "Direct sales"]
        },
        companyB: {
            name: "Toyota",
            description: "Reliable, efficient automotive manufacturing excellence",
            characteristics: ["Operational excellence", "Lean manufacturing", "Reliability", "Dealer network"]
        }
    },
    {
        id: 3,
        category: "Brand-driven vs Price-driven",
        companyA: {
            name: "Nike",
            description: "Premium athletic brand with emotional connection",
            characteristics: ["Premium brand", "Emotional marketing", "Athlete endorsements", "Innovation focus"]
        },
        companyB: {
            name: "Decathlon",
            description: "Accessible sports equipment for everyone",
            characteristics: ["Value pricing", "Accessibility", "Wide range", "House brands"]
        }
    },
    {
        id: 4,
        category: "Niche Specialist vs Broad Generalist",
        companyA: {
            name: "VanMoof",
            description: "Premium smart e-bikes for urban professionals",
            characteristics: ["Niche focus", "Premium positioning", "Smart features", "Urban design"]
        },
        companyB: {
            name: "Gazelle",
            description: "Traditional Dutch bicycles for all segments",
            characteristics: ["Broad market", "Traditional design", "Multiple segments", "Established brand"]
        }
    }
];

// Main Alpine.js component
document.addEventListener('alpine:init', () => {
    Alpine.data('gameApp', () => ({
        // Loading state
        loading: true,
        
        // UI State
        currentPhase: 1,
        presentationMode: false,
        showSessionModal: false,
        showExportModal: false,
        saveStatus: 'saved',
        
        // Session data
        session: {
            sessionId: null,
            created: null,
            facilitator: '',
            teamName: '',
            participants: []
        },
        
        // Phase definitions
        phases: [
            { 
                title: 'Preference Round', 
                description: 'Quick company pair choices to reveal strategic preferences' 
            },
            { 
                title: 'Archetype Analysis', 
                description: 'Analyze patterns in winning companies to define strategic archetype' 
            },
            { 
                title: 'Decomposition', 
                description: 'Deep analysis of chosen forerunner company' 
            },
            { 
                title: 'Translation', 
                description: 'Translate insights into strategic hypotheses and actions' 
            }
        ],
        
        // Timer state
        timer: {
            duration: 15,
            remaining: 15,
            running: false,
            intervalId: null
        },
        
        // Phase 1: Preference Round
        phase1: {
            currentRound: 0,
            companyPairs: [...sampleCompanyPairs],
            results: []
        },
        
        // Phase 2: Archetype Analysis
        phase2: {
            patterns: '',
            archetype: ''
        },
        
        // UI state for Phase 2
        showGuidedPrompts: false,
        
        // Phase 3: Decomposition
        phase3: {
            forerunner: '',
            positiveAnalogies: [],
            negativeAnalogies: [],
            causalRelations: []
        },
        
        // Phase 4: Translation
        phase4: {
            hypotheses: [],
            actionItems: []
        },

        // Initialize application
        async init() {
            console.log('Initializing Analogy Game Facilitator...');
            
            // Initialize session data structure
            this.initializeSession();
            
            // Initialize Phase 1 results array
            this.initializePhase1Results();
            
            // Load existing session if available
            await this.loadSession();
            
            // Set up auto-save
            this.setupAutoSave();
            
            // Set up keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Simulate loading delay
            setTimeout(() => {
                this.loading = false;
            }, 1000);
        },

        // Session Management
        initializeSession() {
            this.session.sessionId = this.generateSessionId();
            this.session.created = new Date().toISOString();
        },

        generateSessionId() {
            return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        async loadSession() {
            try {
                const lastSession = await localforage.getItem('currentSession');
                if (lastSession) {
                    // Merge with current state, preserving structure
                    Object.assign(this.session, lastSession.session || {});
                    Object.assign(this.phase1, lastSession.phase1 || {});
                    Object.assign(this.phase2, lastSession.phase2 || {});
                    Object.assign(this.phase3, lastSession.phase3 || {});
                    Object.assign(this.phase4, lastSession.phase4 || {});
                    this.currentPhase = lastSession.currentPhase || 1;
                    this.timer.duration = lastSession.timer?.duration || 15;
                    
                    console.log('Loaded existing session:', lastSession.session.sessionId);
                }
            } catch (error) {
                console.warn('Could not load previous session:', error);
            }
        },

        async saveSession() {
            const sessionData = {
                session: this.session,
                currentPhase: this.currentPhase,
                timer: { duration: this.timer.duration },
                phase1: this.phase1,
                phase2: this.phase2,
                phase3: this.phase3,
                phase4: this.phase4,
                lastUpdated: new Date().toISOString()
            };
            
            try {
                await localforage.setItem('currentSession', sessionData);
                await localforage.setItem(this.session.sessionId, sessionData);
                this.saveStatus = 'saved';
                console.log('Session saved successfully');
            } catch (error) {
                console.error('Failed to save session:', error);
                this.saveStatus = 'error';
            }
        },

        setupAutoSave() {
            // Auto-save every 5 seconds if there are changes
            setInterval(() => {
                if (this.saveStatus === 'pending') {
                    this.saveSession();
                }
            }, 5000);
            
            // Mark as pending save on data changes
            this.$watch('phase1', () => { this.saveStatus = 'pending'; }, { deep: true });
            this.$watch('phase2', () => { this.saveStatus = 'pending'; }, { deep: true });
            this.$watch('phase3', () => { this.saveStatus = 'pending'; }, { deep: true });
            this.$watch('phase4', () => { this.saveStatus = 'pending'; }, { deep: true });
        },

        // Phase Navigation
        setCurrentPhase(phase) {
            this.currentPhase = phase;
            this.saveStatus = 'pending';
        },

        // Phase 1 Methods - Timer
        startTimer() {
            if (this.timer.running) return;
            
            this.timer.running = true;
            this.timer.intervalId = setInterval(() => {
                this.timer.remaining--;
                
                if (this.timer.remaining <= 0) {
                    this.pauseTimer();
                    this.playTimerSound();
                }
            }, 1000);
        },

        pauseTimer() {
            this.timer.running = false;
            if (this.timer.intervalId) {
                clearInterval(this.timer.intervalId);
                this.timer.intervalId = null;
            }
        },

        resetTimer() {
            this.pauseTimer();
            this.timer.remaining = this.timer.duration;
        },

        playTimerSound() {
            // Create a simple beep sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        },

        // Phase 1 Methods - Company Pairs
        initializePhase1Results() {
            this.phase1.results = this.phase1.companyPairs.map(() => ({
                votesA: 0,
                votesB: 0,
                winner: ''
            }));
        },

        adjustVote(company, amount) {
            const currentResult = this.phase1.results[this.phase1.currentRound];
            if (!currentResult) return;
            
            const key = company === 'A' ? 'votesA' : 'votesB';
            const newValue = Math.max(0, currentResult[key] + amount);
            currentResult[key] = newValue;
            
            // Determine winner
            if (currentResult.votesA > currentResult.votesB) {
                currentResult.winner = this.phase1.companyPairs[this.phase1.currentRound].companyA.name;
            } else if (currentResult.votesB > currentResult.votesA) {
                currentResult.winner = this.phase1.companyPairs[this.phase1.currentRound].companyB.name;
            } else {
                currentResult.winner = 'Tie';
            }
            
            this.saveStatus = 'pending';
        },

        nextRound() {
            if (this.phase1.currentRound < this.phase1.companyPairs.length - 1) {
                this.phase1.currentRound++;
                this.resetTimer();
                this.saveStatus = 'pending';
            }
        },

        previousRound() {
            if (this.phase1.currentRound > 0) {
                this.phase1.currentRound--;
                this.resetTimer();
                this.saveStatus = 'pending';
            }
        },

        // Phase 2 Methods
        getWinners() {
            return this.phase1.results
                .filter(result => result.winner && result.winner !== 'Tie')
                .map(result => result.winner);
        },

        applyArchetypeTemplate(templateType) {
            const templates = {
                disruptor: "We prefer organizations that challenge industry conventions through breakthrough innovation and technology. They prioritize rapid transformation over incremental improvement and create entirely new market categories.",
                premium: "We prefer organizations that build exceptional brand value through superior design, quality, and customer experience. They command premium pricing by creating emotional connections and aspirational positioning.",
                platform: "We prefer organizations that create ecosystems connecting multiple parties and derive value from network effects. They focus on orchestrating relationships rather than just delivering products.",
                integrated: "We prefer organizations that control the entire value chain to deliver seamless, end-to-end solutions. They prioritize cohesive user experiences over modular flexibility.",
                customer: "We prefer organizations that place deep customer understanding at the center of all strategic decisions. They build lasting relationships through personalization and exceptional service."
            };
            
            if (templates[templateType]) {
                this.phase2.archetype = templates[templateType];
                this.saveStatus = 'pending';
            }
        },

        // Phase 3 Methods
        addPositiveAnalogy() {
            this.phase3.positiveAnalogies.push({
                category: '',
                description: ''
            });
            this.saveStatus = 'pending';
        },

        removePositiveAnalogy(index) {
            this.phase3.positiveAnalogies.splice(index, 1);
            this.saveStatus = 'pending';
        },

        addNegativeAnalogy() {
            this.phase3.negativeAnalogies.push({
                category: '',
                description: ''
            });
            this.saveStatus = 'pending';
        },

        removeNegativeAnalogy(index) {
            this.phase3.negativeAnalogies.splice(index, 1);
            this.saveStatus = 'pending';
        },

        addCausalRelation() {
            this.phase3.causalRelations.push({
                factor: '',
                outcome: '',
                strength: 'medium'
            });
            this.saveStatus = 'pending';
        },

        removeCausalRelation(index) {
            this.phase3.causalRelations.splice(index, 1);
            this.saveStatus = 'pending';
        },

        // Phase 4 Methods
        addHypothesis() {
            this.phase4.hypotheses.push({
                statement: '',
                premise: '',
                conclusion: '',
                priority: 'medium',
                confidence: 'medium'
            });
            this.saveStatus = 'pending';
        },

        removeHypothesis(index) {
            this.phase4.hypotheses.splice(index, 1);
            this.saveStatus = 'pending';
        },

        applyHypothesisTemplate(templateType) {
            const templates = {
                platform: {
                    premise: "we build a platform that connects multiple stakeholders and creates network effects",
                    conclusion: "we will generate revenue from multiple sources and build sustainable competitive moats through ecosystem lock-in"
                },
                premium: {
                    premise: "we focus on premium positioning through superior design, quality, and brand experience",
                    conclusion: "we will command higher margins, build customer loyalty, and reduce price sensitivity"
                },
                ecosystem: {
                    premise: "we create a closed, integrated ecosystem of products and services",
                    conclusion: "we will increase customer lifetime value and create switching costs that protect market share"
                },
                innovation: {
                    premise: "we prioritize breakthrough innovation and first-mover advantage in emerging technologies",
                    conclusion: "we will capture new market categories and establish technology leadership before competitors"
                },
                customer: {
                    premise: "we place deep customer understanding and personalization at the center of all decisions",
                    conclusion: "we will achieve higher customer satisfaction, retention, and organic growth through referrals"
                }
            };
            
            if (templates[templateType]) {
                const template = templates[templateType];
                this.addHypothesis();
                const newHypothesis = this.phase4.hypotheses[this.phase4.hypotheses.length - 1];
                newHypothesis.premise = template.premise;
                newHypothesis.conclusion = template.conclusion;
                newHypothesis.statement = `IF ${template.premise}, THEN ${template.conclusion}.`;
                this.saveStatus = 'pending';
            }
        },

        addActionItem() {
            this.phase4.actionItems.push({
                task: '',
                owner: '',
                deadline: '',
                successCriteria: '',
                status: 'pending'
            });
            this.saveStatus = 'pending';
        },

        removeActionItem(index) {
            this.phase4.actionItems.splice(index, 1);
            this.saveStatus = 'pending';
        },

        // Export functionality
        async exportSession() {
            // Show export options modal instead of direct export
            this.showExportModal = true;
        },

        async exportJSON() {
            const sessionData = {
                session: this.session,
                phases: {
                    phase1: this.phase1,
                    phase2: this.phase2,
                    phase3: this.phase3,
                    phase4: this.phase4
                },
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(sessionData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            this.downloadFile(dataBlob, `analogy-game-session-${this.getFileName()}.json`);
            console.log('Session exported as JSON');
        },

        async exportMarkdown() {
            const markdown = this.generateMarkdownReport();
            const dataBlob = new Blob([markdown], { type: 'text/markdown' });
            
            this.downloadFile(dataBlob, `analogy-game-report-${this.getFileName()}.md`);
            console.log('Session exported as Markdown');
        },

        generateMarkdownReport() {
            const date = new Date().toLocaleDateString();
            const winners = this.getWinners();
            
            let markdown = `# Analogy Game Session Report

**Team:** ${this.session.teamName || 'Unnamed Team'}  
**Facilitator:** ${this.session.facilitator || 'Not specified'}  
**Date:** ${date}  
**Session ID:** ${this.session.sessionId}

---

## Phase 1: Preference Round Results

### Winning Companies
${winners.map(winner => `- ${winner}`).join('\n')}

### Detailed Results
| Round | Company A | Votes A | Company B | Votes B | Winner |
|-------|-----------|---------|-----------|---------|--------|
`;

            this.phase1.results.forEach((result, index) => {
                const pair = this.phase1.companyPairs[index];
                if (pair) {
                    markdown += `| ${index + 1} | ${pair.companyA.name} | ${result.votesA} | ${pair.companyB.name} | ${result.votesB} | **${result.winner}** |\n`;
                }
            });

            markdown += `

---

## Phase 2: Archetype Analysis

### Identified Patterns
${this.phase2.patterns || 'No patterns identified'}

### Strategic Archetype
${this.phase2.archetype || 'No archetype defined'}

---

## Phase 3: Decomposition Analysis

**Forerunner Company:** ${this.phase3.forerunner || 'Not selected'}

`;

            if (this.phase3.positiveAnalogies.length > 0) {
                markdown += `### Positive Analogies (Similarities)

`;
                this.phase3.positiveAnalogies.forEach((analogy, index) => {
                    markdown += `**${index + 1}. ${analogy.category || 'Category not specified'}**
${analogy.description || 'Description not provided'}

`;
                });
            }

            if (this.phase3.negativeAnalogies.length > 0) {
                markdown += `### Negative Analogies (Differences)

`;
                this.phase3.negativeAnalogies.forEach((analogy, index) => {
                    markdown += `**${index + 1}. ${analogy.category || 'Category not specified'}**
${analogy.description || 'Description not provided'}

`;
                });
            }

            if (this.phase3.causalRelations.length > 0) {
                markdown += `### Causal Relations

`;
                this.phase3.causalRelations.forEach((relation, index) => {
                    markdown += `**${index + 1}. ${relation.strength?.toUpperCase() || 'MEDIUM'} Causal Link**
- **Factor:** ${relation.factor || 'Not specified'}
- **Outcome:** ${relation.outcome || 'Not specified'}

`;
                });
            }

            markdown += `---

## Phase 4: Strategic Translation

`;

            if (this.phase4.hypotheses.length > 0) {
                markdown += `### Strategic Hypotheses

`;
                this.phase4.hypotheses.forEach((hypothesis, index) => {
                    markdown += `#### Hypothesis ${index + 1}
**Statement:** ${hypothesis.statement || 'Not formulated'}

**IF (Premise):** ${hypothesis.premise || 'Not defined'}

**THEN (Conclusion):** ${hypothesis.conclusion || 'Not defined'}

**Priority:** ${hypothesis.priority || 'Medium'} | **Confidence:** ${hypothesis.confidence || 'Medium'}

---

`;
                });
            }

            if (this.phase4.actionItems.length > 0) {
                markdown += `### Action Items

| # | Task | Owner | Deadline | Status |
|---|------|-------|----------|---------|
`;
                this.phase4.actionItems.forEach((action, index) => {
                    markdown += `| ${index + 1} | ${action.task || 'Not specified'} | ${action.owner || 'Not assigned'} | ${action.deadline || 'Not set'} | ${action.status || 'Pending'} |
`;
                });

                markdown += `

### Detailed Action Items

`;
                this.phase4.actionItems.forEach((action, index) => {
                    markdown += `#### Action ${index + 1}: ${action.task || 'Untitled Task'}
- **Owner:** ${action.owner || 'Not assigned'}
- **Deadline:** ${action.deadline || 'Not set'}
- **Success Criteria:** ${action.successCriteria || 'Not defined'}
- **Status:** ${action.status || 'Pending'}

`;
                });
            }

            markdown += `
---

*Report generated on ${new Date().toLocaleString()} by Analogy Game Facilitator*
`;

            return markdown;
        },

        getFileName() {
            const teamName = (this.session.teamName || 'unnamed').toLowerCase().replace(/[^a-z0-9]/g, '-');
            const date = new Date().toISOString().split('T')[0];
            return `${teamName}-${date}`;
        },

        downloadFile(blob, filename) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        // Session settings
        saveSessionSettings() {
            this.showSessionModal = false;
            this.resetTimer(); // Apply new timer duration
            this.saveStatus = 'pending';
        },

        // Keyboard shortcuts setup
        setupKeyboardShortcuts() {
            // Note: Using basic event listeners since hotkeys.js is loaded as ES module
            document.addEventListener('keydown', (e) => {
                // Only handle shortcuts when not in input fields
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                
                switch(e.key) {
                    case ' ':
                        e.preventDefault();
                        if (this.currentPhase === 1) {
                            if (this.timer.running) {
                                this.pauseTimer();
                            } else {
                                this.startTimer();
                            }
                        }
                        break;
                    case 'r':
                    case 'R':
                        if (this.currentPhase === 1) {
                            e.preventDefault();
                            this.resetTimer();
                        }
                        break;
                    case 'ArrowLeft':
                        if (this.currentPhase === 1) {
                            e.preventDefault();
                            this.previousRound();
                        }
                        break;
                    case 'ArrowRight':
                        if (this.currentPhase === 1) {
                            e.preventDefault();
                            this.nextRound();
                        }
                        break;
                    case '1':
                        if (this.currentPhase === 1) {
                            e.preventDefault();
                            this.adjustVote('A', 1);
                        }
                        break;
                    case '2':
                        if (this.currentPhase === 1) {
                            e.preventDefault();
                            this.adjustVote('B', 1);
                        }
                        break;
                }
            });
        }
    }));
});

// Additional utility functions
window.analogyGameUtils = {
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    },
    
    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString();
    },
    
    // Generate PDF report (placeholder for future implementation)
    generatePDFReport(sessionData) {
        console.log('PDF generation not yet implemented');
        // TODO: Implement with jsPDF
    }
};