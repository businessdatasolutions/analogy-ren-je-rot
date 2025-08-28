# Issue #2: Ensure all interface text is in professional Dutch

**Status:** Open  
**Priority:** Medium  
**Labels:** i18n, enhancement  

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

## Acceptance Criteria

- [ ] Audit all UI text elements
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