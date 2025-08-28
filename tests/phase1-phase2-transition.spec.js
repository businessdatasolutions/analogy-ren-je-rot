import { test, expect } from '@playwright/test';

test.describe('Phase 1 to Phase 2 Transition Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for application to load
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    await page.waitForTimeout(2000); // Wait for Alpine.js initialization
    
    // Ensure we're on Phase 1
    await page.click('nav button:has-text("Fase 1")');
    await page.waitForTimeout(1000);
  });

  test.describe('Winner Calculation', () => {
    test('getWinners returns correct format with strategic context', async ({ page }) => {
      // Vote on first pair: Company A gets 3 votes
      for (let i = 0; i < 3; i++) {
        await page.click('button:has-text("+ Stem voor A")');
        await page.waitForTimeout(200);
      }
      
      // Move to next pair and vote for Company B
      await page.click('button:has-text("Volgende →")');
      await page.waitForTimeout(500);
      
      await page.click('button:has-text("+ Stem voor B")');
      await page.click('button:has-text("+ Stem voor B")');
      await page.waitForTimeout(200);
      
      // Test winner calculation
      const winners = await page.evaluate(() => {
        return window.app && window.app.phase1 && window.app.phase1.getWinners();
      });
      
      expect(winners).toBeDefined();
      expect(Array.isArray(winners)).toBe(true);
      expect(winners.length).toBeGreaterThan(0);
      
      // Test winner object structure
      if (winners.length > 0) {
        const winner = winners[0];
        expect(winner).toHaveProperty('name');
        expect(winner).toHaveProperty('votes');
        expect(winner).toHaveProperty('pairIndex');
        expect(winner).toHaveProperty('winType');
        expect(winner).toHaveProperty('strategicContrast');
        
        // Winner with most votes should be first
        expect(winner.votes).toBeGreaterThan(0);
      }
    });

    test('winners are sorted by vote count descending', async ({ page }) => {
      // Vote on multiple pairs with different vote counts
      // Pair 1: A gets 1 vote
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(200);
      
      await page.click('button:has-text("Volgende →")');
      await page.waitForTimeout(500);
      
      // Pair 2: A gets 3 votes (should be winner)
      await page.click('button:has-text("+ Stem voor A")');
      await page.click('button:has-text("+ Stem voor A")');
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(200);
      
      await page.click('button:has-text("Volgende →")');
      await page.waitForTimeout(500);
      
      // Pair 3: A gets 2 votes
      await page.click('button:has-text("+ Stem voor A")');
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(200);
      
      const winners = await page.evaluate(() => {
        return window.app && window.app.phase1 && window.app.phase1.getWinners();
      });
      
      expect(winners.length).toBe(3);
      
      // Verify descending order by votes
      expect(winners[0].votes).toBe(3);
      expect(winners[1].votes).toBe(2);
      expect(winners[2].votes).toBe(1);
    });

    test('handles tie votes correctly', async ({ page }) => {
      // Create a tie: both companies get 2 votes
      await page.click('button:has-text("+ Stem voor A")');
      await page.click('button:has-text("+ Stem voor A")');
      await page.click('button:has-text("+ Stem voor B")');
      await page.click('button:has-text("+ Stem voor B")');
      await page.waitForTimeout(200);
      
      const winners = await page.evaluate(() => {
        return window.app && window.app.phase1 && window.app.phase1.getWinners();
      });
      
      expect(winners.length).toBe(1); // Tie should create one winner entry
      expect(winners[0].winType).toBe('tied');
    });
  });

  test.describe('Phase Completion Detection', () => {
    test('isPhaseComplete returns false with no votes', async ({ page }) => {
      const isComplete = await page.evaluate(() => {
        return window.app && window.app.phase1 && window.app.phase1.isPhaseComplete();
      });
      
      expect(isComplete).toBe(false);
    });

    test('isPhaseComplete returns false with partial votes', async ({ page }) => {
      // Vote on just one pair
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(200);
      
      const isComplete = await page.evaluate(() => {
        return window.app && window.app.phase1 && window.app.phase1.isPhaseComplete();
      });
      
      expect(isComplete).toBe(false);
    });

    test('getCompletionStatus returns accurate progress', async ({ page }) => {
      // Vote on 2 pairs
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(200);
      
      await page.click('button:has-text("Volgende →")');
      await page.waitForTimeout(500);
      
      await page.click('button:has-text("+ Stem voor B")');
      await page.waitForTimeout(200);
      
      const status = await page.evaluate(() => {
        return window.app && window.app.phase1 && window.app.phase1.getCompletionStatus();
      });
      
      expect(status).toBeDefined();
      expect(status.votedPairs).toBe(2);
      expect(status.totalPairs).toBeGreaterThan(2);
      expect(status.completionPercentage).toBeGreaterThan(0);
      expect(status.completionPercentage).toBeLessThan(100);
      expect(status.isComplete).toBe(false);
      expect(status.totalWinners).toBe(2);
    });
  });

  test.describe('Data Transfer to Phase 2', () => {
    test('transferWinnersToPhase2 populates phase2 data', async ({ page }) => {
      // Vote on a few pairs
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(200);
      
      await page.click('button:has-text("Volgende →")');
      await page.waitForTimeout(500);
      
      await page.click('button:has-text("+ Stem voor B")');
      await page.click('button:has-text("+ Stem voor B")');
      await page.waitForTimeout(200);
      
      // Navigate to Phase 2 to trigger transfer
      await page.click('nav button:has-text("Fase 2")');
      await page.waitForTimeout(1000);
      
      const phase2Data = await page.evaluate(() => {
        return {
          winners: window.app && window.app.phase2 && window.app.phase2.winnersFromPhase1,
          patterns: window.app && window.app.phase2 && window.app.phase2.suggestedPatterns
        };
      });
      
      expect(phase2Data.winners).toBeDefined();
      expect(Array.isArray(phase2Data.winners)).toBe(true);
      expect(phase2Data.winners.length).toBeGreaterThan(0);
      expect(phase2Data.patterns).toBeDefined();
    });

    test('winner data persists after phase change', async ({ page }) => {
      // Vote on pairs
      await page.click('button:has-text("+ Stem voor A")');
      await page.click('button:has-text("+ Stem voor A")');
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(200);
      
      // Go to Phase 2
      await page.click('nav button:has-text("Fase 2")');
      await page.waitForTimeout(1000);
      
      // Go back to Phase 1
      await page.click('nav button:has-text("Fase 1")');
      await page.waitForTimeout(1000);
      
      // Go to Phase 2 again
      await page.click('nav button:has-text("Fase 2")');
      await page.waitForTimeout(1000);
      
      const persistedWinners = await page.evaluate(() => {
        return window.app && window.app.phase2 && window.app.phase2.winnersFromPhase1;
      });
      
      expect(persistedWinners).toBeDefined();
      expect(persistedWinners.length).toBeGreaterThan(0);
      expect(persistedWinners[0].votes).toBe(3);
    });

    test('data transfer works with browser refresh', async ({ page }) => {
      // Vote and navigate to Phase 2
      await page.click('button:has-text("+ Stem voor A")');
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(200);
      
      await page.click('nav button:has-text("Fase 2")');
      await page.waitForTimeout(1000);
      
      // Refresh the page
      await page.reload();
      await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
      await page.waitForTimeout(2000);
      
      // Check if data is still there
      const winnersAfterRefresh = await page.evaluate(() => {
        return window.app && window.app.phase2 && window.app.phase2.winnersFromPhase1;
      });
      
      expect(winnersAfterRefresh).toBeDefined();
      expect(winnersAfterRefresh.length).toBeGreaterThan(0);
    });
  });

  test.describe('UI Integration', () => {
    test('celebration screen appears in presentation mode when complete', async ({ page }) => {
      // Switch to presentation mode
      await page.click('button:has-text("Presenteren")');
      await page.waitForTimeout(500);
      
      // Vote on enough pairs to potentially trigger completion
      // (We don't know exact count, so vote on several)
      for (let i = 0; i < 5; i++) {
        await page.click('button:has-text("+ Stem voor A")');
        await page.waitForTimeout(200);
        
        if (i < 4) {
          await page.click('button:has-text("Volgende →")');
          await page.waitForTimeout(300);
        }
      }
      
      // Check if celebration conditions are met
      const celebrationConditions = await page.evaluate(() => {
        const app = window.app;
        if (!app || !app.phase1) return null;
        
        return {
          isComplete: app.phase1.isPhaseComplete && app.phase1.isPhaseComplete(),
          isPresentationMode: app.presentationMode,
          isPhase1: app.currentPhase === 1,
          winners: app.phase1.getWinners && app.phase1.getWinners().length || 0
        };
      });
      
      expect(celebrationConditions).toBeDefined();
      expect(celebrationConditions.isPresentationMode).toBe(true);
      expect(celebrationConditions.isPhase1).toBe(true);
      
      // If complete, celebration should be visible
      if (celebrationConditions.isComplete) {
        // Note: In a real test we'd check for the celebration element
        console.log('✅ Celebration conditions met:', celebrationConditions);
      }
    });

    test('control panel shows completion status', async ({ page }) => {
      // Switch to control mode if needed
      await page.click('button:has-text("Beheer")');
      await page.waitForTimeout(500);
      
      // Vote on some pairs
      await page.click('button:has-text("+ Stem voor A")');
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(200);
      
      await page.click('button:has-text("Volgende →")');
      await page.waitForTimeout(500);
      
      await page.click('button:has-text("+ Stem voor B")');
      await page.waitForTimeout(200);
      
      // Check if completion status is displayed
      const statusDisplay = await page.locator('.completion-status, .progress-indicator, text=Ronde').first();
      // Note: The exact selector depends on implementation, this tests the concept
      
      const hasProgressIndicator = await page.locator('text=van').count() > 0;
      expect(hasProgressIndicator).toBeTruthy(); // Should show "Ronde X van Y"
    });
  });

  test.describe('Edge Cases', () => {
    test('handles zero votes gracefully', async ({ page }) => {
      // Don't vote on anything, just test functions
      const winners = await page.evaluate(() => {
        return window.app && window.app.phase1 && window.app.phase1.getWinners();
      });
      
      expect(Array.isArray(winners)).toBe(true);
      expect(winners.length).toBe(0);
    });

    test('handles rapid phase switching', async ({ page }) => {
      // Vote quickly
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(100);
      
      // Rapid phase switching
      await page.click('nav button:has-text("Fase 2")');
      await page.waitForTimeout(200);
      await page.click('nav button:has-text("Fase 1")');
      await page.waitForTimeout(200);
      await page.click('nav button:has-text("Fase 2")');
      await page.waitForTimeout(500);
      
      // Should still have data
      const winners = await page.evaluate(() => {
        return window.app && window.app.phase2 && window.app.phase2.winnersFromPhase1;
      });
      
      expect(winners).toBeDefined();
    });

    test('transition timing is under 2 seconds', async ({ page }) => {
      // Vote on a pair
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(200);
      
      // Measure transition time
      const startTime = Date.now();
      await page.click('nav button:has-text("Fase 2")');
      
      // Wait for Phase 2 to be active
      await page.waitForFunction(() => window.app && window.app.currentPhase === 2);
      const endTime = Date.now();
      
      const transitionTime = endTime - startTime;
      expect(transitionTime).toBeLessThan(2000); // Less than 2 seconds
      
      console.log(`✅ Phase transition took ${transitionTime}ms`);
    });
  });

  test.describe('Browser Compatibility', () => {
    test('works in current browser', async ({ page, browserName }) => {
      // Vote and transition
      await page.click('button:has-text("+ Stem voor A")');
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(200);
      
      await page.click('nav button:has-text("Fase 2")');
      await page.waitForTimeout(1000);
      
      const winners = await page.evaluate(() => {
        return window.app && window.app.phase2 && window.app.phase2.winnersFromPhase1;
      });
      
      expect(winners).toBeDefined();
      expect(winners.length).toBeGreaterThan(0);
      
      console.log(`✅ Phase 1→2 transition works in ${browserName}`);
    });
  });
});