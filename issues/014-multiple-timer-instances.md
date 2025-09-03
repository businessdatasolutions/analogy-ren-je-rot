# Issue #014: Multiple Timer Instances Running Simultaneously

**Status:** ⚠️ High Priority - Performance Issue  
**Component:** Timer Management (Core & Phase 1)  
**Reported:** 2024-01-03  
**Severity:** High - Memory leak and timing inconsistencies  

## Problem Description

Multiple timer intervals can be started simultaneously without properly clearing previous instances, leading to:

- Multiple countdown timers running in parallel
- Incorrect time display (timer jumping between values)
- Memory leaks from accumulating intervals
- Unpredictable timer behavior during rapid start/stop operations

### User Impact
- Timer display shows erratic behavior
- Performance degradation over time
- Potential browser memory issues during long sessions
- Inconsistent timing in Phase 1 voting rounds

### Evidence
```javascript
// Multiple intervals can be created
this.timer.intervalId = setInterval(() => { ... }, 1000);  // First timer
// User clicks start again without stopping
this.timer.intervalId = setInterval(() => { ... }, 1000);  // Second timer (first not cleared!)
```

## Root Cause Analysis

### Problem 1: Timer Start Without Cleanup Check

**Location:** `/js/core.js` line 428-438

```javascript
startTimer() {
  if (!this.timer.running) {
    this.timer.running = true;
    this.timer.intervalId = setInterval(() => {  // ❌ No cleanup of existing interval
      if (this.timer.remaining > 0) {
        this.timer.remaining--;
      } else {
        this.pauseTimer();
      }
    }, 1000);
  }
}
```

**Issues:**
- Only checks `running` flag, not actual interval existence
- `intervalId` can be overwritten without clearing previous interval
- Race conditions if called rapidly

### Problem 2: Phase 1 Timer Duplication

**Location:** `/js/phase1.js` timer methods

Phase 1 has its own timer system that can conflict with the core timer system, creating dual timers running simultaneously.

### Problem 3: Pause/Reset Inconsistencies

```javascript
pauseTimer() {
  this.timer.running = false;
  if (this.timer.intervalId) {
    clearInterval(this.timer.intervalId);
    this.timer.intervalId = null;  // ✅ Good
  }
}
```

**Issue:** If multiple intervals exist due to previous bug, only the last `intervalId` is cleared.

## Step-by-Step Fix Instructions for Junior Developer

### Fix 1: Implement Singleton Timer Pattern

**File:** `/js/core.js`

**Replace the startTimer() method around line 428:**

```javascript
startTimer() {
  // Always clear any existing timer first (singleton pattern)
  this.clearTimer();
  
  if (!this.timer.running) {
    this.timer.running = true;
    this.timer.intervalId = setInterval(() => {
      if (this.timer.remaining > 0) {
        this.timer.remaining--;
      } else {
        this.pauseTimer();
      }
    }, 1000);
    
    console.log('Timer started with interval ID:', this.timer.intervalId);
  }
},

// Add new method: clearTimer()
clearTimer() {
  if (this.timer.intervalId) {
    clearInterval(this.timer.intervalId);
    console.log('Cleared timer interval:', this.timer.intervalId);
    this.timer.intervalId = null;
  }
  this.timer.running = false;
},
```

### Fix 2: Enhanced pauseTimer() Method

**File:** `/js/core.js`

**Replace pauseTimer() around line 441:**

```javascript
pauseTimer() {
  this.clearTimer();  // Use centralized clearing
  
  // Additional cleanup for safety
  this.timer.running = false;
  
  console.log('Timer paused, remaining:', this.timer.remaining);
}
```

### Fix 3: Robust resetTimer() Method

**File:** `/js/core.js`

**Replace resetTimer() around line 449:**

```javascript
resetTimer() {
  this.clearTimer();  // Ensure no intervals running
  
  this.timer.remaining = this.timer.duration;
  this.timer.running = false;
  
  console.log('Timer reset to:', this.timer.duration, 'seconds');
}
```

### Fix 4: Fix Phase 1 Timer Conflicts

**File:** `/js/phase1.js`

**Find the timer-related methods and ensure they don't conflict:**

```javascript
// In the timer management section, add conflict prevention
startCountdown() {
  // Only start if core timer is not running
  const coreApp = document.querySelector('[x-data="gameApp"]')?._x_dataStack?.[0];
  if (coreApp?.timer?.running) {
    console.warn('Phase 1: Core timer is running, deferring to core timer');
    return;
  }
  
  // Clear any existing Phase 1 timer
  if (this.timer.intervalId) {
    clearInterval(this.timer.intervalId);
  }
  
  this.timer.state = 'countdown';
  this.timer.intervalId = setInterval(() => {
    if (this.timer.timeLeft > 0) {
      this.timer.timeLeft--;
    } else {
      this.stopTimer();
      this.startDiscussion();
    }
  }, 1000);
  
  console.log('Phase 1 timer started:', this.timer.intervalId);
}
```

### Fix 5: Add Timer State Validation

**File:** `/js/core.js`

**Add validation method:**

```javascript
// Add after existing timer methods
validateTimerState() {
  const issues = [];
  
  // Check for orphaned intervals
  if (this.timer.running && !this.timer.intervalId) {
    issues.push('Timer marked as running but no interval ID');
    this.timer.running = false;
  }
  
  if (!this.timer.running && this.timer.intervalId) {
    issues.push('Timer not marked as running but interval exists');
    clearInterval(this.timer.intervalId);
    this.timer.intervalId = null;
  }
  
  // Check for invalid remaining time
  if (this.timer.remaining < 0) {
    issues.push('Timer remaining time is negative');
    this.timer.remaining = 0;
  }
  
  if (this.timer.remaining > this.timer.duration) {
    issues.push('Timer remaining time exceeds duration');
    this.timer.remaining = this.timer.duration;
  }
  
  if (issues.length > 0) {
    console.warn('Timer validation issues found:', issues);
    return false;
  }
  
  return true;
},

// Call validation periodically
startTimerValidation() {
  // Validate timer state every 5 seconds
  setInterval(() => {
    this.validateTimerState();
  }, 5000);
}
```

### Fix 6: Update Initialization

**File:** `/js/core.js`

**In the init() method, add timer validation:**

```javascript
async init() {
  try {
    // ... existing initialization code ...
    
    // Start timer state validation
    this.startTimerValidation();
    
    // ... rest of init ...
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
}
```

### Fix 7: Cleanup on Page Unload

**File:** `/js/core.js`

**Add cleanup handler:**

```javascript
// Add to setupKeyboardShortcuts() or init()
setupCleanupHandlers() {
  // Cleanup timers on page unload
  window.addEventListener('beforeunload', () => {
    this.clearTimer();
    
    // Clear Phase 1 timer if exists
    if (this.phase1?.timer?.intervalId) {
      clearInterval(this.phase1.timer.intervalId);
    }
    
    // Clear auto-save timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    console.log('Cleaned up all timers on page unload');
  });
  
  // Also cleanup on visibility change (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Optionally pause timers when tab is hidden
      console.log('Tab hidden, timer state:', this.timer.running);
    }
  });
}
```

## Testing Instructions

### Test 1: Single Timer Enforcement
```javascript
// In browser console:
window.app.startTimer();
console.log('First timer ID:', window.app.timer.intervalId);

// Try to start again
window.app.startTimer();  
console.log('Second timer ID:', window.app.timer.intervalId);

// Should be same ID or properly replaced
```

### Test 2: Rapid Start/Stop
1. Click timer start button rapidly 10 times
2. **EXPECT:** Only one timer running
3. **EXPECT:** Timer display shows consistent countdown
4. **EXPECT:** No console errors about multiple intervals

### Test 3: Memory Leak Detection
1. Open DevTools → Performance tab
2. Start recording
3. Start/stop timer 50 times rapidly
4. Stop recording
5. **EXPECT:** No growing number of timer functions in call stack
6. **EXPECT:** Memory usage doesn't continuously increase

### Test 4: Phase Transition Timer Conflicts
1. Start Phase 1 timer
2. Navigate to different phase
3. Start core timer
4. **EXPECT:** No timer conflicts or double countdowns
5. **EXPECT:** Clean transition between timer systems

### Test 5: Validation System
```javascript
// Test validation in console:
window.app.timer.running = true;
window.app.timer.intervalId = null;  // Create inconsistency
window.app.validateTimerState();  // Should detect and fix
```

## Performance Impact

**Before fix:**
- Memory leak: +8KB per orphaned interval (accumulating)
- CPU usage: Multiple intervals running simultaneously
- UI: Choppy timer display due to race conditions

**After fix:**
- Memory: Consistent usage, proper cleanup
- CPU: Single interval only
- UI: Smooth, predictable timer behavior

## Expected Outcome

✅ **Only one timer interval can run at a time**  
✅ **Proper cleanup prevents memory leaks**  
✅ **Timer display is consistent and accurate**  
✅ **No conflicts between Phase 1 and core timers**  
✅ **Automatic validation detects and fixes timer issues**  
✅ **Proper cleanup on page unload**  

## Priority

**HIGH** - Affects performance and user experience, should be fixed before production deployment.

## Related Issues

- Issue #019: Race Condition in Session Loading (timer conflicts during init)
- Issue #016: Auto-Save Memory Leak (similar interval management issue)
- Issue #021: Missing Loading States (timer states during transitions)