import { test, expect } from '@playwright/test';

test.describe('Phase 1-2 Workflow Validation', () => {
  test('Application loads and basic functionality works', async ({ page }) => {
    await page.goto('/');
    
    // Wait for application to load
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    await page.waitForTimeout(3000); // Extended wait for Alpine.js
    
    // Check if we're on Phase 1
    const phase1Button = await page.locator('nav button:has-text("Fase 1")');
    await expect(phase1Button).toBeVisible();
    
    // Click Phase 1 to ensure we're there
    await phase1Button.click();
    await page.waitForTimeout(1000);
    
    // Verify Alpine.js app object exists with some patience
    const appResult = await page.waitForFunction(
      () => {
        return window.app && 
               window.app.phase1 && 
               window.app.currentPhase === 1;
      }, 
      { timeout: 10000 }
    );
    
    expect(appResult).toBeTruthy();
    
    // Test JavaScript functions are accessible
    const functionsExist = await page.evaluate(() => {
      try {
        return {
          hasApp: !!window.app,
          hasPhase1: !!window.app.phase1,
          hasGetWinners: typeof window.app.phase1.getWinners === 'function',
          hasIsPhaseComplete: typeof window.app.phase1.isPhaseComplete === 'function',
          currentPhase: window.app.currentPhase
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    expect(functionsExist.hasApp).toBe(true);
    expect(functionsExist.hasPhase1).toBe(true);
    expect(functionsExist.hasGetWinners).toBe(true);
    expect(functionsExist.hasIsPhaseComplete).toBe(true);
    expect(functionsExist.currentPhase).toBe(1);
    
    // Test winner calculation (should return empty array initially)
    const winners = await page.evaluate(() => {
      try {
        return window.app.phase1.getWinners();
      } catch (error) {
        return { error: error.message };
      }
    });
    
    expect(Array.isArray(winners)).toBe(true);
    
    // Test phase completion detection
    const isComplete = await page.evaluate(() => {
      try {
        return window.app.phase1.isPhaseComplete();
      } catch (error) {
        return { error: error.message };
      }
    });
    
    expect(typeof isComplete).toBe('boolean');
    
    // Test phase transition to Phase 2
    await page.click('nav button:has-text("Fase 2")');
    await page.waitForTimeout(1000);
    
    const phase2Active = await page.evaluate(() => {
      try {
        return {
          currentPhase: window.app.currentPhase,
          hasPhase2: !!window.app.phase2,
          hasWinnersArray: Array.isArray(window.app.phase2?.winnersFromPhase1)
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    expect(phase2Active.currentPhase).toBe(2);
    expect(phase2Active.hasPhase2).toBe(true);
    expect(phase2Active.hasWinnersArray).toBe(true);
    
    console.log('✅ Phase 1-2 transition workflow validation passed');
  });
  
  test('Winner calculation and data transfer works', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    await page.waitForTimeout(3000);
    
    // Ensure Phase 1
    await page.click('nav button:has-text("Fase 1")');
    await page.waitForTimeout(1000);
    
    // Wait for app to be ready
    await page.waitForFunction(() => window.app && window.app.phase1, { timeout: 10000 });
    
    // Simulate some votes programmatically (since UI voting is complex)
    const voteResult = await page.evaluate(() => {
      try {
        // Directly add votes to test winner calculation
        if (window.app.phase1.votingSystem) {
          window.app.phase1.votingSystem.pairVotes = {
            '0': { companyA: 3, companyB: 1 },
            '1': { companyA: 0, companyB: 2 },
            '2': { companyA: 4, companyB: 0 }
          };
        }
        
        const winners = window.app.phase1.getWinners();
        const isComplete = window.app.phase1.isPhaseComplete();
        
        return {
          success: true,
          winners: winners,
          isComplete: isComplete,
          winnerCount: winners.length
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(voteResult.success).toBe(true);
    expect(voteResult.winnerCount).toBeGreaterThan(0);
    expect(voteResult.isComplete).toBe(true);
    
    // Test transition to Phase 2 with winners
    await page.click('nav button:has-text("Fase 2")');
    await page.waitForTimeout(1000);
    
    const transferResult = await page.evaluate(() => {
      try {
        return {
          success: true,
          currentPhase: window.app.currentPhase,
          winnersTransferred: window.app.phase2?.winnersFromPhase1?.length || 0,
          hasPatterns: Array.isArray(window.app.phase2?.suggestedPatterns)
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(transferResult.success).toBe(true);
    expect(transferResult.currentPhase).toBe(2);
    expect(transferResult.winnersTransferred).toBeGreaterThan(0);
    expect(transferResult.hasPatterns).toBe(true);
    
    console.log('✅ Winner calculation and data transfer validation passed');
  });
});