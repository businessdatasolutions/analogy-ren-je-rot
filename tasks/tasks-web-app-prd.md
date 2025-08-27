# Task List: Analogy Game Facilitator Web Application

Generated from: `web-app-prd.md`  
Date: August 27, 2025  
Approach: Test-Driven Development with Playwright

## Relevant Files

- `package.json` - npm configuration for Playwright testing dependencies
- `playwright.config.js` - Playwright test configuration with browser matrix and webserver setup
- `index.html` - Main application entry point with Alpine.js integration
- `js/core.js` - Session management, Alpine.js setup, and LocalForage integration
- `js/phase2.js` - Preference round functionality (timer, voting, company pairs) ✅
- `js/phase3-archetype.js` - Archetype analysis (pattern recognition, templates)
- `js/phase4-decomposition.js` - Decomposition analysis (forerunner, analogies, causal relations)
- `js/phase5-translation.js` - Strategic translation (hypothesis builder, action items)
- `js/utils.js` - Shared utility functions and helpers
- `css/styles.css` - Custom styles beyond Tailwind CSS
- `data/company-pairs.json` - Extended company pair library for voting rounds
- `tests/01-foundation.spec.js` - Foundation phase tests (Alpine.js, session management) ✅
- `tests/02a-simple-session-test.spec.js` - Basic session management tests ✅
- `tests/02-session-management.spec.js` - Advanced session persistence tests ✅
- `tests/03-phase2-preference-round.spec.js` - Phase 2 preference round functionality tests ✅
- `tests/04-archetype-analysis.spec.js` - Archetype analysis feature tests
- `tests/04-decomposition.spec.js` - Decomposition analysis tests
- `tests/05-translation.spec.js` - Strategic translation tests
- `tests/06-export.spec.js` - Export and reporting functionality tests
- `tests/07-integration.spec.js` - Integration and polish tests
- `tests/e2e-complete-workflow.spec.js` - End-to-end workflow tests
- `tests/fixtures/sample-data.json` - Test data fixtures for all phases

### Notes

- Tests should be run using `npx playwright test [optional/path/to/test/file]`
- Use `npx playwright test --headed` to see browser interactions during development
- Each phase must achieve >95% test coverage before proceeding to next phase
- All tests must pass across Chrome, Firefox, Safari, and Edge browsers
- LocalForage integration should be tested across all supported storage mechanisms

## Tasks

- [x] 1.0 Testing Infrastructure Setup
  - [x] 1.1 Initialize npm project with `npm init -y`
  - [x] 1.2 Install Playwright testing framework with `npm install -D @playwright/test`
  - [x] 1.3 Install browser dependencies with `npx playwright install`
  - [x] 1.4 Create `playwright.config.js` with multi-browser configuration (Chrome, Firefox, Safari, Edge)
  - [x] 1.5 Configure webServer to start `python -m http.server 8000` for testing
  - [x] 1.6 Set up test reporters (HTML, JSON) and trace/screenshot options
  - [x] 1.7 Create `tests/fixtures/sample-data.json` with test data for all phases
  - [x] 1.8 Verify test setup by running `npx playwright test --version`

- [x] 2.0 Phase 1: Foundation & Core Infrastructure  
  - [x] 2.1 Create basic `index.html` with Alpine.js CDN and Tailwind CSS integration
  - [x] 2.2 Write `tests/01-foundation.spec.js` to test Alpine.js initialization
  - [x] 2.3 Create `js/core.js` with session management and LocalForage setup
  - [x] 2.4 Test session create/load/save functionality with LocalForage
  - [x] 2.5 Implement phase navigation system in Alpine.js data structure
  - [x] 2.6 Add loading states and error handling for initialization
  - [x] 2.7 Create basic CSS structure in `css/styles.css`
  - [x] 2.8 Test data persistence across browser refresh scenarios
  - [x] 2.9 Verify >95% test coverage for foundation components
  - [x] 2.10 Ensure all tests pass across Chrome, Firefox, Safari, Edge

- [x] 3.0 Phase 2: Preference Round Implementation
  - [x] 3.1 Write `tests/03-phase2-preference-round.spec.js` with timer and voting test scenarios
  - [x] 3.2 Create `js/phase2.js` with company pair display logic and timer system
  - [x] 3.3 Implement countdown timer with visual progress ring and color changes
  - [ ] 3.4 Add timer audio cues (beeps at 5s, 3s, 1s) with Web Audio API
  - [x] 3.5 Create vote counting interface with A/B vote buttons and real-time counters
  - [ ] 3.6 Implement keyboard shortcuts (Space: start/pause, R: reset, 1/2: vote)
  - [x] 3.7 Build vote tracking system with percentage calculations and reset functionality
  - [x] 3.8 Test timer system with start/pause/reset functionality across browsers
  - [x] 3.9 Create company pair presentation layout optimized for projector display
  - [x] 3.10 Verify vote data persists correctly with LocalForage integration
  - [x] 3.11 Test complete preference round workflow with comprehensive test suite

- [ ] 4.0 Phase 3: Archetype Analysis Features
  - [ ] 4.1 Write `tests/04-archetype-analysis.spec.js` for pattern recognition testing
  - [ ] 4.2 Create `js/phase3-archetype.js` with winners extraction from Phase 2
  - [ ] 4.3 Implement pattern keyword input system with comma-separated parsing
  - [ ] 4.4 Build pattern visualization with individual keyword badges
  - [ ] 4.5 Create archetype template system with pre-defined strategic archetypes
  - [ ] 4.6 Add guided discussion prompts with toggle functionality
  - [ ] 4.7 Implement archetype definition form with 2-3 sentence validation
  - [ ] 4.8 Create presentation view for archetype display during workshops
  - [ ] 4.9 Test data flow from Phase 1 winners to archetype analysis
  - [ ] 4.10 Verify template application and custom archetype editing

- [ ] 5.0 Phase 4: Decomposition Analysis
  - [ ] 5.1 Write `tests/04-decomposition.spec.js` for forerunner analysis testing
  - [ ] 5.2 Create `js/phase3-decomposition.js` with forerunner selection interface
  - [ ] 5.3 Implement positive analogies form with structured fields (business model, customers, go-to-market)
  - [ ] 5.4 Create negative analogies form for market differences and unique assets
  - [ ] 5.5 Build causal relationship mapper with factor-to-outcome connections
  - [ ] 5.6 Add strength indicators for causal relationships (weak, medium, strong)
  - [ ] 5.7 Implement inline editing capabilities with auto-save functionality
  - [ ] 5.8 Create guided questions panel with context-specific prompts
  - [ ] 5.9 Add CRUD operations for analogies and causal relations
  - [ ] 5.10 Test data validation and prevent empty analogy entries

- [ ] 6.0 Phase 5: Strategic Translation
  - [ ] 6.1 Write `tests/05-translation.spec.js` for hypothesis builder testing
  - [ ] 6.2 Create `js/phase4-translation.js` with IF-THEN hypothesis structure
  - [ ] 6.3 Implement hypothesis templates for common strategic patterns
  - [ ] 6.4 Build premise and conclusion input forms with validation
  - [ ] 6.5 Add priority and confidence scoring for each hypothesis
  - [ ] 6.6 Create action item tracker with CRUD operations
  - [ ] 6.7 Implement action item fields (task, owner, deadline, success criteria)
  - [ ] 6.8 Add session summary dashboard with progress indicators
  - [ ] 6.9 Build drag-and-drop prioritization for hypothesis ranking
  - [ ] 6.10 Test complete strategic translation workflow

- [ ] 7.0 Phase 6: Export & Reporting
  - [ ] 7.1 Write `tests/06-export.spec.js` for export functionality testing
  - [ ] 7.2 Implement JSON export with complete session data structure
  - [ ] 7.3 Create comprehensive Markdown report generator with all phases
  - [ ] 7.4 Build export modal interface with format selection options
  - [ ] 7.5 Add file download mechanisms for browser compatibility
  - [ ] 7.6 Format reports for professional presentation (tables, sections, headers)
  - [ ] 7.7 Handle edge cases for empty or partial session data
  - [ ] 7.8 Test export functionality across different browsers
  - [ ] 7.9 Verify report completeness and accuracy
  - [ ] 7.10 Add export timestamp and session metadata

- [ ] 8.0 Phase 7: Integration & Polish
  - [ ] 8.1 Write `tests/07-integration.spec.js` and `tests/e2e-complete-workflow.spec.js`
  - [ ] 8.2 Implement presentation mode toggle with full-screen display
  - [ ] 8.3 Add auto-save functionality with configurable intervals
  - [ ] 8.4 Create settings modal with facilitator preferences
  - [ ] 8.5 Implement accessibility improvements (WCAG 2.1 AA compliance)
  - [ ] 8.6 Add responsive design enhancements for tablet and mobile
  - [ ] 8.7 Test complete end-to-end workflow (Phase 1 → Phase 4 → Export)
  - [ ] 8.8 Verify session recovery after browser interruption
  - [ ] 8.9 Conduct cross-browser compatibility testing (Chrome, Firefox, Safari, Edge)
  - [ ] 8.10 Performance optimization and <2 second phase transition verification
  - [ ] 8.11 Generate final test coverage reports and documentation