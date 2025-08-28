# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the "Het Ren-Je-Rot-Analogie-Verkenner-spel" project - a strategic workshop game specifically designed for Dutch management professionals working in strategy development. The application helps Dutch management teams discover their strategic preferences through structured analogical reasoning, with all interface elements and content delivered in professional Dutch language.

**Target Audience:** Dutch management professionals, strategy consultants, and team leaders in Dutch corporate environments and consulting firms.

The game consists of three phases:

1. **Strategic Preference Round**: Physical positioning exercise using strategic company pairs to reveal team preferences
2. **Archetype Analysis**: Pattern recognition to define the team's strategic archetype based on preferences
3. **Strategic Translation**: Translation of insights into actionable strategic hypotheses and action plans

## Target Audience & Language Requirements

### Primary Audience
**Dutch Management Professionals** working in strategic development roles including:
- Strategy consultants and advisors
- Corporate strategy department leaders
- Management team facilitators
- Organizational development professionals
- Team leaders managing strategic initiatives

### Language & Cultural Context
- **Primary Language:** Professional Dutch (Nederlandse zakentaal)
- **Target Region:** Netherlands and Dutch-speaking Belgium
- **Business Context:** Dutch corporate culture with formal business communication
- **Communication Style:** Professional "u" form throughout all interfaces
- **Terminology:** Consistent Dutch business and strategy vocabulary

### Development Language Requirements
All development work must consider:
- **UI Text:** All interface elements in professional Dutch
- **Variable Names:** Can be in English for code maintainability
- **Comments:** Preferably in English for international developer accessibility
- **Documentation:** Dutch for user-facing, English for technical documentation
- **Error Messages:** Professional Dutch with clear business language

## Development Approach: Phase-by-Phase with Playwright Testing

This project is being built using a **test-driven, phase-by-phase approach** where each phase is thoroughly tested with Playwright before proceeding to the next. Each phase must pass all tests and quality gates before moving forward.

## Current Status: 3-Phase Application (Critical Bug in Phase 2)

**Status:** Phase 1 is 95% complete, Phase 2 has critical display bug, Phase 3 is complete.

**CRITICAL ISSUE:** Phase 2 presentation display shows wrong content (Decomposition Analysis from old 4-phase model instead of Archetype Analysis). This makes the application unusable for Phase 2 workshops.

### Target File Structure (Modular Architecture)

```
/analogy-ren-je-rot/
├── index.html                 # Main application entry point
├── package.json              # Testing dependencies (npm/Playwright)
├── playwright.config.js      # Playwright test configuration
├── web-app-prd.md            # Comprehensive web app PRD
├── prd.md                    # Original game concept PRD
├── CLAUDE.md                 # This development guide
├── js/
│   ├── core.js              # Session management & Alpine.js setup
│   └── phase1.js            # Phase 1 strategic pairs module (renamed from phase2.js)
├── css/
│   └── styles.css           # Custom styles beyond Tailwind CSS (includes control mode fixes)
├── data/
│   └── strategic-pairs.json # Strategic company pairs with level balancing
├── issues/                  # GitHub issue tracking (markdown format)
│   ├── 001-control-mode-ui-optimization.md
│   ├── 002-dutch-language-consistency.md
│   ├── 003-codebase-cleanup.md
│   └── README.md
├── tests/
│   ├── 01-foundation.spec.js          # Foundation and session tests
│   ├── 02-session-management.spec.js  # Session management tests
│   ├── 03-phase2-preference-round.spec.js # Strategic preference round tests
│   ├── e2e-complete-workflow.spec.js  # End-to-end workflow tests (when created)
│   └── fixtures/
│       └── sample-data.json           # Test data fixtures
└── docs/
    └── testing-reports/               # Generated test reports
```

### Technology Stack

- **Frontend Framework**: Pure HTML5 with Alpine.js v3.x for reactivity
- **CSS Framework**: Tailwind CSS v3.x via CDN + custom CSS
- **State Management**: Alpine.js stores + LocalForage for persistence
- **Storage**: Browser-based (IndexedDB/WebSQL/localStorage) via LocalForage
- **Testing**: Playwright for comprehensive cross-browser testing
- **Export**: JSON and Markdown report generation

### 3-Phase Development Structure

**Phase 1: Strategic Preference Round (⚠️ 95% Complete)**

- ✅ Strategic company pairs with 4-level framework integration
- ✅ Physical positioning timer system with audio support
- ✅ Vote counting interface with real-time display
- ✅ Balanced pair selection ensuring level diversity
- ✅ Presentation vs control mode optimization
- ✅ Timer circle responsive sizing and positioning
- ✅ Complete strategic pairs data (26 pairs, 20 dimensions)
- ✅ Winner calculation and phase completion detection
- ⚠️ Minor transition and testing issues remain

**Phase 2: Archetype Analysis (🚨 Critical Display Bug)**

- ✅ Control panel: Pattern keyword input and archetype definition
- ✅ Archetype template system with Dutch translations needed
- ✅ Winner data transfer from Phase 1
- 🚨 **CRITICAL BUG**: Presentation display shows wrong content (Decomposition instead of Archetype)
- ❌ Proper presentation view for archetype analysis missing

**Phase 3: Strategic Translation (✅ Complete)**

- ✅ Strategic hypothesis builder with IF-THEN templates
- ✅ Action item management system with CRUD operations
- ✅ Session summary and progress tracking
- ✅ Export functionality (JSON and Markdown)
- ✅ Complete workflow integration

**Core Features (✅ Complete)**

- ✅ Session management and data persistence
- ✅ Presentation mode toggle
- ✅ Auto-save functionality
- ✅ Browser storage with LocalForage
- ✅ Responsive design for facilitator and presentation modes

## Development Commands

### Initial Setup (One Time)

```bash
# Navigate to project directory
cd analogy-ren-je-rot

# Initialize npm for testing dependencies
npm init -y

# Install Playwright testing framework
npm install -D @playwright/test

# Install browsers for testing
npx playwright install
```

### Development Workflow

```bash
# Start development server (required for ES modules)
python -m http.server 8000
# or
npx serve .

# In separate terminal: Run tests for current phase
npx playwright test tests/01-foundation.spec.js --headed

# Run all tests
npx playwright test

# Run tests with UI for debugging
npx playwright test --ui

# Generate and view test report
npx playwright test --reporter=html
npx playwright show-report
```

### Phase-by-Phase Development Process

**For Each Development Phase:**

1. **Write Tests First**: Create test file for phase (e.g., `tests/02-preference-round.spec.js`)
2. **Implement Minimum**: Build just enough code to make tests pass
3. **Refactor**: Improve code while maintaining test coverage
4. **Quality Gate**: Ensure all tests pass before moving to next phase

### Current Priority: Fix Critical Phase 2 Bug

```bash
# Start development server
python -m http.server 8000

# Test foundation and Phase 1 functionality
npx playwright test tests/01-foundation.spec.js --headed

# Test Phase 1 preference round (NOTE: file named phase2 but contains Phase 1 tests)
npx playwright test tests/03-phase2-preference-round.spec.js --headed

# Run all tests (many will fail due to Dutch UI text changes)
npx playwright test

# Generate test report
npx playwright test --reporter=html
```

### Immediate Development Tasks
1. **CRITICAL**: Fix Phase 2 presentation display (see task 9.0 in tasks file)
2. **HIGH**: Complete Dutch language translations (templates, UI text)
3. **HIGH**: Enhance winner data structure with strategic context
4. **MEDIUM**: Update tests to match Dutch interface text

### Recent Improvements & GitHub Issues

**✅ Issue #1: Control Mode UI Optimization (RESOLVED)**
- Fixed overlapping timer circle and modal elements in control mode
- Implemented responsive timer sizing (32x32 in presentation, 20x20 in control)
- Added conditional visibility for presentation-only overlays
- Proper z-index management to prevent content blocking
- Commit: `8f223bd` - "fix(phase2): resolve control mode UI overlapping issues"

**🚨 Issue #2: Critical Phase 2 Display Bug (CRITICAL)**
- Priority: URGENT - Application breaking
- Phase 2 shows Decomposition content instead of Archetype Analysis
- Presentation mode unusable for Phase 2 workshops
- Must fix before any other development

**🔄 Issue #3: Dutch Language Consistency (HIGH PRIORITY)**
- Priority: High (after fixing critical bug)
- Archetype templates still in English
- Missing facilitator guides for Phase 2 & 3
- Some UI elements need Dutch translation

**🔄 Issue #4: Winner Data Enhancement (MEDIUM)**  
- Priority: Medium
- Add strategic context to winners (dilemma questions, strategies)
- Remove duplicate winner displays
- Improve Phase 2 strategic context

### Key Architecture Decisions

- **No Backend Required**: All data stored in browser localStorage/IndexedDB
- **Modular JavaScript**: Separate files for each phase implementation
- **CDN Dependencies**: Tailwind CSS, Alpine.js, LocalForage via CDN
- **Test-Driven Development**: Playwright tests define expected behavior
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Dual UI Modes**: Presentation mode for workshops, control mode for facilitators

## Development Guidelines

### Test-Driven Development Rules

1. **Red**: Write a failing test that defines desired behavior
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code while keeping tests green
4. **Quality Gate**: All tests must pass before proceeding to next phase

### Adding New Features

1. **Write Tests First**: Define expected behavior through tests
2. **Modular Implementation**: Add functionality to appropriate phase file
3. **Update Tests**: Ensure comprehensive coverage
4. **Cross-Browser Testing**: Verify functionality across all supported browsers

### File Organization Rules

- **Core Logic**: `js/core.js` for session management and Alpine.js setup
- **Phase Logic**: `js/phase[N]-[name].js` for each phase's functionality
- **Shared Utilities**: `js/utils.js` for common helper functions
- **Styling**: `css/styles.css` for custom styles beyond Tailwind
- **Test Data**: `data/company-pairs.json` for company pair library
- **Test Files**: `tests/[NN]-[phase-name].spec.js` following naming convention

### Testing Standards

- **Coverage**: Each phase must achieve >95% test coverage
- **Browser Support**: Tests must pass on Chrome, Firefox, Safari, Edge
- **Performance**: Phase transitions must be <2 seconds
- **Accessibility**: WCAG 2.1 AA compliance verified through tests
- **Data Persistence**: LocalForage integration tested across all phases

## Key Concepts

### Dutch Strategic Workshop Terminology (3-Phase Model)
- **Strategic Archetype** / **Strategisch Archetype**: The collective strategic preference pattern identified through company pair choices in Phase 2
- **Strategic Hypotheses** / **Strategische Hypotheses**: Testable "if...then..." statements developed in Phase 3
- **Voorkeursronde (Preference Round)** / **Voorkeursronde**: Physical positioning exercise in Phase 1 revealing strategic preferences
- **Strategische Keuzes (Strategic Choices)** / **Strategische Keuzes**: The positioning decisions made during Phase 1
- **Patroon Herkenning**: Pattern recognition process in Phase 2 to identify strategic themes
- **Archetype Analyse**: Process of defining strategic archetype based on winning companies and patterns

### Dutch Business Context Guidelines
- **Formality Level**: Always use formal "u" form in all user-facing text
- **Professional Tone**: Authoritative and clear language suitable for management audiences
- **Business Vocabulary**: Use established Dutch business terminology consistently
- **Cultural Sensitivity**: Reflect Dutch directness and clarity in communication style
- **Workshop Context**: Language appropriate for professional Dutch meeting environments

## Quality Gates for Each Phase

### Definition of Done

Each phase must meet these criteria before proceeding:

1. ✅ **All Features Implemented**: According to phase specification
2. ✅ **Tests Pass**: 100% pass rate across all browsers (Chrome, Firefox, Safari, Edge)
3. ✅ **Coverage >95%**: Comprehensive test coverage for phase functionality
4. ✅ **Performance Met**: <2s phase transitions, timer accuracy ±100ms
5. ✅ **Accessibility Verified**: WCAG 2.1 AA compliance tested
6. ✅ **Data Persistence Works**: LocalForage integration verified
7. ✅ **Manual Testing Complete**: User flow validation
8. ✅ **Documentation Updated**: Code comments and README updates

### Browser Testing Requirements

- **Chrome 90+**: 100% compatibility (primary)
- **Firefox 88+**: 95% compatibility (secondary)
- **Safari 14+**: 95% compatibility (secondary)
- **Edge 90+**: 85% compatibility (tertiary)

## Debugging and Troubleshooting

### Common Issues

1. **Alpine.js Not Initializing**: Check for JavaScript errors in console
2. **LocalForage Errors**: Verify browser storage permissions
3. **Timer Inaccuracy**: Test across different browsers for timing issues
4. **Test Failures**: Use `--headed` flag to see browser interactions

### Debugging Commands

```bash
# Run specific test with browser visible
npx playwright test tests/01-foundation.spec.js --headed --debug

# Run tests with trace for detailed analysis
npx playwright test --trace on

# Generate detailed test report
npx playwright test --reporter=html,line
```

## Task List Management

### Task Implementation Protocol

- **One Sub-task at a Time**: Work on only ONE sub-task at a time from `tasks/tasks-web-app-prd.md`
- **Stop and Ask**: After completing each sub-task, stop and wait for user approval ("yes" or "y") before proceeding
- **Mark Completed**: Immediately mark finished sub-tasks as `[x]` in the task list file

### Completion Protocol for Parent Tasks

When ALL sub-tasks under a parent task are marked `[x]`, follow this sequence:

1. **Run Full Test Suite**: `npx playwright test` (all tests must pass)
2. **Stage Changes**: `git add .`
3. **Clean Up**: Remove temporary files and code
4. **Commit with Format**:
   ```bash
   git commit -m "feat(phase#): descriptive summary" \
             -m "- Key change or addition 1" \
             -m "- Key change or addition 2" \
             -m "Task #.# from tasks-web-app-prd.md"
   ```
5. **Mark Parent Task**: Only then mark parent task as `[x]`

### Task List Maintenance

- **Update After Work**: Modify `tasks/tasks-web-app-prd.md` after any significant changes
- **Keep Relevant Files Current**: Update file descriptions as project evolves
- **Add Discovered Tasks**: Include any new tasks that emerge during development
- **Maintain Accuracy**: Ensure task status reflects actual completion

### Conventional Commit Format

Use these prefixes for commits:

- `feat(phase#):` - New features or functionality
- `test(phase#):` - Test additions or modifications
- `fix(phase#):` - Bug fixes or corrections
- `refactor(phase#):` - Code improvements without functionality changes
- `docs:` - Documentation updates

## Contributing Guidelines

### Code Style

- Use TypeScript-style JSDoc comments for functions
- Follow Alpine.js naming conventions (kebab-case for attributes)
- Keep functions small and focused (max 20 lines)
- Use meaningful variable names that describe purpose

### Dutch Language Requirements for Development

**UI Text Standards:**
- All user-facing text must be in professional Dutch (Nederlandse zakentaal)
- Use formal "u" form consistently throughout the application
- Apply consistent Dutch business terminology across all phases
- Ensure error messages and help text are in clear, professional Dutch
- Maintain authoritative tone appropriate for management audiences

**Code Language Guidelines:**
- **JavaScript Variables/Functions:** English for maintainability (e.g., `currentPhase`, `startTimer`)
- **HTML Text Content:** Professional Dutch (e.g., "Start Ronde", "Volgende Fase")
- **CSS Classes:** English for consistency (e.g., `.control-panel`, `.timer-display`)
- **Comments:** English for international developer accessibility
- **Commit Messages:** English following conventional commit format

**Terminology Consistency:**
- Maintain a glossary of Dutch-English term pairs for consistency
- Use standardized translations for strategic workshop concepts
- Ensure terminology aligns with Dutch business culture and practices
- Review all text with Dutch management professionals when possible

### Git Workflow Integration

1. Follow task list protocol (work sub-task by sub-task)
2. Write tests first, then implementation (TDD approach)
3. Run full test suite before any commit
4. Use conventional commit format with task references
5. Maintain clean git history with descriptive messages

### Example Commit Messages

```bash
# Single sub-task completion
git commit -m "test(phase1): add foundation tests for Alpine.js initialization" \
          -m "- Tests session creation and data persistence" \
          -m "- Verifies LocalForage integration works" \
          -m "Task 2.2 from tasks-web-app-prd.md"

# Parent task completion
git commit -m "feat(phase1): complete foundation and core infrastructure" \
          -m "- Basic HTML structure with Alpine.js and Tailwind" \
          -m "- Session management with LocalForage persistence" \
          -m "- Phase navigation system with loading states" \
          -m "- 10/10 sub-tasks completed, 97% test coverage" \
          -m "Tasks 2.1-2.10 from tasks-web-app-prd.md"
```

## Future Enhancement Ideas (Version 2.0)

- Multi-language support (Dutch/English toggle)
- PDF export with professional formatting
- Company logo integration with image uploads
- Advanced analytics and pattern recognition
- Integration with presentation tools (PowerPoint export)
- Collaborative features for remote workshops
- Custom company pair creation interface
- Real-time collaboration with WebRTC
- Mobile app companion for facilitators
