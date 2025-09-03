# Issue #016: Auto-Save Memory Leak

**Status:** ⚠️ High Priority - Memory Leak  
**Component:** Session Management (Auto-Save)  
**Reported:** 2024-01-03  
**Severity:** High - Performance degradation over time  

## Problem Description

The auto-save functionality can create multiple concurrent intervals without properly cleaning up previous instances, leading to:

- Multiple auto-save intervals running simultaneously
- Exponential increase in save operations over time
- Memory leaks from accumulating intervals
- Potential data corruption from concurrent saves
- Browser performance degradation during long sessions

### User Impact
- Application becomes slower over time
- Increased network traffic from excessive save operations
- Potential browser crashes during extended sessions
- Risk of corrupted session data from race conditions

### Evidence
```javascript
// Multiple auto-save intervals can be created
setInterval(() => saveSession(), 5000);  // First interval
// Later, without cleanup:
setInterval(() => saveSession(), 5000);  // Second interval - both running!
```

## Root Cause Analysis

### Problem 1: startAutoSave() Doesn't Check Existing Intervals

**Location:** `/js/core.js` line 318-327

```javascript
startAutoSave() {
  if (this.autoSaveTimer) {
    clearInterval(this.autoSaveTimer);  // ✅ This part is correct
  }
  
  this.autoSaveTimer = setInterval(async () => {
    if (this.saveStatus !== 'opgeslagen') {
      await this.saveSession();
    }
  }, this.session.settings.autoSaveInterval);
},
```

**Issues:**
- Method is called multiple times during app lifecycle
- During init, session loading, and settings changes
- No tracking of why auto-save was restarted

### Problem 2: Auto-Save Started Multiple Times

Auto-save can be started in several locations:
1. During `init()` when `settings.autoSave` is true
2. When session settings are updated
3. After session loading from storage
4. During phase transitions (potential)

### Problem 3: No Cleanup on Page Unload

If page is closed/refreshed, auto-save intervals continue running until garbage collection, wasting resources.

### Problem 4: Concurrent Save Operations

Multiple auto-save intervals can trigger `saveSession()` simultaneously, potentially causing:
- Race conditions in LocalForage operations
- Partial data corruption
- Inconsistent save status display

## Step-by-Step Fix Instructions for Junior Developer

### Fix 1: Add Auto-Save State Tracking

**File:** `/js/core.js`

**Add new properties to the Alpine.js data object (around line 118):**

```javascript
// Add these properties in the data object
autoSaveTimer: null,
autoSaveActive: false,
autoSaveStartCount: 0,  // Debug counter

// ... rest of existing properties
```

### Fix 2: Implement Robust startAutoSave()

**File:** `/js/core.js`

**Replace the startAutoSave() method around line 318:**

```javascript
startAutoSave() {
  // Increment counter for debugging
  this.autoSaveStartCount++;
  
  // Always stop existing auto-save first
  this.stopAutoSave();
  
  // Only start if auto-save is enabled in settings
  if (!this.session?.settings?.autoSave) {
    console.log('Auto-save disabled in settings, not starting');
    return;
  }
  
  const interval = this.session.settings.autoSaveInterval || 5000;
  
  this.autoSaveTimer = setInterval(async () => {
    try {
      if (this.saveStatus !== 'opgeslagen') {
        console.log('Auto-save triggered, status:', this.saveStatus);
        await this.saveSession();
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't stop auto-save on single failure, but log it
    }
  }, interval);
  
  this.autoSaveActive = true;
  
  console.log(`Auto-save started (${this.autoSaveStartCount}):`, {
    interval: interval,
    timerId: this.autoSaveTimer
  });
},

// Add new stopAutoSave method
stopAutoSave() {
  if (this.autoSaveTimer) {
    clearInterval(this.autoSaveTimer);
    console.log('Auto-save stopped, timer ID:', this.autoSaveTimer);
    this.autoSaveTimer = null;
  }
  
  this.autoSaveActive = false;
},
```

### Fix 3: Add Auto-Save Validation

**File:** `/js/core.js`

**Add validation method:**

```javascript
// Add after stopAutoSave()
validateAutoSave() {
  const issues = [];
  
  // Check for orphaned state
  if (this.autoSaveActive && !this.autoSaveTimer) {
    issues.push('Auto-save marked active but no timer exists');
    this.autoSaveActive = false;
  }
  
  if (!this.autoSaveActive && this.autoSaveTimer) {
    issues.push('Auto-save not marked active but timer exists');
    this.stopAutoSave();
  }
  
  // Check settings consistency
  if (this.session?.settings?.autoSave && !this.autoSaveActive) {
    issues.push('Auto-save enabled in settings but not running');
  }
  
  if (issues.length > 0) {
    console.warn('Auto-save validation issues:', issues);
    return false;
  }
  
  return true;
},

// Add periodic validation
startAutoSaveValidation() {
  // Check auto-save state every 30 seconds
  setInterval(() => {
    this.validateAutoSave();
  }, 30000);
}
```

### Fix 4: Prevent Concurrent Save Operations

**File:** `/js/core.js`

**Add save operation locking to saveSession() around line 255:**

```javascript
// Add property to track save state
savingInProgress: false,

// Update saveSession method
async saveSession() {
  // Prevent concurrent save operations
  if (this.savingInProgress) {
    console.log('Save already in progress, skipping...');
    return;
  }
  
  this.savingInProgress = true;
  
  try {
    this.updateSessionFromPhaseData();
    this.session.updatedAt = new Date().toISOString();
    
    // Create a clean serializable copy of the session data
    const sessionToSave = JSON.parse(JSON.stringify(this.session));
    
    await localforage.setItem('current-session', sessionToSave);
    
    // Verify the save worked
    const verification = await localforage.getItem('current-session');
    if (verification && verification.id === this.session.id) {
      this.saveStatus = 'opgeslagen';
    } else {
      throw new Error('Save verification failed');
    }
    
  } catch (error) {
    console.error('Failed to save session:', error);
    this.saveStatus = 'fout';
    throw error; // Re-throw to let callers know it failed
    
  } finally {
    // Always clear the lock
    this.savingInProgress = false;
  }
}
```

### Fix 5: Proper Cleanup Handlers

**File:** `/js/core.js**

**Add cleanup to setupCleanupHandlers() method (or create if doesn't exist):**

```javascript
setupCleanupHandlers() {
  // Auto-save cleanup on page unload
  window.addEventListener('beforeunload', () => {
    console.log('Page unloading, cleaning up auto-save...');
    this.stopAutoSave();
    
    // Final save attempt (synchronous)
    try {
      if (this.saveStatus !== 'opgeslagen') {
        // Use synchronous API for page unload
        const sessionData = JSON.stringify(this.session);
        localStorage.setItem('emergency-session-backup', sessionData);
        console.log('Emergency session backup saved');
      }
    } catch (error) {
      console.error('Emergency backup failed:', error);
    }
  });
  
  // Also cleanup on visibility change (optional performance optimization)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('Tab hidden, auto-save continues running');
    } else {
      console.log('Tab visible, validating auto-save state');
      this.validateAutoSave();
    }
  });
}
```

### Fix 6: Update Initialization

**File:** `/js/core.js`

**Update the init() method to properly start auto-save:**

```javascript
async init() {
  try {
    // ... existing initialization code ...
    
    // Load session before starting auto-save
    this.session = createDefaultSession();
    await this.loadSession();
    
    // Start auto-save only after session is loaded
    if (this.session.settings.autoSave) {
      this.startAutoSave();
    }
    
    // Start validation systems
    this.startAutoSaveValidation();
    this.setupCleanupHandlers();
    
    // ... rest of initialization ...
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    this.showError('Failed to initialize application. Please refresh and try again.');
  }
}
```

### Fix 7: Settings Update Handler

**File:** `/js/core.js` or `/index.html`

**Add method to handle auto-save settings changes:**

```javascript
updateAutoSaveSettings(enabled, interval) {
  const wasActive = this.autoSaveActive;
  
  // Update session settings
  this.session.settings.autoSave = enabled;
  this.session.settings.autoSaveInterval = interval || 5000;
  
  // Restart auto-save with new settings
  if (enabled) {
    this.startAutoSave();
    console.log('Auto-save restarted with new settings:', { enabled, interval });
  } else {
    this.stopAutoSave();
    console.log('Auto-save disabled');
  }
  
  // Save settings change
  this.markUnsaved();
}
```

## Testing Instructions

### Test 1: Single Auto-Save Instance
```javascript
// In browser console:
console.log('Auto-save active:', window.app.autoSaveActive);
console.log('Timer ID:', window.app.autoSaveTimer);

// Start auto-save multiple times
window.app.startAutoSave();
window.app.startAutoSave();
window.app.startAutoSave();

// Check only one instance
console.log('Start count:', window.app.autoSaveStartCount);
console.log('Only one timer active:', !!window.app.autoSaveTimer);
```

### Test 2: Memory Leak Detection
1. Open DevTools → Performance tab
2. Start recording
3. Let auto-save run for 2 minutes (24+ save operations)
4. Stop recording
5. **EXPECT:** Consistent memory usage (no growth)
6. **EXPECT:** No accumulating intervals in call stack

### Test 3: Concurrent Save Prevention
```javascript
// In browser console, trigger multiple saves:
Promise.all([
  window.app.saveSession(),
  window.app.saveSession(),
  window.app.saveSession()
]);

// Check console for "Save already in progress" messages
```

### Test 4: Settings Changes
1. Enable auto-save in settings
2. Change interval from 5000ms to 2000ms
3. **EXPECT:** Auto-save restarts with new interval
4. **EXPECT:** No multiple timers running
5. Disable auto-save
6. **EXPECT:** Auto-save stops completely

### Test 5: Page Unload Cleanup
1. Make some changes (trigger unsaved state)
2. Refresh page or close tab
3. Check browser console for cleanup messages
4. **EXPECT:** "Page unloading, cleaning up auto-save"
5. **EXPECT:** Emergency backup saved (if applicable)

## Performance Monitoring

Add this debugging UI to monitor auto-save health:

**File:** `/index.html`

```html
<!-- Add to settings modal or debug panel -->
<div x-show="!presentationMode" class="text-xs text-gray-500 mt-2">
  <div class="bg-gray-50 p-2 rounded">
    <div>Auto-Save Status:</div>
    <div x-text="`Active: ${autoSaveActive}, Started: ${autoSaveStartCount}x`"></div>
    <div x-text="`Timer: ${autoSaveTimer ? 'Running' : 'Stopped'}`"></div>
    <div x-text="`Save Status: ${saveStatus}`"></div>
    <div x-text="`Interval: ${session?.settings?.autoSaveInterval || 'N/A'}ms`"></div>
  </div>
</div>
```

## Expected Outcome

✅ **Only one auto-save interval runs at any time**  
✅ **Proper cleanup prevents memory leaks**  
✅ **Concurrent save operations are prevented**  
✅ **Settings changes properly restart auto-save**  
✅ **Page unload performs final cleanup**  
✅ **Auto-save state is validated periodically**  
✅ **Emergency backup on unexpected shutdown**  

## Performance Impact

**Before fix:**
- Memory: Growing interval count = memory leak
- CPU: Multiple saves running simultaneously  
- Storage: Race conditions, potential corruption
- Network: Unnecessary save operations

**After fix:**
- Memory: Consistent, single interval only
- CPU: One save operation at a time
- Storage: Protected from race conditions
- Network: Optimal save frequency

## Priority

**HIGH** - Memory leaks affect long-running sessions and can crash browsers.

## Related Issues

- Issue #014: Multiple Timer Instances (similar interval management problem)
- Issue #018: Missing Error Boundaries (should handle auto-save errors)
- Issue #019: Race Condition in Session Loading (affects auto-save startup)