# Issue #009: Implement Timer Duration Customization

**Status:** Open  
**Priority:** Low  
**Category:** Feature Enhancement  
**Created:** 2025-08-29  

## Problem Description

The Session Settings modal contains a "Timer Duur (seconden)" field that is currently non-functional. The field appears in the UI but:
- References a non-existent `timer.duration` property
- Has no connection to the actual Phase 1 timer implementation
- Timer is hardcoded to 10 seconds in `js/phase1.js`
- Users may enter values but they have no effect on gameplay

### Current Non-Functional Implementation
```html
<!-- index.html line 1222-1226 -->
<div>
    <label class="block text-sm font-medium text-gray-700 mb-1">Timer Duur (seconden)</label>
    <input type="number" x-model="timer.duration" min="5" max="60"
           class="w-full p-2 border border-gray-300 rounded-md text-sm">
</div>
```

## Feature Request

Implement proper timer duration customization to allow facilitators to adjust the countdown timer for Phase 1 positioning exercises based on their workshop needs.

### Use Cases
- **Larger groups**: May need more time (15-20 seconds) for participants to physically position themselves
- **Smaller groups**: May prefer faster pace with shorter timer (5-8 seconds)
- **Accessibility**: Groups with mobility considerations may need longer positioning time
- **Workshop variations**: Different workshop formats may benefit from timer flexibility

## Proposed Implementation

### 1. Add Timer Duration to Session Settings
```javascript
// In createDefaultSession() - js/core.js
phase1: {
  // ... existing properties
  timerDuration: 10, // Default 10 seconds, customizable
}
```

### 2. Update Session Settings Modal
```html
<!-- Properly bind to session data -->
<input type="number" x-model="session.phase1.timerDuration" 
       min="5" max="60" step="5"
       class="w-full p-2 border border-gray-300 rounded-md text-sm">
```

### 3. Modify Timer Initialization
```javascript
// In createTimer() - js/phase1.js
window.createTimer = function(audioSystem = null, duration = 10) {
  return {
    timeLeft: duration,
    originalTime: duration,
    // ... rest of timer implementation
  };
};
```

### 4. Pass Duration from Session
```javascript
// When initializing Phase 1
timer: window.createTimer(audioSystem, savedData?.timerDuration || 10)
```

### 5. Update Timer Reset Logic
Ensure timer resets use the custom duration, not hardcoded 10 seconds.

## Implementation Considerations

### Validation
- Minimum: 5 seconds (enough time to move)
- Maximum: 60 seconds (prevent excessively long waits)
- Default: 10 seconds (current game design)
- Step: 5 seconds increments for simplicity

### Persistence
- Save timer duration with session data
- Load custom duration when restoring session
- Apply to all pairs in the session consistently

### UI/UX
- Show current duration in control panel
- Add tooltip explaining timer purpose
- Consider showing countdown preview

### Testing Requirements
1. Verify timer uses custom duration
2. Test persistence across session save/load
3. Validate min/max constraints
4. Ensure timer reset uses custom duration
5. Test with different duration values (5, 10, 15, 30, 60)

## Benefits
- **Flexibility**: Adapt to different group sizes and needs
- **Accessibility**: Accommodate participants with different mobility levels
- **Workshop customization**: Support various workshop formats
- **Professional control**: Give facilitators more control over pacing

## Priority Justification
**Low Priority** because:
- Current 10-second timer works for most use cases
- Not blocking any critical functionality
- Nice-to-have feature rather than essential
- Can be added in a future enhancement release

## Acceptance Criteria
- [ ] Timer duration field in settings actually controls Phase 1 timer
- [ ] Duration persists when session is saved/loaded
- [ ] Min/max validation works (5-60 seconds)
- [ ] Timer resets maintain custom duration
- [ ] All Phase 1 timer instances use the custom duration
- [ ] Default remains 10 seconds when not customized

## Related Issues
- Task 8.1: Phase 1→2 Transition (timer is part of Phase 1 mechanics)