# Product Requirements Document (PRD): Analogy Game Facilitator Web Application

**Version:** 2.0  
**Date:** August 27, 2025  
**Author:** Claude Code  
**Status:** Phased Implementation with Testing  
**Approach:** Test-Driven Development with Playwright  

---

## 1. Executive Summary

This PRD defines the requirements for a web-based facilitator tool for the "Het Ren-Je-Rot-Analogie-Verkenner-spel" strategic workshop game, specifically designed for Dutch management professionals working in strategy development. The application provides a structured interface to guide Dutch-speaking facilitators through the three phases of the game while capturing participant insights and generating actionable strategic outputs.

**Target Audience:** Dutch management professionals, strategy consultants, and team leaders working in strategic development roles within Dutch organizations and consulting firms.

## 2. Product Objectives

### Primary Objective
Create a user-friendly, frontend-only web application that enables facilitators to efficiently conduct strategic analogy workshops while maintaining high engagement and capturing valuable insights.

### Success Metrics
- **Facilitator Efficiency:** Reduce setup time from 15 minutes to <3 minutes
- **Data Capture:** 100% retention of session data with automatic save
- **User Experience:** Facilitator satisfaction score >4.5/5
- **Technical Performance:** Sub-2 second phase transitions, offline capability
- **Output Quality:** Generate professional session reports automatically

## 3. Target Users

### Primary User: Dutch Workshop Facilitator
- **Profile:** Dutch management professionals, strategy consultants, internal trainers, and team leaders working in strategic development
- **Language:** Native Dutch speakers or professionals fluent in Dutch business terminology
- **Professional Context:** Corporate strategy departments, management consulting firms, business schools, and organizational development teams
- **Experience Level:** Basic to advanced computer skills, experienced in workshop facilitation
- **Usage Context:** Leading 8-20 person strategic workshops in Dutch corporate meeting rooms with projectors
- **Key Needs:** Professional Dutch interface, simple controls, reliable timer, clear visual feedback, comprehensive data capture
- **Business Environment:** Dutch corporate culture, formal business communication ("u" form)

### Secondary User: Dutch Management Participants (Indirect)
- **Profile:** Dutch management teams, strategy departments, project teams, and executive groups
- **Language:** Dutch-speaking business professionals
- **Professional Context:** Mid to senior management levels in Dutch organizations
- **Interaction:** View screens, make strategic positioning choices, receive professional reports in Dutch
- **Key Needs:** Clear Dutch visuals, intuitive choices, engaging strategic experience, professional terminology

### 3.3 Target Market & Language Requirements

**Primary Market:** Netherlands and Dutch-speaking regions of Belgium

**Language Specification:**
- **Primary Language:** Professional Dutch (Nederlandse zakentaal)
- **Formality Level:** Formal business communication using "u" form
- **Terminology:** Consistent Dutch business and strategy terminology
- **Cultural Context:** Dutch business culture and workshop facilitation styles

**Professional Context Requirements:**
- **Industry Focus:** Management consulting, corporate strategy, organizational development
- **Organization Types:** Dutch corporations, multinational companies with Dutch operations, Dutch consulting firms
- **Professional Roles:** Strategy directors, management consultants, HR/OD professionals, team leaders
- **Workshop Environment:** Professional Dutch corporate meeting environments

**Language Guidelines:**
- All interface text must be in professional Dutch
- Strategic terminology should follow Dutch business conventions
- Instructions should be clear and authoritative for business professionals  
- Consistent use of formal address ("u") throughout the application
- Professional business vocabulary appropriate for management-level audiences

## 4. Technical Architecture

### 4.1 Technology Stack

**Frontend Framework**
- **Base:** Plain HTML5, CSS3, Modern JavaScript (ES6+)
- **CSS Framework:** Tailwind CSS v3.x (via CDN)
- **JavaScript Framework:** Alpine.js v3.x (lightweight reactivity)
- **State Management:** Alpine.js stores + LocalForage for persistence

**Supporting Libraries**
- **LocalForage:** Enhanced browser storage with IndexedDB/WebSQL fallbacks
- **Chart.js:** Voting results visualization
- **Sortable.js:** Drag-and-drop for hypothesis ordering
- **jsPDF:** PDF report generation
- **Hotkeys.js:** Keyboard shortcuts

### 4.2 Architecture Principles

1. **No Backend Required:** Pure frontend application deployable as static files
2. **Progressive Enhancement:** Works without JavaScript, enhanced with it
3. **Responsive Design:** Adapts from tablet (facilitator) to projector (participants)
4. **Offline First:** Functions without internet connection after initial load
5. **Data Persistence:** Automatic save to browser storage with export options

## 5. Data Model

### 5.1 Session Object
```javascript
{
  sessionId: "uuid",
  created: "2025-08-27T10:30:00Z",
  facilitator: "string",
  teamName: "string",
  participants: ["string"],
  currentPhase: 1,
  phases: {
    phase1: {
      companyPairs: [CompanyPair],
      results: [VotingResult],
      winners: ["string"]
    },
    phase2: {
      patterns: ["string"],
      archetype: "string"
    },
    phase3: {
      forerunner: "string",
      positiveAnalogies: [Analogy],
      negativeAnalogies: [Analogy],
      causalRelations: [CausalRelation]
    },
    phase4: {
      hypotheses: [Hypothesis],
      actionItems: [ActionItem]
    }
  }
}
```

### 5.2 Supporting Objects
```javascript
CompanyPair {
  id: "string",
  category: "string",
  companyA: Company,
  companyB: Company,
  question: "Wie willen we liever zijn?"
}

Company {
  name: "string",
  description: "string",
  logo: "url",
  characteristics: ["string"]
}

VotingResult {
  pairId: "string",
  votesA: number,
  votesB: number,
  winner: "string",
  timestamp: "datetime"
}
```

## 6. Feature Specifications

### 6.1 Phase 1: Preference Round (Ren-Je-Rot-Reeks)

#### 6.1.1 Company Pair Display
- **Requirement:** Full-screen presentation of company pairs
- **Layout:** Side-by-side companies with logos, names, and key characteristics
- **Responsive:** Optimizes for projector display (16:9 ratio)
- **Visual Design:** High contrast, large fonts for room visibility

#### 6.1.2 Timer System
- **Countdown Timer:** 10-15 seconds (configurable)
- **Visual Indicators:** Progress ring, color changes (green→yellow→red)
- **Audio Cues:** Optional beeps at 5s, 3s, 1s
- **Controls:** Space bar to start/pause, R to reset

#### 6.1.3 Vote Counting
- **Input Methods:** 
  - Manual: +/- buttons for each company
  - Quick: Number keys (1-9) for rapid entry
  - Visual: Large buttons for tablet operation
- **Real-time Display:** Live vote counts during timer
- **Validation:** Prevents negative votes, shows total participants

#### 6.1.4 Scorecard Management
- **Winner Tracking:** Automatically determines and highlights winner
- **Round Navigation:** Previous/Next round controls
- **Progress Indicator:** Shows current round (e.g., "Round 2 of 5")
- **Edit Capability:** Modify results of completed rounds

### 6.2 Phase 2: Archetype Analysis

#### 6.2.1 Winners Overview
- **Winner Display:** Grid view of all winning companies
- **Company Details:** Name, characteristics, voting margin
- **Visual Grouping:** Color coding for pattern recognition

#### 6.2.2 Pattern Recognition Tool
- **Keyword Input:** Free-form text input for pattern words
- **Word Clustering:** Visual grouping of similar concepts
- **Guided Prompts:** Structured questions for business model, customer approach, innovation style

#### 6.2.3 Archetype Builder
- **Template System:** Pre-written archetype templates
- **Custom Input:** Rich text editor for custom descriptions
- **Validation:** Ensures 2-3 sentence limit
- **Preview Mode:** Large text display for team review

### 6.3 Phase 3: Strategic Translation

#### 6.3.1 Hypothesis Builder
- **If-Then Structure:** Enforced format for strategic hypotheses
- **Template System:** Common hypothesis patterns (Platform, Premium, Ecosystem, Innovation, Customer-Centric)
- **Validation:** Ensures clear premise and conclusion
- **Prioritization:** Ranking of hypotheses by importance

#### 6.3.2 Action Item Tracker
- **Task Definition:** What needs to be done
- **Owner Assignment:** Who is responsible
- **Priority Setting:** High, Medium, Low priority levels
- **Status Tracking:** Planned, In Progress, Complete status

#### 6.3.3 Session Summary
- **Progress Overview:** Archetype defined, hypotheses created, actions planned
- **Report Generation:** Comprehensive session overview
- **Export Options:** JSON, Markdown formats
- **Session Completion:** Final review and next steps

## 7. User Interface Design

### 7.1 Design Principles
- **Clarity:** Large fonts, high contrast, minimal clutter
- **Efficiency:** Maximum 2 clicks to any function
- **Accessibility:** WCAG 2.1 AA compliance
- **Professional:** Business-appropriate color scheme and typography for Dutch corporate environments
- **Language:** All interface text in professional Dutch (Nederlandse zakentaal)
- **Cultural Appropriateness:** Design suitable for Dutch business culture and formal workshop settings

### 7.1.1 Dutch Language Requirements
- **Text Language:** All UI elements, labels, instructions, and messages in professional Dutch
- **Formality Level:** Formal business communication using "u" form throughout
- **Terminology Consistency:** Standardized Dutch business and strategy terminology
- **Professional Tone:** Authoritative and clear language appropriate for management audiences
- **Business Context:** Language reflects Dutch corporate culture and strategic development practices

### 7.2 Layout System
- **Desktop/Tablet:** Split view (control panel + presentation)
- **Projector Mode:** Full-screen presentation view
- **Mobile:** Simplified control interface

### 7.3 Visual Design
- **Color Scheme:** 
  - Primary: Blue (#1e40af)
  - Secondary: Green (#059669)
  - Warning: Amber (#d97706)
  - Error: Red (#dc2626)
- **Typography:** System font stack for reliability
- **Icons:** Heroicons for consistency with Tailwind

## 8. Technical Requirements

### 8.1 Performance
- **Load Time:** <3 seconds on 3G connection
- **Phase Transitions:** <1 second response time
- **Timer Accuracy:** ±100ms precision
- **Storage Limit:** Handle 50+ company pairs, 20+ participants

### 8.2 Browser Support
- **Modern Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Features Required:** LocalStorage, ES6, CSS Grid
- **Graceful Degradation:** Basic functionality without JavaScript

### 8.3 Data Management
- **Auto-save:** Every user action saved locally
- **Session Recovery:** Restore interrupted sessions
- **Export Formats:** JSON, PDF, Markdown
- **Data Validation:** Prevent corruption and loss

## 9. Development Phases

### Development Approach: Test-Driven Development with Playwright

This application will be built using a phase-by-phase approach where each phase is thoroughly tested with Playwright before proceeding to the next. Each phase includes both implementation and comprehensive testing.

### Phase 1: Foundation & Core Infrastructure
**Duration:** 2-3 days  
**Focus:** Minimal viable foundation with full test coverage

**Implementation:**
- Basic HTML structure with Alpine.js initialization
- Session management (create, load, save with LocalForage)
- Phase navigation system
- Loading states and error handling
- Tailwind CSS setup and basic styling

**Testing Requirements:**
- Application loads without errors
- Alpine.js initializes correctly
- Session creation and persistence works
- Navigation between phases functions
- Loading states display properly
- Data persists across browser refreshes

**Test Files:**
- `tests/01-foundation.spec.js`

### Phase 2: Preference Round Implementation
**Duration:** 3-4 days  
**Focus:** Core voting functionality with timer

**Implementation:**
- Company pair display system
- Countdown timer with visual indicators
- Vote counting interface (+/- buttons)
- Scorecard with round navigation
- Winner determination logic
- Keyboard shortcuts (Space, R, 1, 2)

**Testing Requirements:**
- Timer starts, stops, resets correctly
- Vote counting increments/decrements properly
- Winner determination is accurate
- Round navigation works (next/previous)
- Keyboard shortcuts function as expected
- Data persists between rounds
- Timer accuracy within ±100ms

**Test Files:**
- `tests/02-preference-round.spec.js`

### Current Status: Complete 3-Phase Application
**Status:** ✅ Complete  
**Focus:** All phases implemented with strategic pairs integration

**Implementation Complete:**
- **Phase 1:** Strategic preference round with strategic pairs (26 pairs, 4 strategic levels)
- **Phase 2:** Archetype analysis with pattern recognition and templates
- **Phase 3:** Strategic translation with hypothesis building and action planning
- **Core Features:** Session management, data persistence, presentation mode
- **Export:** JSON and markdown report generation

**Testing Coverage:**
- Foundation tests: Session management and core functionality
- Strategic pairs integration: Level balancing and pair selection
- Phase transitions and data persistence
- End-to-end workflow validation

**Test Files:**
- `tests/01-foundation.spec.js`
- `tests/02-session-management.spec.js` 
- `tests/03-phase2-preference-round.spec.js`

**Testing Requirements:**
- End-to-end workflow completion
- Presentation mode switching
- Auto-save intervals function
- Accessibility compliance (WCAG 2.1 AA)
- Responsive breakpoints work
- Cross-browser compatibility

**Test Files:**
- `tests/07-integration.spec.js`
- `tests/e2e-complete-workflow.spec.js`

### Testing Infrastructure

**Playwright Configuration:**
```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'python -m http.server 8000',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Test Standards:**
- Each phase must achieve 100% test coverage for its features
- Tests must pass on all browser configurations
- Performance tests ensure <2s phase transitions
- Accessibility tests verify WCAG 2.1 AA compliance
- Data persistence tests verify LocalForage integration

### Quality Gates

**Definition of Done for Each Phase:**
1. All features implemented according to specification
2. All tests pass across all browser configurations
3. Code coverage >95% for the phase
4. Performance benchmarks met
5. Accessibility requirements satisfied
6. Data persistence verified
7. Manual testing completed
8. Documentation updated

**Continuous Integration:**
- Tests run automatically on each commit
- Browser matrix testing on pull requests
- Performance regression testing
- Accessibility auditing with axe-core
- Visual regression testing for UI components

## 10. Risk Mitigation

### 10.1 Technical Risks
- **Browser Compatibility:** Extensive testing across browsers
- **Data Loss:** Multiple backup mechanisms, export warnings
- **Performance:** Code splitting, lazy loading for large datasets

### 10.2 User Experience Risks
- **Complexity:** Progressive disclosure, clear navigation
- **Learning Curve:** Intuitive defaults, helpful tooltips
- **Workshop Disruption:** Offline capability, reliable timer

## 11. Success Metrics

### Quantitative Metrics
- Page load time <3 seconds
- Zero data loss incidents
- 100% feature completion rate
- <1% browser compatibility issues

### Qualitative Metrics
- Facilitator ease-of-use rating >4.5/5
- Participant engagement (visual observation)
- Report quality and usefulness
- Technical reliability during workshops

## 12. Future Enhancements

### Version 2.0 Considerations
- **Enhanced Language Features:** Advanced Dutch business terminology support with context-sensitive help
- **Secondary Language Support:** Optional English interface for international Dutch companies (Dutch remains primary)
- **Dutch-Specific Features:** Integration with Dutch business databases and company information
- **Company pair library with search:** Enhanced with Dutch market focus
- **Advanced analytics and pattern recognition:** Tailored for Dutch business culture and decision-making patterns  
- **Integration with presentation tools:** PowerPoint export with Dutch templates and professional formatting
- **Collaborative features for remote workshops:** Optimized for Dutch virtual meeting platforms
- **Regional Customization:** Support for Belgian Dutch business terminology variations

## 13. Testing Strategy & Implementation Details

### 13.1 Test-Driven Development Workflow

**For Each Phase:**
1. **Write Tests First:** Define expected behavior through tests
2. **Implement Minimum:** Build just enough to make tests pass
3. **Refactor:** Improve code while maintaining test coverage
4. **Validate:** Manual testing and cross-browser verification

### 13.2 Key Testing Scenarios

**Critical User Flows:**
- Complete workshop from Phase 1 → Phase 4 → Export
- Resume interrupted session after browser refresh
- Navigate freely between phases with data intact
- Use keyboard shortcuts throughout workflow
- Handle various data states (empty, partial, complete)

**Data Integrity Tests:**
- All user input persists correctly
- Session recovery works after interruption
- Export contains complete and accurate data
- No data loss during phase transitions
- LocalForage fallbacks function properly

**Performance & Reliability:**
- Timer accuracy under various conditions
- Large dataset handling (50+ company pairs)
- Export performance with full session data
- Animation smoothness and responsiveness
- Memory usage remains stable during long sessions

### 13.3 Browser Testing Matrix

**Desktop Browsers:**
- Chrome 90+ (Primary)
- Firefox 88+ (Secondary)
- Safari 14+ (Secondary)
- Edge 90+ (Tertiary)

**Mobile Browsers:**
- Chrome Mobile (Primary)
- Safari iOS (Secondary)

**Testing Priorities:**
1. Chrome Desktop (100% compatibility)
2. Firefox & Safari Desktop (95% compatibility)
3. Mobile browsers (90% compatibility)
4. Edge (85% compatibility)

### 13.4 Development Environment

**Local Development:**
```bash
# Start development server
python -m http.server 8000

# Install testing dependencies
npm init -y
npm install -D @playwright/test
npx playwright install

# Run tests for current phase
npx playwright test tests/01-foundation.spec.js --headed

# Run all tests
npx playwright test

# Generate coverage report
npx playwright test --reporter=html
npx playwright show-report
```

**File Structure:**
```
/analogy-ren-je-rot/
├── index.html                 # Main application entry point
├── package.json              # Testing dependencies
├── playwright.config.js      # Playwright configuration
├── js/
│   ├── core.js              # Session management & Alpine.js setup
│   ├── phase1-preference.js # Preference round functionality
│   ├── phase2-archetype.js  # Archetype analysis
│   ├── phase3-decomposition.js # Decomposition analysis
│   ├── phase4-translation.js # Strategic translation
│   └── utils.js             # Shared utilities
├── css/
│   └── styles.css           # Custom styles beyond Tailwind
├── data/
│   └── company-pairs.json   # Company pair library
├── tests/
│   ├── 01-foundation.spec.js
│   ├── 02-preference-round.spec.js
│   ├── 03-archetype-analysis.spec.js
│   ├── 04-decomposition.spec.js
│   ├── 05-translation.spec.js
│   ├── 06-export.spec.js
│   ├── 07-integration.spec.js
│   ├── e2e-complete-workflow.spec.js
│   └── fixtures/
│       └── sample-data.json  # Test data fixtures
└── docs/
    ├── web-app-prd.md       # This document
    ├── prd.md              # Original game PRD
    └── CLAUDE.md           # Development guide
```