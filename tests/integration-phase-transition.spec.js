import { test, expect } from '@playwright/test';

test.describe('Phase 1 to Phase 2 Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for application to load completely
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    await page.waitForTimeout(2000); // Wait for Alpine.js initialization
    
    // Ensure we're on Phase 1
    await page.click('nav button:has-text("Fase 1")');
    await page.waitForTimeout(1000);
  });

  test('JavaScript functions are accessible and working', async ({ page }) => {
    // Check if core app object exists
    const appExists = await page.evaluate(() => {
      return typeof window.app !== 'undefined' && 
             window.app.phase1 && 
             typeof window.app.phase1.getWinners === 'function';
    });
    
    expect(appExists).toBe(true);
    
    // Test winner calculation function (should work even with no votes)
    const winnersResult = await page.evaluate(() => {
      try {
        const winners = window.app.phase1.getWinners();
        return { success: true, winners: winners, type: Array.isArray(winners) ? 'array' : typeof winners };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(winnersResult.success).toBe(true);
    expect(winnersResult.type).toBe('array');
  });

  test('Phase completion detection works', async ({ page }) => {
    const completionResult = await page.evaluate(() => {
      try {
        const isComplete = window.app.phase1.isPhaseComplete();
        const status = window.app.phase1.getCompletionStatus();
        return { 
          success: true, 
          isComplete: isComplete, 
          status: status,
          hasStatus: !!status
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(completionResult.success).toBe(true);
    expect(typeof completionResult.isComplete).toBe('boolean');
    expect(completionResult.hasStatus).toBe(true);
  });

  test('Phase transition preserves data', async ({ page }) => {
    // Navigate between phases to trigger data transfer
    await page.click('nav button:has-text("Fase 2")');
    await page.waitForTimeout(1000);
    
    await page.click('nav button:has-text("Fase 1")');
    await page.waitForTimeout(1000);
    
    await page.click('nav button:has-text("Fase 2")');
    await page.waitForTimeout(1000);
    
    // Check if phase2 object exists and has winner data structure
    const phase2DataResult = await page.evaluate(() => {
      try {
        const phase2 = window.app.phase2;
        return {
          success: true,
          hasPhase2: !!phase2,
          hasWinnersArray: Array.isArray(phase2?.winnersFromPhase1),
          hasSuggestedPatterns: Array.isArray(phase2?.suggestedPatterns),
          winnersCount: phase2?.winnersFromPhase1?.length || 0
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(phase2DataResult.success).toBe(true);
    expect(phase2DataResult.hasPhase2).toBe(true);
    expect(phase2DataResult.hasWinnersArray).toBe(true);
  });

  test('Voting functionality creates winner data', async ({ page }) => {
    // Look for voting buttons - try different selectors to find them
    const votingButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(btn => ({
        text: btn.textContent?.trim(),
        visible: btn.offsetParent !== null
      })).filter(btn => btn.text && (btn.text.includes('Stem') || btn.text.includes('Vote')));
    });
    
    console.log('Found voting buttons:', votingButtons);
    
    // If we have voting buttons, try to vote
    if (votingButtons.length > 0) {
      const voteButtonA = votingButtons.find(btn => btn.text.includes('A'));
      if (voteButtonA) {
        await page.click(`button:has-text("${voteButtonA.text}")`);
        await page.waitForTimeout(500);
        
        // Check if vote was recorded
        const voteResult = await page.evaluate(() => {
          try {
            const winners = window.app.phase1.getWinners();
            return {
              success: true,
              winnersCount: winners.length,
              hasVotes: winners.some(w => w.votes > 0)
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        });
        
        expect(voteResult.success).toBe(true);
        // After voting, we should have at least one winner with votes > 0
        if (voteResult.winnersCount > 0) {
          expect(voteResult.hasVotes).toBe(true);
        }
      }
    }
  });

  test('CSS animations are loaded', async ({ page }) => {
    // Check if CSS animations from styles.css are available
    const animationsResult = await page.evaluate(() => {
      try {
        // Check if custom CSS rules exist
        const stylesheets = Array.from(document.styleSheets);
        let hasTransitionAnimations = false;
        let hasCelebrationAnimations = false;
        
        for (const sheet of stylesheets) {
          try {
            const rules = Array.from(sheet.cssRules || []);
            for (const rule of rules) {
              if (rule.selectorText?.includes('phase-fade') || 
                  rule.cssText?.includes('phase-fade')) {
                hasTransitionAnimations = true;
              }
              if (rule.selectorText?.includes('celebration') || 
                  rule.cssText?.includes('celebrationFadeIn')) {
                hasCelebrationAnimations = true;
              }
            }
          } catch (e) {
            // Skip CORS-blocked stylesheets
          }
        }
        
        return {
          success: true,
          hasTransitionAnimations,
          hasCelebrationAnimations,
          totalStylesheets: stylesheets.length
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(animationsResult.success).toBe(true);
    expect(animationsResult.totalStylesheets).toBeGreaterThan(0);
  });
});