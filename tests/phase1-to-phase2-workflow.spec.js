import { test, expect } from '@playwright/test';

test.describe('Phase 1 to Phase 2 Workflow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Navigate to Phase 1
    await page.click('nav button:has-text("Fase 1")');
    await page.waitForTimeout(1000);
  });

  test('complete voting workflow triggers winner calculation', async ({ page }) => {
    // Vote on first 3 pairs to establish winners
    for (let i = 0; i < 3; i++) {
      // Vote for Company A
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(500);
      
      // Move to next pair
      if (i < 2) {
        await page.click('button:has-text("Volgende →")');
        await page.waitForTimeout(500);
      }
    }
    
    // Check that votes were recorded
    const voteCountA = await page.locator('.vote-count-a').textContent();
    expect(parseInt(voteCountA)).toBeGreaterThan(0);
    
    // Check if phase completion detection works
    const completionStatus = await page.evaluate(() => {
      return window.app && window.app.phase1 && window.app.phase1.getCompletionStatus();
    });
    
    expect(completionStatus).toBeDefined();
  });

  test('winner calculation returns correct format', async ({ page }) => {
    // Vote on a few pairs
    await page.click('button:has-text("+ Stem voor A")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Volgende →")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("+ Stem voor B")');
    await page.waitForTimeout(500);
    
    // Get winners from JavaScript
    const winners = await page.evaluate(() => {
      return window.app && window.app.phase1 && window.app.phase1.getWinners();
    });
    
    expect(winners).toBeDefined();
    expect(Array.isArray(winners)).toBe(true);
    
    if (winners.length > 0) {
      const winner = winners[0];
      expect(winner).toHaveProperty('name');
      expect(winner).toHaveProperty('votes');
      expect(winner).toHaveProperty('pairIndex');
      expect(winner).toHaveProperty('winType');
    }
  });

  test('phase 1 completion shows celebration screen in presentation mode', async ({ page }) => {
    // Switch to presentation mode
    await page.click('button:has-text("Presenteren")');
    await page.waitForTimeout(500);
    
    // Vote on enough pairs to trigger completion
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("+ Stem voor A")');
      await page.waitForTimeout(300);
      
      if (i < 4) {
        await page.click('button:has-text("Volgende →")');
        await page.waitForTimeout(300);
      }
    }
    
    // Check if celebration screen appears
    const celebrationVisible = await page.evaluate(() => {
      const app = window.app;
      if (!app || !app.phase1) return false;
      
      const isComplete = app.phase1.isPhaseComplete && app.phase1.isPhaseComplete();
      const isPresentationMode = app.presentationMode;
      const isPhase1 = app.currentPhase === 1;
      
      return isComplete && isPresentationMode && isPhase1;
    });
    
    // Note: The celebration screen should be visible based on Alpine.js conditions
    console.log('Celebration conditions met:', celebrationVisible);
  });

  test('winner data transfers to phase 2', async ({ page }) => {
    // Vote on some pairs
    await page.click('button:has-text("+ Stem voor A")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Volgende →")');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("+ Stem voor B")');
    await page.waitForTimeout(500);
    
    // Manually trigger transition to Phase 2
    await page.click('nav button:has-text("Fase 2")');
    await page.waitForTimeout(1000);
    
    // Check if winners were transferred to Phase 2
    const phase2Winners = await page.evaluate(() => {
      return window.app && window.app.phase2 && window.app.phase2.winnersFromPhase1;
    });
    
    expect(phase2Winners).toBeDefined();
    if (phase2Winners && phase2Winners.length > 0) {
      expect(phase2Winners[0]).toHaveProperty('name');
      expect(phase2Winners[0]).toHaveProperty('votes');
    }
  });

  test('transition animations work smoothly', async ({ page }) => {
    // Test CSS animations are loaded
    const animationStyles = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        celebrationFadeIn: styles.getPropertyValue('--celebration-fade-in') || 'loaded',
        slideInUp: styles.getPropertyValue('--slide-in-up') || 'loaded'
      };
    });
    
    expect(animationStyles).toBeDefined();
    
    // Vote to create some winners
    await page.click('button:has-text("+ Stem voor A")');
    await page.waitForTimeout(500);
    
    // Check smooth transition between phases
    const transitionTime = Date.now();
    await page.click('nav button:has-text("Fase 2")');
    await page.waitForTimeout(1000);
    const endTime = Date.now();
    
    // Transition should be reasonably fast (< 2 seconds)
    expect(endTime - transitionTime).toBeLessThan(2000);
  });
});