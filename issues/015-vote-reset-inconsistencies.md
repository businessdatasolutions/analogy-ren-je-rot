# Issue #015: Vote Reset Inconsistencies

**Status:** ⚠️ High Priority - Data Integrity  
**Component:** Phase 1 Voting System  
**Reported:** 2024-01-03  
**Severity:** High - Inconsistent state management  

## Problem Description

The vote reset functionality has multiple inconsistencies that can lead to:

- Votes not being properly cleared from current pair display
- pairVotes data persisting when individual pair votes are reset
- UI showing incorrect vote counts after reset operations
- Session state becoming out of sync with displayed data

### User Impact
- Facilitators see incorrect vote displays after reset
- Vote statistics don't match actual voting state
- Confusion about whether votes were actually reset
- Potential for double-counting or missed votes

### Evidence
```javascript
// After clicking "Reset Current Pair Votes"
votingSystem.votes = { companyA: 0, companyB: 0 };  // ✅ Current pair cleared
// BUT:
pairVotes[currentIndex] = { companyA: 5, companyB: 3 };  // ❌ Still exists!
```

## Root Cause Analysis

### Problem 1: Incomplete Reset in votingSystem

**Location:** `/js/phase1.js` votingSystem methods

Current reset logic only clears display votes but not the persistent pairVotes storage:

```javascript
resetVotes() {
  this.votes = { companyA: 0, companyB: 0 };
  this.totalVotes = 0;
  this.percentageA = 0;
  this.percentageB = 0;
  // ❌ Missing: this.pairVotes[currentIndex] cleanup
}
```

### Problem 2: UI and Data State Mismatch

The UI shows votes from `votingSystem.votes` but persistence uses `pairVotes`. When only one is cleared, they get out of sync.

### Problem 3: Multiple Reset Pathways

Different reset functions exist with different behaviors:
- `resetVotes()` - resets current display only
- "Reset Current Pair" button - unclear what it actually resets
- `clearLocalStorage()` - resets everything

## Step-by-Step Fix Instructions for Junior Developer

### Fix 1: Implement Comprehensive resetCurrentPair()

**File:** `/js/phase1.js`

**Find the votingSystem object and enhance the reset functionality:**

```javascript
// In the votingSystem object, replace resetVotes() with:
resetCurrentPair() {
  const currentIndex = this.companyPairs.currentIndex;
  
  // Clear current display votes
  this.votes = { companyA: 0, companyB: 0 };
  this.totalVotes = 0;
  this.percentageA = 0;
  this.percentageB = 0;
  
  // Clear persistent votes for current pair
  if (this.pairVotes[currentIndex]) {
    delete this.pairVotes[currentIndex];
    console.log(`Cleared votes for pair ${currentIndex}`);
  }
  
  // Update session immediately
  const coreApp = document.querySelector('[x-data="gameApp"]')?._x_dataStack?.[0];
  if (coreApp) {
    coreApp.markUnsaved();
  }
  
  // Validate state consistency
  this.validateVoteState();
},

// Add new method for resetting all votes
resetAllVotes() {
  // Clear current display
  this.votes = { companyA: 0, companyB: 0 };
  this.totalVotes = 0;
  this.percentageA = 0;
  this.percentageB = 0;
  
  // Clear all persistent votes
  this.pairVotes = {};
  
  // Reset celebration state
  this.celebrationTriggered = false;
  
  const coreApp = document.querySelector('[x-data="gameApp"]')?._x_dataStack?.[0];
  if (coreApp) {
    coreApp.markUnsaved();
  }
  
  console.log('All votes reset');
  this.validateVoteState();
},

// Add validation method
validateVoteState() {
  const currentIndex = this.companyPairs.currentIndex;
  const displayTotal = this.votes.companyA + this.votes.companyB;
  const storedVotes = this.pairVotes[currentIndex];
  
  if (storedVotes) {
    const storedTotal = storedVotes.companyA + storedVotes.companyB;
    
    if (displayTotal !== storedTotal) {
      console.warn('Vote state mismatch:', {
        display: this.votes,
        stored: storedVotes,
        pairIndex: currentIndex
      });
      
      // Auto-repair: Use stored votes as source of truth
      this.loadVotesForCurrentPair();
      return false;
    }
  }
  
  return true;
}
```

### Fix 2: Update loadVotesForCurrentPair()

**File:** `/js/phase1.js`

**Enhance the vote loading logic:**

```javascript
loadVotesForCurrentPair() {
  const currentIndex = this.companyPairs.currentIndex;
  const pairVotes = this.pairVotes[currentIndex];
  
  if (pairVotes) {
    // Load stored votes
    this.votes = {
      companyA: pairVotes.companyA || 0,
      companyB: pairVotes.companyB || 0
    };
    
    this.totalVotes = this.votes.companyA + this.votes.companyB;
    this.percentageA = this.totalVotes > 0 ? Math.round((this.votes.companyA / this.totalVotes) * 100) : 0;
    this.percentageB = this.totalVotes > 0 ? Math.round((this.votes.companyB / this.totalVotes) * 100) : 0;
    
    console.log(`Loaded votes for pair ${currentIndex}:`, this.votes);
  } else {
    // No votes for this pair - ensure clean slate
    this.votes = { companyA: 0, companyB: 0 };
    this.totalVotes = 0;
    this.percentageA = 0;
    this.percentageB = 0;
    
    console.log(`No votes for pair ${currentIndex}, reset to zero`);
  }
  
  // Validate consistency
  this.validateVoteState();
}
```

### Fix 3: Update Vote Methods to Maintain Consistency

**File:** `/js/phase1.js`

**Enhance voteA() and voteB() methods:**

```javascript
voteA() {
  this.votes.companyA++;
  this.updateVoteStatistics();
  this.saveCurrentPairVotes();  // ✅ Add this
  this.validateVoteState();     // ✅ Add this
},

voteB() {
  this.votes.companyB++;
  this.updateVoteStatistics();
  this.saveCurrentPairVotes();  // ✅ Add this
  this.validateVoteState();     // ✅ Add this
},

decreaseVoteA() {
  if (this.votes.companyA > 0) {
    this.votes.companyA--;
    this.updateVoteStatistics();
    this.saveCurrentPairVotes();  // ✅ Add this
    this.validateVoteState();     // ✅ Add this
  }
},

decreaseVoteB() {
  if (this.votes.companyB > 0) {
    this.votes.companyB--;
    this.updateVoteStatistics();
    this.saveCurrentPairVotes();  // ✅ Add this
    this.validateVoteState();     // ✅ Add this
  }
},

// Add helper method
saveCurrentPairVotes() {
  const currentIndex = this.companyPairs.currentIndex;
  this.pairVotes[currentIndex] = {
    companyA: this.votes.companyA,
    companyB: this.votes.companyB
  };
  
  // Trigger session save
  const coreApp = document.querySelector('[x-data="gameApp"]')?._x_dataStack?.[0];
  if (coreApp) {
    coreApp.markUnsaved();
  }
}
```

### Fix 4: Update HTML Reset Button

**File:** `/index.html`

**Find the reset button around line (search for "Herstel Stemmen"):**

```html
<!-- Current button (around line with "Herstel Stemmen Huidige Paar") -->
<button @click="phase1?.resetVotes?.()" class="...">
  🔄 Herstel Stemmen Huidige Paar
</button>
```

**Replace with:**

```html
<button @click="phase1?.resetCurrentPair?.()" 
        class="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 px-3 rounded text-xs font-medium transition-colors">
  🔄 Herstel Stemmen Huidige Paar
</button>

<!-- Add additional reset option -->
<button @click="phase1?.resetAllVotes?.()" 
        x-show="Object.keys(phase1?.pairVotes || {}).length > 1"
        @click.confirm="'Weet u zeker dat u ALLE stemmen wilt wissen?'"
        class="w-full bg-red-100 hover:bg-red-200 text-red-800 py-2 px-3 rounded text-xs font-medium transition-colors mt-2">
  🗑️ Wis Alle Stemmen
</button>
```

### Fix 5: Add State Validation UI

**File:** `/index.html`

**Add debugging info for facilitators (in control mode only):**

```html
<!-- Add after vote statistics in Phase 1 -->
<div x-show="!presentationMode && phase1?.validateVoteState" class="mt-2 text-xs text-gray-500">
  <div x-show="!phase1.validateVoteState()" class="bg-yellow-50 border border-yellow-200 p-2 rounded">
    ⚠️ Stemstatus inconsistentie gedetecteerd - automatisch hersteld
  </div>
  <div class="flex justify-between">
    <span>Paar: <span x-text="(phase1?.companyPairs?.currentIndex || 0) + 1"></span></span>
    <span>Opgeslagen: <span x-text="Object.keys(phase1?.pairVotes || {}).length"></span></span>
  </div>
</div>
```

## Testing Instructions

### Test 1: Current Pair Reset
1. Vote several times on current pair (e.g., A: 3, B: 2)
2. Click "Herstel Stemmen Huidige Paar"
3. **EXPECT:** Display shows 0-0
4. Navigate to next pair and back
5. **EXPECT:** Still shows 0-0 (not restored from pairVotes)

### Test 2: Multi-Pair Reset Consistency
1. Vote on pairs 1, 2, 3 with different vote counts
2. Go back to pair 1
3. Reset current pair votes
4. Navigate through pairs 2 and 3
5. **EXPECT:** Pairs 2 and 3 retain their votes
6. **EXPECT:** Pair 1 shows 0-0

### Test 3: State Validation
```javascript
// In browser console after voting:
console.log('Validation result:', window.app.phase1.validateVoteState());

// Create inconsistency manually:
window.app.phase1.votes.companyA = 10;  // Don't update pairVotes
console.log('After manual change:', window.app.phase1.validateVoteState());
// Should detect mismatch and auto-repair
```

### Test 4: Session Persistence After Reset
1. Vote on multiple pairs
2. Reset one specific pair
3. Refresh browser page
4. **EXPECT:** Reset pair still shows 0-0
5. **EXPECT:** Other pairs retain their votes

### Test 5: All Votes Reset
1. Complete voting on all 5 pairs
2. Click "Wis Alle Stemmen" (if button appears)
3. Confirm the action
4. **EXPECT:** All pairs show 0-0
5. **EXPECT:** No winners calculated
6. **EXPECT:** Celebration not triggered

## Edge Cases to Test

### Edge Case 1: Reset During Timer
1. Start voting timer
2. While timer running, click reset
3. **EXPECT:** Reset works correctly
4. **EXPECT:** Timer continues normally

### Edge Case 2: Reset on Last Pair
1. Complete all pairs except last
2. Vote on last pair
3. Reset last pair votes
4. **EXPECT:** Celebration not triggered
5. **EXPECT:** Can still vote on last pair

### Edge Case 3: Rapid Reset Clicks
1. Vote several times
2. Click reset button rapidly 5 times
3. **EXPECT:** No errors in console
4. **EXPECT:** Votes consistently at 0-0

## Expected Outcome

✅ **Reset buttons clear both display and persistent votes**  
✅ **State validation prevents UI/data mismatches**  
✅ **Different reset options (current vs all) work correctly**  
✅ **Session persistence respects reset operations**  
✅ **Vote statistics remain consistent after reset**  
✅ **No orphaned vote data in pairVotes object**  

## Priority

**HIGH** - Data integrity issues can confuse facilitators and invalidate voting results.

## Related Issues

- Issue #012: Phase 1 Winners Not Transferring (affected by inconsistent vote data)
- Issue #013: Phase 1 State Not Properly Saved (vote state is part of session data)
- Issue #018: Missing Error Boundaries (should catch vote state errors)