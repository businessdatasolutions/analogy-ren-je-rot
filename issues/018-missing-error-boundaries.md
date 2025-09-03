# Issue #018: Missing Error Boundaries

**Status:** 🔧 Medium Priority - Reliability Issue  
**Component:** Error Handling (Global)  
**Reported:** 2024-01-03  
**Severity:** Medium - Application stability risk  

## Problem Description

The application lacks comprehensive error boundaries and error handling mechanisms, leading to:

- Silent failures that users don't notice
- Unhandled promise rejections causing crashes
- Poor error messaging and user guidance
- Difficult debugging for facilitators
- Potential data loss during errors

### User Impact
- Application crashes without explanation
- Lost work when errors occur during data operations
- Confusing error messages (or no messages)
- Difficulty reporting problems to developers
- Unreliable session persistence

### Evidence
```javascript
// Current error handling is minimal
catch (error) {
  console.error('Failed to load session:', error);  // Only logged, user doesn't know
}

// Many operations have no error handling at all
const winners = this.getWinners();  // Could throw, no try-catch
```

## Root Cause Analysis

### Problem 1: Inconsistent Error Handling

Some critical operations have error handling while others don't:

- Session loading/saving: ✅ Has basic error handling
- Winner calculation: ❌ No error handling
- Phase transitions: ❌ No error handling
- Timer operations: ❌ No error handling
- Local storage operations: ❌ Minimal error handling

### Problem 2: Poor User Error Communication

**Location:** `/js/core.js` line 945-949

```javascript
showError(message) {
  // Simple error display - could be enhanced with a proper notification system
  console.error(message);
  alert(message);  // ❌ Poor UX with browser alerts
}
```

### Problem 3: No Error Recovery Mechanisms

When errors occur, the application doesn't provide:
- Retry options
- Fallback data
- State recovery
- Guidance on how to continue

### Problem 4: Unhandled Promise Rejections

Async operations may fail silently:
- Auto-save failures
- Session loading failures
- Data export operations

## Step-by-Step Fix Instructions for Junior Developer

### Fix 1: Implement Comprehensive Error Handler

**File:** `/js/core.js`

**Replace the simple showError() method around line 945:**

```javascript
// Enhanced error handling system
errorSystem: {
  errors: [],
  maxErrors: 10,
  
  log(error, context = 'Unknown', severity = 'error') {
    const errorEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: error.message || error,
      context: context,
      severity: severity,  // 'error', 'warning', 'info'
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      phase: this.currentPhase
    };
    
    // Add to error log
    this.errorSystem.errors.unshift(errorEntry);
    
    // Limit error log size
    if (this.errorSystem.errors.length > this.errorSystem.maxErrors) {
      this.errorSystem.errors.pop();
    }
    
    // Console logging
    console[severity](`[${context}]`, error);
    
    // User notification
    this.showUserError(errorEntry);
    
    return errorEntry.id;
  }
},

showUserError(errorEntry) {
  // Create better error UI instead of alerts
  this.currentError = errorEntry;
  this.showErrorModal = true;
  
  // Auto-hide non-critical errors
  if (errorEntry.severity === 'warning' || errorEntry.severity === 'info') {
    setTimeout(() => {
      this.showErrorModal = false;
    }, 5000);
  }
},

// Maintain backwards compatibility
showError(message, context = 'Application') {
  this.errorSystem.log(new Error(message), context, 'error');
}
```

### Fix 2: Add Error Boundaries to Critical Operations

**File:** `/js/core.js`

**Wrap critical methods with error handling:**

```javascript
// Enhanced getWinners with error boundary
getWinners() {
  try {
    if (!this.phase1 || !this.phase1.getWinners) {
      throw new Error('Phase 1 not properly initialized');
    }
    
    const winners = this.phase1.getWinners();
    
    // Validate winners data
    if (!Array.isArray(winners)) {
      throw new Error('getWinners returned invalid data type');
    }
    
    winners.forEach((winner, index) => {
      if (!winner.name || typeof winner.votes !== 'number') {
        throw new Error(`Invalid winner data at index ${index}`);
      }
    });
    
    return winners;
    
  } catch (error) {
    this.errorSystem.log(error, 'Winner Calculation', 'error');
    
    // Return safe fallback
    return [];
  }
},

// Enhanced transferWinnersToPhase2 with error handling
async transferWinnersToPhase2() {
  try {
    const winners = this.getWinners();
    
    if (winners.length === 0) {
      this.errorSystem.log(new Error('No winners to transfer'), 'Phase Transition', 'warning');
      return false;
    }
    
    // Clear any existing winners first to prevent old data persistence
    this.phase2.winnersFromPhase1 = [];
    
    // Validate and filter winners before storing
    const validWinners = winners.filter(winner => {
      const isValid = winner && 
                     typeof winner.name === 'string' && 
                     typeof winner.votes === 'number' &&
                     winner.strategicContrast;
      
      if (!isValid) {
        this.errorSystem.log(
          new Error(`Invalid winner data: ${JSON.stringify(winner)}`), 
          'Data Validation', 
          'warning'
        );
      }
      
      return isValid;
    });
    
    if (validWinners.length === 0) {
      throw new Error('All winners failed validation');
    }
    
    // Store only valid winners in Phase 2
    this.phase2.winnersFromPhase1 = validWinners;
    
    // Save state
    await this.saveSession();
    
    console.log('Winners transferred to Phase 2:', {
      winners: validWinners.length,
      availableSources: validWinners.map(w => w.name),
      filtered: winners.length - validWinners.length
    });
    
    return true;
    
  } catch (error) {
    this.errorSystem.log(error, 'Phase 2 Transfer', 'error');
    
    // Provide user guidance
    this.showError(
      'Fout bij overzetten winnaars naar Fase 2. Controleer of Fase 1 correct is voltooid.',
      'Phase Transition'
    );
    
    return false;
  }
},

// Enhanced session operations
async saveSession() {
  // Prevent concurrent save operations
  if (this.savingInProgress) {
    this.errorSystem.log(new Error('Save already in progress'), 'Session Management', 'info');
    return;
  }
  
  this.savingInProgress = true;
  let retryCount = 0;
  const maxRetries = 3;
  
  while (retryCount < maxRetries) {
    try {
      this.updateSessionFromPhaseData();
      this.session.updatedAt = new Date().toISOString();
      
      // Create a clean serializable copy
      const sessionToSave = JSON.parse(JSON.stringify(this.session));
      
      await localforage.setItem('current-session', sessionToSave);
      
      // Verify the save worked
      const verification = await localforage.getItem('current-session');
      if (verification && verification.id === this.session.id) {
        this.saveStatus = 'opgeslagen';
        return; // Success
      } else {
        throw new Error('Save verification failed');
      }
      
    } catch (error) {
      retryCount++;
      
      this.errorSystem.log(
        new Error(`Save attempt ${retryCount} failed: ${error.message}`), 
        'Session Save', 
        retryCount >= maxRetries ? 'error' : 'warning'
      );
      
      if (retryCount >= maxRetries) {
        this.saveStatus = 'fout';
        
        // Offer recovery options
        this.offerSaveRecovery(error);
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
  
  this.savingInProgress = false;
}
```

### Fix 3: Add Global Error Handlers

**File:** `/js/core.js`

**Add to initialization:**

```javascript
setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    this.errorSystem.log(
      event.reason, 
      'Unhandled Promise Rejection', 
      'error'
    );
    
    // Prevent browser console errors
    event.preventDefault();
  });
  
  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    this.errorSystem.log(
      new Error(event.message), 
      `Script Error (${event.filename}:${event.lineno})`, 
      'error'
    );
  });
  
  // Handle LocalForage/Storage errors
  window.addEventListener('storage', (event) => {
    if (event.key === null) {
      // Storage was cleared
      this.errorSystem.log(
        new Error('Browser storage was cleared'), 
        'Storage Management', 
        'warning'
      );
    }
  });
  
  console.log('Global error handlers initialized');
}
```

### Fix 4: Add Recovery Options UI

**File:** `/index.html`

**Add error modal:**

```html
<!-- Error Modal -->
<div x-show="showErrorModal" 
     x-cloak
     class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
    
    <!-- Error Header -->
    <div class="bg-red-50 p-4 border-b border-red-200">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            Er is een fout opgetreden
          </h3>
        </div>
      </div>
    </div>
    
    <!-- Error Content -->
    <div class="p-4">
      <div class="text-sm text-gray-700" x-text="currentError?.message"></div>
      
      <!-- Error Context -->
      <div class="mt-2 text-xs text-gray-500">
        <strong>Context:</strong> <span x-text="currentError?.context"></span>
      </div>
      
      <div class="mt-2 text-xs text-gray-500">
        <strong>Tijd:</strong> <span x-text="currentError?.timestamp"></span>
      </div>
      
      <!-- Recovery Options -->
      <div class="mt-4 space-y-2">
        
        <button @click="retryLastOperation()" 
                class="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700">
          🔄 Opnieuw Proberen
        </button>
        
        <button @click="saveEmergencyBackup()" 
                class="w-full bg-yellow-600 text-white py-2 px-3 rounded text-sm hover:bg-yellow-700">
          💾 Noodback-up Opslaan
        </button>
        
        <button @click="reportError()" 
                class="w-full bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700">
          📧 Fout Rapporteren
        </button>
        
      </div>
    </div>
    
    <!-- Error Footer -->
    <div class="bg-gray-50 px-4 py-3 border-t">
      <div class="flex justify-between">
        <button @click="showErrorDetails = !showErrorDetails" 
                class="text-xs text-gray-500 hover:text-gray-700">
          <span x-show="!showErrorDetails">Toon Details</span>
          <span x-show="showErrorDetails">Verberg Details</span>
        </button>
        
        <button @click="showErrorModal = false" 
                class="text-xs text-gray-500 hover:text-gray-700">
          Sluiten
        </button>
      </div>
      
      <!-- Technical Details -->
      <div x-show="showErrorDetails" class="mt-2 p-2 bg-gray-100 rounded text-xs">
        <pre x-text="currentError?.stack" class="whitespace-pre-wrap"></pre>
      </div>
    </div>
    
  </div>
</div>
```

### Fix 5: Add Recovery Methods

**File:** `/js/core.js**

**Add recovery functionality:**

```javascript
// Add to Alpine.js data
showErrorModal: false,
currentError: null,
showErrorDetails: false,

// Recovery methods
retryLastOperation() {
  // Implementation depends on context
  if (this.currentError?.context === 'Session Save') {
    this.saveSession();
  } else if (this.currentError?.context === 'Phase 2 Transfer') {
    this.transferWinnersToPhase2();
  } else {
    // Generic retry - reload current phase
    window.location.reload();
  }
  
  this.showErrorModal = false;
},

async saveEmergencyBackup() {
  try {
    const backupData = {
      session: this.session,
      phase1: this.phase1?.getState(),
      phase2: this.phase2,
      phase3: this.phase3,
      timestamp: new Date().toISOString(),
      errors: this.errorSystem.errors
    };
    
    const backupJson = JSON.stringify(backupData, null, 2);
    
    // Save to localStorage as fallback
    localStorage.setItem('emergency-backup', backupJson);
    
    // Download as file
    this.downloadFile(
      backupJson, 
      `emergency-backup-${Date.now()}.json`, 
      'application/json'
    );
    
    alert('Noodback-up succesvol opgeslagen!');
    
  } catch (error) {
    this.errorSystem.log(error, 'Emergency Backup', 'error');
  }
  
  this.showErrorModal = false;
},

reportError() {
  const errorReport = {
    error: this.currentError,
    userAgent: navigator.userAgent,
    url: window.location.href,
    sessionData: {
      phase: this.currentPhase,
      saveStatus: this.saveStatus,
      autoSave: this.session?.settings?.autoSave
    }
  };
  
  // Copy to clipboard
  navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
  
  alert('Foutrapport gekopieerd naar klembord. Verstuur dit naar de ontwikkelaar.');
  
  this.showErrorModal = false;
}
```

## Testing Instructions

### Test 1: Error Boundary Functionality
```javascript
// In browser console, trigger errors:
window.app.phase1 = null;  // Break Phase 1
window.app.getWinners();   // Should catch error and return []
```

### Test 2: Save Error Recovery
```javascript
// Simulate save failure:
window.localforage.setItem = () => Promise.reject(new Error('Save failed'));
window.app.saveSession();  // Should retry and show recovery options
```

### Test 3: Promise Rejection Handling
```javascript
// Trigger unhandled rejection:
Promise.reject(new Error('Test error'));
// Should be caught by global handler
```

### Test 4: Error UI Flow
1. Trigger an error condition
2. **EXPECT:** Error modal appears with clear message
3. Click "Toon Details"
4. **EXPECT:** Technical details visible
5. Click "Opnieuw Proberen"
6. **EXPECT:** Operation retries

### Test 5: Emergency Backup
1. Trigger error modal
2. Click "Noodback-up Opslaan"
3. **EXPECT:** JSON file downloads
4. **EXPECT:** Data saved to localStorage

## Expected Outcome

✅ **Comprehensive error logging and tracking**  
✅ **User-friendly error messages instead of alerts**  
✅ **Recovery options for common error scenarios**  
✅ **Emergency backup functionality**  
✅ **Global error handlers prevent crashes**  
✅ **Retry mechanisms for transient failures**  
✅ **Developer-friendly error reporting**  

## Priority

**MEDIUM** - Improves application stability and user experience significantly.

## Related Issues

- Issue #016: Auto-Save Memory Leak (needs error handling for save failures)
- Issue #012: Phase 1 Winners Not Transferring (needs error boundaries)
- Issue #019: Race Condition in Session Loading (needs error recovery)