import { test, expect } from '@playwright/test';

test.describe('Session Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and IndexedDB before each test
    await page.goto('/');
    
    // Clear all browser storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      return new Promise((resolve) => {
        if (window.indexedDB && window.indexedDB.deleteDatabase) {
          const req = window.indexedDB.deleteDatabase('analogy-game-facilitator');
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } else {
          resolve();
        }
      });
    });
    
    // Reload to ensure clean state
    await page.reload();
  });

  test('LocalForage initializes correctly', async ({ page }) => {
    // Wait for application to load
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Check that LocalForage is available
    const localForageAvailable = await page.evaluate(() => {
      return typeof window.localforage !== 'undefined';
    });
    
    expect(localForageAvailable).toBe(true);
    
    // Check LocalForage configuration
    const config = await page.evaluate(() => {
      return window.localforage.config();
    });
    
    expect(config.name).toBe('analogy-game-facilitator');
    expect(config.storeName).toBe('sessions');
  });

  test('new session is created with default values', async ({ page }) => {
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Check that session was created with default values
    const sessionData = await page.evaluate(() => {
      return window.Alpine.store || window.Alpine.$data;
    });
    
    // Session should have an ID and timestamps
    const hasSessionId = await page.evaluate(() => {
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      return app.session.id && app.session.id.startsWith('session_');
    });
    
    expect(hasSessionId).toBe(true);
    
    // Check default phase is 1
    const currentPhase = await page.evaluate(() => {
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      return app.currentPhase;
    });
    
    expect(currentPhase).toBe(1);
  });

  test('session data persists to LocalForage', async ({ page }) => {
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Modify session data
    await page.fill('input[x-model="session.teamName"]', 'Test Team');
    
    // Open settings modal and modify data
    await page.click('button:has-text("Settings")');
    await page.waitForSelector('[x-show="showSessionModal"]', { state: 'visible' });
    
    await page.fill('input[x-model="session.teamName"]', 'Test Team Updated');
    await page.fill('input[x-model="session.facilitator"]', 'Test Facilitator');
    
    // Save settings
    await page.click('button[type="submit"]:has-text("Save")');
    
    // Wait for save to complete
    await page.waitForTimeout(1000);
    
    // Check that data was saved to LocalForage
    const savedData = await page.evaluate(async () => {
      return await window.localforage.getItem('current-session');
    });
    
    expect(savedData.teamName).toBe('Test Team Updated');
    expect(savedData.facilitator).toBe('Test Facilitator');
  });

  test('session data loads correctly after page refresh', async ({ page }) => {
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Set some test data
    await page.click('button:has-text("Settings")');
    await page.waitForSelector('[x-show="showSessionModal"]', { state: 'visible' });
    
    await page.fill('input[x-model="session.teamName"]', 'Persistent Team');
    await page.fill('input[x-model="session.facilitator"]', 'Persistent Facilitator');
    
    await page.click('button[type="submit"]:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Navigate to Phase 2 to change current phase
    await page.click('nav button:has-text("Phase 2")');
    await page.waitForTimeout(500);
    
    // Add some pattern data
    const patternsTextarea = page.locator('textarea[x-model="phase2.patterns"]');
    await patternsTextarea.fill('test pattern 1, test pattern 2');
    
    // Wait for auto-save
    await page.waitForTimeout(2000);
    
    // Refresh the page
    await page.reload();
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Check that session data was restored
    await expect(page.locator('text=Persistent Team')).toBeVisible();
    
    // Check that we're still on Phase 2
    const phase2Button = page.locator('nav button:has-text("Phase 2")');
    await expect(phase2Button).toHaveClass(/bg-primary-600/);
    
    // Check that patterns data was restored
    const patternsValue = await page.locator('textarea[x-model="phase2.patterns"]').inputValue();
    expect(patternsValue).toBe('test pattern 1, test pattern 2');
  });

  test('Phase 1 voting data persists correctly', async ({ page }) => {
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Make sure we're on Phase 1
    await page.click('nav button:has-text("Phase 1")');
    
    // Add some votes
    await page.click('button:has-text("+"):near([x-text*="votesA"])');
    await page.click('button:has-text("+"):near([x-text*="votesA"])');
    await page.click('button:has-text("+"):near([x-text*="votesB"])');
    
    // Wait for auto-save
    await page.waitForTimeout(2000);
    
    // Refresh page
    await page.reload();
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Check that vote counts were restored
    const votesA = await page.locator('[x-text*="votesA"]:visible').first().textContent();
    const votesB = await page.locator('[x-text*="votesB"]:visible').first().textContent();
    
    expect(parseInt(votesA.match(/\d+/)?.[0] || '0')).toBeGreaterThan(0);
    expect(parseInt(votesB.match(/\d+/)?.[0] || '0')).toBeGreaterThan(0);
  });

  test('auto-save functionality works', async ({ page }) => {
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Check initial save status
    await expect(page.locator('[x-text="saveStatus"]')).toContainText('saved');
    
    // Make a change to trigger save status change
    await page.click('nav button:has-text("Phase 2")');
    
    // Fill in patterns to trigger unsaved state
    await page.fill('textarea[x-model="phase2.patterns"]', 'new pattern');
    
    // Wait for auto-save to trigger
    await page.waitForTimeout(6000); // Auto-save runs every 5 seconds
    
    // Check that save status is now saved
    await expect(page.locator('[x-text="saveStatus"]')).toContainText('saved');
  });

  test('session export includes all data', async ({ page }) => {
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Add test data across all phases
    
    // Phase 1: Add votes
    await page.click('button:has-text("+"):near([x-text*="votesA"])');
    
    // Phase 2: Add patterns and archetype
    await page.click('nav button:has-text("Phase 2")');
    await page.fill('textarea[x-model="phase2.patterns"]', 'innovation, disruption');
    await page.fill('textarea[x-model="phase2.archetype"]', 'Disruptive innovator archetype');
    
    // Phase 3: Add forerunner
    await page.click('nav button:has-text("Phase 3")');
    const forerunnerSelect = page.locator('select[x-model="phase3.forerunner"]');
    await forerunnerSelect.selectOption({ index: 1 }); // Select first available option
    
    // Phase 4: Add hypothesis
    await page.click('nav button:has-text("Phase 4")');
    await page.click('button:has-text("+ Add New Hypothesis")');
    
    // Wait for data to be saved
    await page.waitForTimeout(2000);
    
    // Test export functionality by checking data structure
    const exportData = await page.evaluate(async () => {
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      app.updateSessionFromPhaseData();
      return app.session;
    });
    
    // Verify all phase data is present
    expect(exportData.phase1).toBeDefined();
    expect(exportData.phase2).toBeDefined();
    expect(exportData.phase2.patterns).toBe('innovation, disruption');
    expect(exportData.phase2.archetype).toBe('Disruptive innovator archetype');
    expect(exportData.phase3).toBeDefined();
    expect(exportData.phase4).toBeDefined();
  });

  test('session recovery works after interruption', async ({ page }) => {
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Create session with data
    await page.click('button:has-text("Settings")');
    await page.waitForSelector('[x-show="showSessionModal"]', { state: 'visible' });
    
    await page.fill('input[x-model="session.teamName"]', 'Recovery Test Team');
    await page.click('button[type="submit"]:has-text("Save")');
    
    // Navigate away and back (simulating interruption)
    await page.goto('about:blank');
    await page.goto('/');
    
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Check that session was recovered
    await expect(page.locator('text=Recovery Test Team')).toBeVisible();
  });

  test('multiple sessions can be distinguished', async ({ page }) => {
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Get first session ID
    const sessionId1 = await page.evaluate(() => {
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      return app.session.id;
    });
    
    // Clear storage and reload to create new session
    await page.evaluate(() => {
      localStorage.clear();
      return new Promise((resolve) => {
        const req = window.indexedDB.deleteDatabase('analogy-game-facilitator');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    });
    
    await page.reload();
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Get second session ID
    const sessionId2 = await page.evaluate(() => {
      const app = document.querySelector('[x-data="gameApp"]')._x_dataStack[0];
      return app.session.id;
    });
    
    // Session IDs should be different
    expect(sessionId1).not.toBe(sessionId2);
    
    // Both should be valid session ID format
    expect(sessionId1).toMatch(/^session_\d+_[a-z0-9]+$/);
    expect(sessionId2).toMatch(/^session_\d+_[a-z0-9]+$/);
  });

  test('error handling for storage failures', async ({ page }) => {
    await page.waitForSelector('[x-show="!loading"]', { state: 'visible' });
    
    // Mock localStorage failure
    await page.evaluate(() => {
      // Override localforage to throw error
      const originalSetItem = window.localforage.setItem;
      window.localforage.setItem = () => Promise.reject(new Error('Storage quota exceeded'));
    });
    
    // Try to save data - should handle gracefully
    await page.click('button:has-text("Settings")');
    await page.waitForSelector('[x-show="showSessionModal"]', { state: 'visible' });
    
    await page.fill('input[x-model="session.teamName"]', 'Error Test');
    await page.click('button[type="submit"]:has-text("Save")');
    
    // Wait a moment for save attempt
    await page.waitForTimeout(2000);
    
    // App should still be functional despite save error
    await expect(page.locator('h1')).toContainText('Analogy Game Facilitator');
    
    // Save status should indicate error
    await expect(page.locator('[x-text="saveStatus"]')).toContainText('error');
  });
});