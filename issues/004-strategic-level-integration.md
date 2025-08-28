# Issue #004: Strategic Level Integration and Balanced Pair Selection

**Status**: OPEN  
**Priority**: High  
**Created**: 2025-08-28  

## Summary

Enhance the strategic pairs data structure by adding framework levels (Niveau 1-4) from the Geïntegreerde Strategische Dimensies Framework and implement a balanced selection algorithm that ensures representation from each strategic level when selecting pairs for the preference round.

## Problem Statement

Currently, the strategic pairs are selected completely randomly from the available pool. This can result in selections that are heavily skewed towards certain types of strategic decisions (e.g., all operational choices or all market positioning choices), providing an incomplete view of the organization's strategic preferences.

The existing framework defines four clear levels of strategic decision-making:

1. **Niveau 1: Waar concurreren we?** (Market & Scope)
2. **Niveau 2: Hoe winnen we?** (Value Proposition & Business Model)  
3. **Niveau 3: Hoe leveren we?** (Operations & Execution)
4. **Niveau 4: Hoe organiseren en financieren we?** (Organization & Capital)

## Proposed Solution

### 1. Data Structure Enhancement

Add two new fields to each strategic pair in `data/strategic-pairs.json`:

```json
{
  "companyA": "Android",
  "companyB": "Apple iOS",
  "strategic_contrast": "Platform vs. Geïntegreerd Product",
  "niveau": 2,
  "dimensie_nummer": 7,
  "distinguishing_element": "Controle over het ecosysteem",
  "dilemma_question": "...",
  "strategies": {...}
}
```

**New Fields:**
- `niveau`: Strategic level (1, 2, 3, or 4) 
- `dimensie_nummer`: Specific dimension number within that level (e.g., dimension 7 = "Business Model Architectuur")

### 2. Balanced Selection Algorithm

Modify the `selectRandomPairs` function to implement a balanced approach:

1. **Level-First Selection**: When selecting 4+ pairs, guarantee one pair from each level (1-4)
2. **Random Within Level**: Randomly select which specific pair from each level
3. **Remaining Slots**: Fill any additional slots with random selection from all remaining pairs
4. **Graceful Degradation**: Handle cases where fewer than 4 pairs are requested or certain levels have no pairs

### 3. Framework Level Categorization

Based on analysis of existing pairs and the framework dimensions:

#### Niveau 1: Waar concurreren we? (Market & Scope)
- Uber vs. Lyft (Geographic scope: Global vs. Focused)
- Urban Arrow vs. Gazelle (Market focus: Niche vs. Broad)
- Figma vs. Adobe (Market focus: Specialist vs. Generalist)
- Google vs. Microsoft (Customer segment: Consumer vs. Enterprise)

#### Niveau 2: Hoe winnen we? (Value Proposition & Business Model)  
- Android vs. Apple iOS (Business model architecture: Platform vs. Integrated)
- Airbnb vs. Booking.com (Core of value: Community vs. Transaction)
- Netflix vs. Disney (Content strategy: Data-driven vs. IP-driven)
- Spotify vs. Apple Music (Role in ecosystem: Pure-play vs. Component)
- Amazon vs. OpenAI (AI role: Efficiency vs. Core product)

#### Niveau 3: Hoe leveren we? (Operations & Execution)
- Tesla vs. Toyota (Core competence: Disruptive vs. Operational excellence)
- Netflix vs. Spotify (Control over value chain: Vertical vs. Horizontal)
- Apple Health vs. Adyen (Data philosophy: Closed vs. Open API)
- YouTube vs. Bitcoin (Network structure: Centralized vs. Decentralized)
- LEGO vs. Nintendo (Innovation source: Open vs. Closed)
- Fairphone vs. TOMS (Social approach: System change vs. Direct aid)

#### Niveau 4: Hoe organiseren en financieren we? (Organization & Capital)
- Apple vs. Samsung (Organization structure: Ecosystem vs. Diversified)
- Facebook vs. TikTok (Algorithm approach: Social graph vs. Content graph)
- Instagram vs. Snapchat (Culture: Public vs. Private)

## Implementation Plan

### Phase 1: Data Enhancement
- [ ] Categorize all existing strategic pairs by framework level
- [ ] Add `niveau` and `dimensie_nummer` fields to `strategic-pairs.json`
- [ ] Validate categorization against framework dimensions

### Phase 2: Algorithm Implementation  
- [ ] Modify `selectRandomPairs` function in `js/phase2.js`
- [ ] Implement level-balanced selection logic
- [ ] Add fallback handling for edge cases
- [ ] Maintain backward compatibility

### Phase 3: Testing & Validation
- [ ] Add automated tests for level distribution
- [ ] Test edge cases (fewer pairs, missing levels)
- [ ] Verify random selection within levels
- [ ] Manual testing with various selection counts

## Acceptance Criteria

- [ ] Each strategic pair has `niveau` (1-4) and `dimensie_nummer` fields
- [ ] When selecting 4+ pairs, at least one pair from each level is included (if available)
- [ ] Selection remains random within each level constraint
- [ ] Backward compatibility maintained for existing functionality  
- [ ] Comprehensive test coverage for new selection logic
- [ ] Framework categorization is accurate and complete

## Technical Notes

- The selection algorithm should be deterministic for the same random seed
- Performance impact should be minimal (current pairs: ~23, selection: typically 5)
- Consider graceful handling when levels have unequal numbers of pairs
- Document the categorization rationale for future pair additions

## Related Files

- `data/strategic-pairs.json` - Data structure to enhance
- `js/phase2.js` - Selection algorithm to modify  
- `strategic-pairs-analysis.md` - Framework reference
- `tests/03-phase2-preference-round.spec.js` - Tests to extend

## Success Metrics

- Teams experience strategic choices from all four framework levels
- Selection algorithm produces more balanced strategic exploration
- Workshop facilitators report improved archetype identification
- Maintains existing user experience and performance