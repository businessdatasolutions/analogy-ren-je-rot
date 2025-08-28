import { test, expect } from '@playwright/test';

test.describe('Phase 1: Strategic Preference Round Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Navigate to Phase 1 (should be default)
    await page.click('nav button:has-text("Fase 1")');
    await page.waitForTimeout(500);
  });

  test.describe('Timer System', () => {
    test('timer displays default 10 seconds for strategic rounds', async ({ page }) => {
      // Check initial timer display shows ready state
      const timerState = page.locator('[x-show="phase1?.timerState === \'ready\'"]');
      await expect(timerState).toBeVisible();
      
      // Check timer controls are present
      await expect(page.locator('button:has-text("Start Round")')).toBeVisible();
      await expect(page.locator('button:has-text("Reset")')).toBeVisible();
    });

    test('timer can be started and counts down', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start Round")');
      
      await startButton.click();
      
      // Wait for announcement phase to complete and countdown to start
      await page.waitForTimeout(2500); // 2s announcement + 0.5s buffer
      
      // Check that countdown state is visible
      const countdownState = page.locator('[x-show="phase1?.timerState === \'countdown\'"]');
      await expect(countdownState).toBeVisible();
      
      // Check that timer shows a number (should be counting down from 10)
      const timerNumber = page.locator('[x-text="phase1?.timerLeft || 10"]');
      await expect(timerNumber).toBeVisible();
    });

    test('timer can be paused and resumed', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start Round")');
      const pauseButton = page.locator('button:has-text("Pause")');
      const timerDisplay = page.locator('[x-text="phase1?.timerLeft || 10"]');
      
      // Start timer
      await startButton.click();
      await page.waitForTimeout(1100);
      
      // Pause timer
      await pauseButton.click();
      const pausedTime = await timerDisplay.textContent();
      
      // Wait and verify time doesn't change when paused
      await page.waitForTimeout(1000);
      await expect(timerDisplay).toContainText(pausedTime);
      
      // Resume timer
      await startButton.click();
      await page.waitForTimeout(1100);
      await expect(timerDisplay).not.toContainText(pausedTime);
    });

    test('timer can be reset to original time', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start Round")');
      const resetButton = page.locator('button:has-text("Reset")');
      const timerDisplay = page.locator('[x-text="phase1?.timerLeft || 10"]');
      
      // Start timer and let it run
      await startButton.click();
      await page.waitForTimeout(2100);
      
      // Reset timer
      await resetButton.click();
      await expect(timerDisplay).toContainText('10');
      await expect(startButton).toBeEnabled();
    });

    test('timer shows completion state when reaching zero', async ({ page }) => {
      // Set a very short timer for testing
      await page.evaluate(() => {
        const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
        app.timer.timeLeft = 2; // 2 seconds
      });
      
      const startButton = page.locator('button:has-text("Start Round")');
      const timerDisplay = page.locator('[x-text="phase1?.timerLeft || 10"]');
      
      await startButton.click();
      
      // Wait for timer to complete
      await page.waitForTimeout(3000);
      await expect(timerDisplay).toContainText('0');
      
      // Check timer completion indicators  
      await expect(page.locator('[x-show="phase1?.timerState === \'completed\'"]')).toBeVisible();
    });
  });

  test.describe('Company Pairs Display', () => {
    test('displays current company pair with A and B options', async ({ page }) => {
      // Check company pair display
      const companyPairDisplay = page.locator('[x-show="currentPhase === 2"]');
      await expect(companyPairDisplay).toBeVisible();
      
      // Check A and B company displays
      const companyA = page.locator('[x-text="currentPair.companyA"]');
      const companyB = page.locator('[x-text="currentPair.companyB"]');
      
      await expect(companyA).toBeVisible();
      await expect(companyB).toBeVisible();
      
      // Verify companies are different
      const companyAText = await companyA.textContent();
      const companyBText = await companyB.textContent();
      expect(companyAText).not.toBe(companyBText);
    });

    test('displays pair counter showing current position', async ({ page }) => {
      const pairCounter = page.locator('[x-text="phase1?.pairCounter || \'1 / 5\'"]');
      await expect(pairCounter).toBeVisible();
      
      // Should show format like "1 / 10"
      const counterText = await pairCounter.textContent();
      expect(counterText).toMatch(/^\d+ \/ \d+$/);
    });

    test('can navigate to next company pair', async ({ page }) => {
      const nextButton = page.locator('button:has-text("Next →")');
      const pairCounter = page.locator('[x-text="phase1?.pairCounter || \'1 / 5\'"]');
      
      // Get initial pair info
      const initialCounter = await pairCounter.textContent();
      const initialCompanyA = await page.locator('[x-text="currentPair.companyA"]').textContent();
      
      // Click next if available
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);
        
        // Verify pair changed
        const newCounter = await pairCounter.textContent();
        const newCompanyA = await page.locator('[x-text="currentPair.companyA"]').textContent();
        
        expect(newCounter).not.toBe(initialCounter);
        expect(newCompanyA).not.toBe(initialCompanyA);
      }
    });

    test('can navigate to previous company pair', async ({ page }) => {
      const nextButton = page.locator('button:has-text("Next →")');
      const prevButton = page.locator('button:has-text("Previous Pair")');
      const pairCounter = page.locator('[x-text="phase1?.pairCounter || \'1 / 5\'"]');
      
      // Go to next pair first
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);
        
        const secondPairCounter = await pairCounter.textContent();
        
        // Go back to previous
        await prevButton.click();
        await page.waitForTimeout(500);
        
        const backToPairCounter = await pairCounter.textContent();
        expect(backToPairCounter).not.toBe(secondPairCounter);
      }
    });
  });

  test.describe('Voting System', () => {
    test('displays vote counts for both options', async ({ page }) => {
      const votesA = page.locator('[x-text="phase2.votes.companyA"]');
      const votesB = page.locator('[x-text="phase2.votes.companyB"]');
      
      await expect(votesA).toBeVisible();
      await expect(votesB).toBeVisible();
      
      // Should start at 0
      await expect(votesA).toContainText('0');
      await expect(votesB).toContainText('0');
    });

    test('can vote for Company A', async ({ page }) => {
      const voteAButton = page.locator('button:has-text("+ Vote for A")');
      const votesA = page.locator('[x-text="phase2.votes.companyA"]');
      
      await voteAButton.click();
      await page.waitForTimeout(500);
      
      await expect(votesA).toContainText('1');
    });

    test('can vote for Company B', async ({ page }) => {
      const voteBButton = page.locator('button:has-text("+ Vote for B")');
      const votesB = page.locator('[x-text="phase2.votes.companyB"]');
      
      await voteBButton.click();
      await page.waitForTimeout(500);
      
      await expect(votesB).toContainText('1');
    });

    test('vote counts accumulate correctly', async ({ page }) => {
      const voteAButton = page.locator('button:has-text("+ Vote for A")');
      const voteBButton = page.locator('button:has-text("+ Vote for B")');
      const votesA = page.locator('[x-text="phase2.votes.companyA"]');
      const votesB = page.locator('[x-text="phase2.votes.companyB"]');
      
      // Vote for A multiple times
      await voteAButton.click();
      await voteAButton.click();
      await voteAButton.click();
      
      // Vote for B once
      await voteBButton.click();
      
      await page.waitForTimeout(500);
      
      await expect(votesA).toContainText('3');
      await expect(votesB).toContainText('1');
    });

    test('can reset vote counts', async ({ page }) => {
      const voteAButton = page.locator('button:has-text("+ Vote for A")');
      const voteBButton = page.locator('button:has-text("+ Vote for B")');
      const resetButton = page.locator('button:has-text("Reset Current Pair Votes")');
      const votesA = page.locator('[x-text="phase2.votes.companyA"]');
      const votesB = page.locator('[x-text="phase2.votes.companyB"]');
      
      // Add some votes
      await voteAButton.click();
      await voteBButton.click();
      await voteBButton.click();
      
      // Reset votes
      await resetButton.click();
      await page.waitForTimeout(500);
      
      await expect(votesA).toContainText('0');
      await expect(votesB).toContainText('0');
    });
  });

  test.describe('Data Persistence', () => {
    test('vote data persists across page refresh', async ({ page }) => {
      const voteAButton = page.locator('button:has-text("+ Vote for A")');
      const voteBButton = page.locator('button:has-text("+ Vote for B")');
      
      // Add votes
      await voteAButton.click();
      await voteAButton.click();
      await voteBButton.click();
      
      // Wait for auto-save
      await page.waitForTimeout(3000);
      
      // Refresh page
      await page.reload();
      await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
      
      // Navigate back to Phase 1
      await page.click('nav button:has-text("Phase 1")');
      
      // Check votes persisted
      const votesA = page.locator('[x-text="phase1?.votes?.companyA || 0"]');
      const votesB = page.locator('[x-text="phase1?.votes?.companyB || 0"]');
      
      await expect(votesA).toContainText('2');
      await expect(votesB).toContainText('1');
    });

    test('current pair position persists across page refresh', async ({ page }) => {
      const nextButton = page.locator('button:has-text("Next →")');
      const pairCounter = page.locator('[x-text="phase1?.pairCounter || \'1 / 5\'"]');
      
      // Navigate to next pair if possible
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await nextButton.click(); // Go to pair 3
        
        const pairPosition = await pairCounter.textContent();
        
        // Wait for auto-save
        await page.waitForTimeout(3000);
        
        // Refresh page
        await page.reload();
        await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
        await page.click('nav button:has-text("Phase 1")');
        
        // Check position persisted
        await expect(pairCounter).toContainText(pairPosition);
      }
    });
  });

  test.describe('Phase 1 Integration', () => {
    test('Phase 1 data updates session object', async ({ page }) => {
      const voteAButton = page.locator('button:has-text("+ Vote for A")');
      
      await voteAButton.click();
      await page.waitForTimeout(1000);
      
      // Check session data includes Phase 1 votes
      const sessionData = await page.evaluate(() => {
        const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
        return app.session.phase1;
      });
      
      expect(sessionData.votes?.companyA || 0).toBeGreaterThan(0);
    });

    test('auto-save triggers on vote changes', async ({ page }) => {
      const voteAButton = page.locator('button:has-text("+ Vote for A")');
      const saveStatus = page.locator('[x-text="saveStatus"]');
      
      // Check initial save status
      await expect(saveStatus).toContainText('saved');
      
      // Make a vote to trigger unsaved state
      await voteAButton.click();
      
      // Wait for auto-save cycle
      await page.waitForTimeout(6000);
      
      // Should be saved again
      await expect(saveStatus).toContainText('saved');
    });

    test('Phase 1 completion allows navigation to Phase 2', async ({ page }) => {
      // Complete some voting activity
      const voteAButton = page.locator('button:has-text("+ Vote for A")');
      await voteAButton.click();
      
      // Navigate through all pairs (simulate completion)
      const nextButton = page.locator('button:has-text("Next →")');
      while (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(200);
      }
      
      // Check Phase 2 becomes accessible
      const phase2Button = page.locator('nav button:has-text("Phase 2")');
      await expect(phase2Button).not.toHaveClass(/opacity-50/);
    });
  });

  test.describe('Strategic Level Distribution', () => {
    test('selectRandomPairs ensures level diversity with 5 pairs', async ({ page }) => {
      // Test the balanced selection algorithm
      const result = await page.evaluate(async () => {
        // Load strategic pairs data
        const response = await fetch('data/strategic-pairs.json');
        const data = await response.json();
        const strategicPairs = data.strategic_pairs || data;
        
        // Test multiple selections to verify level diversity
        const selections = [];
        for (let i = 0; i < 10; i++) {
          const selected = window.selectRandomPairs(strategicPairs, 5);
          const levels = selected.map(pair => pair.niveau || 1);
          const uniqueLevels = [...new Set(levels)];
          selections.push({
            totalPairs: selected.length,
            levels: levels,
            uniqueLevelCount: uniqueLevels.length,
            hasAllFourLevels: uniqueLevels.length === 4
          });
        }
        return selections;
      });
      
      // Verify all selections have 5 pairs
      result.forEach(selection => {
        expect(selection.totalPairs).toBe(5);
      });
      
      // Verify most selections have good level diversity (at least 3 different levels)
      const goodDiversity = result.filter(s => s.uniqueLevelCount >= 3).length;
      expect(goodDiversity).toBeGreaterThan(result.length * 0.7); // At least 70% should have 3+ levels
      
      // Verify some selections achieve perfect level distribution (all 4 levels)
      const perfectDistribution = result.filter(s => s.hasAllFourLevels).length;
      expect(perfectDistribution).toBeGreaterThan(0); // At least some should have all 4 levels
    });

    test('selectRandomPairs handles edge cases correctly', async ({ page }) => {
      const result = await page.evaluate(async () => {
        // Load strategic pairs data
        const response = await fetch('data/strategic-pairs.json');
        const data = await response.json();
        const strategicPairs = data.strategic_pairs || data;
        
        const tests = {};
        
        // Test with fewer than 4 pairs requested
        tests.smallSelection = window.selectRandomPairs(strategicPairs, 3);
        
        // Test with exact count equal to available pairs
        tests.exactCount = window.selectRandomPairs(strategicPairs.slice(0, 5), 5);
        
        // Test with more pairs requested than available
        tests.moreRequested = window.selectRandomPairs(strategicPairs.slice(0, 3), 5);
        
        // Test with empty array
        tests.emptyArray = window.selectRandomPairs([], 5);
        
        return tests;
      });
      
      // Small selection should work
      expect(result.smallSelection.length).toBe(3);
      
      // Exact count should return all pairs
      expect(result.exactCount.length).toBe(5);
      
      // More requested than available should return all available
      expect(result.moreRequested.length).toBe(3);
      
      // Empty array should return empty array
      expect(result.emptyArray.length).toBe(0);
    });

    test('strategic pairs have proper niveau categorization', async ({ page }) => {
      const result = await page.evaluate(async () => {
        // Load and validate strategic pairs data structure
        const response = await fetch('data/strategic-pairs.json');
        const data = await response.json();
        const strategicPairs = data.strategic_pairs || data;
        
        const analysis = {
          totalPairs: strategicPairs.length,
          pairsByLevel: { 1: 0, 2: 0, 3: 0, 4: 0 },
          pairsWithNiveau: 0,
          pairsWithDimensie: 0,
          samplePairs: []
        };
        
        strategicPairs.forEach(pair => {
          if (pair.niveau) {
            analysis.pairsWithNiveau++;
            analysis.pairsByLevel[pair.niveau]++;
          }
          if (pair.dimensie_nummer) {
            analysis.pairsWithDimensie++;
          }
          
          // Collect sample pairs from each level
          if (analysis.samplePairs.length < 8) {
            analysis.samplePairs.push({
              companies: `${pair.companyA} vs ${pair.companyB}`,
              niveau: pair.niveau,
              dimensie: pair.dimensie_nummer,
              contrast: pair.strategic_contrast
            });
          }
        });
        
        return analysis;
      });
      
      // Verify all pairs have niveau field
      expect(result.pairsWithNiveau).toBe(result.totalPairs);
      
      // Verify all pairs have dimensie_nummer field  
      expect(result.pairsWithDimensie).toBe(result.totalPairs);
      
      // Verify we have pairs at all 4 levels
      expect(result.pairsByLevel[1]).toBeGreaterThan(0);
      expect(result.pairsByLevel[2]).toBeGreaterThan(0);
      expect(result.pairsByLevel[3]).toBeGreaterThan(0);
      expect(result.pairsByLevel[4]).toBeGreaterThan(0);
      
      // Verify reasonable distribution (no level should be completely empty or dominate excessively)
      const maxLevel = Math.max(...Object.values(result.pairsByLevel));
      const minLevel = Math.min(...Object.values(result.pairsByLevel));
      expect(minLevel).toBeGreaterThan(0); // All levels should have at least one pair
      expect(maxLevel / minLevel).toBeLessThan(5); // Max should not be more than 5x min (allows for natural variation)
      
      console.log('Strategic pairs distribution:', result.pairsByLevel);
      console.log('Sample pairs:', result.samplePairs);
    });

    test('level-balanced selection integrates properly with game flow', async ({ page }) => {
      // Verify the selected pairs are properly integrated into the game
      const gameData = await page.evaluate(() => {
        // Access the game app data
        const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
        if (!app?.phase2?.selectedStrategicPairs) {
          return null;
        }
        
        const pairs = app.phase2.selectedStrategicPairs;
        const levels = pairs.map(pair => pair.niveau || 1);
        const uniqueLevels = [...new Set(levels)];
        
        return {
          selectedCount: pairs.length,
          levels: levels,
          uniqueLevels: uniqueLevels,
          hasLevelDiversity: uniqueLevels.length >= 3,
          sampleContrasts: pairs.slice(0, 3).map(p => p.strategic_contrast)
        };
      });
      
      // Verify game has selected pairs
      expect(gameData).not.toBeNull();
      expect(gameData.selectedCount).toBeGreaterThan(0);
      
      // Verify level diversity in actual game selection
      expect(gameData.hasLevelDiversity).toBe(true);
      
      // Verify strategic contrasts are present
      gameData.sampleContrasts.forEach(contrast => {
        expect(contrast).toBeTruthy();
        expect(typeof contrast).toBe('string');
      });
    });
  });

  test.describe('Responsive Design', () => {
    test('Phase 2 layout works on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check key elements are visible
      await expect(page.locator('[x-text="currentPair.companyA"]')).toBeVisible();
      await expect(page.locator('[x-text="currentPair.companyB"]')).toBeVisible();
      await expect(page.locator('button:has-text("Vote A")')).toBeVisible();
      await expect(page.locator('button:has-text("Vote B")')).toBeVisible();
    });

    test('timer controls stack properly on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      
      const timerControls = page.locator('.timer-controls');
      await expect(timerControls).toBeVisible();
      
      // Timer buttons should be accessible
      await expect(page.locator('button:has-text("Start Timer")')).toBeVisible();
      await expect(page.locator('button:has-text("Reset")')).toBeVisible();
    });
  });
});