# Task List: Analogy Game Facilitator Web Application

Generated from: `web-app-prd.md`  
Date: Updated December 2024  
Approach: Test-Driven Development with Playwright
Status: Phase 1 Near Complete, Critical Phase 2 Display Bug

## Current Project Status

**✅ Phase 1: Strategic Preference Round - 95% COMPLETE**
- Strategic company pairs with voting system fully functional
- Timer, voting, and winner calculation implemented
- Minor transition issues remain

**⚠️ Phase 2: Archetype Analysis - CRITICAL BUG**
- Control panel complete and functional
- **CRITICAL: Presentation display shows wrong content (Decomposition instead of Archetype)**
- Pattern recognition and archetype definition work in control panel

**✅ Phase 3: Strategic Translation - COMPLETE**
- Hypothesis builder with IF-THEN structure functional
- Action item management implemented
- Ready for use once Phase 2 display is fixed

## Existing Files

- `package.json` - npm configuration for Playwright testing dependencies ✅
- `playwright.config.js` - Playwright test configuration with browser matrix and webserver setup ✅
- `index.html` - Main application entry point with Alpine.js integration ⚠️ (Phase 2 display bug)
- `js/core.js` - Session management, Alpine.js setup, and LocalForage integration ⚠️ (English templates)
- `js/phase1.js` - Phase 1 strategic preference round functionality (timer, voting, strategic pairs) ✅
- `css/styles.css` - Custom styles beyond Tailwind CSS ✅
- `data/strategic-pairs.json` - Strategic company pairs with level balancing (26 pairs, 20 dimensions) ✅
- `tests/01-foundation.spec.js` - Foundation phase tests (Alpine.js, session management) ✅
- `tests/02-session-management.spec.js` - Advanced session persistence tests ✅
- `tests/03-phase2-preference-round.spec.js` - Phase 1 preference round functionality tests ⚠️ (needs Dutch updates)
- `tests/fixtures/sample-data.json` - Test data fixtures for all phases ✅

## 🔥 CRITICAL BUGS - Must Fix Immediately

### **9.0 Fix Phase 2 Display Content** 🚨 APPLICATION BREAKING
**Priority:** CRITICAL - Application unusable for Phase 2
**Issue:** Phase 2 presentation display shows "Decomposition Analysis" (old Phase 3) instead of "Archetype Analysis"

- [ ] **9.1 Remove incorrect Decomposition content**
  - [ ] Delete lines 926-1040 in index.html (entire wrong Phase 2 display section)
  - [ ] Remove all references to `phase3.forerunner`, `positiveAnalogies`, `negativeAnalogies`
  - [ ] Remove "Select Forerunner" text and related UI

- [ ] **9.2 Create proper Phase 2 Archetype presentation view**
  - [ ] Display "Archetype Analyse" as main title (Dutch)
  - [ ] Show emerging patterns from winners in visual format
  - [ ] Display archetype definition as it's being created
  - [ ] Show winning companies with vote counts

- [ ] **9.3 Fix data model references**
  - [ ] Ensure Phase 2 display uses `phase2` object, not `phase3`
  - [ ] Connect to `phase2.patterns` and `phase2.archetype` data
  - [ ] Display `phase2.winnersFromPhase1` properly

- [ ] **9.4 Test Phase 2 display works correctly**
  - [ ] Verify presentation mode shows archetype content
  - [ ] Test data flows from control panel to presentation view
  - [ ] Ensure no Decomposition content appears in Phase 2

## Completed Tasks

### ✅ **1.0 Testing Infrastructure Setup** - COMPLETE
All testing infrastructure is in place and functional.

### ✅ **2.0 Foundation & Core Infrastructure** - COMPLETE  
Session management, Alpine.js setup, and basic structure all working.

### ✅ **3.0 Phase 1: Strategic Preference Round** - 95% COMPLETE
- [x] 3.1-3.3, 3.5, 3.7-3.14: Timer, voting, pairs display all complete
- [ ] 3.4 Audio Enhancement - Minor enhancement (can defer)
- [ ] 3.6 Keyboard Shortcuts - Minor enhancement (can defer)

### ✅ **4.0 Phase 2: Archetype Analysis Controls** - COMPLETE
Control panel functionality works, but presentation display is broken (see Critical Bug 9.0)

### ✅ **5.0 Phase 3: Strategic Translation** - COMPLETE
All hypothesis and action item functionality implemented.

### ✅ **6.0 Export & Reporting** - COMPLETE
JSON and Markdown export fully functional.

### ⚠️ **7.0 Dutch Language & Professional Integration** - PARTIAL
- [x] 7.1 Most interface elements in Dutch
- [ ] 7.2-7.5 Some English text remains (see task 10.0)

### ⚠️ **8.1 Phase 1 → Phase 2 Transition** - 85% COMPLETE
- [x] 8.1.1 Implement `getWinners()` function ✅
- [x] 8.1.2 Add phase completion detection ✅
- [x] 8.1.3 Create celebration screen ✅
- [x] 8.1.4 Design compact results summary ✅
- [x] 8.1.5 Implement winner data handoff ✅
- [x] 8.1.6 Add smooth transition animations ✅
- [ ] 8.1.7 Test complete Phase 1-2 workflow

## High Priority Tasks

### **10.0 Complete Dutch Language Consistency**
**Priority:** HIGH - Required for professional use

- [ ] **10.1 Translate all archetype templates to Dutch**
  - [ ] Fix templates in core.js lines 503-524
  - [ ] "digital transformation" → "digitale transformatie"
  - [ ] Translate all template descriptions

- [ ] **10.2 Add Phase 2 Facilitator Guide**
  - [ ] Create guide section in Phase 2 controls
  - [ ] "Patroon Herkenning" instructions
  - [ ] "Archetype Definitie" guidance
  - [ ] Purpose explanation for templates

- [ ] **10.3 Add Phase 3 Facilitator Guide**
  - [ ] Create guide for hypothesis building
  - [ ] Action item instructions
  - [ ] Session completion guidance

- [ ] **10.4 Fix remaining English UI text**
  - [ ] Review all button labels
  - [ ] Check error messages
  - [ ] Verify placeholder text

### **11.0 Enhance Winner Data Structure**
**Priority:** HIGH - Improves strategic context

- [ ] **11.1 Include full strategic context in winners**
  - [ ] Add `dilemmaQuestion` from strategic pair
  - [ ] Include winning company's `strategy`
  - [ ] Add `niveau` and `dimensieNummer`

- [ ] **11.2 Display enhanced data in Phase 2**
  - [ ] Show dilemma question for each winner
  - [ ] Display the chosen strategy
  - [ ] Group by strategic level

- [ ] **11.3 Remove duplicate winner displays**
  - [ ] Keep only enhanced display in "Fase 1 Resultaten"
  - [ ] Remove duplicate from top of Phase 2 controls

### **12.0 Improve Phase Completion Feedback**
**Priority:** MEDIUM - Better UX

- [ ] **12.1 Add progress indicators**
  - [ ] Show "Ronde X van Y" in presentation mode
  - [ ] Visual progress bar for completion
  - [ ] Minimum rounds indicator

- [ ] **12.2 Clear completion notifications**
  - [ ] "Fase 1 Compleet!" message
  - [ ] Audio/visual cue on completion
  - [ ] Manual override for facilitator

- [ ] **12.3 Improve celebration screen trigger**
  - [ ] Better detection logic
  - [ ] Smooth transition to celebration
  - [ ] Clear path to Phase 2

## Remaining Phase Transitions

### **8.2 Phase 2 → Phase 3 Transition**
**Priority:** MEDIUM - After fixing Phase 2 display

- [ ] 8.2.1 Add archetype completion validation
- [ ] 8.2.2 Create archetype summary display
- [ ] 8.2.3 Implement hypothesis template pre-selection
- [ ] 8.2.4 Design transition UI
- [ ] 8.2.5 Test data flow to Phase 3

### **8.3 Phase 3 → Export Transition**
**Priority:** LOW - Nice to have

- [ ] 8.3.1 Add session completion validation
- [ ] 8.3.2 Create completion celebration
- [ ] 8.3.3 Implement session summary
- [ ] 8.3.4 Design final presentation
- [ ] 8.3.5 Add next steps guidance

## Minor Enhancements

### **3.4 Audio Enhancement**
**Priority:** LOW - Can be deferred
- [ ] 3.4.1 Web Audio API for timer beeps
- [ ] 3.4.2 User preference toggle
- [ ] 3.4.3 Cross-browser testing
- [ ] 3.4.4 Autoplay policy compliance

### **3.6 Keyboard Shortcuts**
**Priority:** LOW - Can be deferred
- [ ] 3.6.1 Number key listeners
- [ ] 3.6.2 Map 1→A, 2→B voting
- [ ] 3.6.3 Visual feedback
- [ ] 3.6.4 Timer compatibility

## Testing Requirements

### Immediate Testing Needs
- Fix test file names (phase2 → phase1 confusion)
- Update tests to use Dutch UI text
- Add tests for Phase 2 display (once fixed)
- Verify winner data structure enhancements

### Quality Gates
- All critical bugs must be fixed before release
- Dutch language must be 100% consistent
- Phase transitions must be smooth (<2s)
- All three phases must work end-to-end

## Version 2.0 Features (Future)

- Custom company pair creation
- PDF export with Dutch formatting
- Multi-language support (Dutch primary, English secondary)
- Real-time collaboration
- Advanced analytics
- Integration with presentation tools

## Notes for Development

1. **CRITICAL PRIORITY**: Fix Phase 2 display bug first - application is broken
2. **Language**: Complete Dutch translation before any new features
3. **Testing**: Update tests to match Dutch UI text
4. **File naming**: Consider renaming phase2.js to phase1.js for clarity
5. **Documentation**: Keep CLAUDE.md updated with correct 3-phase structure

## Success Criteria

✅ Application works with 3 phases (not 4)
✅ Phase 2 shows Archetype Analysis (not Decomposition)
✅ All text in professional Dutch
✅ Winners include strategic context
✅ Clear phase completion feedback
✅ Smooth transitions between phases