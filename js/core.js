// Core application logic and Alpine.js data structure
// Handles session management, data persistence, and app initialization

// Initialize LocalForage for data persistence
const initializeStorage = async () => {
  localforage.config({
    driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
    name: 'analogy-game-facilitator',
    version: 1.0,
    storeName: 'sessions',
    description: 'Analogy Game Facilitator session data'
  });
  
  // Wait for LocalForage to be ready
  try {
    const driver = await localforage.driver();
    console.log('LocalForage initialized with driver:', driver);
    return true;
  } catch (error) {
    console.error('Failed to initialize LocalForage:', error);
    throw error;
  }
};

// Default session structure
const createDefaultSession = () => ({
  id: generateSessionId(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  teamName: '',
  facilitator: '',
  participants: null,
  currentPhase: 1,
  phase1: {
    currentRound: 0,
    companyPairs: [],
    results: [],
    winners: []
  },
  phase2: {
    votes: { companyA: 0, companyB: 0 },
    currentPairIndex: 0,
    timerLeft: 120,
    totalVotes: 0,
    percentageA: 0,
    percentageB: 0
  },
  phase3: {
    forerunner: '',
    positiveAnalogies: [],
    negativeAnalogies: [],
    causalRelations: []
  },
  phase4: {
    hypotheses: [],
    actionItems: []
  },
  settings: {
    timerDuration: 30,
    autoSave: true,
    autoSaveInterval: 5000
  }
});

// Generate unique session ID
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Phase definitions
const phases = [
  {
    id: 1,
    title: 'Preference Round',
    description: 'Vote on company pairs to identify preferences and establish winners'
  },
  {
    id: 2,
    title: 'Archetype Analysis',
    description: 'Analyze patterns in winning companies and define strategic archetype'
  },
  {
    id: 3,
    title: 'Decomposition Analysis',
    description: 'Deep dive into forerunner company with analogies and causal mapping'
  },
  {
    id: 4,
    title: 'Strategic Translation',
    description: 'Transform insights into actionable hypotheses and next steps'
  }
];

// Company pairs data - loaded from external file or default set
const defaultCompanyPairs = [
  {
    companyA: { name: 'Netflix', description: 'Streaming entertainment platform' },
    companyB: { name: 'Blockbuster', description: 'Traditional video rental stores' }
  },
  {
    companyA: { name: 'Uber', description: 'Ridesharing platform' },
    companyB: { name: 'Traditional Taxi', description: 'Conventional taxi services' }
  },
  {
    companyA: { name: 'Amazon', description: 'E-commerce and cloud platform' },
    companyB: { name: 'Barnes & Noble', description: 'Traditional bookstore chain' }
  },
  {
    companyA: { name: 'Tesla', description: 'Electric vehicle and energy company' },
    companyB: { name: 'Ford', description: 'Traditional automotive manufacturer' }
  },
  {
    companyA: { name: 'Airbnb', description: 'Home sharing platform' },
    companyB: { name: 'Hilton', description: 'Traditional hotel chain' }
  }
];

// Alpine.js application data and methods
document.addEventListener('alpine:init', () => {
  Alpine.data('gameApp', () => ({
    // App state
    loading: true,
    saveStatus: 'saved',
    autoSaveTimer: null,
    
    // Session data
    session: {},
    phases: phases,
    currentPhase: 1,
    
    // Modal states
    showSessionModal: false,
    showExportModal: false,
    presentationMode: false,
    showGuidedPrompts: false,
    
    // Phase 1 specific data
    phase1: {
      currentRound: 0,
      companyPairs: defaultCompanyPairs,
      results: Array(defaultCompanyPairs.length).fill().map(() => ({ 
        votesA: 0, 
        votesB: 0, 
        winner: null,
        duration: 30 
      }))
    },
    
    // Phase 2 specific data - initialized from phase2.js
    phase2: null,
    
    // Phase 3 specific data
    phase3: {
      forerunner: '',
      positiveAnalogies: [],
      negativeAnalogies: [],
      causalRelations: []
    },
    
    // Phase 4 specific data
    phase4: {
      hypotheses: [],
      actionItems: []
    },
    
    // Timer state
    timer: {
      running: false,
      remaining: 30,
      duration: 30,
      intervalId: null
    },
    
    // Initialization
    async init() {
      console.log('Initializing Analogy Game Facilitator...');
      
      try {
        // Initialize storage
        await initializeStorage();
        
        // Load company pairs from external file first (to set defaults)
        await this.loadCompanyPairs();
        
        // Create default session or load existing session
        this.session = createDefaultSession();
        await this.loadSession();
        
        // Initialize timer with session settings
        this.timer.duration = this.session.settings.timerDuration;
        this.timer.remaining = this.timer.duration;
        
        // Initialize Phase 2 functionality
        if (window.initializePhase2) {
          console.log('Initializing Phase 2...');
          try {
            this.phase2 = await window.initializePhase2();
            console.log('Phase 2 initialized:', this.phase2);
            // Load Phase 2 state if it exists
            if (this.session.phase2) {
              console.log('Loading Phase 2 saved state:', this.session.phase2);
              this.phase2.loadState(this.session.phase2);
            }
          } catch (error) {
            console.error('Failed to initialize Phase 2:', error);
            this.showError('Failed to load strategic pairs. Please check your connection and try again.');
          }
        } else {
          console.error('Phase 2 initialization function not found! Make sure phase2.js is loaded first.');
        }
        
        // Start auto-save if enabled
        if (this.session.settings.autoSave) {
          this.startAutoSave();
        }
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        console.log('Application initialized successfully', {
          sessionId: this.session.id,
          currentPhase: this.currentPhase,
          phase2Initialized: !!this.phase2
        });
        
      } catch (error) {
        console.error('Failed to initialize application:', error);
        this.showError('Failed to initialize application. Please refresh and try again.');
      }
      
      // Hide loading screen
      setTimeout(() => {
        this.loading = false;
      }, 500);
    },
    
    // Session Management
    async loadSession() {
      try {
        const savedSession = await localforage.getItem('current-session');
        if (savedSession) {
          // Deep merge saved session with default structure to preserve any new fields
          this.session = this.deepMerge(this.session, savedSession);
          this.syncSessionToPhaseData();
          console.log('Loaded existing session:', this.session.id);
        } else {
          console.log('Creating new session');
          // Sync default data to phase data
          this.syncSessionToPhaseData();
          await this.saveSession();
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      }
    },
    
    async saveSession() {
      try {
        this.updateSessionFromPhaseData();
        this.session.updatedAt = new Date().toISOString();
        
        console.log('Attempting to save session:', {
          sessionId: this.session.id,
          phase2Patterns: this.session.phase2?.patterns
        });
        
        // Create a clean serializable copy of the session data
        const sessionToSave = JSON.parse(JSON.stringify(this.session));
        
        await localforage.setItem('current-session', sessionToSave);
        
        // Verify the save worked
        const verification = await localforage.getItem('current-session');
        if (verification && verification.id === this.session.id) {
          this.saveStatus = 'saved';
          console.log('Session saved successfully and verified');
        } else {
          throw new Error('Save verification failed');
        }
      } catch (error) {
        console.error('Failed to save session:', error);
        this.saveStatus = 'error';
        throw error; // Re-throw to let callers know it failed
      }
    },
    
    syncSessionToPhaseData() {
      // Sync session data to phase-specific reactive data with deep merge
      this.currentPhase = this.session.currentPhase;
      
      // Deep merge phase data to preserve nested arrays and objects
      if (this.session.phase1) {
        this.phase1 = this.deepMerge(this.phase1, this.session.phase1);
      }
      if (this.session.phase2) {
        this.phase2 = this.deepMerge(this.phase2, this.session.phase2);
      }
      if (this.session.phase3) {
        this.phase3 = this.deepMerge(this.phase3, this.session.phase3);
      }
      if (this.session.phase4) {
        this.phase4 = this.deepMerge(this.phase4, this.session.phase4);
      }
      
      this.timer.duration = this.session.settings.timerDuration;
      
      console.log('Session synced to phase data', {
        currentPhase: this.currentPhase,
        phase2Patterns: this.phase2.patterns,
        phase3Forerunner: this.phase3.forerunner
      });
    },
    
    updateSessionFromPhaseData() {
      // Update session object from reactive phase data with deep copy
      this.session.currentPhase = this.currentPhase;
      this.session.phase1 = JSON.parse(JSON.stringify(this.phase1));
      
      // Handle Phase 2 data differently since it's a complex object
      if (this.phase2 && this.phase2.getState) {
        this.session.phase2 = this.phase2.getState();
      } else if (this.phase2) {
        this.session.phase2 = JSON.parse(JSON.stringify(this.phase2));
      }
      
      this.session.phase3 = JSON.parse(JSON.stringify(this.phase3));
      this.session.phase4 = JSON.parse(JSON.stringify(this.phase4));
      this.session.settings.timerDuration = this.timer.duration;
      
      console.log('Updated session from phase data', {
        phase2Votes: this.session.phase2?.votes || 'Not available',
        phase3Forerunner: this.session.phase3.forerunner
      });
    },
    
    async loadCompanyPairs() {
      try {
        const response = await fetch('./data/company-pairs.json');
        if (response.ok) {
          const data = await response.json();
          this.phase1.companyPairs = data.companyPairs || defaultCompanyPairs;
          
          // Only initialize results if they don't exist or are empty
          if (!this.phase1.results || this.phase1.results.length !== this.phase1.companyPairs.length) {
            this.phase1.results = Array(this.phase1.companyPairs.length).fill().map(() => ({ 
              votesA: 0, 
              votesB: 0, 
              winner: null,
              duration: 30 
            }));
          }
        }
      } catch (error) {
        console.warn('Could not load company pairs from file, using defaults');
        this.phase1.companyPairs = defaultCompanyPairs;
        
        // Only initialize results if they don't exist
        if (!this.phase1.results || this.phase1.results.length === 0) {
          this.phase1.results = Array(this.phase1.companyPairs.length).fill().map(() => ({ 
            votesA: 0, 
            votesB: 0, 
            winner: null,
            duration: 30 
          }));
        }
      }
    },
    
    startAutoSave() {
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer);
      }
      
      this.autoSaveTimer = setInterval(async () => {
        if (this.saveStatus !== 'saved') {
          await this.saveSession();
        }
      }, this.session.settings.autoSaveInterval);
    },
    
    markUnsaved() {
      this.saveStatus = 'saving...';
    },
    
    // Format time in MM:SS format
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    // Utility function for deep merging objects
    deepMerge(target, source) {
      const output = { ...target };
      
      if (this.isObject(target) && this.isObject(source)) {
        Object.keys(source).forEach(key => {
          if (Array.isArray(source[key])) {
            // For arrays, use the source array directly
            output[key] = [...source[key]];
          } else if (this.isObject(source[key])) {
            if (!(key in target)) {
              output[key] = source[key];
            } else {
              output[key] = this.deepMerge(target[key], source[key]);
            }
          } else {
            output[key] = source[key];
          }
        });
      }
      
      return output;
    },
    
    isObject(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    },
    
    // Phase Navigation
    setCurrentPhase(phase) {
      if (phase >= 1 && phase <= 4) {
        this.currentPhase = phase;
        this.markUnsaved();
      }
    },
    
    // Phase 1: Preference Round Methods
    previousRound() {
      if (this.phase1.currentRound > 0) {
        this.phase1.currentRound--;
        this.resetTimer();
        this.markUnsaved();
      }
    },
    
    nextRound() {
      if (this.phase1.currentRound < this.phase1.companyPairs.length - 1) {
        this.phase1.currentRound++;
        this.resetTimer();
        this.markUnsaved();
      }
    },
    
    adjustVote(company, delta) {
      const roundIndex = this.phase1.currentRound;
      const result = this.phase1.results[roundIndex];
      
      if (company === 'A') {
        result.votesA = Math.max(0, result.votesA + delta);
      } else if (company === 'B') {
        result.votesB = Math.max(0, result.votesB + delta);
      }
      
      // Determine winner
      if (result.votesA > result.votesB) {
        result.winner = this.phase1.companyPairs[roundIndex].companyA.name;
      } else if (result.votesB > result.votesA) {
        result.winner = this.phase1.companyPairs[roundIndex].companyB.name;
      } else {
        result.winner = null;
      }
      
      this.markUnsaved();
    },
    
    getWinners() {
      return this.phase1.results
        .map(result => result.winner)
        .filter(winner => winner !== null);
    },
    
    // Timer Methods
    startTimer() {
      if (!this.timer.running) {
        this.timer.running = true;
        this.timer.intervalId = setInterval(() => {
          if (this.timer.remaining > 0) {
            this.timer.remaining--;
          } else {
            this.pauseTimer();
          }
        }, 1000);
      }
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
    
    // Phase 2: Archetype Methods
    applyArchetypeTemplate(templateName) {
      const templates = {
        disruptor: {
          patterns: 'digital transformation, customer experience, efficiency gains',
          archetype: 'Companies that leverage technology to fundamentally transform traditional industries and create superior customer experiences.'
        },
        premium: {
          patterns: 'brand excellence, quality focus, premium positioning',
          archetype: 'Organizations that establish market leadership through superior quality, brand prestige, and premium customer experiences.'
        },
        platform: {
          patterns: 'network effects, ecosystem building, scalability',
          archetype: 'Companies that create value by connecting multiple parties and enabling interactions within their ecosystem.'
        },
        integrated: {
          patterns: 'end-to-end solutions, vertical integration, seamless experience',
          archetype: 'Organizations that control the entire value chain to deliver seamless, integrated solutions to customers.'
        },
        customer: {
          patterns: 'customer obsession, personalization, service excellence',
          archetype: 'Companies that build competitive advantage through deep customer understanding and exceptional service delivery.'
        }
      };
      
      if (templates[templateName]) {
        this.phase2.patterns = templates[templateName].patterns;
        this.phase2.archetype = templates[templateName].archetype;
        this.phase2.templateUsed = templateName;
        this.markUnsaved();
      }
    },
    
    // Phase 3: Decomposition Methods
    addPositiveAnalogy() {
      this.phase3.positiveAnalogies.push({
        category: '',
        description: ''
      });
      this.markUnsaved();
    },
    
    removePositiveAnalogy(index) {
      this.phase3.positiveAnalogies.splice(index, 1);
      this.markUnsaved();
    },
    
    addNegativeAnalogy() {
      this.phase3.negativeAnalogies.push({
        category: '',
        description: ''
      });
      this.markUnsaved();
    },
    
    removeNegativeAnalogy(index) {
      this.phase3.negativeAnalogies.splice(index, 1);
      this.markUnsaved();
    },
    
    addCausalRelation() {
      this.phase3.causalRelations.push({
        factor: '',
        outcome: '',
        strength: 'medium'
      });
      this.markUnsaved();
    },
    
    removeCausalRelation(index) {
      this.phase3.causalRelations.splice(index, 1);
      this.markUnsaved();
    },
    
    // Phase 4: Translation Methods
    addHypothesis() {
      this.phase4.hypotheses.push({
        premise: '',
        conclusion: '',
        statement: '',
        priority: 'medium',
        confidence: 'medium'
      });
      this.markUnsaved();
    },
    
    removeHypothesis(index) {
      this.phase4.hypotheses.splice(index, 1);
      this.markUnsaved();
    },
    
    applyHypothesisTemplate(templateName) {
      const templates = {
        platform: {
          premise: 'We build a platform that connects multiple stakeholders in our ecosystem',
          conclusion: 'We will achieve network effects and sustainable competitive advantage'
        },
        premium: {
          premise: 'We position our offering as a premium solution with superior quality',
          conclusion: 'We will command higher margins and build stronger customer loyalty'
        },
        ecosystem: {
          premise: 'We create an integrated ecosystem of complementary services',
          conclusion: 'We will increase customer lifetime value and reduce churn'
        },
        innovation: {
          premise: 'We invest heavily in R&D and innovation capabilities',
          conclusion: 'We will maintain technological leadership and market differentiation'
        },
        customer: {
          premise: 'We implement customer-centric design and personalization',
          conclusion: 'We will achieve higher engagement and customer satisfaction scores'
        }
      };
      
      if (templates[templateName] && this.phase4.hypotheses.length > 0) {
        const lastHypothesis = this.phase4.hypotheses[this.phase4.hypotheses.length - 1];
        lastHypothesis.premise = templates[templateName].premise;
        lastHypothesis.conclusion = templates[templateName].conclusion;
        lastHypothesis.statement = `IF ${templates[templateName].premise} THEN ${templates[templateName].conclusion}`;
        this.markUnsaved();
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
      this.markUnsaved();
    },
    
    removeActionItem(index) {
      this.phase4.actionItems.splice(index, 1);
      this.markUnsaved();
    },
    
    // Settings and Modal Methods
    saveSessionSettings() {
      this.session.updatedAt = new Date().toISOString();
      this.showSessionModal = false;
      this.markUnsaved();
    },
    
    // Export Methods
    exportSession() {
      this.showExportModal = true;
    },

    // Local Storage Management
    async clearLocalStorage() {
      if (confirm('Are you sure you want to clear all local storage? This will delete all saved sessions and cannot be undone.')) {
        try {
          await localforage.clear();
          console.log('Local storage cleared successfully');
          
          // Reset current session to default state
          this.session = createDefaultSession();
          this.currentPhase = 1;
          
          // Reset Phase 2 if it exists
          if (this.phase2) {
            this.phase2 = await window.initializePhase2();
          }
          
          // Reset timer
          this.timer.duration = this.session.settings.timerDuration;
          this.timer.remaining = this.timer.duration;
          this.resetTimer();
          
          alert('Local storage has been cleared. Starting with a fresh session.');
        } catch (error) {
          console.error('Error clearing local storage:', error);
          alert('Error clearing local storage: ' + error.message);
        }
      }
    },

    async resetCurrentSession() {
      if (confirm('Are you sure you want to reset the current session? All current progress will be lost.')) {
        // Reset current session to default state
        this.session = createDefaultSession();
        this.currentPhase = 1;
        
        // Reset Phase 2 if it exists
        if (this.phase2) {
          try {
            this.phase2 = await window.initializePhase2();
          } catch (error) {
            console.error('Error reinitializing Phase 2:', error);
          }
        }
        
        // Reset timer
        this.timer.duration = this.session.settings.timerDuration;
        this.timer.remaining = this.timer.duration;
        this.resetTimer();
        
        alert('Session has been reset.');
      }
    },
    
    exportJSON() {
      this.updateSessionFromPhaseData();
      const data = JSON.stringify(this.session, null, 2);
      this.downloadFile(data, `session-${this.session.id}.json`, 'application/json');
    },
    
    exportMarkdown() {
      this.updateSessionFromPhaseData();
      const markdown = this.generateMarkdownReport();
      this.downloadFile(markdown, `report-${this.session.id}.md`, 'text/markdown');
    },
    
    generateMarkdownReport() {
      const date = new Date().toLocaleDateString();
      const winners = this.getWinners().join(', ') || 'None';
      
      return `# Analogy Game Session Report
      
**Date:** ${date}
**Team:** ${this.session.teamName || 'Not specified'}
**Facilitator:** ${this.session.facilitator || 'Not specified'}

## Phase 1: Preference Round Results
**Winners:** ${winners}

## Phase 2: Strategic Archetype
**Patterns:** ${this.phase2.patterns || 'Not defined'}

**Archetype Definition:**
${this.phase2.archetype || 'Not defined'}

## Phase 3: Decomposition Analysis
**Forerunner:** ${this.phase3.forerunner || 'Not selected'}

**Positive Analogies:** ${this.phase3.positiveAnalogies.length}
**Negative Analogies:** ${this.phase3.negativeAnalogies.length} 
**Causal Relations:** ${this.phase3.causalRelations.length}

## Phase 4: Strategic Translation
**Hypotheses Created:** ${this.phase4.hypotheses.length}
**Action Items Planned:** ${this.phase4.actionItems.length}

---
*Generated by Analogy Game Facilitator*`;
    },
    
    downloadFile(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    
    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName.toLowerCase() === 'input' || 
            e.target.tagName.toLowerCase() === 'textarea') {
          return;
        }
        
        switch (e.key) {
          case ' ': // Spacebar - Start/Pause Timer
            e.preventDefault();
            if (this.currentPhase === 1) {
              if (this.timer.running) {
                this.pauseTimer();
              } else {
                this.startTimer();
              }
            } else if (this.currentPhase === 2) {
              // Phase 2: Start/Pause timer
              if (this.phase2?.timerState === 'ready') {
                this.phase2.startTimer();
              } else if (this.phase2?.timerState === 'countdown') {
                this.phase2.pauseTimer();
              }
            }
            break;
          case 'r':
          case 'R':
            e.preventDefault();
            if (this.currentPhase === 1) {
              this.resetTimer();
            } else if (this.currentPhase === 2) {
              this.phase2?.resetTimer();
            }
            break;
          case 'ArrowLeft':
            e.preventDefault();
            if (this.currentPhase === 2) {
              this.phase2?.previousPair();
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (this.currentPhase === 2) {
              this.phase2?.nextPair();
            }
            break;
          case 'a':
          case 'A':
            e.preventDefault();
            if (this.currentPhase === 2) {
              if (e.shiftKey) {
                this.phase2?.decreaseVoteA();
              } else {
                this.phase2?.voteA();
              }
            }
            break;
          case 'b':
          case 'B':
            e.preventDefault();
            if (this.currentPhase === 2) {
              if (e.shiftKey) {
                this.phase2?.decreaseVoteB();
              } else {
                this.phase2?.voteB();
              }
            }
            break;
          case 'n':
          case 'N':
            e.preventDefault();
            if (this.currentPhase === 2 && this.phase2?.timerState === 'discussion') {
              this.phase2.nextRound();
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
          case 'Delete':
            // Ctrl+Delete or Cmd+Delete to clear local storage
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              this.clearLocalStorage();
            }
            break;
        }
      });
    },
    
    // Error Handling
    showError(message) {
      // Simple error display - could be enhanced with a proper notification system
      console.error(message);
      alert(message);
    }
  }));
});