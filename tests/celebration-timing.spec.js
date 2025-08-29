import { test, expect } from '@playwright/test';

test.describe('Celebration Screen Timing Fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000');
    
    // Wait for loading to complete
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    await page.waitForTimeout(2000);
    
    // Navigate to Phase 1 and switch to control mode
    await page.click('nav button:has-text("Fase 1")');
    await page.evaluate(() => {
      const bodyEl = document.querySelector('body[x-data]');
      const appData = Alpine.$data(bodyEl);
      if (appData) {
        appData.presentationMode = false; // Control mode
      }
    });
    await page.waitForTimeout(1000);
  });

  test('Celebration does NOT appear automatically after all pairs are voted', async ({ page }) => {
    // Add votes to all 5 pairs to complete Phase 1
    await page.evaluate(() => {
      const bodyEl = document.querySelector('body[x-data]');
      const appData = Alpine.$data(bodyEl);
      
      // Vote on all pairs
      appData.phase1.votingSystem.pairVotes = {
        '0': { companyA: 3, companyB: 1 },
        '1': { companyA: 1, companyB: 4 },
        '2': { companyA: 2, companyB: 2 },
        '3': { companyA: 4, companyB: 0 },
        '4': { companyA: 2, companyB: 3 }  // All pairs now have votes
      };
      
      // Set to last pair
      appData.phase1.companyPairs.currentIndex = 4;
      appData.phase1.votingSystem.loadVotesForCurrentPair();
    });

    await page.waitForTimeout(1000);

    // Switch to presentation mode
    await page.evaluate(() => {
      const bodyEl = document.querySelector('body[x-data]');
      const appData = Alpine.$data(bodyEl);
      appData.presentationMode = true;
    });

    await page.waitForTimeout(1000);

    // Verify phase is complete but celebration is NOT showing
    const isComplete = await page.evaluate(() => {
      const bodyEl = document.querySelector('body[x-data]');
      const appData = Alpine.$data(bodyEl);
      return {
        isPhaseComplete: appData.phase1.isPhaseComplete(),
        celebrationTriggered: appData.phase1.celebrationTriggered,
        presentationMode: appData.presentationMode
      };
    });

    expect(isComplete.isPhaseComplete).toBe(true);
    expect(isComplete.celebrationTriggered).toBe(false);
    expect(isComplete.presentationMode).toBe(true);

    // Verify celebration screen is NOT visible (use specific selector for celebration overlay)
    const celebrationScreen = page.locator('div.fixed.inset-0:has-text("Fase 1 Voltooid!")');
    await expect(celebrationScreen).not.toBeVisible();

    console.log('✅ Celebration screen correctly hidden even though phase is complete');
  });

  test('Celebration DOES appear when facilitator presses N on last pair', async ({ page }) => {
    // Setup: Navigate to last pair (doesn't require all pairs to have votes)
    await page.evaluate(() => {
      const bodyEl = document.querySelector('body[x-data]');
      const appData = Alpine.$data(bodyEl);
      
      // Set to last pair (index 4 = 5th pair)
      appData.phase1.companyPairs.currentIndex = 4;
      appData.phase1.votingSystem.loadVotesForCurrentPair();
      
      // Set timer to discussion state (required for 'N' key to work)
      appData.phase1.timer.state = 'discussion';
      if (appData.phase1.timerState !== undefined) {
        appData.phase1.timerState = 'discussion';
      }
      
      // Add some votes to current pair (optional - facilitator choice)
      appData.phase1.votingSystem.pairVotes = {
        '4': { companyA: 2, companyB: 3 }  // Only current pair needs votes
      };
      appData.phase1.votingSystem.loadVotesForCurrentPair();
    });

    await page.waitForTimeout(1000);

    // Switch to presentation mode  
    await page.evaluate(() => {
      const bodyEl = document.querySelector('body[x-data]');
      const appData = Alpine.$data(bodyEl);
      appData.presentationMode = true;
    });

    await page.waitForTimeout(1000);

    // Verify celebration is still not showing
    const celebrationBefore = page.locator('div.fixed.inset-0:has-text("Fase 1 Voltooid!")');
    await expect(celebrationBefore).not.toBeVisible();

    // Press 'N' key to trigger celebration
    await page.keyboard.press('n');
    await page.waitForTimeout(1000);

    // Verify celebration is NOW showing
    const celebrationAfter = page.locator('div.fixed.inset-0:has-text("Fase 1 Voltooid!")');
    await expect(celebrationAfter).toBeVisible();

    // Verify flag was set
    const celebrationState = await page.evaluate(() => {
      const bodyEl = document.querySelector('body[x-data]');
      const appData = Alpine.$data(bodyEl);
      return appData.phase1.celebrationTriggered;
    });

    expect(celebrationState).toBe(true);

    console.log('✅ Celebration screen correctly appears after pressing N on last pair');
  });

  test('Celebration flag resets when transitioning to Phase 2', async ({ page }) => {
    // Setup celebration state
    await page.evaluate(() => {
      const bodyEl = document.querySelector('body[x-data]');
      const appData = Alpine.$data(bodyEl);
      
      // Trigger celebration
      appData.phase1.celebrationTriggered = true;
      
      // Add some winners for Phase 2 transition
      appData.phase1.votingSystem.pairVotes = {
        '0': { companyA: 3, companyB: 1 },
        '1': { companyA: 1, companyB: 4 }
      };
    });

    // Navigate to Phase 2
    await page.click('nav button:has-text("Fase 2")');
    await page.waitForTimeout(1000);

    // Verify flag was reset
    const flagReset = await page.evaluate(() => {
      const bodyEl = document.querySelector('body[x-data]');
      const appData = Alpine.$data(bodyEl);
      return {
        celebrationTriggered: appData.phase1.celebrationTriggered,
        currentPhase: appData.currentPhase
      };
    });

    expect(flagReset.celebrationTriggered).toBe(false);
    expect(flagReset.currentPhase).toBe(2);

    console.log('✅ Celebration flag correctly reset when transitioning to Phase 2');
  });
});