# Issue #011: Alpine.js Scope Errors and Celebration Screen Not Triggering

**Status:** 🔴 Critical - Application Breaking  
**Component:** Phase 2 (Analogie-Deconstructie) & Phase 1 Celebration  
**Reported:** 2024-01-03  
**Severity:** High - Multiple features non-functional  

## Problem Description

Multiple JavaScript errors are preventing Phase 2 from functioning correctly and the Phase 1 celebration screen is not appearing when pressing 'N' after voting on the last pair.

### Console Errors

1. **Alpine.js Scope Errors in Canvas Interface:**
```
Alpine Expression Error: viewMode is not defined
Alpine Expression Error: filteredRows is not defined
```

2. **Phase 4 Reference Errors:**
```
Alpine Expression Error: phase4 is not defined
Expression: "phase4.hypotheses"
Expression: "phase4.actionItems"
```

3. **Celebration Screen Issue:**
- Pressing 'N' key after voting on the last pair does nothing
- No celebration screen appears
- User cannot proceed to Phase 2 with winners

## Root Cause Analysis

### 1. Canvas Interface Scope Problem
The `x-data` directive containing `viewMode` and `filteredRows()` is defined on a child element (line 677-689) that only shows when `phase2.canvasRows.length > 0`. This causes the scope to be inaccessible to elements outside that container that reference these variables.

**Location:** `/index.html` lines 663-892

### 2. Phase 4 References
Old code references `phase4` which no longer exists after the 3-phase redesign. These should reference `phase3` instead.

**Location:** `/index.html` around lines 1565-1650 (Phase 3 display section)

### 3. Celebration Screen Not Triggered
The 'N' key handler might not be properly checking for celebration conditions or the celebration modal might be hidden due to CSS/Alpine.js issues.

**Location:** `/js/phase1.js` lines 231-249 (nextRound function)

## Fix Plan for Junior Developer

### Step 1: Fix Alpine.js Canvas Scope (PRIORITY 1)

**File:** `/index.html`

**Current Structure (WRONG):**
```html
<!-- Line 663 -->
<div x-show="phase2.selectedSources.length > 0" class="mb-6">
    <!-- ... other elements ... -->
    
    <!-- Line 677 - x-data defined here but needed above -->
    <div x-show="phase2.canvasRows.length > 0" 
         x-data="{ filterSource: '', filterRelation: '', viewMode: 'table', filteredRows() {...} }">
        <!-- Filter controls that use viewMode and filteredRows -->
    </div>
    
    <!-- Line 752+ - These elements need access to viewMode and filteredRows -->
    <div class="bg-white border...">
        <div x-show="viewMode === 'table'">...</div>
        <div x-show="viewMode === 'grouped'">...</div>
    </div>
</div>
```

**Fix - Move x-data to parent container:**
```html
<!-- Line 663 - ADD x-data HERE -->
<div x-show="phase2.selectedSources.length > 0" class="mb-6"
     x-data="{ 
         filterSource: '', 
         filterRelation: '', 
         viewMode: 'table',
         filteredRows() { 
             return phase2.canvasRows.filter(row => {
                 const sourceMatch = !this.filterSource || row.source === this.filterSource;
                 const relationMatch = !this.filterRelation || row.relation === this.filterRelation;
                 return sourceMatch && relationMatch;
             });
         }
     }">
    
    <!-- Line 677 - REMOVE x-data from here -->
    <div x-show="phase2.canvasRows.length > 0" 
         class="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <!-- Filter controls can now access viewMode and filteredRows -->
    </div>
    
    <!-- Canvas table can now access the scope -->
</div>
```

### Step 2: Fix Phase 4 References (PRIORITY 2)

**File:** `/index.html`

**Search for:** All instances of `phase4` (approximately 8 occurrences)
**Replace with:** `phase3`

**Locations to check:**
- Lines around 1565-1650 in Phase 3 display section
- Search for: `phase4.hypotheses`, `phase4.actionItems`
- Replace with: `phase3.hypotheses`, `phase3.actionItems`

### Step 3: Debug Celebration Screen (PRIORITY 3)

**File:** `/js/phase1.js`

**Check the nextRound() function (lines 231-249):**

1. Add console logging to debug:
```javascript
nextRound() {
    console.log('NextRound called'); // ADD THIS
    const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
    const isLastPair = !(app?.phase1?.companyPairs?.canGoNext);
    
    console.log('Is last pair?', isLastPair); // ADD THIS
    console.log('Current phase1 state:', app?.phase1); // ADD THIS
    
    if (isLastPair) {
        // Trigger celebration - facilitator decides when
        if (app?.phase1) {
            console.log('Triggering celebration!'); // ADD THIS
            app.phase1.celebrationTriggered = true;
            app.markUnsaved();
        }
    } else {
        // Normal flow: reset timer and advance
        this.reset();
        if (app?.phase1?.companyPairs?.canGoNext) {
            app.phase1.nextPair();
        }
    }
}
```

2. Check if celebration modal is properly shown in `/index.html`:
   - Search for `x-show="phase1?.celebrationTriggered"`
   - Ensure it's not nested inside another conditional that might be false
   - Check z-index and positioning

### Step 4: Testing Instructions

1. **Test Canvas Filters:**
   - Go to Phase 2
   - Add some canvas rows
   - Try using filters and view mode toggle
   - Console should have no Alpine.js errors

2. **Test Phase 3:**
   - Go to Phase 3
   - Console should have no phase4 reference errors

3. **Test Celebration:**
   - Complete Phase 1 voting on all pairs
   - Press 'N' key on the last pair
   - Celebration screen should appear
   - Check console for debug messages

## Expected Outcome

After fixes:
- ✅ No Alpine.js scope errors in console
- ✅ Canvas filters and view modes work correctly
- ✅ No phase4 reference errors
- ✅ Celebration screen appears when pressing 'N' on last pair
- ✅ Winners transfer correctly to Phase 2

## Additional Notes

- Test in both Chrome and Firefox
- Clear browser cache before testing
- Use browser DevTools to monitor Alpine.js component state
- If celebration still doesn't work, check if `phase1.celebrationTriggered` is being set in Alpine DevTools

## Related Files

- `/index.html` - Main template with Alpine.js bindings
- `/js/phase1.js` - Phase 1 timer and celebration logic
- `/js/core.js` - Core Alpine.js data model
- Issue #008 - Previous celebration timing fix