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

**🚨 Phase 2: Analogie-Deconstructie - COMPLETE REDESIGN REQUIRED**
- Current control panel has wrong functionality (pattern recognition, archetype templates)
- **CRITICAL: Presentation display shows Decomposition Analysis from old 4-phase model**
- Needs complete replacement with source selection, vertical analysis, and unified canvas

**🚨 Phase 3: AI Actieplan - MAJOR REDESIGN REQUIRED** 
- Current hypothesis builder is generic, not AI-focused
- Missing gap analysis and AI solution framework
- Needs priority matrix and investment planning tools

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

## 🔥 CRITICAL REDESIGN - Version 1 "Analogie-Deconstructie" Implementation

### **13.0 Phase 2: Complete Redesign to "Analogie-Deconstructie"** ✅ COMPLETE
**Priority:** CRITICAL - Current Phase 2 implementation is completely wrong for Version 1
**Scope:** Complete replacement of both control panel and presentation display

#### **13.1 Remove Old Implementation** ✅
- [x] **13.1.1 Delete wrong presentation display**
  - [x] Remove lines 930-1040 in index.html (Decomposition Analysis content)
  - [x] Remove all `phase3.forerunner`, `positiveAnalogies`, `negativeAnalogies` references
  - [x] Remove "Select Forerunner" and "Decomposition Analysis" text
  
- [x] **13.1.2 Remove archetype control panel**
  - [x] Remove pattern recognition interface from control panel
  - [x] Remove archetype templates (lines 508-529 in core.js)
  - [x] Remove `applyArchetypeTemplate()` function
  - [x] Clear `phase2.patterns` and `phase2.archetype` data model

#### **13.2 Implement Source Company Selection** ✅
- [x] **13.2.1 Create source selector interface**
  - [x] Multi-select grid of Phase 1 winners (1-3 selections)
  - [x] Visual indicators for selected sources (colors/badges)
  - [x] Strategic rationale input field per selection
  - [x] Save to `phase2.selectedSources[]`

#### **13.3 Build Vertical Analysis Tool** ✅
- [x] **13.3.1 Create per-source analysis interface**
  - [x] Tabbed view for each selected source company
  - [x] Premise entry fields (WHY this strategy works)
  - [x] Conclusion documentation fields
  - [x] Causal chain visualization
  - [x] Save to `phase2.verticalAnalyses{}`

#### **13.4 Implement Unified Canvas Interface** ✅
- [x] **13.4.1 Create three-column canvas table**
  - [x] Source column: Dropdown from selectedSources
  - [x] Relation column: Positive/Negative selector with icons
  - [x] Target column: Free-text mapping to our company
  - [x] Row CRUD operations (Add, Edit, Delete)
  - [x] Save to `phase2.canvasRows[]`

- [x] **13.4.2 Add canvas management features**
  - [x] Filter by source company
  - [x] Filter by positive/negative relations  
  - [x] Group view by source
  - [x] Summary statistics (counts per source/relation)
  - [x] Export negative mappings to Phase 3

#### **13.5 Create New Presentation Display** ✅
- [x] **13.5.1 Build live canvas visualization**
  - [x] Show selected source companies
  - [x] Display canvas mappings in real-time
  - [x] Highlight gaps (negative-only areas)
  - [x] Visual progress indicators

### **14.0 Phase 3: Complete Redesign to "AI Actieplan"**
**Priority:** HIGH - After Phase 2 redesign complete

#### **14.1 Remove Generic Hypothesis Builder**
- [ ] **14.1.1 Replace current Phase 3 implementation**
  - [ ] Remove generic IF-THEN hypothesis templates
  - [ ] Remove general action item tracker
  - [ ] Clear current `phase3` data structure

#### **14.2 Implement Gap Analysis Dashboard**
- [ ] **14.2.1 Import and consolidate gaps**
  - [ ] Auto-import negative analogies from Phase 2
  - [ ] Group similar gaps from multiple sources
  - [ ] Categorize by strategic area (Innovation, Platform, etc.)
  - [ ] Priority scoring based on frequency
  - [ ] Save to `phase3.consolidatedGaps[]`

#### **14.3 Build AI Solution Generator**
- [ ] **14.3.1 Per-gap solution interface**
  - [ ] Central question framework: "How can AI bridge this gap?"
  - [ ] Solution category selector (Automation, Enhancement, Innovation, Intelligence)
  - [ ] Feasibility assessment fields
  - [ ] Resource estimation inputs
  - [ ] Save to `phase3.aiSolutions[]`

#### **14.4 Implement Priority Matrix**
- [ ] **14.4.1 Multi-dimensional scoring**
  - [ ] Impact vs Effort grid visualization
  - [ ] Drag-and-drop solution positioning
  - [ ] Auto-categorize quadrants (Quick wins, Major projects, etc.)
  - [ ] Save to `phase3.priorityMatrix[]`

#### **14.5 Create AI Action Plan Builder**
- [ ] **14.5.1 Phased roadmap generator**
  - [ ] Group solutions into waves (Quick, Medium, Long term)
  - [ ] Success metrics definition
  - [ ] Dependency mapping
  - [ ] Investment summary generation
  - [ ] Save to `phase3.actionPlan{}`

### **15.0 Updated Phase Transitions**
#### **15.1 Phase 1 → Phase 2 Transition**
- [ ] Pass complete winner data with strategic context
- [ ] Pre-populate source selector with winners
- [ ] Clear transition instructions for facilitator

#### **15.2 Phase 2 → Phase 3 Transition** 
- [ ] Auto-extract negative analogies as gaps
- [ ] Preserve source company linkages
- [ ] Initialize gap analysis dashboard

### **TASKS TO REMOVE/DEPRECATE:**
- ❌ Task 9.0 (old Archetype fix) - completely wrong approach
- ❌ Task 10.1 (archetype templates) - not used in Version 1
- ❌ Task 10.2 (Pattern Recognition) - replaced with canvas
- ❌ Task 11.0 (Winner enhancement) - already implemented
- ❌ Task 8.2 (old archetype transition) - needs complete rewrite

### **UPDATED DUTCH LANGUAGE REQUIREMENTS:**
- **Phase 2 Terms:** "Analogie-Deconstructie", "Verticale Analyse", "Bron Bedrijf"
- **Phase 3 Terms:** "AI Actieplan", "Gap Analyse", "Prioriteits Matrix"
- **Canvas Terms:** "Positieve/Negatieve Analogie", "Doel Mapping"

This represents a fundamental shift from pattern-based archetype building to rigorous causal analysis with AI-specific solutions.

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

## Supporting Tasks (After Critical Redesign)

### **16.0 Dutch Language Updates for Version 1**
**Priority:** HIGH - After Phase 2/3 redesign

- [ ] **16.1 Translate new Phase 2 interface**
  - [ ] "Analogie-Deconstructie" → main title
  - [ ] "Bron Bedrijf Selectie" → source selection
  - [ ] "Verticale Analyse" → causal analysis
  - [ ] "Mapping Canvas" → canvas interface
  - [ ] "Positieve/Negatieve Analogie" → relation types

- [ ] **16.2 Translate new Phase 3 interface**
  - [ ] "AI Actieplan" → main title
  - [ ] "Gap Analyse" → gap dashboard
  - [ ] "AI Oplossingen" → solution generator
  - [ ] "Prioriteits Matrix" → priority matrix
  - [ ] "Investerings Roadmap" → action plan

- [ ] **16.3 Update facilitator guides**
  - [ ] Phase 2 guide: Source selection and canvas usage
  - [ ] Phase 3 guide: Gap analysis and AI brainstorming
  - [ ] Canvas instructions and best practices

### **17.0 Testing & Quality Assurance**
**Priority:** MEDIUM - After implementation

- [ ] **17.1 Create new test scenarios**
  - [ ] Source company selection flows
  - [ ] Canvas CRUD operations
  - [ ] Vertical analysis saving/loading
  - [ ] Gap extraction and consolidation
  - [ ] AI solution generation
  - [ ] Priority matrix interactions

- [ ] **17.2 Update existing tests**
  - [ ] Remove archetype-related tests
  - [ ] Update Dutch UI text expectations
  - [ ] Phase transition test scenarios
  - [ ] Data persistence for new models

## Future Enhancements (Version 2.0+)

### **18.0 Multiple Game Versions**
**Priority:** FUTURE - After Version 1 complete

- [ ] **18.1 Version selection interface**
  - [ ] Game mode selector on startup
  - [ ] Version 1: "Strategische Blauwdruk" (rigorous analysis)
  - [ ] Version 2: "Disruption Game" (creative business models)  
  - [ ] Version 3: "Verhaal & Verander" (team alignment)

- [ ] **18.2 Conditional interface logic**
  - [ ] Dynamic Phase 2/3 content based on version
  - [ ] Version-specific data models
  - [ ] Adaptive facilitator guides

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

## Success Criteria for Version 1 "Analogie-Deconstructie"

### **Phase 2: Analogie-Deconstructie**
- [ ] Source company selection (1-3 from winners) works
- [ ] Vertical analysis captures WHY each strategy succeeds
- [ ] Unified canvas allows flexible positive/negative mapping
- [ ] Presentation view shows live canvas visualization
- [ ] All interface text in professional Dutch

### **Phase 3: AI Actieplan** 
- [ ] Gap analysis imports negative analogies from Phase 2
- [ ] AI solution generator addresses each specific gap
- [ ] Priority matrix visualizes impact vs effort
- [ ] Action plan produces concrete AI investment roadmap
- [ ] Output is defendable and linked to strategic analysis

### **Overall Application**
- [ ] Complete end-to-end workflow from preference → gaps → AI solutions
- [ ] All data persists correctly through LocalForage
- [ ] Smooth transitions between all phases
- [ ] Professional Dutch throughout (Nederlandse zakentaal)
- [ ] Export generates comprehensive session reports