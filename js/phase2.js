/**
 * Phase 2: Preference Round
 * Handles company pair voting with timer functionality
 */

// Timer system for Phase 2
window.createTimer = function() {
  return {
    timeLeft: 120, // 2 minutes in seconds
    isRunning: false,
    isPaused: false,
    interval: null,
    originalTime: 120,

    start() {
      if (this.isRunning && !this.isPaused) return;
      
      this.isRunning = true;
      this.isPaused = false;
      
      this.interval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          
          // Update session data
          const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
          if (app) {
            app.phase2.timerLeft = this.timeLeft;
            app.markUnsaved();
          }
        } else {
          this.complete();
        }
      }, 1000);
    },

    pause() {
      if (!this.isRunning) return;
      
      this.isPaused = true;
      clearInterval(this.interval);
      this.interval = null;
    },

    reset() {
      this.isRunning = false;
      this.isPaused = false;
      this.timeLeft = this.originalTime;
      
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      
      // Update session data
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      if (app) {
        app.phase2.timerLeft = this.timeLeft;
        app.markUnsaved();
      }
      
      // Remove completion state
      document.querySelector('.timer-display')?.classList.remove('timer-completed');
    },

    complete() {
      this.isRunning = false;
      this.isPaused = false;
      this.timeLeft = 0;
      
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      
      // Add completion visual indicator
      document.querySelector('.timer-display')?.classList.add('timer-completed');
      
      // Update session data
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      if (app) {
        app.phase2.timerLeft = this.timeLeft;
        app.markUnsaved();
      }
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };
};

// Company pairs management
window.createCompanyPairs = function() {
  const pairs = [
    { companyA: 'Apple', companyB: 'Samsung' },
    { companyA: 'Google', companyB: 'Microsoft' },
    { companyA: 'Amazon', companyB: 'Alibaba' },
    { companyA: 'Tesla', companyB: 'Toyota' },
    { companyA: 'Netflix', companyB: 'Disney' },
    { companyA: 'Spotify', companyB: 'Apple Music' },
    { companyA: 'Uber', companyB: 'Lyft' },
    { companyA: 'Airbnb', companyB: 'Booking.com' },
    { companyA: 'Facebook', companyB: 'TikTok' },
    { companyA: 'Instagram', companyB: 'Snapchat' }
  ];

  return {
    pairs: pairs,
    currentIndex: 0,

    get currentPair() {
      return this.pairs[this.currentIndex] || { companyA: 'N/A', companyB: 'N/A' };
    },

    get pairCounter() {
      return `${this.currentIndex + 1} / ${this.pairs.length}`;
    },

    get canGoNext() {
      return this.currentIndex < this.pairs.length - 1;
    },

    get canGoPrev() {
      return this.currentIndex > 0;
    },

    nextPair() {
      if (this.canGoNext) {
        this.currentIndex++;
        
        // Load votes for the new pair
        const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
        if (app?.phase2?.votingSystem) {
          app.phase2.votingSystem.loadVotesForCurrentPair();
        }
        
        // Update session data
        if (app) {
          app.phase2.currentPairIndex = this.currentIndex;
          app.markUnsaved();
        }
      }
    },

    previousPair() {
      if (this.canGoPrev) {
        this.currentIndex--;
        
        // Load votes for the new pair
        const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
        if (app?.phase2?.votingSystem) {
          app.phase2.votingSystem.loadVotesForCurrentPair();
        }
        
        // Update session data
        if (app) {
          app.phase2.currentPairIndex = this.currentIndex;
          app.markUnsaved();
        }
      }
    },

    goToPair(index) {
      if (index >= 0 && index < this.pairs.length) {
        this.currentIndex = index;
        
        // Update session data
        const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
        if (app) {
          app.phase2.currentPairIndex = this.currentIndex;
          app.markUnsaved();
        }
      }
    }
  };
};

// Voting system for Phase 2
window.createVotingSystem = function() {
  return {
    // Store votes per pair: { 0: {companyA: 2, companyB: 1}, 1: {companyA: 0, companyB: 3}, ... }
    pairVotes: {},
    
    // Current displayed votes for active pair
    votes: {
      companyA: 0,
      companyB: 0
    },

    voteA() {
      console.log('Vote A clicked!', this.votes);
      const currentPairIndex = this.getCurrentPairIndex();
      
      // Ensure pair votes object exists
      if (!this.pairVotes[currentPairIndex]) {
        this.pairVotes[currentPairIndex] = { companyA: 0, companyB: 0 };
      }
      
      // Update votes for current pair
      this.pairVotes[currentPairIndex].companyA++;
      this.votes.companyA = this.pairVotes[currentPairIndex].companyA;
      
      console.log('Vote A updated:', this.votes, 'All pair votes:', this.pairVotes);
      
      // Update session data
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      if (app) {
        app.markUnsaved();
      }
    },

    voteB() {
      console.log('Vote B clicked!', this.votes);
      const currentPairIndex = this.getCurrentPairIndex();
      
      // Ensure pair votes object exists
      if (!this.pairVotes[currentPairIndex]) {
        this.pairVotes[currentPairIndex] = { companyA: 0, companyB: 0 };
      }
      
      // Update votes for current pair
      this.pairVotes[currentPairIndex].companyB++;
      this.votes.companyB = this.pairVotes[currentPairIndex].companyB;
      
      console.log('Vote B updated:', this.votes, 'All pair votes:', this.pairVotes);
      
      // Update session data
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      if (app) {
        app.markUnsaved();
      }
    },

    resetVotes() {
      const currentPairIndex = this.getCurrentPairIndex();
      
      // Reset votes for current pair only
      if (this.pairVotes[currentPairIndex]) {
        this.pairVotes[currentPairIndex] = { companyA: 0, companyB: 0 };
      }
      this.votes.companyA = 0;
      this.votes.companyB = 0;
      
      console.log('Votes reset for pair', currentPairIndex);
      
      // Update session data
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      if (app) {
        app.markUnsaved();
      }
    },
    
    // Helper method to get current pair index from company pairs
    getCurrentPairIndex() {
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      return app?.phase2?.companyPairs?.currentIndex || 0;
    },
    
    // Method to load votes for current pair (called when navigating)
    loadVotesForCurrentPair() {
      const currentPairIndex = this.getCurrentPairIndex();
      
      if (this.pairVotes[currentPairIndex]) {
        this.votes.companyA = this.pairVotes[currentPairIndex].companyA;
        this.votes.companyB = this.pairVotes[currentPairIndex].companyB;
      } else {
        this.votes.companyA = 0;
        this.votes.companyB = 0;
      }
      
      console.log('Loaded votes for pair', currentPairIndex, ':', this.votes);
    },

    get totalVotes() {
      return this.votes.companyA + this.votes.companyB;
    },

    get percentageA() {
      if (this.totalVotes === 0) return 0;
      return Math.round((this.votes.companyA / this.totalVotes) * 100);
    },

    get percentageB() {
      if (this.totalVotes === 0) return 0;
      return Math.round((this.votes.companyB / this.totalVotes) * 100);
    }
  };
};

// Phase 2 initialization and integration
window.initializePhase2 = function() {
  return {
    // Timer functionality
    timer: window.createTimer(),
    
    // Company pairs
    companyPairs: window.createCompanyPairs(),
    
    // Voting system
    votingSystem: window.createVotingSystem(),
    
    // Convenience getters for templates
    get currentPair() {
      return this.companyPairs.currentPair;
    },
    
    get pairCounter() {
      return this.companyPairs.pairCounter;
    },
    
    get votes() {
      return this.votingSystem.votes;
    },
    
    get timerLeft() {
      return this.timer.timeLeft;
    },
    
    get currentPairIndex() {
      return this.companyPairs.currentIndex;
    },

    // Actions
    startTimer() {
      this.timer.start();
    },
    
    pauseTimer() {
      this.timer.pause();
    },
    
    resetTimer() {
      this.timer.reset();
    },
    
    nextPair() {
      this.companyPairs.nextPair();
    },
    
    previousPair() {
      this.companyPairs.previousPair();
    },
    
    voteA() {
      this.votingSystem.voteA();
    },
    
    voteB() {
      this.votingSystem.voteB();
    },
    
    resetVotes() {
      this.votingSystem.resetVotes();
    },
    
    // Format time for display
    formatTime(seconds) {
      return this.timer.formatTime(seconds);
    },
    
    // Load saved state
    loadState(savedData) {
      if (savedData.pairVotes) {
        this.votingSystem.pairVotes = savedData.pairVotes;
      }
      
      if (savedData.currentPairIndex !== undefined) {
        this.companyPairs.currentIndex = savedData.currentPairIndex;
      }
      
      if (savedData.timerLeft !== undefined) {
        this.timer.timeLeft = savedData.timerLeft;
      }
      
      // Load votes for current pair after setting the index
      this.votingSystem.loadVotesForCurrentPair();
    },
    
    // Get current state for saving
    getState() {
      return {
        pairVotes: this.votingSystem.pairVotes,
        votes: {
          companyA: this.votingSystem.votes.companyA,
          companyB: this.votingSystem.votes.companyB
        },
        currentPairIndex: this.companyPairs.currentIndex,
        timerLeft: this.timer.timeLeft,
        totalVotes: this.votingSystem.totalVotes,
        percentageA: this.votingSystem.percentageA,
        percentageB: this.votingSystem.percentageB
      };
    }
  };
};