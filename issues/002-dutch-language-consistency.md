# Issue #2: Ensure all interface text is in professional Dutch

**Status:** Documentation Complete - Ready for Implementation  
**Priority:** Medium  
**Labels:** i18n, enhancement  
**Progress:** ~50% complete (Documentation phase finished)  

## Problem

The application needs to have all text in professional Dutch language for proper workshop facilitation.

## Expected Behavior

- All UI elements should display Dutch text
- Language should be professional and appropriate for business settings
- Consistent terminology throughout the application

## Current Issues

- Mixed language elements
- Some text may not be in proper Dutch
- Inconsistent terminology

## Progress Update (2025-08-28)

### ✅ **Phase 1: Documentation Foundation (COMPLETE)**
- [x] **Target Audience Definition**: Clearly specified Dutch management professionals
- [x] **Language Requirements**: Established professional Dutch (Nederlandse zakentaal) standards
- [x] **Business Context**: Defined Dutch corporate culture and workshop environment
- [x] **Development Guidelines**: Created comprehensive Dutch language development standards
- [x] **Terminology Framework**: Established Dutch business terminology consistency requirements

**Files Updated:**
- ✅ `web-app-prd.md` - Complete target audience and language specifications
- ✅ `CLAUDE.md` - Development guidelines and terminology standards
- **Commit**: `580bdef` - docs: specify Dutch management professional target audience

### ⏳ **Phase 2: Implementation (PENDING)**

## Acceptance Criteria

### ✅ Phase 1 - Documentation (COMPLETE)
- [x] Define target audience as Dutch management professionals
- [x] Establish language requirements and business context
- [x] Create development guidelines for Dutch language consistency
- [x] Document terminology framework

### ⏳ Phase 2 - Implementation (PENDING)  
- [ ] Audit all UI text elements in application
- [ ] Translate any non-Dutch text to professional Dutch
- [ ] Ensure consistent terminology across all phases
- [ ] Review button labels, instructions, and help text
- [ ] Test with Dutch-speaking users

## Priority

Medium - important for user experience in Dutch business context

## Files Affected

- `index.html` - All HTML text content
- `js/core.js` - JavaScript strings and messages
- `js/phase2.js` - Phase-specific text
- `js/app.js` - Application strings
- `data/company-pairs.json` - Company names and descriptions
- `data/strategic-pairs.json` - Strategic pair descriptions

## Dutch Business Terminology Guidelines

- Use formal "u" form instead of informal "je"
- Professional business vocabulary
- Consistent terms for workshop concepts:
  - Strategic archetype = Strategisch archetype
  - Preference round = Voorkeursronde
  - Analysis = Analyse
  - Workshop = Workshop (acceptable loanword)