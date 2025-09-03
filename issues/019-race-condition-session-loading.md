# Issue #019: Race Condition in Session Loading

**Status:** 🔧 Medium Priority - Initialization Issue  
**Component:** Application Initialization  
**Reported:** 2024-01-03  
**Severity:** Medium - Intermittent initialization failures  

## Problem Description

The application initialization process has race conditions between:

- Session loading from LocalForage (async)
- Phase 1 initialization (async) 
- Auto-save starting
- UI rendering with Alpine.js

This can lead to:
- Phase 1 initialized with default data before session loads
- Auto-save starting before session is fully loaded
- UI displaying stale/default data briefly
- Inconsistent application state on startup

### User Impact
- Flickering UI during page load
- Occasionally loses previous session data
- Inconsistent initial state between page loads
- Auto-save conflicts during startup

### Evidence
```javascript
// Current init process - potential race conditions
async init() {
  // These happen simultaneously without proper ordering:
  await this.loadCompanyPairs();           // Async
  await this.loadSession();               // Async
  this.phase1 = await initializePhase1(); // Async
  if (settings.autoSave) this.startAutoSave(); // Depends on session
}
```

## Root Cause Analysis

### Problem 1: Parallel Async Operations

**Location:** `/js/core.js` line 166-218 (init method)

Multiple async operations run in parallel without dependency management:

1. `loadSession()` loads session data
2. `initializePhase1()` creates Phase 1 with defaults
3. `startAutoSave()` may start before session fully loaded
4. `syncSessionToPhaseData()` runs before all data ready

### Problem 2: Phase 1 Default vs Session Data Conflict

Phase 1 is initialized with default data, then session data is loaded later, potentially overwriting user changes made during the loading window.

### Problem 3: Auto-Save Timing

Auto-save can start before:
- Session is fully loaded
- Phase data is synced
- Application state is stable

This can cause the wrong data to be saved immediately after startup.

## Step-by-Step Fix Instructions for Junior Developer

### Fix 1: Implement Proper Initialization Sequence

**File:** `/js/core.js`

**Replace the init() method around line 166:**

```javascript
// Add initialization state tracking
initializationState: {
  phase: 'starting',  // starting -> loading -> ready -> complete
  steps: {
    storage: false,
    companyPairs: false,
    session: false,
    phase1: false,
    uiReady: false
  },
  errors: []
},

async init() {
  this.initializationState.phase = 'loading';
  
  try {
    // Step 1: Initialize storage first (synchronous setup)
    this.updateInitStep('Initialiseer opslag...', async () => {
      await initializeStorage();
      this.initializationState.steps.storage = true;
    });
    
    // Step 2: Load company pairs (required for Phase 1)
    await this.updateInitStep('Laad bedrijfsparen...', async () => {
      await this.loadCompanyPairs();
      this.initializationState.steps.companyPairs = true;
    });
    
    // Step 3: Create default session structure
    this.session = createDefaultSession();
    
    // Step 4: Load saved session (overwrites defaults if exists)
    await this.updateInitStep('Laad sessie...', async () => {
      await this.loadSession();
      this.initializationState.steps.session = true;
    });
    
    // Step 5: Initialize Phase 1 with session data
    await this.updateInitStep('Initialiseer Fase 1...', async () => {
      if (window.initializePhase1) {
        this.phase1 = await window.initializePhase1();
        
        // Load Phase 1 state AFTER initialization
        if (this.session.phase1) {
          this.phase1.loadState(this.session.phase1);
        }
        
        this.initializationState.steps.phase1 = true;
      } else {
        throw new Error('Phase 1 initialization function not found');
      }
    });
    
    // Step 6: Setup timer and UI systems
    await this.updateInitStep('Configureer timer...', async () => {
      this.timer.duration = this.session.settings.timerDuration;
      this.timer.remaining = this.timer.duration;
      this.setupKeyboardShortcuts();
      this.setupGlobalErrorHandlers();
      this.setupCleanupHandlers();
    });
    
    // Step 7: Start auto-save ONLY after everything is ready
    await this.updateInitStep('Start automatisch opslaan...', async () => {
      if (this.session.settings.autoSave) {
        // Add delay to ensure everything is stable
        setTimeout(() => {
          this.startAutoSave();
        }, 1000);
      }
    });
    
    this.initializationState.phase = 'ready';
    console.log('Application initialization complete');
    
  } catch (error) {
    this.initializationState.phase = 'error';
    this.initializationState.errors.push(error);
    
    console.error('Failed to initialize application:', error);
    this.showError('Applicatie kon niet worden gestart. Ververs de pagina en probeer opnieuw.');
    
    // Attempt partial recovery
    this.attemptPartialRecovery();
  }
  
  // Always hide loading screen after attempt
  this.finalizeInitialization();
},

// Helper method for tracked initialization steps
async updateInitStep(stepName, asyncOperation) {
  console.log(`Init step: ${stepName}`);
  
  // Update loading UI if available
  if (this.loadingMessage !== undefined) {
    this.loadingMessage = stepName;
  }
  
  try {
    await asyncOperation();
    console.log(`✅ ${stepName} completed`);
  } catch (error) {
    console.error(`❌ ${stepName} failed:`, error);
    throw new Error(`Initialization failed at: ${stepName} - ${error.message}`);
  }
}
```

### Fix 2: Add Loading State Management

**File:** `/js/core.js`

**Add loading state to Alpine.js data:**

```javascript
// Add to data properties
loading: true,
loadingMessage: 'Laden Strategie Sprint...',
loadingProgress: 0,

finalizeInitialization() {
  // Calculate final progress
  const completedSteps = Object.values(this.initializationState.steps).filter(Boolean).length;
  const totalSteps = Object.keys(this.initializationState.steps).length;
  this.loadingProgress = (completedSteps / totalSteps) * 100;
  
  // Hide loading screen with delay for UX
  setTimeout(() => {
    this.loading = false;
    this.initializationState.phase = 'complete';
  }, 500);
}
```

### Fix 3: Update Loading UI

**File:** `/index.html`

**Find the loading screen and enhance it:**

```html
<!-- Enhanced Loading Screen -->
<div x-show="loading" 
     x-cloak 
     class="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
  
  <!-- Logo/Title -->
  <div class="text-center mb-8">
    <h1 class="text-2xl font-bold text-gray-800 mb-2">Strategie Sprint</h1>
    <p class="text-gray-600">Het Ren-Je-Rot-Analogie-Verkenner-spel</p>
  </div>
  
  <!-- Loading Spinner -->
  <div class="relative mb-4">
    <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
  </div>
  
  <!-- Loading Message -->
  <div class="text-center mb-4">
    <p class="text-sm text-gray-600" x-text="loadingMessage"></p>
  </div>
  
  <!-- Progress Bar -->
  <div class="w-64 bg-gray-200 rounded-full h-2 mb-4">
    <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" 
         :style="`width: ${loadingProgress}%`"></div>
  </div>
  
  <!-- Initialization Steps (debug mode) -->
  <div x-show="!presentationMode && initializationState?.phase === 'loading'" 
       class="text-xs text-gray-500 mt-4 max-w-md">
    <div class="grid grid-cols-2 gap-1">
      <div :class="initializationState.steps.storage ? 'text-green-600' : 'text-gray-400'">
        ✓ Opslag
      </div>
      <div :class="initializationState.steps.companyPairs ? 'text-green-600' : 'text-gray-400'">
        ✓ Bedrijfsparen
      </div>
      <div :class="initializationState.steps.session ? 'text-green-600' : 'text-gray-400'">
        ✓ Sessie
      </div>
      <div :class="initializationState.steps.phase1 ? 'text-green-600' : 'text-gray-400'">
        ✓ Fase 1
      </div>
    </div>
  </div>
  
  <!-- Error State -->
  <div x-show="initializationState?.phase === 'error'" class="text-center mt-4">
    <p class="text-red-600 text-sm mb-2">Er ging iets mis tijdens het opstarten</p>
    <button @click="window.location.reload()" 
            class="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700">
      Pagina Verversen
    </button>
  </div>
  
</div>
```

### Fix 4: Add Partial Recovery Mechanism

**File:** `/js/core.js`

**Add recovery method:**

```javascript
attemptPartialRecovery() {
  console.log('Attempting partial recovery...');
  
  // Try to initialize with minimal functionality
  try {
    // Ensure basic session exists
    if (!this.session) {
      this.session = createDefaultSession();
      console.log('✅ Created emergency session');
    }
    
    // Try to initialize Phase 1 with defaults
    if (!this.phase1 && window.initializePhase1) {
      window.initializePhase1().then(phase1 => {
        this.phase1 = phase1;
        console.log('✅ Phase 1 initialized in recovery mode');
      });
    }
    
    // Set reasonable defaults
    this.timer.duration = 30;
    this.timer.remaining = 30;
    this.currentPhase = 1;
    
    // Disable auto-save in recovery mode
    if (this.session.settings) {
      this.session.settings.autoSave = false;
    }
    
    this.loadingMessage = 'Hersteld in veilige modus...';
    
    console.log('✅ Partial recovery completed');
    
  } catch (recoveryError) {
    console.error('❌ Partial recovery failed:', recoveryError);
    this.loadingMessage = 'Herstel mislukt - ververs de pagina';
  }
}
```

### Fix 5: Add Session Loading Race Condition Fix

**File:** `/js/core.js`

**Update loadSession() with better error handling:**

```javascript
async loadSession() {
  // Add timeout to prevent hanging
  const loadTimeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Session load timeout')), 10000)
  );
  
  try {
    const savedSession = await Promise.race([
      localforage.getItem('current-session'),
      loadTimeout
    ]);
    
    if (savedSession) {
      console.log('Saved session found:', savedSession.id);
      
      // Validate session structure before using
      if (this.validateSessionStructure(savedSession)) {
        // Deep merge saved session with default structure
        this.session = this.deepMerge(this.session, savedSession);
        
        // Apply Phase 1 completion validation
        this.validatePhase1Completion();
        
        console.log('Session loaded and validated successfully');
      } else {
        throw new Error('Saved session has invalid structure');
      }
      
    } else {
      console.log('No saved session found, using defaults');
    }
    
    // Always sync session to phase data after loading
    this.syncSessionToPhaseData();
    
  } catch (error) {
    console.error('Session loading failed:', error);
    
    // Use default session on failure
    this.session = createDefaultSession();
    this.syncSessionToPhaseData();
    
    // Don't throw - allow app to continue with defaults
    console.log('Continuing with default session due to load failure');
  }
},

validateSessionStructure(session) {
  const requiredFields = ['id', 'createdAt', 'currentPhase', 'phase1', 'phase2', 'phase3', 'settings'];
  
  for (const field of requiredFields) {
    if (!(field in session)) {
      console.error(`Session missing required field: ${field}`);
      return false;
    }
  }
  
  return true;
}
```

### Fix 6: Add Initialization Monitoring

**File:** `/js/core.js` 

**Add debugging helpers:**

```javascript
// Add monitoring for initialization issues
monitorInitialization() {
  // Track timing
  const startTime = performance.now();
  
  // Monitor for common race conditions
  const checkInterval = setInterval(() => {
    const elapsedTime = performance.now() - startTime;
    
    if (elapsedTime > 15000) { // 15 second timeout
      clearInterval(checkInterval);
      
      if (this.initializationState.phase !== 'complete') {
        console.error('Initialization timeout detected:', {
          phase: this.initializationState.phase,
          steps: this.initializationState.steps,
          elapsedTime: elapsedTime
        });
        
        this.attemptPartialRecovery();
      }
    }
    
    if (this.initializationState.phase === 'complete') {
      clearInterval(checkInterval);
      console.log(`Initialization completed in ${elapsedTime.toFixed(2)}ms`);
    }
    
  }, 1000);
}
```

## Testing Instructions

### Test 1: Normal Initialization
1. Clear all browser storage
2. Refresh page
3. **EXPECT:** Loading screen shows progress
4. **EXPECT:** No console errors
5. **EXPECT:** Application ready in <5 seconds

### Test 2: Slow Network Simulation
1. Open DevTools → Network → Enable slow 3G
2. Refresh page
3. **EXPECT:** Loading messages update appropriately  
4. **EXPECT:** No race condition errors
5. **EXPECT:** Application eventually loads

### Test 3: Corrupted Session Recovery
```javascript
// Corrupt the session in localStorage:
localStorage.setItem('current-session', 'invalid json');
// Refresh page
// EXPECT: App recovers and uses defaults
```

### Test 4: Phase 1 Loading Race
1. Add artificial delay to Phase 1 initialization
2. Refresh page rapidly multiple times
3. **EXPECT:** Consistent behavior each time
4. **EXPECT:** No undefined errors

### Test 5: Auto-Save Race Condition
1. Set very short auto-save interval (500ms)
2. Refresh page
3. **EXPECT:** Auto-save doesn't start until app ready
4. **EXPECT:** No "save in progress" errors immediately after load

## Performance Monitoring

Add this to measure initialization performance:

```javascript
// Add to init() method
const perfMark = (step) => {
  performance.mark(`init-${step}`);
  if (performance.getEntriesByName(`init-${step}-start`).length > 0) {
    performance.measure(
      `init-${step}-duration`, 
      `init-${step}-start`, 
      `init-${step}`
    );
  }
};
```

## Expected Outcome

✅ **Sequential initialization prevents race conditions**  
✅ **Loading screen shows clear progress**  
✅ **Session data loaded before Phase 1 initialization**  
✅ **Auto-save starts only after app is stable**  
✅ **Graceful recovery from initialization failures**  
✅ **Consistent behavior across page refreshes**  
✅ **Timeout protection prevents hanging**  

## Priority

**MEDIUM** - Affects startup reliability but doesn't break core functionality once loaded.

## Related Issues

- Issue #016: Auto-Save Memory Leak (auto-save timing dependency)
- Issue #013: Phase 1 State Not Properly Saved (session loading order)
- Issue #018: Missing Error Boundaries (initialization error handling)