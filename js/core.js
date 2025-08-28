// Core application logic and Alpine.js data structure
// Handles session management, data persistence, and app initialization

/**
 * Initialize LocalForage for data persistence with fallback drivers
 * @returns {Promise<boolean>} True if initialization successful
 * @throws {Error} If all storage drivers fail
 */
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
    return true;
  } catch (error) {
    console.error('Failed to initialize LocalForage:', error);
    throw error;
  }
};

/**
 * Create default session structure with initial data
 * @returns {Object} Default session object with all phases initialized
 */
const createDefaultSession = () => ({
  id: generateSessionId(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  teamName: '',
  facilitator: '',
  participants: null,
  currentPhase: 1,
  phase1: {
    votes: { companyA: 0, companyB: 0 },
    currentPairIndex: 0,
    timerLeft: 10,
    timerState: 'ready',
    totalVotes: 0,
    percentageA: 0,
    percentageB: 0,
    results: []
  },
  phase2: {
    archetype: '',
    patterns: [],
    keywords: []
  },
  phase3: {
    hypotheses: [],
    actionItems: []
  },
  settings: {
    timerDuration: 30,
    autoSave: true,
    autoSaveInterval: 5000
  }
});

/**
 * Generate unique session ID using timestamp and random string
 * @returns {string} Unique session identifier
 */
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Phase definitions
const phases = [
  {
    id: 1,
    title: 'Strategic Preference Round',
    description: 'Physical positioning exercise with strategic company pairs'
  },
  {
    id: 2,
    title: 'Archetype Analysis',
    description: 'Analyze patterns in preferences and define strategic archetype'
  },
  {
    id: 3,
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
    
    // Phase 1 specific data - Strategic Preference Round (initialized from phase2.js)
    phase1: null,
    
    // Phase 2 specific data - Archetype Analysis
    phase2: {
      archetype: '',
      patterns: [],
      keywords: []
    },
    
    // Phase 3 specific data - Strategic Translation
    phase3: {
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
    
    /**
     * Initialize the application including storage, phases, and UI
     * @async
     */
    async init() {
      
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
        
        // Initialize Phase 1 functionality (strategic pairs from phase2.js)
        if (window.initializePhase2) {
          try {
            this.phase1 = await window.initializePhase2();
            // Load Phase 1 state if it exists
            if (this.session.phase1) {
              this.phase1.loadState(this.session.phase1);
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
        
        // Application initialized successfully
        
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
        } else {
          // Creating new session
          // Sync default data to phase data
          this.syncSessionToPhaseData();
          await this.saveSession();
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      }
    },
    
    /**
     * Save current session to local storage with verification
     * @async
     * @throws {Error} If save operation fails
     */
    async saveSession() {
      try {
        this.updateSessionFromPhaseData();
        this.session.updatedAt = new Date().toISOString();
        
        // Save session data
        
        // Create a clean serializable copy of the session data
        const sessionToSave = JSON.parse(JSON.stringify(this.session));
        
        await localforage.setItem('current-session', sessionToSave);
        
        // Verify the save worked
        const verification = await localforage.getItem('current-session');
        if (verification && verification.id === this.session.id) {
          this.saveStatus = 'saved';
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
      // Phase1 is initialized from phase2.js
      if (this.session.phase2) {
        this.phase2 = this.deepMerge(this.phase2, this.session.phase2);
      }
      if (this.session.phase3) {
        this.phase3 = this.deepMerge(this.phase3, this.session.phase3);
      }
      
      this.timer.duration = this.session.settings.timerDuration;
    },
    
    updateSessionFromPhaseData() {
      // Update session object from reactive phase data with deep copy
      this.session.currentPhase = this.currentPhase;
      
      // Handle Phase 1 data (strategic pairs) - complex object from phase2.js
      if (this.phase1 && this.phase1.getState) {
        this.session.phase1 = this.phase1.getState();
      } else if (this.phase1) {
        this.session.phase1 = JSON.parse(JSON.stringify(this.phase1));
      }
      
      this.session.phase2 = JSON.parse(JSON.stringify(this.phase2));
      this.session.phase3 = JSON.parse(JSON.stringify(this.phase3));
      this.session.settings.timerDuration = this.timer.duration;
    },
    
    async loadCompanyPairs() {
      // Strategic pairs are now loaded from strategic-pairs.json in phase2.js
      // This method is kept for compatibility but no longer loads company-pairs.json
      console.log('Company pairs loading handled by Phase 1 (strategic pairs) module');
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
      if (phase >= 1 && phase <= 3) {
        this.currentPhase = phase;
        this.markUnsaved();
      }
    },
    
    // Phase 1 methods are now handled by the strategic pairs module (phase2.js)
    
    getWinners() {
      // Get winners from strategic pairs results
      if (this.phase1 && this.phase1.getWinners) {
        return this.phase1.getWinners();
      }
      return [];
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
    
    // Phase 3: Strategic Translation Methods
    addHypothesis() {
      this.phase3.hypotheses.push({
        premise: '',
        conclusion: '',
        statement: '',
        priority: 'medium',
        confidence: 'medium'
      });
      this.markUnsaved();
    },
    
    removeHypothesis(index) {
      this.phase3.hypotheses.splice(index, 1);
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
      this.phase3.actionItems.push({
        task: '',
        owner: '',
        deadline: '',
        successCriteria: '',
        status: 'pending'
      });
      this.markUnsaved();
    },
    
    removeActionItem(index) {
      this.phase3.actionItems.splice(index, 1);
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
          
          // Reset current session to default state
          this.session = createDefaultSession();
          this.currentPhase = 1;
          
          // Reset Phase 1 if it exists
          if (this.phase1) {
            this.phase1 = await window.initializePhase2();
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
        
        // Reset Phase 1 if it exists
        if (this.phase1) {
          try {
            this.phase1 = await window.initializePhase2();
          } catch (error) {
            console.error('Error reinitializing Phase 1:', error);
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
              // Phase 1: Strategic pairs timer
              if (this.phase1?.timerState === 'ready') {
                this.phase1.startTimer();
              } else if (this.phase1?.timerState === 'countdown') {
                this.phase1.pauseTimer();
              }
            }
            break;
          case 'r':
          case 'R':
            e.preventDefault();
            if (this.currentPhase === 1) {
              this.phase1?.resetTimer();
            }
            break;
          case 'ArrowLeft':
            e.preventDefault();
            if (this.currentPhase === 1) {
              this.phase1?.previousPair();
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (this.currentPhase === 1) {
              this.phase1?.nextPair();
            }
            break;
          case 'a':
          case 'A':
            e.preventDefault();
            if (this.currentPhase === 1) {
              if (e.shiftKey) {
                this.phase1?.decreaseVoteA();
              } else {
                this.phase1?.voteA();
              }
            }
            break;
          case 'b':
          case 'B':
            e.preventDefault();
            if (this.currentPhase === 1) {
              if (e.shiftKey) {
                this.phase1?.decreaseVoteB();
              } else {
                this.phase1?.voteB();
              }
            }
            break;
          case 'n':
          case 'N':
            e.preventDefault();
            if (this.currentPhase === 1 && this.phase1?.timerState === 'discussion') {
              this.phase1.nextRound();
            }
            break;
          case '1':
            if (this.currentPhase === 1 && this.phase1?.voteA) {
              e.preventDefault();
              this.phase1.voteA();
            }
            break;
          case '2':
            if (this.currentPhase === 1 && this.phase1?.voteB) {
              e.preventDefault();
              this.phase1.voteB();
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