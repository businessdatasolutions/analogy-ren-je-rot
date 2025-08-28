import { test, expect } from '@playwright/test';

test.describe('Phase 1-2 Transition Basic Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for loading to complete
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Wait for Alpine.js to fully initialize
    await page.waitForTimeout(3000);
    
    // Navigate to Phase 1
    await page.click('nav button:has-text("Fase 1")');
    await page.waitForTimeout(1000);
    
    // Switch to control mode to ensure voting interface is visible
    await page.evaluate(() => {
      const bodyEl = document.querySelector('body[x-data]');
      const appData = Alpine.$data(bodyEl);
      if (appData) {
        appData.presentationMode = false;
      }
    });
    await page.waitForTimeout(1000);
  });

  test('Application loads and Phase 1 is accessible', async ({ page }) => {
    // First check if app is loaded at all
    const appState = await page.evaluate(() => {
      const bodyEl = document.querySelector('body[x-data]');
      if (!bodyEl) return { error: 'No body with x-data found' };
      
      try {
        const appData = Alpine.$data(bodyEl);
        return {
          hasApp: !!appData,
          currentPhase: appData?.currentPhase,
          controlMode: appData?.controlMode,
          presentationMode: appData?.presentationMode,
          loading: appData?.loading
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('App state:', appState);
    
    // Verify we're on Phase 1
    const phase1Button = await page.locator('nav button:has-text("Fase 1")');
    await expect(phase1Button).toHaveClass(/bg-primary-600/);
    
    // Control mode should already be set in beforeEach
    
    // Now check if vote button is visible in control mode
    const voteButtonA = page.locator('button:has-text("+ Stem voor A")');
    await expect(voteButtonA).toBeVisible({ timeout: 5000 });
    
    // Verify basic loading worked
    expect(appState.hasApp).toBe(true);
    expect(appState.currentPhase).toBe(1);
    
    console.log('✅ Phase 1 application loaded successfully');
  });

  test('Vote counting works correctly', async ({ page }) => {
    // Vote for Company A
    await page.click('button:has-text("+ Stem voor A")');
    await page.waitForTimeout(500);
    
    // Check if vote count increased by using x-text selector
    const voteCountA = await page.locator('span[x-text*="phase1?.votes?.companyA"]').textContent();
    const votes = parseInt(voteCountA) || 0;
    expect(votes).toBeGreaterThan(0);
    
    console.log(`✅ Vote counting works: ${votes} votes recorded`);
  });

  test('Navigation between pairs works', async ({ page }) => {
    // Vote on current pair
    await page.click('button:has-text("+ Stem voor A")');
    await page.waitForTimeout(500);
    
    // Try to go to next pair
    const nextButton = page.locator('button:has-text("Volgende →")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Verify we moved to next pair (vote counts should be 0)
      const voteCountA = await page.locator('span[x-text*="phase1?.votes?.companyA"]').textContent();
      const votes = parseInt(voteCountA) || 0;
      expect(votes).toBe(0); // New pair should have 0 votes
      
      console.log('✅ Pair navigation works correctly');
    } else {
      console.log('⚠️ Next button not visible - may be end of pairs');
    }
  });

  test('Phase 2 navigation works', async ({ page }) => {
    // Vote on at least one pair
    await page.click('button:has-text("+ Stem voor A")');
    await page.waitForTimeout(500);
    
    // Navigate to Phase 2
    await page.click('nav button:has-text("Fase 2")');
    await page.waitForTimeout(1000);
    
    // Verify we're now on Phase 2
    const phase2Button = await page.locator('nav button:has-text("Fase 2")');
    await expect(phase2Button).toHaveClass(/bg-primary-600/);
    
    // Look for Phase 2 content (archetype or pattern elements)
    const phase2Content = page.locator('text=/[Aa]rchetype|[Pp]atroon|[Ss]trateg/').first();
    await expect(phase2Content).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Phase 2 navigation successful');
  });

  test('JavaScript API functions exist', async ({ page }) => {
    // Wait extra time for Alpine.js
    await page.waitForTimeout(3000);
    
    // Test basic API access through Alpine.js
    const apiResult = await page.evaluate(() => {
      try {
        // Access through Alpine.js $data
        const bodyEl = document.querySelector('body[x-data]');
        const appData = Alpine.$data(bodyEl);
        
        const hasApp = typeof appData !== 'undefined';
        const hasPhase1 = appData && appData.phase1;
        const hasCurrentPhase = appData && typeof appData.currentPhase !== 'undefined';
        
        return {
          hasApp,
          hasPhase1,
          hasCurrentPhase,
          currentPhase: appData?.currentPhase
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    expect(apiResult.hasApp).toBe(true);
    expect(apiResult.hasCurrentPhase).toBe(true);
    expect(apiResult.currentPhase).toBe(1);
    
    console.log('✅ JavaScript API accessible:', apiResult);
  });

  test('Winner calculation API works', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Test winner calculation with programmatic votes
    const winnerTest = await page.evaluate(() => {
      try {
        // Add some test votes programmatically
        const bodyEl = document.querySelector('body[x-data]');
        const appData = Alpine.$data(bodyEl);
        
        if (appData && appData.phase1 && appData.phase1.votingSystem) {
          appData.phase1.votingSystem.pairVotes = {
            '0': { companyA: 3, companyB: 1 },
            '1': { companyA: 1, companyB: 2 }
          };
          
          const winners = appData.phase1.getWinners();
          return {
            success: true,
            winnersCount: winners ? winners.length : 0,
            winnersArray: Array.isArray(winners),
            firstWinner: winners && winners[0] ? {
              hasName: !!winners[0].name,
              hasVotes: typeof winners[0].votes === 'number',
              votes: winners[0].votes
            } : null
          };
        }
        return { success: false, reason: 'Phase 1 not initialized' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(winnerTest.success).toBe(true);
    expect(winnerTest.winnersCount).toBeGreaterThan(0);
    expect(winnerTest.winnersArray).toBe(true);
    
    if (winnerTest.firstWinner) {
      expect(winnerTest.firstWinner.hasName).toBe(true);
      expect(winnerTest.firstWinner.hasVotes).toBe(true);
      expect(winnerTest.firstWinner.votes).toBeGreaterThan(0);
    }
    
    console.log('✅ Winner calculation works:', winnerTest);
  });

  test('Phase completion detection works', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    const completionTest = await page.evaluate(() => {
      try {
        const bodyEl = document.querySelector('body[x-data]');
        const appData = Alpine.$data(bodyEl);
        
        // Test with no votes
        const emptyComplete = appData.phase1.isPhaseComplete();
        
        // Add votes and test again
        appData.phase1.votingSystem.pairVotes = {
          '0': { companyA: 2, companyB: 1 }
        };
        
        const partialComplete = appData.phase1.isPhaseComplete();
        
        const status = appData.phase1.getCompletionStatus();
        
        return {
          success: true,
          emptyComplete,
          partialComplete,
          hasStatus: !!status,
          votedPairs: status?.votedPairs,
          completionPercentage: status?.completionPercentage
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(completionTest.success).toBe(true);
    expect(completionTest.emptyComplete).toBe(false);
    expect(completionTest.hasStatus).toBe(true);
    expect(completionTest.votedPairs).toBeGreaterThan(0);
    expect(completionTest.completionPercentage).toBeGreaterThan(0);
    
    console.log('✅ Phase completion detection works:', completionTest);
  });

  test('Data transfer to Phase 2 works', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Set up votes and navigate to Phase 2
    const transferTest = await page.evaluate(() => {
      try {
        const bodyEl = document.querySelector('body[x-data]');
        const appData = Alpine.$data(bodyEl);
        
        // Add votes
        appData.phase1.votingSystem.pairVotes = {
          '0': { companyA: 3, companyB: 1 },
          '1': { companyA: 1, companyB: 4 }
        };
        
        // Trigger transition to Phase 2
        appData.setCurrentPhase(2);
        
        // Check if data was transferred
        const phase2Winners = appData.phase2?.winnersFromPhase1;
        const suggestedPatterns = appData.phase2?.suggestedPatterns;
        
        return {
          success: true,
          hasWinners: Array.isArray(phase2Winners),
          winnersCount: phase2Winners?.length || 0,
          hasPatterns: typeof suggestedPatterns !== 'undefined',
          currentPhase: appData.currentPhase
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(transferTest.success).toBe(true);
    expect(transferTest.currentPhase).toBe(2);
    expect(transferTest.hasWinners).toBe(true);
    expect(transferTest.winnersCount).toBeGreaterThan(0);
    
    console.log('✅ Data transfer to Phase 2 works:', transferTest);
  });

  test('End-to-end workflow validation', async ({ page }) => {
    console.log('🧪 Running end-to-end workflow test...');
    
    await page.waitForTimeout(3000);
    
    // Step 1: Vote on pairs
    await page.click('button:has-text("+ Stem voor A")');
    await page.waitForTimeout(300);
    
    // Step 2: Navigate to next pair if possible
    const nextButton = page.locator('button:has-text("Volgende →")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(300);
      
      await page.click('button:has-text("+ Stem voor B")');
      await page.waitForTimeout(300);
    }
    
    // Step 3: Navigate to Phase 2
    await page.click('nav button:has-text("Fase 2")');
    await page.waitForTimeout(1000);
    
    // Step 4: Verify Phase 2 is active and has data
    const workflowResult = await page.evaluate(() => {
      try {
        const bodyEl = document.querySelector('body[x-data]');
        const appData = Alpine.$data(bodyEl);
        
        return {
          currentPhase: appData.currentPhase,
          hasPhase2Winners: Array.isArray(appData.phase2?.winnersFromPhase1),
          winnersCount: appData.phase2?.winnersFromPhase1?.length || 0,
          success: true
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    expect(workflowResult.success).toBe(true);
    expect(workflowResult.currentPhase).toBe(2);
    expect(workflowResult.hasPhase2Winners).toBe(true);
    expect(workflowResult.winnersCount).toBeGreaterThan(0);
    
    console.log('✅ End-to-end workflow completed successfully:', workflowResult);
  });
});