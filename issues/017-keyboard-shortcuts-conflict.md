# Issue #017: Keyboard Shortcuts Conflict

**Status:** 🔧 Medium Priority - UX Issue  
**Component:** Keyboard Event Handling  
**Reported:** 2024-01-03  
**Severity:** Medium - User experience disruption  

## Problem Description

Keyboard shortcuts (especially 'N' for "Next Round" and letter keys for voting) are triggered even when users are typing in input fields, text areas, or other form elements. This causes:

- Unintended phase transitions while typing
- Vote registrations while filling out forms
- Disrupted text input in Phase 2 analysis fields
- Frustrating user experience during data entry

### User Impact
- Facilitators accidentally trigger actions while typing notes
- Text input interrupted by unintended keyboard shortcuts
- Loss of focus from input fields
- Confusion about why actions are triggered unexpectedly

### Evidence
```javascript
// Current keyboard handler - no input field detection
document.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    case 'n':
      // Always triggers, even when typing in input field!
      this.phase1?.nextRound?.();
      break;
  }
});
```

## Root Cause Analysis

### Problem 1: No Input Field Detection

**Location:** `/js/core.js` line 885+ (setupKeyboardShortcuts)

The keyboard event handler doesn't check if the user is currently typing in an input field, textarea, or contenteditable element.

### Problem 2: Global Event Listener

All keyboard events are captured globally without considering the context where they originated.

### Problem 3: No Modifier Key Requirements

Some shortcuts like 'A' and 'B' for voting conflict with normal typing and should require modifier keys in certain contexts.

## Step-by-Step Fix Instructions for Junior Developer

### Fix 1: Add Input Field Detection

**File:** `/js/core.js`

**Find setupKeyboardShortcuts() around line 885 and add helper function:**

```javascript
setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Check if user is typing in an input field
    if (this.isTypingInInputField(e.target)) {
      // Allow normal typing, don't process shortcuts
      return;
    }
    
    // Check if user is in a modal or dialog
    if (this.isInModal()) {
      // Only allow specific shortcuts in modals
      this.handleModalShortcuts(e);
      return;
    }
    
    // Process normal shortcuts
    this.handleGlobalShortcuts(e);
  });
},

// Add helper method to detect input fields
isTypingInInputField(target) {
  if (!target) return false;
  
  const inputTypes = [
    'input', 'textarea', 'select'
  ];
  
  const tagName = target.tagName.toLowerCase();
  
  // Check for standard input elements
  if (inputTypes.includes(tagName)) {
    return true;
  }
  
  // Check for contenteditable elements
  if (target.contentEditable === 'true') {
    return true;
  }
  
  // Check for elements inside contenteditable containers
  let parent = target.parentElement;
  while (parent) {
    if (parent.contentEditable === 'true') {
      return true;
    }
    parent = parent.parentElement;
  }
  
  return false;
},

// Check if currently in a modal
isInModal() {
  return this.showSessionModal || 
         this.showExportModal || 
         document.querySelector('.modal-open') !== null;
}
```

### Fix 2: Separate Shortcut Handlers

**File:** `/js/core.js`

**Split the keyboard handling into separate methods:**

```javascript
handleGlobalShortcuts(e) {
  // Only process if not typing
  switch (e.key.toLowerCase()) {
    case ' ':  // Spacebar
      if (this.currentPhase === 1 && this.phase1?.timerState === 'ready') {
        e.preventDefault();
        this.phase1.startCountdown();
      } else if (this.currentPhase === 1 && this.phase1?.timerState === 'countdown') {
        e.preventDefault();
        this.phase1.pauseTimer();
      }
      break;
      
    case 'r':  // Reset timer
      if (this.currentPhase === 1) {
        e.preventDefault();
        this.phase1?.resetTimer();
      }
      break;
      
    case 'arrowleft':  // Previous pair
      if (this.currentPhase === 1) {
        e.preventDefault();
        this.phase1?.previousPair();
      }
      break;
      
    case 'arrowright':  // Next pair
      if (this.currentPhase === 1) {
        e.preventDefault();
        this.phase1?.nextPair();
      }
      break;
      
    case 'a':  // Vote A (only in Phase 1)
      if (this.currentPhase === 1) {
        e.preventDefault();
        if (e.shiftKey) {
          this.phase1?.decreaseVoteA();
        } else {
          this.phase1?.voteA();
        }
      }
      break;
      
    case 'b':  // Vote B (only in Phase 1)
      if (this.currentPhase === 1) {
        e.preventDefault();
        if (e.shiftKey) {
          this.phase1?.decreaseVoteB();
        } else {
          this.phase1?.voteB();
        }
      }
      break;
      
    case 'n':  // Next round (requires confirmation in Phase 1)
      if (this.currentPhase === 1 && this.phase1?.timerState === 'discussion') {
        e.preventDefault();
        this.handleNextRoundShortcut();
      }
      break;
      
    case 'delete':  // Clear storage (with modifier)
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        this.clearLocalStorage();
      }
      break;
  }
},

handleModalShortcuts(e) {
  // Limited shortcuts available in modals
  switch (e.key.toLowerCase()) {
    case 'escape':
      e.preventDefault();
      // Close current modal
      if (this.showSessionModal) this.showSessionModal = false;
      if (this.showExportModal) this.showExportModal = false;
      break;
      
    case 'enter':
      // Handle modal confirmations
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+Enter could submit forms in modals
        this.handleModalSubmit(e);
      }
      break;
  }
},

handleNextRoundShortcut() {
  // Add confirmation for 'N' key in critical situations
  const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
  const isLastPair = !(app?.phase1?.companyPairs?.canGoNext);
  
  if (isLastPair) {
    // Require confirmation for last pair
    const confirmed = confirm('Dit is het laatste paar. Weet u zeker dat u wilt doorgaan naar de eindfase?');
    if (confirmed) {
      this.phase1?.nextRound?.();
    }
  } else {
    // Normal next round
    this.phase1?.nextRound?.();
  }
}
```

### Fix 3: Context-Aware Shortcut Display

**File:** `/index.html`

**Update the keyboard shortcuts guide to be context-aware:**

```html
<!-- Find the facilitator guide section and update -->
<div class="mt-2">
  <div class="text-xs text-gray-600 mb-1">Sneltoetsen:</div>
  <div class="grid grid-cols-2 gap-1 text-xs">
    
    <!-- Phase 1 specific shortcuts -->
    <template x-show="currentPhase === 1">
      <div><kbd class="bg-gray-200 px-1 rounded">Space</kbd> Start/Pauzeer</div>
      <div><kbd class="bg-gray-200 px-1 rounded">R</kbd> Timer Herstellen</div>
      <div><kbd class="bg-gray-200 px-1 rounded">←/→</kbd> Navigeer Paren</div>
      <div><kbd class="bg-gray-200 px-1 rounded">A/B</kbd> Stem A/B</div>
      <div><kbd class="bg-gray-200 px-1 rounded">Shift+A/B</kbd> Verminder Stemmen</div>
      <div><kbd class="bg-gray-200 px-1 rounded">N</kbd> Volgende Ronde</div>
    </template>
    
    <!-- Phase 2 specific shortcuts -->
    <template x-show="currentPhase === 2">
      <div class="col-span-2 text-gray-500 italic">
        Sneltoetsen uitgeschakeld tijdens tekst invoer
      </div>
    </template>
    
    <!-- Phase 3 specific shortcuts -->
    <template x-show="currentPhase === 3">
      <div class="col-span-2 text-gray-500 italic">
        Sneltoetsen uitgeschakeld tijdens tekst invoer
      </div>
    </template>
    
    <!-- Global shortcuts -->
    <div><kbd class="bg-gray-200 px-1 rounded">Ctrl+Del</kbd> Opslag Wissen</div>
    <div><kbd class="bg-gray-200 px-1 rounded">Esc</kbd> Sluit Dialoog</div>
    
  </div>
  
  <!-- Input field warning -->
  <div class="mt-2 text-xs text-amber-600" x-show="currentPhase > 1">
    💡 Sneltoetsen zijn uitgeschakeld tijdens tekst invoer
  </div>
  
</div>
```

### Fix 4: Add Visual Feedback for Input State

**File:** `/index.html`

**Add visual indicator when shortcuts are disabled:**

```html
<!-- Add to the header status area -->
<div x-show="!presentationMode" class="text-xs text-gray-500">
  <!-- Existing status indicators -->
  
  <!-- Add keyboard state indicator -->
  <div x-show="currentPhase > 1" class="flex items-center space-x-2 mt-1">
    <div class="w-2 h-2 rounded-full bg-amber-400"></div>
    <span>Sneltoetsen gepauzeerd (tekst invoer actief)</span>
  </div>
  
</div>
```

### Fix 5: Add Shortcut Toggle Option

**File:** `/index.html`

**Add setting to completely disable shortcuts if needed:**

```html
<!-- In settings modal -->
<div class="mb-4">
  <label class="flex items-center">
    <input type="checkbox" 
           x-model="keyboardShortcutsEnabled" 
           @change="toggleKeyboardShortcuts($event.target.checked)"
           class="mr-2">
    <span class="text-sm">Sneltoetsen inschakelen</span>
  </label>
  <div class="text-xs text-gray-500 mt-1">
    Uitschakelen voorkomt onbedoelde acties tijdens tekst invoer
  </div>
</div>
```

**Add corresponding JavaScript:**

```javascript
// Add to Alpine.js data
keyboardShortcutsEnabled: true,

// Add method
toggleKeyboardShortcuts(enabled) {
  this.keyboardShortcutsEnabled = enabled;
  
  if (enabled) {
    this.setupKeyboardShortcuts();
  } else {
    // Remove event listeners
    this.removeKeyboardShortcuts();
  }
  
  this.markUnsaved();
},

removeKeyboardShortcuts() {
  // Remove existing event listeners
  document.removeEventListener('keydown', this.keyboardHandler);
  console.log('Keyboard shortcuts disabled');
}
```

## Testing Instructions

### Test 1: Input Field Protection
1. Navigate to Phase 2
2. Click in a text area (e.g., strategic rationale field)
3. Type letters 'A', 'B', 'N', 'R'
4. **EXPECT:** Letters appear in text field
5. **EXPECT:** No voting or navigation actions triggered

### Test 2: Normal Shortcuts Work
1. Navigate to Phase 1
2. Click outside any input fields
3. Press 'A' key
4. **EXPECT:** Vote A increases
5. Press 'N' key
6. **EXPECT:** Next round action (with confirmation if last pair)

### Test 3: Modal Shortcuts
1. Open settings modal
2. Press 'A' key
3. **EXPECT:** No voting action triggered
4. Press 'Escape' key
5. **EXPECT:** Modal closes

### Test 4: Contenteditable Support
```html
<!-- Test with this HTML element -->
<div contenteditable="true">Type here and test shortcuts</div>
```
1. Type in contenteditable element
2. Press shortcut keys
3. **EXPECT:** No actions triggered while typing

### Test 5: Nested Input Elements
1. Test shortcuts in nested elements:
   ```html
   <div>
     <span>
       <input type="text" />  <!-- Typing here should disable shortcuts -->
     </span>
   </div>
   ```

## Edge Cases to Handle

### Edge Case 1: Focus Changes
1. Start typing in input field
2. Quickly click outside and press shortcut
3. **EXPECT:** Shortcut works after focus leaves input

### Edge Case 2: Dynamic Input Fields
1. Test with inputs created by Alpine.js templates
2. **EXPECT:** Dynamic inputs also disable shortcuts

### Edge Case 3: Rapid Key Presses
1. Type rapidly while moving in/out of input fields
2. **EXPECT:** No missed or double-triggered shortcuts

## Accessibility Considerations

### Screen Reader Support
- Shortcuts should be announced by screen readers
- Focus management should be preserved
- Input field detection should work with assistive technology

### Keyboard Navigation
- Tab order should not be affected
- Custom shortcut keys should not conflict with browser shortcuts
- Focus indicators should remain visible

## Expected Outcome

✅ **Shortcuts disabled while typing in input fields**  
✅ **Context-aware shortcut behavior by phase**  
✅ **Modal-specific shortcut handling**  
✅ **Visual feedback for shortcut state**  
✅ **Option to completely disable shortcuts**  
✅ **Confirmation required for destructive actions**  
✅ **Proper focus management preserved**  

## Priority

**MEDIUM** - Improves user experience significantly but doesn't break core functionality.

## Related Issues

- Issue #020: Inconsistent Dutch Translations (affects shortcut descriptions)
- Issue #018: Missing Error Boundaries (should handle keyboard event errors)
- Issue #021: Missing Loading States (affects when shortcuts should be active)