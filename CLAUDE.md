# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the "Het Ren-Je-Rot-Analogie-Verkenner-spel" project - a strategic workshop game designed to help management teams discover their strategic preferences through structured analogical reasoning.

The game consists of four phases:

1. **Voorkeursronde (Preference Round)**: Teams make quick choices between company pairs to reveal strategic preferences
2. **Archetype-Analyse**: Pattern recognition to define the team's strategic archetype
3. **Decompositie**: Deep analysis of a chosen exemplar company
4. **Vertaling**: Translation of insights into actionable strategic hypotheses

## Development Approach: Phase-by-Phase with Playwright Testing

This project is being built using a **test-driven, phase-by-phase approach** where each phase is thoroughly tested with Playwright before proceeding to the next. Each phase must pass all tests and quality gates before moving forward.

## Current Status: Phase 2 Implementation (Active Development)

Foundation phase complete with Phase 2 (Physical Positioning/Preference Round) actively being developed. Major UI improvements completed for control vs presentation mode optimization.

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
│   ├── app.js               # Main application logic 
│   ├── phase2.js            # Phase 2: Physical positioning/preference round
│   ├── phase3-decomposition.js # Decomposition analysis (Phase 4)
│   ├── phase4-translation.js # Strategic translation (Phase 5)
│   └── utils.js             # Shared utilities and helpers
├── css/
│   └── styles.css           # Custom styles beyond Tailwind CSS (includes control mode fixes)
├── data/
│   ├── company-pairs.json   # Extended company pair library  
│   └── strategic-pairs.json # Strategic company pair data
├── issues/                  # GitHub issue tracking (markdown format)
│   ├── 001-control-mode-ui-optimization.md
│   ├── 002-dutch-language-consistency.md
│   ├── 003-codebase-cleanup.md
│   └── README.md
├── tests/
│   ├── 01-foundation.spec.js          # Phase 1: Foundation tests
│   ├── 02-preference-round.spec.js    # Phase 2: Preference round tests
│   ├── 03-archetype-analysis.spec.js  # Phase 3: Archetype tests
│   ├── 04-decomposition.spec.js       # Phase 4: Decomposition tests
│   ├── 05-translation.spec.js         # Phase 5: Translation tests
│   ├── 06-export.spec.js              # Phase 6: Export tests
│   ├── 07-integration.spec.js         # Phase 7: Integration tests
│   ├── e2e-complete-workflow.spec.js  # End-to-end workflow tests
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

### Development Phases

**Phase 1: Foundation & Core Infrastructure (✅ Complete)**

- ✅ Basic HTML structure with Alpine.js initialization
- ✅ Session management (create, load, save)
- ✅ Phase navigation system
- ✅ LocalForage integration
- ✅ Comprehensive Playwright test coverage

**Phase 2: Physical Positioning/Preference Round (🚧 In Progress)**

- ✅ Company pair display system with strategic dilemma presentation
- ✅ Countdown timer with visual indicators and audio support
- ✅ Vote counting interface with real-time display
- ✅ **UI Mode Optimization**: Fixed control mode overlapping issues (Issue #1 ✅)
- ✅ Presentation mode vs control mode conditional layouts
- ✅ Timer circle responsive sizing and positioning
- ✅ Strategic pairs data integration
- 🔄 Additional timer features and round progression
- 🔄 Enhanced voting mechanics and scorecard

**Phase 3: Archetype Analysis Features**

- Winners summary from Phase 1
- Pattern keyword input (comma-separated)
- Archetype templates system
- Guided discussion prompts

**Phase 4: Decomposition Analysis**

- Forerunner selection interface
- Positive/negative analogy forms
- Causal relationship mapper
- Inline editing capabilities

**Phase 5: Strategic Translation**

- IF-THEN hypothesis builder
- Hypothesis templates system
- Action item tracker with CRUD
- Priority and confidence scoring

**Phase 6: Export & Reporting**

- JSON export functionality
- Markdown report generator
- Export modal interface
- File download mechanisms

**Phase 7: Integration & Polish**

- Presentation mode toggle
- Auto-save functionality
- Settings modal enhancements
- Accessibility improvements

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

### Current Phase: Phase 2 Implementation

```bash
# Test current functionality including control mode fixes
npx playwright test tests/01-foundation.spec.js --headed

# Test Phase 2 preference round features  
npx playwright test tests/03-phase2-preference-round.spec.js --headed

# Run all tests
npx playwright test

# Check test coverage
npx playwright test --reporter=html
```

### Recent Improvements & GitHub Issues

**✅ Issue #1: Control Mode UI Optimization (RESOLVED)**
- Fixed overlapping timer circle and modal elements in control mode
- Implemented responsive timer sizing (32x32 in presentation, 20x20 in control)
- Added conditional visibility for presentation-only overlays
- Proper z-index management to prevent content blocking
- Commit: `8f223bd` - "fix(phase2): resolve control mode UI overlapping issues"

**🔄 Issue #2: Dutch Language Consistency (Open)**
- Priority: Medium
- Ensure all interface text is in professional Dutch
- Review button labels, instructions, and terminology

**🔄 Issue #3: Codebase Cleanup (Open)**  
- Priority: Low
- Remove unused code and files
- Improve code organization and documentation

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

- **Strategic Archetype**: The collective strategic preference pattern identified through company pair choices
- **Voorloper (Forerunner)**: The exemplar company chosen for deep analysis
- **Verticale Relaties (Vertical Relations)**: The causal logic connecting specific factors to business success
- **Strategic Hypotheses**: Testable "if...then..." statements for the organization's strategy

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
