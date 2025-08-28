# Issue #5: URL Query Parameters for Session Setup

**Status:** Open  
**Priority:** Medium  
**Labels:** enhancement, user-experience  
**Created:** 2025-08-28  
**GitHub Issue:** [#5](https://github.com/businessdatasolutions/analogy-ren-je-rot/issues/5)

## Feature Request

Add support for URL query parameters to pre-populate session information for easier workshop setup.

## Problem

Currently, facilitators must manually enter session title and facilitator name each time they start a new workshop session. This creates friction during setup and increases the chance of typos or inconsistent naming.

## Proposed Solution

Add support for URL query parameters:
- `?title=Workshop%20Title` - Pre-fills the session title
- `?facilitator=John%20Doe` - Pre-fills the facilitator name
- Combined: `?title=Strategy%20Session&facilitator=Jane%20Smith`

## Expected Behavior

1. **URL Parsing**: Application reads query parameters on load
2. **Auto-Population**: Session modal pre-fills with provided values
3. **User Override**: Users can still edit the pre-filled values
4. **URL Encoding**: Support proper URL encoding for spaces and special characters
5. **Graceful Fallback**: Works normally if no parameters provided

## Implementation Details

### URL Examples:
```
# Basic usage
https://app.example.com/?title=Q4%20Strategy%20Review&facilitator=Sarah%20Johnson

# Title only
https://app.example.com/?title=Innovation%20Workshop

# Facilitator only  
https://app.example.com/?facilitator=Mike%20Chen

# Complex title with special characters
https://app.example.com/?title=Team%20Alpha%20-%20Strategic%20Planning%202025
```

### Technical Approach:
1. Parse `window.location.search` on application load
2. Use `URLSearchParams` API for robust parameter extraction
3. Update session initialization in `js/core.js`
4. Pre-fill modal inputs when `showSessionModal` is opened
5. Maintain backward compatibility

## Benefits

- **Faster Setup**: Reduces manual entry for recurring workshops
- **Consistency**: Ensures consistent naming conventions
- **Professional**: Smoother experience for workshop participants
- **Flexibility**: Optional feature that doesn't break existing workflow

## Files to Modify

- `js/core.js` - Add URL parameter parsing logic
- `index.html` - Update session modal to use pre-filled values

## Acceptance Criteria

- [ ] Parse URL query parameters on page load
- [ ] Pre-fill session title from `title` parameter
- [ ] Pre-fill facilitator name from `facilitator` parameter
- [ ] Handle URL encoding/decoding properly
- [ ] Maintain existing functionality if no parameters provided
- [ ] Users can still edit pre-filled values
- [ ] Test with various character encodings and special characters

## Implementation Notes

### Code Structure:
```javascript
// In js/core.js - Add to initialization
parseUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const title = urlParams.get('title');
  const facilitator = urlParams.get('facilitator');
  
  if (title) this.session.teamName = decodeURIComponent(title);
  if (facilitator) this.session.facilitator = decodeURIComponent(facilitator);
}
```

### HTML Update:
Update session modal inputs to use session data as default values.

## Priority Justification

**Medium Priority** - Significant UX improvement that would be highly valuable for regular workshop facilitators, but not critical for core functionality.