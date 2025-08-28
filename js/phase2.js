/**
 * Phase 2: Preference Round
 * Handles company pair voting with timer functionality and audio cues
 */

// Audio system for Phase 2 - Web Audio API
window.createAudioSystem = function() {
  return {
    audioContext: null,
    isMuted: false,
    isEnabled: false,
    
    // Initialize audio context (requires user interaction)
    async init() {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isEnabled = true;
        return true;
      } catch (error) {
        console.error('Failed to initialize audio system:', error);
        return false;
      }
    },
    
    // Resume audio context if suspended (Chrome requirement)
    async resume() {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    },
    
    // Generate beep sound for countdown
    playBeep(frequency = 800, duration = 0.2) {
      if (!this.isEnabled || this.isMuted || !this.audioContext) return;
      
      try {
        this.resume();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // Envelope for smooth sound
        const currentTime = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);
      } catch (error) {
        console.error('Error playing beep:', error);
      }
    },
    
    // Generate bell sound for completion
    playBell() {
      if (!this.isEnabled || this.isMuted || !this.audioContext) return;
      
      try {
        this.resume();
        
        // Create a bell-like sound with multiple harmonics
        const currentTime = this.audioContext.currentTime;
        const duration = 1.5;
        
        // Fundamental frequency and harmonics for bell sound
        const frequencies = [523, 659, 784, 1047]; // C, E, G, C (major chord)
        
        frequencies.forEach((freq, index) => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.frequency.value = freq;
          oscillator.type = 'sine';
          
          // Different envelope for each harmonic to create bell-like decay
          const amplitude = 0.2 / (index + 1); // Decreasing amplitude for higher harmonics
          gainNode.gain.setValueAtTime(0, currentTime);
          gainNode.gain.linearRampToValueAtTime(amplitude, currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration * (1 + index * 0.2));
          
          oscillator.start(currentTime);
          oscillator.stop(currentTime + duration * (1 + index * 0.2));
        });
      } catch (error) {
        console.error('Error playing bell:', error);
      }
    },
    
    // Toggle mute state
    toggleMute() {
      this.isMuted = !this.isMuted;
      return this.isMuted;
    },
    
    // Get current state
    getState() {
      return {
        isEnabled: this.isEnabled,
        isMuted: this.isMuted,
        contextState: this.audioContext ? this.audioContext.state : 'not-initialized'
      };
    }
  };
};

// Timer system for Phase 2 - Physical Positioning Countdown
window.createTimer = function(audioSystem = null) {
  return {
    timeLeft: 10, // 10 seconds countdown for physical positioning
    isRunning: false,
    isPaused: false,
    interval: null,
    originalTime: 10,
    state: 'ready', // 'ready', 'announcement', 'countdown', 'completed', 'discussion'
    audioSystem: audioSystem, // Reference to audio system

    start() {
      if (this.isRunning && !this.isPaused) return;
      
      // Begin with announcement phase
      this.state = 'announcement';
      this.isRunning = true;
      this.isPaused = false;
      
      // Show "Ready? GO!" for 2 seconds, then start countdown
      setTimeout(() => {
        this.state = 'countdown';
        this.timeLeft = this.originalTime;
        
        this.interval = setInterval(() => {
          if (this.timeLeft > 0) {
            this.timeLeft--;
            
            // Play countdown beeps for last 3 seconds
            if (this.timeLeft <= 3 && this.timeLeft > 0 && this.audioSystem) {
              // Higher pitch for final countdown
              const frequency = this.timeLeft === 1 ? 1000 : 800;
              this.audioSystem.playBeep(frequency, 0.15);
            }
            
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
      }, 2000);
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
      this.state = 'ready';
      
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
      this.state = 'completed';
      
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
      
      // Play completion bell
      if (this.audioSystem) {
        this.audioSystem.playBell();
      }
      
      // Add completion visual indicator
      document.querySelector('.timer-display')?.classList.add('timer-completed');
      
      // Auto-transition to discussion phase after 2 seconds
      setTimeout(() => {
        this.state = 'discussion';
        const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
        if (app) {
          app.markUnsaved();
        }
      }, 2000);
      
      // Update session data
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      if (app) {
        app.phase2.timerLeft = this.timeLeft;
        app.markUnsaved();
      }
    },

    // New method to advance to next round from discussion phase
    nextRound() {
      this.reset();
      // Automatically advance to next pair
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      if (app?.phase2?.companyPairs?.canGoNext) {
        app.phase2.nextPair();
      }
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };
};

// Strategic pairs data loading
window.loadStrategicPairs = async function() {
  try {
    const response = await fetch('data/strategic-pairs.json');
    if (!response.ok) {
      throw new Error(`Kan strategische paren niet laden: ${response.statusText}`);
    }
    const data = await response.json();
    // Handle the actual structure with strategic_pairs wrapper
    const strategicPairs = data.strategic_pairs || data;
    return strategicPairs;
  } catch (error) {
    console.error('Error loading strategic pairs:', error);
    // Fallback to original pairs if loading fails
    return [
      { 
        companyA: "Android",
        companyB: "Apple iOS",
        strategic_contrast: "Platform vs Integrated Product",
        dilemma_question: "Build an open ecosystem for maximum scale, or a perfectly controlled total solution for a premium experience?",
        strategies: {
          companyA: "Open platform with multiple hardware partners",
          companyB: "Closed, integrated hardware-software ecosystem"
        }
      }
    ];
  }
};

/**
 * Strategic pair selection with level balancing
 * Ensures representation from all framework levels when selecting 4+ pairs
 * @param {Array} allPairs - All available strategic pairs
 * @param {number} count - Number of pairs to select (default: 5)
 * @returns {Array} Selected strategic pairs with balanced level distribution
 */
window.selectRandomPairs = function(allPairs, count = 5) {
  if (allPairs.length <= count) {
    return [...allPairs]; // Return all pairs if we have fewer than requested
  }
  
  // If selecting fewer than 4 pairs, use simple random selection
  if (count < 4) {
    const shuffled = [...allPairs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  
  // Group pairs by strategic level (niveau)
  const pairsByLevel = {
    1: [], // Niveau 1: Waar concurreren we?
    2: [], // Niveau 2: Hoe winnen we?
    3: [], // Niveau 3: Hoe leveren we?
    4: []  // Niveau 4: Hoe organiseren en financieren we?
  };
  
  // Categorize pairs by level
  allPairs.forEach(pair => {
    const level = pair.niveau || 1; // Default to level 1 if not specified
    if (pairsByLevel[level]) {
      pairsByLevel[level].push(pair);
    }
  });
  
  // Get available levels that have pairs
  const availableLevels = Object.keys(pairsByLevel).filter(level => pairsByLevel[level].length > 0);
  
  // If we have 4 or more levels available, ensure one from each level
  const selectedPairs = [];
  const remainingSlots = count;
  
  if (availableLevels.length >= 4 && count >= 4) {
    // Select one random pair from each of the first 4 levels
    availableLevels.slice(0, 4).forEach(level => {
      const levelPairs = pairsByLevel[level];
      const randomIndex = Math.floor(Math.random() * levelPairs.length);
      selectedPairs.push(levelPairs[randomIndex]);
    });
    
    // Remove selected pairs from the pool for remaining slots
    const remainingPairs = allPairs.filter(pair => !selectedPairs.includes(pair));
    
    // Fill remaining slots with random selection from all remaining pairs
    const additionalCount = count - 4;
    if (additionalCount > 0 && remainingPairs.length > 0) {
      const shuffledRemaining = [...remainingPairs].sort(() => Math.random() - 0.5);
      selectedPairs.push(...shuffledRemaining.slice(0, additionalCount));
    }
  } else {
    // Fallback: If we don't have enough levels, use balanced selection from available levels
    const levelsToUse = Math.min(availableLevels.length, count);
    
    // Select one from each available level first
    availableLevels.slice(0, levelsToUse).forEach(level => {
      const levelPairs = pairsByLevel[level];
      const randomIndex = Math.floor(Math.random() * levelPairs.length);
      selectedPairs.push(levelPairs[randomIndex]);
    });
    
    // Fill remaining slots randomly
    const remainingPairs = allPairs.filter(pair => !selectedPairs.includes(pair));
    const additionalCount = count - selectedPairs.length;
    if (additionalCount > 0 && remainingPairs.length > 0) {
      const shuffledRemaining = [...remainingPairs].sort(() => Math.random() - 0.5);
      selectedPairs.push(...shuffledRemaining.slice(0, additionalCount));
    }
  }
  
  // Final shuffle to randomize the order of selected pairs
  return selectedPairs.sort(() => Math.random() - 0.5);
};

// Company pairs management
window.createCompanyPairs = function(strategicPairs = null) {
  // Default fallback pairs if no strategic pairs provided
  const defaultPairs = [
    { companyA: 'Apple', companyB: 'Samsung' },
    { companyA: 'Google', companyB: 'Microsoft' },
    { companyA: 'Amazon', companyB: 'Alibaba' },
    { companyA: 'Tesla', companyB: 'Toyota' },
    { companyA: 'Netflix', companyB: 'Disney' }
  ];
  
  let pairs;
  if (strategicPairs && strategicPairs.length > 0) {
    // Convert strategic pairs to the format expected by the voting system
    pairs = strategicPairs.map((pair, index) => ({
      id: index + 1,
      category: pair.strategic_contrast,
      companyA: pair.companyA,
      companyB: pair.companyB,
      companyADescription: pair.strategies?.companyA || '',
      companyBDescription: pair.strategies?.companyB || '',
      characteristics: {
        companyA: [], // No characteristics in the current JSON structure
        companyB: []
      },
      strategicDilemmaQuestion: pair.dilemma_question,
      strategicContrast: pair.strategic_contrast,
      distinguishingElement: pair.distinguishing_element
    }));
  } else {
    pairs = defaultPairs;
  }

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
      const currentPairIndex = this.getCurrentPairIndex();
      
      // Ensure pair votes object exists
      if (!this.pairVotes[currentPairIndex]) {
        this.pairVotes[currentPairIndex] = { companyA: 0, companyB: 0 };
      }
      
      // Update votes for current pair
      this.pairVotes[currentPairIndex].companyA++;
      this.votes.companyA = this.pairVotes[currentPairIndex].companyA;
      
      
      // Update session data
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      if (app) {
        app.markUnsaved();
      }
    },

    voteB() {
      const currentPairIndex = this.getCurrentPairIndex();
      
      // Ensure pair votes object exists
      if (!this.pairVotes[currentPairIndex]) {
        this.pairVotes[currentPairIndex] = { companyA: 0, companyB: 0 };
      }
      
      // Update votes for current pair
      this.pairVotes[currentPairIndex].companyB++;
      this.votes.companyB = this.pairVotes[currentPairIndex].companyB;
      
      
      // Update session data
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      if (app) {
        app.markUnsaved();
      }
    },

    decreaseVoteA() {
      const currentPairIndex = this.getCurrentPairIndex();
      
      // Ensure pair votes object exists
      if (!this.pairVotes[currentPairIndex]) {
        this.pairVotes[currentPairIndex] = { companyA: 0, companyB: 0 };
      }
      
      // Decrease votes for current pair (minimum 0)
      if (this.pairVotes[currentPairIndex].companyA > 0) {
        this.pairVotes[currentPairIndex].companyA--;
        this.votes.companyA = this.pairVotes[currentPairIndex].companyA;
        
        
        // Update session data
        const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
        if (app) {
          app.markUnsaved();
        }
      }
    },

    decreaseVoteB() {
      const currentPairIndex = this.getCurrentPairIndex();
      
      // Ensure pair votes object exists
      if (!this.pairVotes[currentPairIndex]) {
        this.pairVotes[currentPairIndex] = { companyA: 0, companyB: 0 };
      }
      
      // Decrease votes for current pair (minimum 0)
      if (this.pairVotes[currentPairIndex].companyB > 0) {
        this.pairVotes[currentPairIndex].companyB--;
        this.votes.companyB = this.pairVotes[currentPairIndex].companyB;
        
        
        // Update session data
        const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
        if (app) {
          app.markUnsaved();
        }
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
window.initializePhase2 = async function() {
  try {
    // Load strategic pairs
    const allStrategicPairs = await window.loadStrategicPairs();
    
    // Select random 5 pairs
    const selectedPairs = window.selectRandomPairs(allStrategicPairs, 5);
    
    // Initialize audio system
    const audioSystem = window.createAudioSystem();
    
    return {
      // Audio system
      audioSystem: audioSystem,
      
      // Timer functionality (with audio system reference)
      timer: window.createTimer(audioSystem),
      
      // Company pairs (using selected strategic pairs)
      companyPairs: window.createCompanyPairs(selectedPairs),
      
      // Voting system
      votingSystem: window.createVotingSystem(),
      
      // Store reference to selected strategic pairs
      selectedStrategicPairs: selectedPairs,
    
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

    get timerState() {
      return this.timer.state;
    },

    // Actions
    async startTimer() {
      // Auto-enable audio on first start (if not already enabled)
      if (!this.audioSystem.isEnabled) {
        try {
          await this.audioSystem.init();
        } catch (error) {
          console.warn('Could not auto-enable audio:', error.message);
        }
      }
      this.timer.start();
    },
    
    pauseTimer() {
      this.timer.pause();
    },
    
    resetTimer() {
      this.timer.reset();
    },

    nextRound() {
      this.timer.nextRound();
    },
    
    nextPair() {
      this.companyPairs.nextPair();
    },

    // Audio controls
    async initAudio() {
      return await this.audioSystem.init();
    },

    toggleAudioMute() {
      return this.audioSystem.toggleMute();
    },

    get audioState() {
      return this.audioSystem.getState();
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
    
    decreaseVoteA() {
      this.votingSystem.decreaseVoteA();
    },
    
    decreaseVoteB() {
      this.votingSystem.decreaseVoteB();
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
  } catch (error) {
    console.error('Error initializing Phase 2:', error);
    // Return fallback Phase 2 object if strategic pairs loading fails
    return {
      timer: window.createTimer(),
      companyPairs: window.createCompanyPairs(),
      votingSystem: window.createVotingSystem(),
      selectedStrategicPairs: [],
      get currentPair() { return this.companyPairs.currentPair; },
      get pairCounter() { return this.companyPairs.pairCounter; },
      get votes() { return this.votingSystem.votes; },
      get timerLeft() { return this.timer.timeLeft; },
      get currentPairIndex() { return this.companyPairs.currentIndex; },
      startTimer() { this.timer.start(); },
      pauseTimer() { this.timer.pause(); },
      resetTimer() { this.timer.reset(); },
      nextPair() { this.companyPairs.nextPair(); },
      previousPair() { this.companyPairs.previousPair(); },
      voteA() { this.votingSystem.voteA(); },
      voteB() { this.votingSystem.voteB(); },
      resetVotes() { this.votingSystem.resetVotes(); },
      formatTime(seconds) { return this.timer.formatTime(seconds); },
      loadState(savedData) {
        if (savedData.pairVotes) this.votingSystem.pairVotes = savedData.pairVotes;
        if (savedData.currentPairIndex !== undefined) this.companyPairs.currentIndex = savedData.currentPairIndex;
        if (savedData.timerLeft !== undefined) this.timer.timeLeft = savedData.timerLeft;
        this.votingSystem.loadVotesForCurrentPair();
      },
      getState() {
        return {
          pairVotes: this.votingSystem.pairVotes,
          votes: { companyA: this.votingSystem.votes.companyA, companyB: this.votingSystem.votes.companyB },
          currentPairIndex: this.companyPairs.currentIndex,
          timerLeft: this.timer.timeLeft,
          totalVotes: this.votingSystem.totalVotes,
          percentageA: this.votingSystem.percentageA,
          percentageB: this.votingSystem.percentageB
        };
      }
    };
  }
};